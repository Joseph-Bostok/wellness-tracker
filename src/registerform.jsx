import React, { useState } from 'react';

export default function RegisterForm({ onRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault(); // ✅ prevent page reload

    try {
      const res = await fetch('http://localhost:5000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.msg || 'Registration failed');
        return;
      }

      localStorage.setItem('token', data.token); // ✅ store token
      onRegister(); // ✅ signal App.js that we're logged in
    } catch (err) {
      console.error(err);
      setError('Network or server error');
    }
  };

  return (
    <form onSubmit={handleRegister} className="max-w-md mx-auto mt-12 p-6 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Register</h2>

      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

      <input
        className="w-full p-2 mb-4 border rounded"
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        className="w-full p-2 mb-4 border rounded"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
        Register
      </button>
    </form>
  );
}
