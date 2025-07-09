import React, { useState } from 'react';
import dayjs from 'dayjs';
import { supabase } from '../supabaseClient';

export default function NewPostForm({ user, onPostCreated }) {
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [mood, setMood] = useState('😐');
  const [sleepHours, setSleepHours] = useState('');
  const [mealSummary, setMealSummary] = useState('');
  const [sunlightMinutes, setSunlightMinutes] = useState('');
  const [waterOz, setWaterOz] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!user || !sleepHours || !mealSummary) {
      setMessage('Please complete all required fields.');
      return;
    }

    const { error } = await supabase.from('daily_posts').insert([
      {
        user_id: user.id,
        date,
        mood,
        sleep_hours: Number(sleepHours),
        meal_summary: mealSummary,
        sunlight_minutes: Number(sunlightMinutes) || 0,
        water_oz: Number(waterOz) || 0,
        notes,
      },
    ]);

    if (error) {
      console.error(error);
      setMessage('Error saving post.');
    } else {
      setMessage('✅ Check-in submitted!');
      setSleepHours('');
      setMealSummary('');
      setSunlightMinutes('');
      setWaterOz('');
      setNotes('');
      setMood('😐');
      if (onPostCreated) onPostCreated();
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg space-y-6 border border-gray-100">
      <h2 className="text-xl font-semibold text-indigo-700">📝 Daily Check-In</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Mood</label>
          <div className="flex mt-1 space-x-2">
            {['😢', '😐', '😊'].map((emoji) => (
              <button
                key={emoji}
                className={`text-2xl p-2 rounded-full border transition ${mood === emoji ? 'border-indigo-500 bg-indigo-100' : 'border-gray-300 hover:bg-gray-100'}`}
                onClick={() => setMood(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Hours Slept</label>
          <input type="number" value={sleepHours} onChange={(e) => setSleepHours(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Meal Summary</label>
          <input type="text" value={mealSummary} onChange={(e) => setMealSummary(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Sunlight (minutes)</label>
          <input type="number" value={sunlightMinutes} onChange={(e) => setSunlightMinutes(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Water (oz)</label>
          <input type="number" value={waterOz} onChange={(e) => setWaterOz(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" rows={3}></textarea>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <button onClick={handleSubmit} className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
          Submit Check-In
        </button>
        {message && <p className="text-sm text-gray-500 italic mt-4">{message}</p>}
      </div>
    </div>
  );
}
