const express = require('express');
const router = express.Router();
const orderManageController = require('../../controllers/admin/orderManageController');
const operationLog = require('../../middleware/operationLog');

// 获取订单列表
router.get('/list', orderManageController.getOrderList);

// 获取订单统计数据
router.get('/statistics', orderManageController.getOrderStatistics);

// 获取订单详情
router.get('/:orderId', orderManageController.getOrderDetail);

// 更新订单状态
router.put('/:orderId/status',
  operationLog('order', 'status'),
  orderManageController.updateOrderStatus
);

// 订单发货
router.post('/:orderId/deliver',
  operationLog('order', 'update', (req) => {
    return `订单发货 (订单ID: ${req.params.orderId})`;
  }),
  orderManageController.deliverOrder
);

// 取消订单
router.post('/:orderId/cancel',
  operationLog('order', 'update', (req) => {
    return `取消订单 (订单ID: ${req.params.orderId}, 原因: ${req.body.reason || '管理员取消'})`;
  }),
  orderManageController.cancelOrder
);

module.exports = router;
