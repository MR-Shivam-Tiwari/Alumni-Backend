const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  title:String,
  content:String,
  createdAt: String,
  createdBy: String,
  author: String,
  picturePath: String,
});

const Topic = mongoose.model('Topic', topicSchema);

module.exports = Topic;
