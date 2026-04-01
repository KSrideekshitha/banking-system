const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');

const JWT_SECRET = 'banking_secret_key_2024';

// Sign Up
router.post('/signup', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ error: 'All fields are required.' });

  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });

  const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (existingUser)
    return res.status(400).json({ error: 'Email already registered.' });

  const hashedPassword = bcrypt.hashSync(password, 10);
  const result = db.prepare(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)'
  ).run(name, email, hashedPassword);

  const user = db.prepare('SELECT id, name, email, balance FROM users WHERE id = ?').get(result.lastInsertRowid);
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

  res.json({ message: 'Account created successfully!', token, user });
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required.' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user)
    return res.status(401).json({ error: 'Invalid email or password.' });

  const validPassword = bcrypt.compareSync(password, user.password);
  if (!validPassword)
    return res.status(401).json({ error: 'Invalid email or password.' });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
  const { password: _, ...userWithoutPassword } = user;

  res.json({ message: 'Login successful!', token, user: userWithoutPassword });
});

module.exports = router;
module.exports.JWT_SECRET = JWT_SECRET;
