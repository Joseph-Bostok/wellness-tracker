import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import NewPostForm from './NewPostForm';

export default function PatientDashboard({ user }) {
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('daily_posts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error) {
      setPosts(data);
    } else {
      console.error('Error fetching posts:', error.message);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user]);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <NewPostForm user={user} onPostCreated={fetchPosts} />

      <div>
        <h3 className="text-lg font-semibold mb-2">Previous Check-Ins</h3>
        {posts.length === 0 ? (
          <p className="text-gray-500">No posts yet.</p>
        ) : (
          posts.map(post => (
            <div key={post.id} className="bg-white p-4 rounded shadow mb-4">
              <p><strong>Mood:</strong> {post.mood}</p>
              <p><strong>Sleep:</strong> {post.sleep_hours} hrs</p>
              <p><strong>Meals:</strong> {post.meal_summary}</p>
              <p><strong>Sunlight:</strong> {post.sunlight_minutes} min</p>
              <p><strong>Water:</strong> {post.water_oz} oz</p>
              {post.notes && <p><strong>Notes:</strong> {post.notes}</p>}
              <p className="text-xs text-gray-400 mt-2">Submitted: {new Date(post.created_at).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
