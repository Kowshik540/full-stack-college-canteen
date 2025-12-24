const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  price: {
    type: Number,
    required: true
  },
  category: String,
  image: String,

  // ✅ IMPORTANT DEFAULT FLAGS
  available: {
    type: Boolean,
    default: true
  },
  deleted: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model("Menu", menuSchema);
