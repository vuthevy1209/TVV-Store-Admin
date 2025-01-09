const productService = require('../service/product.service');
const brandService = require('../service/brand.service');
const categoryService = require('../service/category.service');

class ProductController{
    // [GET] /products
    async index(req, res, next) {
        try {
            let {page = 1, limit = 10 } = req.query;
            if (typeof page !== 'number' || typeof limit !== 'number') {
                page = parseInt(page);
                limit = parseInt(limit);
            }

            const { productList, pagination } = await productService.getProductsWithPagination({ page, limit });

            console.log('pagination:', pagination);

            // fetch by AJAX
            if (req.headers.accept.includes('application/json')) {
                return res.json({ productList, pagination });
            }

            const brandList = await brandService.getAll();
            const categoryList = await categoryService.getAll();

            res.render('page/product/ProductList', { productList, brandList, categoryList, pagination});

        } catch (error) {
            console.error('Error searching products:', error);
            next(error);
        }
    }

    // [GET] /products/create
    async create(req, res) {
        const brandList = await brandService.getAll();
        const categoryList = await categoryService.getAll();
        res.render('page/product/AddProduct', { brandList, categoryList });
    }

    // [POST] /products/store
    async store(req, res, next) {
        try {
            console.log('req.body:', req.body);
            const product = req.body;

            const formattedProduct = {
                name: product.name,
                desc: product.desc || null,
                price: parseFloat(product.price),
                inventory_quantity: parseInt(product.inventory_quantity, 10),
                discount: product.discount ? parseFloat(product.discount) : null,
                category_id: parseInt(product.category_id, 10),
                brand_id: parseInt(product.brand_id, 10),
                image_urls: product.image_urls || []
            };

            const response = await productService.create(formattedProduct);
            res.json({ message: 'Product created successfully', product: response });
        } catch (error) {
            console.error('Error creating product:', error);
            next(error);
        }
    }

    // [GET] /products/edit
    async edit(req, res, next) {

        const { id } = req.params;
        const product = await productService.findById(id);
        const brandList = await brandService.getAll();
        const categoryList = await categoryService.getAll();

        res.render('page/product/UpdateProduct', { product, brandList, categoryList });
    }

    // [PUT] /products/update
    async update(req, res, next) {
        try {
            const product = req.body.product;
            const id  = product.id;

            const formattedProduct = {
                name: product.name,
                desc: product.desc || null,
                price: parseFloat(product.price),
                inventory_quantity: parseInt(product.inventory_quantity, 10),
                discount: product.discount ? parseFloat(product.discount) : null,
                category_id: parseInt(product.category_id, 10),
                brand_id: parseInt(product.brand_id, 10),
                image_urls: product.image_urls || []
            };

            console.log('formattedProduct:', formattedProduct);

            await productService.update(id, formattedProduct);

            res.json({ message: 'Product updated successfully', product: { id, ...formattedProduct } });
        } catch (error) {
            console.error('Error updating product:', error);
            next(error);
        }
    }


    // [DELETE] /products/:id
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            await productService.delete(id);
            res.json({ message: 'Product deleted successfully' });
        } catch (error) {
            console.error('Error deleting product:', error);
            next(error);
        }
    }
}

module.exports = new ProductController();