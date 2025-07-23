import React, { useState } from 'react';
import { supabase } from './supabaseClient';

export default function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data: session, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('Login error:', error);
        setError(error.message || 'Login failed. Please check your credentials.');
      } else {
        console.log('Login successful:', session);
        onLogin();
      }
    } catch (err) {
      console.error('Unexpected error during login:', err);
      setError('Unexpected error. Please try again.');
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4 bg-white p-6 shadow rounded-lg">
      <h2 className="text-xl font-bold text-indigo-700">Log In</h2>
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-full p-2 border-2 border-indigo-300 bg-indigo-50 rounded focus:outline-none focus:ring focus:border-indigo-500"
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="w-full p-2 border-2 border-indigo-300 bg-indigo-50 rounded focus:outline-none focus:ring focus:border-indigo-500"
        placeholder="Password"
        required
      />
      <button
        type="submit"
        className="bg-indigo-600 text-white w-full py-2 rounded hover:bg-indigo-700 transition"
      >
        Log In
      </button>
    </form>
  );
}
