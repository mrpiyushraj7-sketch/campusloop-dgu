import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, CheckCircle2, Copy, Check, Loader2, Calendar } from 'lucide-react';
import { MediaImage } from '../ui/MediaImage';
import { createOfferRedemption } from '../../lib/firestoreService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import type { Offer } from '../../types/campusloop';

interface OfferRedeemModalProps {
  offer: Offer | null;
  onClose: () => void;
}

export function OfferRedeemModal({ offer, onClose }: OfferRedeemModalProps) {
  const { user, profile } = useAuth();
  const { showToast } = useToast();

  const [submitting, setSubmitting] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!offer) return null;

  const handleRedeem = async () => {
    if (!user || !user.email) return;
    setSubmitting(true);
    try {
      const { code } = await createOfferRedemption({
        userId: user.uid,
        userName: profile?.fullName || user.displayName || 'Student',
        userEmail: profile?.email || user.email,
        offer,
      });
      setGeneratedCode(code);
      showToast(
        'Offer redeemed successfully',
        'success',
        `Your code ${code} has been saved to My Bookings.`
      );
    } catch (err) {
      showToast(
        'Redemption failed',
        'error',
        err instanceof Error ? err.message : 'Unable to save redemption record.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedCode) return;
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      showToast('Code copied to clipboard', 'info');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Copy manually from the code box', 'info');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#252033]/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="offer-redeem-title"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#EAE6F3] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#F3EDFF]">
          <MediaImage
            src={offer.imageUrl}
            alt={offer.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A132B]/80 via-transparent to-black/20" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close offer modal"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 text-[#252033] hover:bg-white"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="absolute bottom-4 left-6 right-6 text-white">
            <p className="text-xs font-semibold text-[#E3D5FF]">
              {offer.discountLabel} · {offer.businessName}
            </p>
            <h2
              id="offer-redeem-title"
              className="mt-1 font-display text-xl font-bold leading-snug"
            >
              {offer.title}
            </h2>
          </div>
        </div>

        <div className="p-6">
          {generatedCode ? (
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-[#252033]">
                Redemption Code Generated
              </h3>
              <p className="mt-1.5 text-sm text-[#645D78]">
                Show this code along with your university ID at{' '}
                <span className="font-medium text-[#252033]">{offer.businessName}</span>.
              </p>

              <div className="mt-5 flex items-center justify-between rounded-xl border border-dashed border-[#673AB7] bg-[#F3EDFF]/60 px-4 py-3.5">
                <span className="font-mono text-xl font-bold tracking-wider text-[#45207A]">
                  {generatedCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-[#45207A] shadow-xs transition-colors hover:bg-[#F3EDFF]"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </>
                  )}
                </button>
              </div>

              <p className="mt-3 text-xs text-[#645D78]">
                Saved to your account · Valid until {offer.validUntil}
              </p>

              <div className="mt-6 flex items-center justify-center gap-3">
                <Link
                  to="/bookings"
                  onClick={onClose}
                  className="rounded-xl border border-[#EAE6F3] bg-white px-4 py-2.5 text-sm font-medium text-[#252033] hover:bg-[#FAFAFC]"
                >
                  View in My Bookings
                </Link>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl bg-[#673AB7] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#45207A]"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 text-xs text-[#645D78]">
                <Calendar className="h-3.5 w-3.5 text-[#673AB7]" />
                <span>Valid until {offer.validUntil}</span>
                <span>·</span>
                <span>{offer.category}</span>
                {offer.isSampleData && (
                  <>
                    <span>·</span>
                    <span>Sample demo offer</span>
                  </>
                )}
              </div>

              <p className="mt-4 text-sm leading-relaxed text-[#47415A]">
                {offer.description}
              </p>

              <div className="mt-5 rounded-xl border border-[#EAE6F3] bg-[#FAFAFC] p-4">
                <p className="text-xs font-semibold text-[#252033]">
                  Terms & Conditions
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-[#645D78]">
                  {offer.terms}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-[#EAE6F3] bg-white px-4 py-2.5 text-sm font-medium text-[#252033] hover:bg-[#FAFAFC]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRedeem}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#673AB7] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#45207A] disabled:opacity-60"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Generate Redemption Code
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
