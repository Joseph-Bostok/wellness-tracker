import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import InviteCodeGenerator from './InviteCodeGenerator';
import ClientEntryView from './ClientEntryView';

export default function TherapistDashboard({ user, userName, onLogout }) {
  const [activeTab, setActiveTab] = useState('clients');
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    fetchClients();
  }, [user.id]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      // Get all clients assigned to this therapist
      const { data, error } = await supabase
        .from('therapist_clients')
        .select('client_id, created_at, profiles:client_id(id, full_name, email)')
        .eq('therapist_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch latest entry date for each client
      const clientsWithStats = await Promise.all(
        (data || []).map(async (assignment) => {
          const { data: entries } = await supabase
            .from('daily_entries')
            .select('entry_date')
            .eq('user_id', assignment.client_id)
            .order('entry_date', { ascending: false })
            .limit(1);

          const { count } = await supabase
            .from('daily_entries')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', assignment.client_id);

          return {
            ...assignment,
            latestEntry: entries?.[0]?.entry_date || null,
            totalEntries: count || 0,
          };
        })
      );

      setClients(clientsWithStats);
    } catch (err) {
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No entries';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysSinceLastEntry = (dateString) => {
    if (!dateString) return null;
    const entryDate = new Date(dateString);
    const today = new Date();
    const diffTime = today - entryDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // If viewing a specific client
  if (selectedClient) {
    return (
      <ClientEntryView
        client={selectedClient}
        therapistId={user.id}
        onBack={() => setSelectedClient(null)}
        onLogout={onLogout}
        therapistName={userName}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-indigo-600">Wellness Tracker</h1>
            <p className="text-sm text-gray-600">Therapist: {userName}</p>
          </div>
          <button
            onClick={onLogout}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded text-sm font-medium"
          >
            Log Out
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-4xl mx-auto px-4 mt-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('clients')}
            className={`px-4 py-2 rounded-t-lg font-medium ${
              activeTab === 'clients'
                ? 'bg-white text-indigo-600 shadow'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            My Clients ({clients.length})
          </button>
          <button
            onClick={() => setActiveTab('invites')}
            className={`px-4 py-2 rounded-t-lg font-medium ${
              activeTab === 'invites'
                ? 'bg-white text-indigo-600 shadow'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            Invite Codes
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 pb-8">
        {activeTab === 'clients' && (
          <div className="bg-white rounded-lg shadow">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading clients...</div>
            ) : clients.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>No clients yet.</p>
                <button
                  onClick={() => setActiveTab('invites')}
                  className="mt-2 text-indigo-600 hover:underline"
                >
                  Generate an invite code to add clients
                </button>
              </div>
            ) : (
              <div className="divide-y">
                {clients.map((client) => {
                  const daysSince = getDaysSinceLastEntry(client.latestEntry);
                  const isInactive = daysSince !== null && daysSince > 3;

                  return (
                    <div
                      key={client.client_id}
                      className="p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() =>
                        setSelectedClient({
                          id: client.client_id,
                          name: client.profiles.full_name,
                          email: client.profiles.email,
                        })
                      }
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {client.profiles.full_name}
                          </h3>
                          <p className="text-sm text-gray-500">{client.profiles.email}</p>
                          <div className="flex gap-4 mt-1 text-xs text-gray-500">
                            <span>{client.totalEntries} entries</span>
                            <span>
                              Last entry: {formatDate(client.latestEntry)}
                              {isInactive && (
                                <span className="ml-2 text-orange-600 font-medium">
                                  ({daysSince} days ago)
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="text-indigo-600 text-sm">View Entries →</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'invites' && <InviteCodeGenerator therapistId={user.id} />}
      </main>
    </div>
  );
}
