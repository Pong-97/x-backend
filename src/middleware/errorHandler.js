/**
 * 全局错误处理中间件
 */
const errorHandler = (err, req, res, next) => {
  console.error('错误:', err);

  // Mongoose 验证错误
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      code: 400,
      message: messages.join(', '),
      data: null
    });
  }

  // Mongoose 重复键错误
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      code: 400,
      message: `${field} 已存在`,
      data: null
    });
  }

  // JWT 错误
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      code: 401,
      message: 'Token 无效',
      data: null
    });
  }

  // 默认服务器错误
  res.status(500).json({
    code: 500,
    message: err.message || '服务器内部错误',
    data: null
  });
};

module.exports = errorHandler;
