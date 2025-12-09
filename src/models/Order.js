const mongoose = require('mongoose');
const Counter = require('./Counter');

const orderSchema = new mongoose.Schema({
  orderId: { type: Number, unique: true },
  orderNo: { type: String, required: true, unique: true },
  userId: { type: Number, required: true },
  status: { type: Number, required: true, default: 1 }, // 1-待付款，2-待发货，3-待收货，4-已完成，5-已取消
  totalAmount: { type: Number, required: true },
  remark: { type: String },
  address: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    province: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    detail: { type: String, required: true }
  },
  paymentMethod: { type: String },
  paymentTime: { type: Date },
  deliveryTime: { type: Date },
  receiveTime: { type: Date },
  cancelTime: { type: Date },
  cancelReason: { type: String },
  deleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 自动生成 orderId
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    this.orderId = await Counter.getNextSequence('orders');
  }
  next();
});

// 创建索引
orderSchema.index({ orderId: 1 }, { unique: true });
orderSchema.index({ orderNo: 1 }, { unique: true });
orderSchema.index({ userId: 1, status: 1, deleted: 1 });
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
