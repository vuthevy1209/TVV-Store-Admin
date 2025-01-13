const Product = require('../models/product');
const Category = require('../models/category');
const Brand = require('../models/brand');
const Order = require('../../order/model/order');
const OrderItems = require('../../order/model/orderItems');
const moment = require('moment');
const {OrderStatusEnum} = require('../../order/enum/order.enum');
const index = require('../../../config/flexSearch');

const {sequelize} = require('../../../config/database');
const {Op} = require('sequelize');

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

    // Get all products with pagination and criteria
    async findProductsWithPaginationAndCriteria(page = 1, limit = 5, searchParams) {

        page = parseInt(page);
        limit = parseInt(limit);
        const offset = (page - 1) * limit;
        const where = {};

        if (searchParams.business_status !== null && searchParams.business_status !== undefined && searchParams.business_status !== '') {
            where.business_status = searchParams.business_status === 'true';
        }

        if (searchParams.name) {
            // Use FlexSearch to search for products by name or description
            const flexSearchResults = index.search(searchParams.name);
            const productIds = flexSearchResults.map(result => result.result).flat();
            where.id = {[Op.in]: productIds};
        }

        if (searchParams.name) {
            where.name = {[Op.like]: `%${searchParams.name.trim()}%`};
        }

        if (searchParams.category_id) {
            where.category_id = parseInt(searchParams.category_id);
        }

        if (searchParams.brand_id) {
            where.brand_id = parseInt(searchParams.brand_id);
        }

        if (searchParams.price_min && searchParams.price_max) {
            where.price = {
                [Op.between]: [parseFloat(searchParams.price_min), parseFloat(searchParams.price_max)],
            };
        } else if (searchParams.price_min) {
            where.price = {
                [Op.gte]: parseFloat(searchParams.price_min),
            };
        } else if (searchParams.price_max) {
            where.price = {
                [Op.lte]: parseFloat(searchParams.price_max),
            };
        }

        const order = [];
        if (searchParams.sort_by_creation) {
            order.push(['created_at', searchParams.sort_by_creation]);
        }

        if (searchParams.sort_by_price) {
            order.push(['price', searchParams.sort_by_price]);
        }

        const {rows: productList, count: totalProducts} = await Product.findAndCountAll({
            where,
            include: [
                {model: Category, attributes: ['name']},
                {model: Brand, attributes: ['name']}
            ],
            offset,
            limit,
            order
        });

        const totalPages = Math.ceil(totalProducts / limit);

        return {
            productList,
            pagination: {
                currentPage: page,
                totalPages,
                pages: Array.from({length: totalPages}, (v, k) => k + 1).map(number => ({
                    number,
                    active: number === page
                }))
            }
        };
    }


    // Create a new product
    async create(product) {
        indexProducts().then(() => {
        }).catch(err => {
            console.error('Error indexing products:', err);
        });
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

    // unlock a product
    async unlock(id) {
        const product = await Product.findByPk(id);
        // update business_status to true
        product.business_status = true;

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
                        // status paid or completed
                        [Op.or]: [{status: OrderStatusEnum.PAID.value}, {status: OrderStatusEnum.COMPLETED.value}],
                        created_at: {
                            [Op.between]: [startDate, endDate]
                        }
                    }
                }
            ],
            group: ['product.id', 'product_id', 'product.name', 'product.image_urls'],
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

    async indexProducts() {
        try {
            const products = await Product.findAll();

            // Map the products to match the indexed fields
            const documents = products.map(product => {
                const productData = product.get({plain: true});

                return {
                    id: productData.id, // Ensure the `id` field matches the one in the FlexSearch config
                    name: productData.name,
                    desc: productData.desc, // Include only fields that are indexed
                };
            });

            documents.forEach(doc => {
                index.add({
                    id: doc.id,
                    name: doc.name,
                    desc: doc.desc,
                });
            });
        } catch (error) {
            console.error('Error indexing products:', error);
            throw new Error(error.message);
        }
    }

}

module.exports = new ProductService();