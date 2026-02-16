import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PlannerDashboard from './pages/PlannerDashboard';
import Login from './pages/Login';
import Availability from './pages/Availability';
import AdminUsers from './pages/AdminUsers';
import Profile from './pages/Profile';
import { AuthProvider, useAuth } from './services/AuthContext';

const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role?: 'planer' | 'mitarbeiter' }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) {
    return <Navigate to={user?.role === 'planer' ? '/planner' : '/availability'} replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Planner View */}
      <Route path="/planner/*" element={
        <ProtectedRoute role="planer">
          <PlannerDashboard />
        </ProtectedRoute>
      } />

      {/* Admin/User Management */}
      <Route path="/admin/users" element={
        <ProtectedRoute role="planer">
          <AdminUsers />
        </ProtectedRoute>
      } />

      {/* Employee Availability View */}
      <Route path="/availability" element={
        <ProtectedRoute role="mitarbeiter">
          <Availability />
        </ProtectedRoute>
      } />

      {/* Profile Page */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />

      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;