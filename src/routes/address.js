const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');
const authMiddleware = require('../middleware/auth');

// 所有地址接口都需要认证
router.use(authMiddleware);

// 获取地址列表
router.get('/list', addressController.getAddressList);

// 添加地址
router.post('/add', addressController.addAddress);

// 更新地址
router.post('/update/:id', addressController.updateAddress);

// 删除地址
router.delete('/delete/:id', addressController.deleteAddress);

// 设置默认地址
router.post('/setDefault/:id', addressController.setDefaultAddress);

module.exports = router;
