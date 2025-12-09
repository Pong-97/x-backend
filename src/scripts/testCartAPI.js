/**
 * 测试购物车API
 * 运行: node src/scripts/testCartAPI.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');

async function testCartAPI() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || 'ecommerce',
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('数据库连接成功\n');

    // 获取测试用户
    const user = await User.findOne({ username: 'testuser' });
    if (!user) {
      console.log('❌ 测试用户不存在');
      process.exit(1);
    }

    console.log('=== 模拟 getCartList 接口 ===');
    console.log(`用户ID: ${user.userId}\n`);

    // 模拟 getCartList 逻辑
    const carts = await Cart.find({ userId: user.userId }).select('-_id -__v');
    console.log(`找到 ${carts.length} 个购物车项\n`);

    // 关联查询商品信息
    const cartList = await Promise.all(
      carts.map(async (cart) => {
        console.log(`处理购物车项 ${cart.cartId}:`);
        console.log(`  查找 productId: ${cart.productId}`);
        
        const product = await Product.findOne({ productId: cart.productId });
        
        if (!product) {
          console.log(`  ✗ 商品不存在\n`);
          return null;
        }

        console.log(`  ✓ 找到商品: ${product.name}`);
        console.log(`  商品信息:`);
        console.log(`    name: ${product.name}`);
        console.log(`    image: ${product.image}`);
        console.log(`    price: ${product.price}`);
        console.log(`    stock: ${product.stock}\n`);

        return {
          id: cart.cartId,
          productId: cart.productId,
          productName: product.name,
          productImage: product.image,
          price: product.price,
          quantity: cart.quantity,
          selected: cart.selected,
          stock: product.stock
        };
      })
    );

    // 过滤掉商品不存在的项
    const validCartList = cartList.filter(item => item !== null);

    console.log('=== 最终返回数据 ===');
    console.log(JSON.stringify(validCartList, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  }
}

testCartAPI();
