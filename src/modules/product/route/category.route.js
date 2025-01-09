const express = require('express');
const router = express.Router();

const categoryController = require('../controller/category.controller');

router.get('/', categoryController.index);

// Create a new category
router.post('/store', categoryController.store);

// Update a category
router.put('/update', categoryController.update);

// Delete a category
router.delete('/:id', categoryController.delete);

module.exports = router;