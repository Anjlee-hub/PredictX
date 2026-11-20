import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout, AuthLayout } from '../layouts';
import { ProtectedRoute } from './ProtectedRoute';
import {
  Login,
  Register,
  Dashboard,
  Machines,
  MachineDetails,
  Predictions,
  Explainability,
  SurvivalAnalysis,
  FactoryAnalytics,
  Maintenance,
  Alerts,
  Simulation,
  Reports,
  Settings,
  NotFound,
} from '../pages';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Auth Public Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected Dashboard Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/machines" element={<Machines />} />
          <Route path="/machines/:id" element={<MachineDetails />} />
          <Route path="/predictions" element={<Predictions />} />
          <Route path="/explainability" element={<Explainability />} />
          <Route path="/survival-analysis" element={<SurvivalAnalysis />} />
          <Route path="/factory-analytics" element={<FactoryAnalytics />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/simulation" element={<Simulation />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* 404 Catch All */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
