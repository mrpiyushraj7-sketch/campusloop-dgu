import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  type User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  isFirebaseConfigured,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import { checkIsAdminDoc } from '../lib/firestoreService';
import {
  BOOTSTRAPPED_ADMIN_EMAIL,
  type UserProfile,
} from '../types/campusloop';

interface SignUpInput {
  fullName: string;
  email: string;
  password: string;
  university: string;
  studentId?: string;
}

interface ProfileUpdateInput {
  fullName: string;
  university: string;
  studentId?: string;
  photoURL?: string;
}

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  authReady: boolean;
  loading: boolean;
  needsEmailVerification: boolean;
  signUpWithEmail: (input: SignUpInput) => Promise<{ verificationSent: boolean }>;
  loginWithEmail: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  refreshVerificationStatus: () => Promise<boolean>;
  updateUserProfile: (input: ProfileUpdateInput) => Promise<void>;
  changeUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const PENDING_SIGNUP_PREFIX = 'campusloop_pending_signup_';

export function formatFirebaseAuthError(error: unknown): string {
  const code = (error as { code?: string })?.code || '';
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try logging in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please check your credentials and try again.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment before trying again.';
    case 'auth/popup-closed-by-user':
      return 'Google Sign-In popup was closed before completion.';
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by your browser. Please allow popups and try again.';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is not yet enabled in your Firebase Console. Enable it under Authentication → Sign-in method → Email/Password, or use Continue with Google.';
    case 'auth/requires-recent-login':
      return 'For security, please log out and sign back in before changing your password.';
    default:
      return error instanceof Error
        ? error.message
        : 'Authentication failed. Please try again.';
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [hasAdminDoc, setHasAdminDoc] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);

  const ensureFirestoreProfile = useCallback(async (firebaseUser: User) => {
    if (!firebaseUser.emailVerified || !firebaseUser.email) return;

    const userRef = doc(db, 'users', firebaseUser.uid);
    try {
      const existingSnap = await getDoc(userRef);
      if (existingSnap.exists()) {
        return;
      }

      const rawPending = localStorage.getItem(
        `${PENDING_SIGNUP_PREFIX}${firebaseUser.uid}`
      );
      let pendingMeta: { fullName?: string; university?: string; studentId?: string } = {};
      if (rawPending) {
        try {
          pendingMeta = JSON.parse(rawPending);
        } catch {
          pendingMeta = {};
        }
      }

      const isBootstrapped =
        firebaseUser.email.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase();

      const profilePayload: Record<string, unknown> = {
        uid: firebaseUser.uid,
        fullName: (
          pendingMeta.fullName ||
          firebaseUser.displayName ||
          firebaseUser.email.split('@')[0] ||
          'CampusLoop Student'
        ).slice(0, 100),
        email: firebaseUser.email.slice(0, 160),
        university: (pendingMeta.university || 'DBS Global University, Dehradun').slice(
          0,
          140
        ),
        role: isBootstrapped ? 'admin' : 'student',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (pendingMeta.studentId && pendingMeta.studentId.trim().length > 0) {
        profilePayload.studentId = pendingMeta.studentId.trim().slice(0, 60);
      }
      if (firebaseUser.photoURL && firebaseUser.photoURL.length <= 500) {
        profilePayload.photoURL = firebaseUser.photoURL;
      }

      await setDoc(userRef, profilePayload);
      localStorage.removeItem(`${PENDING_SIGNUP_PREFIX}${firebaseUser.uid}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${firebaseUser.uid}`);
    }
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setAuthReady(true);
      setLoading(false);
      return;
    }

    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      setUser(firebaseUser);

      if (!firebaseUser) {
        setProfile(null);
        setHasAdminDoc(false);
        setAuthReady(true);
        setLoading(false);
        return;
      }

      try {
        if (firebaseUser.emailVerified) {
          await ensureFirestoreProfile(firebaseUser);
          const adminExists = await checkIsAdminDoc(firebaseUser.uid);
          setHasAdminDoc(adminExists);

          const userRef = doc(db, 'users', firebaseUser.uid);
          unsubscribeProfile = onSnapshot(
            userRef,
            (snap) => {
              if (snap.exists()) {
                setProfile(snap.data() as UserProfile);
              } else {
                setProfile(null);
              }
              setAuthReady(true);
              setLoading(false);
            },
            (err) => {
              console.error('Profile listener error:', err);
              setAuthReady(true);
              setLoading(false);
            }
          );
        } else {
          setProfile(null);
          setHasAdminDoc(false);
          setAuthReady(true);
          setLoading(false);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setAuthReady(true);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, [ensureFirestoreProfile]);

  const isBootstrappedAdmin = Boolean(
    user?.emailVerified &&
      user?.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase()
  );

  const isAdmin = Boolean(
    user?.emailVerified &&
      (isBootstrappedAdmin || hasAdminDoc || profile?.role === 'admin')
  );

  const needsEmailVerification = Boolean(user && !user.emailVerified);

  const signUpWithEmail = async (input: SignUpInput) => {
    const credential = await createUserWithEmailAndPassword(
      auth,
      input.email.trim(),
      input.password
    );
    await updateProfile(credential.user, {
      displayName: input.fullName.trim(),
    });
    localStorage.setItem(
      `${PENDING_SIGNUP_PREFIX}${credential.user.uid}`,
      JSON.stringify({
        fullName: input.fullName.trim(),
        university: input.university.trim(),
        studentId: input.studentId?.trim() || '',
      })
    );

    if (credential.user.emailVerified) {
      await ensureFirestoreProfile(credential.user);
      return { verificationSent: false };
    }

    await sendEmailVerification(credential.user);
    return { verificationSent: true };
  };

  const loginWithEmail = async (
    email: string,
    password: string,
    rememberMe: boolean
  ) => {
    await setPersistence(
      auth,
      rememberMe ? browserLocalPersistence : browserSessionPersistence
    );
    const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
    if (credential.user.emailVerified) {
      await ensureFirestoreProfile(credential.user);
    }
  };

  const loginWithGoogle = async () => {
    await setPersistence(auth, browserLocalPersistence);
    const credential = await signInWithPopup(auth, googleProvider);
    if (credential.user.emailVerified) {
      await ensureFirestoreProfile(credential.user);
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  const resendVerificationEmail = async () => {
    if (!auth.currentUser) {
      throw new Error('No authenticated account found.');
    }
    await sendEmailVerification(auth.currentUser);
  };

  const refreshVerificationStatus = async (): Promise<boolean> => {
    if (!auth.currentUser) return false;
    await auth.currentUser.reload();
    await auth.currentUser.getIdToken(true);
    const refreshed = auth.currentUser;
    if (refreshed.emailVerified) {
      setUser({ ...refreshed } as User);
      await ensureFirestoreProfile(refreshed);
      const snap = await getDoc(doc(db, 'users', refreshed.uid));
      if (snap.exists()) {
        setProfile(snap.data() as UserProfile);
      }
      return true;
    }
    return false;
  };

  const updateUserProfile = async (input: ProfileUpdateInput) => {
    if (!auth.currentUser) throw new Error('Not authenticated');
    const uid = auth.currentUser.uid;
    const updates: Record<string, unknown> = {
      fullName: input.fullName.trim().slice(0, 100),
      university: input.university.trim().slice(0, 140),
      studentId: (input.studentId || '').trim().slice(0, 60),
      updatedAt: serverTimestamp(),
    };
    if (input.photoURL !== undefined) {
      updates.photoURL = input.photoURL.trim().slice(0, 500);
    }

    try {
      await updateDoc(doc(db, 'users', uid), updates);
      await updateProfile(auth.currentUser, {
        displayName: input.fullName.trim(),
        photoURL: input.photoURL || auth.currentUser.photoURL,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  };

  const changeUserPassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    if (!auth.currentUser || !auth.currentUser.email) {
      throw new Error('No authenticated user found.');
    }
    const credential = EmailAuthProvider.credential(
      auth.currentUser.email,
      currentPassword
    );
    await reauthenticateWithCredential(auth.currentUser, credential);
    await updatePassword(auth.currentUser, newPassword);
  };

  const logout = async () => {
    await signOut(auth);
    setProfile(null);
    setHasAdminDoc(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        authReady,
        loading,
        needsEmailVerification,
        signUpWithEmail,
        loginWithEmail,
        loginWithGoogle,
        resetPassword,
        resendVerificationEmail,
        refreshVerificationStatus,
        updateUserProfile,
        changeUserPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
