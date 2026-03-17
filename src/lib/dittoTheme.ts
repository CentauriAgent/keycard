/**
 * Ditto theme types and Nostr event parsing/building for kind 16767.
 * Ported from ditto/src/lib/themeEvent.ts — standalone for keycard.
 */

import type { NostrEvent } from '@nostrify/nostrify';
import { hslStringToHex, hexToHslString } from '@/lib/colorUtils';

// ─── Types ────────────────────────────────────────────────────────────

export interface CoreThemeColors {
  /** Background color (HSL string, e.g. "228 20% 10%") */
  background: string;
  /** Text/foreground color */
  text: string;
  /** Primary accent color */
  primary: string;
}

export interface ThemeFont {
  /** CSS font-family name */
  family: string;
  /** Direct URL to a font file */
  url?: string;
}

export interface ThemeBackground {
  /** URL to an image or video file */
  url: string;
  /** Display mode */
  mode?: 'cover' | 'tile';
  /** MIME type */
  mimeType?: string;
  /** Dimensions as "widthxheight" */
  dimensions?: string;
  /** Blurhash placeholder */
  blurhash?: string;
}

export interface ThemeConfig {
  title?: string;
  colors: CoreThemeColors;
  font?: ThemeFont;
  background?: ThemeBackground;
}

export interface ThemePreset {
  label: string;
  emoji: string;
  featured?: boolean;
  colors: CoreThemeColors;
  font?: ThemeFont;
  background?: ThemeBackground;
}

// ─── Kind Constant ────────────────────────────────────────────────────

/** Replaceable event: the user's currently active profile theme. One per user. */
export const ACTIVE_THEME_KIND = 16767;

// ─── Parsed Result ────────────────────────────────────────────────────

export interface ActiveProfileTheme {
  colors: CoreThemeColors;
  font?: ThemeFont;
  background?: ThemeBackground;
  sourceRef?: string;
  event: NostrEvent;
}

// ─── Color Tag Helpers ────────────────────────────────────────────────

type ColorRole = 'primary' | 'text' | 'background';

function buildColorTags(colors: CoreThemeColors): string[][] {
  const roles: ColorRole[] = ['background', 'text', 'primary'];
  return roles.map((role) => ['c', hslStringToHex(colors[role]), role]);
}

function parseColorTags(tags: string[][]): CoreThemeColors | null {
  const colorMap = new Map<string, string>();
  for (const tag of tags) {
    if (tag[0] === 'c' && tag[1] && tag[2]) {
      colorMap.set(tag[2], tag[1]);
    }
  }
  const bgHex = colorMap.get('background');
  const textHex = colorMap.get('text');
  const primaryHex = colorMap.get('primary');
  if (!bgHex || !textHex || !primaryHex) return null;
  return {
    background: hexToHslString(bgHex),
    text: hexToHslString(textHex),
    primary: hexToHslString(primaryHex),
  };
}

// ─── Font Tag Helpers ─────────────────────────────────────────────────

function buildFontTag(font: ThemeFont | undefined): string[][] {
  if (!font?.family) return [];
  const tag = ['f', font.family];
  if (font.url) tag.push(font.url);
  return [tag];
}

function parseFontTag(tags: string[][]): ThemeFont | undefined {
  for (const tag of tags) {
    if (tag[0] !== 'f' || !tag[1]) continue;
    const font: ThemeFont = { family: tag[1] };
    if (tag[2]) font.url = tag[2];
    return font;
  }
  return undefined;
}

// ─── Background Tag Helpers ───────────────────────────────────────────

function buildBackgroundTag(bg: ThemeBackground | undefined): string[][] {
  if (!bg?.url) return [];
  const entries: string[] = ['bg', `url ${bg.url}`];
  if (bg.mode) entries.push(`mode ${bg.mode}`);
  if (bg.mimeType) entries.push(`m ${bg.mimeType}`);
  if (bg.dimensions) entries.push(`dim ${bg.dimensions}`);
  if (bg.blurhash) entries.push(`blurhash ${bg.blurhash}`);
  return [entries];
}

