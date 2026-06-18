const express = require("express");
const router = express.Router();

const {
  getSalesReport,
  getPurchaseReport,
  getProductReport,
} = require("../controllers/reportController");

router.get("/sales", getSalesReport);
router.get("/purchases", getPurchaseReport);
router.get("/products", getProductReport);

module.exports = router;
