# 项目启动指南

## 一、环境准备

### 1. 确认 Node.js 版本
```bash
node --version  # 建议 v16+ 或 v18+
npm --version
```

### 2. 确认 MongoDB 连接
确保 MongoDB 服务可访问：
```
mongodb://root:9bpm8zf4@x-db-mongodb.ns-rpjorlyu.svc:27017
```

## 二、项目安装

### 1. 安装依赖
```bash
npm install
```

安装的主要依赖包括：
- `express` - Web 框架
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT 认证
- `bcryptjs` - 密码加密
- `cors` - 跨域支持
- `dotenv` - 环境变量管理
- `nodemon` - 开发热重载（开发依赖）

### 2. 配置环境变量

`.env` 文件已创建，包含以下配置：
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://root:9bpm8zf4@x-db-mongodb.ns-rpjorlyu.svc:27017
DB_NAME=ecommerce
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

**重要**: 生产环境请修改 `JWT_SECRET` 为强密码！

## 三、启动项目

### 方式一：开发模式（推荐）
```bash
npm run dev
```
使用 nodemon 自动监听文件变化并重启服务。

### 方式二：生产模式
```bash
npm start
```

### 启动成功标志
看到以下输出表示启动成功：
```
MongoDB 连接成功: x-db-mongodb.ns-rpjorlyu.svc
数据库名称: ecommerce
服务器运行在端口 3000
环境: development
```

## 四、初始化测试数据（可选）

### 1. 运行数据初始化脚本
```bash
npm run seed
```

这将创建：
- 测试用户: `testuser` / `123456`
- 4个商品分类
- 3个测试商品
- 2个轮播图

### 2. 验证数据
启动服务后访问：
```bash
# 获取首页数据
curl http://localhost:3000/home

# 获取商品列表
curl http://localhost:3000/product/list

# 获取分类列表
curl http://localhost:3000/category/list
```

## 五、测试接口

### 1. 健康检查
```bash
curl http://localhost:3000/health
```

预期响应：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "status": "ok",
    "timestamp": "2024-12-08T..."
  }
}
```

### 2. 用户注册
```bash
curl -X POST http://localhost:3000/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "demo",
    "password": "123456",
    "email": "demo@example.com"
  }'
```

### 3. 用户登录
```bash
curl -X POST http://localhost:3000/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "demo",
    "password": "123456"
  }'
```

保存返回的 `token`，后续需要认证的接口都需要携带。

### 4. 获取用户信息（需要 token）
```bash
curl http://localhost:3000/user/info \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. 获取商品列表
```bash
# 基本查询
curl http://localhost:3000/product/list

# 带参数查询
curl "http://localhost:3000/product/list?page=1&pageSize=10&sortBy=sales&order=desc"

# 按分类查询
curl "http://localhost:3000/product/list?categoryId=1"
```

### 6. 搜索商品
```bash
curl "http://localhost:3000/product/search?keyword=iPhone&page=1&pageSize=10"
```

### 7. 添加到购物车（需要 token）
```bash
curl -X POST http://localhost:3000/cart/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "productId": 1001,
    "quantity": 2
  }'
```

## 六、项目结构说明

```
project/
├── src/
│   ├── app.js                    # 应用入口
│   ├── config/
│   │   └── database.js           # 数据库配置和连接
│   ├── controllers/              # 业务逻辑控制器
│   │   ├── userController.js     # 用户相关
│   │   ├── productController.js  # 商品相关
│   │   ├── categoryController.js # 分类相关
│   │   ├── cartController.js     # 购物车相关
│   │   ├── orderController.js    # 订单相关
│   │   ├── addressController.js  # 地址相关
│   │   └── homeController.js     # 首页相关
│   ├── models/                   # Mongoose 数据模型
│   │   ├── Counter.js            # 自增ID计数器
│   │   ├── User.js               # 用户模型
│   │   ├── Product.js            # 商品模型
│   │   ├── Category.js           # 分类模型
│   │   ├── Cart.js               # 购物车模型
│   │   ├── Order.js              # 订单模型
│   │   ├── OrderItem.js          # 订单商品模型
│   │   ├── Address.js            # 地址模型
│   │   └── Banner.js             # 轮播图模型
│   ├── routes/                   # 路由定义
│   │   ├── user.js               # 用户路由
│   │   ├── product.js            # 商品路由
│   │   ├── category.js           # 分类路由
│   │   ├── cart.js               # 购物车路由
│   │   ├── order.js              # 订单路由
│   │   ├── address.js            # 地址路由
│   │   └── home.js               # 首页路由
│   ├── middleware/               # 中间件
│   │   ├── auth.js               # JWT 认证中间件
│   │   ├── responseFormatter.js  # 统一响应格式
│   │   └── errorHandler.js       # 全局错误处理
│   ├── utils/                    # 工具函数
│   │   ├── validator.js          # 数据验证
│   │   └── helpers.js            # 辅助函数
│   └── scripts/                  # 脚本
│       └── seedData.js           # 测试数据初始化
├── .env                          # 环境变量
├── .gitignore                    # Git 忽略文件
├── package.json                  # 项目配置
├── README_BACKEND.md             # 后端文档
└── SETUP.md                      # 本文件
```

