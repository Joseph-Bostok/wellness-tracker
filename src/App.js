import React, { useState, useEffect, useCallback } from 'react';
import MessageBoard from './components/MessageBoard';
import LoginForm from './loginform.jsx';
import RegisterForm from './registerform.jsx';
import { supabase } from './supabaseClient';

export default function App() {
  const [sessionChecked, setSessionChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [user, setUser] = useState(null);

  // Re‑usable session checker so we can call it from Login / Register
  const checkSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) console.error('Session error:', error.message);

      if (session?.user) {
        setUser(session.user);
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    } catch (err) {
      console.error('Unexpected error during session check:', err);
    } finally {
      setSessionChecked(true);
    }
  }, []);

  useEffect(() => {
    // Initial session check
    checkSession();

    // Subscribe to future auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          setIsLoggedIn(true);
        } else {
          setUser(null);
          setIsLoggedIn(false);
        }
      }
    );

    return () => {
      // Clean up listener
      subscription.unsubscribe();
    };
  }, [checkSession]);

  /* ---------- RENDER LOGIC ---------- */

  if (!sessionChecked) {
    return <div className="p-6 text-center">Checking session...</div>;
  }

  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-white flex flex-col items-center justify-center px-4">
        <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-center text-indigo-700 mb-6">
            {showLogin ? 'Welcome Back' : 'Create Your Account'}
          </h1>

          {showLogin ? (
            <LoginForm onLogin={checkSession} />
          ) : (
            <RegisterForm onRegister={checkSession} />
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
        <p className="mt-6 text-xs text-gray-400">
          HealthQuest © {new Date().getFullYear()}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MessageBoard user={user} />
    </div>
  );
}
