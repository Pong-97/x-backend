/**
 * 测试购物车HTTP API
 * 运行: node src/scripts/testCartHTTP.js
 */

require('dotenv').config();
const jwt = require('jsonwebtoken');

async function testCartHTTP() {
  try {
    // 生成测试用户的token
    const token = jwt.sign(
      { userId: 1, username: 'testuser' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    console.log('=== 测试购物车API ===');
    console.log(`Token: ${token}\n`);

    // 调用购物车列表API
    const response = await fetch('http://localhost:3000/cart/list', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    console.log('=== API响应 ===');
    console.log(`状态码: ${response.status}`);
    console.log(`响应数据:`);
    console.log(JSON.stringify(data, null, 2));

    if (data.code === 200 && data.data && data.data.length > 0) {
      console.log('\n=== 购物车商品详情 ===');
      data.data.forEach((item, index) => {
        console.log(`\n商品 ${index + 1}:`);
        console.log(`  id: ${item.id}`);
        console.log(`  productId: ${item.productId}`);
        console.log(`  productName: ${item.productName}`);
        console.log(`  productImage: ${item.productImage}`);
        console.log(`  price: ¥${item.price}`);
        console.log(`  quantity: ${item.quantity}`);
        console.log(`  selected: ${item.selected}`);
        console.log(`  stock: ${item.stock}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    process.exit(1);
  }
}

testCartHTTP();
