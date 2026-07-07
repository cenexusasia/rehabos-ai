'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { MarketplaceItem } from '@/types/marketplace';

export function useMarketplaceItems(options?: {
  search?: string;
  itemType?: string;
  category?: string;
}) {
  const supabase = createClient() as any;
  return useQuery({
    queryKey: ['marketplace', 'items', options],
    queryFn: async () => {
      let query = supabase
        .from('marketplace_items')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (options?.itemType) {
        query = query.eq('item_type', options.itemType);
      }
      if (options?.category) {
        query = query.eq('category', options.category);
      }
      if (options?.search) {
        query = query.ilike('name', `%${options.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as MarketplaceItem[]) ?? [];
    },
  });
}

export function useFeaturedItems() {
  const supabase = createClient() as any;
  return useQuery({
    queryKey: ['marketplace', 'featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketplace_items')
        .select('*')
        .eq('is_featured', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(6);
      if (error) throw error;
      return (data as MarketplaceItem[]) ?? [];
    },
  });
}

export function useTrendingItems() {
  const supabase = createClient() as any;
  return useQuery({
    queryKey: ['marketplace', 'trending'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketplace_items')
        .select('*')
        .eq('is_active', true)
        .order('download_count', { ascending: false })
        .limit(12);
      if (error) throw error;
      return (data as MarketplaceItem[]) ?? [];
    },
  });
}
