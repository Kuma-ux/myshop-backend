const Product = require("../models/Product");
const Order = require("../models/Order");
const auth = require("../middleware/auth");
const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const { creditSellerWallet } = require("../services/walletService");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const paypal = require("@paypal/checkout-server-sdk");

const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);

const client = new paypal.core.PayPalHttpClient(environment);

console.log("📦 ORDERS ROUTE LOADED");

/* ---------------- CREATE ORDER ---------------- */
router.post("/", auth, async (req, res) => {
  console.log("🔥 ORDER ROUTE HIT");

  try {
    const populatedItems = await Promise.all(
      req.body.items.map(async (item) => {
        const productId = item.productId || item._id;
        const product = await Product.findById(productId);

        return {
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          sellerId: product.sellerId,
        };
      })
    );

    const total = req.body.total;

    const platformFee = Math.round(total * 0.15 * 100) / 100;
    const sellerRevenue = Math.round((total - platformFee) * 100) / 100;

    const order = new Order({
      userId: req.userId,
      items: populatedItems,
      total,
      platformFee,
      sellerRevenue
    });

    await order.save();
    await creditSellerWallet(order);

    res.json(order);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Order failed" });
  }
});

router.get("/", auth, async (req, res) => {
  const orders = await Order.find({ userId: req.userId });
  res.json(orders);
});

/* ---------------- GET SELLER ORDERS ---------------- */
router.get("/seller", auth, async (req, res) => {
  try {
    console.log("🔥 SELLER ORDERS HIT");

    const orders = await Order.find({
      "items.sellerId": req.userId
    });

    // Only return items belonging to THIS seller
    const filtered = orders.map(order => ({
      ...order._doc,
      items: order.items.filter(
        item => item.sellerId?.toString() === req.userId
      )
    }));

    res.json(filtered);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to fetch seller orders" });
  }
});


/* ---------------- UPDATE ORDER STATUS ---------------- */
router.put("/status/:id", auth, async (req, res) => {
  try {
    console.log("🔥 STATUS UPDATE HIT");

    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to update status" });
  }
});

router.post("/pay/mpesa", auth, async (req, res) => {
  const { orderId, phone } = req.body;

  console.log("📱 MPESA REQUEST:", orderId, phone);

  res.json({ message: "MPESA STK push simulated" });
});
router.post("/pay/stripe", auth, async (req, res) => {
  try {
    const { orderId } = req.body;

    console.log("🔥 STRIPE ROUTE HIT");

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: order.items.map(item => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    });

    order.payment = {
      method: "stripe",
      status: "pending",
    };

    await order.save();

    res.json({ url: session.url });
  } catch (err) {
    console.error("❌ STRIPE ERROR:", err);
    res.status(500).json({ message: "Stripe checkout failed" });
  }
});
router.post("/pay/paypal", auth, async (req, res) => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId);

  const request = new paypal.orders.OrdersCreateRequest();
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: order.total.toString()
        }
      }
    ]
  });

  const response = await client.execute(request);

  order.payment.method = "paypal";
  await order.save();

  res.json({ id: response.result.id });
});
router.post("/stripe/webhook", express.raw({ type: "application/json" }), (req, res) => {
  const event = req.body;

  if (event.type === "checkout.session.completed") {
    console.log("💰 Stripe payment success");
  }

  res.json({ received: true });
});

module.exports = router;