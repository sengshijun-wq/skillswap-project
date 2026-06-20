// frontend/src/App.js — Main application router
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

import HomePage     from './pages/HomePage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import MatchPage    from './pages/MatchPage';
import MessagesPage from './pages/MessagesPage';
import ProfilePage  from './pages/ProfilePage';
import HistoryPage  from './pages/HistoryPage';
import AdminPage    from './pages/AdminPage';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user?.role === 'admin' ? children : <Navigate to="/" replace />;
};

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to="/match" replace />;
};

function AppShell() {
  return (
    <div style={{ minHeight:'100vh', background:'#f7f5f0', fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", color:'#1a1916' }}>
      <Navbar />
      <Routes>
        <Route path="/"         element={<HomePage />} />
        <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/match"    element={<PrivateRoute><MatchPage /></PrivateRoute>} />
        <Route path="/messages" element={<PrivateRoute><MessagesPage /></PrivateRoute>} />
        <Route path="/profile"  element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="/history"  element={<PrivateRoute><HistoryPage /></PrivateRoute>} />
        <Route path="/admin"    element={<AdminRoute><AdminPage /></AdminRoute>} />
        <Route path="*"         element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  );
}
