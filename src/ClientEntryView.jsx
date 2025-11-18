import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';

const MOOD_EMOJIS = {
  1: '😢',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😊',
};

const SLEEP_QUALITY_EMOJIS = {
  1: '😫',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😴',
};

export default function ClientEntryView({ client, therapistId, onBack, onLogout, therapistName }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState({});
  const [submittingComment, setSubmittingComment] = useState({});

  const fetchClientEntries = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch entries
      const { data: entriesData, error: entriesError } = await supabase
        .from('daily_entries')
        .select('*')
        .eq('user_id', client.id)
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
  }, [client.id]);

  useEffect(() => {
    fetchClientEntries();
  }, [fetchClientEntries]);

  const handleAddComment = async (entryId) => {
    const text = commentText[entryId]?.trim();
    if (!text) return;

    setSubmittingComment((prev) => ({ ...prev, [entryId]: true }));

    try {
      const { error } = await supabase.from('therapist_comments').insert({
        entry_id: entryId,
        therapist_id: therapistId,
        comment_text: text,
      });

      if (error) throw error;

      setCommentText((prev) => ({ ...prev, [entryId]: '' }));
      fetchClientEntries();
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Failed to add comment');
    } finally {
      setSubmittingComment((prev) => ({ ...prev, [entryId]: false }));
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      const { error } = await supabase
        .from('therapist_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      fetchClientEntries();
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert('Failed to delete comment');
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
            <button
              onClick={onBack}
              className="text-indigo-600 hover:text-indigo-800 text-sm mb-1"
            >
              ← Back to Clients
            </button>
            <h1 className="text-xl font-bold text-gray-800">{client.name}</h1>
            <p className="text-sm text-gray-500">{client.email}</p>
          </div>
          <button
            onClick={onLogout}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded text-sm font-medium"
          >
            Log Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">
              Journal Entries ({entries.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading entries...</div>
          ) : entries.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              This client hasn't made any entries yet.
            </div>
          ) : (
            <div className="divide-y">
              {entries.map((entry) => (
                <div key={entry.id} className="p-4">
                  {/* Entry Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {formatDate(entry.entry_date)}
                      </h3>
                      <span className="text-2xl" title={`Mood: ${entry.mood}/5`}>
                        {MOOD_EMOJIS[entry.mood]}
                      </span>
                    </div>
                  </div>

                  {/* Journal Text */}
                  {entry.journal_text && (
                    <div className="bg-gray-50 p-3 rounded mb-3">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {entry.journal_text}
                      </p>
                    </div>
                  )}

                  {/* Wellness Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-3">
                    {entry.sleep_hours && (
                      <div className="bg-blue-50 p-2 rounded">
                        <div className="font-medium">Sleep</div>
                        <div>
                          {entry.sleep_hours}h {SLEEP_QUALITY_EMOJIS[entry.sleep_quality]}
                        </div>
                      </div>
                    )}
                    {entry.time_outside_minutes != null && (
                      <div className="bg-green-50 p-2 rounded">
                        <div className="font-medium">Outside</div>
                        <div>{entry.time_outside_minutes} min</div>
                      </div>
                    )}
                    {entry.water_glasses != null && (
                      <div className="bg-cyan-50 p-2 rounded">
                        <div className="font-medium">Water</div>
                        <div>{entry.water_glasses} glasses</div>
                      </div>
                    )}
                    {entry.exercise_minutes && (
                      <div className="bg-orange-50 p-2 rounded">
                        <div className="font-medium">Exercise</div>
                        <div>
                          {entry.exercise_minutes}m {entry.exercise_type}
                        </div>
                        {entry.exercise_notes && (
                          <div className="text-xs text-gray-500">{entry.exercise_notes}</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Meals */}
                  {entry.meals && entry.meals.length > 0 && (
                    <div className="mb-3 bg-yellow-50 p-2 rounded">
                      <div className="font-medium text-sm mb-1">Meals</div>
                      <div className="text-sm text-gray-700">
                        {entry.meals.map((m, i) => (
                          <div key={i}>
                            <span className="font-medium">{m.type}:</span> {m.description}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Existing Comments */}
                  {entry.comments && entry.comments.length > 0 && (
                    <div className="mb-3">
                      <div className="text-sm font-medium text-gray-600 mb-2">
                        Your Comments:
                      </div>
                      {entry.comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="bg-indigo-50 p-3 rounded mb-2 flex justify-between items-start"
                        >
                          <div>
                            <p className="text-sm text-gray-700">{comment.comment_text}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(comment.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          {comment.therapist_id === therapistId && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-red-500 hover:text-red-700 text-xs"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Comment */}
                  <div className="border-t pt-3">
                    <div className="flex gap-2">
                      <textarea
                        value={commentText[entry.id] || ''}
                        onChange={(e) =>
                          setCommentText((prev) => ({
                            ...prev,
                            [entry.id]: e.target.value,
                          }))
                        }
                        placeholder="Add a comment or feedback..."
                        rows={2}
                        className="flex-1 border rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        onClick={() => handleAddComment(entry.id)}
                        disabled={
                          submittingComment[entry.id] || !commentText[entry.id]?.trim()
                        }
                        className={`px-4 rounded-lg text-sm font-medium ${
                          submittingComment[entry.id] || !commentText[entry.id]?.trim()
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                      >
                        {submittingComment[entry.id] ? '...' : 'Send'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
