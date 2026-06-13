const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const productRoutes = require("./routes/productRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const saleRoutes = require("./routes/saleRoutes");
const settingRoutes = require("./routes/settingRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

app.use(cors());
app.use(express.json());
app.use("/api/products", productRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/dashboard", dashboardRoutes);
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Mongo Connected"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("API Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server Running on ${PORT}`);
});
