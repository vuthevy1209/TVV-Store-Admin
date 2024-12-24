const siteRouter = require('../modules/site/route/site.route');
const productRouter = require('../modules/product/route/product.route');

function route(app) {
    app.use('/', siteRouter);
    app.use('/products', productRouter);
}

module.exports = route;