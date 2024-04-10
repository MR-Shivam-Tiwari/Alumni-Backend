const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
      },
    businessName: String,
    name: String,
    businessDescription: String,
    amount: Number,
    businessPlan: [String],
    competitiveAdvantage: String,
    currentRevenue: String,
    email: String,
    fundingGoal: Number,
    industry: String,
    marketingStrategy: String,
    phone: Number,
    targetMarket: String,
    teamExperience: String,
    createdAt: Date
})

const Donation = mongoose.model('Donation', donationSchema);

module.exports = Donation;
