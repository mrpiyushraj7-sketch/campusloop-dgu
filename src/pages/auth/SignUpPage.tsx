import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { AuthSplitLayout } from '../../components/auth/AuthSplitLayout';
import { useAuth, formatFirebaseAuthError } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function SignUpPage() {
  const { signUpWithEmail, loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [university, setUniversity] = useState('DBS Global University, Dehradun');
  const [studentId, setStudentId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const validate = (): string | null => {
    if (fullName.trim().length < 2) {
      return 'Please enter your full name (at least 2 characters).';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return 'Please enter a valid college or personal email address.';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters long.';
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match. Please re-enter carefully.';
    }
    if (university.trim().length < 2) {
      return 'Please enter your university name.';
    }
    if (studentId.trim().length > 60) {
      return 'Student ID must be 60 characters or fewer.';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const validationErr = validate();
    if (validationErr) {
      setError(validationErr);
      return;
    }

    setSubmitting(true);
    try {
      const { verificationSent } = await signUpWithEmail({
        fullName,
        email,
        password,
        university,
        studentId: studentId.trim() || undefined,
      });
      if (verificationSent) {
        showToast(
          'Account created — verify your email',
          'info',
          `We sent a verification link to ${email.trim()}.`
        );
        navigate('/verify-email', { replace: true });
      } else {
        showToast('Welcome to CampusLoop!', 'success');
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(formatFirebaseAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      showToast('Account ready — welcome to CampusLoop', 'success');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(formatFirebaseAuthError(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AuthSplitLayout>
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-[#252033] sm:text-3xl">
          Create your student account
        </h2>
        <p className="mt-2 text-sm text-[#645D78]">
          Join DBS Global University students unlocking Dehradun deals & services.
        </p>

        {error && (
          <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogleSignUp}
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

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#EAE6F3]" />
          <span className="text-xs font-medium text-[#645D78]">or register with email</span>
          <div className="h-px flex-1 bg-[#EAE6F3]" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label
              htmlFor="signup-name"
              className="block text-sm font-medium text-[#252033]"
            >
              Full Name
            </label>
            <input
              id="signup-name"
              type="text"
              required
              maxLength={100}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Aarav Sharma"
              className="mt-1 w-full rounded-xl border border-[#EAE6F3] bg-white px-4 py-2.5 text-sm text-[#252033] placeholder:text-[#9890AA] focus:border-[#673AB7] focus:outline-none focus:ring-2 focus:ring-[#673AB7]/15"
            />
          </div>

          <div>
            <label
              htmlFor="signup-email"
              className="block text-sm font-medium text-[#252033]"
            >
              College Email
            </label>
            <input
              id="signup-email"
              type="email"
              required
              maxLength={160}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="aarav.sharma@dbsuniversity.ac.in"
              className="mt-1 w-full rounded-xl border border-[#EAE6F3] bg-white px-4 py-2.5 text-sm text-[#252033] placeholder:text-[#9890AA] focus:border-[#673AB7] focus:outline-none focus:ring-2 focus:ring-[#673AB7]/15"
            />
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="signup-password"
                className="block text-sm font-medium text-[#252033]"
              >
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full rounded-xl border border-[#EAE6F3] bg-white px-3.5 py-2.5 pr-10 text-sm text-[#252033] placeholder:text-[#9890AA] focus:border-[#673AB7] focus:outline-none focus:ring-2 focus:ring-[#673AB7]/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#645D78] hover:text-[#252033]"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="signup-confirm"
                className="block text-sm font-medium text-[#252033]"
              >
                Confirm Password
              </label>
              <div className="relative mt-1">
                <input
                  id="signup-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full rounded-xl border border-[#EAE6F3] bg-white px-3.5 py-2.5 pr-10 text-sm text-[#252033] placeholder:text-[#9890AA] focus:border-[#673AB7] focus:outline-none focus:ring-2 focus:ring-[#673AB7]/15"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#645D78] hover:text-[#252033]"
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="signup-university"
              className="block text-sm font-medium text-[#252033]"
            >
              University
            </label>
            <input
              id="signup-university"
              type="text"
              required
              maxLength={140}
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              placeholder="DBS Global University, Dehradun"
              className="mt-1 w-full rounded-xl border border-[#EAE6F3] bg-white px-4 py-2.5 text-sm text-[#252033] placeholder:text-[#9890AA] focus:border-[#673AB7] focus:outline-none focus:ring-2 focus:ring-[#673AB7]/15"
            />
          </div>

          <div>
            <label
              htmlFor="signup-student-id"
              className="block text-sm font-medium text-[#252033]"
            >
              Student ID <span className="font-normal text-[#645D78]">(Optional)</span>
            </label>
            <input
              id="signup-student-id"
              type="text"
              maxLength={60}
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="e.g. DBS-2026-0412"
              className="mt-1 w-full rounded-xl border border-[#EAE6F3] bg-white px-4 py-2.5 text-sm text-[#252033] placeholder:text-[#9890AA] focus:border-[#673AB7] focus:outline-none focus:ring-2 focus:ring-[#673AB7]/15"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || googleLoading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#673AB7] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#45207A] disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Create Account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#645D78]">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-[#673AB7] transition-colors hover:text-[#45207A]"
          >
            Login
          </Link>
        </p>
      </div>
    </AuthSplitLayout>
  );
}
