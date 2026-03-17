/**
 * useCardData — Main data fetching hook for key.card
 * 
 * Resolves an identifier (npub, nprofile, or NIP-05) to a pubkey,
 * then fetches kind:0 (profile) and kind:30078 d="key.card/profile"
 * in a single batched REQ. Returns typed CardData.
 */

import { NSchema as n, type NostrEvent, type NostrFilter } from '@nostrify/nostrify';
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { nip19 } from 'nostr-tools';

import { resolveNip05, isNip05 } from '@/lib/nip05';
import { parseCardConfig, DISCOVERY_RELAYS } from '@/lib/cardUtils';
import { useCardRelays } from '@/providers/NostrProvider';
import type { CardData, ExternalIdentity } from '@/lib/cardTypes';

// ─── Identifier resolution ────────────────────────────────────

interface ResolvedIdentifier {
  pubkey: string;
  relayHints?: string[];
}

/**
 * Resolve an identifier string to a hex pubkey.
 * Supports: npub1..., nprofile1..., hex pubkey, NIP-05 (user@domain).
 */
async function resolveIdentifier(
  identifier: string,
  signal?: AbortSignal,
): Promise<ResolvedIdentifier | null> {
  const trimmed = identifier.trim();

  // Hex pubkey (64 chars)
  if (/^[0-9a-f]{64}$/.test(trimmed)) {
    return { pubkey: trimmed };
  }

  // npub
  if (trimmed.startsWith('npub1')) {
    try {
      const decoded = nip19.decode(trimmed);
      if (decoded.type === 'npub') {
        return { pubkey: decoded.data };
      }
    } catch {
      return null;
    }
  }

  // nprofile
  if (trimmed.startsWith('nprofile1')) {
    try {
      const decoded = nip19.decode(trimmed);
      if (decoded.type === 'nprofile') {
        return {
          pubkey: decoded.data.pubkey,
          relayHints: decoded.data.relays,
        };
      }
    } catch {
      return null;
    }
  }

  // NIP-05
  if (isNip05(trimmed)) {
    const result = await resolveNip05(trimmed, signal);
    if (result) {
      return { pubkey: result.pubkey, relayHints: result.relays };
    }
    return null;
  }

  return null;
}

// ─── NIP-05 resolution hook (cached) ──────────────────────────

export function useResolveIdentifier(identifier: string | undefined) {
  return useQuery({
    queryKey: ['nostr', 'resolve', identifier ?? ''],
    queryFn: async ({ signal }) => {
      if (!identifier) return null;
      return resolveIdentifier(identifier, signal);
    },
    staleTime: 10 * 60 * 1000, // 10 min cache
    enabled: !!identifier,
    retry: 2,
  });
}

// ─── Main card data hook ──────────────────────────────────────

