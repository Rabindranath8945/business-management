const express = require("express");
const router = express.Router();

const Purchase = require("../models/Purchase");
const Product = require("../models/Product");

// Add Purchase
router.post("/", async (req, res) => {
  try {
    const purchase = await Purchase.create(req.body);

    await Product.findByIdAndUpdate(req.body.product, {
      $inc: {
        stock: req.body.qty,
      },
    });

    res.status(201).json(purchase);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// Get Purchases
router.get("/", async (req, res) => {
  try {
    const purchases = await Purchase.find().populate("product");

    res.json(purchases);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;
