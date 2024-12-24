class OrderController {
    index(req, res) {
        res.render('page/order/OrderList');
    }
}

module.exports = new OrderController();