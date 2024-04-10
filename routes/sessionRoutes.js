const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const verifyToken = require('../utils');
const checkProfileLevel= require('../middleware/checkProfileLevel');
const Session = require('../models/session');
const { deleteMany } = require('../models/Alumni');


const sessionRoutes = express.Router();

sessionRoutes.delete('/', async (req,res)=>{
    const deletedSession= await Session.find();
    if(!deletedSession) {
     console.log("No sessions available");
     return res.status(400).send("Session not found");
    }
    await Session.deleteMany();
    return res.status(200).send("All sessions deleted")

});



module.exports=sessionRoutes;