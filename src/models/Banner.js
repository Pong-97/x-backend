const mongoose = require('mongoose');
const Counter = require('./Counter');

const bannerSchema = new mongoose.Schema({
  bannerId: { type: Number, unique: true },
  title: { type: String, required: true },
  image: { type: String, required: true },
  link: { type: String },
  sort: { type: Number, default: 0 },
  status: { type: Number, default: 1 }, // 1-启用，0-禁用
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 自动生成 bannerId
bannerSchema.pre('save', async function(next) {
  if (this.isNew) {
    this.bannerId = await Counter.getNextSequence('banners');
  }
  next();
});

// 创建索引
bannerSchema.index({ bannerId: 1 }, { unique: true });
bannerSchema.index({ status: 1, sort: -1 });

module.exports = mongoose.model('Banner', bannerSchema);