export function useCardData(identifier: string | undefined) {
  const { nostr } = useNostr();
  const { setTargetWriteRelays } = useCardRelays();

  // Step 1: Resolve identifier to pubkey
  const {
    data: resolved,
    isLoading: isResolving,
    error: resolveError,
  } = useResolveIdentifier(identifier);

  const pubkey = resolved?.pubkey;

  // Step 2: Fetch relay list (kind:10002) for outbox routing
  const relayListQuery = useQuery({
    queryKey: ['nostr', 'card', pubkey ?? '', 'relays'],
    queryFn: async ({ signal }) => {
      if (!pubkey) return [];

      const [event] = await nostr.query(
        [{ kinds: [10002], authors: [pubkey], limit: 1 }],
        { signal: signal ?? AbortSignal.timeout(5000) },
      );

      if (!event) return [];

      const relays = event.tags
        .filter(([tag]) => tag === 'r')
        .map(([, url, permission]) => ({
          url,
          read: !permission || permission === 'read',
          write: !permission || permission === 'write',
        }));

      const writeRelays = relays.filter(r => r.write).map(r => r.url);
      if (writeRelays.length > 0) {
        setTargetWriteRelays(writeRelays);
      }

      return relays;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!pubkey,
  });

  // Step 3: Fetch card data (kind:0 + kind:30078 + kind:10011) in single batched REQ
  const cardQuery = useQuery<CardData | null>({
    queryKey: ['nostr', 'card', pubkey ?? '', 'data'],
    queryFn: async ({ signal }) => {
      if (!pubkey) return null;

      const filters: NostrFilter[] = [
        { kinds: [0], authors: [pubkey], limit: 1 },
        { kinds: [30078], authors: [pubkey], '#d': ['key.card/profile'], limit: 1 },
        { kinds: [10011], authors: [pubkey], limit: 1 },
      ];

      const events = await nostr.query(filters, {
        signal: signal ?? AbortSignal.timeout(5000),
      });

      // Separate events by kind (use latest by created_at)
      let profileEvent: NostrEvent | undefined;
      let configEvent: NostrEvent | undefined;
      let identityEvent: NostrEvent | undefined;

      for (const event of events) {
        if (event.kind === 0 && (!profileEvent || event.created_at > profileEvent.created_at)) {
          profileEvent = event;
        }
        if (event.kind === 30078 && (!configEvent || event.created_at > configEvent.created_at)) {
          configEvent = event;
        }
        if (event.kind === 10011 && (!identityEvent || event.created_at > identityEvent.created_at)) {
          identityEvent = event;
        }
      }

      // Generate npub
      const npub = nip19.npubEncode(pubkey);

      // Parse kind:0 profile
      let displayName = '';
      let name: string | undefined;
      let picture: string | undefined;
      let banner: string | undefined;
      let about: string | undefined;
      let website: string | undefined;
      let lud16: string | undefined;
      let nip05: string | undefined;

      if (profileEvent) {
        try {
          const metadata = n.json().pipe(n.metadata()).parse(profileEvent.content);
          displayName = metadata.display_name || metadata.name || '';
          name = metadata.name;
          picture = metadata.picture;
          banner = metadata.banner;
          about = metadata.about;
          website = metadata.website;
          lud16 = metadata.lud16;
          nip05 = metadata.nip05;
        } catch {
          console.warn('Failed to parse kind:0 metadata');
        }
      }

      // Parse kind:30078 config
      const config = configEvent ? parseCardConfig(configEvent.content) : undefined;

      // Parse kind:10011 identities
      let identities: ExternalIdentity[] | undefined;
      if (identityEvent) {
        identities = identityEvent.tags
          .filter(([tag]) => tag === 'i')
          .map(([, value, proof]) => {
            const colonIdx = value?.indexOf(':') ?? -1;
            if (colonIdx < 0) return null;
            return {
              platform: value.slice(0, colonIdx),
              identity: value.slice(colonIdx + 1),
              proof: proof || '',
            };
          })
          .filter((x): x is ExternalIdentity => x !== null);
      }

      // Use kind:30078 banner if present, else kind:0 banner
      const finalBanner = config?.banner || banner;

      // If no display name from kind:0, fall back to npub
      if (!displayName) {
        displayName = npub.slice(0, 12) + '…';
      }

      return {
        pubkey,
        npub,
        displayName,
        name,
        picture,
        banner: finalBanner,
        about,
        website,
        lud16,
        nip05,
        config,
        identities,
      };
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!pubkey,
    retry: 3,
  });

  return {
    /** Resolved hex pubkey */
    pubkey,
    /** Full card data — aliased as `data` for component compatibility */
    data: cardQuery.data ?? undefined,
    /** Alias for data */
    cardData: cardQuery.data ?? undefined,
    /** Loading state (resolving identifier OR fetching card) */
    isLoading: isResolving || cardQuery.isLoading,
    /** True if currently fetching card data */
    isFetching: cardQuery.isFetching,
    /** Whether there was an error */
    isError: !!(resolveError || cardQuery.error),
    /** Error from resolution or data fetch */
    error: resolveError || cardQuery.error,
    /** Relay list from kind:10002 */
    relays: relayListQuery.data ?? [],
    /** Refetch card data */
    refetch: cardQuery.refetch,
  };
}
