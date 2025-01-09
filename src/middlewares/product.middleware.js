const { body, validationResult } = require('express-validator');

const validateProductRules = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('desc').trim().notEmpty().withMessage('Description is required'),
    body('price').trim().notEmpty().withMessage('Price is required'),
    body('inventory_quantity').trim().notEmpty().withMessage('Inventory quantity is required'),
    body('category_id').trim().notEmpty().withMessage('Category is required'),
    body('brand_id').trim().notEmpty().withMessage('Brand is required'),
    body('image_urls').custom((value, { req }) => {
        if (!value || value.length === 0) {
            throw new Error('At least one image is required');
        }
        return true;
    })
];


const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

module.exports = {
    validateProductRules,
    handleValidationErrors
}
