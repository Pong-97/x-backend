# MongoDB 数据库设计文档

## 项目信息
- **项目名称**: 电商系统
- **数据库类型**: MongoDB
- **连接字符串**: `mongodb://root:9bpm8zf4@x-db-mongodb.ns-rpjorlyu.svc:27017`
- **数据库名称**: `ecommerce`

---

## 数据库架构概览

### 集合列表
1. `users` - 用户集合
2. `products` - 商品集合
3. `categories` - 分类集合
4. `cart` - 购物车集合
5. `orders` - 订单集合
6. `order_items` - 订单商品集合
7. `addresses` - 地址集合
8. `banners` - 轮播图集合
9. `counters` - 自增ID计数器集合

---

## 详细集合设计

### 1. users（用户集合）

**用途**: 存储用户账户信息和认证数据

**Schema 结构**:
```javascript
{
  _id: ObjectId,                    // MongoDB 主键
  userId: Number,                   // 业务用户ID（自增，从1开始）
  username: String,                 // 用户名，3-20字符
  password: String,                 // 密码（bcrypt加密，salt rounds: 10）
  email: String,                    // 邮箱（可选）
  phone: String,                    // 手机号（可选）
  avatar: String,                   // 头像URL，默认使用Gravatar
  status: Number,                   // 状态：1-正常，0-禁用
  createdAt: Date,                  // 创建时间
  updatedAt: Date,                  // 更新时间
  lastLoginAt: Date,                // 最后登录时间
  lastLoginIp: String               // 最后登录IP
}
```

**索引设计**:
```javascript
// 唯一索引
db.users.createIndex({ username: 1 }, { unique: true, name: "idx_username" })
db.users.createIndex({ email: 1 }, { unique: true, sparse: true, name: "idx_email" })
db.users.createIndex({ userId: 1 }, { unique: true, name: "idx_userId" })

// 查询索引
db.users.createIndex({ status: 1 }, { name: "idx_status" })
```

**字段约束**:
- `username`: 必填，唯一，3-20字符，只允许字母数字下划线
- `password`: 必填，存储加密后的哈希值
- `email`: 可选，如果提供则必须唯一且符合邮箱格式
- `status`: 默认值 1
- `createdAt`: 自动设置为当前时间
- `updatedAt`: 每次更新时自动更新

**示例数据**:
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  userId: 1,
  username: "zhangsan",
  password: "$2b$10$abcdefghijklmnopqrstuvwxyz123456",
  email: "zhangsan@example.com",
  phone: "13800138000",
  avatar: "https://www.gravatar.com/avatar/xxx",
  status: 1,
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-01-01T00:00:00Z"),
  lastLoginAt: ISODate("2024-12-08T10:00:00Z"),
  lastLoginIp: "192.168.1.100"
}
```

---

### 2. products（商品集合）

**用途**: 存储商品信息、库存和销售数据

**Schema 结构**:
```javascript
{
  _id: ObjectId,
  productId: Number,                // 商品ID（自增）
  name: String,                     // 商品名称
  price: Number,                    // 当前售价（单位：元）
  originalPrice: Number,            // 原价（单位：元）
  image: String,                    // 主图URL
  images: [String],                 // 商品图片数组（多图）
  description: String,              // 简短描述（用于列表展示）
  detail: String,                   // 详细描述（富文本HTML）
  stock: Number,                    // 库存数量
  sales: Number,                    // 销量统计
  views: Number,                    // 浏览次数
  categoryId: Number,               // 所属分类ID
  specs: [{                         // 商品规格数组
    name: String,                   // 规格名称（如：颜色、尺寸）
    value: String                   // 规格值（如：红色、XL）
  }],
  status: Number,                   // 状态：1-上架，0-下架
  sort: Number,                     // 排序权重（数字越大越靠前）
  createdAt: Date,                  // 创建时间
  updatedAt: Date                   // 更新时间
}
```

**索引设计**:
```javascript
// 唯一索引
db.products.createIndex({ productId: 1 }, { unique: true, name: "idx_productId" })

// 查询索引
db.products.createIndex({ categoryId: 1, status: 1 }, { name: "idx_category_status" })
db.products.createIndex({ status: 1, sales: -1 }, { name: "idx_status_sales" })
db.products.createIndex({ status: 1, createdAt: -1 }, { name: "idx_status_created" })
db.products.createIndex({ status: 1, price: 1 }, { name: "idx_status_price" })

