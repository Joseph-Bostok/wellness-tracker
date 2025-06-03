import React, { useState } from 'react';
import { supabase } from './supabaseClient';

export default function RegisterForm({ onRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else {
      onRegister();
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4 bg-white p-6 shadow rounded">
      <h2 className="text-xl font-bold">Register</h2>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded" placeholder="Email" required />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border rounded" placeholder="Password" required />
      <button type="submit" className="bg-green-600 text-white w-full py-2 rounded">Sign Up</button>
    </form>
  );
}
