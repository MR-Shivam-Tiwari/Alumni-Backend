const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  userId: {
    type: String,
  },
  content: {
    type: String,
  },
  userName: {
    type: String,
  },
  comments: [this],
});

commentSchema.add({ comments: [commentSchema] });


const forumSchema = new mongoose.Schema({
  title: String,
  userId: String,
  description: String,
  picture: String,
  department: String,
  video: String,
  members: [String],
  totalTopics: Number,
  createdAt: Date,
  type: String,
  comment: Boolean,
  comments: [commentSchema], // Array of nested comments
});

const Forum = mongoose.model('Forum', forumSchema);

module.exports = Forum;
