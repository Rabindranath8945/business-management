const express = require("express");
const router = express.Router();

const Setting = require("../models/Setting");

// Get Settings
router.get("/", async (req, res) => {
  try {
    const setting = await Setting.findOne();
    res.json(setting);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// Save / Update Settings
router.put("/", async (req, res) => {
  try {
    let setting = await Setting.findOne();

    if (!setting) {
      setting = await Setting.create(req.body);
    } else {
      setting = await Setting.findByIdAndUpdate(setting._id, req.body, {
        new: true,
      });
    }

    res.json(setting);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;
