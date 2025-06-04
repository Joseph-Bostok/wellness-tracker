import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import dayjs from 'dayjs';

export default function StreakTracker({ user }) {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (user) fetchStreak(user.id);
  }, [user]);

  const fetchStreak = async (userId) => {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('created_at')
      .eq('user_id', userId);

    if (!error && data.length > 0) {
      const dates = new Set(data.map(entry => dayjs(entry.created_at).format('YYYY-MM-DD')));
      let count = 0;
      let day = dayjs();

      while (dates.has(day.format('YYYY-MM-DD'))) {
        count++;
        day = day.subtract(1, 'day');
      }

      setStreak(count);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow text-center">
      <h2 className="text-lg font-bold text-gray-800">🔥 Streak</h2>
      <p className="text-2xl text-indigo-600 font-semibold">{streak} day{streak === 1 ? '' : 's'}</p>
    </div>
  );
}
