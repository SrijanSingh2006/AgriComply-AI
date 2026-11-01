const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Access Denied' });

  try {
    
    const cleanToken = token.replace("Bearer ", "");

    
    const jwtSecret = process.env.JWT_SECRET || 'agricomply_super_secret_jwt_key_2026';
    const verified = jwt.verify(cleanToken, jwtSecret);

    
    
    req.user = verified;
    
    
    

    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid Token' });
  }
};