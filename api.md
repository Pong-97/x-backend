## 项目概述
本文档用于前后端接口对接，基于 Vue 前端项目的 API 调用整理而成。后端使用 Node.js + Express 框架实现，数据库的连接方式为：mongodb://root:9bpm8zf4@x-db-mongodb.ns-rpjorlyu.svc:27017

## 技术栈要求
- **后端框架**: Node.js + Express
- **数据格式**: JSON
- **请求方式**: RESTful API
- **认证方式**: 建议使用 JWT Token（需在请求头中携带）

---

## 接口规范

### 通用响应格式
```json
{
  "code": 200,           // 状态码：200 成功，其他为失败
  "message": "success",  // 提示信息
  "data": {}            // 响应数据
}
```

### 通用请求头
```
Content-Type: application/json
Authorization: Bearer <token>  // 需要认证的接口
```

---

## 1. 用户模块 (User)

### 1.1 用户登录
- **接口路径**: `POST /user/login`
- **请求参数**:
```json
{
  "username": "string",  // 用户名
  "password": "string"   // 密码
}
```
- **响应数据**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "string",      // JWT token
    "userInfo": {
      "id": "number",
      "username": "string",
      "email": "string",
      "avatar": "string"
    }
  }
}
```
- **业务逻辑**:
  1. **参数验证**:
     - 验证 username 和 password 不为空
     - username 长度 3-20 字符
     - password 长度 6-20 字符
  2. **用户查询**:
     - 在 users 表中根据 username 查询用户
     - 如果用户不存在，返回 400 "用户名或密码错误"
  3. **密码验证**:
     - 使用 bcryptjs.compare() 比对密码哈希
     - 密码错误返回 400 "用户名或密码错误"
  4. **生成 Token**:
     - 使用 jwt.sign() 生成 token，payload 包含 { userId, username }
     - 设置过期时间为 7 天
  5. **返回数据**:
     - 返回 token 和用户基本信息（不包含密码）
     - 可选：记录登录日志（IP、时间）

### 1.2 用户注册
- **接口路径**: `POST /user/register`
- **请求参数**:
```json
{
  "username": "string",  // 用户名
  "password": "string",  // 密码
  "email": "string"      // 邮箱（可选）
}
```
- **响应数据**:
```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "userId": "number"
  }
}
```
- **业务逻辑**:
  1. **参数验证**:
     - username: 3-20 字符，只允许字母数字下划线
     - password: 6-20 字符
     - email: 如果提供，验证邮箱格式
  2. **唯一性检查**:
     - 查询 users 表检查 username 是否已存在
     - 如果存在返回 400 "用户名已存在"
     - 如果提供了 email，检查 email 是否已被使用
  3. **密码加密**:
     - 使用 bcryptjs.hash() 加密密码（salt rounds: 10）
  4. **创建用户**:
     - 插入新用户到 users 表
     - 设置默认头像（可使用 Gravatar 或默认图片）
     - 记录创建时间 createdAt
  5. **返回结果**:
     - 返回新用户的 ID

### 1.3 获取用户信息
- **接口路径**: `GET /user/info`
- **请求参数**: 无（需要 token）
- **响应数据**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "number",
    "username": "string",
    "email": "string",
    "avatar": "string",
    "phone": "string",
    "createdAt": "string"
  }
}
```
- **业务逻辑**:
  1. **Token 验证**:
     - 通过 authMiddleware 验证 token
     - 从 token 中解析出 userId
  2. **查询用户**:
     - 根据 userId 查询 users 表
     - 如果用户不存在返回 404 "用户不存在"
  3. **返回数据**:
     - 返回用户信息，排除敏感字段（password）

