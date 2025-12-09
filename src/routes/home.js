const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

// 获取首页数据
router.get('/', homeController.getHomeData);

module.exports = router;
