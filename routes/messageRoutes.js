const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const verifyToken = require("../utils");
const checkProfileLevel = require("../middleware/checkProfileLevel");
const path = require("path");
const fs = require("fs");
const url = require("url");
const Message = require("../models/message")

const messageRoutes = express.Router();

messageRoutes.get('/:userId',verifyToken, async(req,res)=>{
    const { userId } = req.params;
    const messages = await Message.find({
        sender: {$in: [userId,req.user.userId]},
        recipient: {$in: [userId,req.user.userId]},
    }).sort({createdAt: 1});
    res.json(messages);

})

messageRoutes.delete('/', async (req, res) => {
    try {
        // Use deleteMany to delete all documents in the collection
        const result = await Message.deleteMany({});
        
        res.status(200).json({
            success: true,
            message: `Deleted ${result.deletedCount} messages.`,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });
    }
});














module.exports = messageRoutes;