### 1.4 更新用户信息
- **接口路径**: `POST /user/update`
- **请求参数**:
```json
{
  "username": "string",  // 可选
  "email": "string",     // 可选
  "avatar": "string",    // 可选
  "phone": "string"      // 可选
}
```
- **响应数据**:
```json
{
  "code": 200,
  "message": "更新成功",
  "data": null
}
```
- **业务逻辑**:
  1. **Token 验证**: 获取当前登录用户 ID
  2. **参数验证**:
     - 如果更新 username，检查格式和长度
     - 如果更新 email，验证邮箱格式
     - 如果更新 phone，验证手机号格式
  3. **唯一性检查**:
     - 如果更新 username，检查新用户名是否被其他用户占用
     - 如果更新 email，检查新邮箱是否被其他用户使用
  4. **更新数据**:
     - 只更新提供的字段
     - 更新 updatedAt 时间戳
  5. **返回结果**: 返回成功消息

---

## 2. 商品模块 (Product)

### 2.1 获取商品列表
- **接口路径**: `GET /product/list`
- **请求参数** (Query):
```
categoryId: number    // 分类ID（可选）
page: number         // 页码，默认 1
pageSize: number     // 每页数量，默认 10
sortBy: string       // 排序字段（可选）：price, sales, createdAt
order: string        // 排序方式（可选）：asc, desc
```
- **响应数据**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "number",
        "name": "string",
        "price": "number",
        "originalPrice": "number",
        "image": "string",
        "images": ["string"],
        "description": "string",
        "stock": "number",
        "sales": "number",
        "categoryId": "number"
      }
    ],
    "total": "number",
    "page": "number",
    "pageSize": "number"
  }
}
```
- **业务逻辑**:
  1. **参数处理**:
     - page 默认为 1，最小值 1
     - pageSize 默认为 10，最大值 100
     - sortBy 默认为 createdAt
     - order 默认为 desc
  2. **构建查询条件**:
     - 如果提供 categoryId，添加分类过滤
     - 只查询上架商品（status = 1）
  3. **排序逻辑**:
     - 根据 sortBy 和 order 构建排序条件
     - 支持按价格、销量、创建时间排序
  4. **分页查询**:
     - 计算 skip = (page - 1) * pageSize
     - 使用 limit 和 skip 进行分页
  5. **统计总数**: 查询符合条件的商品总数
  6. **返回数据**: 返回商品列表、总数、页码信息

### 2.2 获取商品详情
- **接口路径**: `GET /product/:id`
- **请求参数**: 
  - `id`: 商品ID（路径参数）
- **响应数据**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "number",
    "name": "string",
    "price": "number",
    "originalPrice": "number",
    "image": "string",
    "images": ["string"],
    "description": "string",
    "detail": "string",
    "stock": "number",
    "sales": "number",
    "categoryId": "number",
    "specs": "array"  // 商品规格
  }
}
```
- **业务逻辑**:
  1. **参数验证**: 验证 id 为有效的数字
  2. **查询商品**:
     - 根据 id 查询 products 表
     - 如果商品不存在返回 404 "商品不存在"
  3. **增加浏览量**: 可选，更新商品的浏览次数
  4. **关联查询**: 可查询关联的分类信息
  5. **返回数据**: 返回完整的商品详情

### 2.3 搜索商品
- **接口路径**: `GET /product/search`
- **请求参数** (Query):
```
keyword: string      // 搜索关键词
page: number        // 页码
pageSize: number    // 每页数量
```
- **响应数据**: 同商品列表格式
- **业务逻辑**:
  1. **参数验证**:
     - keyword 不能为空，去除首尾空格
     - 关键词长度至少 1 个字符
  2. **模糊搜索**:
     - 在商品名称和描述中搜索关键词
     - 使用正则表达式或全文搜索（MongoDB: $text, $search）
  3. **分页处理**: 同商品列表
  4. **排序**: 默认按相关度或创建时间倒序
  5. **返回数据**: 返回匹配的商品列表

---

## 3. 分类模块 (Category)

