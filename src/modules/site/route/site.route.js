const express = require('express');
const router = express.Router();

const siteController = require('../controller/site.controller');

router.get('/dashboard', siteController.index);
router.get('/dashboard/data', siteController.getData);
router.get('/dashboard/top-products', siteController.getTopProducts);

module.exports = router;