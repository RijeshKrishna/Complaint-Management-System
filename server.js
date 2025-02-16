const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// In-memory data storage
let users = [];

// Register a new user
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Check if user already exists
    const userExists = users.find((user) => user.email === email);
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      role: role || 'user', // Default role is 'user'
    };

    users.push(user);

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user
    const user = users.find((user) => user.email === email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Protected route example (for admin only)
app.get('/api/admin', (req, res) => {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user is admin
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ message: 'Welcome, admin!' });
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));