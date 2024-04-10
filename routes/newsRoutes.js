const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const verifyToken = require("../utils");
const checkProfileLevel = require("../middleware/checkProfileLevel");
const News = require("../models/news");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const newsRoutes = express.Router();

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const folderName = req.query.folder || "default";
    const uploadPath = path.join(
      "D:/Frontend/alumni/public/uploads",
      folderName
    );
    console.log("uploadpath:", uploadPath);

    try {
      await fs.promises.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (err) {
      cb(err, null);
    }
  },
  filename: (req, file, cb) => {
    // const uniqueFilename = Date.now() + "-" + file.originalname;
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

newsRoutes.post("/create", upload.single("videoPath"), async (req, res) => {
  try {
    const { title,description,picturePath,department } = req.body;
    const folderName= req.query.folder;
    console.log("foldername:", folderName);
    let videoPath = null;
    console.log(req.file)
    if (req.file) {
      videoPath = {
        videoPath: `http://localhost:3000/uploads/${folderName}/${req.file.originalname}`,
        name: req.file.filename,
      };
    }

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

    const newNews = new News({
      picturePath,
      description,
      videoPath,
      department,
      createdAt: creationDate
    });
    await newNews.save();

    const news = await News.find();
    res.status(201).json(news);
  } catch (err) {
    res.status(409).json({ message: err.message });
  }
});





// newsRoutes.post("/create", async (req, res) => {
//   try {
//     const { title, description } = req.body;

    // const currentDate = new Date();
    // const options = {
    //   weekday: "long",
    //   year: "numeric",
    //   month: "long",
    //   day: "numeric",
    //   hour: "numeric",
    //   minute: "numeric",
    //   second: "numeric",
    //   timeZone: "Asia/Kolkata",
    // };

    // const creationDate = currentDate.toLocaleString("en-IN", options);
//     const newNews = new News({
//       title: title,
//       description: description,
//       createdAt: creationDate,
//     });

//     // Save the News to the "News" collection
//     await newNews.save();

//     res.status(201).json(newNews);
//   } catch (err) {
//     res.status(500).send({ message: "Error creating News" });
//   }
// });

newsRoutes.get("/:_id", async (req, res) => {
  try {
    const news = await News.findById(req.params._id);

    if (!news) {
      console.error("No such news");
      return res.status(404).send("news not found");
    }

    res.status(200).json(news);
  } catch (err) {
    return res.status(400).send(err);
  }
});

newsRoutes.put("/:_id", async (req, res) => {
  const updatedData = req.body;

  try {
    const news = await News.findById(req.params._id);

    if (!news) {
      console.error("No such news");
      return res.status(404).send("news not found");
    }
    Object.assign(news, updatedData);
    await news.save();

    return res.status(200).send("news updated successfully");
  } catch (error) {
    console.error("Error occurred:", error);
    return res.status(500).send("Internal Server Error");
  }
});

newsRoutes.delete("/:_id", async (req, res) => {
  const { _id } = req.params; // Get the topic ID from the URL parameter

  try {
    const deletedNews = await News.findOneAndDelete({ _id });

    if (!deletedNews) {
      console.error("No such News");
      return res.status(404).send("News not found");
    }

    return res.status(200).send("News deleted successfully");
  } catch (error) {
    console.error("Error occurred:", error);
    return res.status(500).send("Internal Server Error");
  }
});

newsRoutes.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const size = parseInt(req.query.size);

    const skip = (page - 1) * size;

    const total = await News.countDocuments();
    const news = await News.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(size);

    res.json({
      records: news,
      total,
      page,
      size,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json(error);
  }
});

module.exports = newsRoutes;
