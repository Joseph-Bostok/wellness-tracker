import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import {
  Calendar, Clock, Activity, Home, FileText, Settings, User, MessageSquare,
  TrendingUp, BookOpen, Heart, Moon, Apple, Smile
} from 'lucide-react';

const dashboardData = [
  { date: 'Mon', mood: 7, sleep: 6, activity: 45, nutrition: 8 },
  { date: 'Tue', mood: 6, sleep: 7, activity: 30, nutrition: 7 },
  { date: 'Wed', mood: 8, sleep: 8, activity: 60, nutrition: 9 },
  { date: 'Thu', mood: 7, sleep: 7, activity: 50, nutrition: 8 },
  { date: 'Fri', mood: 9, sleep: 7, activity: 40, nutrition: 8 },
  { date: 'Sat', mood: 8, sleep: 9, activity: 20, nutrition: 6 },
  { date: 'Sun', mood: 7, sleep: 8, activity: 35, nutrition: 7 },
];

const goalData = [
  { name: 'Activity', completed: 70, remaining: 30 },
  { name: 'Sleep', completed: 85, remaining: 15 },
  { name: 'Nutrition', completed: 60, remaining: 40 },
  { name: 'Mindfulness', completed: 40, remaining: 60 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const recentActivities = [
  { type: 'Activity', description: 'Morning walk - 30 minutes', time: '8:30 AM', points: 15 },
  { type: 'Nutrition', description: 'Balanced breakfast', time: '9:15 AM', points: 10 },
  { type: 'Mood', description: 'Feeling positive - logged mood', time: '12:00 PM', points: 5 },
  { type: 'Sleep', description: 'Logged 7.5 hours of sleep', time: 'Yesterday', points: 10 },
];

export default function HealthQuestDashboard() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isLogActivityModalOpen, setIsLogActivityModalOpen] = useState(false);
  const [goalProgress, setGoalProgress] = useState({ mindfulness: 2, target: 3 });
  const [activities, setActivities] = useState(recentActivities);
  const [showAllResources, setShowAllResources] = useState(false);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [weeklyGoals, setWeeklyGoals] = useState({
  activity: 150,        // minutes
  sleep: 56,            // hours
  nutrition: 8,         // average score out of 10
  mindfulness: 5        // sessions
});
  const [visibleLines, setVisibleLines] = useState({
  mood: true,
  sleep: true,
  activity: true,
});
  const [newActivity, setNewActivity] = useState({ 
    type: 'Activity', 
    description: '', 
    time: '', 
    points: 0,
    entryType: null
  });


  // Additional resources that will be shown when "View All Resources" is clicked
  const additionalResources = [
    { title: 'Guided Meditation Audio', type: 'Audio • Added April 25' },
    { title: 'Stress Management Techniques', type: 'Article • Added April 20' },
    { title: 'Healthy Meal Planning Guide', type: 'PDF Guide • Added April 15' }
  ];

  // Function to handle logging a new activity
  const handleLogActivity = () => {
    if (!newActivity.description || newActivity.description.trim() === '') return;
    
    const activityToAdd = {
      ...newActivity,
      time: newActivity.time || new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      points: newActivity.points || Math.floor(Math.random() * 10) + 5
    };
    
    setActivities([activityToAdd, ...activities]);
    if (activityToAdd.type === 'Mindfulness') {
  setGoalProgress((prev) => ({
    ...prev,
    mindfulness: Math.min(prev.mindfulness + 1, prev.target)
  }));
}
    setNewActivity({ type: 'Activity', description: '', time: '', points: 0, entryType: null });
    setIsLogActivityModalOpen(false);
  };

  // Function to render different tab content
  const renderTabContent = () => {
    switch(currentTab) {
      case 'dashboard':
        return renderDashboard();
      case 'tracker':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Track Your Wellness</h2>
            <p className="text-gray-600 mb-6">Select a category to log your wellness data.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              {/* Activity Box */}
              <div 
                className="bg-white rounded-lg shadow p-6 text-center cursor-pointer hover:shadow-md hover:bg-indigo-50 transition"
                onClick={() => setNewActivity({...newActivity, type: 'Activity', entryType: 'activity'})}
              >
                <div className="text-4xl mb-3">🏃‍♂️</div>
                <h3 className="font-medium text-gray-800">Activity</h3>
                <p className="text-sm text-gray-500 mt-1">Log your workouts</p>
              </div>
              
              {/* Nutrition Box */}
              <div 
                className="bg-white rounded-lg shadow p-6 text-center cursor-pointer hover:shadow-md hover:bg-indigo-50 transition"
                onClick={() => setNewActivity({...newActivity, type: 'Nutrition', entryType: 'nutrition'})}
              >
                <div className="text-4xl mb-3">🥗</div>
                <h3 className="font-medium text-gray-800">Nutrition</h3>
                <p className="text-sm text-gray-500 mt-1">Track your meals</p>
              </div>
              
              {/* Mood Box */}
              <div 
                className="bg-white rounded-lg shadow p-6 text-center cursor-pointer hover:shadow-md hover:bg-indigo-50 transition"
                onClick={() => setNewActivity({...newActivity, type: 'Mood', entryType: 'mood'})}
              >
                <div className="text-4xl mb-3">😊</div>
                <h3 className="font-medium text-gray-800">Mood</h3>
                <p className="text-sm text-gray-500 mt-1">How are you feeling?</p>
              </div>
              
              {/* Sleep Box */}
              <div 
                className="bg-white rounded-lg shadow p-6 text-center cursor-pointer hover:shadow-md hover:bg-indigo-50 transition"
                onClick={() => setNewActivity({...newActivity, type: 'Sleep', entryType: 'sleep'})}
              >
                <div className="text-4xl mb-3">😴</div>
                <h3 className="font-medium text-gray-800">Sleep</h3>
                <p className="text-sm text-gray-500 mt-1">Track your rest</p>
              </div>
              
              {/* Mindfulness Box */}
              <div 
                className="bg-white rounded-lg shadow p-6 text-center cursor-pointer hover:shadow-md hover:bg-indigo-50 transition"
                onClick={() => setNewActivity({...newActivity, type: 'Mindfulness', entryType: 'mindfulness'})}
              >
                <div className="text-4xl mb-3">🧘</div>
                <h3 className="font-medium text-gray-800">Mindfulness</h3>
                <p className="text-sm text-gray-500 mt-1">Self-care moments</p>
              </div>
            </div>
            
            {activities.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Recent Entries</h3>
                <div className="space-y-4">
                  {activities.map((activity, index) => (
                    <div key={index} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                      <div className="flex justify-between">
                        <div>
                          <div className="flex items-center">
                            <span className="mr-2">
                              {activity.type === 'Activity' ? '🏃‍♂️' : 
                               activity.type === 'Nutrition' ? '🥗' : 
                               activity.type === 'Mood' ? '😊' :
                               activity.type === 'Sleep' ? '😴' : '🧘'}
                            </span>
                            <p className="font-medium text-gray-800">{activity.description}</p>
                          </div>
                          <p className="text-sm text-gray-500">{activity.time}</p>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          +{activity.points} pts
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case 'goals':
  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">🎯 Weekly Health Goals</h2>
        <p className="text-gray-600 mb-4">Set your personal targets and keep yourself accountable.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { key: 'activity', label: 'Activity (min)', icon: '🏃‍♂️' },
            { key: 'sleep', label: 'Sleep (hrs)', icon: '😴' },
            { key: 'nutrition', label: 'Nutrition (1–10)', icon: '🥗' },
            { key: 'mindfulness', label: 'Mindfulness (sessions)', icon: '🧘' },
          ].map(({ key, label, icon }) => (
            <div key={key} className="bg-white shadow rounded-lg p-4 flex flex-col justify-between">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-2">{icon}</span>
                <h3 className="text-md font-semibold text-gray-700">{label}</h3>
              </div>
              <input
                type="number"
                min="0"
                value={weeklyGoals[key]}
                onChange={(e) => setWeeklyGoals({ ...weeklyGoals, [key]: Number(e.target.value) })}
                className="w-full mt-2 border rounded-md p-2 text-center text-lg font-medium text-indigo-700 border-indigo-200 focus:ring-indigo-400 focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">🏅 Achievements</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: 'Active Week', description: 'Logged 150+ minutes of activity', icon: '💪' },
            { title: 'Sleep Champ', description: 'Averaged 8+ hours per night', icon: '🌙' },
            { title: 'Mindful Master', description: 'Completed 5 mindfulness sessions', icon: '🧘‍♀️' },
            { title: 'Nutrition Ninja', description: 'Scored 8+ on nutrition this week', icon: '🍎' },
            { title: 'Consistency Star', description: 'Logged wellness for 7 days straight', icon: '⭐' },
          ].map((badge, index) => (
            <div key={index} className="flex items-start bg-white shadow rounded-lg p-4 hover:bg-indigo-50 transition">
              <div className="text-3xl mr-4">{badge.icon}</div>
              <div>
                <h4 className="font-semibold text-gray-800">{badge.title}</h4>
                <p className="text-sm text-gray-600">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

      case 'reports':
  return (
    <div className="p-6 space-y-8">
      <h2 className="text-2xl font-bold">📊 Your Wellness Reports</h2>
      <p className="text-gray-600">Review your progress and trends over time.</p>

      {/* 1. Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Mood Avg', value: '7.2/10', icon: '😊' },
          { label: 'Sleep Avg', value: '7.8 hrs', icon: '😴' },
          { label: 'Activity', value: '245 mins', icon: '🏃' },
          { label: 'Nutrition Avg', value: '8.1/10', icon: '🥗' },
          { label: 'Mindfulness', value: '4 sessions', icon: '🧘' },
        ].map((item, index) => (
          <div key={index} className="bg-white shadow rounded-lg p-4 flex flex-col items-center">
            <div className="text-3xl mb-2">{item.icon}</div>
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className="text-lg font-semibold text-gray-800">{item.value}</p>
          </div>
        ))}
      </div>

      {/* 2. Weekly Trend Graph */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">📈 Weekly Wellness Trends</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dashboardData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="mood" stroke="#8884d8" strokeWidth={2} />
              <Line type="monotone" dataKey="sleep" stroke="#82ca9d" strokeWidth={2} />
              <Line type="monotone" dataKey="activity" stroke="#ffc658" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Goal Completion Breakdown */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">🥅 Goal Completion Breakdown</h3>
        <div className="flex items-center justify-center">
          <PieChart width={250} height={250}>
            <Pie
              data={goalData}
              dataKey="completed"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label
            >
              {goalData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>
        <div className="grid grid-cols-2 mt-4 gap-2">
          {goalData.map((goal, index) => (
            <div key={index} className="flex items-center text-sm text-gray-700">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              ></div>
              {goal.name}: {goal.completed}%
            </div>
          ))}
        </div>
      </div>

      {/* 4. Logging Consistency */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">📆 Logging Consistency</h3>
        <BarChart width={600} height={200} data={dashboardData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="sleep" fill="#8884d8" name="Sleep (hrs)" />
          <Bar dataKey="activity" fill="#82ca9d" name="Activity (min)" />
        </BarChart>
      </div>

      {/* 5. Download Button */}
      <div className="flex justify-end">
        <button className="py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
          📥 Download Monthly Report
        </button>
      </div>
    </div>
  );

      case 'appointments':
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-2">📅 Appointments</h2>
      <p className="text-gray-600 text-lg">This feature is coming soon. Stay tuned!</p>
    </div>
  );

      case 'resources':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Health Resources</h2>
            <p>Access educational materials and resources for your wellness journey.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="flex items-center p-4 rounded-md border border-gray-200 hover:bg-gray-50 cursor-pointer">
                <BookOpen className="text-indigo-500 mr-3" size={24} />
                <div>
                  <p className="font-medium text-gray-800">5-Minute Mindfulness Exercises</p>
                  <p className="text-sm text-gray-500">PDF Guide • Added May 8</p>
                </div>
              </div>
              <div className="flex items-center p-4 rounded-md border border-gray-200 hover:bg-gray-50 cursor-pointer">
                <BookOpen className="text-indigo-500 mr-3" size={24} />
                <div>
                  <p className="font-medium text-gray-800">Sleep Hygiene Tips</p>
                  <p className="text-sm text-gray-500">Article • Added April 30</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'messages':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Messages</h2>
            <p>Communicate with your healthcare providers.</p>
            <div className="mt-4 bg-white rounded-lg shadow p-4">
              <div className="border-b pb-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <User className="text-blue-500" size={20} />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-blue-800">From Dr. Emily Johnson</h4>
                    <p className="mt-1 text-sm text-blue-700">
                      Great progress with your sleep routine! Let's focus on increasing mindfulness practice this week.
                      I've added some new resources to help.
                    </p>
                    <p className="mt-2 text-xs text-blue-500">May 8, 2025</p>
                  </div>
                </div>
              </div>
              
              <button className="w-full py-2 px-3 text-sm font-medium text-indigo-600 bg-indigo-100 rounded-md hover:bg-indigo-200">
                Compose New Message
              </button>
            </div>
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  // Function to render dashboard content
  const renderDashboard = () => {
    return (
      <main className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Weekly Challenge */}
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-gray-500 text-sm font-medium mb-2">Weekly Challenge</h3>
    <div className="text-gray-800 font-semibold mb-2">
      🧘‍♀️ Mindfulness Moments: {goalProgress.mindfulness}/{goalProgress.target}
    </div>
    <div className="h-2 bg-gray-200 rounded-full mb-2">
      <div className="h-2 bg-indigo-500 rounded-full" style={{ width: `${(goalProgress.mindfulness / goalProgress.target) * 100}%` }}></div>
    </div>
    {goalProgress.mindfulness >= goalProgress.target ? (
      <div className="text-green-600 font-medium mt-2">🎉 Challenge Complete! Great job!</div>
    ) : (
      <div className="text-sm text-gray-500">
        Log {goalProgress.target - goalProgress.mindfulness} more to complete!
      </div>
    )}
  </div>
</div>

        {/* Wellness Score, Appointment, Weekly Progress */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-gray-500 text-sm font-medium">Overall Wellness Score</h3>
                <p className="text-3xl font-bold text-gray-800">82/100</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                +5 pts
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
              <div className="h-2 bg-green-500 rounded-full" style={{ width: '82%' }}></div>
            </div>
            <div className="mt-4 text-sm text-gray-500">You're making great progress! Keep going.</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium mb-4">Next Appointment</h3>
            <div className="flex items-start">
              <Calendar className="text-indigo-500 mr-3 mt-1" size={20} />
              <div>
                <p className="font-medium text-gray-800">CBT Session with Dr. Emily Johnson</p>
                <p className="text-sm text-gray-500 mt-1">May 15, 10:00 AM</p>
                <button 
                  onClick={() => setShowAppointmentDetails(!showAppointmentDetails)} 
                  className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  {showAppointmentDetails ? 'Hide Details' : 'View Details'}
                </button>
                
                {showAppointmentDetails && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-700"><strong>Location:</strong> Virtual (Zoom)</p>
                    <p className="text-sm text-gray-700"><strong>Duration:</strong> 50 minutes</p>
                    <p className="text-sm text-gray-700"><strong>Notes:</strong> Please prepare your weekly mood log for review.</p>
                    <div className="mt-2 flex space-x-2">
                      <button className="py-1 px-3 bg-indigo-100 text-indigo-700 text-xs rounded-md hover:bg-indigo-200">
                        Reschedule
                      </button>
                      <button className="py-1 px-3 bg-red-100 text-red-700 text-xs rounded-md hover:bg-red-200">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium mb-4">Weekly Goal Progress</h3>
            <div className="space-y-4">
              {goalData.map((goal, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm font-medium text-gray-700">
                    <span>{goal.name}</span>
                    <span>{goal.completed}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-indigo-500 rounded-full" style={{ width: `${goal.completed}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

       {/* Charts & Breakdown */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-gray-500 text-sm font-medium">Weekly Wellness Trends</h3>
    </div>
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={dashboardData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip
            formatter={(value, name) => [`${value}`, name.charAt(0).toUpperCase() + name.slice(1)]}
          />
          <Legend
            onClick={(e) => {
              setVisibleLines((prev) => ({
                ...prev,
                [e.dataKey]: !prev[e.dataKey],
              }));
            }}
            payload={[
              { value: 'Mood', type: 'line', color: '#8884d8', dataKey: 'mood', inactive: !visibleLines.mood },
              { value: 'Sleep', type: 'line', color: '#82ca9d', dataKey: 'sleep', inactive: !visibleLines.sleep },
              { value: 'Activity', type: 'line', color: '#ffc658', dataKey: 'activity', inactive: !visibleLines.activity },
            ]}
          />
          {visibleLines.mood && (
            <Line type="monotone" dataKey="mood" stroke="#8884d8" strokeWidth={2} />
          )}
          {visibleLines.sleep && (
            <Line type="monotone" dataKey="sleep" stroke="#82ca9d" strokeWidth={2} />
          )}
          {visibleLines.activity && (
            <Line type="monotone" dataKey="activity" stroke="#ffc658" strokeWidth={2} />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>

  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-gray-500 text-sm font-medium mb-4">Goal Breakdown</h3>
    <div className="h-64 flex items-center justify-center">
      <PieChart width={200} height={200}>
        <Pie
          data={goalData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="completed"
        >
          {goalData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </div>
    <div className="grid grid-cols-2 gap-2 mt-2">
      {goalData.map((goal, index) => (
        <div key={index} className="flex items-center">
          <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
          <span className="text-xs text-gray-600">{goal.name}: {goal.completed}%</span>
        </div>
      ))}
    </div>
  </div>
</div>


        {/* Activities & Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-500 text-sm font-medium">Recent Activities</h3>
              <span 
                className="text-xs text-indigo-600 font-medium cursor-pointer"
                onClick={() => setCurrentTab('tracker')}
              >
                View All
              </span>
            </div>
            <div className="space-y-4">
              {activities.slice(0, 4).map((activity, index) => (
                <div key={index} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{activity.description}</p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      +{activity.points} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button 
              className="mt-4 w-full py-2 px-3 text-sm font-medium text-indigo-600 bg-indigo-100 rounded-md hover:bg-indigo-200"
              onClick={() => setIsLogActivityModalOpen(true)}
            >
              Log New Activity
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-500 text-sm font-medium">Therapist Notes & Resources</h3>
            </div>
            <div className="border rounded-lg p-4 mb-4 bg-blue-50 border-blue-100">
              <div className="flex">
                <div className="flex-shrink-0">
                  <User className="text-blue-500" size={20} />
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-800">From Dr. Emily Johnson</h4>
                  <p className="mt-1 text-sm text-blue-700">
                    Great progress with your sleep routine! Let's focus on increasing mindfulness practice this week.
                    I've added some new resources below.
                  </p>
                  <p className="mt-2 text-xs text-blue-500">May 8, 2025</p>
                </div>
              </div>
            </div>

            <h4 className="font-medium text-gray-700 mb-2">Recommended Resources</h4>
            <div className="space-y-3">
              <div className="flex items-center p-3 rounded-md border border-gray-200 hover:bg-gray-50 cursor-pointer">
                <BookOpen className="text-indigo-500 mr-3" size={18} />
                <div>
                  <p className="text-sm font-medium text-gray-800">5-Minute Mindfulness Exercises</p>
                  <p className="text-xs text-gray-500">PDF Guide • Added May 8</p>
                </div>
              </div>
              <div className="flex items-center p-3 rounded-md border border-gray-200 hover:bg-gray-50 cursor-pointer">
                <BookOpen className="text-indigo-500 mr-3" size={18} />
                <div>
                  <p className="text-sm font-medium text-gray-800">Sleep Hygiene Tips</p>
                  <p className="text-xs text-gray-500">Article • Added April 30</p>
                </div>
              </div>
              
              {showAllResources && additionalResources.map((resource, index) => (
                <div key={index} className="flex items-center p-3 rounded-md border border-gray-200 hover:bg-gray-50 cursor-pointer">
                  <BookOpen className="text-indigo-500 mr-3" size={18} />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{resource.title}</p>
                    <p className="text-xs text-gray-500">{resource.type}</p>
                  </div>
                </div>
              ))}
            </div>
            <button 
              className="mt-4 w-full py-2 px-3 text-sm font-medium text-indigo-600 bg-indigo-100 rounded-md hover:bg-indigo-200"
              onClick={() => setShowAllResources(!showAllResources)}
            >
              {showAllResources ? 'Show Less' : 'View All Resources'}
            </button>
          </div>
        </div>
      </main>
    );
  };

  // Modal for logging a new activity
  const renderActivityModal = () => {
    if (!isLogActivityModalOpen && !newActivity.entryType) return null;
    
    const renderActivityForm = () => {
      switch(newActivity.entryType) {
        case 'activity':
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={newActivity.description || ''}
                  onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
                  placeholder="What did you do? (e.g. Walking, Yoga, Running)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <div className="flex flex-wrap gap-2">
                  {[0, 15, 30, 45, 60].map(duration => (
                    <button 
                      key={duration}
                      className={`py-2 px-4 rounded-md text-sm ${newActivity.duration === duration ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                      onClick={() => setNewActivity({...newActivity, duration, description: newActivity.description ? `${newActivity.description} - ${duration} minutes` : `Workout - ${duration} minutes`})}
                    >
                      {duration}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
          
        case 'nutrition':
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meal</label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={newActivity.meal || ''}
                  onChange={(e) => setNewActivity({...newActivity, meal: e.target.value, description: `${e.target.value}${newActivity.calories ? ` - ${newActivity.calories} calories` : ''}`})}
                  placeholder="What did you eat? (e.g. Breakfast, Lunch, Snack)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Calorie Count (estimated)</label>
                <input 
                  type="number" 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={newActivity.calories || ''}
                  onChange={(e) => {
                    const calories = e.target.value;
                    setNewActivity({
                      ...newActivity, 
                      calories, 
                      description: `${newActivity.meal || 'Meal'}${calories ? ` - ${calories} calories` : ''}`
                    });
                  }}
                  placeholder="Estimated calories"
                />
              </div>
            </div>
          );
          
        case 'mood':
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">How are you feeling?</label>
                <div className="flex justify-between mb-4">
                  {['😔', '😕', '😐', '🙂', '😊'].map((emoji, index) => (
                    <button 
                      key={index}
                      className={`text-3xl p-2 rounded-full ${newActivity.moodEmoji === emoji ? 'bg-indigo-100 ring-2 ring-indigo-500' : 'hover:bg-gray-100'}`}
                      onClick={() => {
                        const moodDescriptions = ['Feeling low', 'Not great', 'Neutral', 'Good', 'Excellent'];
                        setNewActivity({
                          ...newActivity, 
                          moodEmoji: emoji,
                          moodLevel: index + 1,
                          description: newActivity.moodText ? `${moodDescriptions[index]} - ${newActivity.moodText}` : moodDescriptions[index]
                        });
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">How are you feeling? (optional)</label>
                <textarea 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                  value={newActivity.moodText || ''}
                  onChange={(e) => {
                    const moodText = e.target.value;
                    const moodDescriptions = ['Feeling low', 'Not great', 'Neutral', 'Good', 'Excellent'];
                    const moodLevel = newActivity.moodLevel || 3;
                    setNewActivity({
                      ...newActivity, 
                      moodText,
                      description: moodText ? `${moodDescriptions[moodLevel-1]} - ${moodText}` : moodDescriptions[moodLevel-1]
                    });
                  }}
                  placeholder="Describe how you're feeling right now..."
                />
              </div>
            </div>
          );
          
        case 'sleep':
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">How well did you sleep?</label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-xs text-gray-500">Poor</span>
                    <span className="text-xs text-gray-500">Excellent</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    className="w-full accent-indigo-600"
                    value={newActivity.sleepQuality || 5}
                    onChange={(e) => {
                      const sleepQuality = e.target.value;
                      setNewActivity({
                        ...newActivity, 
                        sleepQuality,
                        description: `Sleep quality: ${sleepQuality}/10${newActivity.sleepDuration ? ` - ${newActivity.sleepDuration} hours` : ''}`
                      });
                    }}
                  />
                  <div className="text-center font-medium text-indigo-600">
                    {newActivity.sleepQuality || 5}/10
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">How long did you sleep?</label>
                <div className="flex flex-wrap gap-2">
                  {[4, 5, 6, 7, 8, 9, 10].map(hours => (
                    <button 
                      key={hours}
                      className={`py-2 px-4 rounded-md text-sm ${newActivity.sleepDuration === hours ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                      onClick={() => setNewActivity({
                        ...newActivity, 
                        sleepDuration: hours,
                        description: `Sleep quality: ${newActivity.sleepQuality || 5}/10 - ${hours} hours`
                      })}
                    >
                      {hours} hrs
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
          
        case 'mindfulness':
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">What did you do for yourself today?</label>
                <textarea 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={4}
                  value={newActivity.description || ''}
                  onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
                  placeholder="Describe your mindfulness activity or self-care practice..."
                />
              </div>
            </div>
          );
          
        default:
          return (
            <div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={newActivity.type}
                  onChange={(e) => setNewActivity({...newActivity, type: e.target.value})}
                >
                  <option value="Activity">Activity</option>
                  <option value="Nutrition">Nutrition</option>
                  <option value="Mood">Mood</option>
                  <option value="Sleep">Sleep</option>
                  <option value="Mindfulness">Mindfulness</option>
                </select>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={newActivity.description || ''}
                  onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
                  placeholder="Describe your activity"
                />
              </div>
            </div>
          );
      }
    };
    
    const getModalTitle = () => {
      switch(newActivity.entryType) {
        case 'activity': return 'Log Activity';
        case 'nutrition': return 'Log Nutrition';
        case 'mood': return 'Log Mood';
        case 'sleep': return 'Log Sleep';
        case 'mindfulness': return 'Log Mindfulness';
        default: return 'Log New Activity';
      }
    };
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{getModalTitle()}</h3>
          
          {renderActivityForm()}
          
          <div className="mt-6 flex justify-end space-x-3">
            <button 
              className="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => {
                setIsLogActivityModalOpen(false);
                setNewActivity({ type: 'Activity', description: '', time: '', points: 0 });
              }}
            >
              Cancel
            </button>
            <button 
              className="py-2 px-4 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
              onClick={handleLogActivity}
              disabled={!newActivity.description}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-indigo-800 text-white flex flex-col">
        <div className="p-4">
          <div className="flex items-center justify-center mb-6">
            <Heart className="mr-2 text-white" size={24} />
            <h1 className="text-xl font-bold">Health Quest</h1>
          </div>
          <div className="mb-4">
            <div className="flex items-center justify-center mb-2">
              <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center">
                <User size={32} />
              </div>
            </div>
            <p className="text-center font-medium">Sarah Johnson</p>
            <p className="text-center text-indigo-300 text-sm">Patient</p>
          </div>
        </div>

        <nav className="flex-1 p-4">
          {[
            ['dashboard', 'Dashboard', <Home size={20} />],
            ['tracker', 'Track Wellness', <Activity size={20} />],
            ['goals', 'Goals', <TrendingUp size={20} />],
            ['reports', 'Reports', <FileText size={20} />],
            ['appointments', 'Appointments', <Calendar size={20} />],
            ['resources', 'Resources', <BookOpen size={20} />],
            ['messages', 'Messages', <MessageSquare size={20} />]
          ].map(([key, label, icon]) => (
            <div 
              key={key}
              className={`flex items-center p-3 mb-2 rounded cursor-pointer ${currentTab === key ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}
              onClick={() => setCurrentTab(key)}
            >
              {React.cloneElement(icon, { className: "mr-3" })}
              <span>{label}</span>
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
            <h2 className="text-xl font-semibold text-gray-800">
              {currentTab === 'dashboard' ? 'My Wellness Dashboard' : 
               currentTab === 'tracker' ? 'Track Your Wellness' :
               currentTab === 'goals' ? 'Your Health Goals' :
               currentTab === 'reports' ? 'Your Wellness Reports' :
               currentTab === 'appointments' ? 'Your Appointments' :
               currentTab === 'resources' ? 'Health Resources' :
               currentTab === 'messages' ? 'Messages' : 'My Wellness Dashboard'}
            </h2>
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-4">Monday, May 12, 2025</span>
              <button className="flex items-center justify-center bg-indigo-600 text-white p-2 rounded-full h-8 w-8">
                <span className="text-md font-bold">SJ</span>
              </button>
            </div>
          </div>
        </header>

        {renderTabContent()}
        {renderActivityModal()}
      </div>
    </div>
  );
}