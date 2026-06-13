const express = require("express");
const router = express.Router();

const Purchase = require("../models/Purchase");
const Product = require("../models/Product");

// Add Purchase
router.post("/", async (req, res) => {
  try {
    const { supplier, items, discount = 0, tax = 0, note = "" } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        message: "No items added",
      });
    }

    // Generate Purchase Number
    const lastPurchase = await Purchase.findOne().sort({
      createdAt: -1,
    });

    let nextNumber = 1;

    if (lastPurchase && lastPurchase.purchaseNo) {
      nextNumber = parseInt(lastPurchase.purchaseNo.replace("PUR", "")) + 1;
    }

    const purchaseNo = "PUR" + String(nextNumber).padStart(3, "0");

    let purchaseItems = [];
    let subTotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      const total = item.qty * item.purchasePrice;

      purchaseItems.push({
        product: product._id,
        productNo: product.productNo,
        productName: product.productName,
        qty: item.qty,
        purchasePrice: item.purchasePrice,
        total,
      });

      subTotal += total;

      // Increase stock
      product.stock += Number(item.qty);

      await product.save();
    }

    const grandTotal = subTotal - discount + tax;

    const purchase = await Purchase.create({
      purchaseNo,
      supplier,
      items: purchaseItems,
      subTotal,
      discount,
      tax,
      grandTotal,
      note,
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
    const purchases = await Purchase.find().sort({
      createdAt: -1,
    });

    res.json(purchases);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// Single Purchase
router.get("/:id", async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id).populate(
      "items.product",
    );

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

// Delete Purchase
router.delete("/:id", async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);

    if (!purchase) {
      return res.status(404).json({
        message: "Purchase not found",
      });
    }

    // Restore stock
    for (const item of purchase.items) {
      const product = await Product.findById(item.product);

      if (product) {
        product.stock -= item.qty;

        if (product.stock < 0) {
          product.stock = 0;
        }

        await product.save();
      }
    }

    await purchase.deleteOne();

    res.json({
      message: "Purchase deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;
