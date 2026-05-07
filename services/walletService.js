const Wallet = require("../models/Wallet");

async function creditSellerWallet(order) {
  const platformFeeRate = 0.15;

  for (let item of order.items) {
    const itemTotal = item.price * item.quantity;
    const sellerAmount = itemTotal * (1 - platformFeeRate);

    let wallet = await Wallet.findOne({ sellerId: item.sellerId });

    if (!wallet) {
      wallet = new Wallet({ sellerId: item.sellerId });
    }

    wallet.balance += sellerAmount;
    wallet.totalEarned += sellerAmount;

    await wallet.save();
  }
}

module.exports = { creditSellerWallet };