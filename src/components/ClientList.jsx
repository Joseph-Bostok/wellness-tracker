import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function ClientList({ clinicianId, onSelectClient }) {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    if (clinicianId) fetchClients();
  }, [clinicianId]);

  const fetchClients = async () => {
    const { data, error } = await supabase
      .from('clients_clinicians')
      .select('client_id, users (email, id)')
      .eq('clinician_id', clinicianId);

    if (error) {
      console.error('Error fetching clients:', error.message);
    } else {
      const clientUsers = data.map(entry => entry.users);
      setClients(clientUsers);
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-md font-semibold text-gray-800 mb-2">👥 My Clients</h3>
      {clients.length === 0 ? (
        <p className="text-sm text-gray-500">No clients assigned.</p>
      ) : (
        clients.map((client) => (
          <button
            key={client.id}
            onClick={() => onSelectClient(client)}
            className="block w-full text-left text-sm text-indigo-700 hover:underline"
          >
            {client.email}
          </button>
        ))
      )}
    </div>
  );
}
