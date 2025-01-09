const uploadImageRouter = require('./uploadImage.route');

const siteRouter = require('../modules/site/route/site.route');
const productRouter = require('../modules/product/route/product.route');
const categoryRouter = require('../modules/product/route/category.route');
const brandRouter = require('../modules/product/route/brand.route');
const orderRouter = require('../modules/order/route/order.route');
const customerRouter = require('../modules/customer/route/customer.route');

function route(app) {
    app.use('/', siteRouter);
    app.use('/products', productRouter);
    app.use('/categories', categoryRouter);
    app.use('/brands', brandRouter);
    app.use('/orders', orderRouter);
    app.use('/customers', customerRouter);
    app.use('/cloudinary', uploadImageRouter);
}

module.exports = route;