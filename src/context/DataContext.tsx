import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db, isFirebaseConfigured, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from './AuthContext';
import {
  addFavorite,
  removeFavorite,
  getFavoriteDocId,
} from '../lib/firestoreService';
import type {
  Business,
  Offer,
  ServiceItem,
  EventItem,
  Booking,
  EventRegistration,
  Redemption,
  Favorite,
  PartnerApplication,
  UserProfile,
} from '../types/campusloop';

interface DataContextValue {
  businesses: Business[];
  offers: Offer[];
  services: ServiceItem[];
  events: EventItem[];
  myBookings: Booking[];
  myEventRegistrations: EventRegistration[];
  myRedemptions: Redemption[];
  myFavorites: Favorite[];
  myPartnerApplications: PartnerApplication[];
  // Admin collections (populated only when user is verified admin)
  allUsers: UserProfile[];
  allBookings: Booking[];
  allEventRegistrations: EventRegistration[];
  allPartnerApplications: PartnerApplication[];
  catalogLoading: boolean;
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
  selectedArea: string;
  setSelectedArea: (area: string) => void;
  isFavorite: (itemType: 'business' | 'offer' | 'event', itemId: string) => boolean;
  toggleFavorite: (params: {
    itemType: 'business' | 'offer' | 'event';
    itemId: string;
    title: string;
    subtitle?: string;
    category: string;
    location?: string;
    imageUrl: string;
    discountLabel?: string;
  }) => Promise<boolean>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user, authReady, isAdmin } = useAuth();

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [myEventRegistrations, setMyEventRegistrations] = useState<EventRegistration[]>([]);
  const [myRedemptions, setMyRedemptions] = useState<Redemption[]>([]);
  const [myFavorites, setMyFavorites] = useState<Favorite[]>([]);
  const [myPartnerApplications, setMyPartnerApplications] = useState<PartnerApplication[]>([]);

  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [allEventRegistrations, setAllEventRegistrations] = useState<EventRegistration[]>([]);
  const [allPartnerApplications, setAllPartnerApplications] = useState<PartnerApplication[]>([]);

  const [catalogLoading, setCatalogLoading] = useState(true);
  const [globalSearch, setGlobalSearch] = useState('');
  const [selectedArea, setSelectedArea] = useState('All Dehradun');

  useEffect(() => {
    if (!isFirebaseConfigured || !authReady || !user) {
      setBusinesses([]);
      setOffers([]);
      setServices([]);
      setEvents([]);
      setMyBookings([]);
      setMyEventRegistrations([]);
      setMyRedemptions([]);
      setMyFavorites([]);
      setMyPartnerApplications([]);
      setAllUsers([]);
      setAllBookings([]);
      setAllEventRegistrations([]);
      setAllPartnerApplications([]);
      setCatalogLoading(false);
      return;
    }

    setCatalogLoading(true);
    const unsubs: Unsubscribe[] = [];
    let settled = 0;
    const markSettled = () => {
      settled += 1;
      if (settled >= 4) setCatalogLoading(false);
    };

    // Active public catalog subscriptions (rules enforce status == 'active' for students)
    const bizQuery = isAdmin
      ? query(collection(db, 'businesses'))
      : query(collection(db, 'businesses'), where('status', '==', 'active'));
    unsubs.push(
      onSnapshot(
        bizQuery,
        (snap) => {
          setBusinesses(
            snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Business, 'id'>) }))
          );
          markSettled();
        },
        (err) => {
          markSettled();
          handleFirestoreError(err, OperationType.LIST, 'businesses');
        }
      )
    );

    const offerQuery = isAdmin
      ? query(collection(db, 'offers'))
      : query(collection(db, 'offers'), where('status', '==', 'active'));
    unsubs.push(
      onSnapshot(
        offerQuery,
        (snap) => {
          setOffers(
            snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Offer, 'id'>) }))
          );
          markSettled();
        },
        (err) => {
          markSettled();
          handleFirestoreError(err, OperationType.LIST, 'offers');
        }
      )
    );

    const svcQuery = isAdmin
      ? query(collection(db, 'services'))
      : query(collection(db, 'services'), where('status', '==', 'active'));
    unsubs.push(
      onSnapshot(
        svcQuery,
        (snap) => {
          setServices(
            snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ServiceItem, 'id'>) }))
          );
          markSettled();
        },
        (err) => {
          markSettled();
          handleFirestoreError(err, OperationType.LIST, 'services');
        }
      )
    );

    const evtQuery = isAdmin
      ? query(collection(db, 'events'))
      : query(collection(db, 'events'), where('status', '==', 'active'));
    unsubs.push(
      onSnapshot(
        evtQuery,
        (snap) => {
          setEvents(
            snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<EventItem, 'id'>) }))
          );
          markSettled();
        },
        (err) => {
          markSettled();
          handleFirestoreError(err, OperationType.LIST, 'events');
        }
      )
    );

    // User-scoped private records
    unsubs.push(
      onSnapshot(
        query(collection(db, 'bookings'), where('userId', '==', user.uid)),
        (snap) => {
          const list = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<Booking, 'id'>),
          }));
          list.sort(
            (a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
          );
          setMyBookings(list);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'bookings')
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'eventRegistrations'), where('userId', '==', user.uid)),
        (snap) => {
          const list = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<EventRegistration, 'id'>),
          }));
          list.sort(
            (a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
          );
          setMyEventRegistrations(list);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'eventRegistrations')
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'redemptions'), where('userId', '==', user.uid)),
        (snap) => {
          const list = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<Redemption, 'id'>),
          }));
          list.sort(
            (a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
          );
          setMyRedemptions(list);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'redemptions')
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'favorites'), where('userId', '==', user.uid)),
        (snap) => {
          const list = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<Favorite, 'id'>),
          }));
          list.sort(
            (a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
          );
          setMyFavorites(list);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'favorites')
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'partnerApplications'), where('submittedBy', '==', user.uid)),
        (snap) => {
          const list = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<PartnerApplication, 'id'>),
          }));
          list.sort(
            (a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
          );
          setMyPartnerApplications(list);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'partnerApplications')
      )
    );

    // Admin global collections
    if (isAdmin) {
      unsubs.push(
        onSnapshot(
          collection(db, 'users'),
          (snap) => {
            setAllUsers(snap.docs.map((d) => d.data() as UserProfile));
          },
          (err) => console.warn('Admin users list error:', err)
        )
      );
      unsubs.push(
        onSnapshot(
          collection(db, 'bookings'),
          (snap) => {
            const list = snap.docs.map((d) => ({
              id: d.id,
              ...(d.data() as Omit<Booking, 'id'>),
            }));
            list.sort(
              (a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
            );
            setAllBookings(list);
          },
          (err) => console.warn('Admin bookings list error:', err)
        )
      );
      unsubs.push(
        onSnapshot(
          collection(db, 'eventRegistrations'),
          (snap) => {
            const list = snap.docs.map((d) => ({
              id: d.id,
              ...(d.data() as Omit<EventRegistration, 'id'>),
            }));
            list.sort(
              (a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
            );
            setAllEventRegistrations(list);
          },
          (err) => console.warn('Admin registrations list error:', err)
        )
      );
      unsubs.push(
        onSnapshot(
          collection(db, 'partnerApplications'),
          (snap) => {
            const list = snap.docs.map((d) => ({
              id: d.id,
              ...(d.data() as Omit<PartnerApplication, 'id'>),
            }));
            list.sort(
              (a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
            );
            setAllPartnerApplications(list);
          },
          (err) => console.warn('Admin partner applications list error:', err)
        )
      );
    }

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [authReady, user, isAdmin]);

  const favoriteIdSet = useMemo(
    () => new Set(myFavorites.map((f) => f.id)),
    [myFavorites]
  );

  const isFavorite = useCallback(
    (itemType: 'business' | 'offer' | 'event', itemId: string) => {
      if (!user) return false;
      return favoriteIdSet.has(getFavoriteDocId(user.uid, itemType, itemId));
    },
    [user, favoriteIdSet]
  );

  const toggleFavorite = useCallback(
    async (params: {
      itemType: 'business' | 'offer' | 'event';
      itemId: string;
      title: string;
      subtitle?: string;
      category: string;
      location?: string;
      imageUrl: string;
      discountLabel?: string;
    }): Promise<boolean> => {
      if (!user) return false;
      const favId = getFavoriteDocId(user.uid, params.itemType, params.itemId);
      if (favoriteIdSet.has(favId)) {
        await removeFavorite(favId);
        return false;
      }
      await addFavorite({
        userId: user.uid,
        ...params,
      });
      return true;
    },
    [user, favoriteIdSet]
  );

  return (
    <DataContext.Provider
      value={{
        businesses,
        offers,
        services,
        events,
        myBookings,
        myEventRegistrations,
        myRedemptions,
        myFavorites,
        myPartnerApplications,
        allUsers,
        allBookings,
        allEventRegistrations,
        allPartnerApplications,
        catalogLoading,
        globalSearch,
        setGlobalSearch,
        selectedArea,
        setSelectedArea,
        isFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error('useData must be used within a DataProvider');
  }
  return ctx;
}
