const Brand = require('../models/brand');

class BrandService {
    async getAll() {
        const brands = await Brand.findAll();
        return brands.map(brand => brand.get({plain: true}));
    }

    async create(brand) {
        return Brand.create(brand);
    }

    async update(id, brand) {
        return await Brand.update(brand, {
            where: { id }
        });
    }

    async delete(id) {
        return await Brand.destroy({
            where: { id }
        });
    }
}

module.exports = new BrandService();