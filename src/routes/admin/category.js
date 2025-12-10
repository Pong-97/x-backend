const express = require('express');
const router = express.Router();
const categoryManageController = require('../../controllers/admin/categoryManageController');
const operationLog = require('../../middleware/operationLog');

// 获取分类列表
router.get('/list', categoryManageController.getCategoryList);

// 创建分类
router.post('/',
  operationLog('category', 'create'),
  categoryManageController.createCategory
);

// 更新分类
router.put('/:categoryId',
  operationLog('category', 'update'),
  categoryManageController.updateCategory
);

// 删除分类
router.delete('/:categoryId',
  operationLog('category', 'delete'),
  categoryManageController.deleteCategory
);

module.exports = router;
