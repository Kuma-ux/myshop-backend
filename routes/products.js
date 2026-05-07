const express = require("express");
const router = express.Router();
const router = require("express").Router();
const multer = require("multer");
const Product = require("../models/Product");

// ---------------- MULTER SETUP ----------------
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// ---------------- CREATE PRODUCT ----------------
router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image required" });
    }

    const product = new Product({
      name: req.body.name,
      price: Number(req.body.price), // IMPORTANT FIX
      sellerId: req.body.sellerId,
      image: `/uploads/${req.file.filename}`
    });

    await product.save();
    res.json(product);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;