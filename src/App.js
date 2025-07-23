import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import LoginPage from './LoginPage';

function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setChecking(false);
    };

    check();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (checking) return <div className="p-6 text-center">Checking session...</div>;

  if (!user) {
    return <LoginPage onLoginSuccess={(u) => setUser(u)} />;
  }

  return (
    <div className="p-6">
      <h1>Welcome, {user.email}</h1>
    </div>
  );
}

export default App;
