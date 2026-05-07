const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
      },

      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },

      sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },

      sellerEarning: {
        type: Number,
        default: 0
      }
    }
  ],

  total: {
    type: Number,
    required: true
  },

  currency: {
    type: String,
    default: "USD"
  },

  status: {
    type: String,
    enum: ["pending", "processing", "shipped", "delivered"],
    default: "pending"
  },

  payment: {
    method: {
      type: String,
      enum: ["stripe", "paypal", "mpesa", "none"],
      default: "none"
    },

    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending"
    },

    reference: String
  },

  totalPlatformFee: {
    type: Number,
    default: 0
  },

  totalSellerRevenue: {
    type: Number,
    default: 0
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Order", orderSchema);