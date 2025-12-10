const mongoose = require('mongoose');
const Counter = require('./Counter');

const adminLogSchema = new mongoose.Schema({
  logId: { type: Number, unique: true },
  adminId: { type: Number, required: true },
  adminName: { type: String, required: true }, // 冗余字段，便于查询
  action: { type: String, required: true }, // create, update, delete, login, logout
  module: { type: String, required: true }, // user, product, order, category, banner, system
  targetId: { type: String }, // 操作对象ID
  content: { type: String }, // 操作描述
  ip: { type: String },
  userAgent: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// 自动生成 logId
adminLogSchema.pre('save', async function(next) {
  if (this.isNew) {
    this.logId = await Counter.getNextSequence('adminLogs');
  }
  next();
});

// 创建索引
adminLogSchema.index({ logId: 1 }, { unique: true });
adminLogSchema.index({ adminId: 1, createdAt: -1 });
adminLogSchema.index({ module: 1, action: 1, createdAt: -1 });
adminLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AdminLog', adminLogSchema);
