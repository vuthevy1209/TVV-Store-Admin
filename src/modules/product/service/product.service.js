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
            where: {
                business_status: true
            },
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
        const product = await Product.findByPk(id);
        // update business_status to false
        product.business_status = false;

        await product.save();
    }

    // update quantity of product in inventory = inventory_quantity - quantity
    async updateProductInventory(id, quantity) {
        const product = await Product.findByPk(id);
        if (product.inventory_quantity < quantity) {
            throw new Error('Product' + product.name + ' is out of stock' + ' (available: ' + product.inventory_quantity + ')');
        }
        product.inventory_quantity -= quantity;

        await product.save();
    }
}

module.exports = new ProductService();