// 全文搜索索引
db.products.createIndex(
  { name: "text", description: "text" },
  { 
    name: "idx_text_search",
    default_language: "none",  // 支持中文搜索
    weights: { name: 10, description: 5 }
  }
)
```

**字段约束**:
- `name`: 必填
- `price`: 必填，大于0
- `stock`: 必填，大于等于0
- `sales`: 默认值 0
- `views`: 默认值 0
- `status`: 默认值 1
- `sort`: 默认值 0

**示例数据**:
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439012"),
  productId: 1001,
  name: "iPhone 15 Pro Max",
  price: 9999,
  originalPrice: 10999,
  image: "https://cdn.example.com/iphone15-main.jpg",
  images: [
    "https://cdn.example.com/iphone15-1.jpg",
    "https://cdn.example.com/iphone15-2.jpg",
    "https://cdn.example.com/iphone15-3.jpg"
  ],
  description: "全新A17 Pro芯片，钛金属设计",
  detail: "<p>详细的商品介绍HTML内容...</p>",
  stock: 100,
  sales: 256,
  views: 1520,
  categoryId: 1,
  specs: [
    { name: "颜色", value: "钛金色" },
    { name: "容量", value: "256GB" }
  ],
  status: 1,
  sort: 100,
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-12-08T00:00:00Z")
}
```

---

### 3. categories（分类集合）

**用途**: 存储商品分类信息，支持树形结构

**Schema 结构**:
```javascript
{
  _id: ObjectId,
  categoryId: Number,               // 分类ID（自增）
  name: String,                     // 分类名称
  icon: String,                     // 分类图标URL
  parentId: Number,                 // 父分类ID，0表示一级分类
  level: Number,                    // 层级：1-一级分类，2-二级分类
  sort: Number,                     // 排序权重
  status: Number,                   // 状态：1-启用，0-禁用
  createdAt: Date,
  updatedAt: Date
}
```

**索引设计**:
```javascript
db.categories.createIndex({ categoryId: 1 }, { unique: true, name: "idx_categoryId" })
db.categories.createIndex({ parentId: 1, status: 1 }, { name: "idx_parent_status" })
db.categories.createIndex({ status: 1, sort: -1 }, { name: "idx_status_sort" })
```

**字段约束**:
- `name`: 必填
- `parentId`: 默认值 0
- `level`: 默认值 1
- `sort`: 默认值 0
- `status`: 默认值 1

**示例数据**:
```javascript
// 一级分类
{
  _id: ObjectId("507f1f77bcf86cd799439013"),
  categoryId: 1,
  name: "数码产品",
  icon: "https://cdn.example.com/icons/digital.png",
  parentId: 0,
  level: 1,
  sort: 100,
  status: 1,
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-01-01T00:00:00Z")
}

// 二级分类
{
  _id: ObjectId("507f1f77bcf86cd799439014"),
  categoryId: 2,
  name: "手机",
  icon: "https://cdn.example.com/icons/phone.png",
  parentId: 1,
  level: 2,
  sort: 90,
  status: 1,
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-01-01T00:00:00Z")
}
```

---

### 4. cart（购物车集合）

**用途**: 存储用户购物车数据

**Schema 结构**:
```javascript
{
  _id: ObjectId,
  cartId: Number,                   // 购物车项ID（自增）
  userId: Number,                   // 用户ID
  productId: Number,                // 商品ID
  quantity: Number,                 // 商品数量
  selected: Boolean,                // 是否选中（用于结算）
  createdAt: Date,                  // 添加时间
  updatedAt: Date                   // 更新时间
}
```

**索引设计**:
```javascript
db.cart.createIndex({ cartId: 1 }, { unique: true, name: "idx_cartId" })
db.cart.createIndex({ userId: 1 }, { name: "idx_userId" })
db.cart.createIndex(
  { userId: 1, productId: 1 },
  { unique: true, name: "idx_user_product" }
)
```

**字段约束**:
- `userId`: 必填
- `productId`: 必填
- `quantity`: 必填，大于0
- `selected`: 默认值 true
- 同一用户不能重复添加相同商品（通过复合唯一索引保证）

