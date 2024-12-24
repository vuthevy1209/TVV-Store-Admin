const express = require('express');
const router = express.Router();

const siteController = require('../controller/site.controller');

router.get('/dashboard', siteController.index);

module.exports = router;