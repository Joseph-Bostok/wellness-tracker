import React, { useState } from 'react';
import { supabase } from './supabaseClient';

export default function RegisterForm({ onRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateInviteCode = async (code) => {
    const { data, error } = await supabase
      .from('invite_codes')
      .select('id, therapist_id')
      .eq('code', code.toUpperCase())
      .is('used_by', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      return { valid: false, error: 'Invalid or expired invite code' };
    }

    return { valid: true, codeId: data.id, therapistId: data.therapist_id };
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!fullName.trim()) {
      setError('Full name is required');
      setLoading(false);
      return;
    }

    if (!role) {
      setError('Please select your role');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    // Validate invite code for clients
    let inviteData = null;
    if (role === 'client') {
      if (!inviteCode.trim()) {
        setError('Invite code is required for clients');
        setLoading(false);
        return;
      }

      inviteData = await validateInviteCode(inviteCode);
      if (!inviteData.valid) {
        setError(inviteData.error);
        setLoading(false);
        return;
      }
    }

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      const userId = authData.user.id;

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email,
          full_name: fullName,
          role,
        });

      if (profileError) {
        setError('Failed to create profile: ' + profileError.message);
        setLoading(false);
        return;
      }

      // For clients: create therapist-client relationship and mark invite as used
      if (role === 'client' && inviteData) {
        // Create therapist-client relationship
        const { error: relationError } = await supabase
          .from('therapist_clients')
          .insert({
            therapist_id: inviteData.therapistId,
            client_id: userId,
          });

        if (relationError) {
          console.error('Failed to create therapist relationship:', relationError);
        }

        // Mark invite code as used
        const { error: updateError } = await supabase
          .from('invite_codes')
          .update({
            used_by: userId,
            used_at: new Date().toISOString(),
          })
          .eq('id', inviteData.codeId);

        if (updateError) {
          console.error('Failed to mark invite code as used:', updateError);
        }
      }

      onRegister();
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4 bg-white p-6 shadow rounded max-w-md mx-auto">
      <h2 className="text-xl font-bold text-center">Create Account</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter your full name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter your email"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="At least 8 characters"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Confirm Password
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Confirm your password"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          I am a...
        </label>
        <div className="flex gap-4 flex-wrap">
          <label className="flex items-center">
            <input
              type="radio"
              name="role"
              value="client"
              checked={role === 'client'}
              onChange={(e) => setRole(e.target.value)}
              className="mr-2"
            />
            <span>Client</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="role"
              value="therapist"
              checked={role === 'therapist'}
              onChange={(e) => setRole(e.target.value)}
              className="mr-2"
            />
            <span>Therapist</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="role"
              value="admin"
              checked={role === 'admin'}
              onChange={(e) => setRole(e.target.value)}
              className="mr-2"
            />
            <span>Admin</span>
          </label>
        </div>
      </div>

      {role === 'client' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Invite Code
          </label>
          <input
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 uppercase"
            placeholder="Enter code from your therapist"
            maxLength={8}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Your therapist should have provided this code
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 rounded font-medium ${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
        }`}
      >
        {loading ? 'Creating Account...' : 'Sign Up'}
      </button>
    </form>
  );
}
