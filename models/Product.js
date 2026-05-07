const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: String,

  description: {
    type: String,
    default: ""
  },

  price: Number,

  originalPrice: {
    type: Number,
    default: null
  },

  dealText: {
    type: String,
    default: ""
  },

  image: String,

  sellerId: String,

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Product", ProductSchema);