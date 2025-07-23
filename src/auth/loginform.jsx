import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
    } else if (data?.session?.user) {
      onLogin(data.session.user);
    } else {
      setError('Login succeeded, but no user returned.');
    }
  };

  return (
    <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow space-y-4 max-w-md w-full mx-auto">
      <h2 className="text-xl font-bold text-center">Log In</h2>
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-full p-2 border rounded"
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="w-full p-2 border rounded"
        placeholder="Password"
        required
      />
      <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
        Log In
      </button>
    </form>
  );
}
