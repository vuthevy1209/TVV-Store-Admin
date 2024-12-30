const { sequelize } = require('../../../config/database');

const Order = require('../model/order');
const OrderItems = require('../model/orderItems');

const Customer = require('../../customer/model/customer');
const customerServices = require('../../customer/service/customer.service');
const paymentService = require('../../payment/service/payment.service');


const { default: Decimal } = require('decimal.js');

const PaymentTypeEnum = require('../../payment/enum/payment.enum');
const { OrderStatusEnum } = require('../enum/order.enum');

const userServices = require('../../user/service/user.service');


const moment = require('moment');

class OrderService {

    async findAll(page=1, limit=10) {
        const offset = (page - 1) * limit;
        const { rows: orders, count }  = await Order.findAndCountAll({
            offset,
            limit,
            order: [['created_at', 'DESC']],
            include: [
                {
                    model: Customer,
                    as: 'customer'
                }
            ]
        });

        await Promise.all(orders.map(async (order) => {
            const user = await userServices.findById(order.customer.user_id);
            const paymentDetails = await paymentService.getPaymentDetailsByOrderId(order.id);
            order.dataValues.paymentDetails = paymentDetails ? paymentDetails.get({ plain: true }) : null;
            order.dataValues.customer.dataValues.username = user.username;
        }));

        return {
            orders: orders.map(order => function() {
                const plainOrder = order.get({ plain: true });
                plainOrder.statusName = OrderStatusEnum.properties[order.status].name;
                plainOrder.created_at = moment(order.created_at).format('MMMM Do YYYY, h:mm:ss a');
                return plainOrder;
            }()),
            totalPages: Math.ceil(count / limit),
            currentPage: page
        };
    }

    async getOrderStatusList() {
        return OrderStatusEnum.properties;
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