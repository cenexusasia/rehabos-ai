import { createClient } from './client';
import type { FileObject } from '@supabase/storage-js';

export const BUCKETS = {
  EXERCISE_VIDEOS: 'exercise-videos',
  EXERCISE_IMAGES: 'exercise-images',
  PATIENT_DOCUMENTS: 'patient-documents',
  ASSESSMENT_IMAGES: 'assessment-images',
  CLINICIAN_UPLOADS: 'clinician-uploads',
} as const;

export type BucketName = (typeof BUCKETS)[keyof typeof BUCKETS];

export async function uploadFile(
  bucket: BucketName,
  path: string,
  file: File,
): Promise<{ id: string; path: string; fullPath: string }> {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true });
  if (error) throw error;
  return data;
}

export function getPublicUrl(bucket: BucketName, path: string): string {
  const supabase = createClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export function getImageUrl(
  bucket: BucketName,
  path: string,
  options?: { width?: number; height?: number; quality?: number },
): string {
  const supabase = createClient();
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path, { transform: options });
  return data.publicUrl;
}

export async function deleteFile(
  bucket: BucketName,
  paths: string[],
) {
  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).remove(paths);
  if (error) throw error;
}

export async function listFiles(
  bucket: BucketName,
  folder: string,
): Promise<FileObject[]> {
  const supabase = createClient();
  const { data, error } = await supabase.storage.from(bucket).list(folder);
  if (error) throw error;
  return data ?? [];
}
