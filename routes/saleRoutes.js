const express = require("express");
const router = express.Router();

const Sale = require("../models/Sale");
const Product = require("../models/Product");

// Add Sale
router.post("/", async (req, res) => {
  try {
    const {
      customerName,
      phone = "",
      items,
      discount = 0,
      tax = 0,
      note = "",
    } = req.body;

    if (!customerName) {
      return res.status(400).json({
        message: "Customer name is required",
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        message: "No items added",
      });
    }

    // Generate Invoice Number
    const lastSale = await Sale.findOne().sort({
      createdAt: -1,
    });

    let nextNumber = 1;

    if (lastSale?.invoiceNo) {
      nextNumber = parseInt(lastSale.invoiceNo.replace("INV", "")) + 1;
    }

    const invoiceNo = "INV" + String(nextNumber).padStart(3, "0");

    let saleItems = [];
    let subTotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      if (item.qty <= 0) {
        return res.status(400).json({
          message: "Invalid quantity",
        });
      }

      if (product.stock < item.qty) {
        return res.status(400).json({
          message: `${product.productName} stock is insufficient`,
        });
      }

      const total = Number(item.qty) * Number(item.salePrice);

      saleItems.push({
        product: product._id,
        productNo: product.productNo,
        productName: product.productName,
        qty: item.qty,
        salePrice: item.salePrice,
        total,
      });

      subTotal += total;

      // Reduce stock
      product.stock -= item.qty;

      await product.save();
    }

    const grandTotal = subTotal - Number(discount) + Number(tax);

    const sale = await Sale.create({
      invoiceNo,
      customerName,
      phone,
      items: saleItems,
      subTotal,
      discount,
      tax,
      grandTotal,
      note,
    });

    res.status(201).json(sale);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// Get All Sales
router.get("/", async (req, res) => {
  try {
    const sales = await Sale.find().sort({
      createdAt: -1,
    });

    res.json(sales);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// Get Single Sale
router.get("/:id", async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id).populate("items.product");

    if (!sale) {
      return res.status(404).json({
        message: "Sale not found",
      });
    }

    res.json(sale);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// Delete Sale
router.delete("/:id", async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({
        message: "Sale not found",
      });
    }

    // Restore stock
    for (const item of sale.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: {
          stock: item.qty,
        },
      });
    }

    await sale.deleteOne();

    res.json({
      message: "Sale deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;
