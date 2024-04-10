const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const verifyToken = require('../utils');
const checkProfileLevel= require('../middleware/checkProfileLevel');
const Forum = require('../models/Forum');
const Alumni = require('../models/Alumni');
const forumRoutes = express.Router();
const Notification = require("../models/notification");

forumRoutes.post('/createForum', async (req, res) => {
  const { userId, title, description, picture, video,type,department,members } = req.body;

  try {
    const user = await Alumni.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const newForum = new Forum({
      userId,
      title,
      description,
      picture,
      department,
      members: [userId],
      video,
      totalTopics: 0,
      type,
      comment: type==='Public'? true : false,
      createdAt: new Date() 
    });


    await Alumni.updateMany(
      { _id: { $in: newForum.members } },
      { $addToSet: { forumNames: newForum._id } }
    );

    await newForum.save();

    res.status(201).json(newForum);
  } catch (err) {
    res.status(500).send(err);
  }
});



forumRoutes.get('/', async (req, res) => {
  try {
    const forums = await Forum.find().sort({ createdAt: -1 });
    const totalForums = await Forum.countDocuments();

    return res.json({ forums, totalForums });
  } catch (error) {
    console.error('Error fetching forums:', error);
    return res.status(500).send(error);
  }
});

  
forumRoutes.post("/createRequest", async (req, res) => {
  const { userId, forumId, ownerId, requestedUserName, forumName } = req.body;
  let requested;
  console.log('forumname',forumName);
  console.log('request body',req.body)
  try {
    const existingNotification = await Notification.findOne({
      userId,
      forumId,
    });

    if (existingNotification) {
      await Notification.deleteOne({ userId, forumId });
      requested = false;
      res
        .status(200)
        .json({
          message: "Existing notification removed.",
          newNotification: null,
          requested,
        });
    } else {
      const newNotification = new Notification({
        userId,
        forumId,
        ownerId,
        requestedUserName,
        forumName,
        status: false,
      });
      await newNotification.save();
      requested = true;
      res.status(201).json({ newNotification, requested });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
});
forumRoutes.get('/:_id', async(req,res)=>{
    try {
      const forum = await Forum.findById(req.params._id);
  
      if (!forum) {
        console.error("No such forum");
        return res.status(404).send("Forum not found");
      }
      res.status(200).json(forum);
    } catch (err) {
      return res.status(400).send(err);
    }
  })

forumRoutes.post("/:_id/comments", async (req, res) => {
    try {
      const { _id } = req.params;
      const { userId, content, userName, parentCommentId } = req.body;
  
      
      const forum = await Forum.findById(_id);
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
  
      
      const newComment = { userId, content, userName };
  
      
      const findCommentById = (commentId, commentsArray) => {
        for (const comment of commentsArray) {
          if (comment._id.equals(commentId)) {
            return comment;
          }
          if (comment.comments.length > 0) {
            const foundComment = findCommentById(commentId, comment.comments);
            if (foundComment) {
              return foundComment;
            }
          }
        }
        return null;
      };
  
      if (parentCommentId === null) {
        
        forum.comments.push(newComment);
      } else {
        
        const parentComment = findCommentById(parentCommentId, forum.comments);
        if (!parentComment) {
          return res.status(404).json({ message: "Parent comment not found" });
        }
        parentComment.comments.push(newComment);
      }
  
      
      const updatedForum = await forum.save();
      res.status(200).json(updatedForum);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

forumRoutes.delete("/:_id/comments/:comment_id", async (req, res) => {
    try {
      const { _id, comment_id } = req.params;
  
      const forum = await Forum.findById(_id);
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
      
      const findCommentById = (commentId, commentsArray) => {
        for (let i = 0; i < commentsArray.length; i++) {
          const comment = commentsArray[i];
          if (comment._id.equals(commentId)) {
            return commentsArray.splice(i, 1); 
          }
          if (comment.comments.length > 0) {
            const foundComment = findCommentById(commentId, comment.comments);
            if (foundComment) {
              return foundComment;
            }
          }
        }
        return null;
      };
  
      
      findCommentById(comment_id, forum.comments);
  
      
      const updatedForum = await forum.save();
  
      res.status(200).json(updatedForum);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  

forumRoutes.delete("/:_id", async (req, res) => {
    const { _id } = req.params; 
  
    try {
      const deletedForum = await Forum.findOneAndDelete({ _id });
  
      if (!deletedForum) {
        console.error("No such Forum");
        return res.status(404).send("Forum not found");
      }
  
      return res.status(200).send("Forum deleted successfully");
    } catch (error) {
      console.error("Error occurred:", error);
      return res.status(500).send("Internal Server Error");
    }
  });
  
forumRoutes.put("/members/:_id", async (req, res) => {
    const { userId, notificationId } = req.body;
    const { _id } = req.params;
  
    try {
      if (notificationId) {
        await Notification.findByIdAndDelete(notificationId);
      }
      const forum = await Forum.findById(_id);
      if (!forum) {
        console.error("No such forum");
        return res.status(404).send("Forum not found");
      }
  
      const user = await Alumni.findById(userId);
      if (!user) {
        console.error("No such user");
        return res.status(404).send("User not found");
      }
  
     const userIndex = forum.members.indexOf(userId);
      let isUserAdded;
  
      if (userIndex !== -1) {
        forum.members.splice(userIndex, 1);
        isUserAdded = false;
      } else {
        forum.members.push(userId);
        isUserAdded = true;
      }
      await forum.save();
  
      const groupIndex = user.forumNames.indexOf(_id);
      if (groupIndex !== -1) {
        user.forumNames.splice(groupIndex, 1);
      } else {
        user.forumNames.push(_id);
      }
      await user.save();
  
      return res
        .status(200)
        .json({ message: "Forum updated successfully", isUserAdded });
    } catch (error) {
      console.error("Error occurred:", error);
      return res.status(500).send("Internal Server Error");
    }
  });

forumRoutes.get("/:_id/members", async (req, res) => {
    try {
      const { _id } = req.params;
  
      const forum = await Forum.findById(_id);
  
      if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
      }
  
      const members = forum.members;
  
      res.status(200).json({ members: members, owner: forum.userId });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
   
  
  
  



module.exports= forumRoutes;