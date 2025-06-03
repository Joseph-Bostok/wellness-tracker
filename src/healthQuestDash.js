import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const prompts = [
  "What went well today?",
  "What challenged you today, and how did you respond?",
  "Describe a moment you felt calm.",
  "What’s something you’re looking forward to?",
  "What’s something you’re grateful for?"
];

export default function HealthQuestDashboard() {
  const [entry, setEntry] = useState('');
  const [entries, setEntries] = useState([]);
  const [mood, setMood] = useState('😊');
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    setPrompt(prompts[Math.floor(Math.random() * prompts.length)]);
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (!error) setEntries(data);
};

  const saveEntry = async () => {
  if (!entry.trim()) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('journal_entries')
    .insert([{ content: entry, mood, user_id: user.id }]);

  console.log('Save Result:', { error, data });

  if (!error) {
    setEntry('');
    setMood('😊');
    fetchEntries();
  }
};


  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-start p-6">
      <div className="w-full max-w-2xl bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">📝 Journal</h1>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-1">Prompt:</p>
          <div className="italic text-gray-700">“{prompt}”</div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-1">Mood:</p>
          <div className="flex space-x-2">
            {['😢', '😕', '😐', '🙂', '😊'].map((m) => (
              <button
                key={m}
                onClick={() => setMood(m)}
                className={`text-2xl p-2 rounded-full border ${mood === m ? 'border-indigo-500 bg-indigo-100' : 'border-gray-300'}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <textarea
          className="w-full p-4 border rounded mb-4"
          rows="6"
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          placeholder="Write your thoughts here..."
        ></textarea>

        <button
          onClick={saveEntry}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Save Entry
        </button>
      </div>

      {entries.length > 0 && (
        <div className="w-full max-w-2xl mt-10">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📚 Journal History</h2>
          <div className="space-y-4">
            {entries.map((e) => (
              <div key={e.id} className="bg-white p-4 rounded shadow">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm text-gray-500">
                    {new Date(e.created_at).toLocaleString()}
                  </p>
                  <span className="text-lg">{e.mood || '📝'}</span>
                </div>
                <p className="text-gray-800 whitespace-pre-wrap">{e.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
