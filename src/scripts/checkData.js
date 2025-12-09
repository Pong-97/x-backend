/**
 * 检查数据库数据完整性
 * 运行: node src/scripts/checkData.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const Banner = require('../models/Banner');
const Category = require('../models/Category');
const Product = require('../models/Product');

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || 'ecommerce',
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('数据库连接成功\n');

    // 检查轮播图
    console.log('=== 轮播图数据 ===');
    const banners = await Banner.find({});
    console.log(`总数: ${banners.length}`);
    banners.forEach(banner => {
      console.log(`- ${banner.title}: image=${banner.image ? '✓' : '✗'}, status=${banner.status}`);
    });

    // 检查分类
    console.log('\n=== 分类数据 ===');
    const categories = await Category.find({});
    console.log(`总数: ${categories.length}`);
    categories.forEach(cat => {
      console.log(`- ${cat.name}: icon=${cat.icon}, status=${cat.status}`);
    });

    // 检查商品
    console.log('\n=== 商品数据 ===');
    const products = await Product.find({});
    console.log(`总数: ${products.length}`);
    products.forEach(product => {
      const hasImage = product.image ? '✓' : '✗';
      const hasImages = product.images && product.images.length > 0 ? '✓' : '✗';
      console.log(`- ${product.name}: image=${hasImage}, images=${hasImages}, status=${product.status}`);
    });

    // 检查是否有缺失字段的数据
    console.log('\n=== 数据完整性检查 ===');
    const bannersWithoutImage = await Banner.find({ $or: [{ image: null }, { image: '' }] });
    const productsWithoutImage = await Product.find({ $or: [{ image: null }, { image: '' }] });
    
    if (bannersWithoutImage.length > 0) {
      console.log(`⚠️  发现 ${bannersWithoutImage.length} 个轮播图缺少图片`);
    }
    if (productsWithoutImage.length > 0) {
      console.log(`⚠️  发现 ${productsWithoutImage.length} 个商品缺少图片`);
    }
    
    if (bannersWithoutImage.length === 0 && productsWithoutImage.length === 0) {
      console.log('✅ 所有数据完整');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ 检查失败:', error);
    process.exit(1);
  }
}

checkData();
