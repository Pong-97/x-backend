const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || 'ecommerce',
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB 连接成功: ${conn.connection.host}`);
    console.log(`数据库名称: ${conn.connection.name}`);

    // 初始化计数器
    await initializeCounters();
  } catch (error) {
    console.error(`MongoDB 连接失败: ${error.message}`);
    process.exit(1);
  }
};

// 初始化计数器集合
async function initializeCounters() {
  const Counter = require('../models/Counter');
  
  const counters = [
    { _id: 'users', sequence_value: 0 },
    { _id: 'products', sequence_value: 1000 },
    { _id: 'categories', sequence_value: 0 },
    { _id: 'cart', sequence_value: 0 },
    { _id: 'orders', sequence_value: 10000 },
    { _id: 'order_items', sequence_value: 0 },
    { _id: 'addresses', sequence_value: 0 },
    { _id: 'banners', sequence_value: 0 }
  ];

  for (const counter of counters) {
    await Counter.findByIdAndUpdate(
      counter._id,
      { $setOnInsert: counter },
      { upsert: true, new: true }
    );
  }
}

module.exports = connectDB;
