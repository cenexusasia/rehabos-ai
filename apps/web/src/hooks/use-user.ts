import { useQuery } from '@tanstack/react-query';

import { createClient } from '@/lib/supabase/client';

export function useUser() {
  const supabase = createClient();
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    },
  });
}
