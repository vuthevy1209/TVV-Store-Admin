const productService = require('../service/product.service');
const brandService = require('../service/brand.service');
const categoryService = require('../service/category.service');

class ProductController{
    // [GET] /products
    async index(req, res, next) {
        const {category_id, brand_id, price_min, price_max, sort_by_creation, sort_by_price, name, business_status, page, limit} = req.query;
        try {
            const searchParams = {category_id, brand_id, price_min, price_max, sort_by_creation, sort_by_price, name, business_status};
            const { productList, pagination } = await productService.findProductsWithPaginationAndCriteria(page, limit, searchParams);

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
            const product = req.body;
            const id  = product.id;

            const formattedProduct = {
                name: product.name,
                desc: product.desc || null,
                price: parseFloat(product.price),
                inventory_quantity: parseInt(product.inventory_quantity, 10),
                discount: product.discount ? parseFloat(product.discount) : null,
                category_id: parseInt(product.category_id, 10),
                brand_id: parseInt(product.brand_id, 10),
                image_urls: product.image_urls || [],
                business_status: product.business_status
            };


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

    // [PATCH] /products/:id/unlock
    async unlock(req, res, next) {
        try {
            const { id } = req.params;
            await productService.unlock(id);
            res.json({ message: 'Product unlocked successfully' });
        } catch (error) {
            console.error('Error unlocking product:', error);
            next(error);
        }
    }
}

module.exports = new ProductController();