const jwt = require('jsonwebtoken');

/**
 * JWT 认证中间件
 */
const authMiddleware = (req, res, next) => {
  try {
    // 从请求头获取 token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        code: 401,
        message: '未授权，请先登录',
        data: null
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // 验证 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 将用户信息添加到请求对象
    req.userId = decoded.userId;
    req.username = decoded.username;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        code: 401,
        message: 'Token 已过期，请重新登录',
        data: null
      });
    }
    
    return res.status(401).json({
      code: 401,
      message: 'Token 无效',
      data: null
    });
  }
};

module.exports = authMiddleware;
