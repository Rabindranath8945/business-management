const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const XLSX = require("xlsx");
const upload = require("../middleware/upload");

// Add Product
router.post("/", async (req, res) => {
  try {
    const lastProduct = await Product.findOne().sort({
      productNo: -1,
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

// Upload Products via Excel
router.post("/import", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload an Excel file",
      });
    }
    const workbook = XLSX.read(req.file.buffer, {
      type: "buffer",
    });

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);
    console.log(rows[0]); // Debug Excel headers
    let imported = 0;
    let skipped = 0;

    for (const row of rows) {
      const name = row["Item Name"];

      if (!name) continue;

      const existing = await Product.findOne({
        productName: {
          $regex: `^${name.trim()}$`,
          $options: "i",
        },
      });

      if (existing) {
        skipped++;
        continue;
      }

      const count = await Product.countDocuments();

      const productNo = "P" + String(count + 1).padStart(3, "0");

      await Product.create({
        productNo,
        productName: name.trim(),
        category: "",
        hsn: "",
        purchasePrice: isNaN(Number(row["Purchase Price"]))
          ? 0
          : Number(row["Purchase Price"]),

        salePrice: isNaN(Number(row["Sale Price"]))
          ? 0
          : Number(row["Sale Price"]),

        stock: isNaN(Number(row["Stock"])) ? 0 : Number(row["Stock"]),
        unit: "PCS",
        gstRate: 0,
        minStock: 0,
        isActive: true,
      });

      imported++;
    }

    res.json({
      message: "Import completed successfully",
      imported,
      skipped,
      total: rows.length,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
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