function parseBackgroundTag(tags: string[][]): ThemeBackground | undefined {
  const bgTag = tags.find(([n]) => n === 'bg');
  if (!bgTag) return undefined;
  const kv = new Map<string, string>();
  for (let i = 1; i < bgTag.length; i++) {
    const entry = bgTag[i];
    const spaceIdx = entry.indexOf(' ');
    if (spaceIdx === -1) continue;
    kv.set(entry.slice(0, spaceIdx), entry.slice(spaceIdx + 1));
  }
  const url = kv.get('url');
  if (!url) return undefined;
  const bg: ThemeBackground = { url };
  const mode = kv.get('mode');
  if (mode === 'cover' || mode === 'tile') bg.mode = mode;
  bg.mimeType = kv.get('m');
  bg.dimensions = kv.get('dim');
  bg.blurhash = kv.get('blurhash');
  return bg;
}

// ─── Parse kind 16767 ─────────────────────────────────────────────────

/** Parse and validate a kind 16767 active profile theme event. Returns null if invalid. */
export function parseActiveProfileTheme(event: NostrEvent): ActiveProfileTheme | null {
  if (event.kind !== ACTIVE_THEME_KIND) return null;

  let colors = parseColorTags(event.tags);

  // Fall back to legacy format: colors as JSON in content
  if (!colors && event.content) {
    try {
      const parsed = JSON.parse(event.content);
      colors = normalizeLegacyColors(parsed);
    } catch {
      // Invalid JSON
    }
  }

  if (!colors) return null;

  const font = parseFontTag(event.tags);
  const background = parseBackgroundTag(event.tags);
  const sourceRef = event.tags.find(([n]) => n === 'a')?.[1];

  return { colors, font, background, sourceRef, event };
}

// ─── Build kind 16767 ─────────────────────────────────────────────────

/** Create tags for a kind 16767 active profile theme event. */
export function buildActiveThemeTags(themeConfig: ThemeConfig): string[][] {
  const tags: string[][] = [
    ...buildColorTags(themeConfig.colors),
    ...buildFontTag(themeConfig.font),
    ...buildBackgroundTag(themeConfig.background),
    ['alt', 'Active profile theme'],
  ];
  if (themeConfig.title) {
    tags.push(['title', themeConfig.title]);
  }
  return tags;
}

// ─── Backward Compatibility ───────────────────────────────────────────

function normalizeLegacyColors(parsed: Record<string, unknown>): CoreThemeColors | null {
  if (parsed.background && parsed.text && parsed.primary) {
    return {
      background: String(parsed.background),
      text: String(parsed.text),
      primary: String(parsed.primary),
    };
  }
  if (parsed.background && parsed.foreground && parsed.primary) {
    return {
      background: String(parsed.background),
      text: String(parsed.foreground),
      primary: String(parsed.primary),
    };
  }
  return null;
}

// ─── Theme Presets (from Ditto) ───────────────────────────────────────

