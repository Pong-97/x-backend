const express = require('express');
const router = express.Router();
const logController = require('../../controllers/admin/logController');

// 获取操作日志列表
router.get('/list', logController.getLogList);

// 获取日志统计
router.get('/statistics', logController.getLogStatistics);

// 获取日志详情
router.get('/:logId', logController.getLogDetail);

module.exports = router;
