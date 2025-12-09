/**
 * 检查购物车数据和商品关联
 * 运行: node src/scripts/checkCart.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');

async function checkCart() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || 'ecommerce',
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('数据库连接成功\n');

    // 检查用户
    console.log('=== 用户数据 ===');
    const users = await User.find({});
    console.log(`总数: ${users.length}`);
    users.forEach(user => {
      console.log(`- userId: ${user.userId}, username: ${user.username}`);
    });

    // 检查购物车
    console.log('\n=== 购物车数据 ===');
    const carts = await Cart.find({});
    console.log(`总数: ${carts.length}`);
    
    if (carts.length === 0) {
      console.log('⚠️  购物车为空');
    } else {
      for (const cart of carts) {
        console.log(`\n购物车项 ${cart.cartId}:`);
        console.log(`  userId: ${cart.userId}`);
        console.log(`  productId: ${cart.productId}`);
        console.log(`  quantity: ${cart.quantity}`);
        console.log(`  selected: ${cart.selected}`);
        
        // 查找对应的商品
        const product = await Product.findOne({ productId: cart.productId });
        if (product) {
          console.log(`  ✓ 商品存在: ${product.name}`);
          console.log(`    价格: ¥${product.price}`);
          console.log(`    库存: ${product.stock}`);
          console.log(`    状态: ${product.status === 1 ? '上架' : '下架'}`);
        } else {
          console.log(`  ✗ 商品不存在 (productId: ${cart.productId})`);
        }
      }
    }

    // 检查商品
    console.log('\n=== 商品数据 ===');
    const products = await Product.find({});
    console.log(`总数: ${products.length}`);
    products.forEach(product => {
      console.log(`- productId: ${product.productId}, name: ${product.name}, price: ¥${product.price}, status: ${product.status}`);
    });

    // 检查数据关联问题
    console.log('\n=== 数据关联检查 ===');
    const orphanedCarts = [];
    for (const cart of carts) {
      const product = await Product.findOne({ productId: cart.productId });
      if (!product) {
        orphanedCarts.push(cart);
      }
    }

    if (orphanedCarts.length > 0) {
      console.log(`⚠️  发现 ${orphanedCarts.length} 个购物车项的商品不存在`);
      orphanedCarts.forEach(cart => {
        console.log(`  - cartId: ${cart.cartId}, productId: ${cart.productId}`);
      });
    } else if (carts.length > 0) {
      console.log('✅ 所有购物车项的商品都存在');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ 检查失败:', error);
    process.exit(1);
  }
}

checkCart();
