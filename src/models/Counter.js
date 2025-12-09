const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  sequence_value: { type: Number, default: 0 }
});

// 获取下一个序列值
counterSchema.statics.getNextSequence = async function(name) {
  const counter = await this.findByIdAndUpdate(
    name,
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  );
  return counter.sequence_value;
};

module.exports = mongoose.model('Counter', counterSchema);