## 七、API 接口概览

### 用户模块 `/user`
- `POST /user/register` - 注册
- `POST /user/login` - 登录
- `GET /user/info` - 获取信息 🔒
- `POST /user/update` - 更新信息 🔒

### 商品模块 `/product`
- `GET /product/list` - 商品列表
- `GET /product/:id` - 商品详情
- `GET /product/search` - 搜索商品

### 分类模块 `/category`
- `GET /category/list` - 分类列表（树形）

### 购物车模块 `/cart` 🔒
- `GET /cart/list` - 购物车列表
- `POST /cart/add` - 添加商品
- `POST /cart/update` - 更新商品
- `DELETE /cart/delete/:id` - 删除商品

### 订单模块 `/order` 🔒
- `POST /order/create` - 创建订单
- `GET /order/list` - 订单列表
- `GET /order/:id` - 订单详情
- `POST /order/cancel/:id` - 取消订单
- `POST /order/confirm/:id` - 确认收货
- `DELETE /order/delete/:id` - 删除订单

### 地址模块 `/address` 🔒
- `GET /address/list` - 地址列表
- `POST /address/add` - 添加地址
- `POST /address/update/:id` - 更新地址
- `DELETE /address/delete/:id` - 删除地址
- `POST /address/setDefault/:id` - 设置默认

### 首页模块 `/home`
- `GET /home` - 首页数据（轮播图、分类、热门、新品）

🔒 = 需要 JWT Token 认证

## 八、常见问题

### 1. MongoDB 连接失败
**问题**: `MongoDB 连接失败: connect ECONNREFUSED`

**解决**:
- 检查 MongoDB 服务是否运行
- 确认连接字符串是否正确
- 检查网络连接和防火墙设置

### 2. Token 验证失败
**问题**: `Token 无效` 或 `未授权`

**解决**:
- 确认请求头格式: `Authorization: Bearer <token>`
- 检查 token 是否过期（默认 7 天）
- 重新登录获取新 token

### 3. 端口被占用
**问题**: `Error: listen EADDRINUSE: address already in use :::3000`

**解决**:
```bash
# 查找占用端口的进程
lsof -i :3000

# 杀死进程
kill -9 <PID>

# 或修改 .env 中的 PORT
```

### 4. 依赖安装失败
**问题**: `npm install` 报错

**解决**:
```bash
# 清除缓存
npm cache clean --force

# 删除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

## 九、开发建议

### 1. 使用 Postman 测试
推荐使用 Postman 或类似工具测试 API：
- 创建环境变量存储 token
- 保存常用请求
- 使用集合组织接口

### 2. 查看日志
服务器会输出详细的日志信息：
- 请求信息
- 错误堆栈
- 数据库操作

### 3. 代码热重载
开发模式下使用 `npm run dev`，修改代码后自动重启。

### 4. 数据库管理
推荐使用 MongoDB Compass 或 Studio 3T 管理数据库。

## 十、部署建议

### 生产环境配置
1. 修改 `JWT_SECRET` 为强密码
2. 设置 `NODE_ENV=production`
3. 配置 MongoDB 副本集
4. 启用 HTTPS
5. 配置反向代理（Nginx）
6. 设置进程管理（PM2）

### 使用 PM2 部署
```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start src/app.js --name ecommerce-api

# 查看状态
pm2 status

# 查看日志
pm2 logs ecommerce-api

# 重启
pm2 restart ecommerce-api
```

## 十一、下一步

1. ✅ 启动项目
2. ✅ 初始化测试数据
3. ✅ 测试基本接口
4. 🔄 连接前端项目
5. 🔄 完善业务逻辑
6. 🔄 添加更多功能

## 技术支持

如有问题，请查看：
- `README_BACKEND.md` - 详细的 API 文档
- `api.md` - 接口规范文档
- `mongodb-design.md` - 数据库设计文档

---

**祝开发顺利！** 🚀
