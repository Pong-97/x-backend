const Category = require('../models/Category');
const { buildTree } = require('../utils/helpers');

// 获取分类列表
exports.getCategoryList = async (req, res) => {
  try {
    // 查询所有启用的分类
    const categories = await Category.find({ status: 1 })
      .select('-_id -__v')
      .sort({ sort: -1 });

    // 转换为普通对象数组
    const categoryList = categories.map(cat => ({
      categoryId: cat.categoryId,
      name: cat.name,
      icon: cat.icon,
      parentId: cat.parentId,
      level: cat.level,
      sort: cat.sort
    }));

    // 构建树形结构
    const tree = buildTree(categoryList);

    res.success(tree);
  } catch (error) {
    console.error('获取分类列表错误:', error);
    res.error(error.message, 500);
  }
};
