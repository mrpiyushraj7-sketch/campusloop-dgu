import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookmarkCheck,
  Calendar,
  Copy,
  Check,
  XCircle,
  CheckCircle2,
  Clock,
  Ticket,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import {
  updateBookingStatus,
  updateEventRegistrationStatus,
  updateRedemptionStatus,
} from '../lib/firestoreService';
import { EmptyState } from '../components/ui/States';

type TabKey = 'services' | 'events' | 'offers';

function StatusLabel({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Pending: 'text-amber-700',
    Confirmed: 'text-emerald-700',
    Completed: 'text-[#45207A]',
    Active: 'text-emerald-700',
    Used: 'text-[#645D78]',
    Expired: 'text-[#645D78]',
    Cancelled: 'text-red-700',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${styles[status] || 'text-[#252033]'}`}>
      {status === 'Confirmed' || status === 'Active' || status === 'Completed' ? (
        <CheckCircle2 className="h-3.5 w-3.5" />
      ) : status === 'Cancelled' ? (
        <XCircle className="h-3.5 w-3.5" />
      ) : (
        <Clock className="h-3.5 w-3.5" />
      )}
      {status}
    </span>
  );
}

export function BookingsPage() {
  const { myBookings, myEventRegistrations, myRedemptions } = useData();
  const { showToast, confirm } = useToast();

  const [activeTab, setActiveTab] = useState<TabKey>('services');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const handleCancelBooking = async (bookingId: string, title: string) => {
    const ok = await confirm({
      title: 'Cancel service booking?',
      message: `Are you sure you want to cancel your booking for "${title}"? Cancelled bookings cannot be reopened.`,
      confirmLabel: 'Cancel Booking',
      destructive: true,
    });
    if (!ok) return;

    setBusyId(bookingId);
    try {
      await updateBookingStatus(bookingId, 'Cancelled');
      showToast('Booking cancelled', 'info');
    } catch {
      showToast('Failed to cancel booking', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleCancelRegistration = async (regId: string, eventName: string) => {
    const ok = await confirm({
      title: 'Cancel event registration?',
      message: `Release your seat for "${eventName}"? Your ticket code will be marked cancelled.`,
      confirmLabel: 'Cancel Registration',
      destructive: true,
    });
    if (!ok) return;

    setBusyId(regId);
    try {
      await updateEventRegistrationStatus(regId, 'Cancelled');
      showToast('Event registration cancelled', 'info');
    } catch {
      showToast('Failed to cancel registration', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleMarkOfferUsed = async (redId: string, code: string) => {
    const ok = await confirm({
      title: 'Mark redemption code as used?',
      message: `Confirm that you have presented code ${code} at the partner outlet.`,
      confirmLabel: 'Mark as Used',
    });
    if (!ok) return;

    setBusyId(redId);
    try {
      await updateRedemptionStatus(redId, 'Used');
      showToast('Redemption marked as used', 'success');
    } catch {
      showToast('Failed to update redemption', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleCopyCode = async (id: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      showToast(`Copied ${code}`, 'info');
      window.setTimeout(() => setCopiedId(null), 1800);
    } catch {
      showToast('Please copy the code manually', 'info');
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-[#252033] sm:text-3xl">
          My Bookings & Passes
        </h1>
        <p className="mt-1 text-sm text-[#645D78]">
          Track your service appointments, campus event tickets, and redeemed student discount codes.
        </p>
      </div>

      {/* Segmented Tabs */}
      <div className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-[#EAE6F3] bg-white p-1">
        <button
          type="button"
          onClick={() => setActiveTab('services')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'services'
              ? 'bg-[#673AB7] text-white'
              : 'text-[#544D68] hover:text-[#252033]'
          }`}
        >
          Service Bookings ({myBookings.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('events')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'events'
              ? 'bg-[#673AB7] text-white'
              : 'text-[#544D68] hover:text-[#252033]'
          }`}
        >
          Event Registrations ({myEventRegistrations.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('offers')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'offers'
              ? 'bg-[#673AB7] text-white'
              : 'text-[#544D68] hover:text-[#252033]'
          }`}
        >
          Redeemed Offers ({myRedemptions.length})
        </button>
      </div>

      {/* Tab 1: Service Bookings */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          {myBookings.length === 0 ? (
            <EmptyState
              icon={<BookmarkCheck className="h-6 w-6" />}
              title="No service bookings yet"
              description="Book laundry pickups, thesis printing, haircuts, or airport shuttles from the Services marketplace."
              action={
                <Link
                  to="/services"
                  className="inline-flex rounded-xl bg-[#673AB7] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#45207A]"
                >
                  Browse Services
                </Link>
              }
            />
          ) : (
            <div className="divide-y divide-[#EAE6F3] overflow-hidden rounded-2xl border border-[#EAE6F3] bg-white">
              {myBookings.map((bk) => (
                <div
                  key={bk.id}
                  className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#645D78]">
                      <span>{bk.category}</span>
                      <span>·</span>
                      <span>{bk.providerName}</span>
                      <span>·</span>
                      <StatusLabel status={bk.status} />
                    </div>
                    <h2 className="font-display text-base font-bold text-[#252033]">
                      {bk.serviceTitle}
                    </h2>
                    <p className="flex items-center gap-1.5 text-xs text-[#645D78] tabular-nums">
                      <Calendar className="h-3.5 w-3.5 text-[#673AB7]" />
                      {bk.bookingDate} · {bk.timeSlot}
                    </p>
                    {bk.notes && (
                      <p className="text-xs text-[#645D78]">Notes: {bk.notes}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <span className="font-display text-base font-bold tabular-nums text-[#252033]">
                      ₹{bk.price}
                    </span>
                    {(bk.status === 'Pending' || bk.status === 'Confirmed') && (
                      <button
                        type="button"
                        disabled={busyId === bk.id}
                        onClick={() => handleCancelBooking(bk.id, bk.serviceTitle)}
                        className="rounded-xl border border-red-200 bg-white px-3.5 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 whitespace-nowrap"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Event Registrations */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          {myEventRegistrations.length === 0 ? (
            <EmptyState
              icon={<Ticket className="h-6 w-6" />}
              title="No event registrations yet"
              description="Explore upcoming college concerts, startup demo days, and weekend workshops."
              action={
                <Link
                  to="/events"
                  className="inline-flex rounded-xl bg-[#673AB7] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#45207A]"
                >
                  Explore Events
                </Link>
              }
            />
          ) : (
            <div className="divide-y divide-[#EAE6F3] overflow-hidden rounded-2xl border border-[#EAE6F3] bg-white">
              {myEventRegistrations.map((reg) => (
                <div
                  key={reg.id}
                  className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#645D78]">
                      <span className="tabular-nums">
                        {reg.eventDate} · {reg.eventTime}
                      </span>
                      <span>·</span>
                      <StatusLabel status={reg.status} />
                    </div>
                    <h2 className="font-display text-base font-bold text-[#252033]">
                      {reg.eventName}
                    </h2>
                    <p className="text-xs text-[#645D78]">
                      Venue: {reg.venue} ·{' '}
                      {reg.entryFee === 0 ? 'Free Entry' : `₹${reg.entryFee}`}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleCopyCode(reg.id, reg.ticketCode)}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#EAE6F3] bg-[#F3EDFF]/60 px-3.5 py-2 font-mono text-xs font-bold text-[#45207A] hover:bg-[#F3EDFF]"
                    >
                      {reg.ticketCode}
                      {copiedId === reg.id ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                    {reg.status === 'Confirmed' && (
                      <button
                        type="button"
                        disabled={busyId === reg.id}
                        onClick={() => handleCancelRegistration(reg.id, reg.eventName)}
                        className="rounded-xl border border-red-200 bg-white px-3.5 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 whitespace-nowrap"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Redeemed Offers */}
      {activeTab === 'offers' && (
        <div className="space-y-4">
          {myRedemptions.length === 0 ? (
            <EmptyState
              icon={<BookmarkCheck className="h-6 w-6" />}
              title="No redeemed offers yet"
              description="Generate a student discount code from the Exclusive Offers page and it will appear right here."
              action={
                <Link
                  to="/offers"
                  className="inline-flex rounded-xl bg-[#673AB7] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#45207A]"
                >
                  Browse Exclusive Offers
                </Link>
              }
            />
          ) : (
            <div className="divide-y divide-[#EAE6F3] overflow-hidden rounded-2xl border border-[#EAE6F3] bg-white">
              {myRedemptions.map((red) => (
                <div
                  key={red.id}
                  className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#645D78]">
                      <span className="font-semibold text-[#673AB7]">
                        {red.discountLabel}
                      </span>
                      <span>·</span>
                      <span>{red.businessName}</span>
                      <span>·</span>
                      <StatusLabel status={red.status} />
                    </div>
                    <h2 className="font-display text-base font-bold text-[#252033]">
                      {red.offerTitle}
                    </h2>
                    <p className="text-xs text-[#645D78] tabular-nums">
                      Valid until {red.validUntil}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleCopyCode(red.id, red.code)}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#EAE6F3] bg-[#F3EDFF]/60 px-3.5 py-2 font-mono text-xs font-bold text-[#45207A] hover:bg-[#F3EDFF]"
                    >
                      {red.code}
                      {copiedId === red.id ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                    {red.status === 'Active' && (
                      <button
                        type="button"
                        disabled={busyId === red.id}
                        onClick={() => handleMarkOfferUsed(red.id, red.code)}
                        className="rounded-xl border border-[#EAE6F3] bg-white px-3.5 py-2 text-xs font-semibold text-[#252033] transition-colors hover:bg-[#FAFAFC] disabled:opacity-50 whitespace-nowrap"
                      >
                        Mark as Used
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