**示例数据**:
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439015"),
  cartId: 1,
  userId: 1,
  productId: 1001,
  quantity: 2,
  selected: true,
  createdAt: ISODate("2024-12-08T10:00:00Z"),
  updatedAt: ISODate("2024-12-08T10:00:00Z")
}
```

---

### 5. orders（订单集合）

**用途**: 存储订单主表信息

**Schema 结构**:
```javascript
{
  _id: ObjectId,
  orderId: Number,                  // 订单ID（自增）
  orderNo: String,                  // 订单号（格式：时间戳+随机数）
  userId: Number,                   // 用户ID
  status: Number,                   // 订单状态
  totalAmount: Number,              // 订单总金额（单位：元）
  remark: String,                   // 订单备注
  
  // 收货地址快照（防止用户修改地址影响历史订单）
  address: {
    name: String,                   // 收货人
    phone: String,                  // 联系电话
    province: String,               // 省份
    city: String,                   // 城市
    district: String,               // 区县
    detail: String                  // 详细地址
  },
  
  paymentMethod: String,            // 支付方式（微信、支付宝等）
  paymentTime: Date,                // 支付时间
  deliveryTime: Date,               // 发货时间
  receiveTime: Date,                // 收货时间
  cancelTime: Date,                 // 取消时间
  cancelReason: String,             // 取消原因
  
  deleted: Boolean,                 // 软删除标记
  createdAt: Date,                  // 创建时间
  updatedAt: Date                   // 更新时间
}
```

**索引设计**:
```javascript
db.orders.createIndex({ orderId: 1 }, { unique: true, name: "idx_orderId" })
db.orders.createIndex({ orderNo: 1 }, { unique: true, name: "idx_orderNo" })
db.orders.createIndex(
  { userId: 1, status: 1, deleted: 1 },
  { name: "idx_user_status_deleted" }
)
db.orders.createIndex({ userId: 1, createdAt: -1 }, { name: "idx_user_created" })
db.orders.createIndex({ createdAt: -1 }, { name: "idx_created" })
```

**订单状态定义**:
- `1`: 待付款
- `2`: 待发货（已付款）
- `3`: 待收货（已发货）
- `4`: 已完成（已收货）
- `5`: 已取消

**字段约束**:
- `orderNo`: 必填，唯一，格式：`yyyyMMddHHmmss + 6位随机数`
- `userId`: 必填
- `status`: 必填，默认值 1
- `totalAmount`: 必填，大于0
- `address`: 必填，创建订单时保存地址快照
- `deleted`: 默认值 false

**示例数据**:
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439016"),
  orderId: 10001,
  orderNo: "20241208100000123456",
  userId: 1,
  status: 3,
  totalAmount: 19998,
  remark: "请尽快发货",
  address: {
    name: "张三",
    phone: "13800138000",
    province: "广东省",
    city: "深圳市",
    district: "南山区",
    detail: "科技园南区XX路XX号"
  },
  paymentMethod: "微信支付",
  paymentTime: ISODate("2024-12-08T10:05:00Z"),
  deliveryTime: ISODate("2024-12-08T14:00:00Z"),
  receiveTime: null,
  cancelTime: null,
  cancelReason: null,
  deleted: false,
  createdAt: ISODate("2024-12-08T10:00:00Z"),
  updatedAt: ISODate("2024-12-08T14:00:00Z")
}
```

---

### 6. order_items（订单商品集合）

**用途**: 存储订单中的商品明细

**Schema 结构**:
```javascript
{
  _id: ObjectId,
  itemId: Number,                   // 订单项ID（自增）
  orderId: Number,                  // 订单ID
  productId: Number,                // 商品ID
  productName: String,              // 商品名称快照
  productImage: String,             // 商品图片快照
  price: Number,                    // 购买时单价
  quantity: Number,                 // 购买数量
  subtotal: Number,                 // 小计金额（price * quantity）
  specs: [{                         // 商品规格快照
    name: String,
    value: String
  }],
  createdAt: Date                   // 创建时间
}
```

**索引设计**:
```javascript
db.order_items.createIndex({ itemId: 1 }, { unique: true, name: "idx_itemId" })
db.order_items.createIndex({ orderId: 1 }, { name: "idx_orderId" })
db.order_items.createIndex({ productId: 1 }, { name: "idx_productId" })
```

**字段约束**:
- 所有字段必填
- `subtotal` = `price` × `quantity`
- 保存商品快照，防止商品信息变更影响历史订单

