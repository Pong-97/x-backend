# 项目验证清单

## 📋 安装验证

- [ ] Node.js 已安装 (v16+)
- [ ] npm 已安装
- [ ] MongoDB 可访问
- [ ] 项目依赖已安装 (`npm install`)
- [ ] 环境变量已配置 (`.env`)

## 📁 文件完整性检查

### 核心文件
- [x] `package.json` - 项目配置
- [x] `.env` - 环境变量
- [x] `.gitignore` - Git 忽略配置
- [x] `src/app.js` - 应用入口

### 配置文件
- [x] `src/config/database.js` - 数据库配置

### 数据模型 (9个)
- [x] `src/models/Counter.js`
- [x] `src/models/User.js`
- [x] `src/models/Product.js`
- [x] `src/models/Category.js`
- [x] `src/models/Cart.js`
- [x] `src/models/Order.js`
- [x] `src/models/OrderItem.js`
- [x] `src/models/Address.js`
- [x] `src/models/Banner.js`

### 控制器 (7个)
- [x] `src/controllers/userController.js`
- [x] `src/controllers/productController.js`
- [x] `src/controllers/categoryController.js`
- [x] `src/controllers/cartController.js`
- [x] `src/controllers/orderController.js`
- [x] `src/controllers/addressController.js`
- [x] `src/controllers/homeController.js`

### 路由 (7个)
- [x] `src/routes/user.js`
- [x] `src/routes/product.js`
- [x] `src/routes/category.js`
- [x] `src/routes/cart.js`
- [x] `src/routes/order.js`
- [x] `src/routes/address.js`
- [x] `src/routes/home.js`

### 中间件 (3个)
- [x] `src/middleware/auth.js`
- [x] `src/middleware/responseFormatter.js`
- [x] `src/middleware/errorHandler.js`

### 工具函数 (2个)
- [x] `src/utils/validator.js`
- [x] `src/utils/helpers.js`

### 脚本
- [x] `src/scripts/seedData.js`
- [x] `start.sh`

### 文档
- [x] `README_BACKEND.md`
- [x] `SETUP.md`
- [x] `PROJECT_SUMMARY.md`
- [x] `CHECKLIST.md`
- [x] `api.md`
- [x] `mongodb-design.md`
- [x] `postman_collection.json`

## 🚀 启动测试

### 1. 基础启动
```bash
npm run dev
```
- [ ] 服务启动成功
- [ ] 显示 "MongoDB 连接成功"
- [ ] 显示 "服务器运行在端口 3000"
- [ ] 无错误信息

### 2. 健康检查
```bash
curl http://localhost:3000/health
```
- [ ] 返回 200 状态码
- [ ] 返回 JSON 格式数据
- [ ] 包含 status 和 timestamp

## 🧪 功能测试

### 用户模块

#### 注册
```bash
curl -X POST http://localhost:3000/user/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test1","password":"123456","email":"test1@example.com"}'
```
- [ ] 返回 code: 200
- [ ] 返回 userId
- [ ] 重复注册返回错误

#### 登录
```bash
curl -X POST http://localhost:3000/user/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test1","password":"123456"}'
```
- [ ] 返回 code: 200
- [ ] 返回 token
- [ ] 返回 userInfo
- [ ] 错误密码返回 400

#### 获取用户信息
```bash
curl http://localhost:3000/user/info \
  -H "Authorization: Bearer YOUR_TOKEN"
```
- [ ] 返回用户信息
- [ ] 不包含密码字段
- [ ] 无 token 返回 401

### 商品模块

#### 商品列表
```bash
curl http://localhost:3000/product/list
```
- [ ] 返回商品列表
- [ ] 包含分页信息
- [ ] 支持排序参数

#### 商品详情
```bash
curl http://localhost:3000/product/1001
```
- [ ] 返回商品详情
- [ ] 包含完整信息
- [ ] 不存在返回 404

#### 搜索商品
```bash
curl "http://localhost:3000/product/search?keyword=test"
```
- [ ] 返回搜索结果
- [ ] 支持模糊搜索
- [ ] 空关键词返回错误

### 分类模块

#### 分类列表
```bash
curl http://localhost:3000/category/list
```
- [ ] 返回树形结构
- [ ] 包含子分类
- [ ] 按排序显示

### 购物车模块（需要 token）

#### 添加商品
```bash
curl -X POST http://localhost:3000/cart/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"productId":1001,"quantity":2}'
```
- [ ] 添加成功
- [ ] 返回 cartId
- [ ] 库存不足返回错误
- [ ] 自动合并相同商品

