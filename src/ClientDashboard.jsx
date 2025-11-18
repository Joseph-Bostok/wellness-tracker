import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import DailyEntryForm from './DailyEntryForm';

const MOOD_EMOJIS = {
  1: '😢',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😊',
};

export default function ClientDashboard({ user, userName, onLogout }) {
  const [activeTab, setActiveTab] = useState('entry');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState(null);
  const [therapistName, setTherapistName] = useState('');

  useEffect(() => {
    fetchEntries();
    fetchTherapistInfo();
  }, [user.id]);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      // Fetch entries with therapist comments
      const { data: entriesData, error: entriesError } = await supabase
        .from('daily_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('entry_date', { ascending: false });

      if (entriesError) throw entriesError;

      // Fetch comments for all entries
      if (entriesData && entriesData.length > 0) {
        const entryIds = entriesData.map((e) => e.id);
        const { data: commentsData } = await supabase
          .from('therapist_comments')
          .select('*, profiles:therapist_id(full_name)')
          .in('entry_id', entryIds)
          .order('created_at', { ascending: true });

        // Attach comments to entries
        const entriesWithComments = entriesData.map((entry) => ({
          ...entry,
          comments: commentsData?.filter((c) => c.entry_id === entry.id) || [],
        }));

        setEntries(entriesWithComments);
      } else {
        setEntries([]);
      }
    } catch (err) {
      console.error('Error fetching entries:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTherapistInfo = async () => {
    try {
      const { data } = await supabase
        .from('therapist_clients')
        .select('therapist_id, profiles:therapist_id(full_name)')
        .eq('client_id', user.id)
        .single();

      if (data?.profiles) {
        setTherapistName(data.profiles.full_name);
      }
    } catch (err) {
      console.error('Error fetching therapist info:', err);
    }
  };

  const handleEntrySaved = () => {
    fetchEntries();
    setEditingEntry(null);
    if (activeTab === 'history') {
      setActiveTab('entry');
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;

    try {
      const { error } = await supabase
        .from('daily_entries')
        .delete()
        .eq('id', entryId);

      if (error) throw error;
      fetchEntries();
    } catch (err) {
      console.error('Error deleting entry:', err);
      alert('Failed to delete entry');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-indigo-600">Wellness Tracker</h1>
            <p className="text-sm text-gray-600">Welcome, {userName}</p>
            {therapistName && (
              <p className="text-xs text-gray-500">Therapist: {therapistName}</p>
            )}
          </div>
          <button
            onClick={onLogout}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded text-sm font-medium"
          >
            Log Out
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-4xl mx-auto px-4 mt-4">
        <div className="flex gap-2">
          <button
            onClick={() => {
              setActiveTab('entry');
              setEditingEntry(null);
            }}
            className={`px-4 py-2 rounded-t-lg font-medium ${
              activeTab === 'entry'
                ? 'bg-white text-indigo-600 shadow'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            New Entry
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-t-lg font-medium ${
              activeTab === 'history'
                ? 'bg-white text-indigo-600 shadow'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            History ({entries.length})
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 pb-8">
        {activeTab === 'entry' && (
          <DailyEntryForm
            userId={user.id}
            onEntrySaved={handleEntrySaved}
            editEntry={editingEntry}
          />
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading entries...</div>
            ) : entries.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>No entries yet.</p>
                <button
                  onClick={() => setActiveTab('entry')}
                  className="mt-2 text-indigo-600 hover:underline"
                >
                  Create your first entry
                </button>
              </div>
            ) : (
              <div className="divide-y">
                {entries.map((entry) => (
                  <div key={entry.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {formatDate(entry.entry_date)}
                        </h3>
                        <span className="text-2xl" title={`Mood: ${entry.mood}/5`}>
                          {MOOD_EMOJIS[entry.mood]}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingEntry(entry);
                            setActiveTab('entry');
                          }}
                          className="text-indigo-600 hover:text-indigo-800 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Journal Text */}
                    {entry.journal_text && (
                      <p className="text-gray-700 mb-3 whitespace-pre-wrap">
                        {entry.journal_text}
                      </p>
                    )}

                    {/* Wellness Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-3">
                      {entry.sleep_hours && (
                        <div className="bg-blue-50 p-2 rounded">
                          <span className="font-medium">Sleep:</span> {entry.sleep_hours}h
                        </div>
                      )}
                      {entry.time_outside_minutes && (
                        <div className="bg-green-50 p-2 rounded">
                          <span className="font-medium">Outside:</span>{' '}
                          {entry.time_outside_minutes}m
                        </div>
                      )}
                      {entry.water_glasses && (
                        <div className="bg-cyan-50 p-2 rounded">
                          <span className="font-medium">Water:</span> {entry.water_glasses}{' '}
                          glasses
                        </div>
                      )}
                      {entry.exercise_minutes && (
                        <div className="bg-orange-50 p-2 rounded">
                          <span className="font-medium">Exercise:</span>{' '}
                          {entry.exercise_minutes}m {entry.exercise_type}
                        </div>
                      )}
                    </div>

                    {/* Meals */}
                    {entry.meals && entry.meals.length > 0 && (
                      <div className="mb-3">
                        <span className="text-sm font-medium text-gray-600">Meals: </span>
                        <span className="text-sm text-gray-700">
                          {entry.meals.map((m) => `${m.type}: ${m.description}`).join(' | ')}
                        </span>
                      </div>
                    )}

                    {/* Therapist Comments */}
                    {entry.comments && entry.comments.length > 0 && (
                      <div className="mt-3 border-t pt-3">
                        <p className="text-sm font-medium text-gray-600 mb-2">
                          Therapist Comments:
                        </p>
                        {entry.comments.map((comment) => (
                          <div
                            key={comment.id}
                            className="bg-indigo-50 p-3 rounded mb-2"
                          >
                            <p className="text-sm text-gray-700">{comment.comment_text}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {comment.profiles?.full_name} -{' '}
                              {new Date(comment.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
