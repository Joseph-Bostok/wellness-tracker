import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import PostCard from './PostCard';
import NewPostForm from './NewPostForm';
import Sidebar from './Sidebar';

export default function MessageBoard({ user }) {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user]);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('daily_posts')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error.message);
    } else {
      setPosts(data);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-56">
        <Sidebar user={user} />
      </aside>
      <main className="flex-1 overflow-auto p-6 space-y-4">
        <NewPostForm user={user} onPostCreated={fetchPosts} />
        {posts.length === 0 ? (
          <p className="text-gray-500 text-center mt-6">No posts yet. Submit your first check-in above!</p>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </main>
    </div>
  );
}
