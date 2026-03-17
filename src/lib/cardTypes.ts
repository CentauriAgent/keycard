// key.card type definitions from NOSTR-DESIGN.md

export interface PhoneEntry {
  type: 'mobile' | 'work' | 'home' | 'fax' | 'other';
  number: string;
  label?: string;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface LinkEntry {
  label: string;
  url: string;
  icon?: string;
}

export interface BookingConfig {
  url: string;
  label?: string;
}

export interface ThemeConfig {
  mode?: 'light' | 'dark';
  background?: string;
  accent?: string;
  cardStyle?: 'solid' | 'glass' | 'gradient';
}

export interface KeyCardConfig {
  v: 1;
  phone?: PhoneEntry[];
  address?: Address;
  company?: string;
  title?: string;
  links?: LinkEntry[];
  booking?: BookingConfig;
  theme?: ThemeConfig;
  banner?: string;
}

export interface CardData {
  pubkey: string;
  npub: string;
  displayName: string;
  name?: string;
  picture?: string;
  banner?: string;
  about?: string;
  website?: string;
  lud16?: string;
  nip05?: string;
  config?: KeyCardConfig;
  identities?: ExternalIdentity[];
}

export interface ExternalIdentity {
  platform: string;
  identity: string;
  proof: string;
}

// Icon mapping from NOSTR-DESIGN.md
export const ICON_MAP: Record<string, string> = {
  github: 'Github',
  twitter: 'Twitter',
  youtube: 'Youtube',
  linkedin: 'Linkedin',
  globe: 'Globe',
  podcast: 'Podcast',
  mail: 'Mail',
  calendar: 'Calendar',
  file: 'FileText',
  link: 'Link',
  nostr: 'Zap',
  bitcoin: 'Bitcoin',
};

// Platform URL templates for NIP-39
export const PLATFORM_URLS: Record<string, (identity: string) => string> = {
  github: (id) => `https://github.com/${id}`,
  twitter: (id) => `https://twitter.com/${id}`,
  mastodon: (id) => `https://${id}`,
  telegram: () => '',
  youtube: (id) => `https://youtube.com/@${id}`,
};

// Theme presets from DESIGN-SPEC.md
export const THEME_PRESETS: Record<string, ThemeConfig & { label: string; emoji: string; classes: string }> = {
  midnight: {
    mode: 'dark',
    background: '#0A0A0F',
    accent: '#8B5CF6',
    cardStyle: 'glass',
    label: 'Dark',
    emoji: '🌙',
    classes: 'bg-[#0A0A0F] text-white',
  },
  nostrPurple: {
    mode: 'dark',
    background: '#1A1A2E',
    accent: '#8B5CF6',
    cardStyle: 'solid',
    label: 'Nostr',
    emoji: '💜',
    classes: 'bg-[#1A1A2E] text-white',
  },
  cleanLight: {
    mode: 'light',
    background: '#FFFFFF',
    accent: '#6366F1',
    cardStyle: 'solid',
    label: 'Light',
    emoji: '☀️',
    classes: 'bg-white text-slate-900',
  },
  warmDark: {
    mode: 'dark',
    background: '#1C1917',
    accent: '#F59E0B',
    cardStyle: 'solid',
    label: 'Warm',
    emoji: '🔥',
    classes: 'bg-stone-900 text-stone-100',
  },
  ocean: {
    mode: 'dark',
    background: '#0C4A6E',
    accent: '#38BDF8',
    cardStyle: 'gradient',
    label: 'Ocean',
    emoji: '🌊',
    classes: 'bg-gradient-to-b from-sky-900 to-sky-950 text-white',
  },
  bitcoin: {
    mode: 'dark',
    background: '#1A1A2E',
    accent: '#F7931A',
    cardStyle: 'solid',
    label: 'BTC',
    emoji: '₿',
    classes: 'bg-[#1A1A2E] text-white',
  },
};
