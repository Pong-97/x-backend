#!/bin/bash

echo "================================"
echo "  电商系统后端启动脚本"
echo "================================"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未安装 Node.js"
    echo "请先安装 Node.js (https://nodejs.org/)"
    exit 1
fi

echo "✓ Node.js 版本: $(node --version)"
echo "✓ npm 版本: $(npm --version)"
echo ""

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 正在安装依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
    echo "✓ 依赖安装完成"
    echo ""
fi

# 检查环境变量文件
if [ ! -f ".env" ]; then
    echo "❌ 错误: .env 文件不存在"
    exit 1
fi

echo "✓ 环境配置已就绪"
echo ""

# 询问是否初始化测试数据
read -p "是否初始化测试数据? (y/n): " init_data
if [ "$init_data" = "y" ] || [ "$init_data" = "Y" ]; then
    echo ""
    echo "📊 正在初始化测试数据..."
    npm run seed
    echo ""
fi

# 启动服务
echo "🚀 正在启动服务..."
echo "================================"
echo ""

npm run dev
