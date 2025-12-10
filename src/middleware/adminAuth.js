const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

/**
 * 管理员认证中间件
 * 验证管理员JWT Token并检查账号状态
 */
const adminAuth = async (req, res, next) => {
  try {
    // 1. 获取 token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        code: 401,
        message: '未提供认证令牌',
        data: null
      });
    }

    const token = authHeader.substring(7);

    // 2. 验证 token（使用管理端专用 secret）
    const adminSecret = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET;
    let decoded;
    try {
      decoded = jwt.verify(token, adminSecret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          code: 401,
          message: '认证令牌已过期',
          data: null
        });
      }
      return res.status(401).json({
        code: 401,
        message: '无效的认证令牌',
        data: null
      });
    }

    // 3. 验证是否为管理员 token
    if (decoded.type !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: '无权访问管理端接口',
        data: null
      });
    }

    // 4. 查询管理员信息
    const admin = await Admin.findOne({ adminId: decoded.adminId });
    if (!admin) {
      return res.status(401).json({
        code: 401,
        message: '管理员账号不存在',
        data: null
      });
    }

    // 5. 检查账号状态
    if (admin.status !== 1) {
      return res.status(403).json({
        code: 403,
        message: '管理员账号已被禁用',
        data: null
      });
    }

    // 6. 将管理员信息挂载到 req
    req.admin = {
      adminId: admin.adminId,
      username: admin.username,
      realName: admin.realName,
      email: admin.email
    };

    // 7. 记录请求IP（用于日志）
    req.adminIp = req.headers['x-forwarded-for'] || 
                  req.headers['x-real-ip'] || 
                  req.connection.remoteAddress || 
                  req.socket.remoteAddress;

    next();
  } catch (error) {
    console.error('管理员认证中间件错误:', error);
    res.status(500).json({
      code: 500,
      message: '认证服务异常',
      data: null
    });
  }
};

module.exports = adminAuth;
