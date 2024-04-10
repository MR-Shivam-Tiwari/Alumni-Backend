const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const verifyToken = require("../utils");
const checkProfileLevel = require("../middleware/checkProfileLevel");
const Event = require("../models/Events");

const eventRoutes = express.Router();

eventRoutes.get("/", async (req, res) => {
  try {
    const events = await Event.find();
    return res.json(events);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
});

eventRoutes.post("/createEvent", async (req, res) => {
  const {
    userId,
    start,
    end,
    title,
    description,
    allDay,
    free,
    type,
    color,
    startTime,
    endTime,
    picture,
    department,
    cName,
    cNumber,
    cEmail,
    location
  } = req.body;
  try {
    const istStartDate = new Date(start).toISOString(); 
    const istEndDate = new Date(end).toISOString();

    const newEvent = new Event({
      userId,
      start: istStartDate,
      end: istEndDate,
      title,
      description,
      allDay,
      free,
      color,
      type,
      startTime,
      endTime,
      picture,
      department,
      cName,
      cNumber,
      cEmail,
      location
    });
    await newEvent.save();
    return res.status(201).send(newEvent);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
});

eventRoutes.put("/:_id", async (req, res) => {
  const updatedData = req.body;
  const { start, end, startTime, endTime, picture } = updatedData;

  try {
    const event = await Event.findById(req.params._id);

    if (!event) {
      console.error("No such event");
      return res.status(404).send("event not found");
    }

    const istStartDate = new Date(start).toISOString(); // Store with timezone offset
    const istEndDate = new Date(end).toISOString(); // Store with timezone offset

    updatedData.start = istStartDate; // Store with timezone offset
    updatedData.end = istEndDate; // Store with timezone offset

    Object.assign(event, updatedData);
    await event.save();

    return res.status(200).send("event updated successfully");
  } catch (error) {
    console.error("Error occurred:", error);
    return res.status(500).send("Internal Server Error");
  }
});

eventRoutes.delete("/:_id", async (req, res) => {
  const { _id } = req.params;
  try {
    const deletedEvent = await Event.findOneAndDelete({ _id });

    if (!deletedEvent) {
      console.error("No such Event");
      return res.status(404).send("Event not found");
    }

    return res.status(200).send("Event deleted successfully");
  } catch (error) {
    console.error("Error occurred:", error);
    return res.status(500).send("Internal Server Error");
  }
});

eventRoutes.delete("/", async (req, res) => {
  try {
    // Delete all events
    await Event.deleteMany({});

    return res.status(200).send("All events deleted successfully");
  } catch (error) {
    console.error("Error occurred:", error);
    return res.status(500).send("Internal Server Error");
  }
});

module.exports = eventRoutes;
