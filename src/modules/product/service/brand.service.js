const Brand = require('../models/brand');

class BrandService {
    async getAll() {
        const brands = await Brand.findAll();
        return brands.map(brand => brand.get({plain: true}));
    }
}

module.exports = new BrandService();