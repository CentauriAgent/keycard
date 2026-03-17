# Ditto Theme System Integration

**Status:** ✅ Complete and deployed  
**Deploy URL:** https://keycard-preview.surge.sh  
**Date:** March 17, 2026

## Overview

Integrated Ditto's Nostr-native theme system (kind 16767) into keycard. Card pages now automatically apply a user's Ditto theme, and the editor includes all Ditto presets as selectable options.

## What Was Built

### 1. Core Utilities (`src/lib/`)

#### `colorUtils.ts`
- HSL ↔ RGB ↔ hex conversion utilities
- `hslToCss()` — converts "228 20% 10%" → "hsl(228, 20%, 10%)"
- `isDarkTheme()` — luminance-based dark/light detection
- Standalone, no external imports

#### `dittoTheme.ts`
- Type definitions: `CoreThemeColors`, `ThemeFont`, `ThemeBackground`, `ThemeConfig`, `ThemePreset`
- `parseActiveProfileTheme()` — parse kind 16767 events
- `buildActiveThemeTags()` — build tags for publishing kind 16767
- **23 built-in theme presets** from Ditto (pink, toxic, sunset, skater, kawaii, grunge, mspaint, retropop, bubblegum, gamer, cottage, midnight, sky, motherboard, galaxy, ocean, forest, clearsky, silenttorii, quiethorizon, wherepathsmeet, once, plush)
- Featured vs. non-featured preset categorization

### 2. Hook (`src/hooks/`)

#### `useDittoTheme.ts`
- Fetches kind 16767 for a given pubkey
- Uses `@tanstack/react-query` for caching (5 min stale time)
- Returns parsed `ActiveProfileTheme | null`

### 3. Card Rendering (`src/components/card/`)

#### `CardPage.tsx`
- Fetches Ditto theme for the card owner's pubkey
- **Ditto theme overrides keycard config.theme when present**
- Applies:
  - Background color (HSL → CSS)
  - Text color
  - Accent color (passed to child components)
  - Custom font (Google Fonts fallback)
  - Background image (CSS `background-image` with `cover`)
- Falls back to existing `config.theme` if no kind 16767 found

#### Updated child components:
- `CardHero.tsx` — accepts `accentColor` prop for banner gradient
- `QuickActions.tsx` — uses accent for action button backgrounds
- `ZapButton.tsx` — uses accent for zap button color
- `SocialLinks.tsx` — signature updated (currently unused)

### 4. Theme Editor (`src/components/editor/`)

#### `ThemeSection.tsx`
- **Replaced old preset grid with Ditto's 23 theme presets**
- Featured presets shown prominently (4:3 aspect ratio cards with preview)
- Other presets in compact grid
- Visual preview: background image, colors, emoji, label
- Active theme info panel with "Clear" button
- Updates both:
  - New Ditto fields: `dittoPresetKey`, `dittoColors`, `dittoFont`, `dittoBackground`, `dittoTitle`
  - Legacy fields: `background`, `accent`, `mode` (for backward compat)

#### `EditorForm.tsx`
- Extended `EditorFormValues` with Ditto theme fields:
  - `dittoPresetKey?: string`
  - `dittoColors?: CoreThemeColors`
  - `dittoFont?: string`
  - `dittoBackground?: string`
  - `dittoTitle?: string`

#### `SaveButton.tsx`
- Publishes kind:30078 (card config) as before
- **Also publishes kind 16767** when a Ditto theme is selected:
  - Builds tags via `buildActiveThemeTags()`
  - Includes theme title, colors, font, background
  - Uses `useNostrPublish()` hook
- Success toast shows confirmation for both events

## How It Works

### Viewing a Card
1. CardPage fetches kind 16767 for the card owner's pubkey
2. If found, Ditto theme is applied (colors, font, background image)
3. If not found, falls back to existing `config.theme` logic
4. Ditto theme always takes precedence over config theme

