import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, MapPin, ArrowUpRight } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { removeFavorite } from '../lib/firestoreService';
import { MediaImage } from '../components/ui/MediaImage';
import { EmptyState } from '../components/ui/States';

type FilterType = 'all' | 'business' | 'offer' | 'event';

export function WishlistPage() {
  const { myFavorites } = useData();
  const { showToast } = useToast();
  const [filter, setFilter] = useState<FilterType>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return myFavorites;
    return myFavorites.filter((f) => f.itemType === filter);
  }, [myFavorites, filter]);

  const handleRemove = async (id: string, title: string) => {
    try {
      await removeFavorite(id);
      showToast('Removed from Wishlist', 'info', title);
    } catch {
      showToast('Could not remove item', 'error');
    }
  };

  const getDestination = (itemType: 'business' | 'offer' | 'event') => {
    if (itemType === 'offer') return '/offers';
    if (itemType === 'event') return '/events';
    return '/explore';
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#252033] sm:text-3xl">
            My Wishlist
          </h1>
          <p className="mt-1 text-sm text-[#645D78]">
            Saved Dehradun cafés, exclusive offers, and upcoming campus events.
          </p>
        </div>

        <div className="inline-flex items-center gap-1 rounded-xl border border-[#EAE6F3] bg-white p-1">
          {(
            [
              { key: 'all', label: `All (${myFavorites.length})` },
              {
                key: 'business',
                label: `Places (${myFavorites.filter((f) => f.itemType === 'business').length})`,
              },
              {
                key: 'offer',
                label: `Offers (${myFavorites.filter((f) => f.itemType === 'offer').length})`,
              },
              {
                key: 'event',
                label: `Events (${myFavorites.filter((f) => f.itemType === 'event').length})`,
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                filter === tab.key
                  ? 'bg-[#673AB7] text-white'
                  : 'text-[#544D68] hover:text-[#252033]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Heart className="h-6 w-6" />}
          title="Your wishlist is empty"
          description="Tap the heart icon on any Dehradun business, student offer, or event to bookmark it here for later."
          action={
            <Link
              to="/explore"
              className="inline-flex rounded-xl bg-[#673AB7] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#45207A]"
            >
              Explore Places
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <article
              key={item.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-[#EAE6F3] bg-white"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-[#F3EDFF]">
                <MediaImage
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex flex-1 flex-col p-5">
                <p className="text-xs text-[#645D78]">
                  {item.itemType === 'business'
                    ? 'Business'
                    : item.itemType === 'offer'
                    ? 'Offer'
                    : 'Event'}{' '}
                  · {item.category}
                </p>
                <h2 className="mt-1.5 font-display text-base font-bold text-[#252033]">
                  {item.title}
                </h2>
                {item.subtitle && (
                  <p className="mt-1 text-xs text-[#645D78]">{item.subtitle}</p>
                )}
                {item.location && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-[#645D78]">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-[#673AB7]" />
                    <span className="truncate">{item.location}</span>
                  </p>
                )}
                {item.discountLabel && (
                  <p className="mt-2.5 flex-1 text-xs font-semibold text-[#45207A]">
                    {item.discountLabel}
                  </p>
                )}

                <div className="mt-4 flex items-center gap-2.5 border-t border-[#EAE6F3] pt-4">
                  <Link
                    to={getDestination(item.itemType)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#673AB7] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#45207A]"
                  >
                    Open Section
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id, item.title)}
                    aria-label="Remove from wishlist"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#EAE6F3] text-[#645D78] transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
