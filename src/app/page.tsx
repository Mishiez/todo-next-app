'use client';

import { useState, useEffect } from 'react';
import Login from './components/Login';
import TodoList from './components/Todolist';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem('token'));
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-200 to-orange-400">
      {isAuthenticated ? <TodoList /> : <Login onLogin={handleLogin} />}
    </div>
  );
}