**示例数据**:
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439017"),
  itemId: 1,
  orderId: 10001,
  productId: 1001,
  productName: "iPhone 15 Pro Max",
  productImage: "https://cdn.example.com/iphone15-main.jpg",
  price: 9999,
  quantity: 2,
  subtotal: 19998,
  specs: [
    { name: "颜色", value: "钛金色" },
    { name: "容量", value: "256GB" }
  ],
  createdAt: ISODate("2024-12-08T10:00:00Z")
}
```

---

### 7. addresses（地址集合）

**用途**: 存储用户收货地址

**Schema 结构**:
```javascript
{
  _id: ObjectId,
  addressId: Number,                // 地址ID（自增）
  userId: Number,                   // 用户ID
  name: String,                     // 收货人
  phone: String,                    // 联系电话
  province: String,                 // 省份
  city: String,                     // 城市
  district: String,                 // 区县
  detail: String,                   // 详细地址
  isDefault: Boolean,               // 是否默认地址
  createdAt: Date,                  // 创建时间
  updatedAt: Date                   // 更新时间
}
```

**索引设计**:
```javascript
db.addresses.createIndex({ addressId: 1 }, { unique: true, name: "idx_addressId" })
db.addresses.createIndex({ userId: 1 }, { name: "idx_userId" })
db.addresses.createIndex(
  { userId: 1, isDefault: -1, createdAt: -1 },
  { name: "idx_user_default_created" }
)
```

**字段约束**:
- `name`: 必填，2-20字符
- `phone`: 必填，11位手机号
- `province`, `city`, `district`, `detail`: 必填
- `isDefault`: 默认值 false
- 每个用户只能有一个默认地址

**示例数据**:
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439018"),
  addressId: 1,
  userId: 1,
  name: "张三",
  phone: "13800138000",
  province: "广东省",
  city: "深圳市",
  district: "南山区",
  detail: "科技园南区XX路XX号",
  isDefault: true,
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-01-01T00:00:00Z")
}
```

---

### 8. banners（轮播图集合）

**用途**: 存储首页轮播图数据

**Schema 结构**:
```javascript
{
  _id: ObjectId,
  bannerId: Number,                 // 轮播图ID（自增）
  title: String,                    // 标题
  image: String,                    // 图片URL
  link: String,                     // 跳转链接
  sort: Number,                     // 排序权重（数字越大越靠前）
  status: Number,                   // 状态：1-启用，0-禁用
  createdAt: Date,                  // 创建时间
  updatedAt: Date                   // 更新时间
}
```

**索引设计**:
```javascript
db.banners.createIndex({ bannerId: 1 }, { unique: true, name: "idx_bannerId" })
db.banners.createIndex({ status: 1, sort: -1 }, { name: "idx_status_sort" })
```

**字段约束**:
- `title`: 必填
- `image`: 必填
- `sort`: 默认值 0
- `status`: 默认值 1

**示例数据**:
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439019"),
  bannerId: 1,
  title: "新品首发",
  image: "https://cdn.example.com/banner1.jpg",
  link: "/product/1001",
  sort: 100,
  status: 1,
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-01-01T00:00:00Z")
}
```

---

### 9. counters（自增ID计数器集合）

**用途**: 为各集合提供自增ID功能

**Schema 结构**:
```javascript
{
  _id: String,                      // 集合名称
  sequence_value: Number            // 当前序列值
}
```

**使用方法**:
```javascript
// 获取下一个序列值的函数
function getNextSequence(name) {
  const ret = db.counters.findAndModify({
    query: { _id: name },
    update: { $inc: { sequence_value: 1 } },
    new: true,
    upsert: true
  });
  return ret.sequence_value;
}

// 使用示例
const newUserId = getNextSequence("users");
```

**初始化数据**:
```javascript
db.counters.insertMany([
  { _id: "users", sequence_value: 0 },
  { _id: "products", sequence_value: 1000 },
  { _id: "categories", sequence_value: 0 },
  { _id: "cart", sequence_value: 0 },
  { _id: "orders", sequence_value: 10000 },
  { _id: "order_items", sequence_value: 0 },
  { _id: "addresses", sequence_value: 0 },
  { _id: "banners", sequence_value: 0 }
])
```

---

## 数据库初始化脚本

### 创建数据库和集合
```javascript
// 连接到MongoDB
use ecommerce

