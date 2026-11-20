import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Heart, Star, MapPin, Compass, RotateCcw } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { MediaImage } from '../components/ui/MediaImage';
import { CardGridSkeleton, EmptyState } from '../components/ui/States';
import { BusinessDetailModal } from '../components/modals/BusinessDetailModal';
import { OfferRedeemModal } from '../components/modals/OfferRedeemModal';
import {
  BUSINESS_CATEGORIES,
  DEHRADUN_AREAS,
  type Business,
  type Offer,
  type PriceRange,
} from '../types/campusloop';

export function ExplorePage() {
  const {
    businesses,
    offers,
    catalogLoading,
    globalSearch,
    setGlobalSearch,
    selectedArea,
    setSelectedArea,
    isFavorite,
    toggleFavorite,
  } = useData();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCategory = searchParams.get('category') || 'All';
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedPrice, setSelectedPrice] = useState<PriceRange | 'All'>('All');
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

  useEffect(() => {
    const paramCat = searchParams.get('category');
    if (paramCat) {
      setSelectedCategory(paramCat);
    }
  }, [searchParams]);

  const activeOffers = useMemo(
    () => offers.filter((o) => o.status === 'active'),
    [offers]
  );

  const filteredBusinesses = useMemo(() => {
    const q = globalSearch.trim().toLowerCase();
    return businesses
      .filter((b) => b.status === 'active')
      .filter((b) => selectedCategory === 'All' || b.category === selectedCategory)
      .filter((b) => selectedArea === 'All Dehradun' || b.area === selectedArea)
      .filter((b) => selectedPrice === 'All' || b.priceRange === selectedPrice)
      .filter((b) => {
        if (!q) return true;
        return (
          b.name.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q) ||
          (b.cuisine && b.cuisine.toLowerCase().includes(q)) ||
          b.location.toLowerCase().includes(q) ||
          b.area.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          b.studentDiscount.toLowerCase().includes(q)
        );
      });
  }, [businesses, globalSearch, selectedCategory, selectedArea, selectedPrice]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams, { replace: true });
  };

  const resetFilters = () => {
    setGlobalSearch('');
    handleCategoryChange('All');
    setSelectedArea('All Dehradun');
    setSelectedPrice('All');
  };

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

  const getLinkedOffers = (biz: Business) =>
    activeOffers.filter(
      (o) =>
        o.businessId === biz.id ||
        o.businessName.toLowerCase() === biz.name.toLowerCase()
    );

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#252033] sm:text-3xl">
            Explore Dehradun
          </h1>
          <p className="mt-1 text-sm text-[#645D78]">
            Discover cafés, shopping boutiques, salons, gyms, and student-friendly hangouts.
          </p>
        </div>
        <p className="text-sm font-medium tabular-nums text-[#645D78]">
          Showing {filteredBusinesses.length} listing
          {filteredBusinesses.length === 1 ? '' : 's'}
        </p>
      </div>

      {/* Filter Bar */}
      <div className="space-y-4 rounded-2xl border border-[#EAE6F3] bg-white p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="relative md:col-span-5">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#645D78]" />
            <input
              type="search"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Search by business name, cuisine, discount, or area..."
              className="w-full rounded-xl border border-[#EAE6F3] bg-[#FAFAFC] py-2.5 pl-10 pr-4 text-sm text-[#252033] placeholder:text-[#8E86A3] focus:border-[#673AB7] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="md:col-span-4">
            <select
              aria-label="Filter by location area"
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full rounded-xl border border-[#EAE6F3] bg-white px-3.5 py-2.5 text-sm text-[#252033] focus:border-[#673AB7] focus:outline-none"
            >
              {DEHRADUN_AREAS.map((area) => (
                <option key={area} value={area}>
                  Location: {area}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 rounded-xl bg-[#FAFAFC] p-1 border border-[#EAE6F3] md:col-span-3">
            {(['All', '₹', '₹₹', '₹₹₹'] as const).map((price) => (
              <button
                key={price}
                type="button"
                onClick={() => setSelectedPrice(price)}
                className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                  selectedPrice === price
                    ? 'bg-white text-[#45207A] shadow-xs'
                    : 'text-[#645D78] hover:text-[#252033]'
                }`}
              >
                {price === 'All' ? 'Any ₹' : price}
              </button>
            ))}
          </div>
        </div>

        {/* Category Segmented Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 border-t border-[#EAE6F3] pt-3.5">
          {['All', ...BUSINESS_CATEGORIES].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryChange(cat)}
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

      {/* Results Grid */}
      {catalogLoading ? (
        <CardGridSkeleton count={6} />
      ) : filteredBusinesses.length === 0 ? (
        <EmptyState
          icon={<Compass className="h-6 w-6" />}
          title="No matching businesses found"
          description="Try broadening your search terms, selecting All Dehradun, or resetting the price and category filters."
          action={
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-2 rounded-xl bg-[#673AB7] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#45207A]"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Filters
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredBusinesses.map((biz) => {
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
                      {biz.category} · {biz.priceRange}
                      {biz.isSampleData ? ' · Sample' : ''}
                    </span>
                    {typeof biz.rating === 'number' && biz.rating > 0 && (
                      <span className="inline-flex shrink-0 items-center gap-1 font-semibold tabular-nums text-[#252033]">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {biz.rating.toFixed(1)}
                      </span>
                    )}
                  </div>

                  <h2 className="mt-1.5 font-display text-base font-bold text-[#252033]">
                    {biz.name}
                  </h2>

                  <p className="mt-1 flex items-center gap-1.5 text-xs text-[#645D78]">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-[#673AB7]" />
                    <span className="truncate">{biz.location}</span>
                  </p>

                  <p className="mt-2.5 line-clamp-2 flex-1 text-sm leading-relaxed text-[#544D68]">
                    {biz.description}
                  </p>

                  <p className="mt-3 text-xs font-semibold text-[#45207A]">
                    Student discount: {biz.studentDiscount}
                  </p>

                  <div className="mt-4 flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedBusiness(biz)}
                      className="flex-1 rounded-xl bg-[#673AB7] px-3.5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#45207A] whitespace-nowrap"
                    >
                      View Details
                    </button>
                    {linked.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedOffer(linked[0])}
                        className="rounded-xl border border-[#EAE6F3] bg-[#FAFAFC] px-3.5 py-2.5 text-xs font-semibold text-[#45207A] transition-colors hover:bg-[#F3EDFF] whitespace-nowrap shrink-0"
                      >
                        View Offers ({linked.length})
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
