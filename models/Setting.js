const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    shopName: String,
    address: String,
    phone: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Setting", settingSchema);
