const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  alumniId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Alumni',
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    // required: true,
  },
  email:{
    type: String,
  }
});

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
