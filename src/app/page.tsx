'use client';

import { useState, useEffect } from 'react';
import Login from './components/Login';
import TodoList from './components/Todolist';

// Force client-side rendering
export const dynamic = 'force-dynamic';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const handleLogin = () => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token); // Update state based on token
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-200 to-orange-400">
      {isAuthenticated ? (
        <>
          <div className="flex justify-end p-4">
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition duration-200"
            >
              Logout
            </button>
          </div>
          <TodoList />
        </>
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}