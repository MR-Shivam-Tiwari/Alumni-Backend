

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


const postSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    location: String,
    description: String,
    picturePath: String,
    userPicturePath: String,
    likes: [
      {
        userId: {
          type: String,
        },
        userName: {
          type: String,
        },
      },
    ],
    comments: [commentSchema],
    videoPath: Object,
    type: String
  },
  
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

module.exports= Post;