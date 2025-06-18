import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import dayjs from 'dayjs';

export default function ExerciseTracker({ user }) {
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [exerciseType, setExerciseType] = useState('Cardio');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (user) fetchLogs();
  }, [user]);

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from('exercise_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (!error) setLogs(data);
  };

  const handleSubmit = async () => {
    if (!user || !duration.trim()) {
      setMessage('Please enter duration.');
      return;
    }

    const { error } = await supabase.from('exercise_logs').insert([
      {
        user_id: user.id,
        date,
        exercise_type: exerciseType,
        duration: Number(duration),
        notes,
      },
    ]);

    if (error) {
      setMessage('Error saving exercise.');
    } else {
      setMessage('Exercise logged!');
      setDuration('');
      setExerciseType('Cardio');
      setNotes('');
      fetchLogs();
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow space-y-6">
      <h2 className="text-lg font-bold text-gray-800">🏋️ Exercise Tracker</h2>

      <div className="space-y-2">
        <label className="block text-sm">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border p-2 rounded w-full"
        />

        <label className="block text-sm">Exercise Type</label>
        <select
          value={exerciseType}
          onChange={(e) => setExerciseType(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option>Cardio</option>
          <option>Strength</option>
          <option>Yoga</option>
          <option>Stretching</option>
          <option>Other</option>
        </select>

        <label className="block text-sm">Duration (minutes)</label>
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="border p-2 rounded w-full"
          placeholder="e.g. 30"
        />

        <label className="block text-sm">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="border p-2 rounded w-full"
          rows="3"
          placeholder="Details about your workout..."
        ></textarea>

        <button
          onClick={handleSubmit}
          className="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700"
        >
          Log Exercise
        </button>
        {message && <p className="text-sm text-gray-600 italic">{message}</p>}
      </div>

      {logs.length > 0 && (
        <div className="mt-8">
          <h3 className="text-md font-bold text-gray-800 mb-3">📅 Recent Activity</h3>
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="p-3 bg-gray-50 rounded shadow-sm">
                <p className="text-sm text-gray-500">{new Date(log.date).toLocaleDateString()}</p>
                <p className="text-gray-800 font-medium">{log.exercise_type} - {log.duration} min</p>
                {log.notes && <p className="text-sm text-gray-600 italic">{log.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
