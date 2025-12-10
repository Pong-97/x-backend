const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../../models/Admin');
const AdminLog = require('../../models/AdminLog');

/**
 * 管理员登录
 */
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 参数验证
    if (!username || !password) {
      return res.status(400).json({
        code: 400,
        message: '用户名和密码不能为空',
        data: null
      });
    }

    // 查询管理员
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误',
        data: null
      });
    }

    // 检查账号状态
    if (admin.status !== 1) {
      return res.status(403).json({
        code: 403,
        message: '账号已被禁用，请联系超级管理员',
        data: null
      });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误',
        data: null
      });
    }

    // 生成 JWT Token
    const adminSecret = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET;
    const expiresIn = process.env.ADMIN_JWT_EXPIRES_IN || '2h';
    
    const token = jwt.sign(
      {
        adminId: admin.adminId,
        username: admin.username,
        type: 'admin'
      },
      adminSecret,
      { expiresIn }
    );

    // 更新最后登录信息
    const loginIp = req.headers['x-forwarded-for'] || 
                    req.headers['x-real-ip'] || 
                    req.connection.remoteAddress || 
                    req.socket.remoteAddress;
    
    admin.lastLoginAt = new Date();
    admin.lastLoginIp = loginIp;
    await admin.save();

    // 记录登录日志
    await AdminLog.create({
      adminId: admin.adminId,
      adminName: admin.username,
      action: 'login',
      module: 'admin',
      content: '管理员登录',
      ip: loginIp,
      userAgent: req.headers['user-agent'] || ''
    });

    // 返回结果（不返回密码）
    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        admin: {
          adminId: admin.adminId,
          username: admin.username,
          realName: admin.realName,
          email: admin.email,
          phone: admin.phone,
          avatar: admin.avatar,
          lastLoginAt: admin.lastLoginAt
        }
      }
    });
  } catch (error) {
    console.error('管理员登录错误:', error);
    res.status(500).json({
      code: 500,
      message: '登录失败',
      data: null
    });
  }
};

/**
 * 获取当前管理员信息
 */
exports.getInfo = async (req, res) => {
  try {
    const admin = await Admin.findOne(
      { adminId: req.admin.adminId },
      { password: 0, _id: 0, __v: 0 }
    );

    if (!admin) {
      return res.status(404).json({
        code: 404,
        message: '管理员不存在',
        data: null
      });
    }

    res.json({
      code: 200,
      message: '获取成功',
      data: admin
    });
  } catch (error) {
    console.error('获取管理员信息错误:', error);
    res.status(500).json({
      code: 500,
      message: '获取信息失败',
      data: null
    });
  }
};

/**
 * 管理员登出
 */
exports.logout = async (req, res) => {
  try {
    // 记录登出日志
    await AdminLog.create({
      adminId: req.admin.adminId,
      adminName: req.admin.username,
      action: 'logout',
      module: 'admin',
      content: '管理员登出',
      ip: req.adminIp || req.ip,
      userAgent: req.headers['user-agent'] || ''
    });

    res.json({
      code: 200,
      message: '登出成功',
      data: null
    });
  } catch (error) {
    console.error('管理员登出错误:', error);
    res.status(500).json({
      code: 500,
      message: '登出失败',
      data: null
    });
  }
};

/**
 * 修改密码
 */
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // 参数验证
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        code: 400,
        message: '旧密码和新密码不能为空',
        data: null
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        code: 400,
        message: '新密码长度不能少于6位',
        data: null
      });
    }

    // 查询管理员
    const admin = await Admin.findOne({ adminId: req.admin.adminId });
    if (!admin) {
      return res.status(404).json({
        code: 404,
        message: '管理员不存在',
        data: null
      });
    }

    // 验证旧密码
    const isPasswordValid = await bcrypt.compare(oldPassword, admin.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        code: 400,
        message: '旧密码错误',
        data: null
      });
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedPassword;
    await admin.save();

    // 记录操作日志
    await AdminLog.create({
      adminId: req.admin.adminId,
      adminName: req.admin.username,
      action: 'update',
      module: 'admin',
      content: '修改密码',
      ip: req.adminIp || req.ip,
      userAgent: req.headers['user-agent'] || ''
    });

    res.json({
      code: 200,
      message: '密码修改成功',
      data: null
    });
  } catch (error) {
    console.error('修改密码错误:', error);
    res.status(500).json({
      code: 500,
      message: '修改密码失败',
      data: null
    });
  }
};
