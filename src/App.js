import React, { useState, useEffect } from 'react';
import LoginForm from './loginform.jsx';
import RegisterForm from './registerform.jsx';
import ClientDashboard from './ClientDashboard.jsx';
import TherapistDashboard from './TherapistDashboard.jsx';
import AdminDashboard from './AdminDashboard.jsx';
import { supabase } from './supabaseClient';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          // Fetch profile to get role
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('role, full_name')
            .eq('id', session.user.id)
            .single();

          if (profile && !error) {
            setIsLoggedIn(true);
            setUser(session.user);
            setUserRole(profile.role);
            setUserName(profile.full_name);
          } else {
            // No profile found - sign out
            await supabase.auth.signOut();
          }
        }
      } catch (err) {
        console.error('Session check failed:', err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        setIsLoggedIn(false);
        setUser(null);
        setUserRole(null);
        setUserName('');
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = (role, fullName) => {
    setIsLoggedIn(true);
    setUserRole(role);
    setUserName(fullName);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUser(null);
    setUserRole(null);
    setUserName('');
    setShowLogin(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-emerald-100 opacity-20 animate-ping"></div>
          </div>
          <p className="mt-6 text-gray-700 font-medium">Loading your wellness space...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-md w-full relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg">
              <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
              Wellness Tracker
            </h1>
            <p className="text-gray-600 mt-2 text-lg">Your personal wellness companion</p>
          </div>

          {showLogin ? (
            <LoginForm onLogin={handleLogin} />
          ) : (
            <RegisterForm onRegister={() => setShowLogin(true)} />
          )}

          <div className="text-center mt-6">
            {showLogin ? (
              <p className="text-gray-600 text-sm">
                Don't have an account?{' '}
                <button
                  onClick={() => setShowLogin(false)}
                  className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
                >
                  Create account →
                </button>
              </p>
            ) : (
              <p className="text-gray-600 text-sm">
                Already have an account?{' '}
                <button
                  onClick={() => setShowLogin(true)}
                  className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
                >
                  ← Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Route based on user role
  if (userRole === 'admin') {
    return (
      <AdminDashboard
        user={user}
        userName={userName}
        onLogout={handleLogout}
      />
    );
  }

  if (userRole === 'therapist') {
    return (
      <TherapistDashboard
        user={user}
        userName={userName}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <ClientDashboard
      user={user}
      userName={userName}
      onLogout={handleLogout}
    />
  );
}
