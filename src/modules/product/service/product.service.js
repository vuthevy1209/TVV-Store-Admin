const Product = require('../models/product');
const Category = require('../models/category');
const Brand = require('../models/brand');
const { index } = require('../../../config/flexSearch');
const Order = require('../../order/model/order');
const OrderItems = require('../../order/model/orderItems');
const moment = require('moment');
const {OrderStatusEnum} = require('../../order/enum/order.enum');

const { sequelize } = require('../../../config/database');
const { Op } = require('sequelize');

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

    async getTotalProducts() {
        return Product.count();
    }

    // Get top products by day
    async getTopProductsByDay(date) {
        const startOfDay = moment(date).startOf('day').toDate();
        const endOfDay = moment(date).endOf('day').toDate();

        return this.getTopProductsByDateRange(startOfDay, endOfDay);
    }

    // Get top products by week
    async getTopProductsByWeek(date) {
        const startOfWeek = moment(date).startOf('week').toDate();
        const endOfWeek = moment(date).endOf('week').toDate();

        return this.getTopProductsByDateRange(startOfWeek, endOfWeek);
    }

    // Get top products by month
    async getTopProductsByMonth(date) {
        const startOfMonth = moment(date).startOf('month').toDate();
        const endOfMonth = moment(date).endOf('month').toDate();

        return this.getTopProductsByDateRange(startOfMonth, endOfMonth);
    }

    // Get top products by year
    async getTopProductsByYear(date) {
        const startOfYear = moment(date).startOf('year').toDate();
        const endOfYear = moment(date).endOf('year').toDate();

        return this.getTopProductsByDateRange(startOfYear, endOfYear);
    }

    // Helper method to get top products by date range
    async getTopProductsByDateRange(startDate, endDate) {
        const topProducts = await OrderItems.findAll({
            attributes: [
                'product_id',
                [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'], // Simple aggregation
                [sequelize.literal('SUM(quantity * product_price)'), 'totalRevenue'] // Literal for complex expression
            ],
            include: [
                {
                    model: Product,
                    as: 'product',
                    attributes: ['name', 'image_urls']
                },
                {
                    model: Order,
                    as: 'order',
                    attributes: [],
                    where: {
                        status: OrderStatusEnum.PAID.value,
                        created_at: {
                            [Op.between]: [startDate, endDate]
                        }
                    }
                }
            ],
            group: ['product.id', 'product_id','product.name', 'product.image_urls'],
            order: [[sequelize.literal('SUM(quantity * product_price)'), 'DESC']], // Literal for ordering
            limit: 5
        });
    
        return topProducts.map(item => ({
            productId: item.product_id,
            name: item.product.name,
            image: item.product.image_urls ? item.product.image_urls[0] : null,
            totalQuantity: item.get('totalQuantity'),
            totalRevenue: item.get('totalRevenue')
        }));
    }
    
    // async getTopProductsByDateRange(startDate, endDate) {
    //     const topProducts = await OrderItems.findAll({
    //         attributes: [
    //             'product_id',
    //             [sequelize.literal('SUM(quantity)'), 'totalQuantity'], // Using literal for sum
    //             [sequelize.literal('SUM(quantity * product_price)'), 'totalRevenue'] // Full expression as literal
    //         ],
    //         include: [
    //             {
    //                 model: Product,
    //                 as: 'product',
    //                 attributes: ['name', 'image_urls']
    //             },
    //             {
    //                 model: Order,
    //                 as: 'order',
    //                 attributes: [],
    //                 where: {
    //                     status: OrderStatusEnum.PAID.value,
    //                     created_at: {
    //                         [Op.between]: [startDate, endDate]
    //                     }
    //                 }
    //             }
    //         ],
    //         group: ['product_id', 'product.name', 'product.image_urls'], // Non-aggregated columns must be grouped
    //         order: [[sequelize.literal('SUM(quantity * product_price)'), 'DESC']], // Literal in order clause
    //         limit: 5
    //     });
    // }    

}

module.exports = new ProductService();