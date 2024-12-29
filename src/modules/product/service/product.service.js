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
            pages: Array.from({length: totalPages}, (_, i) => ({
                number: i + 1,
                active: page === i + 1,
            }))
        };

        return {productList, pagination};
    }

    // Create a new product
    async create(product) {
        return Product.create(product);
    }

    // Update a product
    async update(id, product) {
        return Product.update(product, {
            where: {id}
        });
    }

    // delete a product
    async delete(id) {
        return Product.destroy({
            where: {id}
        });
    }
}

module.exports = new ProductService();