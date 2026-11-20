import { useState, useMemo } from 'react';
import { Coffee, Search, Heart, Star, MapPin, RotateCcw } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { MediaImage } from '../components/ui/MediaImage';
import { CardGridSkeleton, EmptyState } from '../components/ui/States';
import { BusinessDetailModal } from '../components/modals/BusinessDetailModal';
import { OfferRedeemModal } from '../components/modals/OfferRedeemModal';
import type { Business, Offer, PriceRange } from '../types/campusloop';

export function CafesPage() {
  const {
    businesses,
    offers,
    catalogLoading,
    selectedArea,
    isFavorite,
    toggleFavorite,
  } = useData();
  const { showToast } = useToast();

  const [queryText, setQueryText] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState('All');
  const [priceFilter, setPriceFilter] = useState<PriceRange | 'All'>('All');
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

  const cafeBusinesses = useMemo(
    () =>
      businesses.filter(
        (b) => b.status === 'active' && b.category === 'Food & Cafés'
      ),
    [businesses]
  );

  const cuisines = useMemo(() => {
    const unique = new Set<string>();
    cafeBusinesses.forEach((b) => {
      if (b.cuisine) unique.add(b.cuisine);
    });
    return ['All', ...Array.from(unique)];
  }, [cafeBusinesses]);

  const activeOffers = useMemo(
    () => offers.filter((o) => o.status === 'active'),
    [offers]
  );

  const filtered = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    return cafeBusinesses
      .filter((b) => selectedArea === 'All Dehradun' || b.area === selectedArea)
      .filter((b) => cuisineFilter === 'All' || b.cuisine === cuisineFilter)
      .filter((b) => priceFilter === 'All' || b.priceRange === priceFilter)
      .filter((b) => {
        if (!q) return true;
        return (
          b.name.toLowerCase().includes(q) ||
          (b.cuisine && b.cuisine.toLowerCase().includes(q)) ||
          b.location.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          b.studentDiscount.toLowerCase().includes(q)
        );
      });
  }, [cafeBusinesses, selectedArea, cuisineFilter, priceFilter, queryText]);

  const getLinkedOffers = (biz: Business) =>
    activeOffers.filter(
      (o) =>
        o.businessId === biz.id ||
        o.businessName.toLowerCase() === biz.name.toLowerCase()
    );

  const handleToggleWishlist = async (biz: Business) => {
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
      showToast('Failed to update wishlist', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-[#252033] sm:text-3xl">
          Cafés & Restaurants
        </h1>
        <p className="mt-1 text-sm text-[#645D78]">
          Study-ready specialty coffee bars, hillside terraces, and group dining tables across Dehradun.
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-4 rounded-2xl border border-[#EAE6F3] bg-white p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="relative md:col-span-8">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#645D78]" />
            <input
              type="search"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="Search cafés, wood-fired pizza, momos, Rajpur Road..."
              className="w-full rounded-xl border border-[#EAE6F3] bg-[#FAFAFC] py-2.5 pl-10 pr-4 text-sm text-[#252033] placeholder:text-[#8E86A3] focus:border-[#673AB7] focus:bg-white focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-[#EAE6F3] bg-[#FAFAFC] p-1 md:col-span-4">
            {(['All', '₹', '₹₹', '₹₹₹'] as const).map((price) => (
              <button
                key={price}
                type="button"
                onClick={() => setPriceFilter(price)}
                className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                  priceFilter === price
                    ? 'bg-white text-[#45207A] shadow-xs'
                    : 'text-[#645D78] hover:text-[#252033]'
                }`}
              >
                {price === 'All' ? 'All Budgets' : price}
              </button>
            ))}
          </div>
        </div>

        {cuisines.length > 1 && (
          <div className="flex flex-wrap items-center gap-1.5 border-t border-[#EAE6F3] pt-3.5">
            {cuisines.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCuisineFilter(c)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  cuisineFilter === c
                    ? 'bg-[#673AB7] text-white'
                    : 'bg-[#FAFAFC] text-[#544D68] hover:bg-[#F3EDFF] hover:text-[#45207A]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Listing Grid */}
      {catalogLoading ? (
        <CardGridSkeleton count={3} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Coffee className="h-6 w-6" />}
          title="No cafés or restaurants match your filters"
          description="Clear your cuisine or budget filter to explore all Dehradun cafés and dining spots."
          action={
            <button
              type="button"
              onClick={() => {
                setQueryText('');
                setCuisineFilter('All');
                setPriceFilter('All');
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-[#673AB7] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#45207A]"
            >
              <RotateCcw className="h-4 w-4" />
              Clear Filters
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((biz) => {
            const saved = isFavorite('business', biz.id);
            const linked = getLinkedOffers(biz);
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
                    onClick={() => handleToggleWishlist(biz)}
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
                      {biz.cuisine || 'Café & Dining'} · {biz.priceRange}
                      {biz.isSampleData ? ' · Sample' : ''}
                    </span>
                    {typeof biz.rating === 'number' && biz.rating > 0 && (
                      <span className="inline-flex shrink-0 items-center gap-1 font-semibold tabular-nums text-[#252033]">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {biz.rating.toFixed(1)}
                      </span>
                    )}
                  </div>

                  <h2 className="mt-1.5 font-display text-lg font-bold text-[#252033]">
                    {biz.name}
                  </h2>

                  <p className="mt-1 flex items-center gap-1.5 text-xs text-[#645D78]">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-[#673AB7]" />
                    <span className="truncate">{biz.location}</span>
                  </p>

                  <p className="mt-2.5 line-clamp-2 flex-1 text-sm leading-relaxed text-[#544D68]">
                    {biz.description}
                  </p>

                  <div className="mt-3 rounded-xl bg-[#F3EDFF]/70 px-3 py-2 text-xs font-semibold text-[#45207A]">
                    {biz.studentDiscount}
                  </div>

                  <div className="mt-4 flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedBusiness(biz)}
                      className="flex-1 rounded-xl bg-[#673AB7] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#45207A]"
                    >
                      View Details
                    </button>
                    {linked.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedOffer(linked[0])}
                        className="rounded-xl border border-[#EAE6F3] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#45207A] transition-colors hover:bg-[#F3EDFF] whitespace-nowrap shrink-0"
                      >
                        Redeem Offer
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <BusinessDetailModal
        business={selectedBusiness}
        linkedOffers={selectedBusiness ? getLinkedOffers(selectedBusiness) : []}
        isSaved={selectedBusiness ? isFavorite('business', selectedBusiness.id) : false}
        onToggleSave={() => selectedBusiness && handleToggleWishlist(selectedBusiness)}
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
    </div>
  );
}