### 3.1 获取分类列表
- **接口路径**: `GET /category/list`
- **请求参数**: 无
- **响应数据**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "number",
      "name": "string",
      "icon": "string",
      "parentId": "number",
      "children": "array"  // 子分类（可选）
    }
  ]
}
```
- **业务逻辑**:
  1. **查询分类**:
     - 查询 categories 表所有启用的分类
     - 按 sort 字段排序
  2. **构建树形结构**:
     - 将扁平数据转换为树形结构
     - parentId 为 0 或 null 的为一级分类
     - 递归查找子分类并填充到 children 字段
  3. **返回数据**: 返回树形分类列表

---

## 4. 购物车模块 (Cart)

### 4.1 获取购物车列表
- **接口路径**: `GET /cart/list`
- **请求参数**: 无（需要 token）
- **响应数据**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "number",
      "productId": "number",
      "productName": "string",
      "productImage": "string",
      "price": "number",
      "quantity": "number",
      "selected": "boolean",
      "stock": "number"
    }
  ]
}
```
- **业务逻辑**:
  1. **Token 验证**: 获取当前用户 ID
  2. **查询购物车**:
     - 根据 userId 查询 cart 表
     - 关联查询商品信息（JOIN products）
  3. **数据处理**:
     - 检查商品是否已下架，如已下架标记或移除
     - 检查商品库存，如果库存不足标记
     - 获取商品最新价格
  4. **返回数据**: 返回购物车列表，包含商品详情

### 4.2 添加到购物车
- **接口路径**: `POST /cart/add`
- **请求参数**:
```json
{
  "productId": "number",
  "quantity": "number"
}
```
- **响应数据**:
```json
{
  "code": 200,
  "message": "添加成功",
  "data": {
    "cartId": "number"
  }
}
```
- **业务逻辑**:
  1. **Token 验证**: 获取当前用户 ID
  2. **参数验证**:
     - productId 必须存在
     - quantity 必须为正整数，默认为 1
  3. **商品验证**:
     - 查询商品是否存在且已上架
     - 检查库存是否充足
     - 如果库存不足返回 400 "库存不足"
  4. **购物车检查**:
     - 查询用户购物车中是否已有该商品
     - 如果已存在，更新数量（累加）
     - 如果不存在，创建新记录
  5. **库存限制**: 确保购物车数量不超过库存
  6. **返回数据**: 返回购物车项 ID

### 4.3 更新购物车
- **接口路径**: `POST /cart/update`
- **请求参数**:
```json
{
  "cartId": "number",
  "quantity": "number",    // 可选
  "selected": "boolean"    // 可选
}
```
- **响应数据**:
```json
{
  "code": 200,
  "message": "更新成功",
  "data": null
}
```
- **业务逻辑**:
  1. **Token 验证**: 获取当前用户 ID
  2. **权限验证**:
     - 查询购物车项是否存在
     - 验证该购物车项属于当前用户
  3. **更新数量**:
     - 如果提供 quantity，验证为正整数
     - 查询商品库存，确保不超过库存
     - 如果库存不足返回 400 "库存不足"
  4. **更新选中状态**: 如果提供 selected，更新选中状态
  5. **执行更新**: 更新购物车记录
  6. **返回结果**: 返回成功消息

### 4.4 删除购物车商品
- **接口路径**: `DELETE /cart/delete/:id`
- **请求参数**: 
  - `id`: 购物车项ID（路径参数）
