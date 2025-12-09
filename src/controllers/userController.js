const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateUsername, validatePassword, validateEmail, validatePhone } = require('../utils/validator');
const { getDefaultAvatar } = require('../utils/helpers');

// 用户注册
exports.register = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // 参数验证
    const usernameError = validateUsername(username);
    if (usernameError) {
      return res.error(usernameError, 400);
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.error(passwordError, 400);
    }

    if (email) {
      const emailError = validateEmail(email);
      if (emailError) {
        return res.error(emailError, 400);
      }
    }

    // 检查用户名是否已存在
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.error('用户名已存在', 400);
    }

    // 检查邮箱是否已被使用
    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.error('邮箱已被使用', 400);
      }
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = new User({
      username,
      password: hashedPassword,
      email,
      avatar: getDefaultAvatar(email)
    });

    await user.save();

    res.success({ userId: user.userId }, '注册成功');
  } catch (error) {
    console.error('注册错误:', error);
    res.error(error.message, 500);
  }
};

// 用户登录
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 参数验证
    if (!username || !password) {
      return res.error('用户名和密码不能为空', 400);
    }

    // 查询用户
    const user = await User.findOne({ username });
    if (!user) {
      return res.error('用户名或密码错误', 400);
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.error('用户名或密码错误', 400);
    }

    // 生成 token
    const token = jwt.sign(
      { userId: user.userId, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // 更新登录信息
    user.lastLoginAt = new Date();
    user.lastLoginIp = req.ip;
    await user.save();

    // 返回数据
    res.success({
      token,
      userInfo: {
        id: user.userId,
        username: user.username,
        email: user.email,
        avatar: user.avatar
      }
    }, '登录成功');
  } catch (error) {
    console.error('登录错误:', error);
    res.error(error.message, 500);
  }
};

// 获取用户信息
exports.getUserInfo = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.userId }).select('-password -_id -__v');
    
    if (!user) {
      return res.error('用户不存在', 404);
    }

    res.success({
      id: user.userId,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      phone: user.phone,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.error(error.message, 500);
  }
};

// 更新用户信息
exports.updateUserInfo = async (req, res) => {
  try {
    const { username, email, avatar, phone } = req.body;
    const updateData = { updatedAt: new Date() };

    // 验证并更新用户名
    if (username) {
      const usernameError = validateUsername(username);
      if (usernameError) {
        return res.error(usernameError, 400);
      }

      // 检查新用户名是否被其他用户占用
      const existingUser = await User.findOne({ 
        username, 
        userId: { $ne: req.userId } 
      });
      if (existingUser) {
        return res.error('用户名已被占用', 400);
      }

      updateData.username = username;
    }

    // 验证并更新邮箱
    if (email) {
      const emailError = validateEmail(email);
      if (emailError) {
        return res.error(emailError, 400);
      }

      // 检查新邮箱是否被其他用户使用
      const existingEmail = await User.findOne({ 
        email, 
        userId: { $ne: req.userId } 
      });
      if (existingEmail) {
        return res.error('邮箱已被使用', 400);
      }

      updateData.email = email;
    }

    // 验证并更新手机号
    if (phone) {
      const phoneError = validatePhone(phone);
      if (phoneError) {
        return res.error(phoneError, 400);
      }

      updateData.phone = phone;
    }

    // 更新头像
    if (avatar) {
      updateData.avatar = avatar;
    }

    // 执行更新
    await User.findOneAndUpdate(
      { userId: req.userId },
      updateData
    );

    res.success(null, '更新成功');
  } catch (error) {
    console.error('更新用户信息错误:', error);
    res.error(error.message, 500);
  }
};
