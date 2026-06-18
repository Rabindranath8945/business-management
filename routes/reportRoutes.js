const express = require("express");
const router = express.Router();

const {
  getSalesReport,
  getPurchaseReport,
  getStockReport,
  getLowStockReport,
  getOutOfStockReport,
  getStockValueReport,
  getInventoryMovementReport,
} = require("../controllers/reportController");

router.get("/sales", getSalesReport);
router.get("/purchases", getPurchaseReport);
router.get("/stock", getStockReport);
router.get("/stock/low-stock", getLowStockReport);
router.get("/stock/out-of-stock", getOutOfStockReport);
router.get("/stock/stock-value", getStockValueReport);
router.get("/stock/inventory-movement", getInventoryMovementReport);

module.exports = router;
