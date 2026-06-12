const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema(
  {
    purchaseNo: {
      type: String,
      required: true,
      unique: true,
    },

    supplier: {
      type: String,
      default: "",
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    productNo: String,
    productName: String,

    qty: {
      type: Number,
      required: true,
      min: 1,
    },

    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
    },

    note: {
      type: String,
      default: "",
    },

    purchaseDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Purchase", purchaseSchema);
