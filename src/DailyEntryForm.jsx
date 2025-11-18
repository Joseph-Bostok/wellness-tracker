import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const MOOD_OPTIONS = [
  { value: 1, emoji: '😢', label: 'Very Bad' },
  { value: 2, emoji: '😕', label: 'Bad' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '😊', label: 'Great' },
];

const SLEEP_QUALITY_OPTIONS = [
  { value: 1, emoji: '😫', label: 'Poor' },
  { value: 2, emoji: '😕', label: 'Fair' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '😴', label: 'Excellent' },
];

const EXERCISE_TYPES = ['Cardio', 'Strength', 'Yoga', 'Stretching', 'Walking', 'Other'];
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

export default function DailyEntryForm({ userId, onEntrySaved, editEntry = null }) {
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [journalText, setJournalText] = useState('');
  const [mood, setMood] = useState(3);
  const [sleepHours, setSleepHours] = useState('');
  const [sleepQuality, setSleepQuality] = useState(3);
  const [timeOutside, setTimeOutside] = useState('');
  const [waterGlasses, setWaterGlasses] = useState('');
  const [exerciseType, setExerciseType] = useState('');
  const [exerciseMinutes, setExerciseMinutes] = useState('');
  const [exerciseNotes, setExerciseNotes] = useState('');
  const [meals, setMeals] = useState([]);
  const [newMealType, setNewMealType] = useState('Breakfast');
  const [newMealDescription, setNewMealDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load edit data if provided
  useEffect(() => {
    if (editEntry) {
      setEntryDate(editEntry.entry_date);
      setJournalText(editEntry.journal_text || '');
      setMood(editEntry.mood || 3);
      setSleepHours(editEntry.sleep_hours?.toString() || '');
      setSleepQuality(editEntry.sleep_quality || 3);
      setTimeOutside(editEntry.time_outside_minutes?.toString() || '');
      setWaterGlasses(editEntry.water_glasses?.toString() || '');
      setExerciseType(editEntry.exercise_type || '');
      setExerciseMinutes(editEntry.exercise_minutes?.toString() || '');
      setExerciseNotes(editEntry.exercise_notes || '');
      setMeals(editEntry.meals || []);
    }
  }, [editEntry]);

  const addMeal = () => {
    if (!newMealDescription.trim()) return;

    setMeals([
      ...meals,
      {
        type: newMealType,
        description: newMealDescription,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setNewMealDescription('');
  };

  const removeMeal = (index) => {
    setMeals(meals.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const entryData = {
      user_id: userId,
      entry_date: entryDate,
      journal_text: journalText || null,
      mood,
      sleep_hours: sleepHours ? parseFloat(sleepHours) : null,
      sleep_quality: sleepHours ? sleepQuality : null,
      time_outside_minutes: timeOutside ? parseInt(timeOutside) : null,
      water_glasses: waterGlasses ? parseInt(waterGlasses) : null,
      exercise_type: exerciseType || null,
      exercise_minutes: exerciseMinutes ? parseInt(exerciseMinutes) : null,
      exercise_notes: exerciseNotes || null,
      meals,
    };

    try {
      if (editEntry) {
        // Update existing entry
        const { error } = await supabase
          .from('daily_entries')
          .update(entryData)
          .eq('id', editEntry.id);

        if (error) throw error;
        setSuccess('Entry updated successfully!');
      } else {
        // Check if entry exists for this date
        const { data: existing } = await supabase
          .from('daily_entries')
          .select('id')
          .eq('user_id', userId)
          .eq('entry_date', entryDate)
          .single();

        if (existing) {
          // Update existing entry for this date
          const { error } = await supabase
            .from('daily_entries')
            .update(entryData)
            .eq('id', existing.id);

          if (error) throw error;
          setSuccess('Entry updated successfully!');
        } else {
          // Insert new entry
          const { error } = await supabase
            .from('daily_entries')
            .insert(entryData);

          if (error) throw error;
          setSuccess('Entry saved successfully!');
        }
      }

      // Reset form if not editing
      if (!editEntry) {
        resetForm();
      }

      if (onEntrySaved) {
        onEntrySaved();
      }
    } catch (err) {
      setError(err.message || 'Failed to save entry');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setJournalText('');
    setMood(3);
    setSleepHours('');
    setSleepQuality(3);
    setTimeOutside('');
    setWaterGlasses('');
    setExerciseType('');
    setExerciseMinutes('');
    setExerciseNotes('');
    setMeals([]);
    setNewMealDescription('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">
          {editEntry ? 'Edit Entry' : 'Daily Wellness Entry'}
        </h3>
        <input
          type="date"
          value={entryDate}
          onChange={(e) => setEntryDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          className="border rounded px-3 py-1 text-sm"
          disabled={!!editEntry}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 text-sm p-3 rounded">
          {success}
        </div>
      )}

      {/* Journal Entry */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          How was your day?
        </label>
        <textarea
          value={journalText}
          onChange={(e) => setJournalText(e.target.value)}
          rows={4}
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Write about your thoughts, feelings, and experiences today..."
        />
      </div>

      {/* Mood */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Overall Mood
        </label>
        <div className="flex gap-2">
          {MOOD_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setMood(option.value)}
              className={`flex-1 py-2 rounded-lg text-2xl transition-all ${
                mood === option.value
                  ? 'bg-indigo-100 ring-2 ring-indigo-500'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              title={option.label}
            >
              {option.emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Sleep */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sleep (hours)
          </label>
          <input
            type="number"
            value={sleepHours}
            onChange={(e) => setSleepHours(e.target.value)}
            min="0"
            max="24"
            step="0.5"
            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
            placeholder="Hours slept"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sleep Quality
          </label>
          <div className="flex gap-1">
            {SLEEP_QUALITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSleepQuality(option.value)}
                className={`flex-1 py-1 rounded text-lg ${
                  sleepQuality === option.value
                    ? 'bg-indigo-100 ring-2 ring-indigo-500'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
                title={option.label}
              >
                {option.emoji}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Time Outside & Water */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Outside (minutes)
          </label>
          <input
            type="number"
            value={timeOutside}
            onChange={(e) => setTimeOutside(e.target.value)}
            min="0"
            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
            placeholder="Minutes outdoors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Water Intake (glasses)
          </label>
          <input
            type="number"
            value={waterGlasses}
            onChange={(e) => setWaterGlasses(e.target.value)}
            min="0"
            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
            placeholder="Glasses of water"
          />
        </div>
      </div>

      {/* Exercise */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Exercise
        </label>
        <div className="grid grid-cols-2 gap-4 mb-2">
          <select
            value={exerciseType}
            onChange={(e) => setExerciseType(e.target.value)}
            className="border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select type...</option>
            {EXERCISE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={exerciseMinutes}
            onChange={(e) => setExerciseMinutes(e.target.value)}
            min="0"
            className="border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
            placeholder="Minutes"
          />
        </div>
        <input
          type="text"
          value={exerciseNotes}
          onChange={(e) => setExerciseNotes(e.target.value)}
          className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
          placeholder="Exercise notes (optional)"
        />
      </div>

      {/* Meals */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Meals
        </label>

        {/* Meal list */}
        {meals.length > 0 && (
          <div className="mb-3 space-y-2">
            {meals.map((meal, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 p-2 rounded"
              >
                <div>
                  <span className="font-medium text-sm">{meal.type}</span>
                  <span className="text-gray-600 text-sm ml-2">{meal.description}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeMeal(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add meal */}
        <div className="flex gap-2">
          <select
            value={newMealType}
            onChange={(e) => setNewMealType(e.target.value)}
            className="border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
          >
            {MEAL_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={newMealDescription}
            onChange={(e) => setNewMealDescription(e.target.value)}
            className="flex-1 border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
            placeholder="What did you eat?"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addMeal();
              }
            }}
          />
          <button
            type="button"
            onClick={addMeal}
            className="bg-gray-200 hover:bg-gray-300 px-4 rounded-lg"
          >
            Add
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 rounded-lg font-medium ${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
        }`}
      >
        {loading ? 'Saving...' : editEntry ? 'Update Entry' : 'Save Entry'}
      </button>
    </form>
  );
}
