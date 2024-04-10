const validatePassword = (req, res, next) => {
  const { password,confirmPassword } = req.body;

  // Password length validation
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password should be at least 8 characters long' });
  }

  // Uppercase character validation
  if (!/[A-Z]/.test(password)) {
    return res.status(400).json({ error: 'Password should contain at least one uppercase letter' });
  }

  // Special character validation
  if (!/[!@#$%^&*]/.test(password)) {
    return res.status(400).json({ error: 'Password should contain at least one special character (!@#$%^&*)' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  // Proceed to the next middleware or route handler
  next();
};

module.exports = validatePassword;