const mongoose = require('mongoose');

const sponsorshipSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
      },
    title: String,
    profilePic: String,
    description: String,
    raisedAmount: Number,
    totalAmount: Number,
    picturePath: String,
    totalContributions: Number,
    createdAt: Date
});

const Sponsorship = mongoose.model('Sponsorship', sponsorshipSchema);

module.exports = Sponsorship;
