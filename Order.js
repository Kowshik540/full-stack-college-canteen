const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  referenceNumber: String,

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  items: [
    {
      product: String,   // ✅ THIS
      quantity: Number,
      price: Number
    }
  ],

  totalAmount: Number,
  pickupTime: String,

  status: {
    type: String,
    enum: ["pending", "preparing", "completed"],
    default: "pending"
  }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
