# NOSTR-DESIGN.md — key.card Protocol Design

> **Author:** Centauri (Architect)  
> **Date:** 2026-03-17  
> **Status:** Complete — ready for implementation

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Core Profile Data — kind:0 (NIP-01)](#2-core-profile-data--kind0-nip-01)
3. [Extended Card Data — kind:30078 (NIP-78)](#3-extended-card-data--kind30078-nip-78)
4. [External Identities — kind:10011 (NIP-39)](#4-external-identities--kind10011-nip-39)
5. [Relay Strategy — NIP-65](#5-relay-strategy--nip-65)
6. [QR Code Content](#6-qr-code-content)
7. [Auth Flow — NIP-07 / NIP-46](#7-auth-flow--nip-07--nip-46)
8. [Read Path](#8-read-path)
9. [Write Path](#9-write-path)
10. [Edge Cases & Migration](#10-edge-cases--migration)

---

## 1. Architecture Overview

key.card uses a layered data model. A card is rendered from **up to four** Nostr events, all keyed to the same pubkey:

| Layer | Kind | NIP | Purpose | Required? |
|-------|------|-----|---------|-----------|
| Profile | `0` | NIP-01 | Name, avatar, bio, website, lightning, NIP-05 | **Yes** |
| Card Config | `30078` | NIP-78 | Phone, address, links, theme, booking URL | No |
| External IDs | `10011` | NIP-39 | Twitter, GitHub, Telegram, etc. | No |
| Relay List | `10002` | NIP-65 | User's preferred relays (for outbox routing) | No |

**Design principle:** A card MUST be renderable from kind:0 alone. Every other layer is progressive enhancement. If a user has never used key.card but has a Nostr profile, they already have a card.

---

## 2. Core Profile Data — kind:0 (NIP-01)

### Event Structure

```json
{
  "kind": 0,
  "pubkey": "<hex-pubkey>",
  "content": "{\"name\":\"derek\",\"display_name\":\"Derek Ross\",\"about\":\"Nostr Evangelist 💜\",\"picture\":\"https://image.nostr.build/abc.jpg\",\"banner\":\"https://image.nostr.build/banner.jpg\",\"website\":\"https://derekross.me\",\"lud16\":\"derek@getalby.com\",\"nip05\":\"derek@nostrplebs.com\"}",
  "tags": [],
  "created_at": 1710000000,
  "id": "<event-id>",
  "sig": "<sig>"
}
```

### Field → Card Section Mapping

| kind:0 Field | Card Section | Rendering |
|---|---|---|
| `display_name` | **Hero name** (large, prominent) | Primary display. Falls back to `name` |
| `name` | **Username / handle** | Shown as `@name` below display_name |
| `picture` | **Avatar** | Circular image, center or left of card |
| `banner` | **Card header background** | Full-width behind avatar (overridden by kind:30078 `banner` if set) |
| `about` | **Bio section** | Markdown-rendered paragraph |
| `website` | **Website link** | Clickable link with globe icon |
| `lud16` | **Zap / Lightning button** | "⚡ Zap" button; used to construct LNURL for tipping |
| `nip05` | **Verified identity badge** | Shown as ✅ `user@domain.com`; also used for card URL routing |

### Notes

- `display_name` takes priority over `name` for the hero. If neither exists, show truncated npub.
- `lud16` is the Lightning Address (e.g., `derek@getalby.com`). The Zap button resolves this via `/.well-known/lnurlp/<name>` to get a payment callback.
- `nip05` serves double duty: identity verification AND URL routing (see [Read Path](#8-read-path)).
- `banner` from kind:0 is the default background. kind:30078 can override it.

---

## 3. Extended Card Data — kind:30078 (NIP-78)

This is the heart of key.card's custom data. NIP-78 defines kind `30078` as an **addressable event** (replaceable per `d` tag) for arbitrary app data. We use it to store everything that kind:0 doesn't cover.

### Event Structure

```json
{
  "kind": 30078,
  "pubkey": "<hex-pubkey>",
  "content": "<JSON string — see schema below>",
  "tags": [
    ["d", "key.card/profile"]
  ],
  "created_at": 1710000000,
  "id": "<event-id>",
  "sig": "<sig>"
}
```

**`d` tag value:** `key.card/profile`

This is the addressable identifier. Using a namespaced `d` tag (`key.card/profile`) prevents collision with other apps that also use kind:30078. Per NIP-78, the `d` tag should contain "some reference to the app name and context."

### Content Schema (v1)

The `content` field is a JSON string with the following structure:

```json
{
  "v": 1,
  "phone": [
    { "type": "mobile", "number": "+1-555-123-4567", "label": "Mobile" },
    { "type": "work",   "number": "+1-555-987-6543", "label": "Office" },
    { "type": "fax",    "number": "+1-555-000-0000", "label": "Fax" }
  ],
  "address": {
    "street": "123 Freedom Lane",
    "city": "Huntingdon",
    "state": "PA",
    "zip": "16652",
    "country": "US"
  },
  "company": "Soapbox Technology",
  "title": "Developer Relations",
  "links": [
    {
      "label": "GitHub",
      "url": "https://github.com/derekross",
      "icon": "github"
    },
    {
      "label": "YouTube",
      "url": "https://youtube.com/@derekross",
      "icon": "youtube"
    },
    {
      "label": "Podcast",
      "url": "https://soapboxsessions.com",
      "icon": "podcast"
    }
  ],
  "booking": {
    "url": "https://cal.com/derekross",
    "label": "Book a Meeting"
  },
  "theme": {
    "mode": "dark",
    "background": "#1a1a2e",
    "accent": "#9333ea",
    "cardStyle": "glass"
  },
  "banner": "https://blossom.example.com/abc123.jpg"
}
```

### Field Definitions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `v` | `number` | **Yes** | Schema version. Always `1` for initial release. |
| `phone` | `Array<Phone>` | No | Phone numbers with type and label |
| `phone[].type` | `string` | Yes | One of: `mobile`, `work`, `home`, `fax`, `other` |
| `phone[].number` | `string` | Yes | E.164 format preferred (e.g., `+15551234567`) |
| `phone[].label` | `string` | No | Display label (defaults to capitalized `type`) |
| `address` | `Address` | No | Physical address |
| `address.street` | `string` | No | Street address |
| `address.city` | `string` | No | City |
| `address.state` | `string` | No | State/province |
| `address.zip` | `string` | No | Postal code |
| `address.country` | `string` | No | ISO 3166-1 alpha-2 country code |
| `company` | `string` | No | Organization / company name |
| `title` | `string` | No | Job title / role |
| `links` | `Array<Link>` | No | Custom links (social, portfolio, etc.) |
| `links[].label` | `string` | Yes | Display text |
| `links[].url` | `string` | Yes | Full URL |
| `links[].icon` | `string` | No | Icon identifier (see icon set below) |
| `booking` | `Booking` | No | Scheduling / calendar link |
| `booking.url` | `string` | Yes | Calendar URL |
| `booking.label` | `string` | No | Button text (default: "Book a Meeting") |
| `theme` | `Theme` | No | Card appearance customization |
| `theme.mode` | `string` | No | `"light"` or `"dark"` (default: `"dark"`) |
| `theme.background` | `string` | No | CSS color value for card background |
| `theme.accent` | `string` | No | CSS color value for buttons/links |
| `theme.cardStyle` | `string` | No | One of: `"solid"`, `"glass"`, `"gradient"` (default: `"solid"`) |
| `banner` | `string` | No | URL to custom banner image (overrides kind:0 banner) |

### Icon Set

The `icon` field in links uses a predefined set of identifiers that map to Lucide icons (already in the stack via shadcn/ui):

| Icon ID | Lucide Icon | Use Case |
|---------|-------------|----------|
| `github` | `Github` | GitHub profile |
| `twitter` | `Twitter` | X/Twitter |
| `youtube` | `Youtube` | YouTube channel |
| `linkedin` | `Linkedin` | LinkedIn profile |
| `globe` | `Globe` | Generic website |
| `podcast` | `Podcast` | Podcast link |
| `mail` | `Mail` | Email |
| `calendar` | `Calendar` | Calendar/booking |
| `file` | `FileText` | Resume/CV |
| `link` | `Link` | Generic link |
| `nostr` | `Zap` | Nostr-related link |
| `bitcoin` | `Bitcoin` | Bitcoin-related |

Unknown icon values fall back to `Link` (generic).

### TypeScript Interface

```typescript
interface KeyCardConfig {
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

interface PhoneEntry {
  type: 'mobile' | 'work' | 'home' | 'fax' | 'other';
  number: string;
  label?: string;
}

interface Address {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

interface LinkEntry {
  label: string;
  url: string;
  icon?: string;
}

interface BookingConfig {
  url: string;
  label?: string;
}

interface ThemeConfig {
  mode?: 'light' | 'dark';
  background?: string;
  accent?: string;
  cardStyle?: 'solid' | 'glass' | 'gradient';
}
```

### Why kind:30078 and not a custom kind?

1. **NIP-78 is designed for this** — arbitrary app-specific data storage on relays.
2. **No NIP registration needed** — we don't need to propose a new NIP for a custom kind.
3. **Relay compatibility** — all relays already support kind:30078.
4. **Addressable** — the `d` tag makes it replaceable (write a new one → overwrites the old).
5. **Namespaced** — `d: "key.card/profile"` avoids collisions with other apps.

---

## 4. External Identities — kind:10011 (NIP-39)

NIP-39 defines a standard way for users to prove they control accounts on other platforms. key.card displays these as verified social links.

### Event Structure

```json
{
  "kind": 10011,
  "pubkey": "<hex-pubkey>",
  "content": "",
  "tags": [
    ["i", "github:derekross", "abc123def456"],
    ["i", "twitter:deaboross", "1619358434134196225"],
    ["i", "mastodon:nostr.social/@derek", "109775066355589974"],
    ["i", "telegram:123456789", "nostrchat/42"]
  ],
  "created_at": 1710000000,
  "id": "<event-id>",
  "sig": "<sig>"
}
```

### Card Rendering

Each `i` tag is rendered as a verified social link:

- Parse `platform:identity` from tag value
- Show platform icon + identity name
- Display a ✅ checkmark if proof is verifiable
- Link to the profile URL:
  - `github:user` → `https://github.com/user`
  - `twitter:user` → `https://twitter.com/user`
  - `mastodon:instance/@user` → `https://instance/@user`
  - `telegram:id` → (display only, no direct link)

### Proof Verification (Optional Enhancement)

For v1, key.card displays NIP-39 identities **without verifying proofs** (show them, but skip the Gist/tweet fetching). Add a subtle "unverified" indicator. Proof verification can be added in v2 as a background check.

**Rationale:** Verification requires cross-origin requests to GitHub/Twitter APIs which may be rate-limited or CORS-blocked. The data is still useful as self-declared identities.

### Relationship to kind:30078 links

NIP-39 identities and kind:30078 `links` may overlap (e.g., both could reference a GitHub profile). The rendering priority:

1. **NIP-39 identities** — shown in a "Verified Accounts" section with proof indicators
2. **kind:30078 links** — shown in a "Links" section as custom buttons

If both reference the same platform, show the NIP-39 version (it has proof) and hide the duplicate from links.

---

## 5. Relay Strategy — NIP-65

### Discovery Relays (Hardcoded Fallback)

When we don't know the user's relay preferences, query these well-known relays:

```typescript
const DISCOVERY_RELAYS = [
  'wss://relay.ditto.pub',
  'wss://relay.primal.net',
  'wss://relay.damus.io',
  'wss://purplepag.es',      // NIP-65 relay list aggregator
  'wss://relay.nostr.band',  // Search/index relay
];
```

### Outbox Model (NIP-65)

The read path follows the outbox model:

1. **First**, fetch the user's kind:10002 (relay list) from discovery relays
2. **Then**, fetch kind:0, kind:30078, kind:10011 from the user's **write relays** (because that's where they publish)
3. **Fallback**: If no kind:10002 exists, use discovery relays for everything

```
  ┌─────────────┐
  │  key.card    │
  │  client      │
  └──────┬───────┘
         │
         ▼
  ┌──────────────────┐
  │ Discovery Relays  │  ← Fetch kind:10002 (relay list)
  │ (purplepag.es,    │
  │  relay.damus.io)  │
  └──────┬───────────┘
         │ Got relay list?
         ▼
  ┌──────────────────┐
  │ User's Write      │  ← Fetch kind:0, kind:30078, kind:10011
  │ Relays (from      │
  │ kind:10002)       │
  └───────────────────┘
```

### Write Relays

When a logged-in user saves their card config:

1. Publish to the user's **write relays** (from their kind:10002)
2. Also publish to discovery relays (for discoverability)
3. If no kind:10002 exists, publish to all discovery relays

### NPool Configuration (Nostrify)

The existing `NostrProvider.tsx` already implements relay routing via `NPool`. For card viewing, we extend the `reqRouter` to support outbox-model lookups:

```typescript
// When viewing someone else's card, route to THEIR write relays
reqRouter(filters: NostrFilter[]) {
  // If we have the target user's relay list, route there
  if (targetUserRelays) {
    return new Map(targetUserRelays.write.map(url => [url, filters]));
  }
  // Otherwise, use discovery relays
  return new Map(DISCOVERY_RELAYS.map(url => [url, filters]));
}
```

---

## 6. QR Code Content

### Recommendation: `nostr:nprofile1...` with relay hints

The QR code should encode an `nprofile` bech32 string (NIP-19) wrapped in a `nostr:` URI:

```
nostr:nprofile1qqsrhuxx8l9ex335q7he0f09aej04zpazpl0ne2cgukyawd24mayt8gpp4mhxue69uhhytnc9e3k7mgpz4mhxue69uhkg6nzv9ejuumpv34k2u3wvdhk6tcpz9mhxue69uhkummnw3ezuamfdejj7qg4waehxw309aex2mrp0yhxgctdw4eju6t09uq3kamnwvaz7tmjv4kxz7fwdehhxarj9e3xzmny9uqsuamnwvaz7tmwdaejumr0dshsz9mhwden5te0wfjkccte9ejxzmt4wvhxjmcpzamhxue69uhhyetvv9ujuurjd9kkzmpwdejhgqgdwaehxw309ahx7uewd3hkcqg5waehxw309aex2mrp0yhxummnw3ezucnpdejz7qpqy2ws0ya5s0hd7uy4hd7vuarfwxqc7qf3mp7auhx00x6krry7s08qm0
```

### Why nprofile over npub or URL?

| Option | Pros | Cons |
|--------|------|------|
| `npub1...` | Simple, short | No relay hints → client must guess where to find data |
| `nostr:nprofile1...` | **Includes relay hints** → any Nostr client can resolve | Longer QR code |
| `https://key.card/npub1...` | Works in any browser | Centralized dependency on key.card domain |

**Decision: `nostr:nprofile1...`**

- Any Nostr-aware app (Damus, Primal, Amethyst, etc.) can open it directly
- Relay hints ensure the profile is findable even if the user's relays are obscure
- The `nostr:` URI scheme is standardized (NIP-21)
- key.card can register as a handler for `nostr:` URIs on the web

### nprofile Construction

```typescript
import { nip19 } from 'nostr-tools';

const nprofile = nip19.nprofileEncode({
  pubkey: hexPubkey,
  relays: userWriteRelays.slice(0, 3), // Include top 3 write relays as hints
});

const qrContent = `nostr:${nprofile}`;
```

### Fallback: Web URL Below QR

Below the QR code, display a clickable URL for non-Nostr users:

```
https://key.card/<npub1...>
   — or —
https://key.card/<nip05-identifier>
```

This gives the card two access paths: native Nostr (QR) and web fallback (URL).

---

## 7. Auth Flow — NIP-07 / NIP-46

### Login Methods

key.card supports login via the Nostrify `NostrLoginProvider` already in the codebase. The stack supports:

1. **NIP-07 (Browser Extension)** — `window.nostr` (Alby, nos2x, Nostr Connect)
2. **NIP-46 (Nostr Connect / Bunker)** — Remote signing via relay
3. **nsec (Direct Key)** — Paste private key (⚠️ discouraged but supported)

### Auth Flow Diagram

```
  ┌────────────┐
  │   User      │
  │   visits    │
  │  key.card   │
  └──────┬──────┘
         │
         ▼
  ┌──────────────┐     ┌─────────────────┐
  │  "Edit Card" │────▶│  Login Dialog    │
  │  button      │     │                  │
  └──────────────┘     │  ┌─────────────┐ │
                       │  │ NIP-07 (ext)│ │ ← window.nostr.getPublicKey()
                       │  ├─────────────┤ │
                       │  │ NIP-46      │ │ ← bunker://... or npub + relay
                       │  ├─────────────┤ │
                       │  │ nsec paste  │ │ ← Direct key (⚠️ warning shown)
                       │  └─────────────┘ │
                       └────────┬─────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  Get pubkey      │
                       │  (hex)           │
                       └────────┬─────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  Store login     │
                       │  method in       │
                       │  localStorage    │
                       │  (nostr:login)   │
                       └────────┬─────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  Fetch user's    │
                       │  kind:0 + 30078  │
                       │  → populate      │
                       │  edit form       │
                       └────────┬─────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  User edits      │
                       │  card fields     │
                       └────────┬─────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  Sign & publish  │ ← window.nostr.signEvent()
                       │  kind:30078      │    or NIP-46 remote sign
                       │  to relays       │
                       └──────────────────┘
```

### Signing Events

The existing `useNostrPublish` hook handles signing via Nostrify's signer abstraction. The flow:

1. User fills out the card editor form
2. App constructs an unsigned kind:30078 event
3. Signer (NIP-07 extension or NIP-46 bunker) signs it
4. App publishes to relays via `NPool`

**Important:** key.card NEVER handles private keys directly (except the nsec fallback). All signing goes through the Nostrify signer interface.

---

## 8. Read Path

### Route: `/:nip19` (already exists in `AppRouter.tsx`)

The `NIP19Page` component handles routing. For key.card, we care about `npub` and `nprofile` types.

### Read Flow by npub

```
URL: https://key.card/npub1abc...

1. Decode npub → hex pubkey
2. Query DISCOVERY_RELAYS for kind:10002 (relay list)
3. If found → extract write relays
4. Query write relays (or discovery fallback) for:
   - kind:0     (profile metadata)
   - kind:30078 (d="key.card/profile")
   - kind:10011 (external identities)
   All in ONE batched filter request
5. Merge data → render card
```

### Read Flow by NIP-05

```
URL: https://key.card/derek@nostrplebs.com

1. Parse NIP-05: name=derek, domain=nostrplebs.com
2. Fetch https://nostrplebs.com/.well-known/nostr.json?name=derek
3. Response: { "names": { "derek": "<hex-pubkey>" }, "relays": { "<hex>": ["wss://..."] } }
4. Extract hex pubkey (and optional relay hints)
5. Continue with same flow as npub (step 2 above)
```

### Batched Filter Request

Fetch all card data in a single REQ:

```typescript
const filters: NostrFilter[] = [
  { kinds: [0], authors: [pubkey], limit: 1 },
  { kinds: [30078], authors: [pubkey], '#d': ['key.card/profile'], limit: 1 },
  { kinds: [10011], authors: [pubkey], limit: 1 },
];

const events = await nostr.query(filters, { signal: AbortSignal.timeout(5000) });
```

This sends one REQ with three filters — most relays handle this efficiently.

### React Query Keys

```typescript
// Profile
['nostr', 'card', pubkey, 'profile']     // kind:0
['nostr', 'card', pubkey, 'config']       // kind:30078
['nostr', 'card', pubkey, 'identities']   // kind:10011
['nostr', 'card', pubkey, 'relays']       // kind:10002
```

### Rendering Priority

```
┌─────────────────────────────────────────────┐
│  BANNER (kind:30078 banner || kind:0 banner)│
│                                             │
│         ┌──────────┐                        │
│         │  AVATAR  │  (kind:0 picture)      │
│         └──────────┘                        │
│                                             │
│     Derek Ross            ← display_name    │
│     @derek                ← name            │
│     ✅ derek@nostrplebs   ← nip05           │
│     Developer Relations   ← kind:30078 title│
│     at Soapbox Technology ← kind:30078 co.  │
│                                             │
│     💜 Nostr Evangelist   ← about           │
│                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │ ⚡ Zap    │ │ 🌐 Web   │ │ 📅 Book  │    │
│  └──────────┘ └──────────┘ └──────────┘    │
│                                             │
│  📱 +1-555-123-4567 (Mobile)               │
│  🏢 +1-555-987-6543 (Office)               │
│                                             │
│  📍 Huntingdon, PA, US                      │
│                                             │
│  ── Verified Accounts ──                    │
│  ✅ GitHub: derekross                       │
│  ✅ Twitter: deaboross                      │
│                                             │
│  ── Links ──                                │
│  🔗 YouTube  🔗 Podcast  🔗 Resume          │
│                                             │
│  ┌─────────┐                                │
│  │ QR Code │  nostr:nprofile1...            │
│  └─────────┘                                │
│                                             │
│  Powered by key.card — Nostr-native cards   │
└─────────────────────────────────────────────┘
```

---

## 9. Write Path

### What Gets Written

| Action | Event Kind | When |
|--------|-----------|------|
| Edit profile basics (name, bio, avatar) | kind:0 | User saves profile section |
| Edit card extras (phone, links, theme) | kind:30078 | User saves card config section |
| Link external account | kind:10011 | User adds a verified identity |

### kind:0 Write (Profile Update)

**⚠️ CRITICAL:** kind:0 is a **replaceable event**. The entire profile must be republished — you cannot update a single field. Always:

1. Fetch current kind:0
2. Parse existing content JSON
3. Merge user's changes
4. Republish the full event

```typescript
async function updateProfile(changes: Partial<NostrMetadata>) {
  // Fetch existing
  const [existing] = await nostr.query([{ kinds: [0], authors: [pubkey], limit: 1 }]);
  const current = existing ? JSON.parse(existing.content) : {};

  // Merge
  const updated = { ...current, ...changes };

  // Publish
  const event = {
    kind: 0,
    content: JSON.stringify(updated),
    tags: [],
    created_at: Math.floor(Date.now() / 1000),
  };

  await signer.signEvent(event);
  await nostr.event(event);
}
```

### kind:30078 Write (Card Config)

Same pattern but with the `d` tag:

```typescript
async function updateCardConfig(config: Partial<KeyCardConfig>) {
  // Fetch existing
  const [existing] = await nostr.query([
    { kinds: [30078], authors: [pubkey], '#d': ['key.card/profile'], limit: 1 }
  ]);
  const current: KeyCardConfig = existing
    ? JSON.parse(existing.content)
    : { v: 1 };

  // Deep merge (preserve arrays unless explicitly replaced)
  const updated: KeyCardConfig = {
    ...current,
    ...config,
    v: 1, // Always ensure version
  };

  // Publish
  const event = {
    kind: 30078,
    content: JSON.stringify(updated),
    tags: [['d', 'key.card/profile']],
    created_at: Math.floor(Date.now() / 1000),
  };

  await signer.signEvent(event);
  await nostr.event(event);
}
```

### kind:10011 Write (External Identity)

kind:10011 is a **replaceable event** (10000–19999 range). The entire tag set must be republished:

```typescript
async function updateIdentities(identities: Array<{ platform: string; identity: string; proof: string }>) {
  const event = {
    kind: 10011,
    content: '',
    tags: identities.map(({ platform, identity, proof }) => [
      'i', `${platform}:${identity}`, proof
    ]),
    created_at: Math.floor(Date.now() / 1000),
  };

  await signer.signEvent(event);
  await nostr.event(event);
}
```

### Optimistic Updates

Use React Query's `setQueryData` for instant UI feedback:

```typescript
const queryClient = useQueryClient();

// Before publishing
queryClient.setQueryData(
  ['nostr', 'card', pubkey, 'config'],
  optimisticEvent
);

// Publish, then invalidate on success/failure
await nostr.event(signedEvent);
queryClient.invalidateQueries({ queryKey: ['nostr', 'card', pubkey] });
```

---

## 10. Edge Cases & Migration

### Edge Cases

| Case | Handling |
|------|----------|
| **No kind:0 exists** | Show minimal card with npub only. Prompt "Claim this card" login flow. |
| **No kind:30078 exists** | Card renders from kind:0 alone (design principle: progressive enhancement). |
| **kind:30078 with unknown `v`** | If `v > 1`, attempt best-effort parse. Unknown fields are ignored. |
| **kind:30078 from wrong app** | Only load events with `d = "key.card/profile"`. Ignore others. |
| **Multiple kind:0 from different relays** | Use the one with the highest `created_at` (most recent wins). |
| **NIP-05 lookup fails** | Show error "Could not resolve NIP-05 identity" with retry button. |
| **NIP-05 domain is down** | Cache last-known pubkey mapping in localStorage for offline resilience. |
| **User has no write relays** | Publish to all discovery relays. Show a "Set up your relays" prompt. |
| **Relay timeout** | 5-second timeout per relay. Show partial card from whatever data arrived. |
| **XSS in profile fields** | All user content is rendered through React (auto-escaped). URLs are validated before `href`. |
| **Oversized kind:0 content** | Truncate `about` at 500 chars with "Read more" expansion. |
| **Banner image fails to load** | Fall back to solid color from theme, or default gradient. |

### Schema Migration (Future v2)

The `v` field in kind:30078 content enables forward-compatible schema evolution:

```typescript
function parseCardConfig(content: string): KeyCardConfig {
  const raw = JSON.parse(content);

  switch (raw.v) {
    case 1:
      return raw as KeyCardConfig;
    case 2:
      return migrateV2toV1(raw); // Future: downgrade for v1 clients
    default:
      // Unknown version — best-effort parse of known fields
      return { v: 1, ...pick(raw, KNOWN_V1_FIELDS) };
  }
}
```

### Potential Future Additions (v2+)

- **vCard export** — Generate `.vcf` download from card data
- **NIP-94 file metadata** — For banner/avatar images stored on Blossom
- **Card analytics** — kind:30078 with `d: "key.card/analytics"` (view count, saved by)
- **Multi-card support** — Different `d` tags: `key.card/personal`, `key.card/work`
- **Encrypted fields** — NIP-44 encryption for phone/address (private to contacts only)
- **Card templates** — Predefined theme collections stored as kind:30078 with `d: "key.card/template/<name>"`

### Privacy Considerations

⚠️ **All data in kind:0 and kind:30078 is PUBLIC on relays.** Users must understand:

- Phone numbers published to relays are visible to anyone
- Physical addresses are public
- The edit UI should have clear warnings: "This information will be publicly visible"
- Future enhancement: NIP-44 encrypted fields visible only to contacts (requires NIP-04/44 key exchange)

---

## Summary: Events Consumed & Produced

### Read (for any card)
```
REQ: [
  { kinds: [0],     authors: [pubkey], limit: 1 },
  { kinds: [30078], authors: [pubkey], #d: ["key.card/profile"], limit: 1 },
  { kinds: [10011], authors: [pubkey], limit: 1 },
  { kinds: [10002], authors: [pubkey], limit: 1 }
]
```

### Write (authenticated user)
```
kind:0      → Full profile replacement (merge existing + changes)
kind:30078  → Full card config replacement (d="key.card/profile")
kind:10011  → Full identity list replacement
```

### NIPs Referenced

| NIP | Usage |
|-----|-------|
| NIP-01 | kind:0 profile metadata, basic protocol |
| NIP-05 | NIP-05 identifier verification + URL routing |
| NIP-07 | Browser extension signing (`window.nostr`) |
| NIP-19 | bech32 encoding (npub, nprofile for QR codes) |
| NIP-21 | `nostr:` URI scheme for QR content |
| NIP-39 | External identity claims (kind:10011) |
| NIP-46 | Nostr Connect / remote signing (bunker) |
| NIP-57 | Lightning Zaps (for the Zap button) |
| NIP-65 | Relay list metadata (kind:10002, outbox model) |
| NIP-78 | Arbitrary app data (kind:30078, card config) |
| NIP-96 | File storage (for image uploads via Blossom) |

---

*This document is the single source of truth for key.card's Nostr protocol design. All implementation decisions should reference this spec.*
