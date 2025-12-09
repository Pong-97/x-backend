const Product = require('../models/Product');

// 获取商品列表
exports.getProductList = async (req, res) => {
  try {
    const { 
      categoryId, 
      page = 1, 
      pageSize = 10, 
      sortBy = 'createdAt', 
      order = 'desc' 
    } = req.query;

    // 参数处理
    const pageNum = Math.max(1, parseInt(page));
    const limit = Math.min(100, Math.max(1, parseInt(pageSize)));
    const skip = (pageNum - 1) * limit;

    // 构建查询条件
    const query = { status: 1 };
    if (categoryId) {
      query.categoryId = parseInt(categoryId);
    }

    // 构建排序条件
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder;

    // 查询商品列表
    const products = await Product.find(query)
      .select('-_id -__v')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    // 统计总数
    const total = await Product.countDocuments(query);

    // 格式化返回数据
    const list = products.map(product => ({
      id: product.productId,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      images: product.images,
      description: product.description,
      stock: product.stock,
      sales: product.sales,
      categoryId: product.categoryId
    }));

    res.success({
      list,
      total,
      page: pageNum,
      pageSize: limit
    });
  } catch (error) {
    console.error('获取商品列表错误:', error);
    res.error(error.message, 500);
  }
};

// 获取商品详情
exports.getProductDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({ productId: parseInt(id) })
      .select('-_id -__v');

    if (!product) {
      return res.error('商品不存在', 404);
    }

    // 增加浏览量
    await Product.findOneAndUpdate(
      { productId: parseInt(id) },
      { $inc: { views: 1 } }
    );

    res.success({
      id: product.productId,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      images: product.images,
      description: product.description,
      detail: product.detail,
      stock: product.stock,
      sales: product.sales,
      categoryId: product.categoryId,
      specs: product.specs
    });
  } catch (error) {
    console.error('获取商品详情错误:', error);
    res.error(error.message, 500);
  }
};

// 搜索商品
exports.searchProducts = async (req, res) => {
  try {
    const { keyword, page = 1, pageSize = 10 } = req.query;

    if (!keyword || !keyword.trim()) {
      return res.error('搜索关键词不能为空', 400);
    }

    const pageNum = Math.max(1, parseInt(page));
    const limit = Math.min(100, Math.max(1, parseInt(pageSize)));
    const skip = (pageNum - 1) * limit;

    // 使用正则表达式进行模糊搜索
    const searchRegex = new RegExp(keyword.trim(), 'i');
    const query = {
      status: 1,
      $or: [
        { name: searchRegex },
        { description: searchRegex }
      ]
    };

    // 查询商品
    const products = await Product.find(query)
      .select('-_id -__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(query);

    const list = products.map(product => ({
      id: product.productId,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      images: product.images,
      description: product.description,
      stock: product.stock,
      sales: product.sales,
      categoryId: product.categoryId
    }));

    res.success({
      list,
      total,
      page: pageNum,
      pageSize: limit
    });
  } catch (error) {
    console.error('搜索商品错误:', error);
    res.error(error.message, 500);
  }
};
