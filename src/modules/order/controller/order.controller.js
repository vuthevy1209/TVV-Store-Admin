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

            return res.render('page/order/OrderList', { orders, pagination, orderStatusList, ...searchParams });

        } catch (err) {
            console.log(err);
            res.redirect('/page/error/error');
        }
    }
}

module.exports = new OrderController();