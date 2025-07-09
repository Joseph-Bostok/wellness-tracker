import React from 'react';

export default function Sidebar({ user }) {
  return (
    <div className="w-56 min-h-screen bg-white border-r border-gray-200 p-4 space-y-6">
      <div className="text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-indigo-600 text-white flex items-center justify-center text-lg font-bold">
          {user.email?.charAt(0).toUpperCase() || '?'}
        </div>
        <h3 className="mt-2 text-sm font-semibold text-gray-800 truncate">{user.email}</h3>
        <p className="text-xs text-gray-400">Logged In</p>
      </div>

      <nav className="space-y-2 text-sm">
        <button className="w-full text-left px-3 py-2 rounded-md text-indigo-700 hover:bg-indigo-50 font-medium">
          🧑‍⚕️ My Clinician
        </button>
        <button className="w-full text-left px-3 py-2 rounded-md text-indigo-700 hover:bg-indigo-50 font-medium">
          📊 My Stats
        </button>
        <button className="w-full text-left px-3 py-2 rounded-md text-indigo-700 hover:bg-indigo-50 font-medium">
          ⚙️ Settings
        </button>
        <button className="w-full text-left px-3 py-2 rounded-md text-red-600 hover:bg-red-50 font-medium">
          🚪 Log Out
        </button>
      </nav>
    </div>
  );
}
