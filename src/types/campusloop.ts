import type { Timestamp } from 'firebase/firestore';

export type UserRole = 'student' | 'admin';

export type BusinessCategory =
  | 'Food & Cafés'
  | 'Shopping'
  | 'Beauty & Salon'
  | 'Fitness'
  | 'Entertainment'
  | 'Events'
  | 'Services';

export type OfferCategory =
  | 'Food Deals'
  | 'Café Offers'
  | 'Shopping Discounts'
  | 'Salon Offers'
  | 'Fitness Deals'
  | 'Entertainment Offers';

export type ServiceCategory =
  | 'Laundry'
  | 'Printing and Photocopy'
  | 'Salon and Grooming'
  | 'Fitness'
  | 'Transportation'
  | 'Repair Services'
  | 'Other Student Services';

export type EventCategory =
  | 'College Events'
  | 'Workshops'
  | 'Music Events'
  | 'Competitions'
  | 'Parties'
  | 'Local Activities';

export type PriceRange = '₹' | '₹₹' | '₹₹₹';

export type BookingStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
export type EventRegistrationStatus = 'Confirmed' | 'Cancelled';
export type RedemptionStatus = 'Active' | 'Used' | 'Expired';
export type PartnerApplicationStatus = 'Pending' | 'Approved' | 'Rejected';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  university: string;
  studentId?: string;
  photoURL?: string;
  role: UserRole;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface Business {
  id: string;
  name: string;
  category: BusinessCategory;
  cuisine?: string;
  location: string;
  area: string;
  priceRange: PriceRange;
  description: string;
  studentDiscount: string;
  rating?: number;
  imageUrl: string;
  phone?: string;
  hours?: string;
  isFeatured: boolean;
  isPopular: boolean;
  isRecommended: boolean;
  isSampleData: boolean;
  status: 'active' | 'archived';
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface Offer {
  id: string;
  businessId?: string;
  businessName: string;
  title: string;
  category: OfferCategory;
  discountPercentage: number;
  discountLabel: string;
  description: string;
  validUntil: string;
  terms: string;
  imageUrl: string;
  isFeatured: boolean;
  isSampleData: boolean;
  status: 'active' | 'expired' | 'archived';
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface ServiceItem {
  id: string;
  providerName: string;
  title: string;
  category: ServiceCategory;
  description: string;
  price: number;
  priceUnit: string;
  location: string;
  contactPhone: string;
  contactEmail?: string;
  imageUrl: string;
  isSampleData: boolean;
  status: 'active' | 'archived';
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface EventItem {
  id: string;
  name: string;
  category: EventCategory;
  date: string;
  time: string;
  venue: string;
  entryFee: number;
  capacity: number;
  organizer: string;
  description: string;
  imageUrl: string;
  isSampleData: boolean;
  status: 'active' | 'cancelled' | 'completed';
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  serviceId: string;
  serviceTitle: string;
  providerName: string;
  category: string;
  bookingDate: string;
  timeSlot: string;
  notes?: string;
  price: number;
  status: BookingStatus;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface EventRegistration {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  studentId?: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  entryFee: number;
  ticketCode: string;
  status: EventRegistrationStatus;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface Redemption {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  offerId: string;
  offerTitle: string;
  businessName: string;
  discountLabel: string;
  code: string;
  validUntil: string;
  status: RedemptionStatus;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface Favorite {
  id: string;
  userId: string;
  itemId: string;
  itemType: 'business' | 'offer' | 'event';
  title: string;
  subtitle?: string;
  category: string;
  location?: string;
  imageUrl: string;
  discountLabel?: string;
  createdAt?: Timestamp | null;
}

export interface PartnerApplication {
  id: string;
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
  status: PartnerApplicationStatus;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export const BUSINESS_CATEGORIES: BusinessCategory[] = [
  'Food & Cafés',
  'Shopping',
  'Beauty & Salon',
  'Fitness',
  'Entertainment',
  'Events',
  'Services',
];

export const OFFER_CATEGORIES: OfferCategory[] = [
  'Food Deals',
  'Café Offers',
  'Shopping Discounts',
  'Salon Offers',
  'Fitness Deals',
  'Entertainment Offers',
];

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  'Laundry',
  'Printing and Photocopy',
  'Salon and Grooming',
  'Fitness',
  'Transportation',
  'Repair Services',
  'Other Student Services',
];

export const EVENT_CATEGORIES: EventCategory[] = [
  'College Events',
  'Workshops',
  'Music Events',
  'Competitions',
  'Parties',
  'Local Activities',
];

export const DEHRADUN_AREAS: string[] = [
  'All Dehradun',
  'Selaqui / DBS Campus',
  'Premnagar',
  'Rajpur Road',
  'Jakhan',
  'Clock Tower',
  'Pacific Mall',
];

export const BOOTSTRAPPED_ADMIN_EMAIL = 'mrpiyushraj7@gmail.com';
