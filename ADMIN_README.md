# 电商系统管理端后台

## 概述

这是电商系统的管理端后台 API，提供完整的后台管理功能，包括用户管理、商品管理、订单管理、分类管理、操作日志等核心模块。

## 功能特性

### ✅ 已实现的 P0 核心功能

1. **管理员认证模块**
   - 管理员登录/登出
   - JWT Token 认证
   - 密码修改
   - 登录限流保护（15分钟5次）

2. **权限控制模块**
   - 独立的管理员认证中间件
   - Token 验证与账号状态检查
   - 管理员默认拥有全部权限

3. **操作日志模块**
   - 自动记录敏感操作
   - 日志查询与筛选
   - 操作统计分析

4. **用户管理**
   - 用户列表（分页、搜索、筛选）
   - 用户详情（含订单统计）
   - 用户状态控制（启用/禁用）
   - 用户统计数据

5. **商品管理**
   - 商品 CRUD 操作
   - 批量上下架
   - 库存预警
   - 商品统计（热销榜、低库存）

6. **订单管理**
   - 订单列表与详情
   - 订单状态流转控制
   - 订单发货
   - 订单取消
   - 订单统计与趋势分析

7. **分类管理**
   - 分类 CRUD 操作
   - 商品数量统计
   - 删除保护（有商品时不可删除）

8. **地址管理**
   - 查看用户地址列表
   - 地址详情查询

## 技术架构

### 核心技术栈
- **Node.js** + **Express** - 后端框架
- **MongoDB** + **Mongoose** - 数据库
- **JWT** - 身份认证
- **bcryptjs** - 密码加密
- **express-rate-limit** - 登录限流
- **moment** - 日期处理

### 项目结构

```
src/
├── models/
│   ├── Admin.js              # 管理员模型
│   └── AdminLog.js           # 操作日志模型
├── middleware/
│   ├── adminAuth.js          # 管理员认证中间件
│   └── operationLog.js       # 操作日志记录中间件
├── controllers/admin/
│   ├── authController.js     # 认证控制器
│   ├── userManageController.js
│   ├── productManageController.js
│   ├── orderManageController.js
│   ├── categoryManageController.js
│   ├── addressManageController.js
│   └── logController.js
└── routes/admin/
    ├── index.js              # 路由汇总
    ├── auth.js
    ├── user.js
    ├── product.js
    ├── order.js
    ├── category.js
    ├── address.js
    └── log.js
```

## 快速开始

### 1. 环境配置

在 `.env` 文件中添加管理端配置：

```bash
# 管理端 JWT 配置（必须与用户端不同）
ADMIN_JWT_SECRET=your-admin-secret-key-must-be-different
ADMIN_JWT_EXPIRES_IN=2h

# 限流配置
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 2. 初始化管理员账号

```bash
npm run init-admin
```

**默认账号信息**：
- 用户名: `admin`
- 密码: `Admin@123456`

⚠️ **重要**: 首次登录后请立即修改默认密码！

### 3. 启动服务

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

服务将在 `http://localhost:3000` 启动，管理端接口前缀为 `/admin`

## API 接口

详细的 API 文档请查看 [ADMIN_API.md](./ADMIN_API.md)

### 接口概览

| 模块 | 路由前缀 | 接口数量 |
|------|---------|---------|
| 认证 | `/admin/auth` | 4 |
| 用户管理 | `/admin/user` | 4 |
| 商品管理 | `/admin/product` | 7 |
| 订单管理 | `/admin/order` | 6 |
| 分类管理 | `/admin/category` | 4 |
| 地址管理 | `/admin/address` | 2 |
| 操作日志 | `/admin/log` | 3 |

**总计**: 30+ 个管理端接口

## 使用示例

### 1. 管理员登录

```bash
curl -X POST http://localhost:3000/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin@123456"
  }'
```

**响应**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "adminId": 1,
      "username": "admin",
      "realName": "超级管理员"
    }
  }
}
```

### 2. 获取用户列表

```bash
curl -X GET "http://localhost:3000/admin/user/list?page=1&size=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. 修改用户状态

```bash
curl -X PUT http://localhost:3000/admin/user/1/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": 0}'
```

### 4. 订单发货

```bash
curl -X POST http://localhost:3000/admin/order/1/deliver \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "expressCompany": "顺丰速运",
    "expressNo": "SF1234567890"
  }'
```

## 安全机制

### 1. 认证安全
- ✅ 独立的 JWT Secret（与用户端隔离）
- ✅ Token 过期时间：2小时
- ✅ 登录限流：15分钟内最多5次尝试
- ✅ 账号状态检查

### 2. 操作安全
- ✅ 所有敏感操作自动记录日志
- ✅ 操作日志包含：管理员、操作类型、目标对象、IP、时间
- ✅ 订单状态流转验证
- ✅ 分类删除保护

### 3. 数据安全
- ✅ 密码字段永不返回
- ✅ bcrypt 加密存储
- ✅ 参数验证
- ✅ SQL 注入防护（Mongoose）

## 数据模型

### Admin（管理员）
```javascript
{
  adminId: Number,        // 自增ID
  username: String,       // 用户名（唯一）
  password: String,       // 密码（bcrypt加密）
  realName: String,       // 真实姓名
  email: String,          // 邮箱
  phone: String,          // 手机号
  avatar: String,         // 头像
  status: Number,         // 状态（1-正常，0-禁用）
  lastLoginAt: Date,      // 最后登录时间
  lastLoginIp: String,    // 最后登录IP
  createdAt: Date,
  updatedAt: Date
}
```

### AdminLog（操作日志）
```javascript
{
  logId: Number,          // 自增ID
  adminId: Number,        // 管理员ID
  adminName: String,      // 管理员用户名
  action: String,         // 操作类型（create/update/delete/login/logout）
  module: String,         // 模块（user/product/order/category）
  targetId: String,       // 操作对象ID
  content: String,        // 操作描述
  ip: String,             // IP地址
  userAgent: String,      // 浏览器信息
  createdAt: Date
}
```

## 常见问题

### Q1: 忘记管理员密码怎么办？
A: 删除数据库中的管理员记录，重新运行 `npm run init-admin`

### Q2: 如何添加更多管理员？
A: 当前版本需要手动在数据库中创建，后续版本会添加管理员管理功能

### Q3: Token 过期时间可以修改吗？
A: 可以，在 `.env` 中修改 `ADMIN_JWT_EXPIRES_IN` 参数

### Q4: 如何查看操作日志？
A: 使用 `/admin/log/list` 接口，支持按管理员、模块、操作类型筛选

### Q5: 订单状态流转规则是什么？
A: 
- 待付款(1) → 待发货(2) 或 已取消(5)
- 待发货(2) → 待收货(3) 或 已取消(5)
- 待收货(3) → 已完成(4)
- 已完成(4) 和 已取消(5) 为终态

## 后续扩展计划

### P1 优先级（重要）
- [ ] 轮播图管理
- [ ] 数据统计看板（Dashboard）
- [ ] 数据导出功能（Excel）

### P2 优先级（可选）
- [ ] 管理员账号管理（CRUD）
- [ ] 角色权限细分（RBAC）
- [ ] 优惠券系统
- [ ] 系统配置管理

## 开发规范

### 代码规范
- 使用 async/await 处理异步
- 统一错误处理
- 参数验证
- 注释清晰

### 日志规范
- 敏感操作必须记录日志
- 日志内容包含关键信息
- 异步记录，不阻塞响应

### 接口规范
- RESTful 风格
- 统一响应格式
- HTTP 状态码语义化

## 贡献指南

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

ISC

## 联系方式

如有问题或建议，请提交 Issue。
