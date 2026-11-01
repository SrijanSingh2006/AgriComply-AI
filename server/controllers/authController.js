const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    
    const { name, email, password, role } = req.body;
    
    
    const userRole = role || 'Farmer'; 

    const hashedPassword = await bcrypt.hash(password, 10);
    
    
    await User.create(name, email, hashedPassword, userRole);
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    
    const jwtSecret = process.env.JWT_SECRET || 'agricomply_super_secret_jwt_key_2026';
    const token = jwt.sign({ id: user.id, role: user.role }, jwtSecret, { expiresIn: '24h' });
    
    res.json({ 
        token, 
        user: { id: user.id, name: user.name, role: user.role } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};