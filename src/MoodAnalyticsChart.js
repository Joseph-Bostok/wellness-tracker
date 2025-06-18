import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import {PieChart,Pie,Cell,Tooltip,ResponsiveContainer} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function MoodAnalyticsChart({ user }) {
  const [moodData, setMoodData] = useState([]);

  useEffect(() => {
    if (user) {
      fetchMoodCounts(user.id);
    }
  }, [user]);

  const fetchMoodCounts = async (userId) => {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('mood, user_id');

    if (!error) {
      const filtered = data.filter(e => e.user_id === userId);
      const moodCounts = filtered.reduce((acc, entry) => {
        acc[entry.mood] = (acc[entry.mood] || 0) + 1;
        return acc;
      }, {});

      const chartData = Object.entries(moodCounts).map(([mood, count]) => ({
        name: mood,
        value: Number(count) || 0
      }));

      setMoodData(chartData);
    }
  };

  return (
    <div className="w-full bg-white p-6 rounded shadow min-h-[300px]">
      <h2 className="text-lg font-bold text-gray-800 mb-4">📊 Mood Distribution</h2>
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
              fill="#8884d8"
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
  );
}
