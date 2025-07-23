import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import LoginForm from './auth/loginform';
import RegisterForm from './auth/registerform';
import PatientDashboard from './patient/PatientDashboard';
import ClinicianDashboard from './clinician/ClinicianDashboard';

export default function App() {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [showLogin, setShowLogin] = useState(true);

  // TEMPORARY: override this manually for now
  const [isClinician, setIsClinician] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) console.error('Session check failed:', error.message);
      setUser(session?.user || null);
      setCheckingSession(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (checkingSession) {
    return <div className="p-6 text-center">Checking session...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        {showLogin ? (
          <LoginForm onLogin={setUser} />
        ) : (
          <RegisterForm onRegister={setUser} />
        )}
        <div className="text-center mt-4 text-sm text-gray-600">
          {showLogin ? (
            <p>
              Don’t have an account?{' '}
              <button onClick={() => setShowLogin(false)} className="text-indigo-600 font-semibold hover:underline">
                Register
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button onClick={() => setShowLogin(true)} className="text-indigo-600 font-semibold hover:underline">
                Log In
              </button>
            </p>
          )}
        </div>
      </div>
    );
  }

  // After login
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex justify-between items-center p-4">
        <p className="text-sm text-gray-600">Logged in as: {user.email}</p>
        <div className="space-x-4">
          <button
            onClick={() => setIsClinician(!isClinician)}
            className="bg-yellow-500 text-white px-4 py-1 rounded hover:bg-yellow-600"
          >
            Switch to {isClinician ? 'Patient' : 'Clinician'}
          </button>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              setUser(null);
            }}
            className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
          >
            Log Out
          </button>
        </div>
      </div>

      {isClinician ? (
        <ClinicianDashboard user={user} />
      ) : (
        <PatientDashboard user={user} />
      )}
    </div>
  );
}
