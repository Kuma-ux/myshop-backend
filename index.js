const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
console.log("🚀 SERVER STARTING...");
const authRoutes = require("./routes/auth");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/orders");

const Product = require("./models/Product");
const auth = require("./middleware/auth");

const app = express();

/* ---------------- MIDDLEWARE ---------------- */
app.use(cors({
  origin: [
    "https://myshop24.site",
    "https://www.myshop24.site"
    ],
  credentials: true
}));
app.use(express.json());

/* ---------------- ROUTES ---------------- */
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/seller", require("./routes/seller"));

/* ---------------- CONNECT MONGODB ---------------- */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => { console.error("❌ MongoDB connection error:", err); });

/* ---------------- TEST ROUTE ---------------- */
app.get("/", (req, res) => {
  res.send("Amazon Clone API 🚀");
});

/* ---------------- PRODUCT ROUTES ---------------- */

// GET products (optionally filter by seller)
app.get("/api/products", async (req, res) => {
  try {
    const filter = {};

    if (req.query.seller) {
      filter.sellerId = req.query.seller;
    }

    const products = await Product.find(filter);
    res.json(products);

  } catch (err) {
    res.status(500).json({ message: "Error fetching products" });
  }
});

// CREATE PRODUCT (SELLER)
app.post("/api/products", auth, async (req, res) => {
  try {
    const product = new Product({
      ...req.body,
      sellerId: req.userId
    });

    await product.save();
    res.json(product);

  } catch (err) {
    res.status(500).json({ message: "Failed to create product" });
  }
});
// DELETE product (ONLY OWNER)
app.delete("/api/products/:id", auth, async (req, res) => {
  try {
    console.log("🗑️ Deleting:", req.params.id);

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Not found" });
    }

    if (product.sellerId.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: "Deleted" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Delete failed" });
  }
});
/* ---------------- START SERVER ---------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
