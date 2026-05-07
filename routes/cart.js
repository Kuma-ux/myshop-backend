const router = require("express").Router();
const User = require("../models/User");
const auth = require("../middleware/auth");

/* ---------------- GET CART ---------------- */
router.get("/", auth, async (req, res) => {
  const user = await User.findById(req.userId);
  res.json(user.cart);
});

/* ---------------- ADD TO CART ---------------- */
router.post("/add", auth, async (req, res) => {
  const user = await User.findById(req.userId);

  const item = req.body;

  const existing = user.cart.find(
    (p) => p.productId === item.productId
  );

  if (existing) {
    existing.quantity += 1;
  } else {
    user.cart.push(item);
  }

  await user.save();
  res.json(user.cart);
});

/* ---------------- REMOVE ITEM ---------------- */
router.post("/remove", auth, async (req, res) => {
  const user = await User.findById(req.userId);

  user.cart = user.cart.filter(
    (p) => p.productId !== req.body.productId
  );

  await user.save();
  res.json(user.cart);
});

module.exports = router;