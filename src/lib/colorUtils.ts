/**
 * Color utilities for Ditto theme integration.
 * Ported from ditto/src/lib/colorUtils.ts — standalone, no external imports.
 */

/** Parse an HSL string like "228 20% 10%" into { h, s, l } */
export function parseHsl(hsl: string): { h: number; s: number; l: number } {
  const parts = hsl.trim().replace(/%/g, '').split(/\s+/).map(Number);
  return { h: parts[0], s: parts[1], l: parts[2] };
}

/** Format { h, s, l } back to "228 20% 10%" */
export function formatHsl(h: number, s: number, l: number): string {
  return `${Math.round(h * 10) / 10} ${Math.round(s * 10) / 10}% ${Math.round(l * 10) / 10}%`;
}

/** Convert HSL to RGB. h in [0,360], s,l in [0,100]. Returns [r,g,b] each [0,255]. */
export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

/** Convert RGB [0,255] to HSL { h, s, l } (h in degrees, s/l in percent). */
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: l * 100 };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return { h: h * 360, s: s * 100, l: l * 100 };
}

/** Convert hex color (#RRGGBB or #RGB) to RGB. */
export function hexToRgb(hex: string): [number, number, number] {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  return [
    parseInt(hex.slice(0, 2), 16),
    parseInt(hex.slice(2, 4), 16),
    parseInt(hex.slice(4, 6), 16),
  ];
}

/** Convert RGB to hex (#rrggbb). */
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

/** Convert hex to HSL string like "228 20% 10%". */
export function hexToHslString(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  return formatHsl(h, s, l);
}

/** Convert HSL string like "228 20% 10%" to hex. */
export function hslStringToHex(hsl: string): string {
  const { h, s, l } = parseHsl(hsl);
  const [r, g, b] = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

/** Convert an HSL string "228 20% 10%" to CSS "hsl(228, 20%, 10%)" */
export function hslToCss(hsl: string): string {
  const { h, s, l } = parseHsl(hsl);
  return `hsl(${Math.round(h * 10) / 10}, ${Math.round(s * 10) / 10}%, ${Math.round(l * 10) / 10}%)`;
}

/** Relative luminance per WCAG 2.1 (0 = black, 1 = white). */
export function getLuminance(r: number, g: number, b: number): number {
  const sRGB = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
}

/** Determine if an HSL background string represents a "dark" theme. */
export function isDarkTheme(backgroundHsl: string): boolean {
  const { h, s, l } = parseHsl(backgroundHsl);
  const [r, g, b] = hslToRgb(h, s, l);
  return getLuminance(r, g, b) < 0.2;
}

// ─── Adjust HSL helpers ───────────────────────────────────────────────

function lighten(hsl: string, amount: number): string {
  const { h, s, l } = parseHsl(hsl);
  return formatHsl(h, s, Math.min(100, l + amount));
}

function darken(hsl: string, amount: number): string {
  const { h, s, l } = parseHsl(hsl);
  return formatHsl(h, s, Math.max(0, l - amount));
}

function contrastForeground(bgHsl: string): string {
  return isDarkTheme(bgHsl) ? '0 0% 100%' : '222.2 84% 4.9%';
}

export interface ThemeTokens {
  background: string; foreground: string; card: string; cardForeground: string;
  popover: string; popoverForeground: string; primary: string; primaryForeground: string;
  secondary: string; secondaryForeground: string; muted: string; mutedForeground: string;
  accent: string; accentForeground: string; destructive: string; destructiveForeground: string;
  border: string; input: string; ring: string;
}

/** Derive all Tailwind theme tokens from 3 core HSL colors. Ported from ditto/src/lib/colorUtils.ts */
export function deriveTokensFromCore(background: string, text: string, primary: string): ThemeTokens {
  const dark = isDarkTheme(background);
  // Use a stronger card offset so content boxes are readable over background images
  const card = dark ? lighten(background, 6) : darken(background, 4);
  const popover = dark ? lighten(background, 4) : darken(background, 2);
  const secondarySurface = dark ? lighten(background, 8) : darken(background, 4);
  const muted = dark ? lighten(background, 8) : darken(background, 4);
  const { h: ph, s: ps } = parseHsl(primary);
  const border = dark ? formatHsl(ph, ps * 0.4, 30) : formatHsl(ph, ps * 0.5, 82);
  const input = border;
  const { h: fh, s: fs, l: fl } = parseHsl(text);
  const mutedFg = dark
    ? formatHsl(fh, Math.max(fs - 20, 0), Math.max(fl - 30, 40))
    : formatHsl(fh, Math.max(fs - 30, 0), Math.min(fl + 35, 55));
  const primaryFg = contrastForeground(primary);
  const destructive = dark ? '0 72% 51%' : '0 84.2% 60.2%';
  const destructiveFg = dark ? '0 0% 95%' : '210 40% 98%';
  return {
    background, foreground: text, card, cardForeground: text, popover, popoverForeground: text,
    primary, primaryForeground: primaryFg, secondary: secondarySurface, secondaryForeground: text,
    muted, mutedForeground: mutedFg, accent: primary, accentForeground: primaryFg,
    destructive, destructiveForeground: destructiveFg, border, input, ring: primary,
  };
}

/** Build a CSS :root block from ThemeTokens */
export function buildThemeCss(tokens: ThemeTokens): string {
  const toVar = (k: string) => `--${k.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`)}`;
  const vars = (Object.entries(tokens) as [string, string][])
    .map(([k, v]) => `${toVar(k)}: ${v};`)
    .join(' ');
  return `:root { ${vars} }`;
}

/** Convenience: derive tokens + build CSS from 3 core colors */
export function buildThemeCssFromCore(bg: string, text: string, primary: string): string {
  return buildThemeCss(deriveTokensFromCore(bg, text, primary));
}
