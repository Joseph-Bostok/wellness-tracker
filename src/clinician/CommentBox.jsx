import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function CommentBox({ postId, clinicianId, onCommentAdded }) {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const { error } = await supabase
      .from('post_comments')
      .insert([
        {
          post_id: postId,
          clinician_id: clinicianId,
          message,
        },
      ]);

    if (error) {
      console.error('Error saving comment:', error.message);
      setStatus('Error saving comment');
    } else {
      setMessage('');
      setStatus('Comment posted');
      if (onCommentAdded) onCommentAdded();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-2">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Leave a comment..."
        className="w-full p-2 border rounded text-sm"
        rows={3}
      />
      <button
        type="submit"
        className="bg-indigo-600 text-white px-4 py-1 rounded text-sm hover:bg-indigo-700"
      >
        Post Comment
      </button>
      {status && <p className="text-xs text-gray-500 italic">{status}</p>}
    </form>
  );
}