export const themePresets: Record<string, ThemePreset> = {
  pink: {
    label: 'Pink',
    emoji: '🌸',
    featured: true,
    colors: { background: '330 100% 96%', text: '330 30% 10%', primary: '330 90% 60%' },
    font: { family: 'Comfortaa' },
    background: { url: 'https://blossom.ditto.pub/2c9d4fe206f39b81655eab559998a89e1dca12f4db81c10fd8f472c69fe9c68a.jpeg', mode: 'cover', mimeType: 'image/jpeg' },
  },
  toxic: {
    label: 'Toxic',
    emoji: '☢️',
    colors: { background: '130 30% 7%', text: '120 40% 92%', primary: '128 70% 42%' },
    font: { family: 'JetBrains Mono' },
  },
  sunset: {
    label: 'Sunset',
    emoji: '🌅',
    colors: { background: '20 40% 96%', text: '15 30% 12%', primary: '15 85% 55%' },
    font: { family: 'Lora' },
  },
  skater: {
    label: 'Skater',
    emoji: '🛹',
    featured: true,
    colors: { background: '0 0% 42%', text: '0 0% 100%', primary: '80 100% 50%' },
    font: { family: 'Rubik Maps' },
    background: { url: 'https://blossom.primal.net/9c4262aaa53d8feae41b3b6206647e25c6f388d9e836fb3e8abcf9be72be493e.png', mode: 'cover', mimeType: 'image/png' },
  },
  kawaii: {
    label: 'Kawaii',
    emoji: '🌸',
    featured: true,
    colors: { background: '340 60% 95%', text: '345 30% 35%', primary: '340 100% 76%' },
    font: { family: 'Cherry Bomb One' },
    background: { url: 'https://blossom.ditto.pub/4e11a3ca749f9cc8989b61cb9efe78682533d2836eccaf4bccf104dd7b583e09.png', mode: 'cover', mimeType: 'image/png' },
  },
  grunge: {
    label: 'Grunge',
    emoji: '🖤',
    featured: true,
    colors: { background: '276 40% 8%', text: '0 0% 75%', primary: '328 100% 54%' },
    font: { family: 'Lacquer' },
    background: { url: 'https://blossom.primal.net/9fa0f1f7cd7da344f3e1db6ecfbdbeb2bb0763d3eaccbc0f5368871d0421b50b.png', mode: 'cover', mimeType: 'image/png' },
  },
  mspaint: {
    label: 'MS Paint',
    emoji: '🖥️',
    featured: true,
    colors: { background: '200 20% 95%', text: '0 0% 10%', primary: '240 100% 50%' },
    font: { family: 'Silkscreen' },
    background: { url: 'https://blossom.ditto.pub/946fedd46ec6b283472c0b3a102817ff414a6d640517df5c679bb63830ef21bf.png', mode: 'cover', mimeType: 'image/png' },
  },
  retropop: {
    label: 'Retro Pop',
    emoji: '💿',
    featured: true,
    colors: { background: '244 100% 92%', text: '40 40% 10%', primary: '260 50% 70%' },
    font: { family: 'Bungee Shade' },
    background: { url: 'https://blossom.ditto.pub/3832abebc944668c4c0bd34309b0dfe120054671e20ca8c8e9abbb24114c972e.png', mode: 'cover', mimeType: 'image/png' },
  },
  bubblegum: {
    label: 'Bubblegum',
    emoji: '🍬',
    featured: true,
    colors: { background: '0 0% 100%', text: '285 25% 31%', primary: '279 100% 50%' },
    font: { family: 'Barriecito' },
    background: { url: 'https://blossom.ditto.pub/edd3139e0c4d60b96dcf54edbe7410b1f58d9e5753c8d481fe9bb6812aca00d4.png', mode: 'cover', mimeType: 'image/png' },
  },
  gamer: {
    label: 'Gamer',
    emoji: '⚡',
    featured: true,
    colors: { background: '140 60% 4%', text: '120 100% 50%', primary: '195 100% 50%' },
    font: { family: 'Press Start 2P' },
    background: { url: 'https://blossom.ditto.pub/c5597382d7da762dcce32b5b5dbbd95a719faee5cad7c356df1956648b58be69.png', mode: 'cover', mimeType: 'image/png' },
  },
  cottage: {
    label: 'Cottage',
    emoji: '🌿',
    featured: true,
    colors: { background: '100 25% 92%', text: '100 20% 12%', primary: '43 80% 55%' },
    font: { family: 'Lora' },
    background: { url: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=1920&q=80', mode: 'cover', mimeType: 'image/jpeg' },
  },
  midnight: {
    label: 'Midnight',
    emoji: '🌃',
    featured: true,
    colors: { background: '0 0% 9%', text: '0 0% 95%', primary: '190 100% 50%' },
    font: { family: 'Inter' },
    background: { url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1920&q=80', mode: 'cover', mimeType: 'image/jpeg' },
  },
  sky: {
    label: 'Sky',
    emoji: '☁️',
    featured: true,
    colors: { background: '200 60% 88%', text: '220 30% 15%', primary: '280 55% 65%' },
    font: { family: 'Nunito' },
    background: { url: 'https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?w=1920&q=80', mode: 'cover', mimeType: 'image/jpeg' },
  },
  motherboard: {
    label: 'Motherboard',
    emoji: '🪟',
    featured: true,
    colors: { background: '0 0% 75%', text: '0 0% 5%', primary: '240 100% 30%' },
    font: { family: 'Courier Prime' },
    background: { url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&q=80', mode: 'cover', mimeType: 'image/jpeg' },
  },
  galaxy: {
    label: 'Galaxy',
    emoji: '🌌',
    featured: true,
    colors: { background: '260 40% 8%', text: '220 30% 95%', primary: '270 80% 65%' },
    font: { family: 'DM Sans' },
    background: { url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&q=80', mode: 'cover', mimeType: 'image/jpeg' },
  },
  ocean: {
    label: 'Ocean',
    emoji: '🌊',
    featured: true,
    colors: { background: '195 50% 12%', text: '185 30% 92%', primary: '175 70% 50%' },
    font: { family: 'Nunito' },
    background: { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80', mode: 'cover', mimeType: 'image/jpeg' },
  },
  forest: {
    label: 'Forest',
    emoji: '🌲',
    featured: true,
    colors: { background: '150 30% 10%', text: '120 20% 90%', primary: '150 60% 45%' },
    font: { family: 'Merriweather' },
    background: { url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80', mode: 'cover', mimeType: 'image/jpeg' },
  },
  clearsky: {
    label: 'Clear Sky Vibes',
    emoji: '✨',
    featured: true,
    colors: { background: '228 37% 8%', text: '185 100% 72%', primary: '300 100% 60%' },
    font: { family: 'Comfortaa' },
    background: { url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80', mode: 'cover', mimeType: 'image/jpeg' },
  },
  silenttorii: {
    label: 'Silent Torii',
    emoji: '⛩️',
    featured: true,
    colors: { primary: '3 62% 50%', text: '0 0% 100%', background: '0 7% 22%' },
    font: { family: 'DM Sans' },
    background: { url: 'https://blossom.ditto.pub/7a609544b62918264b6cfd1f05ae38f9ed9a7922465a4ecc2edbb1a769f887d0.jpeg', mode: 'cover', mimeType: 'image/jpeg' },
  },
  quiethorizon: {
    label: 'Quiet Horizon',
    emoji: '🌅',
    featured: true,
    colors: { primary: '170 15% 39%', text: '0 0% 100%', background: '0 7% 22%' },
    font: { family: 'Lora' },
    background: { url: 'https://blossom.ditto.pub/3fc3800e0551340c000a0ac75496e642f6dbd5bddf17c5ba7f4c4ebfc8bae55f.jpeg', mode: 'cover', mimeType: 'image/jpeg' },
  },
  wherepathsmeet: {
    label: 'Where Paths Meet',
    emoji: '🌉',
    featured: true,
    colors: { primary: '180 11% 78%', text: '120 3% 81%', background: '180 19% 15%' },
    font: { family: 'DM Sans' },
    background: { url: 'https://blossom.ditto.pub/a9f38f1bda2d7d984167f3b1197d3d2c7280a650ad609d24f97e35795f7cfd17.jpeg', mode: 'cover', mimeType: 'image/jpeg' },
  },
  once: {
    label: 'Once',
    emoji: '🎲',
    featured: true,
    colors: { primary: '217 94% 72%', text: '120 3% 81%', background: '210 17% 7%' },
    font: { family: 'Outfit' },
    background: { url: 'https://picsum.photos/1920/1080', mode: 'cover', mimeType: 'image/jpeg' },
  },
};
