const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const verifyToken = require('../utils');
const checkProfileLevel= require('../middleware/checkProfileLevel');
const Alumni = require('../models/Alumni');
const Group = require('../models/group');

const memberRoutes = express.Router();

memberRoutes.get('/active', async(req, res) => {
    try {
        const activeMembers = await Alumni.find({ isActive: true });
        res.json(activeMembers);
      } catch (err) {
        res.status(500).json({ message: 'Error fetching active members' });
      }
    });
  
  // Read newest alumni members
memberRoutes.get('/newest', async(req, res) => {
    try {
        const newestMembers = await Alumni.find({ isNewest: true });
        res.json(newestMembers);
      } catch (err) {
        res.status(500).json({ message: 'Error fetching newest members' });
      }
    });
  
  // Read popular alumni members
memberRoutes.get('/popular', async(req, res) => {
    try {
        const popularMembers = await Alumni.find({ isPopular: true });
        res.json(popularMembers);
      } catch (err) {
        res.status(500).json({ message: 'Error fetching popular members' });
      }
    });


  
  





module.exports = memberRoutes;