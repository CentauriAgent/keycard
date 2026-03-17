/**
 * useDittoTheme — Fetch kind 16767 active profile theme for a pubkey.
 */

import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';

import {
  ACTIVE_THEME_KIND,
  parseActiveProfileTheme,
  type ActiveProfileTheme,
} from '@/lib/dittoTheme';

export function useDittoTheme(pubkey: string | undefined) {
  const { nostr } = useNostr();

  return useQuery<ActiveProfileTheme | null>({
    queryKey: ['dittoTheme', pubkey],
    queryFn: async () => {
      if (!pubkey) return null;

      const events = await nostr.query(
        [{
          kinds: [ACTIVE_THEME_KIND],
          authors: [pubkey],
          limit: 1,
        }],
        { signal: AbortSignal.timeout(5000) },
      );

      if (events.length === 0) return null;
      return parseActiveProfileTheme(events[0]);
    },
    enabled: !!pubkey,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
