const Brand = require('../models/brand');

class BrandService {
    async getAll() {
        const brands = await Brand.findAll({
            order: [
                ['created_at', 'DESC'],
                ['updated_at', 'DESC']
            ],
            where: {'business_status': true}
        });
        return brands.map(brand => brand.get({ plain: true }));
    }

    async create(brand) {
        return Brand.create(brand);
    }

    async update(id, brand) {
        await Brand.update(brand, {
            where: { id },
            individualHooks: true,
            fields: Object.keys(brand),
            returning: true,
            silent: true
        });
        return await Brand.findByPk(id);
    }

    async delete(id) {
        const brand = await Brand.findByPk(id);
        // update business_status to false
        brand.business_status = false;

        await brand.save();
    }
}

module.exports = new BrandService();