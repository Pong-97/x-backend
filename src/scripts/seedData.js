/**
 * 测试数据初始化脚本
 * 运行: node src/scripts/seedData.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Banner = require('../models/Banner');

async function seedData() {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || 'ecommerce',
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('数据库连接成功');

    // 清空现有数据（可选）
    // await User.deleteMany({});
    // await Product.deleteMany({});
    // await Category.deleteMany({});
    // await Banner.deleteMany({});

    // 创建测试用户
    const hashedPassword = await bcrypt.hash('123456', 10);
    const testUser = new User({
      username: 'testuser',
      password: hashedPassword,
      email: 'test@example.com',
      avatar: 'https://www.gravatar.com/avatar/default?d=mp'
    });
    await testUser.save();
    console.log('测试用户创建成功:', testUser.username);

    // 创建分类
    const categories = [
      { name: '数码产品', icon: 'https://via.placeholder.com/50', parentId: 0, level: 1, sort: 100 },
      { name: '服装鞋包', icon: 'https://via.placeholder.com/50', parentId: 0, level: 1, sort: 90 },
      { name: '食品饮料', icon: 'https://via.placeholder.com/50', parentId: 0, level: 1, sort: 80 },
      { name: '家居生活', icon: 'https://via.placeholder.com/50', parentId: 0, level: 1, sort: 70 },
    ];

    for (const cat of categories) {
      const category = new Category(cat);
      await category.save();
      console.log('分类创建成功:', category.name);
    }

    // 获取第一个分类ID
    const firstCategory = await Category.findOne();

    // 创建商品
    const products = [
      {
        name: 'iPhone 15 Pro Max',
        price: 9999,
        originalPrice: 10999,
        image: 'https://via.placeholder.com/400',
        images: ['https://via.placeholder.com/400', 'https://via.placeholder.com/400'],
        description: '全新A17 Pro芯片，钛金属设计',
        detail: '<p>详细的商品介绍...</p>',
        stock: 100,
        sales: 256,
        categoryId: firstCategory.categoryId,
        specs: [
          { name: '颜色', value: '钛金色' },
          { name: '容量', value: '256GB' }
        ]
      },
      {
        name: 'MacBook Pro 16',
        price: 19999,
        originalPrice: 21999,
        image: 'https://via.placeholder.com/400',
        images: ['https://via.placeholder.com/400'],
        description: 'M3 Max芯片，专业性能',
        detail: '<p>详细的商品介绍...</p>',
        stock: 50,
        sales: 128,
        categoryId: firstCategory.categoryId,
        specs: [
          { name: '颜色', value: '深空灰' },
          { name: '内存', value: '32GB' }
        ]
      },
      {
        name: 'AirPods Pro 2',
        price: 1899,
        originalPrice: 1999,
        image: 'https://via.placeholder.com/400',
        images: ['https://via.placeholder.com/400'],
        description: '主动降噪，空间音频',
        detail: '<p>详细的商品介绍...</p>',
        stock: 200,
        sales: 512,
        categoryId: firstCategory.categoryId
      }
    ];

    for (const prod of products) {
      const product = new Product(prod);
      await product.save();
      console.log('商品创建成功:', product.name);
    }

    // 创建轮播图
    const banners = [
      {
        title: '新品首发',
        image: 'https://via.placeholder.com/800x400',
        link: '/product/1001',
        sort: 100
      },
      {
        title: '限时优惠',
        image: 'https://via.placeholder.com/800x400',
        link: '/product/1002',
        sort: 90
      }
    ];

    for (const ban of banners) {
      const banner = new Banner(ban);
      await banner.save();
      console.log('轮播图创建成功:', banner.title);
    }

    console.log('\n测试数据初始化完成！');
    console.log('测试账号: testuser / 123456');
    
    process.exit(0);
  } catch (error) {
    console.error('初始化失败:', error);
    process.exit(1);
  }
}

seedData();
