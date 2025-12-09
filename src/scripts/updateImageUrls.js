/**
 * 更新数据库中的图片链接
 * 将 via.placeholder.com 替换为 picsum.photos
 * 运行: node src/scripts/updateImageUrls.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const Product = require('../models/Product');
const Category = require('../models/Category');
const Banner = require('../models/Banner');

/**
 * 生成文字图标的 SVG Data URL
 * @param {string} text - 要显示的文字
 * @param {string} bgColor - 背景颜色
 * @returns {string} SVG Data URL
 */
function generateTextIcon(text, bgColor = '#4F46E5') {
  const svg = `
    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="${bgColor}" rx="20"/>
      <text x="50" y="50" font-size="48" font-weight="bold" 
            fill="white" text-anchor="middle" dominant-baseline="central" 
            font-family="Arial, sans-serif">${text}</text>
    </svg>
  `.trim();
  
  // 转换为 Data URL
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

async function updateImageUrls() {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || 'ecommerce',
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('数据库连接成功');

    // 更新分类图标 - 生成 SVG 图标
    const categories = await Category.find({});
    const categoryColors = ['#4F46E5', '#EC4899', '#F59E0B', '#10B981', '#8B5CF6', '#06B6D4'];
    console.log(`找到 ${categories.length} 个需要更新的分类`);
    
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      const firstChar = category.name.charAt(0);
      const color = categoryColors[i % categoryColors.length];
      category.icon = generateTextIcon(firstChar, color);
      await category.save();
      console.log(`✓ 更新分类: ${category.name} -> ${firstChar} (${color})`);
    }

    // 更新商品图片
    const products = await Product.find({
      $or: [
        { image: /via\.placeholder\.com/ },
        { images: /via\.placeholder\.com/ }
      ]
    });
    console.log(`找到 ${products.length} 个需要更新的商品`);
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      
      // 更新主图
      if (product.image && product.image.includes('via.placeholder.com')) {
        product.image = `https://picsum.photos/400/400?random=${10 + i}`;
      }
      
      // 更新图片数组
      if (product.images && product.images.length > 0) {
        product.images = product.images.map((img, idx) => {
          if (img.includes('via.placeholder.com')) {
            return `https://picsum.photos/400/400?random=${10 + i * 10 + idx}`;
          }
          return img;
        });
      }
      
      await product.save();
      console.log(`✓ 更新商品: ${product.name}`);
    }

    // 更新轮播图
    const banners = await Banner.find({ image: /via\.placeholder\.com/ });
    console.log(`找到 ${banners.length} 个需要更新的轮播图`);
    
    for (let i = 0; i < banners.length; i++) {
      const banner = banners[i];
      banner.image = `https://picsum.photos/800/400?random=${100 + i}`;
      await banner.save();
      console.log(`✓ 更新轮播图: ${banner.title}`);
    }

    console.log('\n✅ 所有图片链接更新完成！');
    console.log('现在可以刷新前端页面查看效果');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 更新失败:', error);
    process.exit(1);
  }
}

updateImageUrls();
