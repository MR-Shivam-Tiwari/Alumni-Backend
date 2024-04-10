const mongoose = require('mongoose');

const validColors = ['#ffeb3c', '#ff9900', '#f44437', '#ea1e63', '#9c26b0', '#3f51b5', '#009788', '#4baf4f', '#7e5d4e'];

const eventSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  start: String,
  end: String,
  title: String,
  description: String,
  startTime: String,
  endTime: String,
  allDay: Boolean,
  free: Boolean,
  picture: String,
  type: String,
  cName: String,
  cNumber: Number,
  cEmail: String,
  location: String,
  department: String,
  color: {
    type: String,
    enum: validColors,
    default: validColors[0] 
  }
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
