const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  balance: { type: Number, default: 0 },

  pendingBalance: { type: Number, default: 0 },

  totalEarned: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Wallet", walletSchema);