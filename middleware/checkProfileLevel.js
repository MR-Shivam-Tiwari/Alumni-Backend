const Alumni = require('../models/Alumni');
// Middleware function to check profile level and allow access accordingly
const checkProfileLevel = async (req, res, next)=>{
  try{
    const alumni = await Alumni.findOne({
      _id: req.user ? req.user.userId : undefined
    });
    
    console.log('id',req.params)
    console.log('_id',req.user)
    
    
        if(!alumni){
            console.log("No Such Alumni");
            return res.status(400).send("No Alumni");
        }
        console.log('profile',alumni)
        const profileLevel = alumni.profileLevel; 
  if (profileLevel === 0) {
    // Allow access for profile level 0 to all HTTP methods
    next();
  } else if (profileLevel === 1) {
    // Allow access for profile level 1 to get, post, and put methods
    if (req.method === 'GET' || req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      next();
    } else {
      return res.status(403).json({ message: 'Access forbidden as profileLevel=1' });
    }
  } else if (profileLevel === 2) {
    // Allow access for profile level 2 to get method only
    if (req.method === 'GET') {
      next();
    } else {
      return res.status(403).json({ message: 'Access forbidden as profileLevel=2' });
    }
  } else {
    // Handle other profile levels or unauthorized users
    return res.status(403).json({ message: 'Access forbidden as other profileLevels or unauthorized users' });
  }}catch(error){
    console.log(" catch error",error);
  }
}
  module.exports = checkProfileLevel;