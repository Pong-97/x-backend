/**
 * 统一响应格式中间件
 */
const responseFormatter = (req, res, next) => {
  // 成功响应
  res.success = (data = null, message = 'success') => {
    res.json({
      code: 200,
      message,
      data
    });
  };

  // 错误响应
  res.error = (message = 'error', code = 500) => {
    res.status(code).json({
      code,
      message,
      data: null
    });
  };

  next();
};

module.exports = responseFormatter;
