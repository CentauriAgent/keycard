# key.card — UI Design Specification

> **Author:** Centauri (UI Designer)
> **Date:** 2026-03-17
> **Status:** Complete — ready for frontend implementation
> **Stack:** React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui + lucide-react

---

## Table of Contents

1. [Design System](#1-design-system)
2. [Card View Page](#2-card-view-page)
3. [QR Code Overlay](#3-qr-code-overlay)
4. [Card Editor](#4-card-editor)
5. [Landing Page](#5-landing-page)
6. [Animations & Transitions](#6-animations--transitions)
7. [Component Inventory](#7-component-inventory)

---

## 1. Design System

### 1.1 Color Tokens

All colors use Tailwind classes. The app supports **light** and **dark** themes via the `dark:` variant (class strategy). Card creators can also set a custom theme via kind:30078.

#### Global App Palette

| Token | Light | Dark | Tailwind Class |
|-------|-------|------|----------------|
| Background | `#FFFFFF` | `#0A0A0F` | `bg-white dark:bg-[#0A0A0F]` |
| Surface | `#F8FAFC` | `#12121A` | `bg-slate-50 dark:bg-[#12121A]` |
| Surface Elevated | `#FFFFFF` | `#1A1A2E` | `bg-white dark:bg-[#1A1A2E]` |
| Border | `#E2E8F0` | `#2D2D44` | `border-slate-200 dark:border-[#2D2D44]` |
| Text Primary | `#0F172A` | `#F1F5F9` | `text-slate-900 dark:text-slate-100` |
| Text Secondary | `#64748B` | `#94A3B8` | `text-slate-500 dark:text-slate-400` |
| Text Muted | `#94A3B8` | `#64748B` | `text-slate-400 dark:text-slate-500` |

#### Brand / Accent Colors

| Token | Value | Tailwind Class | Usage |
|-------|-------|----------------|-------|
| Primary (Nostr Purple) | `#8B5CF6` | `text-violet-500` / `bg-violet-500` | CTAs, links, active states |
| Primary Hover | `#7C3AED` | `hover:bg-violet-600` | Button hover |
| Primary Muted | `#8B5CF620` | `bg-violet-500/10` | Subtle backgrounds |
| Lightning Gold | `#F59E0B` | `text-amber-500` / `bg-amber-500` | Zap button, Lightning |
| Lightning Hover | `#D97706` | `hover:bg-amber-600` | Zap button hover |
| Success | `#22C55E` | `text-green-500` | Verified badges, confirmations |
| Danger | `#EF4444` | `text-red-500` | Errors, destructive actions |
| Warning | `#F59E0B` | `text-amber-500` | Privacy warnings |

#### Card Theme Presets

These are selectable by the card creator in the editor. Applied to the card view only (not the global app).

| Preset Name | Background | Accent | Card Style | CSS Classes |
|-------------|-----------|--------|------------|-------------|
| **Midnight** (default) | `#0A0A0F` | `#8B5CF6` | `glass` | `bg-[#0A0A0F] text-white` |
| **Nostr Purple** | `#1A1A2E` | `#8B5CF6` | `solid` | `bg-[#1A1A2E] text-white` |
| **Clean Light** | `#FFFFFF` | `#6366F1` | `solid` | `bg-white text-slate-900` |
| **Warm Dark** | `#1C1917` | `#F59E0B` | `solid` | `bg-stone-900 text-stone-100` |
| **Ocean** | `#0C4A6E` | `#38BDF8` | `gradient` | `bg-gradient-to-b from-sky-900 to-sky-950 text-white` |
| **Bitcoin** | `#1A1A2E` | `#F7931A` | `solid` | `bg-[#1A1A2E] text-white` |

Card styles:
- **`solid`**: Flat background color, no effects.
- **`glass`**: `backdrop-blur-xl bg-white/5 border border-white/10` — frosted glass effect on sections.
- **`gradient`**: Background uses a CSS gradient (defined per preset).

### 1.2 Typography

Uses system font stack (already configured in Tailwind). No custom fonts — faster load.

| Element | Tailwind Classes | Size |
|---------|-----------------|------|
| Hero Name (Card View) | `text-2xl font-bold tracking-tight` | 24px |
| Title/Company | `text-base font-medium` | 16px |
| Username (@handle) | `text-sm font-normal text-slate-400` | 14px |
| Section Heading | `text-xs font-semibold uppercase tracking-wider text-slate-400` | 12px |
| Body Text | `text-sm font-normal leading-relaxed` | 14px |
| Button Text | `text-sm font-medium` | 14px |
| Label | `text-xs font-medium` | 12px |
| Caption / Muted | `text-xs text-slate-500` | 12px |

### 1.3 Spacing Scale

Consistent spacing using Tailwind's default scale (4px base):

| Usage | Tailwind | px |
|-------|----------|----|
| Page horizontal padding | `px-4` | 16px |
| Section vertical gap | `gap-6` / `space-y-6` | 24px |
| Card internal padding | `p-4` | 16px |
| Between card fields | `gap-3` / `space-y-3` | 12px |
| Between icon and label | `gap-2` | 8px |
| Button padding | `px-4 py-2` | 16px / 8px |
| Inline icon gap | `gap-1.5` | 6px |

### 1.4 Border Radius

| Element | Tailwind | Radius |
|---------|----------|--------|
| Card container | `rounded-2xl` | 16px |
| Section cards | `rounded-xl` | 12px |
| Buttons | `rounded-lg` | 8px |
| Avatar | `rounded-full` | 50% |
| Input fields | `rounded-md` | 6px |
| Badges | `rounded-full` | 9999px |

### 1.5 Shadow & Elevation

| Level | Tailwind | Usage |
|-------|----------|-------|
| None | — | Default state |
| Subtle | `shadow-sm` | Section cards in light mode |
| Card | `shadow-lg shadow-black/5 dark:shadow-black/20` | Elevated cards |
| Modal | `shadow-2xl shadow-black/25` | QR overlay, dialogs |
| Sticky bar | `shadow-[0_-4px_12px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_12px_rgba(0,0,0,0.4)]` | Bottom toolbar |

### 1.6 Icon Library

**lucide-react** (already in MKStack via shadcn/ui).

All icons render at `16px` (w-4 h-4) inline, `20px` (w-5 h-5) for action buttons, `24px` (w-6 h-6) for prominent actions.

Icon mapping for quick actions and social links:

| Context | Icon | lucide-react Name |
|---------|------|-------------------|
| Phone / Call | 📞 | `Phone` |
| SMS / Text | 💬 | `MessageSquare` |
| Email | ✉️ | `Mail` |
| Nostr DM | 💜 | `Send` |
| Website | 🌐 | `Globe` |
| QR Code | ▣ | `QrCode` |
| Share | ↗ | `Share2` |
| Save Contact | 👤+ | `UserPlus` |
| Zap / Lightning | ⚡ | `Zap` |
| Calendar / Book | 📅 | `Calendar` |
| Address / Map | 📍 | `MapPin` |
| Verified | ✅ | `BadgeCheck` |
| Copy | 📋 | `Copy` |
| GitHub | — | `Github` |
| Twitter/X | — | `Twitter` |
| YouTube | — | `Youtube` |
| LinkedIn | — | `Linkedin` |
| Podcast | 🎙 | `Podcast` |
| File/Resume | 📄 | `FileText` |
| Generic Link | 🔗 | `ExternalLink` |
| Edit | ✏️ | `Pencil` |
| Settings | ⚙️ | `Settings` |
| ChevronRight | › | `ChevronRight` |
| Download | ⬇ | `Download` |
| Image | 🖼 | `Image` |
| Smartphone | 📱 | `Smartphone` |
| Wallet | 💳 | `Wallet` |
| Eye (preview) | 👁 | `Eye` |
| EyeOff | — | `EyeOff` |
| AlertTriangle | ⚠️ | `AlertTriangle` |
| Plus | + | `Plus` |
| Trash | 🗑 | `Trash2` |
| GripVertical | ⠿ | `GripVertical` |

---

## 2. Card View Page

**Route:** `/:identifier`
**Auth:** None (public)
**Purpose:** Display a user's digital business card. The #1 most-visited page — must load fast and look stunning on mobile.

### 2.1 Layout Overview

```
┌──────────────────────────────────────┐
│           BANNER IMAGE               │  ← Full-width, 200px tall
│      (or gradient fallback)          │
│                                      │
│         ┌──────────┐                 │
│         │  AVATAR  │                 │  ← 96px circle, overlapping banner by 48px
│         └──────────┘                 │
├──────────────────────────────────────┤
│                                      │
│        Derek Ross                    │  ← display_name, centered
│        @derek                        │  ← username, muted
│  ✅ derek@nostrplebs.com             │  ← NIP-05 badge
│  Developer Relations at Soapbox      │  ← title + company
│                                      │
├──────────────────────────────────────┤
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐       │  ← Quick Action Buttons
│  │Call│ │ SMS│ │Email│ │ DM │       │
│  └────┘ └────┘ └────┘ └────┘       │
├──────────────────────────────────────┤
│  ⚡ ZAP                              │  ← Lightning Zap Button (full-width)
├──────────────────────────────────────┤
│  CONTACT INFO                        │  ← Section card
│  📞 +1-555-123-4567 (Mobile)        │
│  📞 +1-555-987-6543 (Office)        │
│  ✉️ derek@example.com               │
│  📍 Huntingdon, PA                   │
├──────────────────────────────────────┤
│  ABOUT                               │  ← Bio section
│  Nostr Evangelist 💜 Building...     │
├──────────────────────────────────────┤
│  SOCIAL & LINKS                      │  ← NIP-39 + custom links
│  ┌──────────────────────────── ›┐   │
│  │ ✅ GitHub     derekross       │   │
│  ├──────────────────────────── ›┤   │
│  │ ✅ Twitter    deaboross       │   │
│  ├──────────────────────────── ›┤   │
│  │ 🔗 YouTube   Derek Ross      │   │
│  ├──────────────────────────── ›┤   │
│  │ 🎙 Podcast   Soapbox Sessions │   │
│  └──────────────────────────────┘   │
├──────────────────────────────────────┤
│  📅 SCHEDULE A MEETING               │  ← Booking card
│  Book a time with Derek →            │
├──────────────────────────────────────┤
│  Powered by key.card — Your keys,    │  ← Footer
│  your identity                       │
├──────────────────────────────────────┤
│                                      │
│  ▣ QR   ↗ Share   👤+ Save Contact  │  ← STICKY BOTTOM TOOLBAR
│                                      │
└──────────────────────────────────────┘
```

### 2.2 Container & Responsive Behavior

| Property | Mobile (<480px) | Desktop (≥480px) |
|----------|----------------|------------------|
| Card width | `w-full` | `max-w-[480px] mx-auto` |
| Page background | Card theme background | `bg-slate-100 dark:bg-[#0A0A0F]` (visible as margin around card) |
| Card container | No outer border, flush | `rounded-2xl shadow-2xl overflow-hidden` centered |
| Horizontal padding | `px-0` (card fills screen) | Card is self-contained with rounded corners |
| Content area padding | `px-4` inside card | `px-6` inside card |
| Min-height | `min-h-screen` | `min-h-screen` with centered card |
| Bottom padding | `pb-24` (room for sticky bar) | `pb-24` |

**Wrapper structure:**
```tsx
<div className="min-h-screen bg-slate-100 dark:bg-[#0A0A0F]">
  <div className="mx-auto max-w-[480px] min-h-screen bg-white dark:bg-[#0A0A0F] sm:my-8 sm:min-h-0 sm:rounded-2xl sm:shadow-2xl sm:overflow-hidden">
    {/* Card content */}
  </div>
</div>
```

On mobile: card fills viewport edge-to-edge. On desktop: card is a centered column with rounded corners and shadow floating on a subtle background.

### 2.3 Banner / Hero Section

**Component:** `CardBanner`
**shadcn/ui:** None (custom)

| Property | Value |
|----------|-------|
| Height | `h-[200px]` (200px) |
| Width | Full card width |
| Object fit | `object-cover` |
| Fallback (no banner) | Gradient: `bg-gradient-to-br from-violet-600 to-indigo-900` |
| Fallback (image error) | Same gradient as above |

**Banner source priority:**
1. kind:30078 `banner` field (custom banner)
2. kind:0 `banner` field (Nostr profile banner)
3. Gradient fallback using card accent color

### 2.4 Avatar

**Component:** `CardAvatar`
**shadcn/ui:** `Avatar`, `AvatarImage`, `AvatarFallback`

| Property | Value |
|----------|-------|
| Size | `w-24 h-24` (96px) |
| Border | `ring-4 ring-white dark:ring-[#0A0A0F]` (matches card bg) |
| Shape | `rounded-full` |
| Position | `mx-auto -mt-12` (overlaps banner by 48px) |
| Fallback | First letter of display_name in `bg-violet-500 text-white text-2xl font-bold` |
| Container | `relative z-10` (above banner) |

```tsx
<div className="relative z-10 mx-auto -mt-12 w-24 h-24">
  <Avatar className="w-24 h-24 ring-4 ring-white dark:ring-[#0A0A0F]">
    <AvatarImage src={picture} alt={displayName} className="object-cover" />
    <AvatarFallback className="bg-violet-500 text-white text-2xl font-bold">
      {displayName?.[0]?.toUpperCase() ?? '?'}
    </AvatarFallback>
  </Avatar>
</div>
```

### 2.5 Identity Section

**Component:** `CardIdentity`
**Position:** Directly below avatar, centered text, `px-4 pt-3 pb-4`

```
          Derek Ross              ← text-2xl font-bold tracking-tight text-center
           @derek                 ← text-sm text-slate-400 text-center
    ✅ derek@nostrplebs.com       ← Badge with icon + text
   Developer Relations            ← text-base font-medium text-center
    at Soapbox Technology         ← text-sm text-slate-400 text-center
```

| Element | Classes |
|---------|---------|
| Display name | `text-2xl font-bold tracking-tight text-center` |
| Username | `text-sm text-slate-400 text-center mt-0.5` |
| NIP-05 badge | Inline-flex: `BadgeCheck` icon (w-4 h-4 text-green-500) + `text-sm text-slate-400 mt-1` |
| Title | `text-base font-medium text-center mt-2` |
| Company | `text-sm text-slate-400 text-center` — appended to title as "at {company}" |
| Vertical gap | `space-y-0.5` between lines, `mt-2` before title block |

**NIP-05 badge** is tappable → copies NIP-05 to clipboard with a toast "Copied!"

### 2.6 Quick Action Buttons

**Component:** `CardQuickActions`
**shadcn/ui:** `Button` (variant: `outline`)
**Position:** `px-4 mt-4`

A horizontally scrollable row of circular icon buttons with labels beneath.

| Property | Value |
|----------|-------|
| Container | `flex gap-3 justify-center px-4` |
| Each button wrapper | `flex flex-col items-center gap-1.5` |
| Button circle | `w-12 h-12 rounded-full` with `bg-violet-500/10 hover:bg-violet-500/20` |
| Icon | `w-5 h-5 text-violet-500` centered in circle |
| Label | `text-xs text-slate-400` below button |

**Buttons (conditional — only show if data exists):**

| Button | Icon | Label | Action | Show When |
|--------|------|-------|--------|-----------|
| Call | `Phone` | Call | `tel:{phone[0].number}` | phone exists |
| SMS | `MessageSquare` | SMS | `sms:{phone[0].number}` | phone exists |
| Email | `Mail` | Email | `mailto:{email}` | email or nip05 with @ |
| DM | `Send` | Nostr DM | Opens nostr: DM link via njump | Always (npub exists) |

If fewer than 2 actions are available, hide the quick actions row entirely.

### 2.7 Zap Button

**Component:** `ZapButton` (exists — reuse and restyle)
**shadcn/ui:** `Button`
**Position:** `px-4 mt-4`

| Property | Value |
|----------|-------|
| Container | `w-full` |
| Height | `h-12` |
| Background | `bg-amber-500 hover:bg-amber-600 text-white` |
| Border radius | `rounded-xl` |
| Icon | `Zap` (w-5 h-5) left of label, filled |
| Label | `text-sm font-semibold` — "⚡ Zap {displayName}" |
| Shadow | `shadow-lg shadow-amber-500/25` |
| Condition | Only show if `lud16` exists in kind:0 |

On click → opens `ZapDialog` (existing component). Pre-fill amounts: 21, 100, 500, 1000 sats.

### 2.8 Contact Info Card

**Component:** `CardContactInfo`
**shadcn/ui:** `Card`, `CardHeader`, `CardTitle`, `CardContent`
**Position:** `px-4 mt-6`

```
┌─────────────────────────────────────┐
│  CONTACT INFO          ← section heading
│                                     │
│  📞 +1-555-123-4567                 │  ← tappable, calls number
│     Mobile                          │  ← type label, muted
│  ─────────────────────              │  ← separator
│  📞 +1-555-987-6543                 │
│     Office                          │
│  ─────────────────────              │
│  ✉️ derek@example.com              │  ← tappable, opens email
│  ─────────────────────              │
│  📍 123 Freedom Ln                  │  ← tappable, opens maps
│     Huntingdon, PA 16652            │
└─────────────────────────────────────┘
```

| Element | Classes |
|---------|---------|
| Section wrapper | `rounded-xl border border-slate-200 dark:border-[#2D2D44] p-4` |
| Section title | `text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3` |
| Each row | `flex items-start gap-3 py-2.5` |
| Icon | `w-4 h-4 text-violet-500 mt-0.5 shrink-0` |
| Value | `text-sm font-medium` — linked via `tel:` / `mailto:` / maps URL |
| Label | `text-xs text-slate-400` below value |
| Separator | `<Separator />` (shadcn) between rows |

Phone rows link to `tel:{number}`. Address links to `https://maps.google.com/?q={address}`.

**Condition:** Only render this section if phone, email (from kind:30078), or address exists. If only email from NIP-05 — don't duplicate here (it's in identity section).

### 2.9 About Section

**Component:** `CardAbout`
**Position:** `px-4 mt-6`

| Element | Classes |
|---------|---------|
| Section wrapper | Same card style as Contact Info |
| Section title | `text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3` — "About" |
| Bio text | `text-sm leading-relaxed text-slate-700 dark:text-slate-300` |
| Truncation | If > 300 chars, truncate with `line-clamp-6` and a "Read more" button |
| "Read more" | `text-sm font-medium text-violet-500 hover:text-violet-600 mt-2` |
| Expanded state | Remove line-clamp, show "Show less" |

**Condition:** Only render if kind:0 `about` exists and is non-empty.

### 2.10 Social & Links Section

**Component:** `CardLinks`
**shadcn/ui:** `Card`, `Separator`
**Position:** `px-4 mt-6`

Two sub-sections rendered in one card: **Verified Accounts** (NIP-39) first, then **Links** (kind:30078).

```
┌─────────────────────────────────────┐
│  SOCIAL & LINKS                     │
│                                     │
│  [GitHub icon]  GitHub        ✅  › │  ← NIP-39 verified
│  ─────────────────────              │
│  [Twitter icon] Twitter       ✅  › │  ← NIP-39 verified
│  ─────────────────────              │
│  [YouTube icon] YouTube          › │  ← kind:30078 link
│  ─────────────────────              │
│  [Podcast icon] Soapbox Sessions › │  ← kind:30078 link
│  ─────────────────────              │
│  [Globe icon]   derekross.me     › │  ← kind:0 website
└─────────────────────────────────────┘
```

| Element | Classes |
|---------|---------|
| Each link row | `flex items-center gap-3 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 -mx-4 px-4 transition-colors` |
| Platform icon | `w-5 h-5 text-slate-500 dark:text-slate-400 shrink-0` — uses lucide icon from icon map |
| Label text | `text-sm font-medium flex-1` |
| Verified badge | `BadgeCheck` `w-4 h-4 text-green-500` — only for NIP-39 entries |
| Chevron | `ChevronRight` `w-4 h-4 text-slate-400` |
| Separator | `<Separator />` between rows |

**On click:** Opens URL in new tab (`target="_blank" rel="noopener"`).

**Deduplication:** If a NIP-39 identity and kind:30078 link reference the same platform, show only the NIP-39 version (it has proof). Compare by platform name (e.g., if NIP-39 has `github:derekross` and links has a GitHub URL, only show the NIP-39 version).

**Website from kind:0:** If `website` field exists in kind:0 and isn't already covered by a link, add it as the last row with a `Globe` icon.

### 2.11 Schedule Meeting Card

**Component:** `CardBooking`
**shadcn/ui:** `Button`
**Position:** `px-4 mt-6`

| Element | Classes |
|---------|---------|
| Container | Same card style as others |
| Icon | `Calendar` `w-5 h-5 text-violet-500` |
| Heading | `text-sm font-semibold` — booking label or "Schedule a Meeting" |
| Subtext | `text-xs text-slate-400` — "Book a time" |
| Button | Full-width `Button` variant `outline` with `rounded-lg` — "Open Calendar →" |

**On click:** Opens booking URL in new tab.

**Condition:** Only render if kind:30078 `booking` exists.

### 2.12 Footer

**Component:** `CardFooter`
**Position:** `px-4 mt-8 mb-6 pb-20` (extra padding for sticky bar)

| Element | Classes |
|---------|---------|
| Container | `text-center` |
| "Powered by" text | `text-xs text-slate-400` — "Powered by key.card" |
| Link | `text-violet-500 hover:underline` wrapping "key.card" |
| Subtext | `text-xs text-slate-400/60` — "Your identity. Your keys. Your card." |

### 2.13 Sticky Bottom Toolbar

**Component:** `CardToolbar`
**Position:** Fixed to bottom of viewport, inside card container

| Property | Value |
|----------|-------|
| Position | `fixed bottom-0 left-0 right-0 z-50` (on mobile) / `sticky bottom-0` (desktop card) |
| Container | `max-w-[480px] mx-auto` |
| Height | `h-16` |
| Background | `bg-white/80 dark:bg-[#0A0A0F]/80 backdrop-blur-xl` |
| Border top | `border-t border-slate-200 dark:border-[#2D2D44]` |
| Shadow | Upward shadow (see 1.5) |
| Layout | `flex items-center justify-around px-4` |
| Safe area | `pb-[env(safe-area-inset-bottom)]` for iOS notch phones |

**Buttons:**

| Button | Icon | Label | Action |
|--------|------|-------|--------|
| QR | `QrCode` | QR Code | Opens QR Code Overlay (Section 3) |
| Share | `Share2` | Share | Triggers Web Share API (`navigator.share`); fallback: copy URL to clipboard |
| Save | `UserPlus` | Save Contact | Downloads vCard .vcf file |

Each button: `flex flex-col items-center gap-1`, icon `w-5 h-5`, label `text-xs font-medium`.

Active/pressed state: icon color changes to `text-violet-500`.

**Web Share API fallback:** If `navigator.share` is unavailable, copy link to clipboard and show toast "Link copied!".

### 2.14 Loading State

While fetching Nostr data, show a skeleton:

| Element | Skeleton |
|---------|----------|
| Banner | `h-[200px] bg-slate-200 dark:bg-slate-800 animate-pulse` |
| Avatar | `w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse` |
| Name | `h-7 w-40 mx-auto rounded bg-slate-200 dark:bg-slate-800 animate-pulse` |
| Title | `h-5 w-56 mx-auto rounded bg-slate-200 dark:bg-slate-800 animate-pulse` |
| Action buttons | 4 × `w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse` |
| Sections | 2 × `h-32 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse` |

Use shadcn/ui `Skeleton` component.

### 2.15 Error / Not Found State

If identifier can't be resolved or kind:0 doesn't exist:

| Element | Value |
|---------|-------|
| Container | Centered on page, `max-w-[480px] mx-auto p-8 text-center` |
| Icon | `UserPlus` `w-16 h-16 text-slate-300 mx-auto` |
| Heading | `text-xl font-bold mt-4` — "Card not found" |
| Message | `text-sm text-slate-400 mt-2` — "This Nostr identity doesn't have a profile yet." |
| CTA | Button → "Create your own card" linking to `/` |

---

## 3. QR Code Overlay

**Trigger:** Tap QR button in sticky toolbar
**Component:** `QRCodeOverlay`
**shadcn/ui:** `Sheet` (bottom sheet on mobile) / `Dialog` (on desktop)
**Behavior:** Slides up from bottom on mobile. Centered dialog on desktop (≥640px).

### 3.1 Layout

```
┌──────────────────────────────────────┐
│            ─────  (sheet handle)     │
│                                      │
│         ┌──────────┐                 │
│         │  AVATAR  │                 │  ← 64px circle
│         └──────────┘                 │
│        Derek Ross                    │  ← text-lg font-bold
│    Developer Relations               │  ← text-sm text-slate-400
│                                      │
│     ┌────────────────────┐           │
│     │                    │           │
│     │    ▓▓▓ QR CODE ▓▓▓ │           │  ← 256px square, centered
│     │                    │           │
│     └────────────────────┘           │
│                                      │
│    key.card/derek@nostrplebs.com     │  ← copyable URL, text-xs
│                                      │
│  ┌──────────────┐ ┌──────────────┐   │
│  │  Apple       │ │  Google      │   │  ← Wallet buttons
│  │  Wallet      │ │  Wallet      │   │
│  └──────────────┘ └──────────────┘   │
│                                      │
│  ┌──────────────────────────────┐   │
│  │ 📱 Add to Home Screen        │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │ 💾 Save QR to Gallery         │   │
│  └──────────────────────────────┘   │
│                                      │
└──────────────────────────────────────┘
```

### 3.2 Specs

| Element | Classes |
|---------|---------|
| Sheet/Dialog | Mobile: `Sheet` (side="bottom"), max-height 90vh, `rounded-t-2xl`. Desktop: `Dialog` centered, `max-w-sm rounded-2xl` |
| Sheet handle | `w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600 mx-auto mt-3 mb-4` |
| Avatar | `w-16 h-16 rounded-full mx-auto` (same component as card view, smaller) |
| Name | `text-lg font-bold text-center mt-3` |
| Title | `text-sm text-slate-400 text-center` |
| QR Code | `w-64 h-64 mx-auto mt-6` — white background, 16px padding |
| QR container | `bg-white rounded-2xl p-4 inline-block mx-auto` (always white bg for scan contrast) |
| URL text | `text-xs text-slate-400 text-center mt-3 cursor-pointer` — tap to copy |
| QR content | `nostr:nprofile1...` (NIP-19 with relay hints) |
| QR error correction | Level `H` (allows logo overlay) |
| QR foreground | `#000000` (always black on white for maximum scan reliability) |

### 3.3 Wallet Buttons

| Element | Classes |
|---------|---------|
| Row | `flex gap-3 mt-6 px-4` |
| Each button | `flex-1 h-12 rounded-xl border border-slate-200 dark:border-[#2D2D44] flex items-center justify-center gap-2` |
| Apple icon | Apple logo SVG, `w-5 h-5` |
| Google icon | Google Wallet logo SVG, `w-5 h-5` |
| Label | `text-sm font-medium` — "Apple Wallet" / "Google Wallet" |
| Hover | `hover:bg-slate-50 dark:hover:bg-white/5` |

**On click:**
- Apple Wallet → `POST /api/wallet/apple` → download `.pkpass`
- Google Wallet → `POST /api/wallet/google` → redirect to Google save URL

### 3.4 Action Buttons

| Element | Classes |
|---------|---------|
| Container | `space-y-2 mt-4 px-4 pb-6` |
| Each button | `w-full h-11 rounded-xl border border-slate-200 dark:border-[#2D2D44] flex items-center gap-3 px-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors` |
| Icon | `w-4 h-4 text-slate-500` |
| Label | `text-sm font-medium` |

| Button | Icon | Label | Action |
|--------|------|-------|--------|
| Add to Home Screen | `Smartphone` | Add to Home Screen | Triggers PWA install prompt or shows instructions |
| Save to Gallery | `Download` | Save QR to Gallery | Downloads QR as PNG via `canvas.toBlob()` |

---

## 4. Card Editor

**Route:** `/edit`
**Auth:** Required (NIP-07 / NIP-46 / nsec)
**Purpose:** Customize card appearance and add extended info beyond kind:0.

### 4.1 Layout — Desktop (≥1024px)

```
┌──────────────────────────────────────────────────────────────────────┐
│  key.card editor                                        [Preview] ⟶ │
├──────────────────────────────────┬───────────────────────────────────┤
│                                  │                                   │
│   EDIT FORM (scrollable)         │   LIVE PREVIEW (sticky)           │
│   ┌──────────────────────────┐   │   ┌───────────────────────────┐   │
│   │ Profile (from Nostr)     │   │   │                           │   │
│   │ Name: Derek Ross    [✏️] │   │   │   [Card View rendered]    │   │
│   │ Bio: Nostr Evange...     │   │   │   at 375px width          │   │
│   │ Avatar: [image]    [✏️] │   │   │   scaled to fit            │   │
│   │ Banner: [image]    [✏️] │   │   │                           │   │
│   │                          │   │   │                           │   │
│   │ ℹ️ Edit profile in your │   │   │                           │   │
│   │   Nostr client →         │   │   │                           │   │
│   └──────────────────────────┘   │   │                           │   │
│   ┌──────────────────────────┐   │   │                           │   │
│   │ Extended Info             │   │   │                           │   │
│   │ Title: [______________]  │   │   │                           │   │
│   │ Company: [____________]  │   │   └───────────────────────────┘   │
│   │ Phone: [______________]  │   │                                   │
│   │   ⚠️ Public on relays    │   │                                   │
│   │ Address: [____________]  │   │                                   │
│   │   ⚠️ Public on relays    │   │                                   │
│   └──────────────────────────┘   │                                   │
│   ┌──────────────────────────┐   │                                   │
│   │ Custom Links             │   │                                   │
│   │ [+] Add link             │   │                                   │
│   └──────────────────────────┘   │                                   │
│   ┌──────────────────────────┐   │                                   │
│   │ Theme                    │   │                                   │
│   │ [preset picker]          │   │                                   │
│   │ [color pickers]          │   │                                   │
│   └──────────────────────────┘   │                                   │
│   ┌──────────────────────────┐   │                                   │
│   │ Booking URL              │   │                                   │
│   │ URL: [________________]  │   │                                   │
│   │ Label: [______________]  │   │                                   │
│   └──────────────────────────┘   │                                   │
│                                  │                                   │
│   [ 💾 Save & Publish ]         │                                   │
│                                  │                                   │
├──────────────────────────────────┴───────────────────────────────────┤
```

**Layout specs (desktop):**

| Property | Value |
|----------|-------|
| Container | `max-w-6xl mx-auto px-6 py-8` |
| Grid | `grid grid-cols-[1fr_400px] gap-8` |
| Form panel | Scrollable, full height |
| Preview panel | `sticky top-8` — stays visible while scrolling form |
| Preview wrapper | `w-[375px] mx-auto` — renders CardViewPage at iPhone width |
| Preview border | `rounded-2xl border border-slate-200 dark:border-[#2D2D44] overflow-hidden shadow-xl` |
| Preview scale | If needed, `transform scale-[0.85] origin-top` to fit panel |

### 4.2 Layout — Mobile (<1024px)

| Property | Value |
|----------|-------|
| Container | `w-full px-4 py-4` |
| Layout | Single column, full width |
| Preview toggle | Sticky top bar with `Edit` / `Preview` tabs |
| Tab bar | `flex gap-0 bg-slate-100 dark:bg-[#12121A] rounded-lg p-1` with active tab `bg-white dark:bg-[#1A1A2E] rounded-md shadow-sm` |
| When "Edit" active | Show form sections |
| When "Preview" active | Show CardViewPage at full width |

```
┌──────────────────────────────┐
│  [Edit]  [Preview]           │  ← Tab toggle
├──────────────────────────────┤
│                              │
│  (Form sections OR           │
│   Card preview,              │
│   depending on active tab)   │
│                              │
└──────────────────────────────┘
```

### 4.3 Form Sections

Each section is a collapsible card. Use shadcn/ui `Collapsible` or `Accordion` for progressive disclosure.

---

#### Section 1: Profile (kind:0)

**Component:** `EditorProfileSection`
**shadcn/ui:** `Card`, `CardHeader`, `CardTitle`, `CardContent`, `Input`, `Textarea`, `Button`

This section displays the user's current Nostr profile data as **read-only fields** with an edit button that links to their preferred Nostr client.

| Field | Component | Read/Write | Notes |
|-------|-----------|-----------|-------|
| Avatar | `AvatarImage` + `Button` ("Change") | Read-only display | Shows current; "Edit in Nostr client" link |
| Banner | `img` + `Button` ("Change") | Read-only display | Shows current; "Edit in Nostr client" link |
| Display Name | `Input` disabled | Read-only | Greyed out |
| Username | `Input` disabled | Read-only | Greyed out |
| Bio | `Textarea` disabled | Read-only | Greyed out, max 3 lines visible |
| NIP-05 | `Input` disabled | Read-only | Greyed out |
| Website | `Input` disabled | Read-only | Greyed out |
| Lightning Address | `Input` disabled | Read-only | Greyed out |

**CTA at bottom of section:**
```
┌──────────────────────────────────────┐
│ ℹ️ Your profile data comes from your │
│ Nostr identity. To edit it, use      │
│ your Nostr client.                   │
│                                      │
│ [Open in Primal →]  [Open in Iris →] │
└──────────────────────────────────────┘
```

| Element | Classes |
|---------|---------|
| Info box | `rounded-lg bg-violet-500/10 border border-violet-500/20 p-3` |
| Info icon | `AlertTriangle` w-4 h-4 text-violet-500` — actually use `Info` icon from lucide |
| Text | `text-xs text-slate-500` |
| Client links | `text-xs font-medium text-violet-500 hover:underline` |

---

#### Section 2: Extended Info (kind:30078)

**Component:** `EditorExtendedSection`
**shadcn/ui:** `Card`, `Input`, `Label`, `Alert`

| Field | Component | Type | Placeholder |
|-------|-----------|------|-------------|
| Job Title | `Input` | text | "Developer Relations" |
| Company | `Input` | text | "Soapbox Technology" |
| Phone (repeater) | `Input` + type select | tel | "+1-555-123-4567" |
| Address Street | `Input` | text | "123 Freedom Lane" |
| Address City | `Input` | text | "Huntingdon" |
| Address State | `Input` | text | "PA" |
| Address ZIP | `Input` | text | "16652" |
| Address Country | `Select` (shadcn) | select | Country picker |

**Phone repeater:** Up to 3 phone entries. Each row:
```
[Type ▼] [+1-555-123-4567        ] [🗑]
 Mobile
```
- Type: `Select` with options: Mobile, Work, Home, Fax, Other
- Number: `Input` type="tel"
- Delete: `Trash2` icon button, `text-red-400 hover:text-red-500`
- Add: `[+ Add phone]` link button below

**⚠️ Privacy Warning** — shown once above phone and address fields:

```
┌──────────────────────────────────────┐
│  ⚠️ Privacy Notice                   │
│                                      │
│  Phone numbers and addresses are     │
│  published to Nostr relays and       │
│  visible to anyone. Only add info    │
│  you're comfortable sharing          │
│  publicly.                           │
└──────────────────────────────────────┘
```

| Element | Classes |
|---------|---------|
| Alert container | shadcn `Alert` with variant `warning` (custom: `border-amber-500/50 bg-amber-500/10`) |
| Icon | `AlertTriangle` `w-4 h-4 text-amber-500` |
| Title | `text-sm font-semibold text-amber-600 dark:text-amber-400` |
| Text | `text-xs text-amber-600/80 dark:text-amber-400/80` |

---

#### Section 3: Custom Links (kind:30078)

**Component:** `EditorLinksSection`
**shadcn/ui:** `Card`, `Input`, `Select`, `Button`

Drag-and-drop reorderable list of custom links.

Each link row:
```
┌──────────────────────────────────────┐
│ ⠿  [Icon ▼]  [Label          ]      │
│              [URL             ] [🗑] │
└──────────────────────────────────────┘
```

| Element | Component | Notes |
|---------|-----------|-------|
| Drag handle | `GripVertical` `w-4 h-4 text-slate-400 cursor-grab` | Left side |
| Icon select | `Select` | Options: github, twitter, youtube, linkedin, globe, podcast, etc. (from NOSTR-DESIGN.md icon set) |
| Label | `Input` | "GitHub", "My Portfolio", etc. |
| URL | `Input` type="url" | "https://github.com/derekross" |
| Delete | `Trash2` icon button | Removes row |
| Add button | `Button` variant="outline" | `[+ Add Link]`, full width, dashed border |

**Max links:** 20 (soft limit, show warning at 15+).

---

#### Section 4: Theme Picker (kind:30078)

**Component:** `EditorThemeSection`
**shadcn/ui:** `Card`, `RadioGroup`, `Label`

```
┌──────────────────────────────────────┐
│  THEME                               │
│                                      │
│  Presets:                            │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐       │
│  │ 🌙 │ │ 💜 │ │ ☀️ │ │ 🔥 │       │
│  │Dark│ │Nostr│ │Light│ │Warm│      │
│  └────┘ └────┘ └────┘ └────┘       │
│  ┌────┐ ┌────┐                      │
│  │ 🌊 │ │ ₿  │                      │
│  │Ocean│ │ BTC│                      │
│  └────┘ └────┘                      │
│                                      │
│  Background: [■ #0A0A0F  ] [🎨]     │  ← color picker
│  Accent:     [■ #8B5CF6  ] [🎨]     │  ← color picker
│                                      │
│  Card Style:                         │
│  ○ Solid   ○ Glass   ○ Gradient     │
│                                      │
└──────────────────────────────────────┘
```

**Preset circles:**

| Property | Value |
|----------|-------|
| Container | `grid grid-cols-4 gap-3` (or `flex flex-wrap gap-3`) |
| Each preset | `w-16 h-16 rounded-xl border-2 cursor-pointer flex flex-col items-center justify-center gap-1` |
| Selected state | `border-violet-500 ring-2 ring-violet-500/30` |
| Unselected | `border-slate-200 dark:border-[#2D2D44] hover:border-violet-300` |
| Emoji | `text-lg` |
| Label | `text-[10px] font-medium text-slate-500` |

Each preset swatch shows a mini preview of its background color with the accent as a dot.

**Color pickers:**

| Element | Classes |
|---------|---------|
| Row | `flex items-center gap-3` |
| Color swatch | `w-8 h-8 rounded-lg border border-slate-200 cursor-pointer` — shows current color |
| Hex input | `Input` `w-28 font-mono text-sm` — editable hex value |
| Picker button | `Button` variant="ghost" size="icon" — opens native `<input type="color">` |

**Card Style radio:**
Use shadcn `RadioGroup` with `RadioGroupItem`:
- Labels: "Solid", "Glass", "Gradient"
- Display as horizontal radio buttons

**Live preview updates** immediately as user selects presets or changes colors. No debounce needed — it's local state until publish.

---

#### Section 5: Booking URL (kind:30078)

**Component:** `EditorBookingSection`
**shadcn/ui:** `Card`, `Input`, `Label`

| Field | Component | Placeholder |
|-------|-----------|-------------|
| Booking URL | `Input` type="url" | "https://cal.com/yourname" |
| Button Label | `Input` type="text" | "Book a Meeting" |

Simple two-field section. No special behavior.

---

### 4.4 Save & Publish Button

**Component:** `EditorPublishButton`
**shadcn/ui:** `Button`
**Position:** Bottom of form, sticky on mobile

| Property | Value |
|----------|-------|
| Width | `w-full` (mobile), `w-auto min-w-[200px]` (desktop) |
| Height | `h-12` |
| Background | `bg-violet-500 hover:bg-violet-600 text-white` |
| Label | "Save & Publish" |
| Icon | `Send` w-4 h-4 left of text |
| Loading state | `Loader2` icon with `animate-spin` replacing `Send`, text "Publishing..." |
| Disabled state | `opacity-50 cursor-not-allowed` when no changes |
| Shadow | `shadow-lg shadow-violet-500/25` |

**Behavior:**
1. Constructs kind:30078 event from form state
2. Signs via NIP-07/NIP-46/nsec signer
3. Publishes to user's write relays + discovery relays
4. Shows success toast: "Card published! 🎉"
5. Invalidates TanStack Query cache for the user's card data

**Mobile sticky behavior:** `sticky bottom-0 bg-white/80 dark:bg-[#0A0A0F]/80 backdrop-blur-xl border-t p-4`

### 4.5 Login Gate

If user arrives at `/edit` without auth:

```
┌──────────────────────────────────────┐
│                                      │
│         🔑                           │
│                                      │
│    Sign in to edit your card         │
│                                      │
│  ┌──────────────────────────────┐   │
│  │  Connect with Extension      │   │  ← NIP-07
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │  Connect with Bunker         │   │  ← NIP-46
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │  Paste nsec (advanced)       │   │  ← nsec
│  └──────────────────────────────┘   │
│                                      │
│  Don't have a Nostr key?            │
│  Learn more →                        │
│                                      │
└──────────────────────────────────────┘
```

Use existing `LoginDialog` component, rendered full-page instead of as a modal.

---

## 5. Landing Page

**Route:** `/`
**Auth:** None
**Purpose:** Convert visitors into card creators. Mobile-first, fast, compelling.

### 5.1 Layout Overview

```
┌──────────────────────────────────────────────────────────────────┐
│  HEADER                                                          │
│  key.card                        [Create Your Card]              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│                                                                  │
│    Your identity.                                                │
│    Your keys.                                                    │
│    Your card.                                                    │
│                                                                  │
│    The digital business card powered by Nostr.                   │
│    Free forever. Own your data. Accept Lightning tips.           │
│                                                                  │
│    [ Create Your Card Free → ]                                   │
│                                                                  │
│         ┌─────────────────────┐                                  │
│         │  [Demo card preview]│                                  │
│         │   with animation    │                                  │
│         └─────────────────────┘                                  │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│              HOW IT WORKS                                        │
│                                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│  │     1      │  │     2      │  │     3      │                │
│  │  Connect   │  │ Customize  │  │   Share    │                │
│  │   Nostr    │  │  Your Card │  │ Everywhere │                │
│  └────────────┘  └────────────┘  └────────────┘                │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│          WHY key.card?                                           │
│                                                                  │
│  ┌──────┐  Free Forever                                         │
│  │  $0  │  No monthly fees. No scan limits. No catch.           │
│  └──────┘                                                       │
│  ┌──────┐  Own Your Data                                        │
│  │  🔑  │  Your keys, your identity. Can't be deplatformed.     │
│  └──────┘                                                       │
│  ┌──────┐  Auto-Updating                                        │
│  │  ⚡  │  Change your Nostr profile → card updates instantly.  │
│  └──────┘                                                       │
│  ┌──────┐  Lightning Tips                                       │
│  │  💜  │  Accept Bitcoin payments right on your card.           │
│  └──────┘                                                       │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│        key.card vs. the competition                              │
│                                                                  │
│  Feature comparison table                                        │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│     Ready to own your identity?                                  │
│     [ Create Your Card Free → ]                                  │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│  FOOTER                                                          │
│  key.card · GitHub · Nostr                                       │
│  Built with 💜 on Nostr                                         │
└──────────────────────────────────────────────────────────────────┘
```

### 5.2 Header / Navigation

**Component:** `LandingHeader`
**shadcn/ui:** `Button`

| Property | Value |
|----------|-------|
| Position | `sticky top-0 z-50` |
| Background | `bg-white/80 dark:bg-[#0A0A0F]/80 backdrop-blur-xl` |
| Border | `border-b border-slate-200/50 dark:border-[#2D2D44]/50` |
| Height | `h-16` |
| Layout | `flex items-center justify-between max-w-5xl mx-auto px-4` |
| Logo | `text-lg font-bold` — "key.card" (text, not image) with `text-violet-500` on ".card" |
| CTA | `Button` size="sm" `bg-violet-500 text-white` — "Create Your Card" |

Logo rendering:
```tsx
<span className="text-lg font-bold">
  key<span className="text-violet-500">.card</span>
</span>
```

### 5.3 Hero Section

**Component:** `LandingHero`
**Position:** `pt-20 pb-16 px-4`

| Property | Mobile | Desktop (≥768px) |
|----------|--------|-----------------|
| Layout | Single column, centered | Two columns: text left, demo card right |
| Grid | — | `grid grid-cols-2 gap-12 items-center max-w-5xl mx-auto` |
| Headline | `text-4xl font-bold tracking-tight leading-tight` | `text-5xl` |
| Each headline line | Separate `<span className="block">` | Same |
| Accent word | "keys" gets `text-violet-500` | Same |
| Subheadline | `text-lg text-slate-500 mt-4 max-w-lg` | `text-xl` |
| CTA button | `h-12 px-8 rounded-xl bg-violet-500 hover:bg-violet-600 text-white text-base font-semibold shadow-lg shadow-violet-500/25 mt-6` | Same |
| Demo card | `mt-10` below CTA, `max-w-[320px] mx-auto` | Right column, natural position |

**Hero headline:**
```
Your identity.
Your keys.        ← "keys" in violet-500
Your card.
```

**Demo card:** A static rendering of a sample CardViewPage (use Derek's profile or a fictional "Alex Nakamoto") at `w-[320px]` scale, with a subtle `rotate-1 hover:rotate-0 transition-transform` tilt effect and `shadow-2xl`.

### 5.4 How It Works

**Component:** `LandingHowItWorks`
**Position:** `py-20 px-4 bg-slate-50 dark:bg-[#12121A]`

| Property | Value |
|----------|-------|
| Section title | `text-2xl font-bold text-center` — "How it works" |
| Subtitle | `text-slate-400 text-center mt-2` — "Three steps to your sovereign business card" |
| Cards container | `grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12` |

Each step card:

| Property | Value |
|----------|-------|
| Container | `rounded-2xl bg-white dark:bg-[#1A1A2E] p-6 text-center border border-slate-200 dark:border-[#2D2D44]` |
| Step number | `w-10 h-10 rounded-full bg-violet-500 text-white font-bold flex items-center justify-center mx-auto` |
| Title | `text-lg font-semibold mt-4` |
| Description | `text-sm text-slate-500 mt-2` |

**Steps:**

| # | Title | Description | Icon |
|---|-------|-------------|------|
| 1 | Connect Nostr | Sign in with your Nostr key. Your profile becomes your card instantly. | `Zap` w-6 h-6 |
| 2 | Customize | Add your phone, links, theme, and booking URL. Preview in real-time. | `Pencil` w-6 h-6 |
| 3 | Share | Get your QR code, add to Apple/Google Wallet, share anywhere. | `Share2` w-6 h-6 |

### 5.5 Features Grid

**Component:** `LandingFeatures`
**Position:** `py-20 px-4`

| Property | Value |
|----------|-------|
| Section title | `text-2xl font-bold text-center` — "Why key.card?" |
| Grid | `grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto mt-12` |

Each feature card:

| Property | Value |
|----------|-------|
| Container | `flex gap-4 p-4 rounded-xl` |
| Icon box | `w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0` |
| Icon | `w-5 h-5 text-violet-500` |
| Title | `text-sm font-semibold` |
| Description | `text-sm text-slate-500 mt-1` |

**Features:**

| Icon | Title | Description |
|------|-------|-------------|
| `DollarSign` → use `Zap` | Free Forever | No monthly fees. No scan limits. No upsells. Free as in freedom. |
| `Key` | Own Your Data | Your Nostr keys, your relays. Can never be deplatformed or deleted. |
| `RefreshCw` | Auto-Updating | Change your Nostr profile once — your card updates everywhere instantly. |
| `Zap` | Lightning Tips | Accept Bitcoin payments right on your card. No payment processor needed. |
| `QrCode` | QR + NFC Ready | Share via QR code, NFC tag, link, or wallet pass. Works with any NFC tag. |
| `Shield` | Censorship-Resistant | No company controls your card. It lives on Nostr relays — forever. |
| `Globe` | Open Source | MIT licensed. Self-host if you want. Audit the code. No vendor lock-in. |
| `Smartphone` | Works Everywhere | Mobile-first PWA. No app install needed for viewers. Offline-capable. |

### 5.6 Comparison Table

**Component:** `LandingComparison`
**Position:** `py-20 px-4 bg-slate-50 dark:bg-[#12121A]`

| Property | Value |
|----------|-------|
| Section title | `text-2xl font-bold text-center` — "key.card vs. the competition" |
| Table container | `max-w-3xl mx-auto mt-12 rounded-xl border border-slate-200 dark:border-[#2D2D44] overflow-hidden` |

**Mobile behavior:** Table scrolls horizontally. Use `overflow-x-auto` wrapper.

**Table structure:**

| Feature | Others | key.card |
|---------|--------|----------|

Use shadcn `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`.

| Feature | Others | key.card |
|---------|--------|----------|
| Monthly cost | $7–$35/mo | **Free forever** |
| Own your data | ❌ Their servers | **✅ Your Nostr keys** |
| Can be deplatformed | ❌ Yes | **✅ Never** |
| Auto-updating profile | ❌ Manual edits | **✅ Real-time from Nostr** |
| Native payments | ❌ None | **✅ Lightning zaps** |
| Open source | ❌ Proprietary | **✅ MIT licensed** |
| Vendor lock-in | 🔒 High | **🔓 Zero** |
| Custom NFC support | 💰 $14–$127/card | **✅ Any NFC tag** |

**Styling:**
- "Others" column: `text-slate-500`
- "key.card" column: `font-semibold text-violet-500` for positive values
- ❌ badges: `text-red-400`
- ✅ badges: `text-green-500`
- key.card column header: `bg-violet-500/10 text-violet-600 dark:text-violet-400 font-bold`

### 5.7 Final CTA

**Component:** `LandingCTA`
**Position:** `py-20 px-4 text-center`

| Element | Classes |
|---------|---------|
| Heading | `text-3xl font-bold` — "Ready to own your identity?" |
| Subheading | `text-lg text-slate-400 mt-3 max-w-md mx-auto` — "Create your Nostr-powered business card in under 60 seconds." |
| Button | Same style as hero CTA — `h-14 px-10 rounded-xl bg-violet-500 hover:bg-violet-600 text-white text-lg font-semibold shadow-lg shadow-violet-500/25 mt-8` |
| Button text | "Create Your Card Free →" |

### 5.8 Footer

**Component:** `LandingFooter`
**Position:** `py-8 px-4 border-t border-slate-200 dark:border-[#2D2D44]`

| Element | Classes |
|---------|---------|
| Container | `max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4` |
| Logo | Same as header — "key.card" |
| Links | `flex gap-4 text-sm text-slate-400` — "GitHub", "Nostr", "About" |
| Built with | `text-xs text-slate-400` — "Built with 💜 on Nostr" |

---

## 6. Animations & Transitions

### 6.1 Global Transitions

| Interaction | Animation | CSS/Tailwind |
|-------------|-----------|--------------|
| Page navigation | Fade in | `animate-in fade-in duration-200` (shadcn animation utils) |
| Button hover | Scale + color | `transition-all duration-150 hover:scale-[1.02]` |
| Card section hover | Subtle lift | `transition-transform duration-200 hover:-translate-y-0.5` |
| Link row hover | Background highlight | `transition-colors duration-150` |
| Focus ring | Violet outline | `focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2` |

### 6.2 Card View Animations

| Element | Animation | Timing |
|---------|-----------|--------|
| Banner | Fade in | `animate-in fade-in duration-500` |
| Avatar | Scale up + fade | `animate-in fade-in zoom-in-75 duration-300 delay-100` |
| Name/title | Slide up + fade | `animate-in fade-in slide-in-from-bottom-2 duration-300 delay-200` |
| Quick actions | Fade in sequentially | Each button: `animate-in fade-in duration-200 delay-[${i*50}ms]` |
| Section cards | Slide up + fade | `animate-in fade-in slide-in-from-bottom-4 duration-300 delay-[${i*100}ms]` |
| Sticky toolbar | Slide up from bottom | `animate-in slide-in-from-bottom duration-300 delay-500` |

Use CSS `@keyframes` or Tailwind's animation utilities. Keep total entrance animation under 800ms.

### 6.3 QR Overlay Animation

| Element | Animation |
|---------|-----------|
| Sheet backdrop | Fade in: `bg-black/50 animate-in fade-in duration-200` |
| Sheet content | Slide up: `animate-in slide-in-from-bottom duration-300 ease-out` |
| QR code render | Fade + scale: `animate-in fade-in zoom-in-95 duration-300 delay-200` |

### 6.4 Editor Animations

| Element | Animation |
|---------|-----------|
| Section expand/collapse | `Collapsible` with height animation: `data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up` |
| Theme preset select | Scale bounce: `transition-transform duration-150 active:scale-95` |
| Live preview update | No animation — instant update feels responsive |
| Publish button loading | `Loader2 animate-spin` |
| Success state | Brief scale: `animate-in zoom-in-95 duration-200` + confetti (optional, subtle) |

### 6.5 Landing Page Animations

| Element | Animation | Trigger |
|---------|-----------|---------|
| Hero text | Staggered slide up | On load: each line `delay-[${i*100}ms]` |
| Demo card | Float + tilt | CSS: `animate-float` custom keyframe (gentle up/down) |
| How It Works cards | Fade in on scroll | Intersection Observer: `animate-in fade-in slide-in-from-bottom-4 duration-500` |
| Feature cards | Fade in on scroll | Same pattern, staggered by grid position |
| Comparison table | Fade in on scroll | Single animation for whole table |

**Custom float animation:**
```css
@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(1deg); }
  50% { transform: translateY(-10px) rotate(-1deg); }
}
.animate-float {
  animation: float 6s ease-in-out infinite;
}
```

---

## 7. Component Inventory

### Complete list of components to build, with shadcn/ui dependencies:

#### Card View Components

| Component | File | shadcn/ui Used | Priority |
|-----------|------|---------------|----------|
| `CardViewPage` | `pages/CardViewPage.tsx` | — | P0 |
| `CardBanner` | `components/card/CardBanner.tsx` | `Skeleton` | P0 |
| `CardAvatar` | `components/card/CardAvatar.tsx` | `Avatar`, `AvatarImage`, `AvatarFallback` | P0 |
| `CardIdentity` | `components/card/CardIdentity.tsx` | `Tooltip` (for NIP-05 copy) | P0 |
| `CardQuickActions` | `components/card/CardQuickActions.tsx` | `Button` | P0 |
| `CardContactInfo` | `components/card/CardContactInfo.tsx` | `Separator` | P1 |
| `CardAbout` | `components/card/CardAbout.tsx` | `Button` (read more) | P1 |
| `CardLinks` | `components/card/CardLinks.tsx` | `Separator` | P0 |
| `CardBooking` | `components/card/CardBooking.tsx` | `Button` | P1 |
| `CardFooter` | `components/card/CardFooter.tsx` | — | P1 |
| `CardToolbar` | `components/card/CardToolbar.tsx` | `Button` | P0 |
| `CardThemeProvider` | `components/card/CardThemeProvider.tsx` | — | P0 |
| `CardSkeleton` | `components/card/CardSkeleton.tsx` | `Skeleton` | P0 |
| `CardNotFound` | `components/card/CardNotFound.tsx` | `Button` | P0 |

#### QR Components

| Component | File | shadcn/ui Used | Priority |
|-----------|------|---------------|----------|
| `QRCodeOverlay` | `components/qr/QRCodeOverlay.tsx` | `Sheet`, `Dialog` | P0 |
| `QRCodeRenderer` | `components/qr/QRCodeRenderer.tsx` | — | P0 |
| `WalletButtons` | `components/qr/WalletButtons.tsx` | `Button` | P2 |

#### Editor Components

| Component | File | shadcn/ui Used | Priority |
|-----------|------|---------------|----------|
| `CardEditorPage` | `pages/CardEditorPage.tsx` | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` | P1 |
| `EditorProfileSection` | `components/editor/EditorProfileSection.tsx` | `Card`, `Input`, `Textarea`, `Button` | P1 |
| `EditorExtendedSection` | `components/editor/EditorExtendedSection.tsx` | `Card`, `Input`, `Select`, `Alert`, `Label` | P1 |
| `EditorLinksSection` | `components/editor/EditorLinksSection.tsx` | `Card`, `Input`, `Select`, `Button` | P1 |
| `EditorThemeSection` | `components/editor/EditorThemeSection.tsx` | `Card`, `RadioGroup`, `RadioGroupItem`, `Input` | P1 |
| `EditorBookingSection` | `components/editor/EditorBookingSection.tsx` | `Card`, `Input`, `Label` | P1 |
| `EditorPublishButton` | `components/editor/EditorPublishButton.tsx` | `Button` | P1 |
| `LivePreview` | `components/editor/LivePreview.tsx` | — | P1 |
| `LoginGate` | `components/auth/LoginGate.tsx` | `Button` | P1 |

#### Landing Page Components

| Component | File | shadcn/ui Used | Priority |
|-----------|------|---------------|----------|
| `LandingPage` | `pages/LandingPage.tsx` | — | P0 |
| `LandingHeader` | `components/landing/LandingHeader.tsx` | `Button` | P0 |
| `LandingHero` | `components/landing/LandingHero.tsx` | `Button` | P0 |
| `LandingHowItWorks` | `components/landing/LandingHowItWorks.tsx` | — | P1 |
| `LandingFeatures` | `components/landing/LandingFeatures.tsx` | — | P1 |
| `LandingComparison` | `components/landing/LandingComparison.tsx` | `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` | P2 |
| `LandingCTA` | `components/landing/LandingCTA.tsx` | `Button` | P1 |
| `LandingFooter` | `components/landing/LandingFooter.tsx` | — | P1 |

#### Shared/Utility Components

| Component | File | shadcn/ui Used | Priority |
|-----------|------|---------------|----------|
| `VCardDownload` | `components/vcard/VCardDownload.tsx` | — (pure logic) | P0 |
| `ShareButton` | `components/shared/ShareButton.tsx` | `Button` | P0 |
| `CopyToClipboard` | `components/shared/CopyToClipboard.tsx` | `Tooltip` | P0 |

### shadcn/ui Components Required

Ensure these are installed via `npx shadcn-ui add`:

```
avatar
button
card
dialog
input
label
radio-group
select
separator
sheet
skeleton
table
tabs
textarea
tooltip
alert
collapsible
```

Most of these are likely already in the MKStack base. Run `npx shadcn-ui add <component>` for any missing ones.

---

## Appendix: Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Max-width 480px for card view | Mobile-first: cards ARE mobile content. On desktop, a narrow card with shadow looks premium. Matches phone screen width. |
| Sheet (bottom) for QR on mobile, Dialog on desktop | Native feel: bottom sheets are the standard mobile pattern for overlays. Desktop users expect centered dialogs. |
| Read-only kind:0 in editor | key.card should NOT become a Nostr profile editor. Editing kind:0 has blast radius (affects all clients). Link to existing editors instead. |
| Privacy warning for phone/address | Nostr relays are public. Users from traditional card platforms (QRCodeChimp) may not realize their phone number is being broadcast to the world. |
| Zap button uses amber/gold, not purple | Visual distinction from primary actions. Gold = money/Lightning is a strong convention in the Bitcoin ecosystem. |
| No custom fonts | Faster page load. System fonts look native on every platform. Key.card pages should load in <1s. |
| Glass card style option | Modern aesthetic that works with both dark and light backgrounds. Gives a premium feel without heavy assets. |
| Sticky toolbar instead of inline buttons | The #1 action is "Save to Contacts" (from UX research). It must ALWAYS be visible, even after scrolling. Sticky bar ensures this. |

---

*This spec is the single source of truth for key.card's visual design. Frontend engineers should reference this document alongside ARCHITECTURE.md and NOSTR-DESIGN.md for implementation.*
