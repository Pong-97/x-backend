const express = require('express');
const router = express.Router();
const adminAuth = require('../../middleware/adminAuth');

// 公开路由（无需认证）
router.use('/auth', require('./auth'));

// 需要认证的路由
router.use(adminAuth); // 全局管理员认证中间件

// 各模块路由
router.use('/user', require('./user'));
router.use('/product', require('./product'));
router.use('/order', require('./order'));
router.use('/category', require('./category'));
router.use('/address', require('./address'));
router.use('/log', require('./log'));

module.exports = router;
