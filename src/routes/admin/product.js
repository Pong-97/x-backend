const express = require('express');
const router = express.Router();
const productManageController = require('../../controllers/admin/productManageController');
const operationLog = require('../../middleware/operationLog');

// 获取商品列表
router.get('/list', productManageController.getProductList);

// 获取商品统计数据
router.get('/statistics', productManageController.getProductStatistics);

// 获取商品详情
router.get('/:productId', productManageController.getProductDetail);

// 创建商品
router.post('/',
  operationLog('product', 'create'),
  productManageController.createProduct
);

// 更新商品
router.put('/:productId',
  operationLog('product', 'update'),
  productManageController.updateProduct
);

// 删除商品
router.delete('/:productId',
  operationLog('product', 'delete'),
  productManageController.deleteProduct
);

// 批量上下架
router.post('/batch/status',
  operationLog('product', 'status', (req) => {
    const { productIds, status } = req.body;
    return `批量${status === 1 ? '上架' : '下架'}商品 (${productIds.length}个)`;
  }),
  productManageController.batchUpdateStatus
);

module.exports = router;
