const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

/* REGISTER */
router.post("/register", async (req, res) => {
  const { firstName, lastName, rollNumber, email, password } = req.body;

  if (!rollNumber) {
    return res.status(400).json({ message: "Roll number is required" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    firstName,
    lastName,
    rollNumber,     // ✅ STORED HERE
    email,
    password: hashedPassword
  });

  await user.save();
  res.json({ message: "Registered successfully" });
});


/* LOGIN */
router.post("/login", async (req, res) => {
  const { rollNumber, password } = req.body;

  const user = await User.findOne({ rollNumber });
  if (!user) return res.status(401).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: "Wrong password" });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET
  );

  res.json({
    token,
    user: {
      id: user._id,
      name: user.firstName,
      role: user.role
    }
  });
});

module.exports = router;
