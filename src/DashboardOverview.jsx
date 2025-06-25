import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import StreakTracker from './StreakTracker';
import MoodAnalyticsChart from './MoodAnalyticsChart';

export default function DashboardOverview({ user }) {
  const [exerciseTotal, setExerciseTotal] = useState(0);
  const [moodCount, setMoodCount] = useState(0);
  const [sleepScore, setSleepScore] = useState(72);
  const [trendData, setTrendData] = useState([]);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    if (user) {
      fetchExerciseTotal();
      fetchMoodCount();
      fetchTrendData();
      fetchAchievements();
    }
  }, [user]);

  const fetchExerciseTotal = async () => {
    const { data } = await supabase
      .from('exercise_logs')
      .select('duration')
      .eq('user_id', user.id);
    const total = data?.reduce((sum, log) => sum + (log.duration || 0), 0) || 0;
    setExerciseTotal(total);
  };

  const fetchMoodCount = async () => {
    const { data } = await supabase
      .from('journal_entries')
      .select('mood')
      .eq('user_id', user.id);
    setMoodCount(data?.length || 0);
  };

  const fetchTrendData = async () => {
    const [exerciseRes, moodRes] = await Promise.all([
      supabase.from('exercise_logs').select('date, duration').eq('user_id', user.id),
      supabase.from('journal_entries').select('created_at, mood').eq('user_id', user.id),
    ]);

    const moodMap = { '😢': 1, '😕': 2, '😐': 3, '🙂': 4, '😊': 5 };
    const dailyData = {};
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dailyData[key] = {
        date: d.toLocaleDateString('en-US', { weekday: 'short' }),
        mood: null,
        exercise: 0,
        count: 0
      };
    }

    if (exerciseRes.data) {
      exerciseRes.data.forEach((log) => {
        const dateKey = log.date;
        if (dailyData[dateKey]) {
          dailyData[dateKey].exercise += log.duration || 0;
        }
      });
    }

    if (moodRes.data) {
      moodRes.data.forEach((entry) => {
        const dateKey = entry.created_at.slice(0, 10);
        if (dailyData[dateKey]) {
          dailyData[dateKey].mood =
            ((dailyData[dateKey].mood || 0) * dailyData[dateKey].count + (moodMap[entry.mood] || 0)) /
            (dailyData[dateKey].count + 1);
          dailyData[dateKey].count++;
        }
      });
    }

    setTrendData(Object.values(dailyData));
  };

  const fetchAchievements = () => {
    const earned = [];
    if (exerciseTotal >= 150) earned.push('🏃 150+ min Exercise');
    if (moodCount >= 10) earned.push('😊 10 Mood Logs');
    if (sleepScore >= 70) earned.push('😴 Good Sleep');
    if (exerciseTotal >= 300) earned.push('💪 300+ min Beast Mode');
    if (moodCount >= 25) earned.push('🧠 Emotion Explorer');
    if (moodCount >= 50) earned.push('🧘 Mood Master');
    setAchievements(earned);
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded shadow space-y-8">
      <h2 className="text-2xl font-bold mb-4">📊 Wellness Overview</h2>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[{
            label: 'Exercise Goal', value: exerciseTotal / 150 * 100, color: '#10b981'
          }, {
            label: 'Mood Check-ins', value: moodCount / 10 * 100, color: '#6366f1'
          }, {
            label: 'Sleep Score', value: sleepScore, color: '#f59e0b'
          }].map((goal, i) => (
            <div key={i} className="flex flex-col items-center bg-gray-50 p-4 rounded shadow">
              <div className="w-20 h-20">
                <CircularProgressbar
                  value={Math.min(goal.value, 100)}
                  text={`${Math.round(Math.min(goal.value, 100))}%`}
                  styles={buildStyles({ pathColor: goal.color, textColor: goal.color })}
                />
              </div>
              <p className="mt-2 text-sm text-center text-gray-700">{goal.label}</p>
            </div>
          ))}
        </div>

        <div className="flex-1 bg-gray-50 rounded p-4 shadow">
          <h3 className="text-lg font-semibold mb-2">📈 Weekly Trends</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="mood" stroke="#6366f1" name="Mood" />
              <Line type="monotone" dataKey="exercise" stroke="#10b981" name="Exercise (min)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">🔥 Consistency</h3>
          <StreakTracker user={user} />
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">😊 Mood Overview</h3>
          <MoodAnalyticsChart user={user} />
        </div>
      </div>

      <div className="text-center bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-1">🏅 Wellness Score</h3>
        <p className="text-3xl font-bold text-indigo-600">
          {Math.round((exerciseTotal / 150 * 30) + (moodCount / 10 * 30) + (sleepScore * 0.4))}/100
        </p>
        <p className="text-sm text-gray-500">Based on activity, mood, and sleep</p>
      </div>

      {achievements.length > 0 && (
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">🎖️ Achievements</h3>
          <div className="flex flex-wrap gap-2">
            {achievements.map((a, i) => (
              <span
                key={i}
                className="inline-block bg-indigo-100 text-indigo-800 text-xs font-medium px-3 py-1 rounded-full"
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
