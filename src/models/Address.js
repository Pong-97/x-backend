const mongoose = require('mongoose');
const Counter = require('./Counter');

const addressSchema = new mongoose.Schema({
  addressId: { type: Number, unique: true },
  userId: { type: Number, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  province: { type: String, required: true },
  city: { type: String, required: true },
  district: { type: String, required: true },
  detail: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 自动生成 addressId
addressSchema.pre('save', async function(next) {
  if (this.isNew) {
    this.addressId = await Counter.getNextSequence('addresses');
  }
  next();
});

// 创建索引
addressSchema.index({ addressId: 1 }, { unique: true });
addressSchema.index({ userId: 1 });
addressSchema.index({ userId: 1, isDefault: -1, createdAt: -1 });

module.exports = mongoose.model('Address', addressSchema);
