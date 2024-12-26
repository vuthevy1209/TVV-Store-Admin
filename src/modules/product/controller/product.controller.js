const productService = require('../service/product.service');
const brandService = require('../service/brand.service');
const categoryService = require('../service/category.service');

class ProductController{
    // [GET] /products
    async index(req, res, next) {
        try {
            let {page = 1, limit = 3 } = req.query;
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
}

module.exports = new ProductController();