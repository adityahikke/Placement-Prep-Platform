import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader } from '../components/common/Loader';

/**
 * Gate for any authenticated area. Unauthenticated visitors are sent to /login.
 */
export const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loader message="Verifying authentication session..." fullScreen />;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

/**
 * Student-only area. Admins are bounced to their own panel so the two
 * experiences never overlap — an admin should never land inside the learning
 * dashboard or the test flow.
 */
export const StudentRoute = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <Loader message="Loading your workspace..." fullScreen />;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Outlet />;
};

/**
 * Admin-only area. Non-admin (student) accounts are redirected to their
 * dashboard. This is a convenience guard only — the backend independently
 * enforces ROLE_ADMIN on every /api/admin/** endpoint (HTTP 403 otherwise).
 */
export const AdminRoute = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <Loader message="Verifying administrator privileges..." fullScreen />;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
};

/**
 * Sends the bare "/" path to the correct home depending on who is signed in.
 */
export const RootRedirect = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <Loader message="Loading..." fullScreen />;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={isAdmin ? '/admin/dashboard' : '/dashboard'} replace />;
};
