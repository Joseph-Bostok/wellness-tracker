import React, { useState, useEffect } from 'react';
import HealthQuestDashboard from './healthQuestDash';
import LoginForm from './loginForm';
import RegisterForm from './registerForm';
import { supabase } from './supabaseClient';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      setUser(session?.user || null);
    };

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      setUser(session?.user || null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
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
                  Log In
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <HealthQuestDashboard user={user} />;
}