- **响应数据**:
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```
- **业务逻辑**:
  1. **Token 验证**: 获取当前用户 ID
  2. **权限验证**:
     - 查询购物车项是否存在
     - 验证该购物车项属于当前用户
     - 如果不属于返回 403 "无权限操作"
  3. **删除记录**: 从 cart 表删除该记录
  4. **返回结果**: 返回成功消息

---

## 5. 订单模块 (Order)

### 5.1 创建订单
- **接口路径**: `POST /order/create`
- **请求参数**:
```json
{
  "addressId": "number",
  "cartIds": ["number"],  // 购物车项ID数组
  "remark": "string"      // 订单备注（可选）
}
```
- **响应数据**:
```json
{
  "code": 200,
  "message": "订单创建成功",
  "data": {
    "orderId": "number",
    "orderNo": "string"
  }
}
```
- **业务逻辑**:
  1. **Token 验证**: 获取当前用户 ID
  2. **参数验证**:
     - addressId 必须存在
     - cartIds 数组不能为空
  3. **地址验证**:
     - 查询地址是否存在且属于当前用户
     - 如果不存在返回 400 "收货地址不存在"
  4. **购物车验证**:
     - 查询所有购物车项，验证属于当前用户
     - 关联查询商品信息
  5. **库存检查**:
     - 遍历每个商品，检查库存是否充足
     - 如果任一商品库存不足，返回 400 "商品XXX库存不足"
  6. **计算金额**: 计算订单总金额
  7. **开始事务**:
     - 创建订单记录（orders 表）
     - 生成订单号（格式：时间戳 + 随机数）
     - 设置订单状态为待付款（status = 1）
     - 创建订单商品记录（order_items 表）
     - 扣减商品库存
     - 删除购物车中对应的商品
  8. **提交事务**: 如果任何步骤失败，回滚事务
  9. **返回数据**: 返回订单 ID 和订单号

### 5.2 获取订单列表
- **接口路径**: `GET /order/list`
- **请求参数** (Query):
```
status: number       // 订单状态（可选）：0-全部，1-待付款，2-待发货，3-待收货，4-已完成
page: number        // 页码
pageSize: number    // 每页数量
```
- **响应数据**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "number",
        "orderNo": "string",
        "status": "number",
        "statusText": "string",
        "totalAmount": "number",
        "createdAt": "string",
        "items": [
          {
            "productId": "number",
            "productName": "string",
            "productImage": "string",
            "price": "number",
            "quantity": "number"
          }
        ]
      }
    ],
    "total": "number"
  }
}
```
- **业务逻辑**:
  1. **Token 验证**: 获取当前用户 ID
  2. **参数处理**:
     - page 默认为 1
     - pageSize 默认为 10
     - status 为 0 或不传则查询全部
  3. **构建查询条件**:
     - 查询当前用户的订单
     - 如果 status > 0，添加状态过滤
  4. **关联查询**:
     - 查询订单基本信息
     - 关联查询订单商品（order_items）
  5. **状态映射**:
     - 1: "待付款"
     - 2: "待发货"
     - 3: "待收货"
     - 4: "已完成"
     - 5: "已取消"
  6. **分页查询**: 计算 skip 和 limit
  7. **返回数据**: 返回订单列表和总数

### 5.3 获取订单详情
- **接口路径**: `GET /order/:id`
- **请求参数**: 
  - `id`: 订单ID（路径参数）
