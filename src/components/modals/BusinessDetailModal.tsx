import { X, MapPin, Clock, Phone, Star, Heart, Tag, ArrowRight } from 'lucide-react';
import { MediaImage } from '../ui/MediaImage';
import type { Business, Offer } from '../../types/campusloop';

interface BusinessDetailModalProps {
  business: Business | null;
  linkedOffers: Offer[];
  isSaved: boolean;
  onToggleSave: () => void;
  onSelectOffer: (offer: Offer) => void;
  onClose: () => void;
}

export function BusinessDetailModal({
  business,
  linkedOffers,
  isSaved,
  onToggleSave,
  onSelectOffer,
  onClose,
}: BusinessDetailModalProps) {
  if (!business) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#252033]/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="business-detail-title"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#EAE6F3] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#F3EDFF]">
          <MediaImage
            src={business.imageUrl}
            alt={business.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A132B]/75 via-transparent to-black/25" />
          <div className="absolute right-4 top-4 flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleSave}
              aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                isSaved
                  ? 'bg-[#673AB7] text-white'
                  : 'bg-white/90 text-[#252033] hover:bg-white'
              }`}
            >
              <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close details"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 text-[#252033] transition-colors hover:bg-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="absolute bottom-4 left-6 right-6 text-white">
            <p className="text-xs font-medium text-white/85">
              {business.category}
              {business.cuisine ? ` · ${business.cuisine}` : ''}
              {' · '}
              {business.priceRange}
              {business.isSampleData ? ' · Sample listing' : ''}
            </p>
            <h2
              id="business-detail-title"
              className="mt-1 font-display text-2xl font-bold tracking-tight"
            >
              {business.name}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EAE6F3] pb-5">
            <div className="space-y-1.5 text-sm text-[#645D78]">
              <p className="flex items-center gap-2 text-[#252033]">
                <MapPin className="h-4 w-4 shrink-0 text-[#673AB7]" />
                <span>{business.location}</span>
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#645D78]">
                {business.hours && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {business.hours}
                  </span>
                )}
                {business.phone && (
                  <span className="inline-flex items-center gap-1.5 tabular-nums">
                    <Phone className="h-3.5 w-3.5" />
                    {business.phone}
                  </span>
                )}
              </div>
            </div>

            {typeof business.rating === 'number' && business.rating > 0 && (
              <div className="flex items-center gap-1.5 rounded-xl bg-[#FAFAFC] px-3.5 py-2 text-sm font-semibold tabular-nums text-[#252033] border border-[#EAE6F3]">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span>{business.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <p className="mt-5 text-sm leading-relaxed text-[#47415A]">
            {business.description}
          </p>

          {/* Student Discount Callout */}
          <div className="mt-5 rounded-xl bg-[#F3EDFF] px-4 py-3.5">
            <p className="flex items-center gap-2 text-xs font-semibold text-[#45207A]">
              <Tag className="h-3.5 w-3.5" />
              Student Perk
              {business.isSampleData && (
                <span className="font-normal text-[#645D78]">
                  · Demonstration sample (not a verified partnership)
                </span>
              )}
            </p>
            <p className="mt-1 text-sm font-semibold text-[#252033]">
              {business.studentDiscount}
            </p>
          </div>

          {/* Linked Active Offers */}
          {linkedOffers.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-[#252033]">
                Available Student Offers ({linkedOffers.length})
              </h3>
              <div className="mt-3 space-y-3">
                {linkedOffers.map((offer) => (
                  <div
                    key={offer.id}
                    className="flex flex-col justify-between gap-3 rounded-xl border border-[#EAE6F3] p-4 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#673AB7]">
                        {offer.discountLabel} · Valid until {offer.validUntil}
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-[#252033]">
                        {offer.title}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSelectOffer(offer)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#673AB7] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#45207A] whitespace-nowrap shrink-0"
                    >
                      Redeem Now
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#EAE6F3] pt-5">
            <button
              type="button"
              onClick={onToggleSave}
              className="rounded-xl border border-[#EAE6F3] bg-white px-4 py-2.5 text-sm font-medium text-[#252033] transition-colors hover:bg-[#FAFAFC]"
            >
              {isSaved ? 'Saved in Wishlist' : 'Save to Wishlist'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-[#252033] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#3A3250]"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
