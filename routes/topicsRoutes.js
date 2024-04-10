const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const verifyToken = require('../utils');
const checkProfileLevel= require('../middleware/checkProfileLevel');
const Topic = require('../models/topic');

const topicRoutes = express.Router();

topicRoutes.post('/createTopic', async(req,res)=>{
    try {
        const { title, content,createdBy,author,picturePath } = req.body;
    
        const currentDate = new Date();
        const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        timeZone: 'Asia/Kolkata',
        };
    
        const creationDate = currentDate.toLocaleString('en-IN', options);
        const newTopic = new Topic({
          title: title,
          content: content,
          createdAt: creationDate,
          createdBy: createdBy,
          author,
          picturePath
        });
    
        // Save the Topic to the "Topics" collection
        await newTopic.save();
    
        res.status(201).json(newTopic);
      } catch (err) {
        res.status(500).send({ message: 'Error creating Topic' });
      }
    });

topicRoutes.get('/:_id', async(req,res)=>{
    try {
        const topic = await Topic.findById(req.params._id);
    
        if (!topic) {
          console.error('No such topic');
          return res.status(404).send('topic not found');
        }

        res.status(200).json(topic);

    } catch(err) {
        return res.status(400).send(err);
    }
});

topicRoutes.put('/:_id', async(req,res)=>{
    const updatedData = req.body;
     
    try {
      const topic = await Topic.findById(req.params._id);
      
      if (!topic) {
        console.error('No such topic');
        return res.status(404).send('topic not found');
      }
      Object.assign(topic, updatedData);
      await topic.save();
      
      return res.status(200).send('topic updated successfully');
    } catch (error) {
      console.error('Error occurred:', error);
      return res.status(500).send('Internal Server Error');
    }
  });

topicRoutes.delete('/:_id', async(req,res)=>{
    const { _id } = req.params; // Get the topic ID from the URL parameter

    try {
      const deletedTopic = await Topic.findOneAndDelete({ _id });
  
      if (!deletedTopic) {
        console.error('No such Topic');
        return res.status(404).send('Topic not found');
      }
  
      return res.status(200).send('Topic deleted successfully');
    } catch (error) {
      console.error('Error occurred:', error);
      return res.status(500).send('Internal Server Error');
    }
  });

topicRoutes.get('/', async (req, res) => {
  try {
      const topic = await Topic.find();
        
      if (!topic) {
        console.error('No existing topics');
        return res.status(404).send('topics not found');
      }
    
      res.status(200).json(topic);
    
  } catch(err) {
          return res.status(400).send(err);
    }
});    

module.exports= topicRoutes;