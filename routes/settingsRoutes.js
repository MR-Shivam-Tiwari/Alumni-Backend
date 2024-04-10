const Settings = require("../models/setting");
const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const verifyToken = require("../utils");
const checkProfileLevel = require("../middleware/checkProfileLevel");

const settingsRoutes = express.Router();



settingsRoutes.post("/createSetting",async (req, res) => {
    try {
      const { brandName, brandColors, logo} = req.body;

      const currentDate = new Date();
      const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        timeZone: "Asia/Kolkata",
      };

      const creationDate = currentDate.toLocaleString("en-IN", options);
      await Settings.deleteMany({});
      const newSetting = new Settings({
        logo,
        brandName,
        brandColors,
        updatedDate: creationDate,
      });

      // Save the new setting to the database
      const savedSetting = await newSetting.save();

      res.status(201).json(savedSetting);
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error creating setting", error: err.message });
    }
  }
);

settingsRoutes.get("/:_id", async (req, res) => {
  try {
    const settings = await Settings.findById(req.params._id);

    if (!settings) {
      console.error("No such settings");
      return res.status(404).send("settings not found");
    }

    res.status(200).json(settings);
  } catch (err) {
    return res.status(400).send(err);
  }
});

settingsRoutes.put("/:_id", async (req, res) => {
  const settingId = req.params._id;
  const update = req.body;

  try {
    const currentDate = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      timeZone: "Asia/Kolkata",
    };

    const creationDate = currentDate.toLocaleString("en-IN", options);
    const updatedSetting = await Settings.findOneAndUpdate(
      { _id: settingId },
      { $set: update, updatedDate: creationDate },
      { new: true, useFindAndModify: false }
    );

    if (!updatedSetting) {
      return res.status(404).json({ message: "Setting not found" });
    }
    await updatedSetting.save();
    res.json(updatedSetting);
  } catch (err) {
    res.status(500).json({ message: "Error updating setting" });
  }
});

settingsRoutes.delete("/", async (req, res) => {
  try {
    await Settings.deleteMany({});
    res.status(200).json({ message: "Settings deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

settingsRoutes.get("/", async (req, res) => {
  try {
    const settings = await Settings.find();

    if (!settings) {
      console.error("No settings");
      return res.status(404).send("settings not found");
    }

    res.status(200).json(settings);
  } catch (err) {
    return res.status(400).send(err);
  }
});

module.exports = settingsRoutes;
