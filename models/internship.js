const mongoose = require('mongoose');

const internshipsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  title: String,
  location: String,
  salaryMin: Number,
  salaryMax: Number,
  picture: String,
  currency: String,
  duration: String,
  employmentType: String,
  category: String,
  questions: [],
  description: String,
  attachments: [String],
  archive: Boolean,
  coverImage:String,
  starred: [String],
  type: String,
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

const Internship = mongoose.model('Internships', internshipsSchema);

module.exports = Internship;