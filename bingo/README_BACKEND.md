# 电商系统后端 API

基于 Node.js + Express + MongoDB 的电商系统后端服务。

## 项目结构

```
project/
├── src/
│   ├── app.js                 # 应用入口
│   ├── config/
│   │   └── database.js        # 数据库配置
│   ├── controllers/           # 控制器
│   │   ├── userController.js
│   │   ├── productController.js
│   │   ├── categoryController.js
│   │   ├── cartController.js
│   │   ├── orderController.js
│   │   ├── addressController.js
│   │   └── homeController.js
│   ├── models/                # 数据模型
│   │   ├── Counter.js
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Category.js
│   │   ├── Cart.js
│   │   ├── Order.js
│   │   ├── OrderItem.js
│   │   ├── Address.js
│   │   └── Banner.js
│   ├── routes/                # 路由
│   │   ├── user.js
│   │   ├── product.js
│   │   ├── category.js
│   │   ├── cart.js
│   │   ├── order.js
│   │   ├── address.js
│   │   └── home.js
│   ├── middleware/            # 中间件
│   │   ├── auth.js
│   │   ├── responseFormatter.js
│   │   └── errorHandler.js
│   └── utils/                 # 工具函数
│       ├── validator.js
│       └── helpers.js
├── .env                       # 环境变量
├── .gitignore
├── package.json
└── README_BACKEND.md
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

编辑 `.env` 文件，配置以下参数：

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://root:9bpm8zf4@x-db-mongodb.ns-rpjorlyu.svc:27017
DB_NAME=ecommerce
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

### 3. 启动服务

开发模式（自动重启）：
```bash
npm run dev
```

生产模式：
```bash
npm start
```

服务将在 `http://localhost:3000` 启动。

## API 接口文档

### 通用响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

### 接口列表

#### 用户模块
- `POST /user/register` - 用户注册
- `POST /user/login` - 用户登录
- `GET /user/info` - 获取用户信息（需认证）
- `POST /user/update` - 更新用户信息（需认证）

#### 商品模块
- `GET /product/list` - 获取商品列表
- `GET /product/:id` - 获取商品详情
- `GET /product/search` - 搜索商品

#### 分类模块
- `GET /category/list` - 获取分类列表

#### 购物车模块（需认证）
- `GET /cart/list` - 获取购物车列表
- `POST /cart/add` - 添加到购物车
- `POST /cart/update` - 更新购物车
- `DELETE /cart/delete/:id` - 删除购物车商品

#### 订单模块（需认证）
- `POST /order/create` - 创建订单
- `GET /order/list` - 获取订单列表
- `GET /order/:id` - 获取订单详情
- `POST /order/cancel/:id` - 取消订单
- `POST /order/confirm/:id` - 确认收货
- `DELETE /order/delete/:id` - 删除订单

#### 地址模块（需认证）
- `GET /address/list` - 获取地址列表
- `POST /address/add` - 添加地址
- `POST /address/update/:id` - 更新地址
- `DELETE /address/delete/:id` - 删除地址
- `POST /address/setDefault/:id` - 设置默认地址

#### 首页模块
- `GET /home` - 获取首页数据

### 认证说明

需要认证的接口需要在请求头中携带 JWT Token：

```
Authorization: Bearer <token>
```

## 数据库说明

### 数据库连接

项目使用 MongoDB 数据库，连接信息在 `.env` 文件中配置。

### 数据库初始化

首次启动时，系统会自动：
1. 创建所有必要的集合
2. 初始化计数器（用于自增ID）
3. 创建索引

### 集合列表

- `users` - 用户集合
- `products` - 商品集合
- `categories` - 分类集合
- `cart` - 购物车集合
- `orders` - 订单集合
- `order_items` - 订单商品集合
- `addresses` - 地址集合
- `banners` - 轮播图集合
- `counters` - 自增ID计数器集合

## 主要功能

### 1. 用户认证
- 使用 bcryptjs 加密密码
- 使用 JWT 进行身份认证
- Token 有效期 7 天

### 2. 商品管理
- 商品列表分页查询
- 支持按分类、价格、销量排序
- 全文搜索功能
- 浏览量统计

### 3. 购物车
- 自动合并相同商品
- 库存检查
- 选中状态管理

### 4. 订单管理
- 事务处理确保数据一致性
- 自动扣减库存
- 订单状态流转
- 软删除机制

### 5. 地址管理
- 默认地址设置
- 地址验证

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权，需要登录 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 开发说明

### 添加新接口

1. 在 `models/` 中创建数据模型
2. 在 `controllers/` 中创建控制器
3. 在 `routes/` 中定义路由
4. 在 `app.js` 中注册路由

### 数据验证

使用 `utils/validator.js` 中的验证函数进行参数验证。

### 错误处理

所有错误会被 `middleware/errorHandler.js` 统一处理。

## 测试

可以使用 Postman 或其他 API 测试工具进行接口测试。

健康检查接口：
```
GET http://localhost:3000/health
```

## 注意事项

1. 生产环境请修改 `.env` 中的 `JWT_SECRET`
2. 建议配置 MongoDB 副本集以支持事务
3. 定期备份数据库
4. 监控服务器性能和日志

## 技术栈

- **Node.js** - JavaScript 运行环境
- **Express** - Web 框架
- **MongoDB** - NoSQL 数据库
- **Mongoose** - MongoDB ODM
- **JWT** - 身份认证
- **bcryptjs** - 密码加密
- **CORS** - 跨域资源共享

## License

ISC
