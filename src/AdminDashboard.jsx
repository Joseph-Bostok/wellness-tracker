import React, { useState } from 'react';
import ClientDashboard from './ClientDashboard';
import TherapistDashboard from './TherapistDashboard';

export default function AdminDashboard({ user, userName, onLogout }) {
  const [currentView, setCurrentView] = useState('therapist');

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin View Switcher */}
      <div className="bg-indigo-800 text-white px-4 py-2">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Admin Mode:</span>
            <div className="flex bg-indigo-900 rounded-lg p-1">
              <button
                onClick={() => setCurrentView('therapist')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  currentView === 'therapist'
                    ? 'bg-white text-indigo-800'
                    : 'text-indigo-200 hover:text-white'
                }`}
              >
                Therapist View
              </button>
              <button
                onClick={() => setCurrentView('client')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  currentView === 'client'
                    ? 'bg-white text-indigo-800'
                    : 'text-indigo-200 hover:text-white'
                }`}
              >
                Client View
              </button>
            </div>
          </div>
          <span className="text-xs text-indigo-200">
            Viewing as: {currentView === 'therapist' ? 'Therapist' : 'Client'}
          </span>
        </div>
      </div>

      {/* Render the appropriate dashboard */}
      {currentView === 'therapist' ? (
        <TherapistDashboard
          user={user}
          userName={userName}
          onLogout={onLogout}
        />
      ) : (
        <ClientDashboard
          user={user}
          userName={userName}
          onLogout={onLogout}
        />
      )}
    </div>
  );
}
