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
      (sum, sale) => sum + (sale.grandTotal || 0),
      0,
    );

    // Products
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

    // Low stock products
    const lowStockProducts = products
      .filter((p) => (p.stock || 0) <= (p.lowStock || 5))
      .slice(0, 5);

    // ===== 7 DAY SALES CHART =====
    const salesChart = [];

    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const daySales = await Sale.find({
        createdAt: {
          $gte: dayStart,
          $lte: dayEnd,
        },
      });

      const totalSales = daySales.reduce(
        (sum, sale) => sum + (sale.grandTotal || 0),
        0,
      );

      salesChart.push({
        day: dayStart.toLocaleDateString("en-US", {
          weekday: "short",
        }),
        sales: totalSales,
      });
    }

    // Optional Profit (temporary)
    const netProfit = Math.round(salesAmount * 0.2);

    res.json({
      todaySales: salesAmount,
      netProfit,

      stockValue,
      stockItems: products.length,

      lowStockCount,

      recentSales,
      lowStockProducts,

      salesChart,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
