const express = require('express');
const router = express.Router();

const brandController = require('../controller/brand.controller');

router.get('/', brandController.index);

// Create a new brand
router.post('/store', brandController.store);

// Update a brand
router.put('/update', brandController.update);

// Delete a brand
router.delete('/:id', brandController.delete);

module.exports = router;
