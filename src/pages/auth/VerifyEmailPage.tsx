import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MailCheck, RefreshCw, LogOut, Loader2 } from 'lucide-react';
import { AuthSplitLayout } from '../../components/auth/AuthSplitLayout';
import { useAuth, formatFirebaseAuthError } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function VerifyEmailPage() {
  const { user, resendVerificationEmail, refreshVerificationStatus, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);

  const handleCheck = async () => {
    setChecking(true);
    try {
      const verified = await refreshVerificationStatus();
      if (verified) {
        showToast('Email verified! Welcome to CampusLoop.', 'success');
        navigate('/dashboard', { replace: true });
      } else {
        showToast(
          'Email not verified yet',
          'info',
          'Please click the verification link in your inbox, then click Refresh.'
        );
      }
    } catch (err) {
      showToast('Verification check failed', 'error', formatFirebaseAuthError(err));
    } finally {
      setChecking(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await resendVerificationEmail();
      showToast('Verification email resent', 'success', 'Check your inbox and spam folder.');
    } catch (err) {
      showToast('Could not resend email', 'error', formatFirebaseAuthError(err));
    } finally {
      setResending(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <AuthSplitLayout>
      <div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F3EDFF] text-[#673AB7]">
          <MailCheck className="h-6 w-6" />
        </div>
        <h2 className="mt-5 font-display text-2xl font-bold text-[#252033]">
          Verify your email address
        </h2>
        <p className="mt-2.5 text-sm leading-relaxed text-[#645D78]">
          To protect student accounts and Firestore records, CampusLoop requires a verified
          email address before activating your profile. We sent a verification link to{' '}
          <span className="font-semibold text-[#252033]">{user?.email}</span>.
        </p>

        <div className="mt-7 space-y-3">
          <button
            type="button"
            onClick={handleCheck}
            disabled={checking}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#673AB7] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#45207A] disabled:opacity-60"
          >
            {checking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            I’ve Verified My Email — Continue
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#EAE6F3] bg-white px-4 py-3 text-sm font-medium text-[#252033] transition-colors hover:bg-[#FAFAFC] disabled:opacity-60"
          >
            {resending && <Loader2 className="h-4 w-4 animate-spin" />}
            Resend Verification Email
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-[#645D78] transition-colors hover:text-[#252033]"
          >
            <LogOut className="h-4 w-4" />
            Sign out or use Google Sign-In instead
          </button>
        </div>
      </div>
    </AuthSplitLayout>
  );
}
