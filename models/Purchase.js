const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema(
  {
    purchaseNo: {
      type: String,
      required: true,
    },
    supplier: String,
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    qty: Number,
    purchasePrice: Number,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Purchase", purchaseSchema);
