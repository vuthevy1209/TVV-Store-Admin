const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const validator = require('../../../middlewares/validation.middleware');

router.get('/login', authController.showLoginForm);
router.post('/login', authController.login);
router.post('/change-password', validator.validatePassword ,authController.changePassword);
router.get('/logout', authController.logout);

module.exports = router;