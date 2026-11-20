import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Loader2, Calendar, MapPin, CheckCircle2, Ticket } from 'lucide-react';
import { createEventRegistration } from '../../lib/firestoreService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import type { EventItem } from '../../types/campusloop';

interface EventRegisterModalProps {
  event: EventItem | null;
  alreadyRegisteredCode?: string;
  onClose: () => void;
}

export function EventRegisterModal({
  event,
  alreadyRegisteredCode,
  onClose,
}: EventRegisterModalProps) {
  const { user, profile } = useAuth();
  const { showToast } = useToast();

  const [studentId, setStudentId] = useState(profile?.studentId || '');
  const [submitting, setSubmitting] = useState(false);
  const [ticketCode, setTicketCode] = useState<string | null>(
    alreadyRegisteredCode || null
  );

  if (!event) return null;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;

    setSubmitting(true);
    try {
      const result = await createEventRegistration({
        userId: user.uid,
        userName: profile?.fullName || user.displayName || 'Student',
        userEmail: profile?.email || user.email,
        studentId: studentId.trim() || undefined,
        event,
      });
      setTicketCode(result.ticketCode);
      showToast(
        'Event registration confirmed',
        'success',
        `Your pass ${result.ticketCode} is saved in My Bookings.`
      );
    } catch (err) {
      showToast(
        'Registration failed',
        'error',
        err instanceof Error ? err.message : 'Unable to register right now.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#252033]/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-register-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-[#EAE6F3] bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#EAE6F3] pb-4">
          <div>
            <p className="text-xs font-medium text-[#673AB7]">
              {event.category} · {event.organizer}
            </p>
            <h2
              id="event-register-title"
              className="mt-1 font-display text-xl font-bold text-[#252033]"
            >
              {event.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close registration modal"
            className="rounded-lg p-1.5 text-[#645D78] hover:bg-[#F3EDFF] hover:text-[#252033]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {ticketCode ? (
          <div className="py-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-[#252033]">
              You’re Registered!
            </h3>
            <p className="mt-1 text-sm text-[#645D78]">
              Present this pass code at {event.venue}.
            </p>
            <div className="mt-5 inline-flex items-center gap-2.5 rounded-xl border border-dashed border-[#673AB7] bg-[#F3EDFF]/60 px-5 py-3">
              <Ticket className="h-5 w-5 text-[#673AB7]" />
              <span className="font-mono text-lg font-bold tracking-wider text-[#45207A]">
                {ticketCode}
              </span>
            </div>
            <p className="mt-3 text-xs text-[#645D78]">
              {event.date} · {event.time}
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Link
                to="/bookings"
                onClick={onClose}
                className="rounded-xl border border-[#EAE6F3] bg-white px-4 py-2.5 text-sm font-medium text-[#252033] hover:bg-[#FAFAFC]"
              >
                View My Registrations
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
          <form onSubmit={handleRegister} className="mt-4 space-y-4">
            <div className="rounded-xl border border-[#EAE6F3] bg-[#FAFAFC] p-4 text-xs text-[#645D78] space-y-1.5">
              <p className="flex items-center gap-2 text-[#252033]">
                <Calendar className="h-3.5 w-3.5 text-[#673AB7]" />
                <span>
                  {event.date} · {event.time}
                </span>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-[#673AB7]" />
                <span>{event.venue}</span>
              </p>
              <p className="pt-1 text-sm font-semibold text-[#252033] tabular-nums">
                Entry Fee: {event.entryFee === 0 ? 'Free for students' : `₹${event.entryFee}`}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-[#645D78]">
                  Attendee Name
                </label>
                <p className="mt-1 rounded-xl border border-[#EAE6F3] bg-[#FAFAFC] px-3.5 py-2.5 text-sm text-[#252033]">
                  {profile?.fullName || user?.displayName || 'Student'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#645D78]">
                  Email
                </label>
                <p className="mt-1 truncate rounded-xl border border-[#EAE6F3] bg-[#FAFAFC] px-3.5 py-2.5 text-sm text-[#252033]">
                  {profile?.email || user?.email}
                </p>
              </div>
            </div>

            <div>
              <label
                htmlFor="reg-student-id"
                className="block text-sm font-medium text-[#252033]"
              >
                University Student ID{' '}
                <span className="font-normal text-[#645D78]">(Optional)</span>
              </label>
              <input
                id="reg-student-id"
                type="text"
                maxLength={60}
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. DBS-2026-0412"
                className="mt-1.5 w-full rounded-xl border border-[#EAE6F3] bg-white px-4 py-2.5 text-sm text-[#252033] placeholder:text-[#9890AA] focus:border-[#673AB7] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[#EAE6F3] bg-white px-4 py-2.5 text-sm font-medium text-[#252033] hover:bg-[#FAFAFC]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-[#673AB7] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#45207A] disabled:opacity-60"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Complete Registration
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
