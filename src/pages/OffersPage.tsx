import { useState, useMemo } from 'react';
import { Percent, Search, Heart, Calendar, RotateCcw } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { MediaImage } from '../components/ui/MediaImage';
import { CardGridSkeleton, EmptyState } from '../components/ui/States';
import { OfferRedeemModal } from '../components/modals/OfferRedeemModal';
import { OFFER_CATEGORIES, type Offer } from '../types/campusloop';

export function OffersPage() {
  const { offers, catalogLoading, isFavorite, toggleFavorite } = useData();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeOffer, setActiveOffer] = useState<Offer | null>(null);

  const filteredOffers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return offers
      .filter((o) => o.status === 'active')
      .filter((o) => selectedCategory === 'All' || o.category === selectedCategory)
      .filter((o) => {
        if (!q) return true;
        return (
          o.title.toLowerCase().includes(q) ||
          o.businessName.toLowerCase().includes(q) ||
          o.category.toLowerCase().includes(q) ||
          o.description.toLowerCase().includes(q)
        );
      });
  }, [offers, searchQuery, selectedCategory]);

  const handleToggleWishlist = async (offer: Offer) => {
    try {
      const added = await toggleFavorite({
        itemType: 'offer',
        itemId: offer.id,
        title: offer.title,
        subtitle: offer.businessName,
        category: offer.category,
        imageUrl: offer.imageUrl,
        discountLabel: offer.discountLabel,
      });
      showToast(added ? 'Offer saved to Wishlist' : 'Removed from Wishlist', 'info');
    } catch {
      showToast('Unable to update Wishlist', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#252033] sm:text-3xl">
            Exclusive Student Offers
          </h1>
          <p className="mt-1 text-sm text-[#645D78]">
            Generate unique student discount codes saved instantly to your CampusLoop profile.
          </p>
        </div>
        <p className="text-sm font-medium tabular-nums text-[#645D78]">
          {filteredOffers.length} active offer{filteredOffers.length === 1 ? '' : 's'}
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
            placeholder="Search deals by café, brand, or discount..."
            className="w-full rounded-xl border border-[#EAE6F3] bg-[#FAFAFC] py-2.5 pl-10 pr-4 text-sm text-[#252033] placeholder:text-[#8E86A3] focus:border-[#673AB7] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 border-t border-[#EAE6F3] pt-3.5">
          {['All', ...OFFER_CATEGORIES].map((cat) => (
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

      {/* Offers Grid */}
      {catalogLoading ? (
        <CardGridSkeleton count={6} />
      ) : filteredOffers.length === 0 ? (
        <EmptyState
          icon={<Percent className="h-6 w-6" />}
          title="No offers found in this category"
          description="Try another offer category or clear your search query."
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
              Show All Offers
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredOffers.map((offer) => {
            const saved = isFavorite('offer', offer.id);
            return (
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
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A132B]/75 via-transparent to-black/15" />
                  <button
                    type="button"
                    onClick={() => handleToggleWishlist(offer)}
                    aria-label={saved ? 'Remove offer from wishlist' : 'Save offer to wishlist'}
                    className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                      saved
                        ? 'bg-[#673AB7] text-white'
                        : 'bg-white/90 text-[#252033] hover:bg-white'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
                  </button>
                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
                    <span className="font-display text-2xl font-extrabold tabular-nums">
                      {offer.discountPercentage}% OFF
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-white/90 tabular-nums">
                      <Calendar className="h-3.5 w-3.5" />
                      {offer.validUntil}
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs text-[#645D78]">
                    {offer.businessName} · {offer.category}
                    {offer.isSampleData ? ' · Sample' : ''}
                  </p>
                  <h2 className="mt-1.5 font-display text-base font-bold text-[#252033]">
                    {offer.title}
                  </h2>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#544D68]">
                    {offer.description}
                  </p>
                  <p className="mt-3 line-clamp-2 flex-1 border-t border-[#EAE6F3] pt-3 text-xs text-[#645D78]">
                    Terms: {offer.terms}
                  </p>

                  <button
                    type="button"
                    onClick={() => setActiveOffer(offer)}
                    className="mt-4 w-full rounded-xl bg-[#673AB7] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#45207A]"
                  >
                    Redeem Now
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <OfferRedeemModal
        offer={activeOffer}
        onClose={() => setActiveOffer(null)}
      />
    </div>
  );
}
