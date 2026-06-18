const express = require("express");
const router = express.Router();

const {
  getSalesReport,
  getPurchaseReport,
} = require("../controllers/reportController");

router.get("/sales", getSalesReport);
router.get("/purchases", getPurchaseReport);

module.exports = router;
