const mongoose = require('mongoose');
const Counter = require('./Counter');

const categorySchema = new mongoose.Schema({
  categoryId: { type: Number, unique: true },
  name: { type: String, required: true },
  icon: { type: String },
  parentId: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  sort: { type: Number, default: 0 },
  status: { type: Number, default: 1 }, // 1-启用，0-禁用
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 自动生成 categoryId
categorySchema.pre('save', async function(next) {
  if (this.isNew) {
    this.categoryId = await Counter.getNextSequence('categories');
  }
  next();
});

// 创建索引
categorySchema.index({ categoryId: 1 }, { unique: true });
categorySchema.index({ parentId: 1, status: 1 });
categorySchema.index({ status: 1, sort: -1 });

module.exports = mongoose.model('Category', categorySchema);
