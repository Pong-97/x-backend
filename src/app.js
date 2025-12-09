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
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:3000', 'https://lyaftwgtwyqr.sealosbja.site'];

app.use(cors({
  origin: function (origin, callback) {
    // console.log('收到的 Origin:', origin);
    // console.log('允许的 Origins:', allowedOrigins);
    // 允许没有 origin 的请求（如移动应用或 curl）
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // console.log('CORS 被拒绝 - Origin 不在允许列表中');
      callback(new Error('Not allowed by CORS'));
    }
  },
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