- **响应数据**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "number",
    "orderNo": "string",
    "status": "number",
    "statusText": "string",
    "totalAmount": "number",
    "createdAt": "string",
    "address": {
      "name": "string",
      "phone": "string",
      "province": "string",
      "city": "string",
      "district": "string",
      "detail": "string"
    },
    "items": "array",
    "remark": "string"
  }
}
```
- **业务逻辑**:
  1. **Token 验证**: 获取当前用户 ID
  2. **查询订单**:
     - 根据 id 查询订单
     - 如果订单不存在返回 404 "订单不存在"
  3. **权限验证**:
     - 验证订单属于当前用户
     - 如果不属于返回 403 "无权限访问"
  4. **关联查询**:
     - 查询订单商品列表
     - 查询收货地址信息（从订单快照或地址表）
  5. **返回数据**: 返回完整的订单详情

### 5.4 取消订单
- **接口路径**: `POST /order/cancel/:id`
- **请求参数**: 
  - `id`: 订单ID（路径参数）
- **响应数据**:
```json
{
  "code": 200,
  "message": "订单已取消",
  "data": null
}
```
- **业务逻辑**:
  1. **Token 验证**: 获取当前用户 ID
  2. **查询订单**:
     - 根据 id 查询订单
     - 验证订单属于当前用户
  3. **状态验证**:
     - 只有待付款（status = 1）的订单可以取消
     - 如果状态不允许，返回 400 "订单状态不允许取消"
  4. **开始事务**:
     - 更新订单状态为已取消（status = 5）
     - 恢复商品库存（从 order_items 中读取数量）
     - 记录取消时间
  5. **提交事务**: 确保库存恢复成功
  6. **返回结果**: 返回成功消息

### 5.5 确认收货
- **接口路径**: `POST /order/confirm/:id`
- **请求参数**: 
  - `id`: 订单ID（路径参数）
- **响应数据**:
```json
{
  "code": 200,
  "message": "确认收货成功",
  "data": null
}
```
- **业务逻辑**:
  1. **Token 验证**: 获取当前用户 ID
  2. **查询订单**:
     - 根据 id 查询订单
     - 验证订单属于当前用户
  3. **状态验证**:
     - 只有待收货（status = 3）的订单可以确认收货
     - 如果状态不允许，返回 400 "订单状态不允许确认收货"
  4. **更新订单**:
     - 更新订单状态为已完成（status = 4）
     - 记录确认收货时间
  5. **增加销量**: 更新商品销量（从 order_items 读取）
  6. **返回结果**: 返回成功消息

### 5.6 删除订单
- **接口路径**: `DELETE /order/delete/:id`
- **请求参数**: 
  - `id`: 订单ID（路径参数）
- **响应数据**:
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```
- **业务逻辑**:
  1. **Token 验证**: 获取当前用户 ID
  2. **查询订单**:
     - 根据 id 查询订单
     - 验证订单属于当前用户
  3. **状态验证**:
     - 只有已完成（status = 4）或已取消（status = 5）的订单可以删除
     - 如果状态不允许，返回 400 "订单状态不允许删除"
  4. **软删除**: 建议使用软删除，设置 deleted = 1，而不是物理删除
  5. **返回结果**: 返回成功消息

---

## 6. 地址模块 (Address)

### 6.1 获取地址列表
- **接口路径**: `GET /address/list`
- **请求参数**: 无（需要 token）
- **响应数据**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "number",
      "name": "string",
      "phone": "string",
      "province": "string",
      "city": "string",
      "district": "string",
      "detail": "string",
      "isDefault": "boolean"
    }
  ]
}
```
- **业务逻辑**:
  1. **Token 验证**: 获取当前用户 ID
  2. **查询地址**:
     - 根据 userId 查询 addresses 表
     - 按 isDefault 降序，createdAt 降序排序（默认地址在前）
  3. **返回数据**: 返回地址列表

### 6.2 添加地址
- **接口路径**: `POST /address/add`
- **请求参数**:
```json
{
  "name": "string",
  "phone": "string",
  "province": "string",
  "city": "string",
  "district": "string",
  "detail": "string",
  "isDefault": "boolean"
}
```
- **响应数据**:
```json
{
  "code": 200,
  "message": "添加成功",
  "data": {
    "addressId": "number"
  }
}
```
- **业务逻辑**:
  1. **Token 验证**: 获取当前用户 ID
  2. **参数验证**:
     - name: 2-20 字符
     - phone: 验证手机号格式（11位数字）
     - province, city, district, detail 不能为空
  3. **默认地址处理**:
     - 如果 isDefault 为 true，将用户其他地址的 isDefault 设为 false
     - 如果是用户第一个地址，自动设为默认
  4. **创建地址**: 插入新地址到 addresses 表
  5. **返回数据**: 返回新地址的 ID

### 6.3 更新地址
- **接口路径**: `POST /address/update/:id`
- **请求参数**: 
  - `id`: 地址ID（路径参数）
  - Body: 同添加地址
- **响应数据**:
```json
{
  "code": 200,
  "message": "更新成功",
  "data": null
}
```
- **业务逻辑**:
  1. **Token 验证**: 获取当前用户 ID
  2. **查询地址**:
     - 根据 id 查询地址
     - 验证地址属于当前用户
  3. **参数验证**: 同添加地址
  4. **默认地址处理**:
     - 如果 isDefault 为 true，将用户其他地址的 isDefault 设为 false
  5. **更新地址**: 更新地址信息
  6. **返回结果**: 返回成功消息

### 6.4 删除地址
- **接口路径**: `DELETE /address/delete/:id`
- **请求参数**: 
  - `id`: 地址ID（路径参数）
- **响应数据**:
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```
- **业务逻辑**:
  1. **Token 验证**: 获取当前用户 ID
  2. **查询地址**:
     - 根据 id 查询地址
     - 验证地址属于当前用户
  3. **删除地址**: 从 addresses 表删除记录
  4. **默认地址处理**:
     - 如果删除的是默认地址，将用户的第一个地址设为默认
  5. **返回结果**: 返回成功消息

