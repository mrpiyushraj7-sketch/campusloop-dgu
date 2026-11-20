import React, { useState } from 'react';
import { X, Loader2, MapPin, Phone, Calendar } from 'lucide-react';
import { createServiceBooking } from '../../lib/firestoreService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import type { ServiceItem } from '../../types/campusloop';

interface ServiceBookingModalProps {
  service: ServiceItem | null;
  onClose: () => void;
}

const TIME_SLOTS = [
  '9:00 AM – 11:00 AM',
  '11:00 AM – 1:00 PM',
  '2:00 PM – 4:00 PM',
  '4:00 PM – 6:00 PM',
  '6:00 PM – 8:00 PM',
];

export function ServiceBookingModal({ service, onClose }: ServiceBookingModalProps) {
  const { user, profile } = useAuth();
  const { showToast } = useToast();

  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [bookingDate, setBookingDate] = useState(tomorrow);
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!service) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;
    if (!bookingDate) {
      showToast('Please select a booking date', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await createServiceBooking({
        userId: user.uid,
        userName: profile?.fullName || user.displayName || 'Student',
        userEmail: profile?.email || user.email,
        service,
        bookingDate,
        timeSlot,
        notes,
      });
      showToast(
        'Service booking requested',
        'success',
        `${service.title} on ${bookingDate} (${timeSlot}) is now Pending confirmation.`
      );
      onClose();
    } catch (err) {
      showToast(
        'Could not submit booking',
        'error',
        err instanceof Error ? err.message : 'Please try again.'
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
      aria-labelledby="service-booking-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-[#EAE6F3] bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#EAE6F3] pb-4">
          <div>
            <p className="text-xs font-medium text-[#673AB7]">
              {service.category} · {service.providerName}
            </p>
            <h2
              id="service-booking-title"
              className="mt-1 font-display text-xl font-bold text-[#252033]"
            >
              Book {service.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close booking form"
            className="rounded-lg p-1.5 text-[#645D78] hover:bg-[#F3EDFF] hover:text-[#252033]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#FAFAFC] px-4 py-3 text-xs text-[#645D78] border border-[#EAE6F3]">
          <div className="space-y-1">
            <p className="flex items-center gap-1.5 text-[#252033]">
              <MapPin className="h-3.5 w-3.5 text-[#673AB7]" />
              {service.location}
            </p>
            <p className="flex items-center gap-1.5 tabular-nums">
              <Phone className="h-3.5 w-3.5 text-[#673AB7]" />
              {service.contactPhone}
            </p>
          </div>
          <div className="text-right">
            <p className="text-base font-bold tabular-nums text-[#252033]">
              ₹{service.price}
            </p>
            <p className="text-[11px] text-[#645D78]">{service.priceUnit}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="booking-date"
              className="block text-sm font-medium text-[#252033]"
            >
              Preferred Date
            </label>
            <div className="relative mt-1.5">
              <Calendar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#645D78]" />
              <input
                id="booking-date"
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full rounded-xl border border-[#EAE6F3] bg-white py-2.5 pl-10 pr-4 text-sm text-[#252033] focus:border-[#673AB7] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="booking-slot"
              className="block text-sm font-medium text-[#252033]"
            >
              Preferred Time Slot
            </label>
            <select
              id="booking-slot"
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#EAE6F3] bg-white px-4 py-2.5 text-sm text-[#252033] focus:border-[#673AB7] focus:outline-none"
            >
              {TIME_SLOTS.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="booking-notes"
              className="block text-sm font-medium text-[#252033]"
            >
              Hostel / Pickup Instructions{' '}
              <span className="font-normal text-[#645D78]">(Optional)</span>
            </label>
            <textarea
              id="booking-notes"
              rows={3}
              maxLength={500}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. DBS Boys Hostel Block B, Gate 2 pickup or specific styling/printing notes"
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
              Confirm Booking Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
