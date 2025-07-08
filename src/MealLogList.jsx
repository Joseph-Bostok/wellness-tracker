import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import dayjs from 'dayjs';

export default function MealLogList({ user }) {
  const [meals, setMeals] = useState([]);

  useEffect(() => {
    if (user) fetchMeals();
  }, [user]);

  const fetchMeals = async () => {
    const { data, error } = await supabase
      .from('nutrition_logs') // make sure this matches your table name
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (!error) {
      setMeals(data);
    } else {
      console.error('Error fetching meals:', error.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow mt-6 space-y-4">
      <h2 className="text-lg font-bold text-gray-800">🍱 Recent Meals</h2>
      {meals.length === 0 ? (
        <p className="text-gray-500">No meals logged yet.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {meals.map((meal) => (
            <li key={meal.id} className="py-2">
              <div className="flex justify-between">
                <span className="font-medium text-indigo-700">
                  {meal.meal_type}
                </span>
                <span className="text-sm text-gray-500">
                  {dayjs(meal.date).format('MMM D, YYYY')}
                </span>
              </div>
              <p className="text-gray-700 text-sm mt-1">{meal.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
