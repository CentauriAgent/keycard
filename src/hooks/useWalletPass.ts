/**
 * useWalletPass — Hooks for Apple Wallet and Google Wallet pass generation
 *
 * useAppleWalletPass(cardData) — POST to /api/wallet/apple, triggers .pkpass download
 * useGoogleWalletPass(cardData) — POST to /api/wallet/google, opens Google Pay save URL
 */

import { useState, useCallback } from 'react';
import type { CardData } from '@/lib/cardTypes';

// ─── Types ────────────────────────────────────────────────────

interface WalletPassPayload {
  pubkey: string;
  name: string;
  jobTitle?: string;
  company?: string;
  nip05?: string;
  lud16?: string;
  picture?: string;
  relays?: string[];
}

interface WalletPassState {
  loading: boolean;
  error: string | null;
  isMock: boolean | null;
}

interface AppleWalletResult extends WalletPassState {
  generate: () => Promise<void>;
  /** In mock mode, contains the pass preview data */
  mockData: Record<string, unknown> | null;
}

interface GoogleWalletResult extends WalletPassState {
  generate: () => Promise<void>;
  /** The Google Pay save URL (mock or real) */
  saveUrl: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────

function cardDataToPayload(cardData: CardData, relays?: string[]): WalletPassPayload {
  return {
    pubkey: cardData.pubkey,
    name: cardData.displayName || cardData.name || 'Anonymous',
    jobTitle: cardData.config?.title,
    company: cardData.config?.company,
    nip05: cardData.nip05,
    lud16: cardData.lud16,
    picture: cardData.picture,
    relays,
  };
}

// ─── Apple Wallet Hook ───────────────────────────────────────

export function useAppleWalletPass(
  cardData: CardData | undefined,
  relays?: string[],
): AppleWalletResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState<boolean | null>(null);
  const [mockData, setMockData] = useState<Record<string, unknown> | null>(null);

  const generate = useCallback(async () => {
    if (!cardData) {
      setError('No card data available');
      return;
    }

    setLoading(true);
    setError(null);
    setIsMock(null);
    setMockData(null);

    try {
      const payload = cardDataToPayload(cardData, relays);

      const response = await fetch('/api/wallet/apple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || `HTTP ${response.status}`);
      }

      const contentType = response.headers.get('Content-Type') || '';

      if (contentType.includes('application/vnd.apple.pkpass')) {
        // Real PKPass — trigger download
        setIsMock(false);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `keycard-${cardData.pubkey.slice(0, 8)}.pkpass`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        // Mock mode — JSON response
        const json = await response.json();
        setIsMock(true);
        setMockData(json);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate Apple Wallet pass');
    } finally {
      setLoading(false);
    }
  }, [cardData, relays]);

  return { loading, error, isMock, mockData, generate };
}

// ─── Google Wallet Hook ──────────────────────────────────────

export function useGoogleWalletPass(
  cardData: CardData | undefined,
  relays?: string[],
): GoogleWalletResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState<boolean | null>(null);
  const [saveUrl, setSaveUrl] = useState<string | null>(null);

  const generate = useCallback(async () => {
    if (!cardData) {
      setError('No card data available');
      return;
    }

    setLoading(true);
    setError(null);
    setIsMock(null);
    setSaveUrl(null);

    try {
      const payload = cardDataToPayload(cardData, relays);

      const response = await fetch('/api/wallet/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || `HTTP ${response.status}`);
      }

      const json = await response.json();
      setIsMock(!!json.mock);
      setSaveUrl(json.saveUrl);

      // Open the Google Pay save URL
      if (json.saveUrl && !json.mock) {
        window.open(json.saveUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate Google Wallet pass');
    } finally {
      setLoading(false);
    }
  }, [cardData, relays]);

  return { loading, error, isMock, saveUrl, generate };
}
