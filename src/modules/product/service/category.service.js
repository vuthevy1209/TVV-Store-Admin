const Category = require('../models/category');

class CategoryService {
    async getAll() {
        const categories = await Category.findAll({
            order: [
                ['created_at', 'DESC'],
                ['updated_at', 'DESC']
            ],
            where: {'business_status': true}
        });
        return categories.map(category => category.get({plain: true}));
    }

    async create(category) {
        return Category.create(category);
    }

    async update(id, category) {
        await Category.update(category, {
            where: { id },
            individualHooks: true,
            fields: Object.keys(category),
            returning: true,
            silent: true
        });

        return await Category.findByPk(id);
    }

    async delete(id) {
        const category = await Category.findByPk(id);
        // update business_status to false
        category.business_status = false;

        await category.save();
    }
}

module.exports = new CategoryService();