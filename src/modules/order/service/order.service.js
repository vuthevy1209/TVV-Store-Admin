const { sequelize } = require('../../../config/database');
const { Op, or } = require('sequelize');

const Order = require('../model/order');
const OrderItems = require('../model/orderItems');
const Product = require('../../product/models/product');

const Customer = require('../../customer/model/customer');
const customerServices = require('../../customer/service/customer.service');
const paymentService = require('../../payment/service/payment.service');


const DecimalUtil = require('../../../utils/decimal.utils');

const PaymentTypeEnum = require('../../payment/enum/payment.enum');
const { OrderStatusEnum } = require('../enum/order.enum');

const userServices = require('../../user/service/user.service');
const User = require('../../user/model/user');

const shippingService = require('../../shipping/service/shipping.service');

const productService = require('../../product/service/product.service');


const moment = require('moment');

class OrderService {

    async getOrderStatusList() {
        let orderStatusList = [];
        for (const orderStatus in OrderStatusEnum) {
            if (OrderStatusEnum.hasOwnProperty(orderStatus)) {
                orderStatusList.push(OrderStatusEnum[orderStatus]);
            }
        } return orderStatusList;
    }

    async findOrdersWithPaginationAndCriteria(page = 1, limit = 5, searchParams) {
        page = parseInt(page); // because req.query.page is always a string --> number === page is always false
        limit = parseInt(limit);
        const offset = (page - 1) * limit;
        const where = {};

        where.is_deleted = false;

        if (searchParams.orderStatus) {
            where.status = searchParams.orderStatus;
        }

        if (searchParams.customerName) {
            where['$customer.user.username$'] = { [Op.like]: `%${searchParams.customerName}%` };
        }

        where.created_at = {};
        if (searchParams.startDate) {
            where.created_at[Op.gte] = searchParams.startDate;
        }

        if (searchParams.endDate) {
            where.created_at[Op.lte] = searchParams.endDate;
        }


        if (searchParams.orderId) {
            where.id = searchParams.orderId;
        }

        const order = [['created_at', 'DESC']];
        if (searchParams.sort) {
            order[0][1] = searchParams.sort;
        }


        const { rows: orders, count: totalOrders } = await Order.findAndCountAll({
            where,
            offset,
            limit,
            order: order,
            include: [
                {
                    model: Customer,
                    as: 'customer',
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['username'], // Fetch only the required attributes
                        }
                    ]
                }
            ]
        });

        await Promise.all(orders.map(async (order) => {
            const user = await userServices.findById(order.customer.user_id);
            const paymentDetails = await paymentService.getPaymentDetailsByOrderId(order.id);
            order.dataValues.paymentDetails = paymentDetails ? paymentDetails.get({ plain: true }) : null;
            order.dataValues.customer.dataValues.username = user.username;

        }));


        const totalPages = Math.ceil(totalOrders / limit);
        return {
            orders: orders.map(order => {
                const plainOrder = order.get({ plain: true });
                plainOrder.created_at = moment(plainOrder.created_at).format('YYYY-MM-DD HH:mm:ss');
                plainOrder.statusName = OrderStatusEnum.properties[plainOrder.status].name;
                return plainOrder;
            }),
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                pages: Array.from({ length: totalPages }, (v, k) => k + 1).map(number => ({
                    number,
                    active: number === page
                }))
            }

        }
    }

    async fetchOrderById(orderId) {
        // Fetch the complete order information with associations
        const completeOrder = await Order.findOne({
            where: { 
                id: orderId,
                is_deleted: false
            },
            include: [
                {
                    model: Customer,
                    as: 'customer',
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['username', 'email'], // Fetch additional attributes
                        }
                    ]
                }
            ]
        });

        if (!completeOrder) {
            throw new Error('Order not found');
        }

        // Fetch the order items
        const orderItems = await OrderItems.findAll({
            where: { order_id: orderId },
            include: [
                {
                    model: Product,
                    as: 'product',
                    attributes: ['name', 'image_urls'], // Fetch only the required attributes
                }
            ]
        });

        // Convert order items to plain objects
        completeOrder.dataValues.orderItems = orderItems.map(item => {
            const plainItem = item.get({ plain: true });
            plainItem.subtotal = DecimalUtil.multiply(plainItem.product_price, plainItem.quantity);
            return plainItem;
        });

        const paymentDetails = await paymentService.getPaymentDetailsByOrderId(orderId);
        const shippingDetails = await shippingService.getShippingDetailsByOrderId(orderId);
        completeOrder.dataValues.paymentDetails = paymentDetails ? paymentDetails.get({ plain: true }) : null;
        completeOrder.dataValues.shippingDetails = shippingDetails ? shippingDetails.get({ plain: true }) : null;
        if (shippingDetails) {
            completeOrder.dataValues.shippingDetails.fullAddress = `${shippingDetails.address}, ${shippingDetails.district}, ${shippingDetails.province}`;
        }
        else {
            completeOrder.dataValues.shippingDetails = 'Unknow';
        }
        completeOrder.dataValues.statusName = OrderStatusEnum.properties[completeOrder.status].name;
        completeOrder.dataValues.created_at = moment(completeOrder.created_at).format('YYYY-MM-DD HH:mm:ss');
        return completeOrder.get({ plain: true });
    }

    // pending --> confirm
    // confirm --> paid
    // confirm, paid --> complete
    // pending, confirm, paid --> cancel

    // to be simple --> confirm / paid --> complete / cancel
    async updateOrderStatus(orderId, orderStatus) {
        const order = await Order.findByPk(orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        orderStatus = parseInt(orderStatus);
        const oldStatus = order.status;
        if(oldStatus === orderStatus){
            throw new Error('Order status is the same');
        }
        return sequelize.transaction(async (transaction) => {

            order.status = orderStatus;
            await order.save({ transaction });

            let paymentStatus = null;

            // 1: update to complete
            if (orderStatus === OrderStatusEnum.COMPLETED.value) {
                paymentStatus = await paymentService.updatePaymentStatus(orderId, orderStatus, { transaction });
            }
            // 2: update to cancel
            else if (orderStatus === OrderStatusEnum.CANCELLED.value) { // both COD and online payment need to update status to cancel
                paymentStatus = await paymentService.updatePaymentStatus(orderId, orderStatus, { transaction });
                
                // return quantity to inventory
                const orderItems = await OrderItems.findAll({
                    where: { order_id: orderId }
                });
                await Promise.all(orderItems.map(async (orderItem) => {
                    await productService.updateProductInventory(orderItem.product_id, -orderItem.quantity, { transaction });
                }));
            }
            else {
                throw new Error('Unsupported order status');
            }

            const resultStatus = {
                orderStatus: OrderStatusEnum.properties[order.status].name,
                paymentStatus: paymentStatus
            }

            const newSupportStatus = await this.getSupportedUpdateStatus(order.status);

            console.log(`Order ${orderId} status updated to ${OrderStatusEnum.properties[order.status].name}`);
            return {resultStatus, newSupportStatus};
        });
    }

    async getSupportedUpdateStatus(orderStatus) {
        let orderStatusList = [];
        for (const status in OrderStatusEnum) {
            if (OrderStatusEnum.hasOwnProperty(status)) {
                if(OrderStatusEnum[status].value <= orderStatus){
                    continue;
                }
                if(OrderStatusEnum[status].value === OrderStatusEnum.CANCELLED.value || OrderStatusEnum[status].value === OrderStatusEnum.COMPLETED.value){
                    orderStatusList.push(OrderStatusEnum[status]);
                }
            }
        }
        return orderStatusList;
    }

    async deleteOrderById(orderId) {
        return sequelize.transaction(async (transaction) => {
            await Order.update({ is_deleted: true }, {
                where: { id: orderId },
                transaction
            });
        });
    }

}

module.exports = new OrderService();