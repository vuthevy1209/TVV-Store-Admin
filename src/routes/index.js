const siteRouter = require('../modules/site/route/site.route');
const productRouter = require('../modules/product/route/product.route');
const orderRouter = require('../modules/order/route/order.route');
const customerRouter = require('../modules/customer/route/customer.route');

function route(app) {
    app.use('/', siteRouter);
    app.use('/products', productRouter);
    app.use('/orders', orderRouter);
    app.use('/customers', customerRouter);
}

module.exports = route;