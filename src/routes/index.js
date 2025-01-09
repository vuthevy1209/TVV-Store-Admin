const connectEnsureLogin = require('connect-ensure-login');


const uploadImageRouter = require('./uploadImage.route');

const siteRouter = require('../modules/site/route/site.route');
const productRouter = require('../modules/product/route/product.route');
const categoryRouter = require('../modules/product/route/category.route');
const brandRouter = require('../modules/product/route/brand.route');
const orderRouter = require('../modules/order/route/order.route');
const customerRouter = require('../modules/customer/route/customer.route');
const authRouter = require('../modules/auth/route/auth.route');
const userRouter = require('../modules/user/route/user.routes');

function route(app) {
    app.use('/auth', authRouter);
    app.use('/', connectEnsureLogin.ensureLoggedIn({ setReturnTo: true, redirectTo: '/auth/login' }),  siteRouter);
    app.use('/products', connectEnsureLogin.ensureLoggedIn({ setReturnTo: true, redirectTo: '/auth/login' }), productRouter);
    app.use('/categories', connectEnsureLogin.ensureLoggedIn({ setReturnTo: true, redirectTo: '/auth/login' }), categoryRouter);
    app.use('/brands',connectEnsureLogin.ensureLoggedIn({ setReturnTo: true, redirectTo: '/auth/login' }), brandRouter);
    app.use('/orders', connectEnsureLogin.ensureLoggedIn({ setReturnTo: true, redirectTo: '/auth/login' }), orderRouter);
    app.use('/customers', connectEnsureLogin.ensureLoggedIn({ setReturnTo: true, redirectTo: '/auth/login' }), customerRouter);
    app.use('/cloudinary', connectEnsureLogin.ensureLoggedIn({ setReturnTo: true, redirectTo: '/auth/login' }), uploadImageRouter);
    app.use('/user', userRouter);
}

module.exports = route;