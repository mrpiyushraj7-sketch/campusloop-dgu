import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingScreen } from '../ui/States';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, authReady, needsEmailVerification } = useAuth();
  const location = useLocation();

  if (loading || !authReady) {
    return <LoadingScreen message="Verifying your CampusLoop session..." />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (needsEmailVerification) {
    return <Navigate to="/verify-email" replace />;
  }

  return <>{children}</>;
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading, authReady, needsEmailVerification } = useAuth();
  const location = useLocation();

  if (loading || !authReady) {
    return <LoadingScreen message="Checking administrator permissions..." />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (needsEmailVerification) {
    return <Navigate to="/verify-email" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, authReady, needsEmailVerification } = useAuth();

  if (loading || !authReady) {
    return <LoadingScreen message="Loading CampusLoop..." />;
  }

  if (user && needsEmailVerification) {
    return <Navigate to="/verify-email" replace />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
