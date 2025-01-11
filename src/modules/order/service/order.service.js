const { sequelize } = require('../../../config/database');
const { Op } = require('sequelize');

const Order = require('../model/order');
const OrderItems = require('../model/orderItems');
const Product = require('../../product/models/product');
const Customer = require('../../customer/model/customer');
const userServices = require('../../user/service/user.service');
const paymentService = require('../../payment/service/payment.service');
const shippingService = require('../../shipping/service/shipping.service');
const productService = require('../../product/service/product.service');
const PaymentDetails = require('../../payment/model/paymentDetails');
const moment = require('moment');
const DecimalUtil = require('../../../utils/decimal.utils');
const { OrderStatusEnum } = require('../enum/order.enum');
const PaymentTypeEnum = require('../../payment/enum/payment.enum');
const User = require('../../user/model/user');

class OrderService {

    async getOrderStatusList() {
        return Object.values(OrderStatusEnum);
    }

    async findOrdersWithPaginationAndCriteria(page = 1, limit = 5, searchParams) {
        page = parseInt(page);
        limit = parseInt(limit);
        const offset = (page - 1) * limit;
        const where = { is_deleted: false };

        if (searchParams.orderStatus) where.status = searchParams.orderStatus;
        if (searchParams.customerName) where['$customer.user.username$'] = { [Op.like]: `%${searchParams.customerName}%` };
        if (searchParams.startDate) where.created_at = { [Op.gte]: searchParams.startDate };
        if (searchParams.endDate) where.created_at = { ...where.created_at, [Op.lte]: searchParams.endDate };
        if (searchParams.orderId) where.id = searchParams.orderId;

        const order = [['created_at', 'DESC']];
        if (searchParams.sort) order[0][1] = searchParams.sort;

        const { rows: orders, count: totalOrders } = await Order.findAndCountAll({
            where,
            offset,
            limit,
            order,
            include: [
                {
                    model: Customer,
                    as: 'customer',
                    include: [{ model: User, as: 'user', attributes: ['username'] }]
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
                totalPages,
                pages: Array.from({ length: totalPages }, (v, k) => k + 1).map(number => ({
                    number,
                    active: number === page
                }))
            }
        }
    }

    async fetchOrderById(orderId) {
        const completeOrder = await Order.findOne({
            where: { id: orderId, is_deleted: false },
            include: [
                {
                    model: Customer,
                    as: 'customer',
                    include: [{ model: User, as: 'user', attributes: ['username', 'email'] }]
                }
            ]
        });

        if (!completeOrder) throw new Error('Order not found');

        const orderItems = await OrderItems.findAll({
            where: { order_id: orderId },
            include: [{ model: Product, as: 'product', attributes: ['name', 'image_urls'] }]
        });

        completeOrder.dataValues.orderItems = orderItems.map(item => {
            const plainItem = item.get({ plain: true });
            plainItem.subtotal = DecimalUtil.multiply(plainItem.product_price, plainItem.quantity);
            return plainItem;
        });

        const paymentDetails = await paymentService.getPaymentDetailsByOrderId(orderId);
        const shippingDetails = await shippingService.getShippingDetailsByOrderId(orderId);
        completeOrder.dataValues.paymentDetails = paymentDetails ? paymentDetails.get({ plain: true }) : null;
        completeOrder.dataValues.shippingDetails = shippingDetails ? shippingDetails.get({ plain: true }) : 'Unknow';
        if (shippingDetails) {
            completeOrder.dataValues.shippingDetails.fullAddress = `${shippingDetails.address}, ${shippingDetails.district}, ${shippingDetails.province}`;
        }

        completeOrder.dataValues.statusName = OrderStatusEnum.properties[completeOrder.status].name;
        completeOrder.dataValues.created_at = moment(completeOrder.created_at).format('YYYY-MM-DD HH:mm:ss');
        return completeOrder.get({ plain: true });
    }

    async updateOrderStatus(orderId, orderStatus) {
        const order = await Order.findByPk(orderId);
        if (!order) throw new Error('Order not found');

        orderStatus = parseInt(orderStatus);
        const oldStatus = order.status;
        if (oldStatus === orderStatus) throw new Error('Order status is the same');

        return sequelize.transaction(async (transaction) => {
            order.status = orderStatus;
            await order.save({ transaction });

            let paymentStatus = null;

            if (orderStatus === OrderStatusEnum.COMPLETED.value) {
                paymentStatus = await paymentService.updatePaymentStatus(orderId, orderStatus, { transaction });
            } else if (orderStatus === OrderStatusEnum.CANCELLED.value) {
                paymentStatus = await paymentService.updatePaymentStatus(orderId, orderStatus, { transaction });

                const orderItems = await OrderItems.findAll({ where: { order_id: orderId } });
                await Promise.all(orderItems.map(async (orderItem) => {
                    await productService.updateProductInventory(orderItem.product_id, -orderItem.quantity, { transaction });
                }));
            } else {
                throw new Error('Unsupported order status');
            }

            const resultStatus = {
                orderStatus: OrderStatusEnum.properties[order.status].name,
                paymentStatus
            };

            const newSupportStatus = await this.getSupportedUpdateStatus(order.status);

            console.log(`Order ${orderId} status updated to ${OrderStatusEnum.properties[order.status].name}`);
            return { resultStatus, newSupportStatus };
        });
    }

    async getSupportedUpdateStatus(orderStatus) {
        return Object.values(OrderStatusEnum).filter(status => status.value > orderStatus);
    }

    async deleteOrderById(orderId) {
        return sequelize.transaction(async (transaction) => {
            await Order.update({ is_deleted: true }, { where: { id: orderId }, transaction });
        });
    }

    async getTotalOrder() {
        const result = await Order.findAll({
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('id')), 'totalOrder'],
                [sequelize.fn('SUM', sequelize.col('subtotal')), 'totalRevenue']
            ],
            where: [                
                { [Op.or]: [{ status: OrderStatusEnum.PAID.value }, { status: OrderStatusEnum.COMPLETED.value }] },
                { is_deleted: false }
            ],
        });
    
