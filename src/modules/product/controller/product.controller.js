const productService = require('../service/product.service');
const brandService = require('../service/brand.service');
const categoryService = require('../service/category.service');

class ProductController{
    // [GET] /products
    async index(req, res, next) {
        try {
            const {page = 1, limit = 10 } = req.query;
            const { productList, pagination } = await productService.getProductsWithPagination({ page, limit });

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