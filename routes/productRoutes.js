const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// Add Product
router.post("/", async (req, res) => {
  try {
    const lastProduct = await Product.findOne().sort({
      createdAt: -1,
    });

    let nextNumber = 1;

    if (lastProduct && lastProduct.productNo) {
      nextNumber = parseInt(lastProduct.productNo.replace("P", "")) + 1;
    }

    const productNo = "P" + String(nextNumber).padStart(3, "0");

    const product = await Product.create({
      ...req.body,
      productNo,
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({
      createdAt: -1,
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update Products
router.put("/:id", async (req, res) => {
  try {
    delete req.body.productNo;

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

//Delete Products
router.delete("/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);

    res.json({
      message: "Product deleted",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

//Get Single Products
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;
