const express = require('express');
const router = express.Router();

const orderController = require('../controller/order.controller');

router.get('/', orderController.index);
router.get('/:id', orderController.show);
router.patch('/update-status/:id', orderController.updateStatus);

module.exports = router;