const mongoose = require('mongoose');
const Counter = require('./Counter');

const userSchema = new mongoose.Schema({
  userId: { type: Number, unique: true },
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  email: { type: String, sparse: true, unique: true, trim: true },
  phone: { type: String },
  avatar: { type: String },
  status: { type: Number, default: 1 }, // 1-正常，0-禁用
  lastLoginAt: { type: Date },
  lastLoginIp: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 自动生成 userId
userSchema.pre('save', async function(next) {
  if (this.isNew) {
    this.userId = await Counter.getNextSequence('users');
  }
  next();
});

// 创建索引
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ userId: 1 }, { unique: true });
userSchema.index({ status: 1 });

module.exports = mongoose.model('User', userSchema);
