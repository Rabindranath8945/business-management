const Product = require("../models/Product");
const Sale = require("../models/Sale");
const Purchase = require("../models/Purchase");

exports.getDashboard = async (req, res) => {
  try {
    // =========================
    // TODAY SALES
    // =========================
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todaySalesData = await Sale.find({
      saleDate: {
        $gte: todayStart,
      },
    });

    const todaySales = todaySalesData.reduce(
      (sum, sale) => sum + (sale.grandTotal || 0),
      0,
    );

    // =========================
    // YESTERDAY SALES
    // =========================
    const yesterdayStart = new Date();
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    yesterdayStart.setHours(0, 0, 0, 0);

    const yesterdayEnd = new Date(yesterdayStart);
    yesterdayEnd.setHours(23, 59, 59, 999);

    const yesterdaySalesData = await Sale.find({
      saleDate: {
        $gte: yesterdayStart,
        $lte: yesterdayEnd,
      },
    });

    const yesterdaySales = yesterdaySalesData.reduce(
      (sum, sale) => sum + (sale.grandTotal || 0),
      0,
    );

    const salesGrowth =
      yesterdaySales === 0
        ? 100
        : Number(
            (((todaySales - yesterdaySales) / yesterdaySales) * 100).toFixed(1),
          );

    // =========================
    // MONTH SALES
    // =========================
    const monthStart = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    );

    const monthSalesData = await Sale.find({
      saleDate: {
        $gte: monthStart,
      },
    });

    const monthSales = monthSalesData.reduce(
      (sum, sale) => sum + (sale.grandTotal || 0),
      0,
    );

    // =========================
    // PREVIOUS MONTH SALES
    // =========================
    const previousMonthStart = new Date(
      new Date().getFullYear(),
      new Date().getMonth() - 1,
      1,
    );

    const previousMonthEnd = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      0,
      23,
      59,
      59,
      999,
    );

    const previousMonthSalesData = await Sale.find({
      saleDate: {
        $gte: previousMonthStart,
        $lte: previousMonthEnd,
      },
    });

    const previousMonthSales = previousMonthSalesData.reduce(
      (sum, sale) => sum + (sale.grandTotal || 0),
      0,
    );

    const monthGrowth =
      previousMonthSales === 0
        ? 100
        : Number(
            (
              ((monthSales - previousMonthSales) / previousMonthSales) *
              100
            ).toFixed(1),
          );

    // =========================
    // MONTH PURCHASE
    // =========================
    const monthPurchaseData = await Purchase.find({
      purchaseDate: {
        $gte: monthStart,
      },
    });

    const monthPurchase = monthPurchaseData.reduce(
      (sum, purchase) => sum + (purchase.grandTotal || 0),
      0,
    );

    // =========================
    // PRODUCTS
    // =========================
    const products = await Product.find();

    let stockValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    products.forEach((p) => {
      stockValue += (p.stock || 0) * (p.purchasePrice || 0);

      if ((p.stock || 0) <= (p.minStock || 5)) {
        lowStockCount++;
      }

      if ((p.stock || 0) <= 0) {
        outOfStockCount++;
      }
    });

    // =========================
    // RECENT SALES
    // =========================
    const recentSales = await Sale.find()
      .sort({
        saleDate: -1,
      })
      .limit(5);

    // =========================
    // LOW STOCK PRODUCTS
    // =========================
    const lowStockProducts = products
      .filter((p) => (p.stock || 0) <= (p.minStock || 5))
      .slice(0, 5);

    // =========================
    // SALES CHART (LAST 7 DAYS)
    // =========================
    const salesChart = [];

    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date();

      dayStart.setDate(dayStart.getDate() - i);

      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);

      dayEnd.setHours(23, 59, 59, 999);

      const daySales = await Sale.find({
        saleDate: {
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

    // =========================
    // NET PROFIT
    // =========================
    const netProfit = monthSales - monthPurchase;

    const profitGrowth =
      monthPurchase === 0
        ? 100
        : Number(((netProfit / monthPurchase) * 100).toFixed(1));

    // =========================
    // RESPONSE
    // =========================
    res.json({
      success: true,

      todaySales,
      monthSales,
      monthPurchase,

      netProfit,

      salesGrowth,
      monthGrowth,
      profitGrowth,

      stockValue,

      stockItems: products.length,

      lowStockCount,
      outOfStockCount,

      recentSales,
      lowStockProducts,

      salesChart,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
