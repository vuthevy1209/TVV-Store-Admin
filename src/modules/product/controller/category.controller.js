const CategoryService = require('../service/category.service');

class CategoryController {
    // [GET] /categories
    async index(req, res, next) {
        try {
            const categoryList = await CategoryService.getAll();
            res.json({ categoryList });
        } catch (error) {
            console.error('Error searching categories:', error);
            next(error);
        }
    }

    // [POST] /categories/store
    async store(req, res, next) {
        try {
            const category = req.body;
            const response = await CategoryService.create(category);
            res.json({ message: 'Category created successfully', category: response });
        } catch (error) {
            console.error('Error creating category:', error);
            next(error);
        }
    }

    // [PUT] /categories/update
    async update(req, res, next) {
        try {
            const category = req.body;
            const id = category.id;
            const response = await CategoryService.update(id, category);
            res.json({ message: 'Category updated successfully', category: response });
        } catch (error) {
            console.error('Error updating category:', error);
            next(error);
        }
    }

    // [DELETE] /categories/delete
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            await CategoryService.delete(id);
            res.json({ message: 'Category deleted successfully' });
        } catch (error) {
            console.error('Error deleting category:', error);
            next(error);
        }
    }
}

module.exports = new CategoryController();