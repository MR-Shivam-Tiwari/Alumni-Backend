const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const alumniRoutes = express.Router();
const verifyToken = require("../utils");
const nodemailer = require("nodemailer");
const validateEmail = require("../middleware/validateEmail");
const validatePassword = require("../middleware/validatePassword");
const checkProfileLevel = require("../middleware/checkProfileLevel");
const Session = require("../models/session");
const checkGroupExists = require("../middleware/checkGroupExists");
const mongoose = require("mongoose");
const Notification = require("../models/notification")

const Alumni = require("../models/Alumni");

const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
};
alumniRoutes.post(
  "/register",
  validateEmail,
  validatePassword,
  async (req, res) => {
    const {
      firstName,
      lastName,
      graduation_year,
      graduation_degree,
      email,
      mobile,
      password,
      dob,
      gender,
      profile,
      designation,
      isActive,
      isPopular,
      isNewest,
      picturePath,
      friends,
      location,
      occupation,
      workingAt,
      companyWebsite,
      aboutMe,
      city,
      department,
      batch,
      country,
      following,
      followers,
      admin,
      alumni,
      student,
      appliedJobs,
      expirationDate
    } = req.body;
    let { otp, status, profileLevel } = req.body;

    try {
      // Check if the username already exists in the database
      const existingAlumni = await Alumni.findOne({ email });
      if (existingAlumni) {
        return res.status(409).send("Email already registered");
      }

      const encrypted = await bcrypt.hash(password, 10);
      otp = generateOTP();

      const currentDate = new Date();
      let newExpirationDate = null; // Initialize expirationDate variable

      // Set expirationDate only if admin is not true
      if (!admin) {
        newExpirationDate = new Date(currentDate);
        newExpirationDate.setDate(currentDate.getDate() + 7);
      }

      const profileLevelValue = admin ? 1 : (alumni ? 2 : (student ? 3 : null));
      
      const newAlumni = new Alumni({
        firstName,
        lastName,
        graduation_year,
        graduation_degree,
        email,
        mobile,
        password: encrypted,
        gender,
        profile,
        designation,
        otp,
        status,
        profileLevel: profileLevelValue,
        isActive,
        isPopular,
        isNewest,
        picturePath,
        friends,
        location,
        occupation,
        workingAt,
        companyWebsite,
        aboutMe,
        department,
        batch: batch? batch: null,
        city,
        accountDeleted: false,
        country,
        following,
        followers,
        blockedContactsId: null,
        admin: admin? admin: false,
        appliedJobs,
        expirationDate: newExpirationDate
      });

      await newAlumni.save();


      if(admin!==undefined){
        console.log('admin is not undefined')
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        auth: {
          user: "nandannandu254@gmail.com",
          pass: "hbpl hane patw qzqb",
        },
      });

      let message = {
        from: "nandannandu254@gmail.com",
        to: email,
        subject: "Alumni Portal Login Credentials",
        text: `Your Alumni Portal Login Credentials are:
               email : ${email}
               password : ${password} `,
      };

      transporter.sendMail(message, (err, info) => {
        if (err) {
          console.log("Error occurred. " + err.message);
          return process.exit(1);
        }

        console.log("Message sent: %s", info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      });
    }

      return res.status(201).send("Alumni registered successfully");
    } catch (error) {
      console.error("Error registering alumni:", error);
      return res.status(500).send("Internal Server Error");
    }
  }
);

alumniRoutes.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const alumni = await Alumni.findOne({ email: email });

    if (!alumni) {
      return res.status(404).json("Alumni not found");
    }
    if (alumni.accountDeleted === true && alumni.validated !== false) {
      return res.status(404).json('Account has been Deleted. Contact Admin to recover');
    } else if (alumni.validated === false) {
      return res.status(404).json('Your ID validation was rejected. Contact Admin to recover');
    }

    

    const passwordMatch = await bcrypt.compare(password, alumni.password);

    if (passwordMatch) {
      try {
        // const sessionCount = await Session.countDocuments({ alumniId });

        // // Define the maximum number of allowed sessions
        // const maxSessions = 3;

        // if (sessionCount >= maxSessions) {
        //   return res.status(403).send('Maximum session limit reached');
        // }

        const token = jwt.sign(
          { userId: alumni._id, username: alumni.firstName },
          "f3c8a3c9b8a9f0b2440a646f3a5b8f9e6d6e46555a4b2b5c6d7c8d9e0a1b2c3d4f5e6a7b8c9d0e1f2a3b4c5d6e7f8g9h0"
        );
        // jwt.sign(
        //   { userId: alumni._id, username: alumni.firstName },
        //   process.env.secretKey,
        //   { noTimestamp: true },
        //   (err, token) => {
        //     res
        //       .cookie('token', { id: alumni._id, userName: alumni.firstName, token }, { sameSite: 'none', secure: true })
        //       .json({ alumni });
        //   }
        // );

        // Create a new session instance
        // const session = new Session({
        //   alumniId: alumniId,
        //   token: token,
        //   // email: email
        // });

        // Save the session to the database
        // await session.save();
        // alumni.sessionsId = session._id;
        //await alumni.save();

       

        return res.status(201).send({
          message: "Session created successfully and Login Successful",
          token: token,
          alumni: alumni,
        });
      } catch (error) {
        console.error("Error creating session:", error);
        return res.status(500).send("Internal Server Error");
      }

      // Valid username and password combination
    } else {
      // Invalid password
      return res.status(401).json("Invalid password");
    }
  } catch (err) {
    console.error("Error finding user:", err);
    return res.status(500).send("Internal Server Error");
  }
});

