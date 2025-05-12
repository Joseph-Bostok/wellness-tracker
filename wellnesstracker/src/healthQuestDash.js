import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';
import {
  Heart, Home, Activity, TrendingUp, FileText, Calendar, BookOpen, MessageSquare, Settings
} from 'lucide-react';

const dashboardData = [
  { date: 'Mon', mood: 7, sleep: 6, activity: 45 },
  { date: 'Tue', mood: 6, sleep: 7, activity: 30 },
  { date: 'Wed', mood: 8, sleep: 8, activity: 60 },
  { date: 'Thu', mood: 7, sleep: 7, activity: 50 },
  { date: 'Fri', mood: 9, sleep: 7, activity: 40 },
  { date: 'Sat', mood: 8, sleep: 9, activity: 20 },
  { date: 'Sun', mood: 7, sleep: 8, activity: 35 },
];

export default function HealthQuestDashboard() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [logModal, setLogModal] = useState({ open: false, type: null, value: '' });

  const [goals, setGoals] = useState({
    activity: { target: 30, progress: 0 },     // 30 minutes
    sleep: { target: 8, progress: 0 },         // 8 hours
    nutrition: { target: 2000, progress: 0 },  // 2000 calories
    mood: { target: 1, progress: 0 }           // 1 check-in/day
  });

  const openLogModal = (type) => setLogModal({ open: true, type, value: '' });
  const closeLogModal = () => setLogModal({ open: false, type: null, value: '' });

  const renderGoalBlock = (type, unit = '') => {
    const data = goals[type];
    return (
      <div className="bg-white rounded-lg shadow p-4" key={type}>
        <h3 className="text-gray-700 text-sm font-semibold mb-1">
          {type.charAt(0).toUpperCase() + type.slice(1)} Goal
        </h3>
        <p className="text-gray-800 text-lg">
          {data.progress} / {data.target} {unit}
        </p>
        <div className="h-2 bg-gray-200 rounded-full mt-2">
          <div
            className="h-2 bg-indigo-500 rounded-full"
            style={{ width: `${Math.min(100, (data.progress / data.target) * 100)}%` }}
          />
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <div className="p-6 space-y-4">
            {renderGoalBlock("activity", "min")}
            {renderGoalBlock("sleep", "hrs")}
            {renderGoalBlock("nutrition", "cal")}
            {renderGoalBlock("mood", "check-ins")}
          </div>
        );
      case 'tracker':
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Track Your Wellness</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {["Activity", "Sleep", "Nutrition", "Mood"].map((type, index) => (
                <div className="bg-white rounded-lg shadow p-6" key={index}>
                  <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mb-4">
                    <span className="text-indigo-500 text-xl">{type[0]}</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">{type}</h3>
                  <p className="text-gray-600 mb-4">Log your {type.toLowerCase()} data.</p>
                  <button
                    onClick={() => openLogModal(type)}
                    className="w-full py-2 px-3 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
                  >
                    Log {type}
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      case 'reports':
        return (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderGoalBlock("activity", "min")}
              {renderGoalBlock("sleep", "hrs")}
              {renderGoalBlock("nutrition", "cal")}
              {renderGoalBlock("mood", "check-ins")}
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-700 font-medium mb-4">Activity Chart</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dashboardData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="activity" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      default:
        return <div className="p-6 text-gray-700">Coming soon!</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-indigo-800 text-white flex flex-col">
        <div className="p-4 flex items-center justify-center">
          <Heart className="mr-2" size={24} />
          <h1 className="text-xl font-bold">Health Quest</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {[
            ['dashboard', 'Dashboard', <Home size={20} />],
            ['tracker', 'Track Wellness', <Activity size={20} />],
            ['goals', 'Goals', <TrendingUp size={20} />],
            ['reports', 'Reports', <FileText size={20} />],
            ['appointments', 'Appointments', <Calendar size={20} />],
            ['resources', 'Resources', <BookOpen size={20} />],
            ['messages', 'Messages', <MessageSquare size={20} />]
          ].map(([key, label, icon]) => (
            <div key={key}
              className={`flex items-center p-3 rounded cursor-pointer ${currentTab === key ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}
              onClick={() => setCurrentTab(key)}>
              {icon}
              <span className="ml-3">{label}</span>
            </div>
          ))}
        </nav>
        <div className="p-4 mt-auto">
          <div className="flex items-center p-3 hover:bg-indigo-700 rounded cursor-pointer">
            <Settings size={20} className="mr-3" />
            <span>Settings</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">My Wellness Dashboard</h2>
            <div className="bg-indigo-600 text-white px-3 py-1 rounded-full">SJ</div>
          </div>
        </header>
        <main className="p-6">
          {renderTabContent()}
        </main>
      </div>

      {/* Log Modal */}
      {logModal.open && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-lg font-bold mb-4">Log {logModal.type}</h2>
            <input
              type="number"
              placeholder={`Enter ${logModal.type.toLowerCase()} value`}
              className="w-full border border-gray-300 rounded-md p-2 mb-4"
              value={logModal.value}
              onChange={(e) => setLogModal({ ...logModal, value: e.target.value })}
            />
            <div className="flex justify-end space-x-2">
              <button onClick={closeLogModal} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
              <button
                onClick={() => {
                  const val = parseFloat(logModal.value || 0);
                  const typeKey = logModal.type.toLowerCase();
                  if (val > 0 && goals[typeKey]) {
                    setGoals(prev => ({
                      ...prev,
                      [typeKey]: {
                        ...prev[typeKey],
                        progress: prev[typeKey].progress + val
                      }
                    }));
                  }
                  closeLogModal();
                }}
                className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