        // Use `.get()` to extract the plain data
        const data = result[0]?.get({ plain: true }) || { totalOrder: 0, totalRevenue: 0 };
        
        return {
            totalOrder: data.totalOrder,
            totalRevenue: data.totalRevenue
        };
    }
    

    async buildQuery(today, period, groupUnit) {
        const startOfPeriod = moment(today).startOf(period).toDate();
        const endOfPeriod = moment(today).endOf(period).toDate();
        const where = {
            created_at: { [Op.gte]: startOfPeriod, [Op.lte]: endOfPeriod },
            [Op.or]: [{ status: OrderStatusEnum.PAID.value }, { status: OrderStatusEnum.COMPLETED.value }],
            is_deleted: false,
        };
        const groupBy = [sequelize.literal(`EXTRACT(${groupUnit} FROM "order"."created_at")`)];
        return { where, groupBy };
    }
    
    async getRevenueByDay(today) {
        const { where, groupBy } = await this.buildQuery(today, 'day', 'day');
        const { revenueData: rawRevenueData, paymentData } = await this.getRevenueChartData(where, groupBy);
    
        const revenueData = [rawRevenueData[moment(today).date()] || 0];
        const revenueLabels = ['Today'];
    
        return { revenueData, revenueLabels, paymentData };
    }
    
    async getRevenueByWeek(today) {
        const { where, groupBy } = await this.buildQuery(today, 'week', 'day');
        const { revenueData: rawRevenueData, paymentData } = await this.getRevenueChartData(where, groupBy);
    
        const startOfWeek = moment(today).startOf('week');
        const revenueLabels = Array.from({ length: 7 }, (_, i) => startOfWeek.clone().add(i, 'days').format('dddd'));
        const revenueData = revenueLabels.map((_, i) => rawRevenueData[startOfWeek.clone().add(i, 'days').date()] || 0);
    
        return { revenueData, revenueLabels, paymentData };
    }
    
    async getRevenueByMonth(today) {
        const { where, groupBy } = await this.buildQuery(today, 'month', 'day');
        const { revenueData: rawRevenueData, paymentData } = await this.getRevenueChartData(where, groupBy);
    
        const daysInMonth = moment(today).daysInMonth();
        const revenueLabels = Array.from({ length: daysInMonth }, (_, i) => i + 1);
        const revenueData = revenueLabels.map(day => rawRevenueData[day] || 0);
    
        return { revenueData, revenueLabels, paymentData };
    }
    
    async getRevenueByYear(today) {
        const { where, groupBy } = await this.buildQuery(today, 'year', 'month');
        const { revenueData: rawRevenueData, paymentData } = await this.getRevenueChartData(where, groupBy);
    
        const revenueLabels = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const revenueData = revenueLabels.map((_, i) => rawRevenueData[i + 1] || 0);
    
        return { revenueData, revenueLabels, paymentData };
    }
    
    async getRevenueChartData(where, groupBy) {
        const result = await PaymentDetails.findAll({
            attributes: [
                [...groupBy, 'label'],
                [sequelize.fn('SUM', sequelize.col('subtotal')), 'revenueData'],
                [sequelize.literal(`SUM(CASE WHEN payment_type_id = ${PaymentTypeEnum.VNPAY} THEN subtotal ELSE 0 END)`), 'vnPayData'],
                [sequelize.literal(`SUM(CASE WHEN payment_type_id = ${PaymentTypeEnum.CASH} THEN subtotal ELSE 0 END)`), 'cashData']
            ],
            include: [{ model: Order, as: 'order', where, attributes: [] }],
            group: groupBy,
            order: groupBy,
        });
    
        let vnPayData = 0;
        let cashData = 0;
        let revenueData = {};
    
        result.forEach(item => {
            const label = item.get('label');
            revenueData[label] = item.get('revenueData') || 0;
            vnPayData = DecimalUtil.add(vnPayData, item.get('vnPayData') || 0);
            cashData = DecimalUtil.add(cashData, item.get('cashData') || 0);
        });
    
        return { revenueData, paymentData: [vnPayData, cashData] };
    }
    
    
}

module.exports = new OrderService();
