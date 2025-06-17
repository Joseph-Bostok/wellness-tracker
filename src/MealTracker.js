import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import dayjs from 'dayjs';

export default function MealTracker({ user }) {
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [mealType, setMealType] = useState('Breakfast');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!user || !description.trim()) {
      setMessage('Please fill out the meal description.');
      return;
    }

    const { error } = await supabase.from('meal_logs').insert([
      {
        user_id: user.id,
        date,
        meal_type: mealType,
        description,
      },
    ]);

    if (error) {
      setMessage('Error saving meal.');
    } else {
      setMessage('Meal logged!');
      setDescription('');
      setMealType('Breakfast');
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow space-y-4">
      <h2 className="text-lg font-bold text-gray-800">🍽️ Meal Tracker</h2>

      <div className="space-y-2">
        <label className="block text-sm">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border p-2 rounded w-full"
        />

        <label className="block text-sm">Meal Type</label>
        <select
          value={mealType}
          onChange={(e) => setMealType(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option>Breakfast</option>
          <option>Lunch</option>
          <option>Dinner</option>
          <option>Snack</option>
        </select>

        <label className="block text-sm">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 rounded w-full"
          rows="3"
          placeholder="What did you eat?"
        ></textarea>

        <button
          onClick={handleSubmit}
          className="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700"
        >
          Log Meal
        </button>
        {message && <p className="text-sm text-gray-600 italic">{message}</p>}
      </div>
    </div>
  );
}
