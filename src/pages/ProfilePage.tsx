import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  Loader2,
  Lock,
  LogOut,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { useAuth, formatFirebaseAuthError } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { uploadCampusImage } from '../lib/firestoreService';

export function ProfilePage() {
  const {
    user,
    profile,
    isAdmin,
    updateUserProfile,
    changeUserPassword,
    logout,
  } = useAuth();
  const { myBookings, myEventRegistrations, myRedemptions, myFavorites } = useData();
  const { showToast, confirm } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(profile?.fullName || user?.displayName || '');
  const [university, setUniversity] = useState(
    profile?.university || 'DBS Global University, Dehradun'
  );
  const [studentId, setStudentId] = useState(profile?.studentId || '');
  const [photoURL, setPhotoURL] = useState(profile?.photoURL || user?.photoURL || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName);
      setUniversity(profile.university);
      setStudentId(profile.studentId || '');
      setPhotoURL(profile.photoURL || user?.photoURL || '');
    }
  }, [profile, user]);

  const hasPasswordProvider = Boolean(
    user?.providerData?.some((p) => p.providerId === 'password')
  );

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      showToast('Image too large', 'error', 'Please choose an image smaller than 3 MB.');
      return;
    }
    setUploadingAvatar(true);
    try {
      const url = await uploadCampusImage(file, `avatars/${user?.uid || 'student'}`);
      setPhotoURL(url);
      await updateUserProfile({
        fullName: fullName || profile?.fullName || 'Student',
        university: university || profile?.university || 'DBS Global University',
        studentId,
        photoURL: url,
      });
      showToast('Profile picture updated', 'success');
    } catch {
      showToast(
        'Upload unavailable',
        'error',
        'You can also paste a direct profile image URL in the field below.'
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName.trim().length < 2) {
      showToast('Full name must be at least 2 characters', 'error');
      return;
    }
    if (university.trim().length < 2) {
      showToast('Please enter your university name', 'error');
      return;
    }

    setSavingProfile(true);
    try {
      await updateUserProfile({
        fullName,
        university,
        studentId,
        photoURL: photoURL.trim() || undefined,
      });
      showToast('Profile saved to Firestore', 'success');
    } catch (err) {
      showToast(
        'Update failed',
        'error',
        err instanceof Error ? err.message : 'Unable to save profile.'
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'error');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    setChangingPassword(true);
    try {
      await changeUserPassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      showToast('Password updated successfully', 'success');
    } catch (err) {
      showToast('Password change failed', 'error', formatFirebaseAuthError(err));
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    const ok = await confirm({
      title: 'Log out of CampusLoop?',
      message: 'Your bookings, wishlist, and profile remain safely synced in Firebase.',
      confirmLabel: 'Logout',
    });
    if (!ok) return;
    await logout();
    navigate('/login', { replace: true });
  };

  const initials = (fullName || 'CL')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#252033] sm:text-3xl">
            My Profile
          </h1>
          <p className="mt-1 text-sm text-[#645D78]">
            Manage your student identity, university details, and account security.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 sm:self-auto"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>

      {/* Overview Stats Strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#EAE6F3] bg-white p-5">
          <p className="text-xs font-medium text-[#645D78]">Redeemed Offers</p>
          <p className="mt-2 font-display text-2xl font-bold tabular-nums text-[#252033]">
            {myRedemptions.length}
          </p>
        </div>
        <div className="rounded-2xl border border-[#EAE6F3] bg-white p-5">
          <p className="text-xs font-medium text-[#645D78]">Service Bookings</p>
          <p className="mt-2 font-display text-2xl font-bold tabular-nums text-[#252033]">
            {myBookings.length}
          </p>
        </div>
        <div className="rounded-2xl border border-[#EAE6F3] bg-white p-5">
          <p className="text-xs font-medium text-[#645D78]">Event Registrations</p>
          <p className="mt-2 font-display text-2xl font-bold tabular-nums text-[#252033]">
            {myEventRegistrations.length}
          </p>
        </div>
        <div className="rounded-2xl border border-[#EAE6F3] bg-white p-5">
          <p className="text-xs font-medium text-[#645D78]">Wishlist Items</p>
          <p className="mt-2 font-display text-2xl font-bold tabular-nums text-[#252033]">
            {myFavorites.length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Edit Profile Form */}
        <section className="rounded-2xl border border-[#EAE6F3] bg-white p-6 sm:p-7 lg:col-span-7">
          <div className="flex items-center gap-4 border-b border-[#EAE6F3] pb-6">
            <div className="relative">
              {photoURL ? (
                <img
                  src={photoURL}
                  alt={fullName}
                  referrerPolicy="no-referrer"
                  className="h-16 w-16 rounded-2xl object-cover ring-1 ring-[#EAE6F3]"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F3EDFF] font-display text-xl font-bold text-[#45207A]">
                  {initials}
                </div>
              )}
              <label
                htmlFor="avatar-upload"
                title="Upload profile picture"
                className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg bg-[#673AB7] text-white shadow-sm hover:bg-[#45207A]"
              >
                {uploadingAvatar ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Camera className="h-3.5 w-3.5" />
                )}
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarFile}
                className="hidden"
              />
            </div>

            <div className="min-w-0">
              <h2 className="truncate font-display text-lg font-bold text-[#252033]">
                {fullName || 'Student'}
              </h2>
              <p className="truncate text-sm text-[#645D78]">
                {profile?.email || user?.email}
              </p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-[#45207A]">
                {isAdmin ? (
                  <>
                    <ShieldCheck className="h-3.5 w-3.5 text-[#673AB7]" />
                    Authorised CampusLoop Administrator
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Verified Student Account
                  </>
                )}
              </p>
            </div>
          </div>

          <form onSubmit={handleProfileSave} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="profile-name"
                className="block text-sm font-medium text-[#252033]"
              >
                Full Name
              </label>
              <input
                id="profile-name"
                type="text"
                required
                maxLength={100}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#EAE6F3] bg-white px-4 py-2.5 text-sm text-[#252033] focus:border-[#673AB7] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#252033]">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={profile?.email || user?.email || ''}
                className="mt-1.5 w-full cursor-not-allowed rounded-xl border border-[#EAE6F3] bg-[#FAFAFC] px-4 py-2.5 text-sm text-[#645D78]"
              />
            </div>

            <div>
              <label
                htmlFor="profile-university"
                className="block text-sm font-medium text-[#252033]"
              >
                University
              </label>
              <input
                id="profile-university"
                type="text"
                required
                maxLength={140}
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#EAE6F3] bg-white px-4 py-2.5 text-sm text-[#252033] focus:border-[#673AB7] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="profile-student-id"
                className="block text-sm font-medium text-[#252033]"
              >
                Student ID
              </label>
              <input
                id="profile-student-id"
                type="text"
                maxLength={60}
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. DBS-2026-0412"
                className="mt-1.5 w-full rounded-xl border border-[#EAE6F3] bg-white px-4 py-2.5 text-sm text-[#252033] placeholder:text-[#9890AA] focus:border-[#673AB7] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="profile-photo-url"
                className="block text-sm font-medium text-[#252033]"
              >
                Profile Picture URL <span className="font-normal text-[#645D78]">(Optional)</span>
              </label>
              <input
                id="profile-photo-url"
                type="url"
                maxLength={500}
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                placeholder="https://..."
                className="mt-1.5 w-full rounded-xl border border-[#EAE6F3] bg-white px-4 py-2.5 text-sm text-[#252033] placeholder:text-[#9890AA] focus:border-[#673AB7] focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex items-center gap-2 rounded-xl bg-[#673AB7] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#45207A] disabled:opacity-60"
              >
                {savingProfile && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Profile Changes
              </button>
            </div>
          </form>
        </section>

        {/* Change Password */}
        <section className="rounded-2xl border border-[#EAE6F3] bg-white p-6 sm:p-7 lg:col-span-5">
          <div className="flex items-center gap-3 border-b border-[#EAE6F3] pb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3EDFF] text-[#673AB7]">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-[#252033]">
                Change Password
              </h2>
              <p className="text-xs text-[#645D78]">
                Update your Firebase email/password credentials
              </p>
            </div>
          </div>

          {hasPasswordProvider ? (
            <form onSubmit={handlePasswordChange} className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="current-password"
                  className="block text-sm font-medium text-[#252033]"
                >
                  Current Password
                </label>
                <input
                  id="current-password"
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[#EAE6F3] bg-white px-4 py-2.5 text-sm text-[#252033] focus:border-[#673AB7] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="new-password"
                  className="block text-sm font-medium text-[#252033]"
                >
                  New Password
                </label>
                <input
                  id="new-password"
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="mt-1.5 w-full rounded-xl border border-[#EAE6F3] bg-white px-4 py-2.5 text-sm text-[#252033] focus:border-[#673AB7] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="confirm-new-password"
                  className="block text-sm font-medium text-[#252033]"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirm-new-password"
                  type="password"
                  required
                  minLength={6}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[#EAE6F3] bg-white px-4 py-2.5 text-sm text-[#252033] focus:border-[#673AB7] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={changingPassword}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#252033] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#3A3250] disabled:opacity-60"
              >
                {changingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
                Update Password
              </button>
            </form>
          ) : (
            <div className="mt-5 rounded-xl border border-[#EAE6F3] bg-[#FAFAFC] p-4 text-sm leading-relaxed text-[#645D78]">
              You signed in using <strong className="text-[#252033]">Google Sign-In</strong>.
              Your authentication and password security are managed directly through your
              Google account settings.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
