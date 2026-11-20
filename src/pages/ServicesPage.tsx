import { useState, useMemo } from 'react';
import { Wrench, Search, MapPin, Phone, RotateCcw } from 'lucide-react';
import { useData } from '../context/DataContext';
import { MediaImage } from '../components/ui/MediaImage';
import { CardGridSkeleton, EmptyState } from '../components/ui/States';
import { ServiceBookingModal } from '../components/modals/ServiceBookingModal';
import { SERVICE_CATEGORIES, type ServiceItem } from '../types/campusloop';

export function ServicesPage() {
  const { services, catalogLoading } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [bookingService, setBookingService] = useState<ServiceItem | null>(null);

  const filteredServices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return services
      .filter((s) => s.status === 'active')
      .filter((s) => selectedCategory === 'All' || s.category === selectedCategory)
      .filter((s) => {
        if (!q) return true;
        return (
          s.title.toLowerCase().includes(q) ||
          s.providerName.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.location.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
        );
      });
  }, [services, searchQuery, selectedCategory]);

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#252033] sm:text-3xl">
            Student Services
          </h1>
          <p className="mt-1 text-sm text-[#645D78]">
            Book reliable hostel laundry, thesis printing, grooming, laptop repair, and airport rides.
          </p>
        </div>
        <p className="text-sm font-medium tabular-nums text-[#645D78]">
          {filteredServices.length} service{filteredServices.length === 1 ? '' : 's'} available
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-4 rounded-2xl border border-[#EAE6F3] bg-white p-4 sm:p-5">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#645D78]" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search laundry, printing, salon, airport cab..."
            className="w-full rounded-xl border border-[#EAE6F3] bg-[#FAFAFC] py-2.5 pl-10 pr-4 text-sm text-[#252033] placeholder:text-[#8E86A3] focus:border-[#673AB7] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 border-t border-[#EAE6F3] pt-3.5">
          {['All', ...SERVICE_CATEGORIES].map((cat) => (
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

      {/* Services Grid */}
      {catalogLoading ? (
        <CardGridSkeleton count={6} />
      ) : filteredServices.length === 0 ? (
        <EmptyState
          icon={<Wrench className="h-6 w-6" />}
          title="No services match your search"
          description="Clear the category filter or try a broader search term."
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
              Show All Services
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((svc) => (
            <article
              key={svc.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-[#EAE6F3] bg-white transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-[#F3EDFF]">
                <MediaImage
                  src={svc.imageUrl}
                  alt={svc.title}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex flex-1 flex-col p-5">
                <p className="text-xs text-[#645D78]">
                  {svc.category} · {svc.providerName}
                  {svc.isSampleData ? ' · Sample' : ''}
                </p>
                <h2 className="mt-1.5 font-display text-base font-bold text-[#252033]">
                  {svc.title}
                </h2>
                <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-[#544D68]">
                  {svc.description}
                </p>

                <div className="mt-4 space-y-1 border-t border-[#EAE6F3] pt-3 text-xs text-[#645D78]">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-[#673AB7]" />
                    <span className="truncate">{svc.location}</span>
                  </p>
                  <p className="flex items-center gap-1.5 tabular-nums">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-[#673AB7]" />
                    <span>{svc.contactPhone}</span>
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-bold tabular-nums text-[#252033]">
                      ₹{svc.price}
                    </p>
                    <p className="text-[11px] text-[#645D78]">{svc.priceUnit}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBookingService(svc)}
                    className="rounded-xl bg-[#673AB7] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#45207A] whitespace-nowrap shrink-0"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <ServiceBookingModal
        service={bookingService}
        onClose={() => setBookingService(null)}
      />
    </div>
  );
}