#### 获取购物车
```bash
curl http://localhost:3000/cart/list \
  -H "Authorization: Bearer YOUR_TOKEN"
```
- [ ] 返回购物车列表
- [ ] 包含商品信息
- [ ] 显示库存状态

#### 更新购物车
```bash
curl -X POST http://localhost:3000/cart/update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"cartId":1,"quantity":3}'
```
- [ ] 更新成功
- [ ] 库存检查生效
- [ ] 权限验证正常

#### 删除商品
```bash
curl -X DELETE http://localhost:3000/cart/delete/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```
- [ ] 删除成功
- [ ] 权限验证正常

### 地址模块（需要 token）

#### 添加地址
```bash
curl -X POST http://localhost:3000/address/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name":"张三",
    "phone":"13800138000",
    "province":"广东省",
    "city":"深圳市",
    "district":"南山区",
    "detail":"科技园",
    "isDefault":true
  }'
```
- [ ] 添加成功
- [ ] 返回 addressId
- [ ] 参数验证生效
- [ ] 默认地址处理正确

#### 获取地址列表
```bash
curl http://localhost:3000/address/list \
  -H "Authorization: Bearer YOUR_TOKEN"
```
- [ ] 返回地址列表
- [ ] 默认地址在前
- [ ] 数据完整

### 订单模块（需要 token）

#### 创建订单
```bash
curl -X POST http://localhost:3000/order/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"addressId":1,"cartIds":[1,2],"remark":"测试"}'
```
- [ ] 创建成功
- [ ] 返回订单号
- [ ] 库存扣减正确
- [ ] 购物车清空
- [ ] 地址快照保存

#### 获取订单列表
```bash
curl "http://localhost:3000/order/list?status=0&page=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
- [ ] 返回订单列表
- [ ] 状态筛选生效
- [ ] 分页正常

#### 取消订单
```bash
curl -X POST http://localhost:3000/order/cancel/10001 \
  -H "Authorization: Bearer YOUR_TOKEN"
```
- [ ] 取消成功
- [ ] 库存恢复
- [ ] 状态验证生效

### 首页模块

#### 首页数据
```bash
curl http://localhost:3000/home
```
- [ ] 返回完整数据
- [ ] 包含轮播图
- [ ] 包含分类
- [ ] 包含热门商品
- [ ] 包含新品

## 🔒 安全测试

- [ ] 密码正确加密存储
- [ ] Token 验证生效
- [ ] 无 token 访问受保护接口返回 401
- [ ] 错误 token 返回 401
- [ ] 过期 token 返回 401
- [ ] 跨用户操作被拒绝

## 📊 数据库验证

### 连接测试
- [ ] MongoDB 连接成功
- [ ] 数据库创建成功
- [ ] 集合自动创建

### 索引验证
```javascript
// 在 MongoDB shell 中执行
db.users.getIndexes()
db.products.getIndexes()
db.orders.getIndexes()
```
- [ ] 唯一索引创建成功
- [ ] 复合索引创建成功
- [ ] 文本索引创建成功

### 计数器验证
```javascript
db.counters.find()
```
- [ ] 所有计数器已初始化
- [ ] 自增 ID 正常工作

## 🐛 错误处理测试

- [ ] 参数缺失返回 400
- [ ] 参数格式错误返回 400
- [ ] 资源不存在返回 404
- [ ] 权限不足返回 403
- [ ] 服务器错误返回 500
- [ ] 错误信息清晰明确

## 📈 性能测试

- [ ] 商品列表查询速度 < 100ms
- [ ] 订单创建速度 < 500ms
- [ ] 并发请求正常处理
- [ ] 内存使用稳定

## 📝 代码质量

- [ ] 代码结构清晰
- [ ] 命名规范统一
- [ ] 注释完整
- [ ] 无明显冗余
- [ ] 错误处理完善

## 🎯 完成标准

所有测试项通过后，项目即可投入使用：

- ✅ 所有文件完整
- ✅ 服务正常启动
- ✅ 所有接口可用
- ✅ 数据库正常
- ✅ 安全机制生效
- ✅ 错误处理完善

---

## 快速验证命令

```bash
# 1. 安装依赖
npm install

# 2. 初始化数据
npm run seed

# 3. 启动服务
npm run dev

# 4. 测试健康检查
curl http://localhost:3000/health

# 5. 测试首页
curl http://localhost:3000/home

# 6. 测试登录
curl -X POST http://localhost:3000/user/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"123456"}'
```

全部成功即表示项目就绪！✅
