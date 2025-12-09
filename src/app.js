const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const responseFormatter = require('./middleware/responseFormatter');
const errorHandler = require('./middleware/errorHandler');

// 加载环境变量
dotenv.config();

// 创建 Express 应用
const app = express();

// 连接数据库
connectDB();

// 中间件
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(responseFormatter);

// 路由
app.use('/user', require('./routes/user'));
app.use('/product', require('./routes/product'));
app.use('/category', require('./routes/category'));
app.use('/cart', require('./routes/cart'));
app.use('/order', require('./routes/order'));
app.use('/address', require('./routes/address'));
app.use('/home', require('./routes/home'));

// 健康检查
app.get('/health', (req, res) => {
  res.success({ status: 'ok', timestamp: new Date() });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: '接口不存在',
    data: null
  });
});

// 错误处理中间件
app.use(errorHandler);

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
  console.log(`环境: ${process.env.NODE_ENV}`);
});

module.exports = app;