alumniRoutes.get("/all", async (req, res) => {
  try {
    const alumni = await Alumni.find();

    if (!alumni || alumni.length === 0) {
      console.log("No alumni members available");
      return res.status(404).send("No Alumni Members");
    }

    if (alumni.length === 0) {
      console.log("No alumni members ");
      return res.status(404).send("No Alumni Members ");
    }

    return res.status(200).send(alumni);
  } catch (error) {
    console.error("Error", error);
    return res.status(500).send(error);
  }
});

alumniRoutes.get(
  "/:alumniId",
  verifyToken,
  checkGroupExists,
  async (req, res) => {
    try {
      const alumni = await Alumni.findById(req.params.alumniId).select(
        "-password"
      );
      if (!alumni) {
        return res
          .status(404)
          .json({ success: false, message: "Alumni not found" });
      }
      res.json(alumni);
    } catch (err) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

alumniRoutes.put("/:alumniId", verifyToken, async (req, res) => {
  const { alumniId } = req.params;
  const updatedData = req.body;
  const { oldPassword, newPassword, confirmNewPassword, ID, student } = updatedData;

  try {
    const alumni = await Alumni.findOne({ _id: alumniId });

    if (!alumni) {
      console.error("No such alumni");
      return res.status(404).send("Alumni not found");
    }

    
    if (oldPassword && newPassword && confirmNewPassword) {
      const passwordMatch = await bcrypt.compare(oldPassword, alumni.password);

      if (!passwordMatch) {
        console.log("Old Password Invalid");
        return res.status(400).send("Old Password Invalid");
      }

      if (newPassword !== confirmNewPassword) {
        console.log("New Passwords Matching error");
        return res.status(400).send("New Passwords Matching Error");
      }

      const encrypted = await bcrypt.hash(newPassword, 10);
      alumni.password = encrypted;
    }

    if (student === true) {
      updatedData.profileLevel = 3;
    } else if (student === false) {
      updatedData.profileLevel = 2;
    }

   
    delete updatedData.oldPassword;
    delete updatedData.newPassword;
    delete updatedData.confirmNewPassword;

    Object.assign(alumni, updatedData);

   
    await alumni.save();

    
    if (ID) {
      
      const admin = await Alumni.findOne({ profileLevel: 1, department: alumni.department });

      
      if (admin) {
        const userName = `${alumni.firstName} ${alumni.lastName}`
        const newNotification = new Notification({
          userId: alumni._id,
          requestedUserName: userName,
          ownerId: admin._id,
          ID: ID,
          status: false
        });

       
        await newNotification.save();
      } else {
        console.error("Admin not found for the department");
      }
    }

    return res.status(200).json(alumni);
  } catch (error) {
    console.error("Error occurred:", error);
    return res.status(500).send("Internal Server Error");
  }
});

alumniRoutes.patch("/:_id/follow", async (req, res) => {
  try {
    const { _id } = req.params;
    const { userId } = req.body;

    const alumni = await Alumni.findById(_id);
    const userToUpdate = await Alumni.findById(userId);

    const isFollowed = alumni.followers.some(
      (follower) => follower.userId.toString() === userId
    );

    if (isFollowed) {
      // Unfollow: Remove userId from followers of _id and _id from following of userId
      alumni.followers = alumni.followers.filter(
        (follower) => follower.userId.toString() !== userId
      );
      userToUpdate.following = userToUpdate.following.filter(
        (follow) => follow.userId.toString() !== _id
      );

      await alumni.save();
      await userToUpdate.save();

      res.status(200).json({ message: "Unfollowed successfully" });
    } else {
      // Follow: Add userId to followers of _id and _id to following of userId
      alumni.followers.push({ userId, firstName: userToUpdate.firstName });
      userToUpdate.following.push({ userId: _id, firstName: alumni.firstName });

      await alumni.save();
      await userToUpdate.save();

      res.status(200).json({ message: "Followed successfully" });
    }
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});

alumniRoutes.delete("/:alumniId", verifyToken, async (req, res) => {
  try {
    // Find alumni by ID
    const alumni = await Alumni.findById(req.params.alumniId);

    // Check if alumni exists
    if (!alumni) {
      console.error("No such user");
      return res.status(404).send("User not found");
    }

    // Check if account is already deleted
    if (alumni.accountDeleted) {
      console.error("Account is already deleted");

      // Update accountDeleted to false (restore account)
      const updatedAlumni = await Alumni.findOneAndUpdate(
        { _id: req.params.alumniId },
        { $set: { accountDeleted: false } },
        { new: true }
      );

      // Check if update was successful
      if (!updatedAlumni) {
        console.error("Failed to restore account");
        return res.status(500).send("Failed to restore account");
      }

      // Return success message
      return res.status(200).send("Account has been restored");
    }

    // Update accountDeleted to true
    const updatedAlumni = await Alumni.findOneAndUpdate(
      { _id: req.params.alumniId },
      { $set: { accountDeleted: true } },
      { new: true }
    );

    // Check if update was successful
    if (!updatedAlumni) {
      console.error("Failed to delete account");
      return res.status(500).send("Failed to delete account");
    }

    // Return success message
    return res.status(200).send("User account deleted successfully");
  } catch (error) {
    console.error("Error occurred:", error);
    return res.status(500).send("Internal Server Error");
  }
});



alumniRoutes.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Find the user by email
    const alumni = await Alumni.findOne({ email });

    if (!alumni) {
      console.error("No such alumni");
      return res.status(404).send("alumni not found");
    }

    // Check if the provided OTP matches the stored OTP
    if (alumni.otp !== otp) {
      console.error("Invalid OTP");
      return res.status(400).send("Invalid OTP");
    }

    // OTP is valid, update the alumni's status and remove the OTP
    alumni.status = "Verified";
    alumni.otp = undefined;
    await alumni.save();

    return res.status(200).send("OTP verified successfully");
  } catch (error) {
    console.error("Error occurred:", error);
    return res.status(500).send("Internal Server Error");
  }
});

