const Category = require('../../models/Category');
const Product = require('../../models/Product');

/**
 * 获取分类列表
 */
exports.getCategoryList = async (req, res) => {
  try {
    const categories = await Category.find()
      .select('-__v')
      .sort({ sort: 1, createdAt: -1 })
      .lean();

    // 统计每个分类的商品数量
    const categoryIds = categories.map(cat => cat.categoryId);
    const productCounts = await Product.aggregate([
      { $match: { categoryId: { $in: categoryIds } } },
      { $group: { _id: '$categoryId', count: { $sum: 1 } } }
    ]);

    const countMap = productCounts.reduce((map, item) => {
      map[item._id] = item.count;
      return map;
    }, {});

    categories.forEach(cat => {
      cat.productCount = countMap[cat.categoryId] || 0;
    });

    res.json({
      code: 200,
      message: '获取成功',
      data: categories
    });
  } catch (error) {
    console.error('获取分类列表错误:', error);
    res.status(500).json({
      code: 500,
      message: '获取分类列表失败',
      data: null
    });
  }
};

/**
 * 创建分类
 */
exports.createCategory = async (req, res) => {
  try {
    const { name, icon, image, sort = 0 } = req.body;

    if (!name) {
      return res.status(400).json({
        code: 400,
        message: '分类名称不能为空',
        data: null
      });
    }

    // 检查名称是否重复
    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(400).json({
        code: 400,
        message: '分类名称已存在',
        data: null
      });
    }

    const category = await Category.create({
      name,
      icon,
      image,
      sort: parseInt(sort)
    });

    res.json({
      code: 200,
      message: '创建成功',
      data: category
    });
  } catch (error) {
    console.error('创建分类错误:', error);
    res.status(500).json({
      code: 500,
      message: '创建分类失败',
      data: null
    });
  }
};

/**
 * 更新分类
 */
exports.updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const updateData = { ...req.body };

    delete updateData.categoryId;
    delete updateData._id;
    delete updateData.__v;
    delete updateData.createdAt;

    updateData.updatedAt = new Date();
    if (updateData.sort !== undefined) {
      updateData.sort = parseInt(updateData.sort);
    }

    // 如果修改名称，检查是否重复
    if (updateData.name) {
      const existing = await Category.findOne({
        name: updateData.name,
        categoryId: { $ne: parseInt(categoryId) }
      });
      if (existing) {
        return res.status(400).json({
          code: 400,
          message: '分类名称已存在',
          data: null
        });
      }
    }

    const category = await Category.findOneAndUpdate(
      { categoryId: parseInt(categoryId) },
      updateData,
      { new: true }
    ).select('-__v');

    if (!category) {
      return res.status(404).json({
        code: 404,
        message: '分类不存在',
        data: null
      });
    }

    res.json({
      code: 200,
      message: '更新成功',
      data: category
    });
  } catch (error) {
    console.error('更新分类错误:', error);
    res.status(500).json({
      code: 500,
      message: '更新分类失败',
      data: null
    });
  }
};

/**
 * 删除分类
 */
exports.deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // 检查是否有商品使用该分类
    const productCount = await Product.countDocuments({
      categoryId: parseInt(categoryId)
    });

    if (productCount > 0) {
      return res.status(400).json({
        code: 400,
        message: `该分类下还有 ${productCount} 个商品，无法删除`,
        data: null
      });
    }

    const category = await Category.findOneAndDelete({
      categoryId: parseInt(categoryId)
    });

    if (!category) {
      return res.status(404).json({
        code: 404,
        message: '分类不存在',
        data: null
      });
    }

    res.json({
      code: 200,
      message: '删除成功',
      data: null
    });
  } catch (error) {
    console.error('删除分类错误:', error);
    res.status(500).json({
      code: 500,
      message: '删除分类失败',
      data: null
    });
  }
};
