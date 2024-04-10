const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const verifyToken = require("../utils");
const checkProfileLevel = require("../middleware/checkProfileLevel");
const Alumni = require("../models/Alumni");
const Group = require("../models/group");
const Notification = require("../models/notification");

const groupRoutes = express.Router();

groupRoutes.post("/create", async (req, res) => {
  const {
    userId,
    groupName,
    members,
    groupLogo,
    groupType,
    category,
    isNewest,
    isPopular,
    isActive,
  } = req.body;

  try {
    // Find user details using userId
    const user = await Alumni.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const existingGroup = await Group.findOne({ groupName: groupName });

    if (existingGroup) {
      return res.status(400).json({
        message: "Group name already exists. Please choose a different name.",
      });
    }
    const currentDate = new Date();
    const newGroup = new Group({
      userId,
      groupName,
      groupLogo,
      createdAt: currentDate,
      members: [userId],
      groupType,
      category,
      isNewest,
      isPopular,
      isActive,
      department: user.department, 
    });

    await Alumni.updateMany(
      { _id: { $in: members } },
      { $addToSet: { groupNames: newGroup._id } }
    );

    await newGroup.save();

    res.status(201).json(newGroup);
  } catch (error) {
    res.status(500).send(error);
  }
});


groupRoutes.get("/joined", async (req, res) => {
  try {
    const { userId } = req.query;
    const page = parseInt(req.query.page);
    const size = parseInt(req.query.size);

    const skip = (page - 1) * size;

    const total = await Group.countDocuments({ members: userId });
    const groups = await Group.find({ members: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(size);

    res.json({
      records: groups,
      total,
      page,
      size,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json(error);
  }
});

groupRoutes.get("/:_id", async (req, res) => {
  try {
    const group = await Group.findById(req.params._id);
    if (!group) {
      console.error("No such group");
      return res.status(404).send("group not found");
    }

    res.status(200).json(group);
  } catch (err) {
    return res.status(400).send(err);
  }
});

groupRoutes.get("/groups/active", async (req, res) => {
  try {
    const activeGroups = await Group.find({ isActive: true });
    res.json(activeGroups);
  } catch (err) {
    res.status(500).json({ message: "Error fetching active Groups" });
  }
});

groupRoutes.get("/groups/newest", async (req, res) => {
  try {
    const newestGroups = await Group.find({ isNewest: true });
    res.json(newestGroups);
  } catch (err) {
    res.status(500).json({ err });
  }
});

groupRoutes.get("/groups/popular", async (req, res) => {
  try {
    const popularGroups = await Group.find({ isPopular: true });
    res.json(popularGroups);
  } catch (err) {
    res.status(500).json({ message: "Error fetching popular Groups" });
  }
});

groupRoutes.put("/members/:_id", async (req, res) => {
  const { userId, notificationId } = req.body;
  const { _id } = req.params;

  try {
    if (notificationId) {
      await Notification.findByIdAndDelete(notificationId);
    }
    const group = await Group.findById(_id);
    if (!group) {
      console.error("No such group");
      return res.status(404).send("Group not found");
    }

    const user = await Alumni.findById(userId);
    if (!user) {
      console.error("No such user");
      return res.status(404).send("User not found");
    }

    const userIndex = group.members.indexOf(userId);
    let isUserAdded;

    if (userIndex !== -1) {
      group.members.splice(userIndex, 1);
      isUserAdded = false;
    } else {
      group.members.push(userId);
      isUserAdded = true;
    }
    await group.save();

    const groupIndex = user.groupNames.indexOf(_id);
    if (groupIndex !== -1) {
      user.groupNames.splice(groupIndex, 1);
    } else {
      user.groupNames.push(_id);
    }
    await user.save();

    return res
      .status(200)
      .json({ message: "Group updated successfully", isUserAdded });
  } catch (error) {
    console.error("Error occurred:", error);
    return res.status(500).send("Internal Server Error");
  }
});

groupRoutes.put("/:_id", async (req, res) => {
  const groupId = req.params._id;
  const {
    groupName,
    userId,
    groupLogo,
    members,
    createdAt,
    category,
    groupType,
    isUserAdded,
  } = req.body;

  try {
    const groupToUpdate = {};
    if (groupName) groupToUpdate.groupName = groupName;
    if (userId) groupToUpdate.userId = userId;
    if (groupLogo) groupToUpdate.groupLogo = groupLogo;
    if (members) groupToUpdate.members = members;
    if (createdAt) groupToUpdate.createdAt = createdAt;
    if (category) groupToUpdate.category = category;
    if (groupType) groupToUpdate.groupType = groupType;
    if (isUserAdded) groupToUpdate.isUserAdded = isUserAdded;

    const updatedGroup = await Group.findByIdAndUpdate(groupId, groupToUpdate, {
      new: true,
    });

    res.json(updatedGroup);
  } catch (error) {
    console.error("Error updating group:", error);
    res.status(500).json({ message: "Error updating group" });
  }
});

groupRoutes.delete("/:_id", async (req, res) => {
  try {
    const groupId = req.params._id;

    const group = await Group.findByIdAndDelete(groupId);
    if (!group) {
      return res.status(400).send("Group not available");
    }

    const alumniToUpdate = await Alumni.find({ groupNames: groupId });

    const updatePromises = alumniToUpdate.map((alumni) => {
      const updatedGroupNames = alumni.groupNames.filter(
        (id) => id !== groupId
      );
      return Alumni.findByIdAndUpdate(
        alumni._id,
        { $set: { groupNames: updatedGroupNames } },
        { new: true }
      );
    });

    await Promise.all(updatePromises);

    res.json({ message: "Group deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting group" });
  }
});

groupRoutes.get("/", async (req, res) => {
  try {
    const { userId } = req.query;
    const page = parseInt(req.query.page);
    const size = parseInt(req.query.size);

    const skip = (page - 1) * size;

    const total = await Group.countDocuments({
      userId: { $ne: userId },
      members: { $ne: userId },
    });

    const groups = await Group.find({
      userId: { $ne: userId },
      members: { $ne: userId },
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(size);

    res.json({
      records: groups,
      total,
      page,
      size,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json(error);
  }
});

groupRoutes.get("/:_id/members", async (req, res) => {
  try {
    const { _id } = req.params;

    const group = await Group.findById(_id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const members = group.members;

    res.status(200).json({ members: members, owner: group.userId });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

groupRoutes.get("/user/:_id", async (req, res) => {
  const userId = req.params._id;

  try {
    const groups = await Group.find({ userId });

    if (groups.length > 0) {
      res.status(200).json({ groups });
    } else {
      res.status(200).json({ message: "No groups found for this user." });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

groupRoutes.post("/createRequest", async (req, res) => {
  const { userId, groupId, ownerId, requestedUserName, groupName, ID } = req.body;
  let requested;

  try {
    if (ID) {
      // Find the alumni with the provided userId
      const alumni = await Alumni.findOne({ _id: userId });

      // Check if the alumni exists
      if (!alumni) {
        return res.status(404).json({ error: "Alumni not found" });
      }

      // Find the admin of the same department as the alumni
      const admin = await Alumni.findOne({ profileLevel: 1, department: alumni.department });

      // Check if the admin exists
      if (!admin) {
        return res.status(404).json({ error: "Admin not found for the department" });
      }

      // Create a new notification with admin as ownerId
      const newNotification = new Notification({
        userId,
        ID,
        ownerId: admin._id,
        requestedUserName,
        status: false,
      });
      await newNotification.save();
      requested = true;
      return res.status(201).json({ newNotification, requested });
    }

    // For regular notification creation
    const existingNotification = await Notification.findOne({
      userId,
      groupId,
    });

    if (existingNotification) {
      await Notification.deleteOne({ userId, groupId });
      requested = false;
      return res.status(200).json({
        message: "Existing notification removed.",
        newNotification: null,
        requested,
      });
    } else {
      const newNotification = new Notification({
        userId,
        groupId,
        ownerId,
        requestedUserName,
        groupName,
        status: false,
      });
      await newNotification.save();
      requested = true;
      return res.status(201).json({ newNotification, requested });
    }
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});


groupRoutes.get("/requests/req", async (req, res) => {
  try {
    const requests = await Notification.find();
    res.status(201).json(requests);
  } catch (error) {
    return res.send(error);
  }
});

module.exports = groupRoutes;
