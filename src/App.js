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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-indigo-600">Wellness Tracker</h1>
            <p className="text-gray-600 mt-2">Track your wellness journey</p>
          </div>

          {showLogin ? (
            <LoginForm onLogin={handleLogin} />
          ) : (
            <RegisterForm onRegister={() => setShowLogin(true)} />
          )}

          <div className="text-center mt-4">
            {showLogin ? (
              <p className="text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={() => setShowLogin(false)}
                  className="text-indigo-600 font-medium hover:underline"
                >
                  Register
                </button>
              </p>
            ) : (
              <p className="text-gray-600">
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
