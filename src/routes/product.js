const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// 获取商品列表
router.get('/list', productController.getProductList);

// 搜索商品
router.get('/search', productController.searchProducts);

// 获取商品详情
router.get('/:id', productController.getProductDetail);

module.exports = router;
