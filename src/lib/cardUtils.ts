/**
 * Card utilities
 * 
 * Parse/build kind:30078 events and apply themes.
 */

import type { CardData, KeyCardConfig, ThemeConfig } from '@/lib/cardTypes';

// ─── Discovery relays (fallback when user has no NIP-65) ──────

export const DISCOVERY_RELAYS = [
  'wss://relay.ditto.pub',
  'wss://relay.primal.net',
  'wss://relay.damus.io',
  'wss://purplepag.es',
  'wss://relay.nostr.band',
];

// ─── Parse kind:30078 content ─────────────────────────────────

/**
 * Parse the JSON content of a kind:30078 event into KeyCardConfig.
 * Returns undefined if parsing fails or content is empty.
 */
export function parseCardConfig(content: string): KeyCardConfig | undefined {
  if (!content || content.trim() === '') return undefined;

  try {
    const raw = JSON.parse(content);
    if (typeof raw !== 'object' || raw === null) return undefined;

    const v = raw.v ?? 1;
    if (v !== 1) {
      console.warn(`Unknown card config version: ${v}, attempting best-effort parse`);
    }

    const result: KeyCardConfig = { v: 1 };

    if (Array.isArray(raw.phone)) {
      result.phone = raw.phone.filter(
        (p: any) => p && typeof p.number === 'string' && typeof p.type === 'string',
      );
    }

    if (raw.address && typeof raw.address === 'object') {
      result.address = raw.address;
    }

    if (typeof raw.company === 'string') result.company = raw.company;
    if (typeof raw.title === 'string') result.title = raw.title;

    if (Array.isArray(raw.links)) {
      result.links = raw.links.filter(
        (l: any) => l && typeof l.label === 'string' && typeof l.url === 'string',
      );
    }

    if (raw.booking && typeof raw.booking.url === 'string') {
      result.booking = {
        url: raw.booking.url,
        label: typeof raw.booking.label === 'string' ? raw.booking.label : undefined,
      };
    }

    if (raw.theme && typeof raw.theme === 'object') {
      result.theme = {};
      if (raw.theme.mode === 'light' || raw.theme.mode === 'dark') {
        result.theme.mode = raw.theme.mode;
      }
      if (typeof raw.theme.background === 'string') result.theme.background = raw.theme.background;
      if (typeof raw.theme.accent === 'string') result.theme.accent = raw.theme.accent;
      if (['solid', 'glass', 'gradient'].includes(raw.theme.cardStyle)) {
        result.theme.cardStyle = raw.theme.cardStyle;
      }
    }

    if (typeof raw.banner === 'string') result.banner = raw.banner;

    return result;
  } catch {
    console.warn('Failed to parse kind:30078 content');
    return undefined;
  }
}

// ─── Build kind:30078 event template ──────────────────────────

/**
 * Build an unsigned kind:30078 event from KeyCardConfig.
 */
export function buildCardEvent(config: KeyCardConfig): {
  kind: number;
  content: string;
  tags: string[][];
  created_at: number;
} {
  return {
    kind: 30078,
    content: JSON.stringify({ ...config, v: 1 }),
    tags: [['d', 'key.card/profile']],
    created_at: Math.floor(Date.now() / 1000),
  };
}

// ─── Theme application ────────────────────────────────────────

const DEFAULT_THEME: Required<ThemeConfig> = {
  mode: 'dark',
  background: '#1a1a2e',
  accent: '#9333ea',
  cardStyle: 'solid',
};

/**
 * Apply a card theme to a DOM element via CSS custom properties.
 */
export function applyTheme(element: HTMLElement, theme?: ThemeConfig): void {
  const merged = { ...DEFAULT_THEME, ...theme };

  element.style.setProperty('--card-bg', merged.background);
  element.style.setProperty('--card-accent', merged.accent);
  element.style.setProperty('--card-mode', merged.mode);
  element.style.setProperty('--card-style', merged.cardStyle);
  element.style.setProperty(
    '--card-text',
    merged.mode === 'dark' ? '#ffffff' : '#1a1a2e',
  );
  element.style.setProperty(
    '--card-text-muted',
    merged.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(26,26,46,0.7)',
  );
}

/**
 * Get CSS class names for card style variant.
 */
export function getCardStyleClasses(cardStyle?: string): string {
  switch (cardStyle) {
    case 'glass':
      return 'backdrop-blur-xl bg-opacity-80 border border-white/10';
    case 'gradient':
      return 'bg-gradient-to-br';
    case 'solid':
    default:
      return '';
  }
}
