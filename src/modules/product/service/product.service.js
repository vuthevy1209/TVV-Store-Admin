const Product = require('../models/product');
const Category = require('../models/category');
const Brand = require('../models/brand');
const { index } = require('../../../config/flexSearch');

class ProductService {
    // Get all products
    async getAll() {
        return await Product.findAll({
            include: [
                {model: Category, attributes: ['name']},
                {model: Brand, attributes: ['name']}
            ]
        });
    }

    // Find product by ID
    async findById(id) {
        return await Product.findOne({
            where: {id},
            include: [
                {model: Category, attributes: ['name']},
                {model: Brand, attributes: ['name']}
            ]
        });
    }

    // Get all products with pagination
    async getProductsWithPagination({page = 1, limit = 3}) {
        const offset = (page - 1) * limit;
        const {rows: products, count: totalProducts} = await Product.findAndCountAll({
            include: [
                {model: Category, attributes: ['name']},
                {model: Brand, attributes: ['name']}
            ],
            offset,
            limit
        });

        const productList = products.map(product => product.get({plain: true}));
        const totalPages = Math.ceil(totalProducts / limit);
        const pagination = {
            currentPage: page,
            totalPages,
            hasPrev: page > 1,
            hasNext: page < totalPages,
            prevPage: page - 1,
            nextPage: page + 1,
            pages: Array.from({length: totalPages}, (_, i) => ({
                number: i + 1,
                active: i + 1 === page
            }))
        };

        return {productList, pagination};
    }
}

module.exports = new ProductService();