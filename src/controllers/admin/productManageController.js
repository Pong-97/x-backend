const Product = require('../../models/Product');
const Category = require('../../models/Category');

/**
 * 获取商品列表（分页、搜索、筛选）
 */
exports.getProductList = async (req, res) => {
  try {
    const {
      page = 1,
      size = 20,
      keyword = '',
      categoryId = '',
      status = '',
      minPrice = '',
      maxPrice = '',
      lowStock = '' // 是否只显示低库存商品
    } = req.query;

    // 构建查询条件
    const query = {};

    // 关键词搜索
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }

    // 分类筛选
    if (categoryId) {
      query.categoryId = parseInt(categoryId);
    }

    // 状态筛选
    if (status !== '') {
      query.status = parseInt(status);
    }

    // 价格范围
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // 低库存筛选（库存小于10）
    if (lowStock === 'true' || lowStock === '1') {
      query.stock = { $lt: 10 };
    }

    // 分页参数
    const pageNum = Math.max(1, parseInt(page));
    const pageSize = Math.min(100, Math.max(1, parseInt(size)));
    const skip = (pageNum - 1) * pageSize;

    // 查询数据
    const [list, total] = await Promise.all([
      Product.find(query)
        .select('-__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Product.countDocuments(query)
    ]);

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        list,
        pagination: {
          page: pageNum,
          size: pageSize,
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      }
    });
  } catch (error) {
    console.error('获取商品列表错误:', error);
    res.status(500).json({
      code: 500,
      message: '获取商品列表失败',
      data: null
    });
  }
};

/**
 * 获取商品详情
 */
exports.getProductDetail = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findOne({ productId: parseInt(productId) })
      .select('-__v')
      .lean();

    if (!product) {
      return res.status(404).json({
        code: 404,
        message: '商品不存在',
        data: null
      });
    }

    // 获取分类信息
    if (product.categoryId) {
      const category = await Category.findOne({ categoryId: product.categoryId })
        .select('categoryId name')
        .lean();
      product.category = category;
    }

    res.json({
      code: 200,
      message: '获取成功',
      data: product
    });
  } catch (error) {
    console.error('获取商品详情错误:', error);
    res.status(500).json({
      code: 500,
      message: '获取商品详情失败',
      data: null
    });
  }
};

/**
 * 创建商品
 */
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      originalPrice,
      image,
      images,
      description,
      detail,
      stock,
      categoryId,
      specs,
      status = 1,
      sort = 0
    } = req.body;

    // 参数验证
    if (!name || !price || stock === undefined) {
      return res.status(400).json({
        code: 400,
        message: '商品名称、价格和库存不能为空',
        data: null
      });
    }

    // 创建商品
    const product = await Product.create({
      name,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      image,
      images: images || [],
      description,
      detail,
      stock: parseInt(stock),
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      specs: specs || [],
      status: parseInt(status),
      sort: parseInt(sort)
    });

    res.json({
      code: 200,
      message: '创建成功',
      data: product
    });
  } catch (error) {
    console.error('创建商品错误:', error);
    res.status(500).json({
      code: 500,
      message: '创建商品失败',
      data: null
    });
  }
};

/**
 * 更新商品
 */
exports.updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const updateData = { ...req.body };

    // 移除不允许更新的字段
    delete updateData.productId;
    delete updateData._id;
    delete updateData.__v;
    delete updateData.sales;
    delete updateData.views;
    delete updateData.createdAt;

    // 设置更新时间
    updateData.updatedAt = new Date();

    // 类型转换
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.originalPrice) updateData.originalPrice = parseFloat(updateData.originalPrice);
    if (updateData.stock !== undefined) updateData.stock = parseInt(updateData.stock);
    if (updateData.categoryId) updateData.categoryId = parseInt(updateData.categoryId);
    if (updateData.status !== undefined) updateData.status = parseInt(updateData.status);
    if (updateData.sort !== undefined) updateData.sort = parseInt(updateData.sort);

    const product = await Product.findOneAndUpdate(
      { productId: parseInt(productId) },
      updateData,
      { new: true }
    ).select('-__v');

    if (!product) {
      return res.status(404).json({
        code: 404,
        message: '商品不存在',
        data: null
      });
    }

    res.json({
      code: 200,
      message: '更新成功',
      data: product
    });
  } catch (error) {
    console.error('更新商品错误:', error);
    res.status(500).json({
      code: 500,
      message: '更新商品失败',
      data: null
    });
  }
};

/**
 * 删除商品
 */
exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findOneAndDelete({ productId: parseInt(productId) });

    if (!product) {
      return res.status(404).json({
        code: 404,
        message: '商品不存在',
        data: null
      });
    }

    res.json({
      code: 200,
      message: '删除成功',
      data: null
    });
  } catch (error) {
    console.error('删除商品错误:', error);
    res.status(500).json({
      code: 500,
      message: '删除商品失败',
      data: null
    });
  }
};

/**
 * 批量上下架
 */
exports.batchUpdateStatus = async (req, res) => {
  try {
    const { productIds, status } = req.body;

    // 参数验证
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '商品ID列表不能为空',
        data: null
      });
    }

    if (![0, 1].includes(parseInt(status))) {
      return res.status(400).json({
        code: 400,
        message: '状态参数错误',
        data: null
      });
    }

    // 批量更新
    const result = await Product.updateMany(
      { productId: { $in: productIds.map(id => parseInt(id)) } },
      { status: parseInt(status), updatedAt: new Date() }
    );

    res.json({
      code: 200,
      message: '批量更新成功',
      data: {
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('批量更新商品状态错误:', error);
    res.status(500).json({
      code: 500,
      message: '批量更新失败',
      data: null
    });
  }
};

/**
 * 获取商品统计数据
 */
exports.getProductStatistics = async (req, res) => {
  try {
    const [
      totalProducts,
      onSaleProducts,
      offSaleProducts,
      lowStockProducts,
      topSales
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ status: 1 }),
      Product.countDocuments({ status: 0 }),
      Product.countDocuments({ stock: { $lt: 10 } }),
      Product.find({ status: 1 })
        .select('productId name image price sales stock')
        .sort({ sales: -1 })
        .limit(10)
        .lean()
    ]);

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        overview: {
          totalProducts,
          onSaleProducts,
          offSaleProducts,
          lowStockProducts
        },
        topSales
      }
    });
  } catch (error) {
    console.error('获取商品统计错误:', error);
    res.status(500).json({
      code: 500,
      message: '获取商品统计失败',
      data: null
    });
  }
};
