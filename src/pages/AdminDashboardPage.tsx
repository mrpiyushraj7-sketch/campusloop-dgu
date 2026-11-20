import React, { useState } from 'react';
import {
  Database,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import {
  seedDemoCatalog,
  saveBusiness,
  deleteBusiness,
  saveOffer,
  deleteOffer,
  saveService,
  deleteService,
  saveEvent,
  deleteEvent,
  updateBookingStatus,
  updatePartnerApplicationStatus,
} from '../lib/firestoreService';
import { IMAGE_PRESET_OPTIONS, CAMPUSLOOP_IMAGES } from '../data/assets';
import {
  BUSINESS_CATEGORIES,
  OFFER_CATEGORIES,
  SERVICE_CATEGORIES,
  EVENT_CATEGORIES,
  DEHRADUN_AREAS,
  type Business,
  type Offer,
  type ServiceItem,
  type EventItem,
  type PartnerApplication,
  type BusinessCategory,
  type OfferCategory,
  type ServiceCategory,
  type EventCategory,
  type PriceRange,
  type BookingStatus,
} from '../types/campusloop';

type AdminTab =
  | 'businesses'
  | 'offers'
  | 'services'
  | 'events'
  | 'applications'
  | 'bookings'
  | 'students';

export function AdminDashboardPage() {
  const {
    businesses,
    offers,
    services,
    events,
    allUsers,
    allBookings,
    allEventRegistrations,
    allPartnerApplications,
  } = useData();
  const { showToast, confirm } = useToast();

  const [activeTab, setActiveTab] = useState<AdminTab>('businesses');
  const [seeding, setSeeding] = useState(false);

  // Modal editor states
  const [editingBusiness, setEditingBusiness] = useState<Partial<Business> | null>(null);
  const [editingOffer, setEditingOffer] = useState<Partial<Offer> | null>(null);
  const [editingService, setEditingService] = useState<Partial<ServiceItem> | null>(null);
  const [editingEvent, setEditingEvent] = useState<Partial<EventItem> | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSeed = async () => {
    const ok = await confirm({
      title: 'Seed Dehradun demonstration data?',
      message:
        'This adds clearly marked sample Dehradun businesses, offers, student services, and events into Firestore. Existing custom records will not be removed.',
      confirmLabel: 'Seed Demo Data',
    });
    if (!ok) return;

    setSeeding(true);
    try {
      const counts = await seedDemoCatalog();
      showToast(
        'Demo catalog seeded',
        'success',
        `Loaded ${counts.businesses} businesses, ${counts.offers} offers, ${counts.services} services, and ${counts.events} events.`
      );
    } catch (err) {
      showToast(
        'Seeding failed',
        'error',
        err instanceof Error ? err.message : 'Unable to seed data.'
      );
    } finally {
      setSeeding(false);
    }
  };

  // --- Save Handlers ---
  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBusiness) return;
    setSaving(true);
    try {
      await saveBusiness(
        {
          name: editingBusiness.name || '',
          category: (editingBusiness.category as BusinessCategory) || 'Food & Cafés',
          cuisine: editingBusiness.cuisine || undefined,
          location: editingBusiness.location || '',
          area: editingBusiness.area || 'Selaqui / DBS Campus',
          priceRange: (editingBusiness.priceRange as PriceRange) || '₹₹',
          description: editingBusiness.description || '',
          studentDiscount: editingBusiness.studentDiscount || '',
          rating: editingBusiness.rating ? Number(editingBusiness.rating) : undefined,
          imageUrl: editingBusiness.imageUrl || CAMPUSLOOP_IMAGES.cafeArtisan,
          phone: editingBusiness.phone || undefined,
          hours: editingBusiness.hours || undefined,
          isFeatured: Boolean(editingBusiness.isFeatured),
          isPopular: Boolean(editingBusiness.isPopular),
          isRecommended: Boolean(editingBusiness.isRecommended),
          isSampleData: Boolean(editingBusiness.isSampleData),
          status: editingBusiness.status || 'active',
        },
        editingBusiness.id
      );
      showToast(
        editingBusiness.id ? 'Business updated' : 'Business created',
        'success'
      );
      setEditingBusiness(null);
    } catch (err) {
      showToast(
        'Failed to save business',
        'error',
        err instanceof Error ? err.message : 'Check required fields.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOffer) return;
    setSaving(true);
    try {
      const pct = Number(editingOffer.discountPercentage || 15);
      await saveOffer(
        {
          businessId: editingOffer.businessId || undefined,
          businessName: editingOffer.businessName || '',
          title: editingOffer.title || '',
          category: (editingOffer.category as OfferCategory) || 'Café Offers',
          discountPercentage: pct,
          discountLabel: editingOffer.discountLabel || `${pct}% OFF`,
          description: editingOffer.description || '',
          validUntil: editingOffer.validUntil || '2027-03-31',
          terms: editingOffer.terms || 'Valid with university student ID.',
          imageUrl: editingOffer.imageUrl || CAMPUSLOOP_IMAGES.cafeArtisan,
          isFeatured: Boolean(editingOffer.isFeatured),
          isSampleData: Boolean(editingOffer.isSampleData),
          status: editingOffer.status || 'active',
        },
        editingOffer.id
      );
      showToast(editingOffer.id ? 'Offer updated' : 'Offer created', 'success');
      setEditingOffer(null);
    } catch (err) {
      showToast(
        'Failed to save offer',
        'error',
        err instanceof Error ? err.message : 'Check required fields.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    setSaving(true);
    try {
      await saveService(
        {
          providerName: editingService.providerName || '',
          title: editingService.title || '',
          category: (editingService.category as ServiceCategory) || 'Laundry',
          description: editingService.description || '',
          price: Number(editingService.price || 0),
          priceUnit: editingService.priceUnit || 'per session',
          location: editingService.location || '',
          contactPhone: editingService.contactPhone || '',
          contactEmail: editingService.contactEmail || undefined,
          imageUrl: editingService.imageUrl || CAMPUSLOOP_IMAGES.serviceEssentials,
          isSampleData: Boolean(editingService.isSampleData),
          status: editingService.status || 'active',
        },
        editingService.id
      );
      showToast(editingService.id ? 'Service updated' : 'Service created', 'success');
      setEditingService(null);
    } catch (err) {
      showToast(
        'Failed to save service',
        'error',
        err instanceof Error ? err.message : 'Check required fields.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    setSaving(true);
    try {
      await saveEvent(
        {
          name: editingEvent.name || '',
          category: (editingEvent.category as EventCategory) || 'College Events',
          date: editingEvent.date || '2026-12-15',
          time: editingEvent.time || '5:00 PM – 8:00 PM',
          venue: editingEvent.venue || '',
          entryFee: Number(editingEvent.entryFee || 0),
          capacity: Number(editingEvent.capacity || 100),
          organizer: editingEvent.organizer || '',
          description: editingEvent.description || '',
          imageUrl: editingEvent.imageUrl || CAMPUSLOOP_IMAGES.eventMusic,
          isSampleData: Boolean(editingEvent.isSampleData),
          status: editingEvent.status || 'active',
        },
        editingEvent.id
      );
      showToast(editingEvent.id ? 'Event updated' : 'Event created', 'success');
      setEditingEvent(null);
    } catch (err) {
      showToast(
        'Failed to save event',
        'error',
        err instanceof Error ? err.message : 'Check required fields.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleApprovePartner = async (app: PartnerApplication) => {
    const ok = await confirm({
      title: `Approve "${app.businessName}"?`,
      message:
        'Approving this application marks it Approved and publishes the business live in the CampusLoop marketplace.',
      confirmLabel: 'Approve & Publish',
    });
    if (!ok) return;

    try {
      await updatePartnerApplicationStatus(app.id, 'Approved');
      await saveBusiness({
        name: app.businessName,
        category: app.category,
        location: app.address,
        area: 'Selaqui / DBS Campus',
        priceRange: '₹₹',
        description: app.description,
        studentDiscount: app.proposedDiscount,
        imageUrl: app.imageUrl || CAMPUSLOOP_IMAGES.cafeArtisan,
        phone: app.contactNumber,
        isFeatured: false,
        isPopular: true,
        isRecommended: true,
        isSampleData: false,
        status: 'active',
      });
      showToast('Partner approved and published live', 'success');
    } catch (err) {
      showToast(
        'Approval failed',
        'error',
        err instanceof Error ? err.message : 'Could not update application.'
      );
    }
  };

  const handleRejectPartner = async (app: PartnerApplication) => {
    const ok = await confirm({
      title: `Reject "${app.businessName}"?`,
      message: 'This application will be marked as Rejected.',
      confirmLabel: 'Reject',
      destructive: true,
    });
    if (!ok) return;

    try {
      await updatePartnerApplicationStatus(app.id, 'Rejected');
      showToast('Application marked rejected', 'info');
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  const handleBookingStatusChange = async (bookingId: string, status: BookingStatus) => {
    try {
      await updateBookingStatus(bookingId, status);
      showToast(`Booking status updated to ${status}`, 'success');
    } catch {
      showToast('Failed to update booking status', 'error');
    }
  };

  const metrics = [
    { label: 'Registered Students', value: allUsers.length },
    { label: 'Total Businesses', value: businesses.length },
    { label: 'Exclusive Offers', value: offers.length },
    { label: 'Service Bookings', value: allBookings.length },
    { label: 'Event Registrations', value: allEventRegistrations.length },
  ];

  const pendingAppsCount = allPartnerApplications.filter(
    (a) => a.status === 'Pending'
  ).length;

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#673AB7]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Role-Based Admin Console
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-[#252033] sm:text-3xl">
            CampusLoop Administration
          </h1>
          <p className="mt-1 text-sm text-[#645D78]">
            Manage Dehradun listings, exclusive student offers, partner applications, and bookings.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSeed}
          disabled={seeding}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-[#EAE6F3] bg-white px-4 py-2.5 text-sm font-semibold text-[#45207A] transition-colors hover:bg-[#F3EDFF] disabled:opacity-60 sm:self-auto whitespace-nowrap"
        >
          {seeding ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Database className="h-4 w-4" />
          )}
          Seed Demo Data
        </button>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="rounded-2xl border border-[#EAE6F3] bg-white p-5"
          >
            <p className="text-xs font-medium text-[#645D78]">{m.label}</p>
            <p className="mt-2 font-display text-2xl font-bold tabular-nums text-[#252033]">
              {m.value}
            </p>
          </div>
        ))}
      </div>

      {/* Section Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-[#EAE6F3] bg-white p-1.5">
        {(
          [
            { key: 'businesses', label: `Businesses (${businesses.length})` },
            { key: 'offers', label: `Offers (${offers.length})` },
            { key: 'services', label: `Services (${services.length})` },
            { key: 'events', label: `Events (${events.length})` },
            {
              key: 'applications',
              label: `Applications (${pendingAppsCount} pending)`,
            },
            { key: 'bookings', label: `Bookings (${allBookings.length})` },
            {
              key: 'students',
              label: `Students & Event Passes (${allUsers.length})`,
            },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              activeTab === tab.key
                ? 'bg-[#673AB7] text-white'
                : 'text-[#544D68] hover:bg-[#FAFAFC] hover:text-[#252033]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: BUSINESSES */}
      {activeTab === 'businesses' && (
        <section className="overflow-hidden rounded-2xl border border-[#EAE6F3] bg-white">
          <div className="flex items-center justify-between border-b border-[#EAE6F3] px-5 py-4">
            <h2 className="font-display text-base font-bold text-[#252033]">
              Businesses Directory
            </h2>
            <button
              type="button"
              onClick={() =>
                setEditingBusiness({
                  category: 'Food & Cafés',
                  area: 'Selaqui / DBS Campus',
                  priceRange: '₹₹',
                  imageUrl: CAMPUSLOOP_IMAGES.cafeArtisan,
                  isFeatured: false,
                  isPopular: true,
                  isRecommended: true,
                  isSampleData: false,
                  status: 'active',
                })
              }
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#673AB7] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#45207A]"
            >
              <Plus className="h-4 w-4" />
              Add Business
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#EAE6F3] bg-[#FAFAFC] text-xs text-[#645D78]">
                <tr>
                  <th className="px-5 py-3 font-semibold">Business</th>
                  <th className="px-5 py-3 font-semibold">Category</th>
                  <th className="px-5 py-3 font-semibold">Area</th>
                  <th className="px-5 py-3 font-semibold">Student Discount</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE6F3]">
                {businesses.map((biz) => (
                  <tr key={biz.id} className="hover:bg-[#FAFAFC]">
                    <td className="px-5 py-3.5 font-medium text-[#252033]">
                      {biz.name}
                      {biz.isSampleData && (
                        <span className="ml-2 text-xs font-normal text-[#645D78]">
                          (Sample)
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-[#544D68]">{biz.category}</td>
                    <td className="px-5 py-3.5 text-[#544D68]">{biz.area}</td>
                    <td className="max-w-xs truncate px-5 py-3.5 text-[#45207A]">
                      {biz.studentDiscount}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setEditingBusiness(biz)}
                        aria-label={`Edit ${biz.name}`}
                        className="rounded-lg p-1.5 text-[#544D68] hover:bg-[#F3EDFF] hover:text-[#45207A]"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const ok = await confirm({
                            title: `Delete "${biz.name}"?`,
                            message: 'This permanently removes the listing from Firestore.',
                            confirmLabel: 'Delete',
                            destructive: true,
                          });
                          if (ok) {
                            await deleteBusiness(biz.id);
                            showToast('Business deleted', 'info');
                          }
                        }}
                        aria-label={`Delete ${biz.name}`}
                        className="ml-1 rounded-lg p-1.5 text-[#544D68] hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB: OFFERS */}
      {activeTab === 'offers' && (
        <section className="overflow-hidden rounded-2xl border border-[#EAE6F3] bg-white">
          <div className="flex items-center justify-between border-b border-[#EAE6F3] px-5 py-4">
            <h2 className="font-display text-base font-bold text-[#252033]">
              Exclusive Student Offers
            </h2>
            <button
              type="button"
              onClick={() =>
                setEditingOffer({
                  category: 'Café Offers',
                  discountPercentage: 20,
                  discountLabel: '20% OFF',
                  validUntil: '2027-03-31',
                  imageUrl: CAMPUSLOOP_IMAGES.cafeArtisan,
                  isFeatured: true,
                  isSampleData: false,
                  status: 'active',
                })
              }
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#673AB7] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#45207A]"
            >
              <Plus className="h-4 w-4" />
              Create Offer
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#EAE6F3] bg-[#FAFAFC] text-xs text-[#645D78]">
                <tr>
                  <th className="px-5 py-3 font-semibold">Offer Title</th>
                  <th className="px-5 py-3 font-semibold">Business</th>
                  <th className="px-5 py-3 font-semibold">Discount</th>
                  <th className="px-5 py-3 font-semibold">Valid Until</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE6F3]">
                {offers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-[#FAFAFC]">
                    <td className="px-5 py-3.5 font-medium text-[#252033]">
                      {offer.title}
                    </td>
                    <td className="px-5 py-3.5 text-[#544D68]">{offer.businessName}</td>
                    <td className="px-5 py-3.5 font-semibold tabular-nums text-[#673AB7]">
                      {offer.discountLabel}
                    </td>
                    <td className="px-5 py-3.5 tabular-nums text-[#544D68]">
                      {offer.validUntil}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setEditingOffer(offer)}
                        className="rounded-lg p-1.5 text-[#544D68] hover:bg-[#F3EDFF] hover:text-[#45207A]"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const ok = await confirm({
                            title: `Delete "${offer.title}"?`,
                            message: 'Students will no longer be able to redeem this offer.',
                            confirmLabel: 'Delete',
                            destructive: true,
                          });
                          if (ok) {
                            await deleteOffer(offer.id);
                            showToast('Offer deleted', 'info');
                          }
                        }}
                        className="ml-1 rounded-lg p-1.5 text-[#544D68] hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB: SERVICES */}
      {activeTab === 'services' && (
        <section className="overflow-hidden rounded-2xl border border-[#EAE6F3] bg-white">
          <div className="flex items-center justify-between border-b border-[#EAE6F3] px-5 py-4">
            <h2 className="font-display text-base font-bold text-[#252033]">
              Local Student Services
            </h2>
            <button
              type="button"
              onClick={() =>
                setEditingService({
                  category: 'Laundry',
                  price: 199,
                  priceUnit: 'per order',
                  imageUrl: CAMPUSLOOP_IMAGES.serviceEssentials,
                  isSampleData: false,
                  status: 'active',
                })
              }
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#673AB7] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#45207A]"
            >
              <Plus className="h-4 w-4" />
              Add Service
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#EAE6F3] bg-[#FAFAFC] text-xs text-[#645D78]">
                <tr>
                  <th className="px-5 py-3 font-semibold">Service</th>
                  <th className="px-5 py-3 font-semibold">Provider</th>
                  <th className="px-5 py-3 font-semibold">Category</th>
                  <th className="px-5 py-3 text-right font-semibold">Price</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE6F3]">
                {services.map((svc) => (
                  <tr key={svc.id} className="hover:bg-[#FAFAFC]">
                    <td className="px-5 py-3.5 font-medium text-[#252033]">{svc.title}</td>
                    <td className="px-5 py-3.5 text-[#544D68]">{svc.providerName}</td>
                    <td className="px-5 py-3.5 text-[#544D68]">{svc.category}</td>
                    <td className="px-5 py-3.5 text-right font-semibold tabular-nums text-[#252033]">
                      ₹{svc.price}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setEditingService(svc)}
                        className="rounded-lg p-1.5 text-[#544D68] hover:bg-[#F3EDFF] hover:text-[#45207A]"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const ok = await confirm({
                            title: `Delete "${svc.title}"?`,
                            message: 'This removes the service from the marketplace.',
                            confirmLabel: 'Delete',
                            destructive: true,
                          });
                          if (ok) {
                            await deleteService(svc.id);
                            showToast('Service deleted', 'info');
                          }
                        }}
                        className="ml-1 rounded-lg p-1.5 text-[#544D68] hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB: EVENTS */}
      {activeTab === 'events' && (
        <section className="overflow-hidden rounded-2xl border border-[#EAE6F3] bg-white">
          <div className="flex items-center justify-between border-b border-[#EAE6F3] px-5 py-4">
            <h2 className="font-display text-base font-bold text-[#252033]">
              Campus & Local Events
            </h2>
            <button
              type="button"
              onClick={() =>
                setEditingEvent({
                  category: 'College Events',
                  date: '2026-12-20',
                  time: '5:30 PM – 8:30 PM',
                  entryFee: 0,
                  capacity: 150,
                  imageUrl: CAMPUSLOOP_IMAGES.eventMusic,
                  isSampleData: false,
                  status: 'active',
                })
              }
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#673AB7] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#45207A]"
            >
              <Plus className="h-4 w-4" />
              Add Event
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#EAE6F3] bg-[#FAFAFC] text-xs text-[#645D78]">
                <tr>
                  <th className="px-5 py-3 font-semibold">Event Name</th>
                  <th className="px-5 py-3 font-semibold">Date & Time</th>
                  <th className="px-5 py-3 font-semibold">Venue</th>
                  <th className="px-5 py-3 text-right font-semibold">Fee</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE6F3]">
                {events.map((evt) => (
                  <tr key={evt.id} className="hover:bg-[#FAFAFC]">
                    <td className="px-5 py-3.5 font-medium text-[#252033]">{evt.name}</td>
                    <td className="px-5 py-3.5 tabular-nums text-[#544D68]">
                      {evt.date} · {evt.time}
                    </td>
                    <td className="max-w-xs truncate px-5 py-3.5 text-[#544D68]">
                      {evt.venue}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-[#252033]">
                      {evt.entryFee === 0 ? 'Free' : `₹${evt.entryFee}`}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setEditingEvent(evt)}
                        className="rounded-lg p-1.5 text-[#544D68] hover:bg-[#F3EDFF] hover:text-[#45207A]"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const ok = await confirm({
                            title: `Delete "${evt.name}"?`,
                            message: 'This permanently deletes the event from Firestore.',
                            confirmLabel: 'Delete',
                            destructive: true,
                          });
                          if (ok) {
                            await deleteEvent(evt.id);
                            showToast('Event deleted', 'info');
                          }
                        }}
                        className="ml-1 rounded-lg p-1.5 text-[#544D68] hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB: PARTNER APPLICATIONS */}
      {activeTab === 'applications' && (
        <section className="overflow-hidden rounded-2xl border border-[#EAE6F3] bg-white">
          <div className="border-b border-[#EAE6F3] px-5 py-4">
            <h2 className="font-display text-base font-bold text-[#252033]">
              Business Partnership Applications
            </h2>
          </div>
          {allPartnerApplications.length === 0 ? (
            <p className="p-8 text-center text-sm text-[#645D78]">
              No partnership applications submitted yet.
            </p>
          ) : (
            <div className="divide-y divide-[#EAE6F3]">
              {allPartnerApplications.map((app) => (
                <div
                  key={app.id}
                  className="flex flex-col justify-between gap-4 p-5 lg:flex-row lg:items-center"
                >
                  <div className="space-y-1">
                    <p className="text-xs text-[#645D78]">
                      {app.category} · Owner: {app.ownerName} · {app.contactNumber} ·{' '}
                      <span
                        className={`font-semibold ${
                          app.status === 'Approved'
                            ? 'text-emerald-700'
                            : app.status === 'Rejected'
                            ? 'text-red-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {app.status}
                      </span>
                    </p>
                    <h3 className="font-display text-base font-bold text-[#252033]">
                      {app.businessName}
                    </h3>
                    <p className="text-xs text-[#544D68]">{app.address}</p>
                    <p className="text-xs font-semibold text-[#45207A]">
                      Proposed discount: {app.proposedDiscount}
                    </p>
                  </div>

                  {app.status === 'Pending' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleApprovePartner(app)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Approve & Publish
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRejectPartner(app)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        <X className="h-3.5 w-3.5" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB: BOOKINGS */}
      {activeTab === 'bookings' && (
        <section className="overflow-hidden rounded-2xl border border-[#EAE6F3] bg-white">
          <div className="border-b border-[#EAE6F3] px-5 py-4">
            <h2 className="font-display text-base font-bold text-[#252033]">
              Student Service Bookings
            </h2>
          </div>
          {allBookings.length === 0 ? (
            <p className="p-8 text-center text-sm text-[#645D78]">
              No service bookings have been created yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[#EAE6F3] bg-[#FAFAFC] text-xs text-[#645D78]">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Student</th>
                    <th className="px-5 py-3 font-semibold">Service</th>
                    <th className="px-5 py-3 font-semibold">Schedule</th>
                    <th className="px-5 py-3 text-right font-semibold">Amount</th>
                    <th className="px-5 py-3 text-right font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE6F3]">
                  {allBookings.map((bk) => (
                    <tr key={bk.id}>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-[#252033]">{bk.userName}</p>
                        <p className="text-xs text-[#645D78]">{bk.userEmail}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-[#252033]">{bk.serviceTitle}</p>
                        <p className="text-xs text-[#645D78]">{bk.providerName}</p>
                      </td>
                      <td className="px-5 py-3.5 tabular-nums text-xs text-[#544D68]">
                        {bk.bookingDate} · {bk.timeSlot}
                      </td>
                      <td className="px-5 py-3.5 text-right font-semibold tabular-nums text-[#252033]">
                        ₹{bk.price}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <select
                          aria-label={`Update booking status for ${bk.serviceTitle}`}
                          value={bk.status}
                          onChange={(e) =>
                            handleBookingStatusChange(
                              bk.id,
                              e.target.value as BookingStatus
                            )
                          }
                          className="rounded-lg border border-[#EAE6F3] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#252033]"
                        >
                          {(['Pending', 'Confirmed', 'Completed', 'Cancelled'] as const).map(
                            (st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            )
                          )}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* TAB: STUDENTS & EVENT REGISTRATIONS */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          <section className="overflow-hidden rounded-2xl border border-[#EAE6F3] bg-white">
            <div className="border-b border-[#EAE6F3] px-5 py-4">
              <h2 className="font-display text-base font-bold text-[#252033]">
                Registered Students ({allUsers.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[#EAE6F3] bg-[#FAFAFC] text-xs text-[#645D78]">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Full Name</th>
                    <th className="px-5 py-3 font-semibold">Email</th>
                    <th className="px-5 py-3 font-semibold">University</th>
                    <th className="px-5 py-3 font-semibold">Student ID</th>
                    <th className="px-5 py-3 font-semibold">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE6F3]">
                  {allUsers.map((u) => (
                    <tr key={u.uid}>
                      <td className="px-5 py-3.5 font-medium text-[#252033]">
                        {u.fullName}
                      </td>
                      <td className="px-5 py-3.5 text-[#544D68]">{u.email}</td>
                      <td className="px-5 py-3.5 text-[#544D68]">{u.university}</td>
                      <td className="px-5 py-3.5 font-mono text-xs text-[#645D78]">
                        {u.studentId || '—'}
                      </td>
                      <td className="px-5 py-3.5 text-xs font-semibold capitalize text-[#45207A]">
                        {u.role}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-[#EAE6F3] bg-white">
            <div className="border-b border-[#EAE6F3] px-5 py-4">
              <h2 className="font-display text-base font-bold text-[#252033]">
                Event Registrations ({allEventRegistrations.length})
              </h2>
            </div>
            {allEventRegistrations.length === 0 ? (
              <p className="p-6 text-center text-sm text-[#645D78]">
                No event registrations recorded yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-[#EAE6F3] bg-[#FAFAFC] text-xs text-[#645D78]">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Attendee</th>
                      <th className="px-5 py-3 font-semibold">Event</th>
                      <th className="px-5 py-3 font-semibold">Pass Code</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE6F3]">
                    {allEventRegistrations.map((reg) => (
                      <tr key={reg.id}>
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-[#252033]">{reg.userName}</p>
                          <p className="text-xs text-[#645D78]">{reg.userEmail}</p>
                        </td>
                        <td className="px-5 py-3.5 text-[#252033]">{reg.eventName}</td>
                        <td className="px-5 py-3.5 font-mono text-xs font-bold text-[#45207A]">
                          {reg.ticketCode}
                        </td>
                        <td className="px-5 py-3.5 text-xs font-semibold text-[#544D68]">
                          {reg.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}

      {/* MODAL: ADD / EDIT BUSINESS */}
      {editingBusiness && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#252033]/50 p-4 backdrop-blur-[2px]"
          onClick={() => setEditingBusiness(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[#EAE6F3] bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-lg font-bold text-[#252033]">
              {editingBusiness.id ? 'Edit Business' : 'Add New Business'}
            </h3>
            <form onSubmit={handleSaveBusiness} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  required
                  minLength={2}
                  placeholder="Business Name"
                  value={editingBusiness.name || ''}
                  onChange={(e) =>
                    setEditingBusiness({ ...editingBusiness, name: e.target.value })
                  }
                  className="rounded-xl border border-[#EAE6F3] px-3.5 py-2.5 text-sm"
                />
                <select
                  value={editingBusiness.category || 'Food & Cafés'}
                  onChange={(e) =>
                    setEditingBusiness({
                      ...editingBusiness,
                      category: e.target.value as BusinessCategory,
                    })
                  }
                  className="rounded-xl border border-[#EAE6F3] px-3.5 py-2.5 text-sm"
                >
                  {BUSINESS_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <select
                  value={editingBusiness.area || 'Selaqui / DBS Campus'}
                  onChange={(e) =>
                    setEditingBusiness({ ...editingBusiness, area: e.target.value })
                  }
                  className="rounded-xl border border-[#EAE6F3] px-3.5 py-2.5 text-sm"
                >
                  {DEHRADUN_AREAS.filter((a) => a !== 'All Dehradun').map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
                <select
                  value={editingBusiness.priceRange || '₹₹'}
                  onChange={(e) =>
                    setEditingBusiness({
                      ...editingBusiness,
                      priceRange: e.target.value as PriceRange,
                    })
                  }
                  className="rounded-xl border border-[#EAE6F3] px-3.5 py-2.5 text-sm"
                >
                  <option value="₹">₹ (Budget)</option>
                  <option value="₹₹">₹₹ (Moderate)</option>
                  <option value="₹₹₹">₹₹₹ (Premium)</option>
                </select>
              </div>
              <input
                type="text"
                required
                placeholder="Full Address / Location in Dehradun"
                value={editingBusiness.location || ''}
                onChange={(e) =>
                  setEditingBusiness({ ...editingBusiness, location: e.target.value })
                }
                className="w-full rounded-xl border border-[#EAE6F3] px-3.5 py-2.5 text-sm"
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="Cuisine / Specialty (optional)"
                  value={editingBusiness.cuisine || ''}
                  onChange={(e) =>
                    setEditingBusiness({ ...editingBusiness, cuisine: e.target.value })
                  }
                  className="rounded-xl border border-[#EAE6F3] px-3.5 py-2.5 text-sm"
                />
                <input
                  type="text"
                  required
                  placeholder="Student Discount (e.g. 20% off)"
                  value={editingBusiness.studentDiscount || ''}
                  onChange={(e) =>
                    setEditingBusiness({
                      ...editingBusiness,
                      studentDiscount: e.target.value,
                    })
                  }
                  className="rounded-xl border border-[#EAE6F3] px-3.5 py-2.5 text-sm"
                />
              </div>
              <textarea
                required
                minLength={10}
                rows={3}
                placeholder="Business Description (min 10 chars)"
                value={editingBusiness.description || ''}
                onChange={(e) =>
                  setEditingBusiness({ ...editingBusiness, description: e.target.value })
                }
                className="w-full rounded-xl border border-[#EAE6F3] px-3.5 py-2.5 text-sm"
              />
              <select
                value={editingBusiness.imageUrl || CAMPUSLOOP_IMAGES.cafeArtisan}
                onChange={(e) =>
                  setEditingBusiness({ ...editingBusiness, imageUrl: e.target.value })
                }
                className="w-full rounded-xl border border-[#EAE6F3] px-3.5 py-2.5 text-sm"
              >
                {IMAGE_PRESET_OPTIONS.map((opt) => (
                  <option key={opt.url} value={opt.url}>
                    Photo: {opt.label}
                  </option>
                ))}
              </select>
              <div className="flex flex-wrap gap-4 text-xs text-[#252033]">
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={Boolean(editingBusiness.isPopular)}
                    onChange={(e) =>
                      setEditingBusiness({
                        ...editingBusiness,
                        isPopular: e.target.checked,
                      })
                    }
                  />
                  Popular Near You
                </label>
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={Boolean(editingBusiness.isRecommended)}
                    onChange={(e) =>
                      setEditingBusiness({
                        ...editingBusiness,
                        isRecommended: e.target.checked,
                      })
                    }
                  />
                  Recommended
                </label>
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={Boolean(editingBusiness.isSampleData)}
                    onChange={(e) =>
                      setEditingBusiness({
                        ...editingBusiness,
                        isSampleData: e.target.checked,
                      })
                    }
                  />
                  Mark as Sample Data
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingBusiness(null)}
                  className="rounded-xl border border-[#EAE6F3] px-4 py-2 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#673AB7] px-5 py-2 text-sm font-semibold text-white hover:bg-[#45207A]"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Business
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT OFFER */}
      {editingOffer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#252033]/50 p-4 backdrop-blur-[2px]"
          onClick={() => setEditingOffer(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[#EAE6F3] bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-lg font-bold text-[#252033]">
              {editingOffer.id ? 'Edit Offer' : 'Create Exclusive Offer'}
            </h3>
            <form onSubmit={handleSaveOffer} className="mt-4 space-y-3.5">
              <input
                type="text"
                required
                minLength={3}
                placeholder="Offer Title"
                value={editingOffer.title || ''}
                onChange={(e) =>
                  setEditingOffer({ ...editingOffer, title: e.target.value })
                }
                className="w-full rounded-xl border border-[#EAE6F3] px-3.5 py-2.5 text-sm"
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  required
                  placeholder="Business Name"
                  value={editingOffer.businessName || ''}
                  onChange={(e) =>
                    setEditingOffer({ ...editingOffer, businessName: e.target.value })
                  }
                  className="rounded-xl border border-[#EAE6F3] px-3.5 py-2.5 text-sm"
                />
                <select
                  value={editingOffer.category || 'Café Offers'}
                  onChange={(e) =>
                    setEditingOffer({
                      ...editingOffer,
                      category: e.target.value as OfferCategory,
                    })
                  }
                  className="rounded-xl border border-[#EAE6F3] px-3.5 py-2.5 text-sm"
                >
                  {OFFER_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  required
                  min={1}
                  max={100}
                  placeholder="Discount %"
                  value={editingOffer.discountPercentage ?? 20}
                  onChange={(e) =>
                    setEditingOffer({
                      ...editingOffer,
                      discountPercentage: Number(e.target.value),
                      discountLabel: `${e.target.value}% OFF`,
                    })
                  }
                  className="rounded-xl border border-[#EAE6F3] px-3.5 py-2.5 text-sm"
                />
                <input
                  type="date"
                  required
                  value={editingOffer.validUntil || '2027-03-31'}
                  onChange={(e) =>
                    setEditingOffer({ ...editingOffer, validUntil: e.target.value })
                  }
                  className="rounded-xl border border-[#EAE6F3] px-3.5 py-2.5 text-sm"
                />
              </div>
              <textarea
                required
                minLength={10}
                rows={2}
                placeholder="Offer Description"
                value={editingOffer.description || ''}
                onChange={(e) =>
                  setEditingOffer({ ...editingOffer, description: e.target.value })
                }
                className="w-full rounded-xl border border-[#EAE6F3] px-3.5 py-2.5 text-sm"
              />
              <textarea
                required
                minLength={5}
                rows={2}
                placeholder="Terms & Conditions"
                value={editingOffer.terms || ''}
                onChange={(e) =>
                  setEditingOffer({ ...editingOffer, terms: e.target.value })
                }
                className="w-full rounded-xl border border-[#EAE6F3] px-3.5 py-2.5 text-sm"
              />
              <select
                value={editingOffer.imageUrl || CAMPUSLOOP_IMAGES.cafeArtisan}
                onChange={(e) =>
                  setEditingOffer({ ...editingOffer, imageUrl: e.target.value })
                }
                className="w-full rounded-xl border border-[#EAE6F3] px-3.5 py-2.5 text-sm"
              >
                {IMAGE_PRESET_OPTIONS.map((opt) => (
                  <option key={opt.url} value={opt.url}>
                    Photo: {opt.label}
                  </option>
                ))}
              </select>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingOffer(null)}
                  className="rounded-xl border border-[#EAE6F3] px-4 py-2 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#673AB7] px-5 py-2 text-sm font-semibold text-white hover:bg-[#45207A]"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT SERVICE */}
      {editingService && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#252033]/50 p-4 backdrop-blur-[2px]"
          onClick={() => setEditingService(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[#EAE6F3] bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-lg font-bold text-[#252033]">
              {editingService.id ? 'Edit Service' : 'Add Student Service'}
            </h3>
            <form onSubmit={handleSaveService} className="mt-4 space-y-3.5">
              <input
                type="text"
                required
                minLength={3}
                placeholder="Service Title"
                value={editingService.title || ''}
                onChange={(e) =>
                  setEditingService({ ...editingService, title: e.target.value })
                }
                className="w-full rounded-xl border border-[#EAE6F3] px-3.5 py-2.5 text-sm"
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  required
                  placeholder="Provider Name"
                  value={editingService.providerName || ''}
                  onChange={(e) =>
                    setEditingService({ ...editingService, providerName: e.target.value })
                  }
                  className="rounded-xl border border-[#EAE6F3] px-3.5 py-2.5 text-sm"
                />
                <select
                  value={editingService.category || 'Laundry'}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      category: e.target.value as ServiceCategory,
                    })
                  }
                  className="rounded-xl border border-[#EAE6F3] px-3.5 py-2.5 text-sm"
                >
                  {SERVICE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  required
                  min={0}
                  placeholder="Price (INR)"
                  value={editingService.price ?? 199}
                  onChange={(e) =>
                    setEditingService({ ...editingService, price: Number(e.target.value) })
                  }
                  className="rounded-xl border border-[#EAE6F3] px-3.5 py-2.5 text-sm"
                />
                <input
                  type="text"
                  required
                  placeholder="Price Unit (e.g. per 5kg bag)"
                  value={editingService.priceUnit || ''}
                  onChange={(e) =>
                    setEditingService({ ...editingService, priceUnit: e.target.value })
                  }
                  className="rounded-xl border border-[#EAE6F3] px-3.5 py-2.5 text-sm"
                />
                <input
                  type="text"
                  required
                  placeholder="Location"
                  value={editingService.location || ''}
                  onChange={(e) =>
                    setEditingService({ ...editingService, location: e.target.value })
                  }
                  className="rounded-xl border border-[#EAE6F3] px-3.5 py-2.5 text-sm"
                />
                <input
                  type="tel"
                  required
                  minLength={6}
                  placeholder="Contact Phone"
                  value={editingService.contactPhone || ''}
                  onChange={(e) =>
                    setEditingService({ ...editingService, contactPhone: e.target.value })
                  }
                  className="rounded-xl border border-[#EAE6F3] px-3.5 py-2.5 text-sm"
                />
              </div>
              <textarea
                required
                minLength={10}
                rows={3}
                placeholder="Service Description"
                value={editingService.description || ''}
                onChange={(e) =>
                  setEditingService({ ...editingService, description: e.target.value })
                }
                className="w-full rounded-xl border border-[#EAE6F3] px-3.5 py-2.5 text-sm"
              />
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="rounded-xl border border-[#EAE6F3] px-4 py-2 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#673AB7] px-5 py-2 text-sm font-semibold text-white hover:bg-[#45207A]"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT EVENT */}
      {editingEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#252033]/50 p-4 backdrop-blur-[2px]"
          onClick={() => setEditingEvent(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[#EAE6F3] bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-lg font-bold text-[#252033]">
              {editingEvent.id ? 'Edit Event' : 'Create Event'}
            </h3>
            <form onSubmit={handleSaveEvent} className="mt-4 space-y-3.5">
              <input
                type="text"
                required
                minLength={3}
                placeholder="Event Name"
                value={editingEvent.name || ''}
                onChange={(e) =>
                  setEditingEvent({ ...editingEvent, name: e.target.value })
                }
                className="w-full rounded-xl border border-[#EAE6F3] px-3.5 py-2.5 text-sm"
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <select
                  value={editingEvent.category || 'College Events'}
                  onChange={(e) =>
                    setEditingEvent({
                      ...editingEvent,
                      category: e.target.value as EventCategory,
                    })
                  }
                  className="rounded-xl border border-[#EAE6F3] px-3.5 py-2.5 text-sm"
                >
                  {EVENT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  required
                  placeholder="Organizer"
                  value={editingEvent.organizer || ''}
                  onChange={(e) =>
                    setEditingEvent({ ...editingEvent, organizer: e.target.value })
                  }
                  className="rounded-xl border border-[#EAE6F3] px-3.5 py-2.5 text-sm"
                />
                <input
                  type="date"
                  required
                  value={editingEvent.date || '2026-12-20'}
                  onChange={(e) =>
                    setEditingEvent({ ...editingEvent, date: e.target.value })
                  }
                  className="rounded-xl border border-[#EAE6F3] px-3.5 py-2.5 text-sm"
                />
                <input
                  type="text"
                  required
                  placeholder="Time (e.g. 6:00 PM – 9:00 PM)"
                  value={editingEvent.time || ''}
                  onChange={(e) =>
                    setEditingEvent({ ...editingEvent, time: e.target.value })
                  }
                  className="rounded-xl border border-[#EAE6F3] px-3.5 py-2.5 text-sm"
                />
                <input
                  type="number"
                  required
                  min={0}
                  placeholder="Entry Fee (0 for Free)"
                  value={editingEvent.entryFee ?? 0}
                  onChange={(e) =>
                    setEditingEvent({ ...editingEvent, entryFee: Number(e.target.value) })
                  }
                  className="rounded-xl border border-[#EAE6F3] px-3.5 py-2.5 text-sm"
                />
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="Seat Capacity"
                  value={editingEvent.capacity ?? 150}
                  onChange={(e) =>
                    setEditingEvent({ ...editingEvent, capacity: Number(e.target.value) })
                  }
                  className="rounded-xl border border-[#EAE6F3] px-3.5 py-2.5 text-sm"
                />
              </div>
              <input
                type="text"
                required
                placeholder="Venue"
                value={editingEvent.venue || ''}
                onChange={(e) =>
                  setEditingEvent({ ...editingEvent, venue: e.target.value })
                }
                className="w-full rounded-xl border border-[#EAE6F3] px-3.5 py-2.5 text-sm"
              />
              <textarea
                required
                minLength={10}
                rows={3}
                placeholder="Event Description"
                value={editingEvent.description || ''}
                onChange={(e) =>
                  setEditingEvent({ ...editingEvent, description: e.target.value })
                }
                className="w-full rounded-xl border border-[#EAE6F3] px-3.5 py-2.5 text-sm"
              />
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="rounded-xl border border-[#EAE6F3] px-4 py-2 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#673AB7] px-5 py-2 text-sm font-semibold text-white hover:bg-[#45207A]"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
