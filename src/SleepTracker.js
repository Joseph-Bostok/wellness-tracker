import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import dayjs from 'dayjs';

export default function SleepTracker({ user }) {
  const [hours, setHours] = useState('');
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [quality, setQuality] = useState('😐');
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedDate, setEditedDate] = useState('');
  const [editedHours, setEditedHours] = useState('');
  const [editedQuality, setEditedQuality] = useState('😐');

  useEffect(() => {
    if (user) fetchSleepHistory(user.id);
  }, [user]);

  const fetchSleepHistory = async (userId) => {
    const { data, error } = await supabase
      .from('sleep_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (!error) setHistory(data);
  };

  const handleSubmit = async () => {
    if (!user || !hours || isNaN(hours)) {
      setMessage('Please enter valid data.');
      return;
    }

    const { error } = await supabase.from('sleep_logs').insert([
      {
        user_id: user.id,
        date,
        hours: Number(hours),
        quality,
      },
    ]);

    if (error) {
      setMessage('Error saving data.');
    } else {
      setMessage('Sleep logged!');
      setHours('');
      setQuality('😐');
      fetchSleepHistory(user.id);
    }
  };

  const startEditing = (log) => {
    setEditingId(log.id);
    setEditedDate(log.date);
    setEditedHours(log.hours);
    setEditedQuality(log.quality);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditedDate('');
    setEditedHours('');
    setEditedQuality('😐');
  };

  const saveEdit = async () => {
    const { error } = await supabase
      .from('sleep_logs')
      .update({ date: editedDate, hours: Number(editedHours), quality: editedQuality })
      .eq('id', editingId);

    if (!error) {
      cancelEdit();
      fetchSleepHistory(user.id);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow space-y-4">
      <h2 className="text-lg font-bold text-gray-800">😴 Sleep Tracker</h2>

      <div className="flex flex-col space-y-2">
        <label>Date</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border p-2 rounded" />

        <label>Hours Slept</label>
        <input
          type="number"
          min="0"
          step="0.5"
          value={hours}
          onChange={e => setHours(e.target.value)}
          className="border p-2 rounded"
        />

        <label>Quality</label>
        <div className="flex space-x-2">
          {['😫', '😐', '😊'].map((q) => (
            <span
              key={q}
              role="img"
              aria-label={`Sleep quality ${q}`}
              onClick={() => setQuality(q)}
              className={`text-2xl p-2 rounded-full border cursor-pointer ${quality === q ? 'border-indigo-500 bg-indigo-100' : 'border-gray-300'}`}
            >
              {q}
            </span>
          ))}
        </div>

        <button onClick={handleSubmit} className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700">
          Log Sleep
        </button>
        {message && <p className="text-sm text-gray-600 italic">{message}</p>}
      </div>

      {history.length > 0 && (
        <div className="mt-6">
          <h3 className="text-md font-semibold text-gray-700 mb-2">Recent Sleep Logs</h3>
          <ul className="space-y-2">
            {history.map((log) => (
              <li key={log.id} className="border rounded p-3 text-sm">
                {editingId === log.id ? (
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={editedDate}
                      onChange={e => setEditedDate(e.target.value)}
                      className="border p-2 rounded w-full"
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={editedHours}
                      onChange={e => setEditedHours(e.target.value)}
                      className="border p-2 rounded w-full"
                    />
                    <div className="flex space-x-2">
                      {['😫', '😐', '😊'].map((q) => (
                        <span
                          key={q}
                          role="img"
                          aria-label={`Sleep quality ${q}`}
                          onClick={() => setEditedQuality(q)}
                          className={`text-2xl p-2 rounded-full border cursor-pointer ${editedQuality === q ? 'border-indigo-500 bg-indigo-100' : 'border-gray-300'}`}
                        >
                          {q}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={saveEdit} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Save</button>
                      <button onClick={cancelEdit} className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <span>{dayjs(log.date).format('MMM D, YYYY')} — {log.hours} hrs {log.quality}</span>
                    <button onClick={() => startEditing(log)} className="text-sm text-blue-600 hover:underline">Edit</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
