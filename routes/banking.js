const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db/database');
const { JWT_SECRET } = require('./auth');

// Auth middleware
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided.' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

// Get profile & balance
router.get('/profile', authenticate, (req, res) => {
  const user = db.prepare('SELECT id, name, email, balance, created_at FROM users WHERE id = ?').get(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json(user);
});

// Deposit
router.post('/deposit', authenticate, (req, res) => {
  const { amount } = req.body;
  if (!amount || isNaN(amount) || Number(amount) <= 0)
    return res.status(400).json({ error: 'Enter a valid deposit amount.' });

  const amt = parseFloat(amount);
  if (amt > 1000000) return res.status(400).json({ error: 'Maximum deposit is ₹10,00,000.' });

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
  const newBalance = user.balance + amt;

  db.prepare('UPDATE users SET balance = ? WHERE id = ?').run(newBalance, req.userId);
  db.prepare(
    'INSERT INTO transactions (user_id, type, amount, description, balance_after) VALUES (?, ?, ?, ?, ?)'
  ).run(req.userId, 'deposit', amt, `Deposited ₹${amt.toFixed(2)}`, newBalance);

  res.json({ message: `₹${amt.toFixed(2)} deposited successfully!`, balance: newBalance });
});

// Withdraw
router.post('/withdraw', authenticate, (req, res) => {
  const { amount } = req.body;
  if (!amount || isNaN(amount) || Number(amount) <= 0)
    return res.status(400).json({ error: 'Enter a valid withdrawal amount.' });

  const amt = parseFloat(amount);
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);

  if (amt > user.balance)
    return res.status(400).json({ error: `Insufficient balance. Available: ₹${user.balance.toFixed(2)}` });

  const newBalance = user.balance - amt;
  db.prepare('UPDATE users SET balance = ? WHERE id = ?').run(newBalance, req.userId);
  db.prepare(
    'INSERT INTO transactions (user_id, type, amount, description, balance_after) VALUES (?, ?, ?, ?, ?)'
  ).run(req.userId, 'withdraw', amt, `Withdrew ₹${amt.toFixed(2)}`, newBalance);

  res.json({ message: `₹${amt.toFixed(2)} withdrawn successfully!`, balance: newBalance });
});

// Transfer
router.post('/transfer', authenticate, (req, res) => {
  const { amount, recipientEmail } = req.body;

  if (!amount || isNaN(amount) || Number(amount) <= 0)
    return res.status(400).json({ error: 'Enter a valid transfer amount.' });
  if (!recipientEmail)
    return res.status(400).json({ error: 'Recipient email is required.' });

  const sender = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
  if (sender.email === recipientEmail.toLowerCase().trim())
    return res.status(400).json({ error: 'Cannot transfer to yourself.' });

  const recipient = db.prepare('SELECT * FROM users WHERE email = ?').get(recipientEmail.toLowerCase().trim());
  if (!recipient) return res.status(404).json({ error: 'Recipient not found. Check the email address.' });

  const amt = parseFloat(amount);
  if (amt > sender.balance)
    return res.status(400).json({ error: `Insufficient balance. Available: ₹${sender.balance.toFixed(2)}` });

  const senderNewBal = sender.balance - amt;
  const recipientNewBal = recipient.balance + amt;

  const transfer = db.transaction(() => {
    db.prepare('UPDATE users SET balance = ? WHERE id = ?').run(senderNewBal, sender.id);
    db.prepare('UPDATE users SET balance = ? WHERE id = ?').run(recipientNewBal, recipient.id);

    db.prepare(
      'INSERT INTO transactions (user_id, type, amount, description, balance_after, related_email) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(sender.id, 'transfer_out', amt, `Transfer to ${recipient.email}`, senderNewBal, recipient.email);

    db.prepare(
      'INSERT INTO transactions (user_id, type, amount, description, balance_after, related_email) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(recipient.id, 'transfer_in', amt, `Received from ${sender.email}`, recipientNewBal, sender.email);
  });

  transfer();
  res.json({ message: `₹${amt.toFixed(2)} transferred to ${recipient.name} successfully!`, balance: senderNewBal });
});

// Transaction History
router.get('/transactions', authenticate, (req, res) => {
  const transactions = db.prepare(
    'SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 20'
  ).all(req.userId);
  res.json(transactions);
});

module.exports = router;
