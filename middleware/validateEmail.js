

const validateEmail = (req, res, next) => {
    const { email } = req.body;
  
    // Perform email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
  
    // Proceed to the next middleware or route handler
    next();
  };

  module.exports = validateEmail;