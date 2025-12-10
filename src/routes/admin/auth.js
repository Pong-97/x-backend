const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../../controllers/admin/authController');
const adminAuth = require('../../middleware/adminAuth');

// 登录限流：15分钟内最多5次尝试
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    code: 429,
    message: '登录尝试次数过多，请15分钟后再试',
    data: null
  },
  standardHeaders: true,
  legacyHeaders: false
});

// 管理员登录（公开接口）
router.post('/login', loginLimiter, authController.login);

// 以下接口需要认证
router.use(adminAuth);

// 获取当前管理员信息
router.get('/info', authController.getInfo);

// 管理员登出
router.post('/logout', authController.logout);

// 修改密码
router.post('/change-password', authController.changePassword);

module.exports = router;
