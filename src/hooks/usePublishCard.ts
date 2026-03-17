/**
 * usePublishCard — Publish hook for card editor
 * 
 * Accepts KeyCardConfig, builds a kind:30078 event with correct
 * tags/content, signs via NIP-07 (window.nostr) using Nostrify,
 * and publishes to user's write relays.
 */

import { useNostr } from '@nostrify/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useCurrentUser } from '@/hooks/useCurrentUser';
import { buildCardEvent, parseCardConfig } from '@/lib/cardUtils';
import type { KeyCardConfig } from '@/lib/cardTypes';
import type { NostrEvent } from '@nostrify/nostrify';

interface PublishCardOptions {
  /** Merge with existing config (true) or replace entirely (false). Default: true */
  merge?: boolean;
}

export function usePublishCard() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();

  return useMutation<NostrEvent, Error, { config: KeyCardConfig; options?: PublishCardOptions }>({
    mutationFn: async ({ config, options }) => {
      if (!user) {
        throw new Error('User is not logged in');
      }

      let finalConfig = config;

      // If merging, fetch existing card config and deep merge
      if (options?.merge !== false) {
        try {
          const [existing] = await nostr.query(
            [{ kinds: [30078], authors: [user.pubkey], '#d': ['key.card/profile'], limit: 1 }],
            { signal: AbortSignal.timeout(5000) },
          );

          if (existing) {
            const current = parseCardConfig(existing.content);
            if (current) {
              finalConfig = {
                ...current,
                ...config,
                v: 1,
              };
            }
          }
        } catch (err) {
          console.warn('Could not fetch existing card config for merge, publishing as new:', err);
        }
      }

      // Build the unsigned event
      const unsigned = buildCardEvent(finalConfig);

      // Add client tag if on HTTPS
      const tags = [...unsigned.tags];
      if (location.protocol === 'https:' && !tags.some(([name]) => name === 'client')) {
        tags.push(['client', location.hostname]);
      }

      // Sign via Nostrify signer (NIP-07 / NIP-46 / nsec)
      const signed = await user.signer.signEvent({
        kind: unsigned.kind,
        content: unsigned.content,
        tags,
        created_at: unsigned.created_at,
      });

      // Publish to relays
      await nostr.event(signed, { signal: AbortSignal.timeout(5000) });

      return signed;
    },

    onSuccess: (event) => {
      console.log('Card config published:', event.id);

      if (user) {
        queryClient.invalidateQueries({ queryKey: ['nostr', 'card', user.pubkey] });
        queryClient.invalidateQueries({ queryKey: ['nostr', 'author', user.pubkey] });
      }
    },

    onError: (error) => {
      console.error('Failed to publish card config:', error);
    },
  });
}
