const BrandService = require('../service/brand.service');

class BrandController {
    // [GET] /brands
    async index(req, res, next) {
        try {
            const brandList = await BrandService.getAll();
            res.render('page/brand/BrandList', { brandList });
        } catch (error) {
            console.error('Error searching brands:', error);
            next(error);
        }
    }

    // [POST] /brands/store
    async store(req, res, next) {
        try {
            const brand = req.body;
            const response = await BrandService.create(brand);
            res.json({ message: 'Brand created successfully', brand: response });
        } catch (error) {
            console.error('Error creating brand:', error);
            next(error);
        }
    }

    // [PUT] /brands/update
    async update(req, res, next) {
        try {
            const brand = req.body;
            const id = brand.id;
            const data = await BrandService.update(id, brand);
            res.json({ message: 'Brand updated successfully', data });
        } catch (error) {
            console.error('Error updating brand:', error);
            next(error);
        }
    }

    // [DELETE] /brands/:id
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            await BrandService.delete(id);
            res.json({ message: 'Brand deleted successfully' });
        } catch (error) {
            console.error('Error deleting brand:', error);
            next(error);
        }
    }
}

module.exports = new BrandController();