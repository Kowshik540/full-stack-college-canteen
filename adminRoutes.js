const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

// 📊 Monthly Stats
router.get("/stats/monthly", async (req, res) => {
  try {
    const now = new Date();

    // Start of current month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Start of next month
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const orders = await Order.find({
      createdAt: {
        $gte: startOfMonth,
        $lt: startOfNextMonth
      }
    });

    const monthlyOrders = orders.length;

    const monthlyRevenue = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    res.json({
      monthlyOrders,
      monthlyRevenue
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch monthly stats" });
  }
});

module.exports = router;
