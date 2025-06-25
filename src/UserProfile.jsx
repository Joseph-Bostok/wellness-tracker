import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export default function UserProfile({ user }) {
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('profiles') // make sure you have this table
      .select('name, email')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error loading profile:', error.message);
    } else {
      setProfile(data);
    }
    setLoading(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const updates = { ...profile, id: user.id };

    const { error } = await supabase.from('profiles').upsert(updates);
    if (error) {
      setMessage('Update failed.');
    } else {
      setMessage('Profile updated!');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
      {message && <p className="text-sm mb-4 text-indigo-600">{message}</p>}
      <form onSubmit={handleUpdate} className="space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          className="w-full border p-2 rounded"
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
          value={profile.email}
          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
        />
        <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
          Save Changes
        </button>
      </form>
    </div>
  );
}
