const orderService = require('../service/order.service');

class OrderController {

    // [GET] /orders
    async index(req, res) {
        const { orderStatus, customerName, startDate, endDate, orderId,sort, page, limit } = req.query;
        const searchParams = { orderStatus, customerName, startDate, endDate, orderId,sort };
        try {
            const { orders, pagination } = await orderService.findOrdersWithPaginationAndCriteria(page, limit, searchParams);
            console.log('Orders fetched successfully');

            // Check if the request is an AJAX request (JSON response)
            if (req.headers.accept === 'application/json') {
                return res.json({ orders, pagination });
            }

            const orderStatusList = await orderService.getOrderStatusList();

            return res.render('page/order/OrderList', { orders, pagination, orderStatusList });

        } catch (err) {
            console.log(err);
            res.redirect('/page/error/error');
        }
    }

    // [GET] /orders/:id
    async show(req, res) {
        const { id } = req.params;
        try {
            const order = await orderService.fetchOrderById(id);
            const orderStatusList = await orderService.getSupportedUpdateStatus(order.status);
            console.log("Order", order);


            return res.render('page/order/OrderDetail', { order, orderStatusList });
        } catch (err) {
            console.log(err);
            res.redirect('/page/error/error');
        }
    }

    // [PATCH] /orders/update-status/:id
    async updateStatus(req, res) {
        const { id } = req.params;
        const { orderStatus } = req.body;
        try {
            const {resultStatus, newSupportStatus} = await orderService.updateOrderStatus(id, orderStatus);
            console.log('Order status updated successfully');
            return res.json({ message: 'Order status updated successfully', resultStatus, newSupportStatus});
        } catch (err) {
            console.log(err);
            res.status(400).json({ message: err.message });
        }
    }

    // [DELETE] /orders/:id
    async delete(req, res) {
        const { id } = req.params;
        try {
            await orderService.deleteOrderById(id);
            console.log('Order deleted successfully');
            return res.json({ message: 'Order deleted successfully' });
        } catch (err) {
            console.log(err);
            res.status(400).json({ message: err.message });
        }
    }
}

module.exports = new OrderController();