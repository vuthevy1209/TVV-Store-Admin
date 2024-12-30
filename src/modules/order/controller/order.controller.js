const orderService = require('../service/order.service');

class OrderController {

    // [GET] /orders
    async index(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 3;
            const { orders, totalPages, currentPage } = await orderService.findAll(page, limit);
            console.log('Orders fetched successfully');

            // Check if the request is an AJAX request (JSON response)
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return res.json({ orders,totalPages, currentPage });
            }

            const orderStatusList = orderService.getOrderStatusList();

            // Render the Handlebars template for SSR
            return res.render('page/order/OrderList', { 
                orders, 
                orderStatusList,
                pagination: {
                    currentPage,
                    totalPages,
                    hasPrev: currentPage > 1,
                    hasNext: currentPage < totalPages,
                    prevPage: currentPage - 1,
                    nextPage: currentPage + 1,
                    pages: Array.from({ length: totalPages }, (_, i) => ({
                        number: i + 1,
                        active: i + 1 === currentPage
                    }))
                }
            });

        } catch (err) {
            console.log(err);
            return res.status(500).json({ message: err.message });
        }
    }
}

module.exports = new OrderController();