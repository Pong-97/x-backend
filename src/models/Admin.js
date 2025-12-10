const mongoose = require('mongoose');
const Counter = require('./Counter');

const adminSchema = new mongoose.Schema({
  adminId: { type: Number, unique: true },
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  realName: { type: String, trim: true },
  email: { type: String, sparse: true, unique: true, trim: true },
  phone: { type: String },
  avatar: { type: String },
  status: { type: Number, default: 1 }, // 1-正常，0-禁用
  lastLoginAt: { type: Date },
  lastLoginIp: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 自动生成 adminId
adminSchema.pre('save', async function(next) {
  if (this.isNew) {
    this.adminId = await Counter.getNextSequence('admins');
  }
  this.updatedAt = new Date();
  next();
});

// 创建索引
adminSchema.index({ adminId: 1 }, { unique: true });
adminSchema.index({ username: 1 }, { unique: true });
adminSchema.index({ email: 1 }, { unique: true, sparse: true });
adminSchema.index({ status: 1 });

module.exports = mongoose.model('Admin', adminSchema);
