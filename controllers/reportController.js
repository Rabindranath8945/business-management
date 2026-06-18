const Sale = require("../models/Sale");
const Purchase = require("../models/Purchase");
const Product = require("../models/Product");

exports.getSalesReport = async (req, res) => {
  try {
    const { from, to, customer } = req.query;

    const filter = {};

    if (from || to) {
      filter.saleDate = {};

      if (from) {
        filter.saleDate.$gte = new Date(from);
      }

      if (to) {
        const endDate = new Date(to);
        endDate.setHours(23, 59, 59, 999);
        filter.saleDate.$lte = endDate;
      }
    }

    if (customer) {
      filter.customerName = {
        $regex: customer,
        $options: "i",
      };
    }

    const sales = await Sale.find(filter).sort({ saleDate: -1 });

    const summary = {
      totalInvoices: sales.length,
      totalSales: 0,
      totalDiscount: 0,
      totalTax: 0,
      totalQty: 0,
      averageInvoiceValue: 0,
    };

    sales.forEach((sale) => {
      summary.totalSales += sale.grandTotal || 0;
      summary.totalDiscount += sale.discount || 0;
      summary.totalTax += sale.tax || 0;
      summary.averageInvoiceValue =
        summary.totalInvoices > 0
          ? Number((summary.totalSales / summary.totalInvoices).toFixed(2))
          : 0;

      sale.items.forEach((item) => {
        summary.totalQty += item.qty || 0;
      });
    });

    res.status(200).json({
      success: true,
      summary,
      sales,
    });
  } catch (error) {
    console.error("Sales Report Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getPurchaseReport = async (req, res) => {
  try {
    const { from, to, supplier } = req.query;

    const filter = {};

    if (from || to) {
      filter.purchaseDate = {};

      if (from) {
        filter.purchaseDate.$gte = new Date(from);
      }

      if (to) {
        const endDate = new Date(to);
        endDate.setHours(23, 59, 59, 999);
        filter.purchaseDate.$lte = endDate;
      }
    }

    if (supplier) {
      filter.supplier = {
        $regex: supplier,
        $options: "i",
      };
    }

    const purchases = await Purchase.find(filter).sort({ purchaseDate: -1 });

    const summary = {
      totalBills: purchases.length,
      totalPurchase: 0,
      totalDiscount: 0,
      totalTax: 0,
      totalQty: 0,
      averageBillValue: 0,
    };

    purchases.forEach((purchase) => {
      summary.totalPurchase += purchase.grandTotal || 0;
      summary.totalDiscount += purchase.discount || 0;
      summary.totalTax += purchase.tax || 0;

      purchase.items.forEach((item) => {
        summary.totalQty += item.qty || 0;
      });
    });

    summary.averageBillValue =
      summary.totalBills > 0
        ? Number((summary.totalPurchase / summary.totalBills).toFixed(2))
        : 0;

    res.status(200).json({
      success: true,
      summary,
      purchases,
    });
  } catch (error) {
    console.error("Purchase Report Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getStockReport = async (req, res) => {
  try {
    const products = await Product.find().sort({ productName: 1 });

    const summary = {
      totalProducts: products.length,
      totalStockQty: 0,
      totalStockValue: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
    };

    const stockReport = products.map((product) => {
      const stockValue = product.stock * product.purchasePrice;

      summary.totalStockQty += product.stock;
      summary.totalStockValue += stockValue;

      if (product.stock <= product.minStock) {
        summary.lowStockCount++;
      }

      if (product.stock <= 0) {
        summary.outOfStockCount++;
      }

      let status = "In Stock";

      if (product.stock <= 0) {
        status = "Out Of Stock";
      } else if (product.stock <= product.minStock) {
        status = "Low Stock";
      }

      return {
        _id: product._id,
        productNo: product.productNo,
        productName: product.productName,
        category: product.category,
        stock: product.stock,
        minStock: product.minStock,
        purchasePrice: product.purchasePrice,
        salePrice: product.salePrice,
        stockValue,
        status,
      };
    });

    res.status(200).json({
      success: true,
      summary,
      products: stockReport,
    });
  } catch (error) {
    console.error("Stock Report Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getLowStockReport = async (req, res) => {
  try {
    const products = await Product.find({
      minStock: { $gt: 0 },
    }).sort({ productName: 1 });

    const lowStockProducts = products.filter((p) => p.stock <= p.minStock);

    res.status(200).json({
      success: true,
      count: lowStockProducts.length,
      products: lowStockProducts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getOutOfStockReport = async (req, res) => {
  try {
    const products = await Product.find({
      stock: { $lte: 0 },
    }).sort({ productName: 1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getStockValueReport = async (req, res) => {
  try {
    const products = await Product.find().sort({ productName: 1 });

    let totalStockValue = 0;

    const data = products.map((product) => {
      const stockValue = product.stock * product.purchasePrice;

      totalStockValue += stockValue;

      return {
        _id: product._id,
        productNo: product.productNo,
        productName: product.productName,
        stock: product.stock,
        purchasePrice: product.purchasePrice,
        stockValue,
      };
    });

    res.status(200).json({
      success: true,
      totalStockValue,
      products: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.getInventoryMovementReport = async (req, res) => {
  try {
    const products = await Product.find().sort({ productName: 1 });

    const purchases = await Purchase.find();
    const sales = await Sale.find();

    const report = products.map((product) => {
      let purchasedQty = 0;
      let soldQty = 0;

      purchases.forEach((purchase) => {
        purchase.items.forEach((item) => {
          if (
            item.product &&
            item.product.toString() === product._id.toString()
          ) {
            purchasedQty += item.qty;
          }
        });
      });

      sales.forEach((sale) => {
        sale.items.forEach((item) => {
          if (
            item.product &&
            item.product.toString() === product._id.toString()
          ) {
            soldQty += item.qty;
          }
        });
      });

      return {
        productNo: product.productNo,
        productName: product.productName,
        purchasedQty,
        soldQty,
        currentStock: product.stock,
        netMovement: purchasedQty - soldQty,
      };
    });

    res.status(200).json({
      success: true,
      products: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
