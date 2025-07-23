import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import CommentBox from './CommentBox';

export default function ClinicianDashboard({ user }) {
  const [posts, setPosts] = useState([]);
  const [commentsByPostId, setCommentsByPostId] = useState({});

  const fetchAllPosts = async () => {
    const { data, error } = await supabase
      .from('daily_posts')
      .select('*, users(email)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error.message);
    } else {
      setPosts(data);
    }
  };

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('post_comments')
      .select('*, users(email)')
      .order('created_at', { ascending: true });

    if (!error) {
      const grouped = {};
      data.forEach(comment => {
        if (!grouped[comment.post_id]) grouped[comment.post_id] = [];
        grouped[comment.post_id].push(comment);
      });
      setCommentsByPostId(grouped);
    } else {
      console.error('Error fetching comments:', error.message);
    }
  };

  const refresh = () => {
    fetchAllPosts();
    fetchComments();
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-4">Clinician Dashboard</h2>
      {posts.length === 0 ? (
        <p className="text-gray-500">No patient entries available.</p>
      ) : (
        posts.map(post => (
          <div key={post.id} className="bg-white shadow p-4 rounded space-y-2">
            <div className="text-sm text-gray-600">
              <strong>Patient:</strong> {post.users?.email || 'Unknown'}
              <span className="ml-4">
                <strong>Date:</strong> {new Date(post.created_at).toLocaleString()}
              </span>
            </div>
            <p><strong>Mood:</strong> {post.mood}</p>
            <p><strong>Sleep:</strong> {post.sleep_hours} hrs</p>
            <p><strong>Meals:</strong> {post.meal_summary}</p>
            <p><strong>Sunlight:</strong> {post.sunlight_minutes} min</p>
            <p><strong>Water:</strong> {post.water_oz} oz</p>
            {post.notes && <p><strong>Notes:</strong> {post.notes}</p>}

            {/* Existing Comments */}
            <div className="mt-4 text-sm text-gray-800 space-y-2">
              {commentsByPostId[post.id]?.length > 0 && (
                <>
                  <h4 className="font-semibold">Comments:</h4>
                  {commentsByPostId[post.id].map(comment => (
                    <div key={comment.id} className="border-l-4 border-indigo-400 pl-3">
                      <p>{comment.message}</p>
                      <p className="text-xs text-gray-500">
                        — {comment.users?.email || 'Clinician'}, {new Date(comment.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Comment Form */}
            <CommentBox
              postId={post.id}
              clinicianId={user.id}
              onCommentAdded={refresh}
            />
          </div>
        ))
      )}
    </div>
  );
}
