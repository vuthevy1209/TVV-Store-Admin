// src/route/user.js
const express = require('express');
const router = express.Router();
const upload = require('../../../config/upload');
const userController = require('../controller/user.controller');

router.get('/', userController.getAllUser);
router.get('/blocked', userController.getBlockedUsers);
router.get('/profile', userController.getProfile);
router.post('/update-profile', upload.single('avatar'), userController.updateProfile);
router.put('/block/:id', userController.blockUser);
router.put('/unblock/:id', userController.unblockUser);

module.exports = router;