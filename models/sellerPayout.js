const mongoose = require("mongoose");

const sellerPayoutSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  payoutMethod: {
    type: String,
    enum: ["mpesa", "paypal", "bank"],
    required: true
  },

  mpesaNumber: String,
  paypalEmail: String,

  bankDetails: {
    accountName: String,
    accountNumber: String,
    bankName: String
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("SellerPayout", sellerPayoutSchema);