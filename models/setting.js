// backend/models/userSettings.js
const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    logo: {
    type: String,
    // required: true,
  },
  brandName: {
    type: String,
    required: true,
  },
  updatedDate: String,
  brandColors: {
    primary: {
      type: String,
      // required: true,
    },
    secondary: {
      type: String,
      // required: true,
    },
    white: {
      type: String,
      // required: true,
    },
    black: {
      type: String,
      // required: true,
    },
  },
});

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;
