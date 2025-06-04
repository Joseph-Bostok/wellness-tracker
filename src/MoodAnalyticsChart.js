import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

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
        mood,
        count: Number(count) || 0
      }));

      setMoodData(chartData);
    }
  };

  return (
    <div className="w-full bg-white p-4 rounded shadow min-h-[300px]">
      <h2 className="text-lg font-bold text-gray-800 mb-2">📊 Mood Analytics</h2>
      {moodData.length > 0 ? (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={moodData} layout="horizontal" margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="category" dataKey="mood" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-center text-gray-400">No data to display yet</p>
      )}
    </div>
  );
}
