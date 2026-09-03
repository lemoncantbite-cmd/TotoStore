import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from './supabaseClient';

export type StorageBucket = 'profile-photos' | 'listing-photos';

export async function uploadImage(localUri: string, bucket: StorageBucket, userId: string, listingId?: string): Promise<string> {
  if (!localUri) {
    throw new Error('Image URI is required.');
  }

  if (bucket !== 'profile-photos' && bucket !== 'listing-photos') {
    throw new Error("Use 'listing-photos' as the bucket name, not 'listing-images'.");
  }

  if (bucket === 'listing-photos' && !listingId) {
    throw new Error('listingId is required to upload a listing photo.');
  }

  const lastSegment = localUri.split('/').pop() ?? '';
  const rawExt = lastSegment.includes('.') ? lastSegment.split('.').pop()!.split('?')[0].toLowerCase() : '';
  const normalizedExt = rawExt === 'jpeg' ? 'jpg' : rawExt;
  const fileExtension = ['jpg', 'png', 'webp'].includes(normalizedExt) ? normalizedExt : 'jpg';

  const mimeType =
    fileExtension === 'png' ? 'image/png' : fileExtension === 'webp' ? 'image/webp' : 'image/jpeg';

  const fileName =
    bucket === 'profile-photos'
      ? `${userId}.jpg`
      : `${userId}/${listingId}/${Date.now()}.${fileExtension}`;

  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, decode(base64), {
    contentType: mimeType,
    upsert: bucket === 'profile-photos',
  });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return data.publicUrl;
}

export async function deleteImage(bucket: StorageBucket, filePath: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.storage.from(bucket).remove([filePath]);
  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}
