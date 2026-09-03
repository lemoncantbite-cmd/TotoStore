export type ListingType = 'passenger' | 'cargo' | 'mini';
export type BatteryCondition = 'excellent' | 'good' | 'average' | 'needs replacement';
export type ListingCondition = 'new' | 'used';
export type ListingStatus = 'active' | 'sold' | 'pending' | 'removed';

export interface ListingLocation {
  city: string;
  state: string;
  lat: number;
  lng: number;
}
export interface ListingPhoto {
  url: string;
  is_primary: boolean;
  sort_order: number;
}

export interface Listing {
  listingId: string;
  sellerId: string;
  title: string;
  price: number;
  model: string;
  type: ListingType;
  batteryCondition: BatteryCondition;
  batteryCapacity?: string;
  registrationNumber: string;
  registrationNumberLast4?: string;
  yearOfPurchase: number;
  condition: ListingCondition;
  kmRun?: number;
  description: string;
  photos: ListingPhoto[];
  location: ListingLocation;
  status: ListingStatus;
  createdAt: string | Date;
  updatedAt: string | Date;
  views?: number;

  // Compatibility alias for existing UI that still uses `id`.
  id?: string;
  tag?: 'New' | 'Used';
  sellerPhone?: string | null;
}
export const maskRegistrationNumber = (registrationNumber?: string) => {
  if (!registrationNumber) return '';
  const digits = registrationNumber.replace(/\s+/g, '');
  return digits.length <= 4 ? '****' : `****${digits.slice(-4)}`;
};

export const normalizeRegistrationNumber = (registrationNumber?: string) => {
  if (!registrationNumber) return '';
  return registrationNumber.trim().toUpperCase();
};
