/**
 * key.card TypeScript types — canonical types for the Nostr integration layer.
 * 
 * Re-exports from @/lib/cardTypes for backward compat with existing components,
 * plus adds types specific to the hooks layer.
 */

// Re-export all existing types used by frontend components
export type {
  CardData,
  KeyCardConfig,
  PhoneEntry,
  Address,
  LinkEntry,
  BookingConfig,
  ThemeConfig,
  ExternalIdentity,
} from '@/lib/cardTypes';

export { ICON_MAP, PLATFORM_URLS, THEME_PRESETS } from '@/lib/cardTypes';

// ─── Additional types for hooks layer ─────────────────────────

/**
 * Alias for LinkEntry (matches NOSTR-DESIGN.md naming)
 */
export type CustomLink = import('@/lib/cardTypes').LinkEntry;

/**
 * Alias for KeyCardConfig (matches NOSTR-DESIGN.md naming)
 */
export type CardCustomization = import('@/lib/cardTypes').KeyCardConfig;

/**
 * Profile data extracted from kind:0 metadata
 */
export interface CardProfile {
  displayName?: string;
  name?: string;
  about?: string;
  picture?: string;
  banner?: string;
  website?: string;
  lud16?: string;
  nip05?: string;
}
