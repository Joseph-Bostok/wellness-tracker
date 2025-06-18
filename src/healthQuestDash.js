import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import MoodAnalyticsChart from './MoodAnalyticsChart';
import StreakTracker from './StreakTracker';
import SleepTracker from './SleepTracker';
import MealTracker from './MealTracker';
import ExerciseTracker from './ExerciseTracker';

const prompts = [
  "What went well today?",
  "What challenged you today, and how did you respond?",
  "Describe a moment you felt calm.",
  "What’s something you’re looking forward to?",
  "What’s something you’re grateful for?"
];

export default function HealthQuestDashboard({ user }) {
  const [entry, setEntry] = useState('');
  const [entries, setEntries] = useState([]);
  const [mood, setMood] = useState('😊');
  const [prompt, setPrompt] = useState('');
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editedContent, setEditedContent] = useState('');
  const [editedMood, setEditedMood] = useState('😊');
  const [activeTab, setActiveTab] = useState('journal');

  useEffect(() => {
    setPrompt(prompts[Math.floor(Math.random() * prompts.length)]);
    if (user) {
      fetchEntries(user.id);
    }
  }, [user]);

  const fetchEntries = async (userId) => {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error) setEntries(data);
  };

  const saveEntry = async () => {
    if (!entry.trim() || !user) return;

    const { error } = await supabase
      .from('journal_entries')
      .insert([{ content: entry, mood, user_id: user.id }]);

    if (!error) {
      setEntry('');
      setMood('😊');
      fetchEntries(user.id);
    }
  };

  const deleteEntry = async (id) => {
    const confirm = window.confirm('Are you sure you want to delete this entry?');
    if (!confirm) return;

    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchEntries(user.id);
    }
  };

  const startEditing = (entry) => {
    setEditingId(entry.id);
    setEditedContent(entry.content);
    setEditedMood(entry.mood);
    setMenuOpenId(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditedContent('');
    setEditedMood('😊');
  };

  const saveEdit = async () => {
    const { error } = await supabase
      .from('journal_entries')
      .update({ content: editedContent, mood: editedMood })
      .eq('id', editingId);

    if (!error) {
      cancelEditing();
      fetchEntries(user.id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-indigo-600 text-white px-6 py-4 shadow-md sticky top-0 z-50">
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-semibold">Wellness Tracker</h1>
          <div className="flex space-x-2">
            {[
              { key: 'journal', label: '📝 Journal' },
              { key: 'analytics', label: '📊 Analytics' },
              { key: 'sleep', label: '😴 Sleep' },
              { key: 'meals', label: '🍽️ Meals' },
              { key: 'exercise', label: '🏋️ Exercise' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1 rounded-full transition ${
                  activeTab === tab.key ? 'bg-white text-indigo-600 font-semibold' : 'hover:bg-indigo-500'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="flex flex-col items-center p-6 space-y-10">
        {activeTab === 'journal' && (
          <div className="w-full max-w-7xl bg-white p-6 rounded shadow space-y-6">
            <h2 className="text-2xl font-bold">📝 Journal</h2>
            <div>
              <p className="text-sm text-gray-600 mb-1">Prompt:</p>
              <div className="italic text-gray-700">“{prompt}”</div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Mood:</p>
              <div className="flex space-x-2">
                {['😢', '😕', '😐', '🙂', '😊'].map((m) => (
                  <span
                    key={m}
                    title={`Feeling: ${m}`}
                    role="img"
                    aria-label={`Mood ${m}`}
                    onClick={() => setMood(m)}
                    className={`text-2xl p-2 rounded-full border cursor-pointer ${mood === m ? 'border-indigo-500 bg-indigo-100' : 'border-gray-300'}`}
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
            <textarea
              className="w-full p-4 border rounded"
              rows="6"
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              placeholder="Write your thoughts here..."
            ></textarea>
            <button
              onClick={saveEntry}
              className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition"
            >
              Save Entry
            </button>
            <div className="mt-10">
              <h3 className="text-xl font-bold text-gray-800 mb-4">📚 Journal History</h3>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {entries.map((e) => (
                  <div key={e.id} className="bg-gray-50 p-4 rounded shadow-sm relative">
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() => setMenuOpenId(menuOpenId === e.id ? null : e.id)}
                        className="text-gray-600 hover:text-gray-800 text-xl"
                        title="Options"
                      >
                        ⋮
                      </button>
                      {menuOpenId === e.id && (
                        <div className="absolute right-0 mt-2 w-28 bg-white border rounded shadow z-10">
                          <button
                            onClick={() => deleteEntry(e.id)}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-red-100 text-red-600"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => startEditing(e)}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </div>
                    {editingId === e.id ? (
                      <div className="bg-indigo-50 p-3 rounded">
                        <div className="mb-2">
                          <textarea
                            value={editedContent}
                            onChange={(ev) => setEditedContent(ev.target.value)}
                            className="w-full p-2 border rounded"
                            rows={4}
                          />
                        </div>
                        <div className="flex space-x-2 mb-2">
                          {['😢', '😕', '😐', '🙂', '😊'].map((m) => (
                            <span
                              key={m}
                              role="img"
                              aria-label={`Mood ${m}`}
                              onClick={() => setEditedMood(m)}
                              className={`text-2xl p-2 rounded-full border cursor-pointer ${editedMood === m ? 'border-indigo-500 bg-indigo-100' : 'border-gray-300'}`}
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-3">
                          <button onClick={saveEdit} className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700">Save</button>
                          <button onClick={cancelEditing} className="bg-gray-300 px-4 py-1 rounded hover:bg-gray-400">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm text-gray-500">
                            {new Date(e.created_at).toLocaleString()}
                          </p>
                          <span role="img" aria-label={`Mood ${e.mood || 'Note'}`} className="text-lg">
                            {e.mood || '📝'}
                          </span>
                        </div>
                        <p className="text-gray-800 whitespace-pre-wrap">{e.content}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="w-full max-w-7xl space-y-6">
            <div className="bg-white p-6 rounded shadow">
              <StreakTracker user={user} />
            </div>
            <MoodAnalyticsChart user={user} />
          </div>
        )}

        {activeTab === 'sleep' && (
          <div className="w-full max-w-5xl">
            <SleepTracker user={user} />
          </div>
        )}

        {activeTab === 'meals' && (
          <div className="w-full max-w-5xl">
            <MealTracker user={user} />
          </div>
        )}

        {activeTab === 'exercise' && (
          <div className="w-full max-w-5xl">
            <ExerciseTracker user={user} />
          </div>
        )}
      </div>

      <div className="fixed bottom-6 right-6 z-50">
        <button className="bg-indigo-600 p-4 rounded-full text-white shadow-lg hover:bg-indigo-700 text-xl">
          ＋
        </button>
      </div>
    </div>
  );
}
