# 电商系统后端 API

基于 Node.js + Express + MongoDB 的完整电商系统后端服务。

## 项目简介

这是一个功能完整的电商系统后端 API，包含**用户端**和**管理端**两套完整的接口系统：

- **用户端**: 用户认证、商品浏览、购物车、订单处理、地址管理等核心功能
- **管理端**: 用户管理、商品管理、订单管理、分类管理、操作日志等后台管理功能

采用 RESTful API 设计，支持 JWT 认证，使用 MongoDB 数据库。

## 技术栈

- **Node.js** - JavaScript 运行环境
- **Express** - Web 应用框架
- **MongoDB** - NoSQL 数据库
- **Mongoose** - MongoDB ODM
- **JWT** - 身份认证
- **bcryptjs** - 密码加密

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 启动服务
```bash
# 开发模式（推荐）
npm run dev

# 或使用启动脚本
./start.sh

# 生产模式
npm start
```

### 3. 初始化数据
```bash
# 初始化测试数据（可选）
npm run seed

# 初始化管理员账号（必须）
npm run init-admin
```

服务将在 `http://localhost:3000` 启动。

**管理员默认账号**: `admin / Admin@123456` （首次登录后请立即修改密码）

## 主要功能

### 用户端功能
✅ **用户模块** - 注册、登录、信息管理  
✅ **商品模块** - 列表、详情、搜索、分类  
✅ **购物车** - 添加、更新、删除、库存检查  
✅ **订单管理** - 创建、查询、取消、确认收货  
✅ **地址管理** - CRUD 操作、默认地址  
✅ **首页数据** - 轮播图、分类、热门商品、新品

### 管理端功能
✅ **管理员认证** - 登录、登出、密码修改、登录限流  
✅ **用户管理** - 列表、详情、状态控制、统计分析  
✅ **商品管理** - CRUD、批量上下架、库存预警、统计  
✅ **订单管理** - 列表、详情、状态流转、发货、取消  
✅ **分类管理** - CRUD、商品数量统计  
✅ **地址管理** - 查看用户地址  
✅ **操作日志** - 自动记录、查询、统计

## API 接口

### 用户端接口（24个）
- `/user/*` - 用户相关
- `/product/*` - 商品相关
- `/category/*` - 分类相关
- `/cart/*` - 购物车相关
- `/order/*` - 订单相关
- `/address/*` - 地址相关
- `/home` - 首页数据

### 管理端接口（30+个）
- `/admin/auth/*` - 管理员认证
- `/admin/user/*` - 用户管理
- `/admin/product/*` - 商品管理
- `/admin/order/*` - 订单管理
- `/admin/category/*` - 分类管理
- `/admin/address/*` - 地址管理
- `/admin/log/*` - 操作日志

详见：[用户端 API 文档](./api.md) | [管理端 API 文档](./ADMIN_API.md)

## 项目文档

### 用户端文档
- 📖 [完整后端文档](./README_BACKEND.md)
- 🚀 [安装启动指南](./SETUP.md)
- 📊 [项目总结](./PROJECT_SUMMARY.md)
- ✅ [验证清单](./CHECKLIST.md)
- 🗄️ [数据库设计](./mongodb-design.md)
- 📮 [Postman 集合](./postman_collection.json)

### 管理端文档
- 🔐 [管理端 README](./ADMIN_README.md)
- 📡 [管理端 API 文档](./ADMIN_API.md)
- 📝 [环境变量示例](./.env.example)

## Environment

This project runs on a Debian 12 system with Node.js, which is pre-configured in the Devbox environment. You don't need to worry about setting up Node.js or system dependencies yourself. The development environment includes all necessary tools for building and running Node.js applications. If you need to make adjustments to match your specific requirements, you can modify the configuration files accordingly.

## Project Execution
**Development mode:** For normal development environment, simply enter Devbox and run `bash entrypoint.sh` in the terminal.
**Production mode:** After release, the project will be automatically packaged into a Docker image and deployed according to the `entrypoint.sh` script and command parameters.

Within Devbox, you only need to focus on development - you can trust that everything is application-ready XD


DevBox: Code. Build. Deploy. We've Got the Rest.

With DevBox, you can focus entirely on writing great code while we handle the infrastructure, scaling, and deployment. Seamless development from start to production. 