const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    shopName: {
      type: String,
      default: "",
      trim: true,
    },

    ownerName: {
      type: String,
      default: "",
      trim: true,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    city: {
      type: String,
      default: "",
      trim: true,
    },

    state: {
      type: String,
      default: "",
      trim: true,
    },

    pincode: {
      type: String,
      default: "",
      trim: true,
    },

    country: {
      type: String,
      default: "India",
      trim: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    whatsapp: {
      type: String,
      default: "",
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    website: {
      type: String,
      default: "",
      trim: true,
    },

    gstNo: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },

    invoicePrefix: {
      type: String,
      default: "INV",
    },

    purchasePrefix: {
      type: String,
      default: "PUR",
    },

    productPrefix: {
      type: String,
      default: "P",
    },

    currency: {
      type: String,
      default: "₹",
    },

    taxPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    logo: {
      type: String,
      default: "",
    },

    thermalPrinter: {
      type: Boolean,
      default: false,
    },

    darkMode: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Setting", settingSchema);
