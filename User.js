const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  rollNumber: {
    type: String,
    unique: true,
    required: true
  },
  email: String,
  password: String,
  role: {
    type: String,
    enum: ["student", "admin"],
    default: "student"   // 👈 THIS IS WHY ADMIN FAILS
  }
});

module.exports = mongoose.model("User", userSchema);
