import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';

export default function InviteCodeGenerator({ therapistId }) {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  const fetchCodes = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('invite_codes')
        .select('*, used_by_profile:used_by(full_name, email)')
        .eq('therapist_id', therapistId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCodes(data || []);
    } catch (err) {
      console.error('Error fetching codes:', err);
    } finally {
      setLoading(false);
    }
  }, [therapistId]);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleGenerateCode = async () => {
    setGenerating(true);
    try {
      const code = generateCode();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry

      const { error } = await supabase.from('invite_codes').insert({
        code,
        therapist_id: therapistId,
        expires_at: expiresAt.toISOString(),
      });

      if (error) throw error;
      fetchCodes();
    } catch (err) {
      console.error('Error generating code:', err);
      alert('Failed to generate code');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteCode = async (codeId) => {
    if (!window.confirm('Are you sure you want to delete this invite code?')) return;

    try {
      const { error } = await supabase
        .from('invite_codes')
        .delete()
        .eq('id', codeId);

      if (error) throw error;
      fetchCodes();
    } catch (err) {
      console.error('Error deleting code:', err);
      alert('Failed to delete code');
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isExpired = (expiresAt) => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Invite Codes</h3>
        <button
          onClick={handleGenerateCode}
          disabled={generating}
          className={`px-4 py-2 rounded font-medium text-sm ${
            generating
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          {generating ? 'Generating...' : 'Generate New Code'}
        </button>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Share these codes with clients so they can register and be assigned to you.
        Codes expire after 30 days.
      </p>

      {loading ? (
        <div className="text-center text-gray-500 py-4">Loading codes...</div>
      ) : codes.length === 0 ? (
        <div className="text-center text-gray-500 py-4">
          No invite codes yet. Generate one to invite clients.
        </div>
      ) : (
        <div className="space-y-3">
          {codes.map((code) => (
            <div
              key={code.id}
              className={`flex items-center justify-between p-3 rounded-lg ${
                code.used_by
                  ? 'bg-gray-100'
                  : isExpired(code.expires_at)
                  ? 'bg-red-50'
                  : 'bg-green-50'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-bold tracking-wider">
                    {code.code}
                  </span>
                  {code.used_by ? (
                    <span className="text-xs bg-gray-300 text-gray-700 px-2 py-1 rounded">
                      Used
                    </span>
                  ) : isExpired(code.expires_at) ? (
                    <span className="text-xs bg-red-200 text-red-700 px-2 py-1 rounded">
                      Expired
                    </span>
                  ) : (
                    <span className="text-xs bg-green-200 text-green-700 px-2 py-1 rounded">
                      Active
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {code.used_by ? (
                    <>
                      Used by {code.used_by_profile?.full_name || 'Unknown'} on{' '}
                      {formatDate(code.used_at)}
                    </>
                  ) : (
                    <>
                      Created {formatDate(code.created_at)} | Expires{' '}
                      {formatDate(code.expires_at)}
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                {!code.used_by && !isExpired(code.expires_at) && (
                  <button
                    onClick={() => handleCopyCode(code.code)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm"
                  >
                    {copiedCode === code.code ? 'Copied!' : 'Copy'}
                  </button>
                )}
                {!code.used_by && (
                  <button
                    onClick={() => handleDeleteCode(code.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
