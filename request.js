const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  ip: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
  content: { type: String, required: true }
}, {
  toJSON: {
    transform: function (doc, ret, game) {
      ret.id = ret._id;
      delete ret.__v;
      delete ret._id;
    }
  }
});

module.exports = mongoose.model('Request', RequestSchema);
