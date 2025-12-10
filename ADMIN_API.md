# 管理端 API 文档

## 基础信息

- **Base URL**: `http://localhost:3000/admin`
- **认证方式**: Bearer Token (JWT)
- **Token 位置**: Header `Authorization: Bearer <token>`

## 认证模块 `/admin/auth`

### 1. 管理员登录
```
POST /admin/auth/login
```

**请求体**:
```json
{
  "username": "admin",
  "password": "Admin@123456"
}
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
      "realName": "超级管理员",
      "email": "admin@example.com"
    }
  }
}
```

### 2. 获取当前管理员信息
```
GET /admin/auth/info
Headers: Authorization: Bearer <token>
```

### 3. 管理员登出
```
POST /admin/auth/logout
Headers: Authorization: Bearer <token>
```

### 4. 修改密码
```
POST /admin/auth/change-password
Headers: Authorization: Bearer <token>
```

**请求体**:
```json
{
  "oldPassword": "Admin@123456",
  "newPassword": "NewPassword@123"
}
```

---

## 用户管理模块 `/admin/user`

### 1. 获取用户列表
```
GET /admin/user/list?page=1&size=20&keyword=&status=&startDate=&endDate=
```

**查询参数**:
- `page`: 页码（默认1）
- `size`: 每页数量（默认20，最大100）
- `keyword`: 搜索关键词（用户名/邮箱/手机号）
- `status`: 状态筛选（0-禁用，1-启用）
- `startDate`: 开始日期（YYYY-MM-DD）
- `endDate`: 结束日期（YYYY-MM-DD）

### 2. 获取用户详情
```
GET /admin/user/:userId
```

### 3. 修改用户状态
```
PUT /admin/user/:userId/status
```

**请求体**:
```json
{
  "status": 0  // 0-禁用，1-启用
}
```

### 4. 获取用户统计数据
```
GET /admin/user/statistics
```

---

## 商品管理模块 `/admin/product`

### 1. 获取商品列表
```
GET /admin/product/list?page=1&size=20&keyword=&categoryId=&status=&minPrice=&maxPrice=&lowStock=
```

**查询参数**:
- `page`: 页码
- `size`: 每页数量
- `keyword`: 搜索关键词（商品名称/描述）
- `categoryId`: 分类ID
- `status`: 状态（0-下架，1-上架）
- `minPrice`: 最低价格
- `maxPrice`: 最高价格
- `lowStock`: 是否只显示低库存（true/false）

### 2. 获取商品详情
```
GET /admin/product/:productId
```

### 3. 创建商品
```
POST /admin/product
```

**请求体**:
```json
{
  "name": "商品名称",
  "price": 99.99,
  "originalPrice": 199.99,
  "image": "图片URL",
  "images": ["图片1", "图片2"],
  "description": "商品描述",
  "detail": "详细信息",
  "stock": 100,
  "categoryId": 1,
  "specs": [
    { "name": "颜色", "value": "红色" }
  ],
  "status": 1,
  "sort": 0
}
```

### 4. 更新商品
```
PUT /admin/product/:productId
```

### 5. 删除商品
```
DELETE /admin/product/:productId
```

### 6. 批量上下架
```
POST /admin/product/batch/status
```

**请求体**:
```json
{
  "productIds": [1, 2, 3],
  "status": 1  // 0-下架，1-上架
}
```

### 7. 获取商品统计数据
```
GET /admin/product/statistics
```

---

## 订单管理模块 `/admin/order`

### 1. 获取订单列表
```
GET /admin/order/list?page=1&size=20&keyword=&status=&userId=&startDate=&endDate=
```

**查询参数**:
- `keyword`: 订单号搜索
- `status`: 订单状态（1-待付款，2-待发货，3-待收货，4-已完成，5-已取消）
- `userId`: 用户ID筛选

### 2. 获取订单详情
```
GET /admin/order/:orderId
```

### 3. 更新订单状态
```
PUT /admin/order/:orderId/status
```

**请求体**:
```json
{
  "status": 2  // 新状态
}
```

**状态流转规则**:
- 待付款(1) → 待发货(2) 或 已取消(5)
- 待发货(2) → 待收货(3) 或 已取消(5)
- 待收货(3) → 已完成(4)

### 4. 订单发货
```
POST /admin/order/:orderId/deliver
```

**请求体**:
```json
{
  "expressCompany": "顺丰速运",
  "expressNo": "SF1234567890"
}
```

### 5. 取消订单
```
POST /admin/order/:orderId/cancel
```

**请求体**:
```json
{
  "reason": "取消原因"
}
```

### 6. 获取订单统计数据
```
GET /admin/order/statistics
```

---

## 分类管理模块 `/admin/category`

### 1. 获取分类列表
```
GET /admin/category/list
```

### 2. 创建分类
```
POST /admin/category
```

**请求体**:
```json
{
  "name": "分类名称",
  "icon": "图标URL",
  "image": "图片URL",
  "sort": 0
}
```

### 3. 更新分类
```
PUT /admin/category/:categoryId
```

### 4. 删除分类
```
DELETE /admin/category/:categoryId
```

**注意**: 分类下有商品时无法删除

---

## 地址管理模块 `/admin/address`

### 1. 获取地址列表（按用户）
```
GET /admin/address/list?userId=1
```

### 2. 获取地址详情
```
GET /admin/address/:addressId
```

---

## 操作日志模块 `/admin/log`

### 1. 获取操作日志列表
```
GET /admin/log/list?page=1&size=20&adminId=&module=&action=&startDate=&endDate=
```

**查询参数**:
- `adminId`: 管理员ID
- `module`: 模块（user/product/order/category/admin）
- `action`: 操作类型（create/update/delete/login/logout/status）
- `startDate`: 开始日期
- `endDate`: 结束日期

### 2. 获取日志详情
```
GET /admin/log/:logId
```

### 3. 获取日志统计
```
GET /admin/log/statistics
```

---

## 响应格式

### 成功响应
```json
{
  "code": 200,
  "message": "操作成功",
  "data": { ... }
}
```

### 错误响应
```json
{
  "code": 400/401/403/404/500,
  "message": "错误信息",
  "data": null
}
```

### 分页响应
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [...],
    "pagination": {
      "page": 1,
      "size": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

---

## 错误码说明

- `200`: 成功
- `400`: 请求参数错误
- `401`: 未认证或Token过期
- `403`: 无权限访问
- `404`: 资源不存在
- `429`: 请求过于频繁（登录限流）
- `500`: 服务器内部错误

---

## 安全说明

1. **Token过期时间**: 2小时（可在.env中配置）
2. **登录限流**: 15分钟内最多5次登录尝试
3. **密码要求**: 最少6位（建议8位以上，包含字母数字）
4. **操作日志**: 所有敏感操作自动记录

---

## 初始化步骤

1. 安装依赖: `npm install`
2. 配置环境变量: 复制 `.env.example` 到 `.env` 并配置
3. 初始化管理员: `npm run init-admin`
4. 启动服务: `npm run dev`
5. 使用默认账号登录: `admin / Admin@123456`
6. **立即修改默认密码**
