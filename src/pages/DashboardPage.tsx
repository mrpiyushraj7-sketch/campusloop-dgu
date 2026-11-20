import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Heart,
  Star,
  Calendar,
  MapPin,
  Database,
  Loader2,
  Compass,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { seedDemoCatalog } from '../lib/firestoreService';
import { MediaImage } from '../components/ui/MediaImage';
import { CardGridSkeleton, EmptyState } from '../components/ui/States';
import { BusinessDetailModal } from '../components/modals/BusinessDetailModal';
import { OfferRedeemModal } from '../components/modals/OfferRedeemModal';
import { EventRegisterModal } from '../components/modals/EventRegisterModal';
import { CAMPUSLOOP_IMAGES } from '../data/assets';
import type { Business, Offer, EventItem } from '../types/campusloop';

const CATEGORY_CARDS = [
  {
    name: 'Food & Cafés',
    subtitle: 'Study cafés & bistros',
    image: CAMPUSLOOP_IMAGES.cafeArtisan,
    to: '/cafes',
  },
  {
    name: 'Shopping',
    subtitle: 'Campus style & gear',
    image: CAMPUSLOOP_IMAGES.shoppingBoutique,
    to: '/explore?category=Shopping',
  },
  {
    name: 'Beauty & Salon',
    subtitle: 'Grooming & styling',
    image: CAMPUSLOOP_IMAGES.salonGrooming,
    to: '/explore?category=Beauty%20%26%20Salon',
  },
  {
    name: 'Fitness',
    subtitle: 'Gyms & studios',
    image: CAMPUSLOOP_IMAGES.fitnessStudio,
    to: '/explore?category=Fitness',
  },
  {
    name: 'Entertainment',
    subtitle: 'Lounges & hangouts',
    image: CAMPUSLOOP_IMAGES.restaurantBistro,
    to: '/explore?category=Entertainment',
  },
  {
    name: 'Events',
    subtitle: 'Fests & workshops',
    image: CAMPUSLOOP_IMAGES.eventMusic,
    to: '/events',
  },
  {
    name: 'Services',
    subtitle: 'Laundry, print & rides',
    image: CAMPUSLOOP_IMAGES.serviceEssentials,
    to: '/services',
  },
];