### 6.5 设置默认地址
- **接口路径**: `POST /address/setDefault/:id`
- **请求参数**: 
  - `id`: 地址ID（路径参数）
- **响应数据**:
```json
{
  "code": 200,
  "message": "设置成功",
  "data": null
}
```
- **业务逻辑**:
  1. **Token 验证**: 获取当前用户 ID
  2. **查询地址**:
     - 根据 id 查询地址
     - 验证地址属于当前用户
  3. **开始事务**:
     - 将用户所有地址的 isDefault 设为 false
     - 将指定地址的 isDefault 设为 true
  4. **提交事务**: 确保操作原子性
  5. **返回结果**: 返回成功消息

---

## 7. 首页模块 (Home)

### 7.1 获取首页数据
- **接口路径**: `GET /home`
- **请求参数**: 无
- **响应数据**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "banners": [
      {
        "id": "number",
        "image": "string",
        "link": "string",
        "title": "string"
      }
    ],
    "categories": "array",
    "hotProducts": "array",     // 热门商品
    "newProducts": "array"      // 新品推荐
  }
}
```
- **业务逻辑**:
  1. **查询轮播图**:
     - 从 banners 表查询启用的轮播图
     - 按 sort 字段排序
     - 限制返回数量（如 5 条）
  2. **查询分类**:
     - 查询一级分类或热门分类
     - 限制返回数量（如 8-10 个）
  3. **查询热门商品**:
     - 按销量降序排序
     - 只返回上架商品
     - 限制返回数量（如 10 条）
  4. **查询新品**:
     - 按创建时间降序排序
     - 只返回上架商品
     - 限制返回数量（如 10 条）
  5. **数据组装**: 将所有数据组装成响应格式
  6. **缓存优化**: 建议使用 Redis 缓存首页数据，设置过期时间

---

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权，需要登录 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 后端实现建议

### 1. 项目结构
```
backend/
├── src/
│   ├── routes/          # 路由
│   │   ├── user.js
│   │   ├── product.js
│   │   ├── cart.js
│   │   ├── order.js
│   │   ├── address.js
│   │   ├── category.js
│   │   └── home.js
│   ├── controllers/     # 控制器
│   ├── models/          # 数据模型
│   ├── middleware/      # 中间件（认证、错误处理等）
│   ├── utils/           # 工具函数
│   └── app.js          # 主应用
├── package.json
└── .env                # 环境变量
```

### 2. 必需的 npm 包
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "dotenv": "^16.0.0",
    "mongoose": "^7.0.0"  // 或其他 ORM
  }
}
```

### 3. CORS 配置
前端开发环境可能运行在不同端口，需要配置 CORS：
```javascript
app.use(cors({
  origin: 'http://localhost:5173',  // Vite 默认端口
  credentials: true
}));
```

### 4. JWT 认证中间件示例
```javascript
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ code: 401, message: '未授权' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ code: 401, message: 'Token 无效' });
  }
};
```

### 5. 统一响应格式中间件
```javascript
const responseFormatter = (req, res, next) => {
  res.success = (data = null, message = 'success') => {
    res.json({ code: 200, message, data });
  };
  res.error = (message = 'error', code = 500) => {
    res.status(code).json({ code, message, data: null });
  };
  next();
};
```

---

## 数据库设计（MongoDB）

