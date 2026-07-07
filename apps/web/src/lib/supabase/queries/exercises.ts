import { createClient } from '../client';
import type {
  Exercise,
  ExerciseListItem,
  ExerciseFilterOptions,
} from '@/types/exercise';

// ── Exercise Queries ────────────────────────────────────────────────────────

export async function getExercises(
  options?: ExerciseFilterOptions,
): Promise<ExerciseListItem[]> {
  const supabase = createClient() as any;

  let query = supabase
    .from('exercises')
    .select(
      'id, name, description, category_slug, body_regions, difficulty, equipment, image_url, default_sets, default_reps, tags',
    )
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (options?.category) {
    query = query.eq('category_slug', options.category);
  }

  if (options?.bodyRegion) {
    query = query.contains('body_regions', [options.bodyRegion]);
  }

  if (options?.difficulty) {
    query = query.eq('difficulty', options.difficulty);
  }

  if (options?.equipment) {
    query = query.contains('equipment', [options.equipment]);
  }

  if (options?.search) {
    query = query.ilike('name', `%${options.search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data as ExerciseListItem[]) ?? [];
}

export async function getExerciseById(id: string): Promise<Exercise> {
  const supabase = createClient() as any;
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Exercise;
}

export async function getExercisesByCategory(
  category: string,
): Promise<ExerciseListItem[]> {
  const supabase = createClient() as any;
  const { data, error } = await supabase
    .from('exercises')
    .select(
      'id, name, description, category_slug, body_regions, difficulty, equipment, image_url, default_sets, default_reps, tags',
    )
    .eq('category_slug', category)
    .eq('is_active', true)
    .order('name', { ascending: true });
  if (error) throw error;
  return (data as ExerciseListItem[]) ?? [];
}

export async function getExercisesByIds(
  ids: string[],
): Promise<ExerciseListItem[]> {
  if (ids.length === 0) return [];
  const supabase = createClient() as any;
  const { data, error } = await supabase
    .from('exercises')
    .select(
      'id, name, description, category_slug, body_regions, difficulty, equipment, image_url, default_sets, default_reps, tags',
    )
    .in('id', ids)
    .eq('is_active', true);
  if (error) throw error;
  return (data as ExerciseListItem[]) ?? [];
}

export async function getExerciseCategories(): Promise<
  { slug: string; name: string; description: string }[]
> {
  const supabase = createClient() as any;
  const { data, error } = await supabase
    .from('exercise_categories')
    .select('slug, name, description')
    .order('name', { ascending: true });
  if (error) throw error;
  return (data as { slug: string; name: string; description: string }[]) ?? [];
}
