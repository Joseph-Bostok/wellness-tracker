import React, { useState, useEffect } from 'react';
import MessageBoard from './components/MessageBoard';
import LoginForm from './loginform.jsx';
import RegisterForm from './registerform.jsx';
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-white flex flex-col items-center justify-center px-4">
        <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-center text-indigo-700 mb-6">
            {showLogin ? 'Welcome Back' : 'Create Your Account'}
          </h1>
          {showLogin ? (
            <LoginForm onLogin={() => setIsLoggedIn(true)} />
          ) : (
            <RegisterForm onRegister={() => setIsLoggedIn(true)} />
          )}
          <div className="text-center mt-4 text-sm text-gray-600">
            {showLogin ? (
              <p>
                Don’t have an account?{' '}
                <button
                  onClick={() => setShowLogin(false)}
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  Register
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  onClick={() => setShowLogin(true)}
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  Log In
                </button>
              </p>
            )}
          </div>
        </div>
        <p className="mt-6 text-xs text-gray-400">HealthQuest © {new Date().getFullYear()}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MessageBoard user={user} />
    </div>
  );
}
