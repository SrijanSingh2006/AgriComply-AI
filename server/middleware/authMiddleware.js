const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // 1. Get the token from the header
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Access Denied' });

  try {
    // 2. Remove "Bearer " prefix to get the raw token string
    const cleanToken = token.replace("Bearer ", "");

    // 3. Verify the token using your secret key
    const verified = jwt.verify(cleanToken, process.env.JWT_SECRET);

    // 4. Attach the decoded payload (id, role, iat, exp) to req.user
    // This is what makes 'req.user.role' available in your controllers!
    req.user = verified;
    
    // Optional: Log this to debug if roles aren't working
    // console.log("Auth Middleware Decoded:", req.user);

    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid Token' });
  }
};