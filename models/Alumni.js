const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let AlumniSchema = new Schema(
  {
    firstName: {
      type: String,
      // required: true
    },
    lastName: {
      type: String,
      // required: true
    },
    graduation_year: {
      type: Number,
    },
    graduation_degree: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    mobile: {
      type: String,
      // required: true
    },
    password: {
      type: String,
      required: true,
    },
    oldPassword: String,
    newPassword: String,
    confirmNewPassword: String,
    dob: {
      type: Date,
    },
    expirationDate: Date,
    profilePicture: String,
    gender: {
      type: String,
    },
    isActive: Boolean,
    isNewest: Boolean,
    isPopular: Boolean,
    otp: Number,
    groupNames: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
      },
    ],
    forumNames: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Forum",
      },
    ],
    profileLevel: { type: Number },
    status: {
      type: "String",
      default: "Unverified",
    },
    profile: {
      type: String,
    },
    designation: {
      type: String,
    },

    picturePath: {
      type: String,
      default: "",
    },
    friends: {
      type: Array,
      default: [],
    },
    following: [
      {
        userId: {
          type: String,
        },
        firstName: {
          type: String,
        },
      },
    ],
    followers: [
      {
        userId: {
          type: String,
        },
        firstName: {
          type: String,
        },
      },
    ],
    profilePicture: String,
    coverPicture: String,
    ID: String,
    location: String,
    occupation: String,
    viewedProfile: Number,
    impressions: Number,
    workingAt: String,
    companyWebsite: String,
    aboutMe: String,
    city: String,
    accountDeleted: Boolean,
    country: String,
    department: String,
    batch: String,
    validated: Boolean,
    workExperience: [Object],
    blockedByUserIds: [String],
    blockedContactsId: [String],
    admin: Boolean,
    appliedJobs: [
      {
        jobId: {
          type: String,
        },
        status: {
          type: String,
        },
        comment: {
          type: String,
        }
      },
    ],
  },
  { timestamps: true }
);

const Alumni = mongoose.model("Alumni", AlumniSchema);
module.exports = Alumni;
