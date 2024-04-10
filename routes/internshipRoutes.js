const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const verifyToken = require("../utils");
const checkProfileLevel = require("../middleware/checkProfileLevel");
const Internship = require("../models/internship");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const url = require("url");
const Alumni = require("../models/Alumni");
const Notification = require("../models/notification")

const internshipRoutes = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    // Rename file to prevent duplicates
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // File name with extension
  }
});

// Multer file filter to allow only images and PDF files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only images and PDF files are allowed'));
  }
};

// Multer upload middleware
const upload = multer({ storage: storage, fileFilter: fileFilter });



internshipRoutes.post("/create", upload.array('attachments', 5), async (req, res) => {
  try {
    const {
      userId,
      title,
      description,
      questions,
      category,
      employmentType,
      duration,
      currency,
      picture,
      salaryMin,
      salaryMax,
      location,
      coverImage,
      type
    } = req.body;

    const attachmentNames = req.files.map(file => file.filename);

    const newInternship = new Internship({
      userId,
      title,
      description,
      questions,
      category,
      employmentType,
      duration,
      currency,
      picture,
      salaryMin,
      salaryMax,
      attachments: attachmentNames,
      location,
      type,
      coverImage,
      archive: false,
      starred: [],
      approved: false
    });
    const savedInternship = await newInternship.save();

    const alumni = await Alumni.findOne({ _id: userId });
    const admin = await Alumni.findOne({ profileLevel: 1, department: alumni.department });

    if (admin) {
      const newNotification = new Notification({
        userId: userId,
        requestedUserName: alumni.firstName,
        ownerId: admin._id,
        status: false,
        job: false,
        jobId: savedInternship._id, 
      });
      await newNotification.save();
    } else {
      console.error("Admin not found for the department");
      
      await Internship.deleteOne({ _id: savedInternship._id });
      return res.status(400).json({ error: 'Admin not found for the department' })
    }

    return res.status(201).json({ message: "Success" });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

internshipRoutes.post("/apply/:_id", upload.single('resume'), async (req, res) => {
  const { _id } = req.params; // ID of the internship post
  const { userId, name } = req.body; // User ID and name
  const resumeFileName = req.file.filename; // Name of the uploaded resume file
  const appliedAt = new Date(); // Current date and time

  try {
  
    const internship = await Internship.findOneAndUpdate(
      { _id },
      {
        $push: {
          appliedCandidates: {
            userId,
            name,
            resume: resumeFileName,
            appliedAt
          }
        }
      },
      { new: true } 
    );

    if (!internship) {
      return res.status(404).json({ message: "internship post not found" });
    }

    // Update user's appliedinternships array
    const user = await Alumni.findByIdAndUpdate(
      userId,
      {
        $push: {
          appliedJobs: {
            jobId: _id,
            status: "none"
          }
        }
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "Application submitted successfully" });
  } catch (error) {
    console.error("Error applying for job:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

internshipRoutes.get("/", async(req,res)=>{
    try
    {
        const internship = await Internship.find();
        return res.status(201).send(internship);
    }catch(error){
        return res.status(500).send(error);
    }
})

internshipRoutes.delete("/:_id", async(req,res)=>{
  try{
    const deletedInternship = await Internship.findOneAndDelete({ _id: req.params._id });

if (!deletedInternship) {
  console.error('No such internship');
  return res.status(404).send('Internship not found');
}

return res.status(200).send('Internship deleted successfully');
} catch (error) {
console.error('Error occurred:', error);
return res.status(500).send('Internal Server Error');
}
});

internshipRoutes.get("/:_id", async(req,res)=>{
  try {
    const internship = await Internship.findById(req.params._id);

    if (!internship) {
      console.error("No such internship");
      return res.status(404).send("internship not found");
    }

    res.status(200).json(internship);
  } catch (err) {
    return res.status(400).send(err);
  }
})

// internshipRoutes.put("/:_id", async (req, res) => {
//   const { _id } = req.params;
//   try {
//     // Find the job by ID
//     const internship = await Internship.findById(_id);

//     if (!internship) {
//       return res.status(404).json({ message: "Internship not found" });
//     }
//     internship.archive = !internship.archive;
//     await internship.save();

//     return res.status(200).json({ message: "Archive status updated successfully" });
//   } catch (error) {
//     return res.status(500).json(error);
//   }
// });

internshipRoutes.put("/:_id", async (req, res) => {
  const { _id } = req.params;
  const { starred, userId,status} = req.body;
  try {
    // Find the internship by ID
    const internship = await Internship.findById(_id);

    if (!internship) {
      return res.status(404).json({ message: "internship not found" });
    }

    if (starred !== undefined) {
      // If `starred` property is present in the request body
      if (internship.starred.includes(userId)) {
          // If userId is already present in the starred array, remove it
          internship.starred = internship.starred.filter(id => id !== userId);
      } else {
          // If userId is not present, push it into the starred array
          internship.starred.push(userId);
      }
  } else {
      // If `starred` property is not present, toggle the `archive` property
      internship.archive = !internship.archive;
  }
  

    await internship.save();

    return res
      .status(200)
      .json({ message: "Archive status updated successfully" });
  } catch (error) {
    return res.status(500).json(error);
  }
});

internshipRoutes.get("/appliedCandidates/:_id", async (req, res) => {
  const { _id } = req.params; // ID of the job post

  try {
    // Find the job post by ID
    const internship = await Internship.findById(_id);

    if (!internship) {
      return res.status(404).json({ message: "Internship post not found" });
    }

    // Extract userIds and appliedCandidates from the job object
    const userIds = internship.appliedCandidates.map(candidate => candidate.userId);
    const appliedCandidates = internship.appliedCandidates;

    return res.status(200).json({ userIds, appliedCandidates });
  } catch (error) {
    console.error("Error retrieving applied candidates:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

internshipRoutes.get("/starred/:_id", async (req, res) => {
  const { _id } = req.params;

  try {
    // Find jobs where the starred array contains the provided user ID
    const internships = await Internship.find({ starred: { $in: [_id] } });

    if (!internships) {
      return res.status(404).json({ message: "No starred internships found" });
    }

    return res.status(200).json({ internships });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

internshipRoutes.get("/:_id/appliedJobs", async(req, res) => {
  const { _id } = req.params;
  console.log('userId', _id);
  try {
    // Find all internships where the user has applied
    const internships = await Internship.find({ "appliedCandidates.userId": _id });

    // If no internships are found, return a 404 error
    if (!internships || internships.length === 0) {
      return res.status(404).json({ message: "No applied internships found for this user" });
    }

    return res.status(200).json(internships);
  } catch (error) {
    console.error("Error fetching applied internships:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

internshipRoutes.put("/:_id/updateJobStatus", async(req,res)=>{
  const { _id } = req.params; 
  const { userId, status } = req.body;

  try {

    // Update user's appliedJobs array
    const user = await Alumni.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Alumni not found" });
    }
    user.appliedJobs.forEach(job => {
      if (job.jobId === _id) {
        job.status = status;
      }
    });

    // Update job's appliedCandidates array
    const job = await Internship.findOneAndUpdate(
      { _id, "appliedCandidates.userId": userId },
      { $set: { "appliedCandidates.$.status": status } },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({ message: "Internship post not found" });
    }

    await user.save();

    return res.status(200).json({ message: "Internship status updated successfully" });
  } catch (error) {
    console.error("Error updating internship status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});


module.exports = internshipRoutes;
