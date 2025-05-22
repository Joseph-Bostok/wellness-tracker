import React, { useState } from 'react';

export default function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault(); // ✅ Prevent form from reloading

    try {
      const res = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.msg || 'Login failed');
        return;
      }

      localStorage.setItem('token', data.token); // ✅ Store token
      onLogin(); // ✅ Tell App.js to switch to dashboard view
    } catch (err) {
      console.error(err);
      setError('Network or server error');
    }
  };

  return (
    <form onSubmit={handleLogin} className="max-w-md mx-auto mt-12 p-6 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Login</h2>
      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
      <input
        className="w-full p-2 mb-4 border rounded"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        className="w-full p-2 mb-4 border rounded"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
        Login
      </button>
    </form>
  );
}
