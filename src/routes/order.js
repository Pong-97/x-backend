const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');

// 所有订单接口都需要认证
router.use(authMiddleware);

// 创建订单
router.post('/create', orderController.createOrder);

// 获取订单列表
router.get('/list', orderController.getOrderList);

// 获取订单详情
router.get('/:id', orderController.getOrderDetail);

// 取消订单
router.post('/cancel/:id', orderController.cancelOrder);

// 确认收货
router.post('/confirm/:id', orderController.confirmOrder);

// 删除订单
router.delete('/delete/:id', orderController.deleteOrder);

module.exports = router;
