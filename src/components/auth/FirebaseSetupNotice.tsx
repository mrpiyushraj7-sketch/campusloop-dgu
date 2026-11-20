import { ShieldAlert } from 'lucide-react';
import { BrandLogo } from '../ui/BrandLogo';

export function FirebaseSetupNotice() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFC] p-6">
      <div className="w-full max-w-xl rounded-2xl border border-[#EAE6F3] bg-white p-8 shadow-sm">
        <BrandLogo />
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-sm text-amber-900">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
          <div>
            <p className="font-semibold">Firebase configuration required</p>
            <p className="mt-1 text-xs leading-relaxed text-amber-800">
              CampusLoop uses live Firebase Authentication and Cloud Firestore and never
              simulates logins. Complete the Firebase setup below to launch the app.
            </p>
          </div>
        </div>

        <ol className="mt-6 space-y-3 text-sm text-[#252033]">
          <li>
            <span className="font-semibold">1.</span> Ensure{' '}
            <code className="rounded bg-[#F3EDFF] px-1.5 py-0.5 font-mono text-xs text-[#45207A]">
              firebase-applet-config.json
            </code>{' '}
            contains valid <code className="font-mono text-xs">apiKey</code>,{' '}
            <code className="font-mono text-xs">projectId</code>,{' '}
            <code className="font-mono text-xs">appId</code>, and{' '}
            <code className="font-mono text-xs">firestoreDatabaseId</code>.
          </li>
          <li>
            <span className="font-semibold">2.</span> In Firebase Console, enable{' '}
            <strong>Google</strong> and <strong>Email/Password</strong> under{' '}
            <em>Authentication → Sign-in method</em>.
          </li>
          <li>
            <span className="font-semibold">3.</span> Deploy{' '}
            <code className="rounded bg-[#F3EDFF] px-1.5 py-0.5 font-mono text-xs text-[#45207A]">
              firestore.rules
            </code>{' '}
            to your Firestore database and reload this page.
          </li>
        </ol>
      </div>
    </div>
  );
}
