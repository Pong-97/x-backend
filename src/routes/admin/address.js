const express = require('express');
const router = express.Router();
const addressManageController = require('../../controllers/admin/addressManageController');

// 获取地址列表（按用户）
router.get('/list', addressManageController.getAddressList);

// 获取地址详情
router.get('/:addressId', addressManageController.getAddressDetail);

module.exports = router;
