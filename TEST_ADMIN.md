# 管理端功能测试指南

## 测试前准备

1. 确保服务已启动: `npm run dev`
2. 已初始化管理员账号: `npm run init-admin`
3. 数据库中有测试数据: `npm run seed`

## 测试流程

### 1. 管理员登录测试

```bash
curl -X POST http://localhost:3000/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin@123456"
  }'
```

**预期结果**: 返回 token 和管理员信息

**保存 token**: 将返回的 token 保存到环境变量
```bash
export ADMIN_TOKEN="返回的token"
```

### 2. 获取管理员信息

```bash
curl -X GET http://localhost:3000/admin/auth/info \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**预期结果**: 返回当前管理员详细信息

### 3. 用户管理测试

#### 3.1 获取用户列表
```bash
curl -X GET "http://localhost:3000/admin/user/list?page=1&size=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

#### 3.2 获取用户统计
```bash
curl -X GET http://localhost:3000/admin/user/statistics \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

#### 3.3 修改用户状态（禁用用户ID为1的用户）
```bash
curl -X PUT http://localhost:3000/admin/user/1/status \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": 0}'
```

#### 3.4 恢复用户状态
```bash
curl -X PUT http://localhost:3000/admin/user/1/status \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": 1}'
```

### 4. 商品管理测试

#### 4.1 获取商品列表
```bash
curl -X GET "http://localhost:3000/admin/product/list?page=1&size=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

#### 4.2 获取商品统计
```bash
curl -X GET http://localhost:3000/admin/product/statistics \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

#### 4.3 创建商品
```bash
curl -X POST http://localhost:3000/admin/product \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试商品",
    "price": 99.99,
    "originalPrice": 199.99,
    "description": "这是一个测试商品",
    "stock": 100,
    "categoryId": 1,
    "status": 1
  }'
```

#### 4.4 批量下架商品（假设商品ID为1,2,3）
```bash
curl -X POST http://localhost:3000/admin/product/batch/status \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productIds": [1, 2, 3],
    "status": 0
  }'
```

### 5. 订单管理测试

#### 5.1 获取订单列表
```bash
curl -X GET "http://localhost:3000/admin/order/list?page=1&size=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

#### 5.2 获取订单统计
```bash
curl -X GET http://localhost:3000/admin/order/statistics \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

#### 5.3 获取订单详情（假设订单ID为1）
```bash
curl -X GET http://localhost:3000/admin/order/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

#### 5.4 订单发货（订单ID为1，状态必须是待发货）
```bash
curl -X POST http://localhost:3000/admin/order/1/deliver \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "expressCompany": "顺丰速运",
    "expressNo": "SF1234567890"
  }'
```

#### 5.5 取消订单（订单ID为2，状态必须是待付款或待发货）
```bash
curl -X POST http://localhost:3000/admin/order/2/cancel \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "测试取消订单"
  }'
```

### 6. 分类管理测试

#### 6.1 获取分类列表
```bash
curl -X GET http://localhost:3000/admin/category/list \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

#### 6.2 创建分类
```bash
curl -X POST http://localhost:3000/admin/category \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试分类",
    "icon": "icon-url",
    "sort": 99
  }'
```

#### 6.3 更新分类（假设分类ID为1）
```bash
curl -X PUT http://localhost:3000/admin/category/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "更新后的分类名称",
    "sort": 1
  }'
```

### 7. 操作日志测试

#### 7.1 获取操作日志列表
```bash
curl -X GET "http://localhost:3000/admin/log/list?page=1&size=20" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

#### 7.2 获取日志统计
```bash
curl -X GET http://localhost:3000/admin/log/statistics \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

#### 7.3 按模块筛选日志（查看商品相关操作）
```bash
curl -X GET "http://localhost:3000/admin/log/list?module=product&page=1&size=20" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 8. 修改密码测试

```bash
curl -X POST http://localhost:3000/admin/auth/change-password \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "Admin@123456",
    "newPassword": "NewPassword@123"
  }'
```

**注意**: 修改密码后需要重新登录获取新 token

### 9. 登出测试

```bash
curl -X POST http://localhost:3000/admin/auth/logout \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 10. 登录限流测试

连续尝试5次错误登录，第6次应该被限流：

```bash
for i in {1..6}; do
  echo "尝试 $i:"
  curl -X POST http://localhost:3000/admin/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "username": "admin",
      "password": "wrongpassword"
    }'
  echo ""
  sleep 1
done
```

**预期结果**: 前5次返回密码错误，第6次返回限流提示

## 验证清单

- [ ] 管理员登录成功
- [ ] Token 认证有效
- [ ] 用户列表查询正常
- [ ] 用户状态修改成功
- [ ] 商品列表查询正常
- [ ] 商品创建成功
- [ ] 批量上下架成功
- [ ] 订单列表查询正常
- [ ] 订单发货成功
- [ ] 订单取消成功
- [ ] 分类管理正常
- [ ] 操作日志自动记录
- [ ] 日志查询正常
- [ ] 密码修改成功
- [ ] 登录限流生效
- [ ] 登出成功

## 常见问题

### Q: Token 过期怎么办？
A: 重新登录获取新的 token

### Q: 403 无权限访问？
A: 检查 token 是否正确，是否在 Header 中正确设置

### Q: 订单状态流转失败？
A: 检查订单当前状态，确保符合状态流转规则

### Q: 分类删除失败？
A: 检查该分类下是否有商品，有商品的分类无法删除

## 自动化测试脚本

可以创建一个简单的测试脚本 `test-admin.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"

# 登录获取 token
echo "1. 测试管理员登录..."
RESPONSE=$(curl -s -X POST $BASE_URL/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123456"}')

TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ 登录失败"
  exit 1
fi

echo "✅ 登录成功，Token: ${TOKEN:0:20}..."

# 测试用户列表
echo "2. 测试获取用户列表..."
curl -s -X GET "$BASE_URL/admin/user/list?page=1&size=5" \
  -H "Authorization: Bearer $TOKEN" | grep -q '"code":200'

if [ $? -eq 0 ]; then
  echo "✅ 用户列表获取成功"
else
  echo "❌ 用户列表获取失败"
fi

# 测试商品列表
echo "3. 测试获取商品列表..."
curl -s -X GET "$BASE_URL/admin/product/list?page=1&size=5" \
  -H "Authorization: Bearer $TOKEN" | grep -q '"code":200'

if [ $? -eq 0 ]; then
  echo "✅ 商品列表获取成功"
else
  echo "❌ 商品列表获取失败"
fi

# 测试订单列表
echo "4. 测试获取订单列表..."
curl -s -X GET "$BASE_URL/admin/order/list?page=1&size=5" \
  -H "Authorization: Bearer $TOKEN" | grep -q '"code":200'

if [ $? -eq 0 ]; then
  echo "✅ 订单列表获取成功"
else
  echo "❌ 订单列表获取失败"
fi

# 测试操作日志
echo "5. 测试获取操作日志..."
curl -s -X GET "$BASE_URL/admin/log/list?page=1&size=5" \
  -H "Authorization: Bearer $TOKEN" | grep -q '"code":200'

if [ $? -eq 0 ]; then
  echo "✅ 操作日志获取成功"
else
  echo "❌ 操作日志获取失败"
fi

echo ""
echo "测试完成！"
```

运行: `chmod +x test-admin.sh && ./test-admin.sh`
