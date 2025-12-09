const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authMiddleware = require('../middleware/auth');

// 所有购物车接口都需要认证
router.use(authMiddleware);

// 获取购物车列表
router.get('/list', cartController.getCartList);

// 添加到购物车
router.post('/add', cartController.addToCart);

// 更新购物车
router.post('/update', cartController.updateCart);

// 删除购物车商品
router.delete('/delete/:id', cartController.deleteCart);

module.exports = router;