// 创建集合（可选，插入数据时会自动创建）
db.createCollection("users")
db.createCollection("products")
db.createCollection("categories")
db.createCollection("cart")
db.createCollection("orders")
db.createCollection("order_items")
db.createCollection("addresses")
db.createCollection("banners")
db.createCollection("counters")
```

### 创建所有索引
```javascript
// users 索引
db.users.createIndex({ username: 1 }, { unique: true, name: "idx_username" })
db.users.createIndex({ email: 1 }, { unique: true, sparse: true, name: "idx_email" })
db.users.createIndex({ userId: 1 }, { unique: true, name: "idx_userId" })
db.users.createIndex({ status: 1 }, { name: "idx_status" })

// products 索引
db.products.createIndex({ productId: 1 }, { unique: true, name: "idx_productId" })
db.products.createIndex({ categoryId: 1, status: 1 }, { name: "idx_category_status" })
db.products.createIndex({ status: 1, sales: -1 }, { name: "idx_status_sales" })
db.products.createIndex({ status: 1, createdAt: -1 }, { name: "idx_status_created" })
db.products.createIndex({ status: 1, price: 1 }, { name: "idx_status_price" })
db.products.createIndex(
  { name: "text", description: "text" },
  { name: "idx_text_search", default_language: "none", weights: { name: 10, description: 5 } }
)

// categories 索引
db.categories.createIndex({ categoryId: 1 }, { unique: true, name: "idx_categoryId" })
db.categories.createIndex({ parentId: 1, status: 1 }, { name: "idx_parent_status" })
db.categories.createIndex({ status: 1, sort: -1 }, { name: "idx_status_sort" })

// cart 索引
db.cart.createIndex({ cartId: 1 }, { unique: true, name: "idx_cartId" })
db.cart.createIndex({ userId: 1 }, { name: "idx_userId" })
db.cart.createIndex({ userId: 1, productId: 1 }, { unique: true, name: "idx_user_product" })

// orders 索引
db.orders.createIndex({ orderId: 1 }, { unique: true, name: "idx_orderId" })
db.orders.createIndex({ orderNo: 1 }, { unique: true, name: "idx_orderNo" })
db.orders.createIndex({ userId: 1, status: 1, deleted: 1 }, { name: "idx_user_status_deleted" })
db.orders.createIndex({ userId: 1, createdAt: -1 }, { name: "idx_user_created" })
db.orders.createIndex({ createdAt: -1 }, { name: "idx_created" })

// order_items 索引
db.order_items.createIndex({ itemId: 1 }, { unique: true, name: "idx_itemId" })
db.order_items.createIndex({ orderId: 1 }, { name: "idx_orderId" })
db.order_items.createIndex({ productId: 1 }, { name: "idx_productId" })

// addresses 索引
db.addresses.createIndex({ addressId: 1 }, { unique: true, name: "idx_addressId" })
db.addresses.createIndex({ userId: 1 }, { name: "idx_userId" })
db.addresses.createIndex({ userId: 1, isDefault: -1, createdAt: -1 }, { name: "idx_user_default_created" })

// banners 索引
db.banners.createIndex({ bannerId: 1 }, { unique: true, name: "idx_bannerId" })
db.banners.createIndex({ status: 1, sort: -1 }, { name: "idx_status_sort" })
```

### 初始化计数器
```javascript
db.counters.insertMany([
  { _id: "users", sequence_value: 0 },
  { _id: "products", sequence_value: 1000 },
  { _id: "categories", sequence_value: 0 },
  { _id: "cart", sequence_value: 0 },
  { _id: "orders", sequence_value: 10000 },
  { _id: "order_items", sequence_value: 0 },
  { _id: "addresses", sequence_value: 0 },
  { _id: "banners", sequence_value: 0 }
])
```

---

## 数据关系图

```
users (1) ----< (N) cart
users (1) ----< (N) orders
users (1) ----< (N) addresses

categories (1) ----< (N) products
categories (1) ----< (N) categories (自关联)

products (1) ----< (N) cart
products (1) ----< (N) order_items

