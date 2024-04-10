const Alumni = require('../models/Alumni');
const Group = require('../models/group');
async function checkGroupExists(req, res, next) {
    const alumniId = req.params.alumniId;
    try {
    const groupIds = await Group.find({ members: alumniId }).distinct('_id');
    const groupNamesToUpdate = groupIds.map((id) => id.toString());
  
      // Update the groupNames field for the alumni member
      await Alumni.findByIdAndUpdate(
        alumniId,
        { $set: { groupNames: groupNamesToUpdate } },
        { new: true }
      );
      next();
    } catch (err) {
      res.status(500).json({ message: 'Error checking group existence' });
    }
  }
  
  module.exports = checkGroupExists;