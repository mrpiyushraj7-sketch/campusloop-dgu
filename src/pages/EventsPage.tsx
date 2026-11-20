import { useState, useMemo } from 'react';
import {
  CalendarDays,
  Search,
  MapPin,
  Clock,
  Heart,
  RotateCcw,
  Users,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { MediaImage } from '../components/ui/MediaImage';
import { CardGridSkeleton, EmptyState } from '../components/ui/States';
import { EventRegisterModal } from '../components/modals/EventRegisterModal';
import { EVENT_CATEGORIES, type EventItem } from '../types/campusloop';

export function EventsPage() {
  const {
    events,
    myEventRegistrations,
    catalogLoading,
    isFavorite,
    toggleFavorite,
  } = useData();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeEvent, setActiveEvent] = useState<EventItem | null>(null);

  const filteredEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return events
      .filter((e) => e.status === 'active')
      .filter((e) => selectedCategory === 'All' || e.category === selectedCategory)
      .filter((e) => {
        if (!q) return true;
        return (
          e.name.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q) ||
          e.organizer.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q)
        );
      });
  }, [events, searchQuery, selectedCategory]);

  const handleToggleWishlist = async (evt: EventItem) => {
    try {
      const added = await toggleFavorite({
        itemType: 'event',
        itemId: evt.id,
        title: evt.name,
        subtitle: `${evt.date} · ${evt.time}`,
        category: evt.category,
        location: evt.venue,
        imageUrl: evt.imageUrl,
        discountLabel: evt.entryFee === 0 ? 'Free entry' : `₹${evt.entryFee}`,
      });
      showToast(added ? 'Event saved to Wishlist' : 'Removed from Wishlist', 'info');
    } catch {
      showToast('Unable to update Wishlist', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#252033] sm:text-3xl">
            Campus & Dehradun Events
          </h1>
          <p className="mt-1 text-sm text-[#645D78]">
            Music nights, workshops, startup competitions, and weekend trails around your campus.
          </p>
        </div>
        <p className="text-sm font-medium tabular-nums text-[#645D78]">
          {filteredEvents.length} upcoming event{filteredEvents.length === 1 ? '' : 's'}
        </p>
      </div>

      {/* Filter Bar */}
      <div className="space-y-4 rounded-2xl border border-[#EAE6F3] bg-white p-4 sm:p-5">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#645D78]" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search workshops, acoustic nights, venues..."
            className="w-full rounded-xl border border-[#EAE6F3] bg-[#FAFAFC] py-2.5 pl-10 pr-4 text-sm text-[#252033] placeholder:text-[#8E86A3] focus:border-[#673AB7] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 border-t border-[#EAE6F3] pt-3.5">
          {['All', ...EVENT_CATEGORIES].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#673AB7] text-white'
                  : 'bg-[#FAFAFC] text-[#544D68] hover:bg-[#F3EDFF] hover:text-[#45207A]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      {catalogLoading ? (
        <CardGridSkeleton count={4} />
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="h-6 w-6" />}
          title="No upcoming events match your selection"
          description="Try switching categories or clearing the search bar."
          action={
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-[#673AB7] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#45207A]"
            >
              <RotateCcw className="h-4 w-4" />
              Show All Events
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {filteredEvents.map((evt) => {
            const saved = isFavorite('event', evt.id);
            const activeReg = myEventRegistrations.find(
              (r) => r.eventId === evt.id && r.status === 'Confirmed'
            );
            return (
              <article
                key={evt.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-[#EAE6F3] bg-white transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#F3EDFF]">
                  <MediaImage
                    src={evt.imageUrl}
                    alt={evt.name}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleToggleWishlist(evt)}
                    aria-label={saved ? 'Remove event from wishlist' : 'Save event to wishlist'}
                    className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                      saved
                        ? 'bg-[#673AB7] text-white'
                        : 'bg-white/90 text-[#252033] hover:bg-white'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center justify-between gap-2 text-xs text-[#645D78]">
                    <span>
                      {evt.category} · {evt.organizer}
                      {evt.isSampleData ? ' · Sample' : ''}
                    </span>
                    <span className="font-semibold tabular-nums text-[#45207A]">
                      {evt.entryFee === 0 ? 'Free' : `₹${evt.entryFee}`}
                    </span>
                  </div>

                  <h2 className="mt-1.5 font-display text-lg font-bold text-[#252033]">
                    {evt.name}
                  </h2>

                  <p className="mt-2 flex-1 text-sm leading-relaxed text-[#544D68]">
                    {evt.description}
                  </p>

                  <div className="mt-4 grid grid-cols-1 gap-2 border-t border-[#EAE6F3] pt-4 text-xs text-[#645D78] sm:grid-cols-2">
                    <p className="flex items-center gap-1.5 tabular-nums">
                      <Clock className="h-3.5 w-3.5 text-[#673AB7]" />
                      {evt.date} · {evt.time}
                    </p>
                    <p className="flex items-center gap-1.5 tabular-nums">
                      <Users className="h-3.5 w-3.5 text-[#673AB7]" />
                      Capacity: {evt.capacity} seats
                    </p>
                    <p className="flex items-center gap-1.5 sm:col-span-2">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-[#673AB7]" />
                      <span>{evt.venue}</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveEvent(evt)}
                    className={`mt-5 w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                      activeReg
                        ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-[#673AB7] text-white hover:bg-[#45207A]'
                    }`}
                  >
                    {activeReg
                      ? `Registered · View Pass (${activeReg.ticketCode})`
                      : 'Register Now'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <EventRegisterModal
        event={activeEvent}
        alreadyRegisteredCode={
          activeEvent
            ? myEventRegistrations.find(
                (r) => r.eventId === activeEvent.id && r.status === 'Confirmed'
              )?.ticketCode
            : undefined
        }
        onClose={() => setActiveEvent(null)}
      />
    </div>
  );
}
