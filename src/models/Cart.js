const mongoose = require('mongoose');
const Counter = require('./Counter');

const cartSchema = new mongoose.Schema({
  cartId: { type: Number, unique: true },
  userId: { type: Number, required: true },
  productId: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  selected: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 自动生成 cartId
cartSchema.pre('save', async function(next) {
  if (this.isNew) {
    this.cartId = await Counter.getNextSequence('cart');
  }
  next();
});

// 创建索引
cartSchema.index({ cartId: 1 }, { unique: true });
cartSchema.index({ userId: 1 });
cartSchema.index({ userId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model('Cart', cartSchema);
