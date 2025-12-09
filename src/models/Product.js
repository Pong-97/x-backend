const mongoose = require('mongoose');
const Counter = require('./Counter');

const productSchema = new mongoose.Schema({
  productId: { type: Number, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  image: { type: String },
  images: [{ type: String }],
  description: { type: String },
  detail: { type: String },
  stock: { type: Number, required: true, default: 0 },
  sales: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  categoryId: { type: Number },
  specs: [{
    name: { type: String },
    value: { type: String }
  }],
  status: { type: Number, default: 1 }, // 1-上架，0-下架
  sort: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 自动生成 productId
productSchema.pre('save', async function(next) {
  if (this.isNew) {
    this.productId = await Counter.getNextSequence('products');
  }
  next();
});

// 创建索引
productSchema.index({ productId: 1 }, { unique: true });
productSchema.index({ categoryId: 1, status: 1 });
productSchema.index({ status: 1, sales: -1 });
productSchema.index({ status: 1, createdAt: -1 });
productSchema.index({ status: 1, price: 1 });
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
