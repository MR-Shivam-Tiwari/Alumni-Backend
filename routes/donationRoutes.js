const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const verifyToken = require("../utils");
const checkProfileLevel = require("../middleware/checkProfileLevel");
const Donation = require("../models/donation");
const multer = require("multer");
const path = require("path");

const donationRoutes = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // Rename file to prevent duplicates
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // File name with extension
  },
});

const fileFilter = (req, file, cb) => {
  if (
    
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only  PDF file allowed"));
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

donationRoutes.post("/create", upload.single('businessPlan'),async (req, res) => {
  const { userId,amount,businessDescription,businessName,competitiveAdvantage,currentRevenue,email,fundingGoal,industry,marketingStrategy,name,phone,targetMarket,teamExperience } = req.body;
  try {
    const currentDate = new Date();
    

    const newDonation = new Donation({
      userId,
      createdAt: currentDate,
      amount,
      businessDescription,
      businessPlan: req.file.filename,
      competitiveAdvantage,
      currentRevenue,
      email,
      fundingGoal,
      industry,
      marketingStrategy,
      name,
      phone,
      targetMarket,
      teamExperience

    });
    await newDonation.save();
    return res.status(201).send("successfully donation details stored");
  } catch (error) {
    return res.status(500).send(error);
  }
});

donationRoutes.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const size = parseInt(req.query.size);

    const skip = (page -1) * size;

    const total = await Donation.countDocuments();
    const donations = await Donation.find().sort({ createdAt: -1 }).skip(skip).limit(size);

    res.json({
        records: donations,
        total,
        page, 
        size
    });
} catch(error) {
    console.error(error)
    res.status(400).json(error)
}
});

donationRoutes.get("/:_id", async (req, res) => {
  try {
    const id = req.params._id;
    const donation = await Donation.findById(id);
    if (!donation) {
      return res.status(404).send("Donation Post Not Found");
    }
    return res.status(201).json(donation);
  } catch (error) {
    return res.status(500).send(error);
  }
});

donationRoutes.delete("/:_id", async (req, res) => {
  const { _id } = req.params;
  try {
    const deletedDonation = await Donation.findOneAndDelete({ _id });

    if (!deletedDonation) {
      console.error("No such Donation");
      return res.status(404).send("Donation not found");
    }

    return res.status(200).send("Donation deleted successfully");
  } catch (error) {
    console.error("Error occurred:", error);
    return res.status(500).send("Internal Server Error");
  }
});

donationRoutes.put("/:_id", async (req, res) => {
  const updatedData = req.body;
  //const { start, end, startTime, endTime, picture } = updatedData;

  try {
    const donation = await Donation.findById(req.params._id);

    if (!donation) {
      console.error("No such donation");
      return res.status(404).send("donation not found");
    }

    // const istStartDate = new Date(start).toISOString(); // Store with timezone offset
    // const istEndDate = new Date(end).toISOString(); // Store with timezone offset

    // updatedData.start = istStartDate; // Store with timezone offset
    // updatedData.end = istEndDate; // Store with timezone offset

    Object.assign(donation, updatedData);
    await donation.save();

    return res.status(200).send("donation updated successfully");
  } catch (error) {
    console.error("Error occurred:", error);
    return res.status(500).send("Internal Server Error");
  }
});

donationRoutes.get("/user/:_id", async (req, res) => {
  const userId = req.params._id; 

  try {
      const donations = await Donation.find({ userId });

      
      if (donations.length > 0) {
          res.status(200).json({ donations });
      } else {
          res.status(404).json({ message: 'No donations found for this user.' });
      }
  } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = donationRoutes;
