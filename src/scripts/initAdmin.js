const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const Admin = require('../models/Admin');
const connectDB = require('../config/database');

// 加载环境变量
dotenv.config();

/**
 * 初始化管理员账号脚本
 * 创建默认的超级管理员账号
 */
async function initAdmin() {
  try {
    console.log('开始初始化管理员账号...\n');

    // 连接数据库
    await connectDB();

    // 检查是否已存在管理员
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  管理员账号已存在！');
      console.log('用户名: admin');
      console.log('如需重置密码，请手动删除该账号后重新运行此脚本\n');
      process.exit(0);
    }

    // 默认密码
    const defaultPassword = 'Admin@123456';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // 创建管理员
    const admin = await Admin.create({
      username: 'admin',
      password: hashedPassword,
      realName: '超级管理员',
      email: 'admin@example.com',
      status: 1
    });

    console.log('✅ 管理员账号创建成功！\n');
    console.log('='.repeat(50));
    console.log('登录信息：');
    console.log('='.repeat(50));
    console.log(`用户名: ${admin.username}`);
    console.log(`密码: ${defaultPassword}`);
    console.log(`管理员ID: ${admin.adminId}`);
    console.log('='.repeat(50));
    console.log('\n⚠️  重要提示：');
    console.log('1. 请立即登录并修改默认密码');
    console.log('2. 请妥善保管管理员账号信息');
    console.log('3. 建议在 .env 文件中配置独立的 ADMIN_JWT_SECRET\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ 初始化管理员失败:', error.message);
    process.exit(1);
  }
}

// 执行初始化
initAdmin();
