import {
  collection,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch,
  getDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, handleFirestoreError, OperationType } from './firebase';
import {
  DEMO_BUSINESSES,
  DEMO_OFFERS,
  DEMO_SERVICES,
  DEMO_EVENTS,
} from '../data/seedData';
import type {
  Business,
  Offer,
  ServiceItem,
  EventItem,
  BookingStatus,
  EventRegistrationStatus,
  RedemptionStatus,
  PartnerApplicationStatus,
  BusinessCategory,
} from '../types/campusloop';

function stripUndefined<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== '') {
      result[key] = value;
    }
  }
  return result;
}

export function generateRedemptionCode(prefix = 'CL'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let part1 = '';
  let part2 = '';
  for (let i = 0; i < 4; i++) {
    part1 += chars[Math.floor(Math.random() * chars.length)];
    part2 += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${prefix}-${part1}-${part2}`;
}

export async function uploadCampusImage(file: File, folder: string): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 60);
  const storageRef = ref(storage, `${folder}/${Date.now()}_${safeName}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

// ------------------------------------------------------------------
// Seed Demo Catalog (Admin Only)
// ------------------------------------------------------------------
export async function seedDemoCatalog(): Promise<{
  businesses: number;
  offers: number;
  services: number;
  events: number;
}> {
  try {
    const batch = writeBatch(db);
    for (const biz of DEMO_BUSINESSES) {
      const { id, ...rest } = biz;
      const clean = stripUndefined(rest);
      batch.set(doc(db, 'businesses', id), {
        ...clean,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    for (const offer of DEMO_OFFERS) {
      const { id, ...rest } = offer;
      const clean = stripUndefined(rest);
      batch.set(doc(db, 'offers', id), {
        ...clean,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    for (const svc of DEMO_SERVICES) {
      const { id, ...rest } = svc;
      const clean = stripUndefined(rest);
      batch.set(doc(db, 'services', id), {
        ...clean,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    for (const evt of DEMO_EVENTS) {
      const { id, ...rest } = evt;
      const clean = stripUndefined(rest);
      batch.set(doc(db, 'events', id), {
        ...clean,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    await batch.commit();
    return {
      businesses: DEMO_BUSINESSES.length,
      offers: DEMO_OFFERS.length,
      services: DEMO_SERVICES.length,
      events: DEMO_EVENTS.length,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'seedDemoCatalog');
  }
}

// ------------------------------------------------------------------
// Offer Redemptions
// ------------------------------------------------------------------
export async function createOfferRedemption(params: {
  userId: string;
  userName: string;
  userEmail: string;
  offer: Offer;
}): Promise<{ id: string; code: string }> {
  const code = generateRedemptionCode('CL');
  const payload = {
    userId: params.userId,
    userName: params.userName.slice(0, 100),
    userEmail: params.userEmail.slice(0, 160),
    offerId: params.offer.id,
    offerTitle: params.offer.title.slice(0, 140),
    businessName: params.offer.businessName.slice(0, 120),
    discountLabel: params.offer.discountLabel.slice(0, 60),
    code,
    validUntil: params.offer.validUntil.slice(0, 40),
    status: 'Active' as RedemptionStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    const docRef = await addDoc(collection(db, 'redemptions'), payload);
    return { id: docRef.id, code };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'redemptions');
  }
}

export async function updateRedemptionStatus(
  redemptionId: string,
  status: RedemptionStatus
): Promise<void> {
  try {
    await updateDoc(doc(db, 'redemptions', redemptionId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `redemptions/${redemptionId}`);
  }
}

// ------------------------------------------------------------------
// Service Bookings
// ------------------------------------------------------------------
export async function createServiceBooking(params: {
  userId: string;
  userName: string;
  userEmail: string;
  service: ServiceItem;
  bookingDate: string;
  timeSlot: string;
  notes?: string;
}): Promise<string> {
  const payload = stripUndefined({
    userId: params.userId,
    userName: params.userName.slice(0, 100),
    userEmail: params.userEmail.slice(0, 160),
    serviceId: params.service.id,
    serviceTitle: params.service.title.slice(0, 140),
    providerName: params.service.providerName.slice(0, 120),
    category: params.service.category.slice(0, 60),
    bookingDate: params.bookingDate.slice(0, 40),
    timeSlot: params.timeSlot.slice(0, 40),
    notes: params.notes?.trim().slice(0, 500),
    price: Number(params.service.price),
    status: 'Pending' as BookingStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  try {
    const docRef = await addDoc(collection(db, 'bookings'), payload);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'bookings');
  }
}

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus
): Promise<void> {
  try {
    await updateDoc(doc(db, 'bookings', bookingId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `bookings/${bookingId}`);
  }
}

// ------------------------------------------------------------------
// Event Registrations
// ------------------------------------------------------------------
export async function createEventRegistration(params: {
  userId: string;
  userName: string;
  userEmail: string;
  studentId?: string;
  event: EventItem;
}): Promise<{ id: string; ticketCode: string }> {
  const ticketCode = generateRedemptionCode('EVT');
  const payload = stripUndefined({
    userId: params.userId,
    userName: params.userName.slice(0, 100),
    userEmail: params.userEmail.slice(0, 160),
    studentId: params.studentId?.trim().slice(0, 60),
    eventId: params.event.id,
    eventName: params.event.name.slice(0, 140),
    eventDate: params.event.date.slice(0, 40),
    eventTime: params.event.time.slice(0, 40),
    venue: params.event.venue.slice(0, 180),
    entryFee: Number(params.event.entryFee),
    ticketCode,
    status: 'Confirmed' as EventRegistrationStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  try {
    const docRef = await addDoc(collection(db, 'eventRegistrations'), payload);
    return { id: docRef.id, ticketCode };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'eventRegistrations');
  }
}

export async function updateEventRegistrationStatus(
  registrationId: string,
  status: EventRegistrationStatus
): Promise<void> {
  try {
    await updateDoc(doc(db, 'eventRegistrations', registrationId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(
      error,
      OperationType.UPDATE,
      `eventRegistrations/${registrationId}`
    );
  }
}

// ------------------------------------------------------------------
// Favorites / Wishlist
// ------------------------------------------------------------------
export function getFavoriteDocId(
  userId: string,
  itemType: 'business' | 'offer' | 'event',
  itemId: string
): string {
  return `${userId}_${itemType}_${itemId}`.slice(0, 128);
}

export async function addFavorite(params: {
  userId: string;
  itemId: string;
  itemType: 'business' | 'offer' | 'event';
  title: string;
  subtitle?: string;
  category: string;
  location?: string;
  imageUrl: string;
  discountLabel?: string;
}): Promise<void> {
  const favId = getFavoriteDocId(params.userId, params.itemType, params.itemId);
  const payload = stripUndefined({
    userId: params.userId,
    itemId: params.itemId,
    itemType: params.itemType,
    title: params.title.slice(0, 140),
    subtitle: params.subtitle?.slice(0, 140),
    category: params.category.slice(0, 60),
    location: params.location?.slice(0, 180),
    imageUrl: params.imageUrl.slice(0, 600),
    discountLabel: params.discountLabel?.slice(0, 120),
    createdAt: serverTimestamp(),
  });

  try {
    await setDoc(doc(db, 'favorites', favId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `favorites/${favId}`);
  }
}

export async function removeFavorite(favoriteId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'favorites', favoriteId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `favorites/${favoriteId}`);
  }
}

// ------------------------------------------------------------------
// Partner Applications
// ------------------------------------------------------------------
export async function submitPartnerApplication(params: {
  submittedBy: string;
  businessName: string;
  ownerName: string;
  category: BusinessCategory;
  contactNumber: string;
  email: string;
  address: string;
  proposedDiscount: string;
  description: string;
  imageUrl?: string;
}): Promise<string> {
  const payload = stripUndefined({
    submittedBy: params.submittedBy,
    businessName: params.businessName.trim().slice(0, 120),
    ownerName: params.ownerName.trim().slice(0, 100),
    category: params.category,
    contactNumber: params.contactNumber.trim().slice(0, 30),
    email: params.email.trim().slice(0, 160),
    address: params.address.trim().slice(0, 240),
    proposedDiscount: params.proposedDiscount.trim().slice(0, 120),
    description: params.description.trim().slice(0, 1000),
    imageUrl: params.imageUrl?.trim().slice(0, 600),
    status: 'Pending' as PartnerApplicationStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  try {
    const docRef = await addDoc(collection(db, 'partnerApplications'), payload);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'partnerApplications');
  }
}

export async function updatePartnerApplicationStatus(
  applicationId: string,
  status: PartnerApplicationStatus
): Promise<void> {
  try {
    await updateDoc(doc(db, 'partnerApplications', applicationId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(
      error,
      OperationType.UPDATE,
      `partnerApplications/${applicationId}`
    );
  }
}

// ------------------------------------------------------------------
// Admin CRUD for Businesses, Offers, Services, Events
// ------------------------------------------------------------------
export async function saveBusiness(
  data: Omit<Business, 'id' | 'createdAt' | 'updatedAt'>,
  existingId?: string
): Promise<string> {
  const clean = stripUndefined({
    ...data,
    name: data.name.trim().slice(0, 120),
    cuisine: data.cuisine?.trim().slice(0, 80),
    location: data.location.trim().slice(0, 180),
    area: data.area.trim().slice(0, 80),
    description: data.description.trim().slice(0, 1000),
    studentDiscount: data.studentDiscount.trim().slice(0, 120),
    phone: data.phone?.trim().slice(0, 30),
    hours: data.hours?.trim().slice(0, 80),
    imageUrl: data.imageUrl.trim().slice(0, 600),
  });

  try {
    if (existingId) {
      await updateDoc(doc(db, 'businesses', existingId), {
        ...clean,
        updatedAt: serverTimestamp(),
      });
      return existingId;
    }
    const docRef = await addDoc(collection(db, 'businesses'), {
      ...clean,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(
      error,
      existingId ? OperationType.UPDATE : OperationType.CREATE,
      existingId ? `businesses/${existingId}` : 'businesses'
    );
  }
}

export async function deleteBusiness(businessId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'businesses', businessId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `businesses/${businessId}`);
  }
}

export async function saveOffer(
  data: Omit<Offer, 'id' | 'createdAt' | 'updatedAt'>,
  existingId?: string
): Promise<string> {
  const clean = stripUndefined({
    ...data,
    businessName: data.businessName.trim().slice(0, 120),
    title: data.title.trim().slice(0, 140),
    discountPercentage: Math.min(100, Math.max(1, Number(data.discountPercentage))),
    discountLabel: data.discountLabel.trim().slice(0, 60),
    description: data.description.trim().slice(0, 800),
    validUntil: data.validUntil.trim().slice(0, 40),
    terms: data.terms.trim().slice(0, 600),
    imageUrl: data.imageUrl.trim().slice(0, 600),
  });

  try {
    if (existingId) {
      await updateDoc(doc(db, 'offers', existingId), {
        ...clean,
        updatedAt: serverTimestamp(),
      });
      return existingId;
    }
    const docRef = await addDoc(collection(db, 'offers'), {
      ...clean,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(
      error,
      existingId ? OperationType.UPDATE : OperationType.CREATE,
      existingId ? `offers/${existingId}` : 'offers'
    );
  }
}

export async function deleteOffer(offerId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'offers', offerId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `offers/${offerId}`);
  }
}

export async function saveService(
  data: Omit<ServiceItem, 'id' | 'createdAt' | 'updatedAt'>,
  existingId?: string
): Promise<string> {
  const clean = stripUndefined({
    ...data,
    providerName: data.providerName.trim().slice(0, 120),
    title: data.title.trim().slice(0, 140),
    description: data.description.trim().slice(0, 800),
    price: Math.max(0, Number(data.price)),
    priceUnit: data.priceUnit.trim().slice(0, 40),
    location: data.location.trim().slice(0, 160),
    contactPhone: data.contactPhone.trim().slice(0, 30),
    contactEmail: data.contactEmail?.trim().slice(0, 160),
    imageUrl: data.imageUrl.trim().slice(0, 600),
  });

  try {
    if (existingId) {
      await updateDoc(doc(db, 'services', existingId), {
        ...clean,
        updatedAt: serverTimestamp(),
      });
      return existingId;
    }
    const docRef = await addDoc(collection(db, 'services'), {
      ...clean,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(
      error,
      existingId ? OperationType.UPDATE : OperationType.CREATE,
      existingId ? `services/${existingId}` : 'services'
    );
  }
}

export async function deleteService(serviceId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'services', serviceId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `services/${serviceId}`);
  }
}

export async function saveEvent(
  data: Omit<EventItem, 'id' | 'createdAt' | 'updatedAt'>,
  existingId?: string
): Promise<string> {
  const clean = stripUndefined({
    ...data,
    name: data.name.trim().slice(0, 140),
    date: data.date.trim().slice(0, 40),
    time: data.time.trim().slice(0, 40),
    venue: data.venue.trim().slice(0, 180),
    entryFee: Math.max(0, Number(data.entryFee)),
    capacity: Math.max(1, Number(data.capacity)),
    organizer: data.organizer.trim().slice(0, 120),
    description: data.description.trim().slice(0, 1000),
    imageUrl: data.imageUrl.trim().slice(0, 600),
  });

  try {
    if (existingId) {
      await updateDoc(doc(db, 'events', existingId), {
        ...clean,
        updatedAt: serverTimestamp(),
      });
      return existingId;
    }
    const docRef = await addDoc(collection(db, 'events'), {
      ...clean,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(
      error,
      existingId ? OperationType.UPDATE : OperationType.CREATE,
      existingId ? `events/${existingId}` : 'events'
    );
  }
}

export async function deleteEvent(eventId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'events', eventId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `events/${eventId}`);
  }
}

export async function checkIsAdminDoc(uid: string): Promise<boolean> {
  try {
    const snap = await getDoc(doc(db, 'admins', uid));
    return snap.exists();
  } catch {
    return false;
  }
}
