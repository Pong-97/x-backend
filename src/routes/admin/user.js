const express = require('express');
const router = express.Router();
const userManageController = require('../../controllers/admin/userManageController');
const operationLog = require('../../middleware/operationLog');

// 获取用户列表
router.get('/list', userManageController.getUserList);

// 获取用户统计数据
router.get('/statistics', userManageController.getUserStatistics);

// 获取用户详情
router.get('/:userId', userManageController.getUserDetail);

// 修改用户状态
router.put('/:userId/status', 
  operationLog('user', 'status'),
  userManageController.updateUserStatus
);

module.exports = router;
