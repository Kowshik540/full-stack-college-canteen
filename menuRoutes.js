const express = require("express");
const router = express.Router();
const Menu = require("../models/Menu");

/* STUDENT MENU */
router.get("/", async (req, res) => {
  try {
    const items = await Menu.find(); // 👈 NO CONDITIONS
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Menu fetch failed" });
  }
});


/* ADMIN MENU */
router.get("/admin", async (req, res) => {
  try {
    const items = await Menu.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Menu fetch failed" });
  }
});
  
/* HIDE ITEM (soft delete) */
router.put("/:id/delete", async (req, res) => {
  const item = await Menu.findById(req.params.id);
  item.available = false;
  item.deleted = true;
  await item.save();
  res.json({ message: "Item hidden" });
});

/* RESTORE ITEM */
router.put("/:id/restore", async (req, res) => {
  const item = await Menu.findById(req.params.id);
  item.available = true;
  item.deleted = false;
  await item.save();
  res.json({ message: "Item restored" });
});

module.exports = router;
