const mongoose = require('mongoose');

const EntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, required: true },
  mood: String,
  sleep_hours: Number,
  exercise_minutes: Number,
  journal_entry: String
});

module.exports = mongoose.model('Entry', EntrySchema);
