const express = require('express');
const router = express.Router();

const productController = require('../controller/product.controller');

router.get('/', productController.index);
router.get('/create', productController.create);
router.post('/store', productController.store);

module.exports = router;