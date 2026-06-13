const Product = require("../models/Product");
const Sale = require("../models/Sale");
const Purchase = require("../models/Purchase");

exports.getDashboard = async (req, res) => {
  try {
    // Today's sales
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const todaySales = await Sale.find({
      createdAt: { $gte: start },
    });

    const salesAmount = todaySales.reduce(
      (sum, sale) => sum + sale.grandTotal,
      0,
    );

    // Total stock value
    const products = await Product.find();

    let stockValue = 0;
    let lowStockCount = 0;

    products.forEach((p) => {
      stockValue += (p.stock || 0) * (p.purchasePrice || 0);

      if ((p.stock || 0) <= (p.lowStock || 5)) {
        lowStockCount++;
      }
    });

    // Recent sales
    const recentSales = await Sale.find().sort({ createdAt: -1 }).limit(5);

    const lowStockProducts = products
      .filter((p) => (p.stock || 0) <= (p.lowStock || 5))
      .slice(0, 5);

    res.json({
      todaySales: salesAmount,
      stockValue,
      lowStockCount,
      recentSales,
      lowStockProducts,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
