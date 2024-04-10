// routes/homeRoutes.js
const express = require('express');
const homeRoutes = express.Router();
const Home = require('../models/home');

// Get home settings
homeRoutes.get('/', async (req, res) => {
  try {
    const home = await Home.findOne();
    res.json(home);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching home settings' });
  }
});

// Create or update home settings
homeRoutes.put('/', async (req, res) => {
    try {
      const { heading1, heading2, section1Background, section2Background, section3Image1, section3Image2, section3Header1, section3Header2 } = req.body;
  
      const updatedSettings = {};
      const previousSettings = await Home.findOne(); 
      console.log(previousSettings); 
      if (heading1 || section1Background) {
        updatedSettings.section1 = {};
        if (heading1) updatedSettings.section1.heading = heading1;
        else updatedSettings.section1.heading = previousSettings.section1.heading;
        if (section1Background) updatedSettings.section1.backgroundImage = section1Background;
        else updatedSettings.section1.backgroundImage = previousSettings.section1.backgroundImage;
      }
  
      if (heading2 || section2Background) {
        updatedSettings.section2 = {};
        if (heading2) updatedSettings.section2.heading = heading2;
        else updatedSettings.section2.heading = previousSettings.section2.heading;
        if (section2Background) updatedSettings.section2.backgroundImage = section2Background;
        else updatedSettings.section2.backgroundImage = previousSettings.section2.backgroundImage;
      }
  
      if (section3Header1 || section3Image1 || section3Header2 || section3Image2) {
        updatedSettings.section3 = {};
        if (section3Header1) updatedSettings.section3.header1 = section3Header1;
        else updatedSettings.section3.header1 = previousSettings.section3Header1;
        if (section3Image1) updatedSettings.section3.image1 = section3Image1;
        else updatedSettings.section3.image1 = previousSettings.section3Image1;
        if (section3Header2) updatedSettings.section3.header2 = section3Header2;
        else updatedSettings.section3.header2 = previousSettings.section3Header2
        if (section3Image2) updatedSettings.section3.image2 = section3Image2;
        else updatedSettings.section3.image2 = previousSettings.section3Image2;
      }
  
      const existingSettings = await Home.findOne();
      if (existingSettings) {
        // Update existing settings
        await Home.findByIdAndUpdate(existingSettings._id, { $set: updatedSettings }, {
          new: true,
        });
      } else {
        // Create new settings if none exist
        await Home.create(updatedSettings);
      }
  
      res.json({ message: 'Home settings updated successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Error updating home settings' });
    }
  });
  

// Create home settings if none exist
homeRoutes.post('/', async (req, res) => {
  try {
    const existingSettings = await Home.findOne();
    if (!existingSettings) {
      const initialSettings = {
        
            "section1": {
              "heading": "Welcome to Our Website!",
              "backgroundImage": "default-section1-bg.jpg"
            },
            "section2": {
              "heading": "Discover Our Services",
              "backgroundImage": "default-section2-bg.jpg"
            },
            "section3": {
              "header1": "Contact Us Today",
              "image1": "default-section3-image1.jpg",
              "header2": "Section 3 Header 2",
              "image2": "default-section3-image2.jpg"
            }
          
          
      };

      await Home.create(initialSettings);
    }

    res.json({ message: 'Home settings initialized successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).send(err );
  }
});

module.exports = homeRoutes;
