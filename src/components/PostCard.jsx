import React from 'react';
import dayjs from 'dayjs';

export default function PostCard({ post }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-indigo-700">
            {dayjs(post.date).format('dddd, MMM D, YYYY')}
          </h3>
          <p className="text-sm text-gray-500">Check-in summary</p>
        </div>
        <div className="text-3xl" title="Mood">
          {post.mood}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm text-gray-700">
        <div>
          <span className="font-medium">Sleep:</span> {post.sleep_hours} hrs
        </div>
        <div>
          <span className="font-medium">Meals:</span> {post.meal_summary}
        </div>
        <div>
          <span className="font-medium">Water:</span> {post.water_oz} oz
        </div>
        <div>
          <span className="font-medium">Sunlight:</span> {post.sunlight_minutes} mins
        </div>
      </div>

      {post.notes && (
        <div className="pt-2 border-t text-sm text-gray-600">
          <p className="font-medium text-gray-700 mb-1">Notes:</p>
          <p className="italic">{post.notes}</p>
        </div>
      )}
    </div>
  );
}