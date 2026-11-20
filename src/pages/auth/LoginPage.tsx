import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Loader2, ArrowLeft, MailCheck, AlertCircle } from 'lucide-react';
import { AuthSplitLayout } from '../../components/auth/AuthSplitLayout';
import { useAuth, formatFirebaseAuthError } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function LoginPage() {
  const { loginWithEmail, loginWithGoogle, resetPassword } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const fromPath =
    (location.state as { from?: { pathname?: string } })?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Forgot password sub-view
  const [forgotMode, setForgotMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setSubmitting(true);
    try {
      await loginWithEmail(cleanEmail, password, rememberMe);
      showToast('Welcome back to CampusLoop', 'success');
      navigate(fromPath, { replace: true });
    } catch (err) {
      setError(formatFirebaseAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      showToast('Signed in with Google', 'success');
      navigate(fromPath, { replace: true });
    } catch (err) {
      setError(formatFirebaseAuthError(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const target = resetEmail.trim();
    if (!target || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target)) {
      setError('Please enter the email address associated with your account.');
      return;
    }
    setResetLoading(true);
    try {
      await resetPassword(target);
      setResetSent(true);
      showToast('Password reset email sent', 'success', `Check ${target} for your reset link.`);
    } catch (err) {
      setError(formatFirebaseAuthError(err));
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <AuthSplitLayout>
      {forgotMode ? (
        <div>
          <button
            type="button"
            onClick={() => {
              setForgotMode(false);
              setResetSent(false);
              setError('');
            }}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#645D78] transition-colors hover:text-[#673AB7]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </button>

          <h2 className="mt-5 font-display text-2xl font-bold tracking-tight text-[#252033]">
            Reset your password
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#645D78]">
            Enter your college or personal email address and Firebase will send a secure
            password reset link.
          </p>

          {error && (
            <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {resetSent ? (
            <div className="mt-6 rounded-2xl border border-[#EAE6F3] bg-[#FAFAFC] p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3EDFF] text-[#673AB7]">
                <MailCheck className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-[#252033]">
                Reset link sent
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#645D78]">
                We sent password recovery instructions to{' '}
                <span className="font-medium text-[#252033]">{resetEmail}</span>. Follow the
                link in your inbox, then return here to sign in.
              </p>
              <button
                type="button"
                onClick={() => {
                  setForgotMode(false);
                  setResetSent(false);
                }}
                className="mt-5 w-full rounded-xl bg-[#673AB7] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#45207A]"
              >
                Return to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handlePasswordReset} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="reset-email"
                  className="block text-sm font-medium text-[#252033]"
                >
                  Email Address
                </label>
                <input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="you@dbsuniversity.ac.in"
                  className="mt-1.5 w-full rounded-xl border border-[#EAE6F3] bg-white px-4 py-2.5 text-sm text-[#252033] placeholder:text-[#9890AA] focus:border-[#673AB7] focus:outline-none focus:ring-2 focus:ring-[#673AB7]/15"
                />
              </div>

              <button
                type="submit"
                disabled={resetLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#673AB7] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#45207A] disabled:opacity-60"
              >
                {resetLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Send Reset Link
              </button>
            </form>
          )}
        </div>
      ) : (
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-[#252033] sm:text-3xl">
            Sign in to CampusLoop
          </h2>
          <p className="mt-2 text-sm text-[#645D78]">
            Access Dehradun student deals, bookings, and campus events.
          </p>

          {error && (
            <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || submitting}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-[#EAE6F3] bg-white px-4 py-3 text-sm font-semibold text-[#252033] transition-colors hover:bg-[#FAFAFC] disabled:opacity-60"
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-[#673AB7]" />
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#EAE6F3]" />
            <span className="text-xs font-medium text-[#645D78]">or sign in with email</span>
            <div className="h-px flex-1 bg-[#EAE6F3]" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-[#252033]"
              >
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@dbsuniversity.ac.in"
                className="mt-1.5 w-full rounded-xl border border-[#EAE6F3] bg-white px-4 py-2.5 text-sm text-[#252033] placeholder:text-[#9890AA] focus:border-[#673AB7] focus:outline-none focus:ring-2 focus:ring-[#673AB7]/15"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="block text-sm font-medium text-[#252033]"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotMode(true);
                    setResetEmail(email);
                    setError('');
                  }}
                  className="text-xs font-semibold text-[#673AB7] transition-colors hover:text-[#45207A]"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative mt-1.5">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-[#EAE6F3] bg-white px-4 py-2.5 pr-11 text-sm text-[#252033] placeholder:text-[#9890AA] focus:border-[#673AB7] focus:outline-none focus:ring-2 focus:ring-[#673AB7]/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#645D78] transition-colors hover:text-[#252033]"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#645D78]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-[#EAE6F3] accent-[#673AB7]"
              />
              <span>Remember me on this device</span>
            </label>

            <button
              type="submit"
              disabled={submitting || googleLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#673AB7] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#45207A] disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Login
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#645D78]">
            New to CampusLoop?{' '}
            <Link
              to="/signup"
              className="font-semibold text-[#673AB7] transition-colors hover:text-[#45207A]"
            >
              Create New Account
            </Link>
          </p>
        </div>
      )}
    </AuthSplitLayout>
  );
}
