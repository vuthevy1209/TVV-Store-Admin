const { sequelize } = require('../../../config/database');
const { Op } = require('sequelize');

const Order = require('../model/order');
const OrderItems = require('../model/orderItems');

const Customer = require('../../customer/model/customer');
const customerServices = require('../../customer/service/customer.service');
const paymentService = require('../../payment/service/payment.service');


const { default: Decimal } = require('decimal.js');

const PaymentTypeEnum = require('../../payment/enum/payment.enum');
const { OrderStatusEnum } = require('../enum/order.enum');

const userServices = require('../../user/service/user.service');
const User = require('../../user/model/user');


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

    async findOrdersWithPaginationAndCriteria(page=1, limit=5, searchParams) {
        page = parseInt(page); // because req.query.page is always a string --> number === page is always false
        limit = parseInt(limit);
        const offset = (page - 1) * limit;
        const where = {};

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

        const order =[ ['created_at', 'DESC']];
        if(searchParams.sort){
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
                pages: Array.from({length: totalPages}, (v,k) => k+1).map(number => ({
                    number,
                    active: number === page
                }))
            }
        
        }
    }

    // async fetchOrderById(orderId) {
    //     // Fetch the complete order information with associations
    //     const completeOrder = await Order.findOne({
    //         where: { id: orderId },
    //         include: [
    //             {
    //                 model: Customer,
    //                 as: 'customer'
    //             }
    //         ]
    //     });

    //     if(!completeOrder) {
    //         throw new Error('Order not found');
    //     }

    //     // Fetch the order items
    //     const orderItems = await OrderItem.findAll({
    //         where: { order_id: orderId },
    //         include: [
    //             {
    //                 model: Product,
    //                 as: 'product'
    //             }
    //         ]
    //     });

    //     // Convert order items to plain objects
    //     completeOrder.dataValues.orderItems = orderItems.map(item => item.get({ plain: true }));
    //     const paymentDetails = await paymentService.getPaymentDetailsByOrderId(orderId);
    //     completeOrder.dataValues.paymentDetails = paymentDetails ? paymentDetails.get({ plain: true }) : null;

    //     return completeOrder.get({ plain: true });
    // }

}

module.exports = new OrderService();