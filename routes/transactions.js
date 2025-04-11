const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate' });
  }
};

// Get all transactions for a user
router.get('/', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.userId })
      .sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add new transaction
router.post('/', auth, async (req, res) => {
  try {
    const { type, amount, category, description } = req.body;
    
    const transaction = new Transaction({
      user: req.userId,
      type,
      amount,
      category,
      description
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update transaction
router.put('/:id', auth, async (req, res) => {
  try {
    const { type, amount, category, description } = req.body;
    
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { type, amount, category, description },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete transaction
router.delete('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 