const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  requestedUserName: {
    type: String,
    required: true,
  },
  groupId: {
    type: String,
  },
  forumId: {
    type: String,  
  },
  groupName: {
    type: String,
  },
  forumName: {
    type: String,
  },
  ownerId: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
  },
  ID: String, 
  job: Boolean,
  jobId: String,
},
{ timestamps: true });

const Notification = mongoose.model('Notification', NotificationSchema);

module.exports = Notification;