const mongoose = require('mongoose');
const Counter = require('./Counter');

const orderItemSchema = new mongoose.Schema({
  itemId: { type: Number, unique: true },
  orderId: { type: Number, required: true },
  productId: { type: Number, required: true },
  productName: { type: String, required: true },
  productImage: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  specs: [{
    name: { type: String },
    value: { type: String }
  }],
  createdAt: { type: Date, default: Date.now }
});

// 自动生成 itemId
orderItemSchema.pre('save', async function(next) {
  if (this.isNew) {
    this.itemId = await Counter.getNextSequence('order_items');
  }
  next();
});

// 创建索引
orderItemSchema.index({ itemId: 1 }, { unique: true });
orderItemSchema.index({ orderId: 1 });
orderItemSchema.index({ productId: 1 });

module.exports = mongoose.model('OrderItem', orderItemSchema);
