import React, { useState, useEffect } from 'react';
import HealthQuestDashboard from './healthQuestDash';
import LoginForm from './loginform';
import RegisterForm from './registerform';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(true);

  // Check if token exists on first render
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full">
          {showLogin ? (
            <LoginForm onLogin={() => setIsLoggedIn(true)} />
          ) : (
            <RegisterForm onRegister={() => setIsLoggedIn(true)} />
          )}
          <div className="text-center mt-4">
            {showLogin ? (
              <p>
                Don’t have an account?{' '}
                <button
                  onClick={() => setShowLogin(false)}
                  className="text-indigo-600 font-medium hover:underline"
                >
                  Register
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  onClick={() => setShowLogin(true)}
                  className="text-indigo-600 font-medium hover:underline"
                >
                  Login
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // If logged in, show dashboard
  return <HealthQuestDashboard />;
}
