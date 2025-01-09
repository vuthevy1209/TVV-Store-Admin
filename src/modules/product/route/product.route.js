const express = require('express');
const router = express.Router();
const productController = require('../controller/product.controller');

const { validateProductRules, handleValidationErrors} = require('../../../middlewares/product.middleware');

router.get('/', productController.index);

// Create a new product
router.get('/create', productController.create); // Render form
router.post('/store', validateProductRules, handleValidationErrors, productController.store);

// Update a product
router.get('/edit/:id', productController.edit); // Render form
router.put('/update', validateProductRules, handleValidationErrors, productController.update);


// Delete a product
router.delete('/:id', productController.delete);

module.exports = router;