const express = require("express");
const router = express.Router();

const Sale = require("../models/Sale");
const Product = require("../models/Product");

// Add Sale
router.post("/", async (req, res) => {
  try {
    const product = await Product.findById(req.body.product);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (product.stock < req.body.qty) {
      return res.status(400).json({
        message: "Insufficient Stock",
      });
    }

    const sale = await Sale.create(req.body);

    await Product.findByIdAndUpdate(req.body.product, {
      $inc: {
        stock: -req.body.qty,
      },
    });

    res.status(201).json(sale);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// Get Sales
router.get("/", async (req, res) => {
  try {
    const sales = await Sale.find().populate("product");

    res.json(sales);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;
