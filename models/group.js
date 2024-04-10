const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  groupName: String,
  userId: String,
  groupLogo: String,
  members: [String],
  createdAt: Date,
  category: String,
  groupType: String,
  isUserAdded: Boolean,
  department: String,
});

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;
