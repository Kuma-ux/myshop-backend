const router = require("express").Router();
const auth = require("../middleware/auth");
const sellerPayout = require("../models/SellerPayout");

// SAVE OR UPDATE payout details
router.post("/payout", auth, async (req, res) => {
  try {
    const existing = await SellerPayout.findOne({ sellerId: req.userId });

    if (existing) {
      existing.payoutMethod = req.body.payoutMethod;
      existing.mpesaNumber = req.body.mpesaNumber;
      existing.paypalEmail = req.body.paypalEmail;
      existing.bankDetails = req.body.bankDetails;

      await existing.save();
      return res.json(existing);
    }

    const payout = new SellerPayout({
      sellerId: req.userId,
      ...req.body
    });

    await payout.save();

    res.json(payout);
  } catch (err) {
    res.status(500).json({ message: "Failed to save payout info" });
  }
});

module.exports = router;
