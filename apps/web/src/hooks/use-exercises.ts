'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type {
  Exercise,
  ExerciseListItem,
  ExerciseFilterOptions,
} from '@/types/exercise';

// ── Exercise Catalog Hooks ──────────────────────────────────────────────────

export function useExercises(options?: ExerciseFilterOptions) {
  const supabase = createClient() as any;
  return useQuery({
    queryKey: ['exercises', options],
    queryFn: async () => {
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
    },
  });
}

export function useExercise(id: string) {
  const supabase = createClient() as any;
  return useQuery({
    queryKey: ['exercises', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Exercise;
    },
    enabled: !!id,
  });
}

export function useExercisesByCategory(category: string) {
  const supabase = createClient() as any;
  return useQuery({
    queryKey: ['exercises', 'category', category],
    queryFn: async () => {
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
    },
    enabled: !!category,
  });
}

export function useExercisesByIds(ids: string[]) {
  const supabase = createClient() as any;
  return useQuery({
    queryKey: ['exercises', 'ids', ids],
    queryFn: async () => {
      if (ids.length === 0) return [];
      const { data, error } = await supabase
        .from('exercises')
        .select(
          'id, name, description, category_slug, body_regions, difficulty, equipment, image_url, default_sets, default_reps, tags',
        )
        .in('id', ids)
        .eq('is_active', true);
      if (error) throw error;
      return (data as ExerciseListItem[]) ?? [];
    },
    enabled: ids.length > 0,
  });
}

// ── Invalidation ────────────────────────────────────────────────────────────

export function useInvalidateExercises() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: ['exercises'] });
}