### Editing a Card
1. User selects a Ditto preset in ThemeSection
2. Form stores both Ditto fields (for kind 16767) and legacy fields (for backward compat)
3. On save:
   - Kind 30078 (card config) is published with theme colors
   - Kind 16767 (active theme) is published with full Ditto theme data
4. Both events are signed and broadcast to relays

### NIP Compliance
- **Kind 16767** — Replaceable event, one per user (active profile theme)
- Tags: `c` (colors), `f` (font), `bg` (background), `title`, `alt`
- Colors stored as hex in tags, converted to/from HSL internally
- Font includes family + optional URL
- Background includes URL + mode + mime type + dimensions + blurhash

## Theme Presets

**23 presets total, 18 featured:**
- 🌸 Pink — light pink with Comfortaa font + blossom background
- ☢️ Toxic — dark green terminal vibe with JetBrains Mono
- 🌅 Sunset — warm orange/peach with Lora serif
- 🛹 Skater — gray + neon lime with Rubik Maps + skate park image
- 🌸 Kawaii — pastel pink with Cherry Bomb One + kawaii pattern
- 🖤 Grunge — dark purple + hot pink with Lacquer + grunge texture
- 🖥️ MS Paint — retro Windows 95 with Silkscreen + paint texture
- 💿 Retro Pop — pastel blue + purple with Bungee Shade + retro pattern
- 🍬 Bubblegum — bright white + magenta with Barriecito + candy pattern
- ⚡ Gamer — dark green + cyan with Press Start 2P + circuit board
- 🌿 Cottage — natural green with Lora + nature photo
- 🌃 Midnight — dark city theme with Inter + night skyline
- ☁️ Sky — light blue with Nunito + clouds
- 🪟 Motherboard — gray tech theme with Courier Prime + motherboard photo
- 🌌 Galaxy — dark purple space theme with DM Sans + galaxy photo
- 🌊 Ocean — deep blue underwater theme with Nunito + ocean photo
- 🌲 Forest — dark green forest theme with Merriweather + forest photo
- ✨ Clear Sky Vibes — dark blue + cyan with Comfortaa + stars
- ⛩️ Silent Torii — dark red Japanese theme with DM Sans + torii gate
- 🌅 Quiet Horizon — muted teal with Lora + horizon photo
- 🌉 Where Paths Meet — teal bridge theme with DM Sans + bridge photo
- 🎲 Once — dark blue random theme with Outfit + random photo

## Files Modified

```
src/lib/colorUtils.ts              ← NEW
src/lib/dittoTheme.ts              ← NEW
src/hooks/useDittoTheme.ts         ← NEW
src/components/card/CardPage.tsx   ← MODIFIED
src/components/card/CardHero.tsx   ← MODIFIED
src/components/card/QuickActions.tsx ← MODIFIED
src/components/card/ZapButton.tsx  ← MODIFIED
src/components/card/SocialLinks.tsx ← MODIFIED
src/components/editor/ThemeSection.tsx ← REPLACED
src/components/editor/EditorForm.tsx ← MODIFIED
src/components/editor/SaveButton.tsx ← MODIFIED
```

## Testing

**Live demo:** https://keycard-preview.surge.sh

To test:
1. Create a card with a Ditto theme preset
2. Publish — kind 30078 + kind 16767 are both published
3. View the card — Ditto theme is applied (colors, font, background)
4. Verify theme persists on page reload
5. Try changing theme and re-publishing

## Future Enhancements

- [ ] Theme preview in editor (live card mockup)
- [ ] Custom color picker (not just presets)
- [ ] Theme sharing via naddr (kind 36767 definitions)
- [ ] Import themes from other users
- [ ] Theme marketplace / discovery

## References

- Ditto theme system: `/home/moltbot/projects/ditto/src/themes.ts`
- NIP-XX (theme events): kind 16767 (active), kind 36767 (definitions)
- keycard config: kind 30078, d-tag "key.card/profile"
