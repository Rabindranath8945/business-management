const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema(
  {
    invoiceNo: {
      type: String,
      required: true,
      unique: true,
    },

    customerName: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      default: "",
    },

    items: [
      {
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

        salePrice: {
          type: Number,
          required: true,
          min: 0,
        },

        total: {
          type: Number,
          required: true,
        },
      },
    ],

    subTotal: {
      type: Number,
      required: true,
    },

    discount: {
      type: Number,
      default: 0,
    },

    tax: {
      type: Number,
      default: 0,
    },

    grandTotal: {
      type: Number,
      required: true,
    },

    note: {
      type: String,
      default: "",
    },

    saleDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Sale", saleSchema);
