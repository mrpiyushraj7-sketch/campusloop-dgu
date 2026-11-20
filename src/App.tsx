import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isFirebaseConfigured } from './lib/firebase';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { FirebaseSetupNotice } from './components/auth/FirebaseSetupNotice';
import {
  ProtectedRoute,
  AdminRoute,
  PublicOnlyRoute,
} from './components/auth/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';
import { LoginPage } from './pages/auth/LoginPage';
import { SignUpPage } from './pages/auth/SignUpPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
import { DashboardPage } from './pages/DashboardPage';
import { ExplorePage } from './pages/ExplorePage';
import { CafesPage } from './pages/CafesPage';
import { OffersPage } from './pages/OffersPage';
import { ServicesPage } from './pages/ServicesPage';
import { EventsPage } from './pages/EventsPage';
import { BookingsPage } from './pages/BookingsPage';
import { WishlistPage } from './pages/WishlistPage';
import { ProfilePage } from './pages/ProfilePage';
import { PartnerPage } from './pages/PartnerPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

function ShellRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  );
}

export default function App() {
  if (!isFirebaseConfigured) {
    return <FirebaseSetupNotice />;
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <DataProvider>
              <Routes>
                {/* Public Authentication Routes */}
                <Route
                  path="/login"
                  element={
                    <PublicOnlyRoute>
                      <LoginPage />
                    </PublicOnlyRoute>
                  }
                />
                <Route
                  path="/signup"
                  element={
                    <PublicOnlyRoute>
                      <SignUpPage />
                    </PublicOnlyRoute>
                  }
                />
                <Route path="/verify-email" element={<VerifyEmailPage />} />

                {/* Authenticated Student Application Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ShellRoute>
                      <DashboardPage />
                    </ShellRoute>
                  }
                />
                <Route
                  path="/explore"
                  element={
                    <ShellRoute>
                      <ExplorePage />
                    </ShellRoute>
                  }
                />
                <Route
                  path="/cafes"
                  element={
                    <ShellRoute>
                      <CafesPage />
                    </ShellRoute>
                  }
                />
                <Route
                  path="/offers"
                  element={
                    <ShellRoute>
                      <OffersPage />
                    </ShellRoute>
                  }
                />
                <Route
                  path="/services"
                  element={
                    <ShellRoute>
                      <ServicesPage />
                    </ShellRoute>
                  }
                />
                <Route
                  path="/events"
                  element={
                    <ShellRoute>
                      <EventsPage />
                    </ShellRoute>
                  }
                />
                <Route
                  path="/bookings"
                  element={
                    <ShellRoute>
                      <BookingsPage />
                    </ShellRoute>
                  }
                />
                <Route
                  path="/wishlist"
                  element={
                    <ShellRoute>
                      <WishlistPage />
                    </ShellRoute>
                  }
                />
                <Route
                  path="/partner"
                  element={
                    <ShellRoute>
                      <PartnerPage />
                    </ShellRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ShellRoute>
                      <ProfilePage />
                    </ShellRoute>
                  }
                />

                {/* Role-Protected Admin Console */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AppShell>
                        <AdminDashboardPage />
                      </AppShell>
                    </AdminRoute>
                  }
                />

                {/* Default & Catch-all Redirects */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </DataProvider>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