alumniRoutes.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const size = parseInt(req.query.size);

    const skip = (page - 1) * size;

    const total = await Alumni.countDocuments({ profileLevel: { $ne: 0 } });
    const alumni = await Alumni.find({ profileLevel: { $ne: 0 } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(size);

    res.json({
      records: alumni,
      total,
      page,
      size,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

alumniRoutes.get("/:_id/following", async (req, res) => {
  try {
    const { _id } = req.params;
    const { page, size } = req.query;

    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(size) || 4;

    const user = await Alumni.findById(_id).populate("following", "firstName");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const totalFollowing = user.following.length;
    const followingDetails = user.following.slice(
      (pageNumber - 1) * pageSize,
      pageNumber * pageSize
    );

    res.status(200).json({ followingDetails, totalFollowing });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

alumniRoutes.get("/:_id/following/all", async (req, res) => {
  try {
    const { _id } = req.params;

    const user = await Alumni.findById(_id).populate("following", "firstName");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const followingDetails = user.following;

    res.status(200).json({ followingDetails });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

alumniRoutes.get("/:_id/followers", async (req, res) => {
  try {
    const { _id } = req.params;
    const { page, size } = req.query;

    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(size) || 4;

    const user = await Alumni.findById(_id).populate("followers", "firstName");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const totalFollowers = user.followers.length;
    const followerDetails = user.followers.slice(
      (pageNumber - 1) * pageSize,
      pageNumber * pageSize
    );

    res.status(200).json({ followerDetails, totalFollowers });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

alumniRoutes.get("/all/allAlumni", async (req, res) => {
  const alumni = await Alumni.find({}, { _id: 1, firstName: 1 });
  res.json(alumni);
});

alumniRoutes.put("/workExperience/:_id", verifyToken, async (req, res) => {
  const alumniId = req.params._id;
  const newWorkExperienceData = req.body;

  try {
    const alumni = await Alumni.findById(alumniId);
    if (!alumni) {
      return res.status(404).json({ message: "Alumni not found" });
    }

    if (alumni.workExperience) {
      // If alumni already has work experience, append new data
      if (Array.isArray(alumni.workExperience)) {
        // If work experience is an array, push new objects
        alumni.workExperience.push(...newWorkExperienceData);
      } else {
        // If work experience is an object, convert it to array and push new objects
        alumni.workExperience = [
          alumni.workExperience,
          ...newWorkExperienceData,
        ];
      }
    } else {
      // If no work experience exists, set the new data
      alumni.workExperience = newWorkExperienceData;
    }

    const updatedAlumni = await alumni.save();
    res.status(200).json(updatedAlumni);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

alumniRoutes.get("/workExperience/:_id", verifyToken, async (req, res) => {
  const alumniId = req.params._id;

  try {
    const alumni = await Alumni.findById(alumniId);
    if (!alumni) {
      return res.status(404).json({ message: "Alumni not found" });
    }

    // Sort workExperience array by startMonth and startYear in descending order
    alumni.workExperience.sort((a, b) => {
      if (a.startYear !== b.startYear) {
        return b.startYear - a.startYear; // Sort by startYear
      } else {
        return b.startMonth.localeCompare(a.startMonth); // Sort by startMonth if startYear is the same
      }
    });

    res.status(200).json(alumni.workExperience);
  } catch (error) {
    console.error("Error fetching work experience:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

alumniRoutes.put("/:_id/blockUser", async(req,res)=>{
  const { _id } = req.params; // ID of the user performing the block action
  const { blockedUserId } = req.body; // ID of the user to be blocked
  
  try {
    // Find the user who is being blocked
    const blockedUser = await Alumni.findById(blockedUserId);

    if (!blockedUser) {
      return res.status(404).json({ message: "Blocked user not found" });
    }

    // Find the user performing the block action
    const user = await Alumni.findById(_id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the blockedUserId is already present in the user's blockedContactsId array
    const isBlocked = user.blockedContactsId.includes(blockedUserId);

    if (isBlocked) {
      // If already blocked, perform unblock operation

      // Remove the blockedUserId from the user's blockedContactsId array
      user.blockedContactsId = user.blockedContactsId.filter(id => id !== blockedUserId);

      // Remove the _id from the blockedUser's blockedByUserIds array
      blockedUser.blockedByUserIds = blockedUser.blockedByUserIds.filter(id => id !== _id);

      // Save the updated blockedUser and user
      await blockedUser.save();
      await user.save();

      return res.status(200).json({ message: "User unblocked successfully" });
    } else {
      // If not blocked, perform block operation

      // Add the _id of the user performing the block action to the blockedUser's blockedByUserIds array
      blockedUser.blockedByUserIds.push(_id);

      // Add the blockedUserId to the user's blockedContactsId array
      user.blockedContactsId.push(blockedUserId);

      // Save the updated blockedUser and user
      await blockedUser.save();
      await user.save();

      return res.status(200).json({ message: "User blocked successfully" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});


alumniRoutes.get("/:_id/blockedByUsers", async (req, res) => {
  const { _id } = req.params; // ID of the user

  try {
    // Find the user by ID
    const user = await Alumni.findById(_id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return the user's blockedByUserIds array
    return res.status(200).json({ blockedByUserIds: user.blockedByUserIds });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});
alumniRoutes.get("/:_id/blockedUsers", async (req, res) => {
  const { _id } = req.params; // ID of the user

  try {
    // Find the user by ID
    const user = await Alumni.findById(_id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return the user's blockedByUserIds array
    return res.status(200).json({ blockedUsers: user.blockedContactsId });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

alumniRoutes.put("/alumni/validateId", async (req, res) => {
  const { userId, notificationId,toDelete } = req.body;
  console.log("userId notification id",userId,notificationId)

  try {
    const existingNotification = await Notification.findById(notificationId);
    if (toDelete===true) {
      // Update alumni's accountDeleted and expirationDate
      await Alumni.findByIdAndUpdate(userId, { $set: { accountDeleted: true, expirationDate: null,validated: false } });
      // Delete notification with notificationId
      await Notification.findByIdAndUpdate(notificationId, { $set: { status: true } });
      return res.status(200).send("Alumni ID validated successfully.");
    }
    else{
      await Alumni.findOneAndUpdate(
      { _id: userId },
      { $set: { expirationDate: null,accountDeleted: false,validated: true } }
    );
    //await Notification.findByIdAndUpdate(notificationId, { $set: { status: null } });
  

     await Notification.findOneAndDelete({ _id: notificationId });

    return res.status(200).send("Alumni ID validated successfully.");
  }
  } catch (error) {
    console.error("Error occurred:", error);
    return res.status(500).send("Internal Server Error");
  }
});

alumniRoutes.delete("/alumni/deleteNotification", async (req, res) => {
  const { notificationId } = req.body;
  try {
    if (notificationId) {
      await Notification.findByIdAndDelete(notificationId);
      return res.status(200).send("Notification deleted successfully.");
    } else {
      return res.status(400).send("Notification ID is missing.");
    }
  } catch (error) {
    console.error("Error deleting notification:", error);
    return res.status(500).send("Internal Server Error");
  }
});




module.exports = alumniRoutes;
