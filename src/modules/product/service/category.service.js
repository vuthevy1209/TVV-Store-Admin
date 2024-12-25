const Category = require('../models/category');

class CategoryService {
    async getAll() {
        const categories = await Category.findAll();
        return categories.map(category => category.get({plain: true}));
    }
}

module.exports = new CategoryService();