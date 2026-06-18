const express = require("express");
const router = express.Router();

const {
  getSalesReport,
  getPurchaseReport,
  getStockReport,
  getLowStockReport,
  getOutOfStockReport,
  getStockValueReport,
} = require("../controllers/reportController");

router.get("/sales", getSalesReport);
router.get("/purchases", getPurchaseReport);
router.get("/stock", getStockReport);
router.get("/low-stock", getLowStockReport);
router.get("/out-of-stock", getOutOfStockReport);
router.get("/stock-value", getStockValueReport);

module.exports = router;
