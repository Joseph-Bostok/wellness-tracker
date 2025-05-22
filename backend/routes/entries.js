const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Entry = require('../models/Entry');

// Get all entries for the current user
router.get('/', auth, async (req, res) => {
  try {
    const entries = await Entry.find({ userId: req.user }).sort({ date: -1 });
    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Add a new entry
router.post('/', auth, async (req, res) => {
  const { date, mood, sleep_hours, exercise_minutes, journal_entry } = req.body;

  try {
    const newEntry = new Entry({
      userId: req.user,
      date,
      mood,
      sleep_hours,
      exercise_minutes,
      journal_entry
    });

    await newEntry.save();
    res.json(newEntry);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