export function DashboardPage() {
  const { profile, user, isAdmin } = useAuth();
  const {
    businesses,
    offers,
    events,
    myEventRegistrations,
    catalogLoading,
    selectedArea,
    isFavorite,
    toggleFavorite,
  } = useData();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [seeding, setSeeding] = useState(false);

  const firstName = (profile?.fullName || user?.displayName || 'Student').split(' ')[0];

  const activeBusinesses = useMemo(() => {
    const active = businesses.filter((b) => b.status === 'active');
    if (selectedArea === 'All Dehradun') return active;
    return active.filter((b) => b.area === selectedArea);
  }, [businesses, selectedArea]);

  const activeOffers = useMemo(
    () => offers.filter((o) => o.status === 'active'),
    [offers]
  );

  const activeEvents = useMemo(
    () => events.filter((e) => e.status === 'active'),
    [events]
  );

  const featuredOffers = useMemo(
    () => activeOffers.filter((o) => o.isFeatured).slice(0, 3),
    [activeOffers]
  );

  const popularBusinesses = useMemo(
    () => activeBusinesses.filter((b) => b.isPopular).slice(0, 3),
    [activeBusinesses]
  );

  const recommendedBusinesses = useMemo(
    () => activeBusinesses.filter((b) => b.isRecommended).slice(0, 3),
    [activeBusinesses]
  );

  const handleSeedDemo = async () => {
    setSeeding(true);
    try {
      const counts = await seedDemoCatalog();
      showToast(
        'Demonstration catalog seeded',
        'success',
        `Loaded ${counts.businesses} businesses, ${counts.offers} offers, ${counts.services} services, and ${counts.events} events.`
      );
    } catch (err) {
      showToast(
        'Seeding failed',
        'error',
        err instanceof Error ? err.message : 'Admin permissions required to seed catalog.'
      );
    } finally {
      setSeeding(false);
    }
  };

  const handleWishlistBusiness = async (biz: Business) => {
    try {
      const added = await toggleFavorite({
        itemType: 'business',
        itemId: biz.id,
        title: biz.name,
        subtitle: biz.cuisine || biz.area,
        category: biz.category,
        location: biz.location,
        imageUrl: biz.imageUrl,
        discountLabel: biz.studentDiscount,
      });
      showToast(added ? 'Saved to Wishlist' : 'Removed from Wishlist', 'info');
    } catch {
      showToast('Could not update Wishlist', 'error');
    }
  };

  const linkedOffersForModal = useMemo(() => {
    if (!selectedBusiness) return [];
    return activeOffers.filter(
      (o) =>
        o.businessId === selectedBusiness.id ||
        o.businessName.toLowerCase() === selectedBusiness.name.toLowerCase()
    );
  }, [selectedBusiness, activeOffers]);

  const isEmptyCatalog =
    !catalogLoading &&
    businesses.length === 0 &&
    offers.length === 0 &&
    events.length === 0;

  return (
    <div className="space-y-10 pb-8">
      {/* A. Welcome Banner */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium text-[#673AB7]">
            {profile?.university || 'DBS Global University, Dehradun'}
            {selectedArea !== 'All Dehradun' ? ` · ${selectedArea}` : ' · Dehradun'}
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-[#252033] sm:text-3xl">
            Welcome to CampusLoop, {firstName}!
          </h1>
          <p className="mt-1 text-sm text-[#645D78]">
            Discover the best experiences around your campus.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && isEmptyCatalog && (
            <button
              type="button"
              onClick={handleSeedDemo}
              disabled={seeding}
              className="inline-flex items-center gap-2 rounded-xl bg-[#45207A] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#673AB7] disabled:opacity-60 whitespace-nowrap shrink-0"
            >
              {seeding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              Seed Dehradun Demo Data
            </button>
          )}
          <Link
            to="/offers"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#EAE6F3] bg-white px-4 py-2.5 text-sm font-medium text-[#252033] transition-colors hover:bg-[#FAFAFC] whitespace-nowrap shrink-0"
          >
            Browse Deals
            <ArrowRight className="h-4 w-4 text-[#673AB7]" />
          </Link>
        </div>
      </section>

      {/* B. Main Hero Promotional Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-[#252033] shadow-sm">
        <div className="relative aspect-[16/9] max-h-[380px] w-full sm:aspect-[21/9]">
          <MediaImage
            src={CAMPUSLOOP_IMAGES.heroDehradun}
            alt="Hillside specialty café and student courtyard in Dehradun overlooking Himalayan foothills"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1D1530]/92 via-[#252033]/68 to-[#252033]/25" />

          <div className="absolute inset-0 flex flex-col justify-center p-6 sm:p-10 lg:p-12">
            <div className="max-w-xl">
              <p className="text-xs font-semibold tracking-wide text-[#E3D5FF]">
                Dehradun Student Local Discovery
              </p>
              <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
                Your Campus. Your City. Your Loop.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/85 sm:text-base">
                Find amazing cafés, exclusive student deals, local services and exciting
                events around DBS Global University and across Dehradun.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/explore')}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#673AB7] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#45207A] whitespace-nowrap shrink-0"
                >
                  Explore Now
                  <ArrowRight className="h-4 w-4" />
                </button>
                <Link
                  to="/partner"
                  className="inline-flex items-center rounded-xl bg-white/15 px-5 py-3 text-sm font-medium text-white backdrop-blur-xs transition-colors hover:bg-white/25 whitespace-nowrap shrink-0"
                >
                  Partner With Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* C. Categories Visual Strip */}
      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-[#252033]">
              Explore by Category
            </h2>
            <p className="mt-1 text-sm text-[#645D78]">
              Jump straight into curated local hangouts, campus services, and events.
            </p>
          </div>
          <Link
            to="/explore"
            className="text-sm font-semibold text-[#673AB7] transition-colors hover:text-[#45207A] whitespace-nowrap shrink-0"
          >
            View all
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {CATEGORY_CARDS.map((cat) => (
            <Link
              key={cat.name}
              to={cat.to}
              className="group overflow-hidden rounded-2xl border border-[#EAE6F3] bg-white transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-[#F3EDFF]">
                <MediaImage
                  src={cat.image}
                  alt={cat.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-semibold text-[#252033]">
                  {cat.name}
                </p>
                <p className="mt-0.5 truncate text-xs text-[#645D78]">{cat.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {catalogLoading ? (
        <CardGridSkeleton count={6} />
      ) : isEmptyCatalog ? (
        <EmptyState
          icon={<Compass className="h-6 w-6" />}
          title="The Dehradun discovery catalog is ready to populate"
          description={
            isAdmin
              ? 'No listings are in Firestore yet. Seed the curated Dehradun demonstration dataset or add custom listings in the Admin Dashboard.'
              : 'Your campus administrator has not published Dehradun listings yet. Check back shortly or recommend a local business via Partner With Us.'
          }
          action={
            isAdmin ? (
              <button
                type="button"
                onClick={handleSeedDemo}
                disabled={seeding}
                className="inline-flex items-center gap-2 rounded-xl bg-[#673AB7] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#45207A]"
              >
                {seeding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Database className="h-4 w-4" />
                )}
                Seed Demo Catalog
              </button>
            ) : (
              <Link
                to="/partner"
                className="inline-flex items-center gap-2 rounded-xl bg-[#673AB7] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#45207A]"
              >
                Suggest a Local Business
              </Link>
            )
          }
        />
      ) : (
        <>
          {/* D. Featured Offers */}
          {featuredOffers.length > 0 && (
            <section>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl font-bold text-[#252033]">
                    Featured Offers
                  </h2>
                  <p className="mt-1 text-sm text-[#645D78]">
                    Redeem instant student discount codes saved directly to your account.
                  </p>
                </div>
                <Link
                  to="/offers"
                  className="text-sm font-semibold text-[#673AB7] hover:text-[#45207A] whitespace-nowrap shrink-0"
                >
                  All offers
                </Link>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {featuredOffers.map((offer) => (
                  <article
                    key={offer.id}
                    className="flex flex-col overflow-hidden rounded-2xl border border-[#EAE6F3] bg-white transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F3EDFF]">
                      <MediaImage
                        src={offer.imageUrl}
                        alt={offer.title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1A132B]/70 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
                        <span className="font-display text-xl font-extrabold tracking-tight">
                          {offer.discountLabel}
                        </span>
                        <span className="text-xs text-white/85 tabular-nums">
                          Until {offer.validUntil}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <p className="text-xs text-[#645D78]">
                        {offer.businessName} · {offer.category}
                        {offer.isSampleData ? ' · Sample' : ''}
                      </p>
                      <h3 className="mt-1.5 font-display text-base font-bold text-[#252033]">
                        {offer.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-[#645D78]">
                        {offer.description}
                      </p>
                      <button
                        type="button"
                        onClick={() => setSelectedOffer(offer)}
                        className="mt-4 w-full rounded-xl bg-[#673AB7] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#45207A]"
                      >
                        Redeem Now
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* E. Popular Near You */}
          {popularBusinesses.length > 0 && (
            <section>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl font-bold text-[#252033]">
                    Popular Near You
                  </h2>
                  <p className="mt-1 text-sm text-[#645D78]">
                    Student-favourite cafés, dining tables, and retail spots across Dehradun.
                  </p>
                </div>
                <Link
                  to="/explore"
                  className="text-sm font-semibold text-[#673AB7] hover:text-[#45207A] whitespace-nowrap shrink-0"
                >
                  Explore marketplace
                </Link>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {popularBusinesses.map((biz) => {
                  const saved = isFavorite('business', biz.id);
                  return (
                    <article
                      key={biz.id}
                      className="flex flex-col overflow-hidden rounded-2xl border border-[#EAE6F3] bg-white transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F3EDFF]">
                        <MediaImage
                          src={biz.imageUrl}
                          alt={biz.name}
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleWishlistBusiness(biz)}
                          aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
                          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                            saved
                              ? 'bg-[#673AB7] text-white'
                              : 'bg-white/90 text-[#252033] hover:bg-white'
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      <div className="flex flex-1 flex-col p-5">
                        <div className="flex items-center justify-between gap-2 text-xs text-[#645D78]">
                          <span className="truncate">
                            {biz.category} · {biz.area} · {biz.priceRange}
                          </span>
                          {typeof biz.rating === 'number' && biz.rating > 0 && (
                            <span className="inline-flex shrink-0 items-center gap-1 font-semibold tabular-nums text-[#252033]">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                              {biz.rating.toFixed(1)}
                            </span>
                          )}
                        </div>

                        <h3 className="mt-1.5 font-display text-base font-bold text-[#252033]">
                          {biz.name}
                        </h3>
                        <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-[#645D78]">
                          {biz.description}
                        </p>

                        <p className="mt-3 text-xs font-semibold text-[#45207A]">
                          {biz.studentDiscount}
                        </p>

                        <button
                          type="button"
                          onClick={() => setSelectedBusiness(biz)}
                          className="mt-4 w-full rounded-xl border border-[#EAE6F3] bg-[#FAFAFC] px-4 py-2.5 text-sm font-semibold text-[#252033] transition-colors hover:border-[#673AB7] hover:bg-[#F3EDFF] hover:text-[#45207A]"
                        >
                          View Details
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {/* F. Upcoming Events */}
          {activeEvents.length > 0 && (
            <section>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl font-bold text-[#252033]">
                    Upcoming Events
                  </h2>
                  <p className="mt-1 text-sm text-[#645D78]">
                    Reserve your spot for college fests, workshops, and weekend meetups.
                  </p>
                </div>
                <Link
                  to="/events"
                  className="text-sm font-semibold text-[#673AB7] hover:text-[#45207A] whitespace-nowrap shrink-0"
                >
                  All events
                </Link>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {activeEvents.slice(0, 2).map((evt) => {
                  const reg = myEventRegistrations.find(
                    (r) => r.eventId === evt.id && r.status === 'Confirmed'
                  );
                  return (
                    <article
                      key={evt.id}
                      className="grid grid-cols-1 overflow-hidden rounded-2xl border border-[#EAE6F3] bg-white sm:grid-cols-12"
                    >
                      <div className="aspect-[16/10] sm:col-span-5 sm:aspect-auto">
                        <MediaImage
                          src={evt.imageUrl}
                          alt={evt.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col justify-between p-5 sm:col-span-7">
                        <div>
                          <p className="text-xs text-[#645D78]">
                            {evt.category} ·{' '}
                            {evt.entryFee === 0 ? 'Free entry' : `₹${evt.entryFee}`}
                            {evt.isSampleData ? ' · Sample' : ''}
                          </p>
                          <h3 className="mt-1.5 font-display text-base font-bold text-[#252033]">
                            {evt.name}
                          </h3>
                          <div className="mt-3 space-y-1 text-xs text-[#645D78]">
                            <p className="flex items-center gap-1.5 tabular-nums">
                              <Calendar className="h-3.5 w-3.5 text-[#673AB7]" />
                              {evt.date} · {evt.time}
                            </p>
                            <p className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-[#673AB7]" />
                              <span className="truncate">{evt.venue}</span>
                            </p>
                          </div>
                        </div>

                        <div className="mt-4">
                          <button
                            type="button"
                            onClick={() => setSelectedEvent(evt)}
                            className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                              reg
                                ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-[#673AB7] text-white hover:bg-[#45207A]'
                            }`}
                          >
                            {reg ? `Registered · Pass ${reg.ticketCode}` : 'Register Now'}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {/* G. Recommended for You */}
          {recommendedBusinesses.length > 0 && (
            <section>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl font-bold text-[#252033]">
                    Recommended for You
                  </h2>
                  <p className="mt-1 text-sm text-[#645D78]">
                    Handpicked places with strong student discounts around DBS Global University.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                {recommendedBusinesses.map((biz) => (
                  <button
                    key={biz.id}
                    type="button"
                    onClick={() => setSelectedBusiness(biz)}
                    className="flex items-center gap-4 rounded-2xl border border-[#EAE6F3] bg-white p-4 text-left transition-colors hover:border-[#673AB7]/40 hover:bg-[#FAFAFC]"
                  >
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#F3EDFF]">
                      <MediaImage
                        src={biz.imageUrl}
                        alt={biz.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs text-[#645D78]">
                        {biz.category} · {biz.area}
                      </p>
                      <p className="mt-0.5 truncate font-display text-sm font-bold text-[#252033]">
                        {biz.name}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs font-medium text-[#673AB7]">
                        {biz.studentDiscount}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Modals */}
      <BusinessDetailModal
        business={selectedBusiness}
        linkedOffers={linkedOffersForModal}
        isSaved={selectedBusiness ? isFavorite('business', selectedBusiness.id) : false}
        onToggleSave={() => selectedBusiness && handleWishlistBusiness(selectedBusiness)}
        onSelectOffer={(offer) => {
          setSelectedBusiness(null);
          setSelectedOffer(offer);
        }}
        onClose={() => setSelectedBusiness(null)}
      />

      <OfferRedeemModal
        offer={selectedOffer}
        onClose={() => setSelectedOffer(null)}
      />

      <EventRegisterModal
        event={selectedEvent}
        alreadyRegisteredCode={
          selectedEvent
            ? myEventRegistrations.find(
                (r) => r.eventId === selectedEvent.id && r.status === 'Confirmed'
              )?.ticketCode
            : undefined
        }
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
