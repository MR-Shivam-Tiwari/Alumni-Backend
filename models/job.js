const mongoose = require('mongoose');

const jobsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  title:String,
  location:String,
  salaryMin: Number,
  salaryMax: Number,
  picture: String,
  coverImage:String,
  currency: String,
  duration: String,
  employmentType: String,
  category: String,
  questions: [],
  description: String,
  type: String,
  attachments: [String],
  archive: Boolean,
  starred: [String],
  approved: Boolean,
  appliedCandidates: [{
    userId: String,
    name: String,
    resume: String,
    appliedAt: Date,
    status: String,
    comment: String,
  }]

},
{ timestamps: true });

const Jobs = mongoose.model('Jobs', jobsSchema);

module.exports = Jobs;
