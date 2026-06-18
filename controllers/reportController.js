const Sale = require("../models/Sale");
const Purchase = require("../models/Purchase");

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
    };

    sales.forEach((sale) => {
      summary.totalSales += sale.grandTotal || 0;
      summary.totalDiscount += sale.discount || 0;
      summary.totalTax += sale.tax || 0;

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