### 1. 用户表 (users)
```javascript
{
  _id: ObjectId,                    // MongoDB 自动生成的主键
  userId: Number,                   // 用户ID（自增）
  username: String,                 // 用户名，唯一索引
  password: String,                 // 密码（bcrypt加密）
  email: String,                    // 邮箱，唯一索引（可选）
  phone: String,                    // 手机号
  avatar: String,                   // 头像URL
  status: Number,                   // 状态：1-正常，0-禁用
  createdAt: Date,                  // 创建时间
  updatedAt: Date,                  // 更新时间
  lastLoginAt: Date,                // 最后登录时间
  lastLoginIp: String               // 最后登录IP
}

// 索引
db.users.createIndex({ username: 1 }, { unique: true })
db.users.createIndex({ email: 1 }, { unique: true, sparse: true })
db.users.createIndex({ userId: 1 }, { unique: true })
```

### 2. 商品表 (products)
```javascript
{
  _id: ObjectId,
  productId: Number,                // 商品ID（自增）
  name: String,                     // 商品名称
  price: Number,                    // 当前价格
  originalPrice: Number,            // 原价
  image: String,                    // 主图URL
  images: [String],                 // 商品图片数组
  description: String,              // 简短描述
  detail: String,                   // 详细描述（富文本）
  stock: Number,                    // 库存数量
  sales: Number,                    // 销量，默认0
  views: Number,                    // 浏览次数，默认0
  categoryId: Number,               // 分类ID
  specs: [{                         // 商品规格
    name: String,                   // 规格名称（如：颜色、尺寸）
    value: String                   // 规格值
  }],
  status: Number,                   // 状态：1-上架，0-下架
  sort: Number,                     // 排序权重，默认0
  createdAt: Date,                  // 创建时间
  updatedAt: Date                   // 更新时间
}

// 索引
db.products.createIndex({ productId: 1 }, { unique: true })
db.products.createIndex({ categoryId: 1 })
db.products.createIndex({ status: 1 })
db.products.createIndex({ sales: -1 })
db.products.createIndex({ createdAt: -1 })
db.products.createIndex({ name: "text", description: "text" })  // 全文搜索
```

### 3. 分类表 (categories)
```javascript
{
  _id: ObjectId,
  categoryId: Number,               // 分类ID（自增）
  name: String,                     // 分类名称
  icon: String,                     // 分类图标URL
  parentId: Number,                 // 父分类ID，0表示一级分类
  level: Number,                    // 层级：1-一级，2-二级
  sort: Number,                     // 排序权重，默认0
  status: Number,                   // 状态：1-启用，0-禁用
  createdAt: Date,
  updatedAt: Date
}

// 索引
db.categories.createIndex({ categoryId: 1 }, { unique: true })
db.categories.createIndex({ parentId: 1 })
db.categories.createIndex({ status: 1, sort: 1 })
```

### 4. 购物车表 (cart)
```javascript
{
  _id: ObjectId,
  cartId: Number,                   // 购物车项ID（自增）
  userId: Number,                   // 用户ID
  productId: Number,                // 商品ID
  quantity: Number,                 // 数量
  selected: Boolean,                // 是否选中，默认true
  createdAt: Date,
  updatedAt: Date
}

// 索引
db.cart.createIndex({ cartId: 1 }, { unique: true })
db.cart.createIndex({ userId: 1 })
db.cart.createIndex({ userId: 1, productId: 1 }, { unique: true })  // 用户+商品唯一
```

