const express = require("express");
const jwt = require("jsonwebtoken");
const Order = require("../models/Order");

const router = express.Router();

/* ===== AUTH CHECK ===== */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

/* ===== USER PLACES ORDER ===== */
router.post("/", verifyToken, async (req, res) => {
  try {
    const { items, totalAmount, pickupTime } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Order items required" });
    }

    // ✅ NORMALIZE ITEMS (THIS FIXES UNDEFINED)
    const normalizedItems = items.map(i => ({
      product: i.product || i.name,   // 👈 KEY FIX
      quantity: i.quantity || i.qty,
      price: i.price
    }));

    const order = new Order({
      user: req.user.id,
      items: normalizedItems,
      totalAmount,
      pickupTime
    });

    await order.save();

    res.status(201).json({
      message: "Order placed successfully",
      order
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to place order" });
  }
});


/* ===== USER SEES OWN ORDERS ===== */
router.get("/my", verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

/* ===== ADMIN SEES ALL ORDERS ===== */
router.get("/all", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    const orders = await Order.find()
      .populate("user", "firstName rollNumber")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch all orders" });
  }
});


// 🔁 Update order status (Admin)
router.put("/:id/status", async (req, res) => {
  const { status } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  order.status = status;
  await order.save();

  res.json({ message: "Order status updated" });
});


// Start Preparing
router.put("/:id/preparing", async (req, res) => {
  const order = await Order.findById(req.params.id);
  order.status = "preparing";
  await order.save();
  res.json({ message: "Order is now preparing" });
});

// Mark Completed
router.put("/:id/completed", async (req, res) => {
  const order = await Order.findById(req.params.id);
  order.status = "completed";
  await order.save();
  res.json({ message: "Order completed" });
});


router.put("/:id/status", async (req, res) => {
  const { status } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  order.status = status;
  await order.save();

  res.json({ message: "Order status updated", order });
});


module.exports = router;
