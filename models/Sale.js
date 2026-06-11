const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema(
  {
    invoiceNo: {
      type: String,
      required: true,
    },
    customerName: String,
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    qty: {
      type: Number,
      required: true,
    },
    salePrice: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Sale", saleSchema);