### 5. 订单表 (orders)
```javascript
{
  _id: ObjectId,
  orderId: Number,                  // 订单ID（自增）
  orderNo: String,                  // 订单号，唯一
  userId: Number,                   // 用户ID
  status: Number,                   // 订单状态：1-待付款，2-待发货，3-待收货，4-已完成，5-已取消
  totalAmount: Number,              // 订单总金额
  remark: String,                   // 订单备注
  
  // 收货地址快照（防止用户修改地址影响订单）
  address: {
    name: String,                   // 收货人
    phone: String,                  // 联系电话
    province: String,               // 省份
    city: String,                   // 城市
    district: String,               // 区县
    detail: String                  // 详细地址
  },
  
  paymentMethod: String,            // 支付方式
  paymentTime: Date,                // 支付时间
  deliveryTime: Date,               // 发货时间
  receiveTime: Date,                // 收货时间
  cancelTime: Date,                 // 取消时间
  cancelReason: String,             // 取消原因
  
  deleted: Boolean,                 // 软删除标记，默认false
  createdAt: Date,
  updatedAt: Date
}

// 索引
db.orders.createIndex({ orderId: 1 }, { unique: true })
db.orders.createIndex({ orderNo: 1 }, { unique: true })
db.orders.createIndex({ userId: 1, status: 1 })
db.orders.createIndex({ userId: 1, deleted: 1 })
db.orders.createIndex({ createdAt: -1 })
```

### 6. 订单商品表 (order_items)
```javascript
{
  _id: ObjectId,
  itemId: Number,                   // 订单项ID（自增）
  orderId: Number,                  // 订单ID
  productId: Number,                // 商品ID
  productName: String,              // 商品名称快照
  productImage: String,             // 商品图片快照
  price: Number,                    // 购买时价格
  quantity: Number,                 // 购买数量
  subtotal: Number,                 // 小计金额
  specs: [{                         // 商品规格快照
    name: String,
    value: String
  }],
  createdAt: Date
}

// 索引
db.order_items.createIndex({ itemId: 1 }, { unique: true })
db.order_items.createIndex({ orderId: 1 })
db.order_items.createIndex({ productId: 1 })
```

### 7. 地址表 (addresses)
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
  isDefault: Boolean,               // 是否默认地址，默认false
  createdAt: Date,
  updatedAt: Date
}

// 索引
db.addresses.createIndex({ addressId: 1 }, { unique: true })
db.addresses.createIndex({ userId: 1 })
db.addresses.createIndex({ userId: 1, isDefault: -1 })
```

### 8. 轮播图表 (banners)
```javascript
{
  _id: ObjectId,
  bannerId: Number,                 // 轮播图ID（自增）
  title: String,                    // 标题
  image: String,                    // 图片URL
  link: String,                     // 跳转链接
  sort: Number,                     // 排序权重，数字越大越靠前
  status: Number,                   // 状态：1-启用，0-禁用
  createdAt: Date,
  updatedAt: Date
}

// 索引
db.banners.createIndex({ bannerId: 1 }, { unique: true })
db.banners.createIndex({ status: 1, sort: -1 })
```

### 9. 自增ID计数器表 (counters)
```javascript
// 用于生成自增ID
{
  _id: String,                      // 集合名称：users, products, orders等
  sequence_value: Number            // 当前序列值
}

// 使用示例：获取下一个ID的函数
function getNextSequence(name) {
  const ret = db.counters.findAndModify({
    query: { _id: name },
    update: { $inc: { sequence_value: 1 } },
    new: true,
    upsert: true
  });
  return ret.sequence_value;
}
```

---

## 数据模型说明

### 设计原则
1. **MongoDB特性**：使用ObjectId作为主键，同时维护业务ID（如userId、productId）便于查询
2. **索引优化**：为常用查询字段创建索引，提高查询性能
3. **数据快照**：订单相关表保存商品和地址快照，防止数据变更影响历史订单
4. **软删除**：订单等重要数据使用软删除，保留历史记录
5. **全文搜索**：商品表使用text索引支持全文搜索
6. **唯一约束**：关键字段（用户名、邮箱、订单号）使用唯一索引

### 字段类型说明
- **Number**: 数字类型（整数或浮点数）
- **String**: 字符串类型
- **Boolean**: 布尔类型
- **Date**: 日期时间类型
- **ObjectId**: MongoDB对象ID
- **Array**: 数组类型
- **Object**: 嵌套对象

### 状态码定义
- **用户状态**: 1-正常，0-禁用
- **商品状态**: 1-上架，0-下架
- **订单状态**: 1-待付款，2-待发货，3-待收货，4-已完成，5-已取消
- **分类/轮播图状态**: 1-启用，0-禁用