import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PlannerDashboard from './pages/PlannerDashboard';
import Login from './pages/Login';
import Availability from './pages/Availability';

// Simple protection wrapper (mock)
const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role?: 'PLANNER' | 'EMPLOYEE' }) => {
  const isAuthenticated = localStorage.getItem('mahamez_auth');
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Planner View - The original App UI */}
        <Route path="/planner/*" element={
          <ProtectedRoute>
            <PlannerDashboard />
          </ProtectedRoute>
        } />

        {/* Employee Availability View - New Requirement */}
        <Route path="/availability" element={
          <ProtectedRoute>
            <Availability />
          </ProtectedRoute>
        } />

        {/* Default redirect for now */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;