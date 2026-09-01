import { supabase } from '../lib/supabaseClient';


export type ListingCondition = 'new' | 'used';
export type ListingStatus = 'active' | 'sold' | 'pending' | 'removed';
export type BatteryCondition = 'excellent' | 'good' | 'average' | 'needs replacement';

export interface ListingRecord {
  id: string;
  seller_id: string;
  title: string;
  description: string | null;
  price: number;
  model: string;
  category: string;
  year: number | null;
  battery_condition: BatteryCondition | null;
  registration_number: string | null;
  location_city: string | null;
  location_state: string | null;
  location_country: string | null;
  condition: ListingCondition | null;
  status: ListingStatus;
  created_at: string;
  updated_at: string;
  photos?: Array<{ id: string; url: string; is_primary: boolean; sort_order: number }>;
  seller?: { full_name: string | null; phone: string | null };
}

export interface CreateListingInput {
  title: string;
  description?: string;
  price: number;
  model: string;
  category: string;
  year: number;
  battery_condition: BatteryCondition;
  registration_number: string;
  location_city: string;
  location_state: string;
  location_country?: string;
  condition: ListingCondition;
  status?: ListingStatus;
  photo_urls?: string[];
}

export interface ListListingsParams {
  page?: number;
  pageSize?: number;
  sellerId?: string;
  search?: string;
  status?: ListingStatus;
  category?: string;
}

export interface ListingsPageResult {
  data: ListingRecord[];
  count: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

const normalizeListingPayload = (input: CreateListingInput) => ({
  title: input.title.trim(),
  description: input.description?.trim() || null,
  price: Number(input.price),
  model: input.model.trim(),
  category: input.category,
  year: Number(input.year),
  battery_condition: input.battery_condition,
  registration_number: input.registration_number.trim().toUpperCase(),
  location_city: input.location_city.trim(),
  location_state: input.location_state.trim().toUpperCase(),
  location_country: input.location_country?.trim() || 'India',
  condition: input.condition,
  status: input.status || 'active',
});

export async function getCurrentUserId() {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error('You must be logged in to manage listings.');
  return userData.user.id;
}

export async function listListings({
  page = 1,
  pageSize = 10,
  sellerId,
  search,
  status,
  category,
}: ListListingsParams = {}): Promise<ListingsPageResult> {
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  let query = supabase
    .from('listings')
    .select('*, photos(id, url, is_primary, sort_order), seller:public_seller_info(full_name, phone)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(start, end);

  if (sellerId) query = query.eq('seller_id', sellerId);
  if (status) query = query.eq('status', status);
  if (category) query = query.eq('category', category);
  if (search && search.trim()) {
    const q = search.trim();
    query = query.or(`title.ilike.%${q}%,model.ilike.%${q}%,registration_number.ilike.%${q}%`);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data: (data as ListingRecord[]) || [],
    count: count || 0,
    page,
    pageSize,
    hasMore: end + 1 < (count || 0),
  };
}

export async function getListingById(id: string): Promise<ListingRecord> {
  const { data, error } = await supabase
    .from('listings')
   .select('*, photos(id, url, is_primary, sort_order), seller:public_seller_info(full_name, phone)', { count: 'exact' })
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as ListingRecord;
}

export async function createListing(input: CreateListingInput): Promise<ListingRecord> {
  const sellerId = await getCurrentUserId();
  const payload = {
    ...normalizeListingPayload(input),
    seller_id: sellerId,
  };

  const { data: listingData, error: listingError } = await supabase
    .from('listings')
    .insert([payload])
    .select()
    .single();

  if (listingError) throw listingError;

  await addListingPhotos(listingData.id, input.photo_urls || []);

  return listingData as ListingRecord;
}

export async function addListingPhotos(listingId: string, photoUrls: string[]): Promise<void> {
  const urls = photoUrls.filter(Boolean);
  if (urls.length === 0) return;

  const { data: existingPhotos, error: existingPhotosError } = await supabase
    .from('photos')
    .select('id')
    .eq('listing_id', listingId);
  if (existingPhotosError) throw existingPhotosError;

  const { error: photoError } = await supabase.from('photos').insert(
    urls.map((url, index) => ({
      listing_id: listingId,
      url,
      is_primary: (existingPhotos?.length || 0) === 0 && index === 0,
      sort_order: (existingPhotos?.length || 0) + index,
    })),
  );

  if (photoError) throw photoError;
}

export async function updateListing(id: string, input: Partial<CreateListingInput>): Promise<ListingRecord> {
  const sellerId = await getCurrentUserId();
  const payload: Record<string, unknown> = {};

  if (input.title !== undefined) payload.title = input.title.trim();
  if (input.description !== undefined) payload.description = input.description?.trim() || null;
  if (input.price !== undefined) payload.price = Number(input.price);
  if (input.model !== undefined) payload.model = input.model.trim();
  if (input.category !== undefined) payload.category = input.category;
  if (input.year !== undefined) payload.year = Number(input.year);
  if (input.battery_condition !== undefined) payload.battery_condition = input.battery_condition;
  if (input.registration_number !== undefined) payload.registration_number = input.registration_number.trim().toUpperCase();
  if (input.location_city !== undefined) payload.location_city = input.location_city.trim();
  if (input.location_state !== undefined) payload.location_state = input.location_state.trim().toUpperCase();
  if (input.location_country !== undefined) payload.location_country = input.location_country.trim() || 'India';
  if (input.condition !== undefined) payload.condition = input.condition;
  if (input.status !== undefined) payload.status = input.status;

  const { data, error } = await supabase
    .from('listings')
    .update(payload)
    .eq('id', id)
    .eq('seller_id', sellerId)
    .select()
    .single();

  if (error) throw error;
  return data as ListingRecord;
}

export async function deleteListing(id: string): Promise<void> {
  const sellerId = await getCurrentUserId();

  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', id)
    .eq('seller_id', sellerId);

  if (error) throw error;
}
export interface SavedListing extends ListingRecord {
  saved_listing_id: string;
}

export async function getSavedListings(): Promise<SavedListing[]> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('saved_listings')
    .select('id, listing:listings(*, photos(id, url, is_primary, sort_order))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || [])
    .filter((row: any) => row.listing)
    .map((row: any) => ({ ...row.listing, saved_listing_id: row.id }));
}

export async function saveListing(listingId: string): Promise<void> {
  const userId = await getCurrentUserId();
  const { error } = await supabase.from('saved_listings').insert([{ user_id: userId, listing_id: listingId }]);
  if (error) throw error;
}

export async function unsaveListing(listingId: string): Promise<void> {
  const userId = await getCurrentUserId();
  const { error } = await supabase
    .from('saved_listings')
    .delete()
    .eq('user_id', userId)
    .eq('listing_id', listingId);
  if (error) throw error;
}

export async function getSavedListingIds(): Promise<string[]> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase.from('saved_listings').select('listing_id').eq('user_id', userId);
  if (error) throw error;
  return (data || []).map((row) => row.listing_id);
}