orders (1) ----< (N) order_items
```

---

## 性能优化建议

### 1. 索引优化
- ✅ 已为所有常用查询字段创建索引
- ✅ 使用复合索引优化多条件查询
- ✅ 为全文搜索创建text索引
- ⚠️ 定期使用 `db.collection.stats()` 监控索引使用情况

### 2. 查询优化
- 使用投影（projection）只返回需要的字段
- 避免全表扫描，确保查询使用索引
- 使用 `explain()` 分析查询性能

### 3. 数据分片（Sharding）
如果数据量增长到百万级别，考虑对以下集合进行分片：
- `products`: 按 `productId` 分片
- `orders`: 按 `userId` 或 `createdAt` 分片
- `order_items`: 按 `orderId` 分片

### 4. 缓存策略
建议使用 Redis 缓存以下数据：
- 商品详情（TTL: 1小时）
- 分类列表（TTL: 1天）
- 首页数据（TTL: 10分钟）
- 用户信息（TTL: 30分钟）

### 5. 读写分离
- 配置 MongoDB 副本集
- 读操作使用从节点
- 写操作使用主节点

---

## 数据备份策略

### 1. 定期备份
```bash
# 每天凌晨2点执行全量备份
mongodump --uri="mongodb://root:9bpm8zf4@x-db-mongodb.ns-rpjorlyu.svc:27017" \
  --db=ecommerce \
  --out=/backup/mongodb/$(date +%Y%m%d)
```

### 2. 增量备份
使用 MongoDB Oplog 实现增量备份

### 3. 备份保留策略
- 每日备份保留7天
- 每周备份保留4周
- 每月备份保留12个月

---

## 安全建议

### 1. 访问控制
```javascript
// 创建应用专用用户
use ecommerce
db.createUser({
  user: "ecommerce_app",
  pwd: "strong_password_here",
  roles: [
    { role: "readWrite", db: "ecommerce" }
  ]
})
```

### 2. 连接安全
- ✅ 使用强密码
- ✅ 启用 SSL/TLS 加密连接
- ✅ 限制访问IP白名单
- ✅ 定期更换密码

### 3. 数据加密
- 敏感字段（密码）使用 bcrypt 加密
- 考虑启用 MongoDB 的字段级加密

---

## 监控指标

### 关键指标
1. **连接数**: 监控当前连接数，避免连接池耗尽
2. **查询性能**: 慢查询日志（>100ms）
3. **索引命中率**: 确保查询使用索引
4. **磁盘使用率**: 监控存储空间
5. **副本集状态**: 确保副本集健康

### 监控工具
- MongoDB Atlas（云端）
- MongoDB Ops Manager
- Prometheus + Grafana

---

## 附录

### A. 常用查询示例

```javascript
// 1. 查询用户购物车（关联商品信息）
db.cart.aggregate([
  { $match: { userId: 1 } },
  { $lookup: {
      from: "products",
      localField: "productId",
      foreignField: "productId",
      as: "product"
  }},
  { $unwind: "$product" },
  { $project: {
      cartId: 1,
      productId: 1,
      productName: "$product.name",
      productImage: "$product.image",
      price: "$product.price",
      quantity: 1,
      selected: 1,
      stock: "$product.stock"
  }}
])

// 2. 查询订单详情（关联订单商品）
db.orders.aggregate([
  { $match: { orderId: 10001 } },
  { $lookup: {
      from: "order_items",
      localField: "orderId",
      foreignField: "orderId",
      as: "items"
  }}
])

// 3. 查询分类树形结构
db.categories.aggregate([
  { $match: { status: 1 } },
  { $graphLookup: {
      from: "categories",
      startWith: "$categoryId",
      connectFromField: "categoryId",
      connectToField: "parentId",
      as: "children",
      maxDepth: 1
  }}
])

// 4. 商品全文搜索
db.products.find(
  { $text: { $search: "iPhone" }, status: 1 },
  { score: { $meta: "textScore" } }
).sort({ score: { $meta: "textScore" } })
```

### B. 数据迁移脚本

```javascript
// 从旧系统迁移用户数据
db.old_users.find().forEach(function(user) {
  db.users.insertOne({
    userId: getNextSequence("users"),
    username: user.name,
    password: user.pwd,
    email: user.mail,
    phone: user.mobile,
    avatar: user.avatar || "https://www.gravatar.com/avatar/default",
    status: 1,
    createdAt: user.create_time,
    updatedAt: new Date()
  });
});
```

---

**文档版本**: v1.0  
**最后更新**: 2024-12-08  
**维护人员**: 开发团队
