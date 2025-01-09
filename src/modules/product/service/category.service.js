const Category = require('../models/category');

class CategoryService {
    async getAll() {
        const categories = await Category.findAll();
        return categories.map(category => category.get({plain: true}));
    }

    async create(category) {
        return Category.create(category);
    }

    async update(id, category) {
        return await Category.update(category, {
            where: { id }
        });
    }

    async delete(id) {
        return await Category.destroy({
            where: { id }
        });
    }
}

module.exports = new CategoryService();