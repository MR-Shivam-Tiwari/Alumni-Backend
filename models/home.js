const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  heading: {
    type: String,
    required: true,
  },
  backgroundImage: {
    type: String,
    required: true,
  },
});

const homeSchema = new mongoose.Schema({
  section1: {
    type: sectionSchema,
    required: true,
  },
  section2: {
    type: sectionSchema,
    required: true,
  },
  section3: {
    header1: {
      type: String,
      required: true,
    },
    image1: {
      type: String,
      required: true,
    },
    header2: {
      type: String,
      required: true,
    },
    image2: {
      type: String,
      required: true,
    },
  },
});

const Home = mongoose.model('Home', homeSchema);

module.exports = Home;

