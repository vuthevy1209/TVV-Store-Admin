class CustomerController {
    index(req, res) {
        res.render('page/customer/CustomerList');
    }
}

module.exports = new CustomerController();