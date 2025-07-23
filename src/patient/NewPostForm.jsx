import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function NewPostForm({ user, onPostCreated }) {
  const [form, setForm] = useState({
    mood: '',
    sleep_hours: '',
    meal_summary: '',
    sunlight_minutes: '',
    water_oz: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.from('daily_posts').insert([
      {
        user_id: user.id,
        mood: form.mood,
        sleep_hours: Number(form.sleep_hours),
        meal_summary: form.meal_summary,
        sunlight_minutes: Number(form.sunlight_minutes),
        water_oz: Number(form.water_oz),
        notes: form.notes,
      }
    ]);

    if (error) {
      setError(error.message);
    } else {
      setForm({
        mood: '',
        sleep_hours: '',
        meal_summary: '',
        sunlight_minutes: '',
        water_oz: '',
        notes: '',
      });
      if (onPostCreated) onPostCreated();
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold">Daily Wellness Check-In</h2>
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <input name="mood" value={form.mood} onChange={handleChange} placeholder="Mood" className="w-full p-2 border rounded" />
      <input name="sleep_hours" value={form.sleep_hours} onChange={handleChange} placeholder="Sleep Hours" type="number" className="w-full p-2 border rounded" />
      <input name="meal_summary" value={form.meal_summary} onChange={handleChange} placeholder="What did you eat today?" className="w-full p-2 border rounded" />
      <input name="sunlight_minutes" value={form.sunlight_minutes} onChange={handleChange} placeholder="Sunlight (minutes)" type="number" className="w-full p-2 border rounded" />
      <input name="water_oz" value={form.water_oz} onChange={handleChange} placeholder="Water (oz)" type="number" className="w-full p-2 border rounded" />
      <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Any notes..." className="w-full p-2 border rounded" rows="3" />

      <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
        {loading ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
