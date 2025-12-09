/**
 * 数据验证工具函数
 */

// 验证用户名格式
exports.validateUsername = (username) => {
  if (!username || typeof username !== 'string') {
    return '用户名不能为空';
  }
  if (username.length < 3 || username.length > 20) {
    return '用户名长度必须在3-20个字符之间';
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return '用户名只能包含字母、数字和下划线';
  }
  return null;
};

// 验证密码格式
exports.validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return '密码不能为空';
  }
  if (password.length < 6 || password.length > 20) {
    return '密码长度必须在6-20个字符之间';
  }
  return null;
};

// 验证邮箱格式
exports.validateEmail = (email) => {
  if (!email) return null; // 邮箱可选
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return '邮箱格式不正确';
  }
  return null;
};

// 验证手机号格式
exports.validatePhone = (phone) => {
  if (!phone) return null; // 手机号可选
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    return '手机号格式不正确';
  }
  return null;
};

// 验证正整数
exports.validatePositiveInteger = (value, fieldName = '值') => {
  const num = Number(value);
  if (!Number.isInteger(num) || num <= 0) {
    return `${fieldName}必须是正整数`;
  }
  return null;
};

// 验证非负整数
exports.validateNonNegativeInteger = (value, fieldName = '值') => {
  const num = Number(value);
  if (!Number.isInteger(num) || num < 0) {
    return `${fieldName}必须是非负整数`;
  }
  return null;
};
