/**
 * NostrProvider — Enhanced relay pool with NIP-65 outbox support
 * 
 * Extends the existing MKStack NostrProvider with:
 * - Discovery relay fallback for unknown users
 * - Outbox model: route REQs to a target user's write relays
 * - Per-card relay routing via CardRelayContext
 */

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { NostrEvent, NostrFilter, NPool, NRelay1 } from '@nostrify/nostrify';
import { NostrContext } from '@nostrify/react';
import { useQueryClient } from '@tanstack/react-query';
import { useAppContext } from '@/hooks/useAppContext';
import { DISCOVERY_RELAYS } from '@/lib/cardUtils';

// ─── Card relay context (for outbox routing) ──────────────────

interface CardRelayState {
  /** Target user's write relays (from kind:10002) */
  targetWriteRelays: string[];
  /** Set target relays when fetching a specific user's card */
  setTargetWriteRelays: (relays: string[]) => void;
}

const CardRelayContext = createContext<CardRelayState>({
  targetWriteRelays: [],
  setTargetWriteRelays: () => {},
});

export const useCardRelays = () => useContext(CardRelayContext);

// ─── Provider ─────────────────────────────────────────────────

interface NostrProviderProps {
  children: React.ReactNode;
}

const KeyCardNostrProvider: React.FC<NostrProviderProps> = ({ children }) => {
  const { config } = useAppContext();
  const queryClient = useQueryClient();

  const pool = useRef<NPool | undefined>(undefined);
  const relayMetadata = useRef(config.relayMetadata);
  const targetWriteRelaysRef = useRef<string[]>([]);

  // Track target relays for outbox routing
  const [targetWriteRelays, setTargetWriteRelaysState] = React.useState<string[]>([]);

  const setTargetWriteRelays = React.useCallback((relays: string[]) => {
    targetWriteRelaysRef.current = relays;
    setTargetWriteRelaysState(relays);
  }, []);

  useEffect(() => {
    relayMetadata.current = config.relayMetadata;
    queryClient.invalidateQueries({ queryKey: ['nostr'] });
  }, [config.relayMetadata, queryClient]);

  if (!pool.current) {
    pool.current = new NPool({
      open(url: string) {
        return new NRelay1(url);
      },

      reqRouter(filters: NostrFilter[]) {
        const routes = new Map<string, NostrFilter[]>();

        // If we have target user's write relays (outbox model), use them
        const targetRelays = targetWriteRelaysRef.current;
        if (targetRelays.length > 0) {
          for (const url of targetRelays) {
            routes.set(url, filters);
          }
          // Also query discovery relays for redundancy
          for (const url of DISCOVERY_RELAYS) {
            if (!routes.has(url)) {
              routes.set(url, filters);
            }
          }
          return routes;
        }

        // Use configured read relays if available
        const readRelays = relayMetadata.current.relays
          .filter(r => r.read)
          .map(r => r.url);

        if (readRelays.length > 0) {
          for (const url of readRelays) {
            routes.set(url, filters);
          }
        } else {
          // Fallback to discovery relays
          for (const url of DISCOVERY_RELAYS) {
            routes.set(url, filters);
          }
        }

        return routes;
      },

      eventRouter(_event: NostrEvent) {
        // Write to user's configured write relays
        const writeRelays = relayMetadata.current.relays
          .filter(r => r.write)
          .map(r => r.url);

        // Also write to discovery relays for discoverability
        const allRelays = new Set<string>([...writeRelays, ...DISCOVERY_RELAYS]);
        return [...allRelays];
      },

      eoseTimeout: 200,
    });
  }

  return (
    <CardRelayContext.Provider value={{ targetWriteRelays, setTargetWriteRelays }}>
      <NostrContext.Provider value={{ nostr: pool.current }}>
        {children}
      </NostrContext.Provider>
    </CardRelayContext.Provider>
  );
};

export default KeyCardNostrProvider;
