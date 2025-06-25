import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const MOOD_SCALE = { '😢': 1, '😕': 2, '😐': 3, '🙂': 4, '😊': 5 };

export default function MoodAnalyticsChart({ user }) {
  const [moodData, setMoodData] = useState([]);
  const [moodByDay, setMoodByDay] = useState([]);
  const [topMood, setTopMood] = useState(null);
  const [avgMood, setAvgMood] = useState(null);

  useEffect(() => {
    if (user) {
      fetchMoodData(user.id);
    }
  }, [user]);

  const fetchMoodData = async (userId) => {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('mood, created_at, user_id');

    if (!error) {
      const filtered = data.filter(e => e.user_id === userId);
      const moodCounts = {};
      const moodMap = {};
      let totalScore = 0;
      let moodEntries = 0;

      filtered.forEach((entry) => {
        const mood = entry.mood;
        const score = MOOD_SCALE[mood] || 0;
        if (score > 0) {
          totalScore += score;
          moodEntries++;
        }
        moodCounts[mood] = (moodCounts[mood] || 0) + 1;

        const date = new Date(entry.created_at).toLocaleDateString('en-US', { weekday: 'short' });
        if (!moodMap[date]) moodMap[date] = {};
        moodMap[date][mood] = (moodMap[date][mood] || 0) + 1;
      });

      const pieChartData = Object.entries(moodCounts).map(([mood, count]) => ({
        name: mood,
        value: count
      }));

      const barChartData = Object.entries(moodMap).map(([day, moods]) => ({
        day,
        ...moods
      }));

      const top = pieChartData.reduce((a, b) => (a.value > b.value ? a : b), {});

      setMoodData(pieChartData);
      setMoodByDay(barChartData);
      setTopMood(top);
      setAvgMood(moodEntries > 0 ? (totalScore / moodEntries).toFixed(2) : null);
    }
  };

  return (
    <div className="w-full bg-white p-6 rounded shadow space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">🧠 Mood Analytics</h2>
      <p className="text-gray-500">Get insights into your emotional patterns throughout the week.</p>

      {avgMood && (
        <div className="bg-yellow-50 p-4 rounded shadow">
          <h3 className="text-lg font-semibold text-yellow-700 mb-1">📈 Average Mood Score</h3>
          <p className="text-xl font-bold">{avgMood} / 5</p>
          <p className="text-sm text-gray-600">Calculated from your recent entries</p>
        </div>
      )}

      {topMood && (
        <div className="bg-indigo-50 p-4 rounded shadow">
          <h3 className="text-lg font-semibold text-indigo-700 mb-2">Top Mood This Week</h3>
          <p className="text-3xl">{topMood.name}</p>
          <p className="text-sm text-gray-600">Logged {topMood.value} times</p>
        </div>
      )}

      <div className="bg-white rounded shadow p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Mood Distribution</h3>
        {moodData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={moodData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {moodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value} entries`, name]} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-400">No mood data to display yet</p>
        )}
      </div>

      <div className="bg-white rounded shadow p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Mood Trends by Day</h3>
        {moodByDay.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={moodByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              {Object.keys(moodByDay[0]).filter(k => k !== 'day').map((mood, index) => (
                <Bar
                  key={mood}
                  dataKey={mood}
                  stackId="a"
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-400">Insufficient mood data for trend analysis</p>
        )}
      </div>
    </div>
  );
}
