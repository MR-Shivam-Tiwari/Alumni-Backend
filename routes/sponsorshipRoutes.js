const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const verifyToken = require("../utils");
const checkProfileLevel = require("../middleware/checkProfileLevel");
const Sponsorship = require("../models/sponsorship");

const sponsorshipRoutes = express.Router();

sponsorshipRoutes.post("/create", async (req, res) => {
  const { userId,profilePic,title, description, totalAmount, picturePath} = req.body;
  try {
    const currentDate = new Date();
    const newSponsorship = new Sponsorship({
      userId,
      title,
      profilePic,
      description,
      totalAmount,
      picturePath,
      createdAt: currentDate,
      raisedAmount: 0,
      totalContributions: 0
    });
    await newSponsorship.save();
    return res.status(201).send("successfully sponsorship details stored");
  } catch (error) {
    return res.status(500).send(error);
  }
});

sponsorshipRoutes.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const size = parseInt(req.query.size);

    const skip = (page -1) * size;

    const total = await Sponsorship.countDocuments();
    const sponsorships = await Sponsorship.find().sort({ createdAt: -1 }).skip(skip).limit(size);

    res.json({
        records: sponsorships,
        total,
        page, 
        size
    });
} catch(error) {
    console.error(error)
    res.status(400).json(error)
}
});

sponsorshipRoutes.get("/:_id", async (req, res) => {
  try {
    const id = req.params._id;
    const sponsorship = await Sponsorship.findById(id);
    if (!sponsorship) {
      return res.status(404).send("Sponsorship Post Not Found");
    }
    return res.status(201).json(sponsorship);
  } catch (error) {
    return res.status(500).send(error);
  }
});

sponsorshipRoutes.delete("/:_id", async (req, res) => {
  const { _id } = req.params;
  try {
    const deletedSponsorship = await Sponsorship.findOneAndDelete({ _id });

    if (!deletedSponsorship) {
      console.error("No such Sponsorship ");
      return res.status(404).send("Sponsorship not found");
    }

    return res.status(200).send("Sponsorship deleted successfully");
  } catch (error) {
    console.error("Error occurred:", error);
    return res.status(500).send("Internal Server Error");
  }
});

sponsorshipRoutes.put("/:_id", async (req, res) => {
  const updatedData = req.body;

  try {
    const sponsorship = await Sponsorship.findById(req.params._id);

    if (!sponsorship) {
      console.error("No such sponsorship");
      return res.status(404).send("sponsorship not found");
    }

    // const istStartDate = new Date(start).toISOString(); // Store with timezone offset
    // const istEndDate = new Date(end).toISOString(); // Store with timezone offset

    // updatedData.start = istStartDate; // Store with timezone offset
    // updatedData.end = istEndDate; // Store with timezone offset

    Object.assign(sponsorship, updatedData);
    await sponsorship.save();

    return res.status(200).send("sponsorship updated successfully");
  } catch (error) {
    console.error("Error occurred:", error);
    return res.status(500).send("Internal Server Error");
  }
});

sponsorshipRoutes.get("/user/:_id", async (req, res) => {
  const userId = req.params._id; 

  try {
      const sponsorships = await Sponsorship.find({ userId });

      
      if (sponsorships.length > 0) {
          res.status(200).json({ sponsorships });
      } else {
          res.status(404).json({ message: 'No sponsorships found for this user.' });
      }
  } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = sponsorshipRoutes;
