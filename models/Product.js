const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    productName: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      default: "",
      trim: true,
    },

    hsn: {
      type: String,
      default: "",
      trim: true,
    },

    purchasePrice: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    salePrice: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    unit: {
      type: String,
      enum: ["PCS", "KG", "LTR", "BOX", "PACK", "DOZEN", "METER"],
      default: "PCS",
    },

    gstRate: {
      type: Number,
      default: 0,
      min: 0,
    },

    minStock: {
      type: Number,
      default: 0,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Product", productSchema);
