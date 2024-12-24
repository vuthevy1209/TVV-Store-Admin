import {productRouter} from './product.route.js';

function route(app) {
    app.use('/products', productRouter);
}