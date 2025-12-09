const Banner = require('../models/Banner');
const Category = require('../models/Category');
const Product = require('../models/Product');

// 获取首页数据
exports.getHomeData = async (req, res) => {
  try {
    // 查询轮播图
    const banners = await Banner.find({ status: 1 })
      .select('-_id -__v')
      .sort({ sort: -1 })
      .limit(5);

    // 查询一级分类
    const categories = await Category.find({ status: 1, level: 1 })
      .select('-_id -__v')
      .sort({ sort: -1 })
      .limit(10);

    // 查询热门商品（按销量）
    const hotProducts = await Product.find({ status: 1 })
      .select('-_id -__v -detail -specs')
      .sort({ sales: -1 })
      .limit(10);

    // 查询新品（按创建时间）
    const newProducts = await Product.find({ status: 1 })
      .select('-_id -__v -detail -specs')
      .sort({ createdAt: -1 })
      .limit(10);

    // 格式化数据
    const formatProduct = (product) => ({
      id: product.productId,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      description: product.description,
      sales: product.sales
    });

    res.success({
      banners: banners.map(banner => ({
        id: banner.bannerId,
        image: banner.image,
        link: banner.link,
        title: banner.title
      })),
      categories: categories.map(cat => ({
        id: cat.categoryId,
        name: cat.name,
        icon: cat.icon
      })),
      hotProducts: hotProducts.map(formatProduct),
      newProducts: newProducts.map(formatProduct)
    });
  } catch (error) {
    console.error('获取首页数据错误:', error);
    res.error(error.message, 500);
  }
};
