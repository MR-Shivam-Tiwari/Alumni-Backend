const express = require('express');
const searchRoutes = express.Router();
const Forum = require('../models/Forum');
const Alumni = require('../models/Alumni');
const Group = require('../models/group');
const Job = require('../models/job');
const Internship = require('../models/internship');

searchRoutes.get("/search", async (req, res) => {
    const keyword = req.query.keyword;

    try {
        const forumResults = await Forum.find({ title: { $regex: new RegExp(keyword, 'i') } });
        const alumniResults = await Alumni.find({ firstName: { $regex: new RegExp(keyword, 'i') } });
        const groupResults = await Group.find({ groupName: { $regex: new RegExp(keyword, 'i') } });
        const jobResults = await Job.find({
            $or: [
                { jobTitle: { $regex: new RegExp(keyword, 'i') } },
                { description: { $regex: new RegExp(keyword, 'i') } }
            ]
        });
        const internshipResults = await Internship.find({ internshipTitle: { $regex: new RegExp(keyword, 'i') } });

        res.json({
            forum: forumResults,
            alumni: alumniResults,
            group: groupResults,
            job: jobResults,
            internship: internshipResults
        });
    } catch (error) {
        console.error("Error searching:", error);
        res.status(500).json({ error: "An error occurred while searching." });
    }
});

module.exports = searchRoutes;