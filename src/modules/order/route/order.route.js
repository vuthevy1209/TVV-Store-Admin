const express = require('express');
const router = express.Router();

const orderController = require('../controller/order.controller');

router.get('/', orderController.index);
//router.get('/search', orderController.search);

module.exports = router;