const express = require("express");
const router = express.Router();

const Purchase = require("../models/Purchase");
const Product = require("../models/Product");

// Add Purchase
router.post("/", async (req, res) => {
  try {
    const product = await Product.findById(req.body.product);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }
    const lastPurchase = await Purchase.findOne().sort({
      createdAt: -1,
    });

    let nextNumber = 1;

    if (lastPurchase && lastPurchase.purchaseNo) {
      nextNumber = parseInt(lastPurchase.purchaseNo.replace("PUR", "")) + 1;
    }

    const purchaseNo = "PUR" + String(nextNumber).padStart(3, "0");

    const purchase = await Purchase.create({
      purchaseNo,

      supplier: req.body.supplier,

      product: product._id,

      productNo: product.productNo,

      productName: product.productName,

      qty: req.body.qty,

      purchasePrice: req.body.purchasePrice,

      total: req.body.qty * req.body.purchasePrice,

      note: req.body.note,
    });

    product.stock += Number(req.body.qty);

    await product.save();

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
    const purchases = await Purchase.find().populate("product").sort({
      createdAt: -1,
    });

    res.json(purchases);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// Delete Purchase
router.delete("/:id", async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);

    if (!purchase) {
      return res.status(404).json({
        message: "Purchase not found",
      });
    }

    const product = await Product.findById(purchase.product);

    if (product) {
      product.stock -= purchase.qty;

      if (product.stock < 0) {
        product.stock = 0;
      }

      await product.save();
    }

    await purchase.deleteOne();

    res.json({
      message: "Purchase deleted",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// Single Purchase

router.get("/:id", async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id).populate("product");

    if (!purchase) {
      return res.status(404).json({
        message: "Purchase not found",
      });
    }

    res.json(purchase);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;
