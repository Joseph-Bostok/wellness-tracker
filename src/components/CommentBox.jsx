import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function CommentBox({ postId, clinicianId, onCommentAdded }) {
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async () => {
    if (!comment.trim()) return;

    const { error } = await supabase.from('post_comments').insert([
      {
        post_id: postId,
        clinician_id: clinicianId,
        message: comment,
      },
    ]);

    if (error) {
      console.error('Error saving comment:', error.message);
      setStatus('Failed to save comment.');
    } else {
      setComment('');
      setStatus('Comment added.');
      if (onCommentAdded) onCommentAdded();
    }
  };

  return (
    <div className="mt-4 space-y-2">
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Leave a comment for this check-in..."
        className="w-full border p-2 rounded text-sm"
        rows={3}
      ></textarea>
      <button
        onClick={handleSubmit}
        className="bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700 text-sm"
      >
        Post Comment
      </button>
      {status && <p className="text-xs text-gray-500 italic">{status}</p>}
    </div>
  );
}
