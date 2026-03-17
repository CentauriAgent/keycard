# key.card — System Architecture

> Nostr-native digital business cards. FOSS alternative to QRCodeChimp.
> Built on MKStack: React 18 + Vite + TypeScript + Tailwind + shadcn/ui + Nostrify + TanStack Query

---

## 1. Route Map

| Route | Component | Auth Required | Description |
|---|---|---|---|
| `/` | `LandingPage` | No | Marketing landing + NIP-05/npub search box |
| `/:identifier` | `CardViewPage` | No | Public card view (npub1…, NIP-05, or nprofile1…) |
| `/edit` | `CardEditorPage` | **Yes** (NIP-07/nsec/bunker) | Edit your own card appearance & fields |
| `/qr` | `QRGeneratorPage` | No (uses query params) | Standalone QR code generator + download |
| `/preview` | `CardPreviewPage` | Yes | Live preview of card before sharing |

### Route Resolution for `/:identifier`

The existing `NIP19Page` handles `npub1…` and `nprofile1…`. We extend it to also resolve NIP-05 identifiers:

```
/:identifier
  ├─ starts with "npub1" or "nprofile1" → decode via nip19, fetch kind:0
  ├─ contains "@" or looks like NIP-05  → resolve via /.well-known/nostr.json, then fetch kind:0
  └─ else → NotFound
```

**Rationale:** A single dynamic route keeps URLs clean (`key.card/npub1abc…` or `key.card/derek@nostrplebs.com`). No need for `/card/` prefix — the identifier format is unambiguous.

---

## 2. Component Tree

```
<App>                                    # (exists) — providers + router
├── <UnheadProvider>                     # (exists) — SEO meta
├── <AppProvider>                        # (exists) — app config context
├── <QueryClientProvider>                # (exists) — TanStack Query
├── <NostrLoginProvider>                 # (exists) — login state
├── <NostrProvider>                      # (exists) — NPool relay pool
├── <NostrSync>                          # (exists) — relay sync
│
└── <AppRouter>                          # (exists, modified) — routes
    │
    ├── / → <LandingPage>               # NEW
    │   ├── <HeroSection>               # Headline, description, CTA
    │   ├── <IdentifierSearch>          # npub/NIP-05 input → navigate to /:id
    │   ├── <FeatureGrid>               # Feature cards (QR, Wallet, vCard, etc.)
    │   └── <Footer>                    # Links, GitHub, "Powered by Nostr"
    │
    ├── /:identifier → <CardViewPage>   # NEW (replaces NIP19Page logic for profiles)
    │   ├── <CardHeader>                # Banner image, avatar, name, NIP-05 badge
    │   ├── <CardBody>                  # About, website, LN address, lud16
    │   ├── <CardActions>               # Action buttons row
    │   │   ├── <QRCodeModal>           # Show QR code in dialog
    │   │   ├── <VCardDownload>         # Download .vcf button
    │   │   ├── <WalletPassButton>      # "Add to Apple/Google Wallet"
    │   │   └── <ShareButton>           # Web Share API / copy link
    │   ├── <CardSocial>               # Social links (GitHub, Twitter, website)
    │   └── <ZapButton>                 # (exists) — Zap the card owner
    │
    ├── /edit → <CardEditorPage>        # NEW (authenticated)
    │   ├── <LoginGate>                 # Redirects to login if not authed
    │   ├── <ProfileForm>               # Edit name, about, picture, banner, NIP-05
    │   │   ├── <AvatarUpload>          # Upload/crop avatar (via useUploadFile)
    │   │   ├── <BannerUpload>          # Upload/crop banner
    │   │   └── <SocialLinksEditor>     # Add/remove social links
    │   ├── <CardThemePicker>           # Choose card color scheme / layout
    │   ├── <LivePreview>               # Real-time card preview (uses CardViewPage components)
    │   └── <PublishButton>             # Sign & publish kind:0 event
    │
    ├── /qr → <QRGeneratorPage>         # NEW
    │   ├── <QRInput>                   # npub/NIP-05/URL input
    │   ├── <QRStyleOptions>            # Color, logo, dot shape, error correction
    │   ├── <QRPreview>                 # Live QR canvas
    │   └── <QRDownload>               # Download PNG/SVG buttons
    │
    └── * → <NotFound>                  # (exists)
```

### Shared / Utility Components

```
components/
├── card/
│   ├── CardHeader.tsx          # Avatar, banner, name display
│   ├── CardBody.tsx            # Bio, details, links
│   ├── CardActions.tsx         # Action button row
│   ├── CardSocial.tsx          # Social link icons
│   └── CardThemeProvider.tsx   # Theme context for card styling
├── qr/
│   ├── QRCodeRenderer.tsx      # Core QR generation (wraps `qrcode` library)
│   ├── QRStyleOptions.tsx      # UI for customizing QR appearance
│   └── QRCodeModal.tsx         # Dialog wrapper for inline QR display
├── wallet/
│   ├── WalletPassButton.tsx    # Unified Apple/Google Wallet button
│   └── WalletPassDialog.tsx    # Options dialog (choose wallet type)
├── vcard/
│   └── VCardDownload.tsx       # Generate & download .vcf file
├── auth/
│   ├── LoginGate.tsx           # Route guard — redirect if not logged in
│   ├── LoginDialog.tsx         # (exists) — login modal
│   └── AccountSwitcher.tsx     # (exists) — switch accounts
├── layout/
│   ├── Header.tsx              # App header/nav bar
│   ├── Footer.tsx              # App footer
│   └── PageContainer.tsx       # Consistent page wrapper
└── ui/                         # (exists) — shadcn/ui primitives
```

---

## 3. Folder Structure (full `src/` layout)

```
src/
├── main.tsx                    # (exists) — entry point
├── App.tsx                     # (exists) — provider tree
├── AppRouter.tsx               # (exists, modified) — route definitions
├── index.css                   # (exists) — Tailwind + custom styles
├── vite-env.d.ts               # (exists)
│
├── pages/
│   ├── LandingPage.tsx         # NEW — / route
│   ├── CardViewPage.tsx        # NEW — /:identifier route
│   ├── CardEditorPage.tsx      # NEW — /edit route
│   ├── QRGeneratorPage.tsx     # NEW — /qr route
│   ├── CardPreviewPage.tsx     # NEW — /preview route
│   └── NotFound.tsx            # (exists)
│
├── components/
│   ├── card/                   # Card display components
│   ├── qr/                     # QR code components
│   ├── wallet/                 # Wallet pass components
│   ├── vcard/                  # vCard generation
│   ├── auth/                   # Auth components (exists, extended)
│   ├── layout/                 # Layout components
│   ├── ui/                     # (exists) — shadcn primitives
│   ├── NostrProvider.tsx       # (exists)
│   ├── NostrSync.tsx           # (exists)
│   ├── AppProvider.tsx         # (exists)
│   ├── ErrorBoundary.tsx       # (exists)
│   ├── ZapButton.tsx           # (exists)
│   └── ZapDialog.tsx           # (exists)
│
├── hooks/
│   ├── useAuthor.ts            # (exists) — fetch kind:0 by pubkey
│   ├── useCurrentUser.ts       # (exists) — current logged-in user
│   ├── useNostr.ts             # (exists) — Nostr context
│   ├── useNostrPublish.ts      # (exists) — publish events
│   ├── useUploadFile.ts        # (exists) — file upload
│   ├── useResolveIdentifier.ts # NEW — resolve npub/NIP-05 → pubkey
│   ├── useCardTheme.ts         # NEW — card theme preferences
│   ├── useGenerateQR.ts        # NEW — QR code generation logic
│   ├── useGenerateVCard.ts     # NEW — vCard string builder
│   ├── useWalletPass.ts        # NEW — wallet pass API calls
│   └── ... (existing hooks)
│
├── lib/
│   ├── utils.ts                # (exists) — cn() helper
│   ├── polyfills.ts            # (exists) — Buffer polyfill
│   ├── nip05.ts                # NEW — NIP-05 resolution
│   ├── vcard.ts                # NEW — vCard 3.0 generation
│   ├── qrcode.ts               # NEW — QR code generation utilities
│   ├── walletPass.ts           # NEW — wallet pass API client
│   ├── cardThemes.ts           # NEW — theme definitions
│   └── nostrProfile.ts         # NEW — profile data extraction helpers
│
├── contexts/
│   ├── AppContext.ts            # (exists)
│   └── CardThemeContext.ts      # NEW — card theming context
│
└── test/
    ├── setup.ts                 # (exists)
    └── TestApp.tsx              # (exists)
```

---

## 4. State Management

### TanStack Query + Nostrify Pattern (existing, extended)

The existing codebase already establishes the pattern. We follow it consistently:

```typescript
// All Nostr data flows through TanStack Query with ['nostr', ...] key prefix
// This ensures cache invalidation when relay config changes (see NostrProvider.tsx)

Query Keys:
  ['nostr', 'author', pubkey]          // kind:0 metadata (exists via useAuthor)
  ['nostr', 'nip05', identifier]       // NIP-05 resolution → pubkey
  ['nostr', 'relays', pubkey]          // kind:10002 relay list
  ['nostr', 'contacts', pubkey]        // kind:3 contact list (for social proof)
```

### Key Data Flows

```
1. Card View (/:identifier)
   URL param → useResolveIdentifier() → pubkey
                                        ↓
                                   useAuthor(pubkey) → NostrMetadata
                                        ↓
                                   Render CardHeader + CardBody + CardActions

2. Card Editor (/edit)
   useCurrentUser() → user.pubkey → useAuthor(pubkey) → existing metadata
                                                         ↓
                                                    ProfileForm (pre-filled)
                                                         ↓
                                                    useNostrPublish() → sign & publish kind:0

3. QR Generator (/qr)
   Input (npub/URL/NIP-05) → useGenerateQR(data, options) → canvas/SVG
                                                              ↓
                                                         Download PNG/SVG
```

### What Gets Cached vs. Fetched Fresh

| Data | Cache Strategy | Rationale |
|---|---|---|
| kind:0 metadata | 5 min staleTime (existing) | Profiles rarely change |
| NIP-05 resolution | 10 min staleTime | DNS-level caching already applies |
| QR code generation | No cache (client-side computation) | Instant, no network |
| Wallet pass | No cache (server-side, one-shot) | Generated on demand |

---

## 5. Apple Wallet (PKPass) Architecture

### Decision: **Vercel Serverless Function** (not Cloudflare Worker)

**Rationale:**
- The app deploys to Vercel — one platform, one deploy pipeline
- Vercel functions support Node.js natively, which PKPass libraries need
- `passkit-generator` npm package works in Node.js serverless
- Cloudflare Workers use V8 isolates (no Node.js `crypto` module) — PKPass signing would require complex workarounds
- Vercel's 10-second function timeout is plenty for pass generation

### PKPass Structure

```
keycard.pass/
├── pass.json           # Pass metadata (generated per-request)
├── icon.png            # key.card logo (32x32)
├── icon@2x.png         # key.card logo (64x64)
├── logo.png            # Card header logo
├── logo@2x.png         # Card header logo @2x
├── strip.png           # Banner/header image (from profile)
├── thumbnail.png       # Avatar (from profile)
└── [signature, manifest — auto-generated by passkit-generator]
```

### pass.json Template

```json
{
  "formatVersion": 1,
  "passTypeIdentifier": "pass.card.key.contact",
  "teamIdentifier": "<APPLE_TEAM_ID>",
  "organizationName": "key.card",
  "description": "Nostr Contact Card",
  "serialNumber": "<npub-hex>",
  "foregroundColor": "rgb(255, 255, 255)",
  "backgroundColor": "rgb(88, 50, 168)",
  "labelColor": "rgb(200, 180, 240)",
  "generic": {
    "primaryFields": [
      { "key": "name", "label": "NAME", "value": "<display_name>" }
    ],
    "secondaryFields": [
      { "key": "title", "label": "TITLE", "value": "<job_title_or_nip05>" },
      { "key": "org", "label": "ORG", "value": "<organization>" }
    ],
    "auxiliaryFields": [
      { "key": "nip05", "label": "NOSTR", "value": "<nip05_address>" },
      { "key": "website", "label": "WEB", "value": "<website>" }
    ],
    "backFields": [
      { "key": "npub", "label": "Nostr Public Key", "value": "<npub1...>" },
      { "key": "lud16", "label": "Lightning Address", "value": "<lud16>" },
      { "key": "about", "label": "About", "value": "<about_text>" },
      { "key": "profile_url", "label": "Profile", "value": "https://key.card/<npub>" }
    ]
  },
  "barcode": {
    "format": "PKBarcodeFormatQR",
    "message": "https://key.card/<npub>",
    "messageEncoding": "iso-8859-1"
  },
  "barcodes": [
    {
      "format": "PKBarcodeFormatQR",
      "message": "https://key.card/<npub>",
      "messageEncoding": "iso-8859-1"
    }
  ]
}
```

### What Goes in the Pass vs. Fetched Dynamically

| In the Pass (Static) | NOT in the Pass (Dynamic) |
|---|---|
| Display name | Full bio/about (too long) |
| NIP-05 address | Follower count |
| Job title / organization | Recent posts |
| Website URL | Relay list |
| Lightning address | Social graph |
| QR code (→ key.card URL) | Avatar (embedded as thumbnail) |
| npub (back of card) | Banner (embedded as strip image) |

### API Endpoint

```
POST /api/wallet/apple
Body: { pubkey: string }  // hex pubkey
Response: application/vnd.apple.pkpass (binary)
```

The function:
1. Receives pubkey
2. Fetches kind:0 from relays (server-side, using `@nostrify/nostrify`)
3. Downloads avatar + banner images
4. Generates PKPass with `passkit-generator`
5. Returns signed `.pkpass` file

---

## 6. Google Wallet (JWT Pass) Architecture

### Decision: **Vercel Serverless Function** (server-side)

**Rationale:**
- Google Wallet requires JWT signing with a service account private key
- Private keys must never be exposed client-side
- Same deployment platform as Apple Wallet — consistency
- Google Wallet API uses REST, works fine in serverless

### Pass Object Structure (Generic Pass)

```json
{
  "iss": "<service-account-email>",
  "aud": "google",
  "typ": "savetowallet",
  "iat": <timestamp>,
  "origins": ["https://key.card"],
  "payload": {
    "genericObjects": [{
      "id": "<issuer-id>.npub-<hex-pubkey>",
      "classId": "<issuer-id>.keycard-contact",
      "genericType": "GENERIC_TYPE_UNSPECIFIED",
      "hexBackgroundColor": "#5832a8",
      "logo": {
        "sourceUri": { "uri": "https://key.card/logo.png" }
      },
      "cardTitle": {
        "defaultValue": { "language": "en", "value": "key.card" }
      },
      "header": {
        "defaultValue": { "language": "en", "value": "<display_name>" }
      },
      "subheader": {
        "defaultValue": { "language": "en", "value": "<nip05_or_title>" }
      },
      "textModulesData": [
        { "id": "website", "header": "Website", "body": "<website>" },
        { "id": "lightning", "header": "Lightning", "body": "<lud16>" },
        { "id": "npub", "header": "Nostr", "body": "<npub1...>" }
      ],
      "barcode": {
        "type": "QR_CODE",
        "value": "https://key.card/<npub>"
      },
      "heroImage": {
        "sourceUri": { "uri": "<banner_url>" }
      }
    }]
  }
}
```

### API Endpoint

```
POST /api/wallet/google
Body: { pubkey: string }
Response: { saveUrl: string }  // "https://pay.google.com/gp/v/save/..." JWT URL
```

The function:
1. Receives pubkey
2. Fetches kind:0 from relays
3. Builds pass object JSON
4. Signs JWT with service account key
5. Returns Google Wallet "Save" URL (client redirects/opens)

---

## 7. QR Code System

### Library: `qrcode` (already in package.json)

### Architecture

```typescript
// lib/qrcode.ts — Pure utility functions

interface QROptions {
  data: string;              // URL, npub, or arbitrary text
  size: number;              // Canvas size in px (default: 512)
  foreground: string;        // Dot color (default: "#000000")
  background: string;        // Background color (default: "#FFFFFF")
  errorCorrection: 'L' | 'M' | 'Q' | 'H';  // Default: 'H' for logo overlay
  logoUrl?: string;          // Center logo image URL
  logoSizeRatio?: number;    // Logo size as % of QR (default: 0.25)
  dotStyle?: 'square' | 'rounded' | 'dots';  // Dot shape
  margin: number;            // Quiet zone modules (default: 2)
}

// Generate QR as data URL (PNG)
generateQRDataUrl(options: QROptions): Promise<string>

// Generate QR as SVG string
generateQRSvg(options: QROptions): Promise<string>

// Generate QR to canvas element (for custom rendering)
generateQRCanvas(canvas: HTMLCanvasElement, options: QROptions): Promise<void>
```

### Custom Styling Approach

1. **Base QR**: Generated with `qrcode` library at high error correction (`H`)
2. **Color customization**: Applied via `qrcode` color options
3. **Logo embedding**: Drawn on canvas after QR generation — center overlay with white padding
4. **Dot shapes**: Post-process canvas — replace square modules with rounded rects or circles
5. **Nostr purple theme**: Default preset with `#8B5CF6` foreground on white

### Download Flow

```
QRPreview (canvas) → "Download PNG" → canvas.toBlob() → saveAs()
                   → "Download SVG" → generateQRSvg() → Blob → saveAs()
```

### Preset Themes

```typescript
const QR_PRESETS = {
  nostrPurple: { foreground: '#8B5CF6', background: '#FFFFFF' },
  nostrDark:   { foreground: '#FFFFFF', background: '#1a1a2e' },
  bitcoin:     { foreground: '#F7931A', background: '#FFFFFF' },
  minimal:     { foreground: '#000000', background: '#FFFFFF' },
  custom:      null, // user picks colors
};
```

---

## 8. vCard 3.0 Generation

### Decision: **Client-side only** — no server needed

**Rationale:** vCard is a simple text format. All data comes from kind:0 metadata already fetched via TanStack Query. Zero reason to involve a server.

### Implementation

```typescript
// lib/vcard.ts

interface VCardData {
  displayName: string;
  nip05?: string;
  website?: string;
  lud16?: string;       // Lightning address → stored as X-LIGHTNING
  about?: string;
  picture?: string;     // Avatar URL
  npub: string;
  pubkeyHex: string;
}

function generateVCard(data: VCardData): string {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${escapeVCard(data.displayName)}`,
    `N:${escapeVCard(data.displayName)};;;;`,
  ];

  if (data.nip05)   lines.push(`EMAIL;TYPE=INTERNET:${data.nip05}`);
  if (data.website)  lines.push(`URL:${data.website}`);
  if (data.picture)  lines.push(`PHOTO;VALUE=URI:${data.picture}`);
  if (data.about)    lines.push(`NOTE:${escapeVCard(data.about)}`);
  if (data.lud16)    lines.push(`X-LIGHTNING:${data.lud16}`);

  // Nostr-specific fields
  lines.push(`X-NOSTR-NPUB:${data.npub}`);
  lines.push(`X-NOSTR-PUBKEY:${data.pubkeyHex}`);
  lines.push(`URL;TYPE=nostr:https://key.card/${data.npub}`);

  lines.push('END:VCARD');
  return lines.join('\r\n');
}
```

### Download Trigger

```typescript
// hooks/useGenerateVCard.ts
function downloadVCard(metadata: NostrMetadata, npub: string) {
  const vcf = generateVCard({ ...metadata, npub });
  const blob = new Blob([vcf], { type: 'text/vcard' });
  const url = URL.createObjectURL(blob);
  // Trigger download as "<name>.vcf"
  const a = document.createElement('a');
  a.href = url;
  a.download = `${metadata.display_name || metadata.name || 'contact'}.vcf`;
  a.click();
  URL.revokeObjectURL(url);
}
```

---

## 9. PWA Setup

### manifest.json

```json
{
  "name": "key.card — Nostr Contact Cards",
  "short_name": "key.card",
  "description": "Create and share Nostr-native digital business cards",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a1a2e",
  "theme_color": "#8B5CF6",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "categories": ["social", "productivity"],
  "shortcuts": [
    {
      "name": "Edit My Card",
      "url": "/edit",
      "icons": [{ "src": "/icons/edit-96.png", "sizes": "96x96" }]
    },
    {
      "name": "QR Generator",
      "url": "/qr",
      "icons": [{ "src": "/icons/qr-96.png", "sizes": "96x96" }]
    }
  ]
}
```

### Service Worker Strategy

**Approach: Network-first with offline card cache**

- **HTML pages**: Network-first, fall back to cache (stale card views work offline)
- **Static assets** (JS/CSS/images): Cache-first (Vite hashes filenames)
- **Nostr relay data**: Not cached by SW (TanStack Query handles caching in memory/IDB)
- **Avatar/banner images**: Cache-first with expiry (profile images rarely change)

**Implementation:** Use `vite-plugin-pwa` with Workbox for zero-config service worker generation.

```typescript
// vite.config.ts addition
import { VitePWA } from 'vite-plugin-pwa';

plugins: [
  VitePWA({
    registerType: 'autoUpdate',
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/.*\.(jpg|jpeg|png|gif|webp)$/,
          handler: 'CacheFirst',
          options: { cacheName: 'images', expiration: { maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 } }
        }
      ]
    }
  })
]
```

---

## 10. Deployment

### Platform: Vercel

### Configuration (`vercel.json`)

```json
{
  "rewrites": [
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ],
  "functions": {
    "api/wallet/apple.ts": { "maxDuration": 10 },
    "api/wallet/google.ts": { "maxDuration": 10 }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store" }
      ]
    }
  ]
}
```

### Serverless Functions (`/api/`)

```
api/
├── wallet/
│   ├── apple.ts        # POST — generate & return .pkpass binary
│   └── google.ts       # POST — generate & return Google Wallet save URL
└── og/
    └── [identifier].ts # GET — dynamic OG image for social sharing (optional, Phase 2)
```

### Environment Variables

| Variable | Where | Purpose |
|---|---|---|
| `APPLE_PASS_TYPE_ID` | Vercel env | Apple pass type identifier (e.g., `pass.card.key.contact`) |
| `APPLE_TEAM_ID` | Vercel env | Apple Developer Team ID |
| `APPLE_PASS_CERT` | Vercel env (base64) | Apple pass signing certificate (.p12), base64-encoded |
| `APPLE_PASS_CERT_PASSWORD` | Vercel env | Password for the .p12 certificate |
| `APPLE_WWDR_CERT` | Vercel env (base64) | Apple WWDR intermediate certificate, base64-encoded |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Vercel env | Google service account credentials JSON |
| `GOOGLE_WALLET_ISSUER_ID` | Vercel env | Google Wallet issuer ID |
| `VITE_APP_URL` | Vercel env | Public app URL (e.g., `https://key.card`) |
| `VITE_DEFAULT_RELAYS` | Vercel env (optional) | Comma-separated relay URLs for server-side fetches |

**Note:** `VITE_`-prefixed vars are exposed to the client bundle. All wallet signing credentials are server-only (no `VITE_` prefix).

---

## 11. Key Technical Decisions

### D1: Vercel Functions over Cloudflare Workers for Wallet Passes
- **Decision:** Vercel serverless functions
- **Rationale:** Same platform as frontend deployment. Node.js runtime needed for `passkit-generator`. CF Workers use V8 isolates without full Node.js APIs. One deploy = one `git push`.

### D2: Client-side vCard, Server-side Wallet Passes
- **Decision:** vCard generated entirely in browser; wallet passes require server
- **Rationale:** vCard is plaintext — no signing needed. PKPass requires Apple certificate signing. Google Wallet requires JWT signing with private key. Never expose signing keys to the client.

### D3: NIP-05 Resolution in `/:identifier` Route
- **Decision:** Single route handles both npub and NIP-05 identifiers
- **Rationale:** Clean URLs. `key.card/derek@nostrplebs.com` is human-readable and shareable. The `useResolveIdentifier` hook detects the format and resolves accordingly.

### D4: `qrcode` Library with Canvas Post-Processing
- **Decision:** Use existing `qrcode` package with canvas overlay for logos/styling
- **Rationale:** Already in package.json. Lightweight (~30KB). High error correction (`H`) allows 30% of QR to be covered by logo. Custom dot shapes via canvas post-processing avoid needing a heavier library.

### D5: TanStack Query for All Nostr Data
- **Decision:** No additional state management (no Redux, no Zustand)
- **Rationale:** MKStack pattern already established. `useAuthor` hook demonstrates the pattern. Server state (relay data) belongs in TanStack Query. UI state is minimal (theme picker selection, form inputs) — React state + context suffices.

### D6: Card Theming via kind:0 Metadata Extensions
- **Decision:** Store card theme preferences in kind:0 `content` JSON alongside standard profile fields
- **Rationale:** Uses existing Nostr infrastructure. No custom event kinds needed for v1. Theme data is small (colors, layout choice). Falls back gracefully — clients that don't understand theme fields just ignore them.
- **Fields:** `keycard_theme`, `keycard_accent_color`, `keycard_layout` in kind:0 content JSON

### D7: PWA with Network-First Strategy
- **Decision:** PWA with `vite-plugin-pwa`, network-first for pages
- **Rationale:** Cards should show latest data when online, but still work offline if cached. Static assets are cache-first (Vite content hashing). Relay data caching handled by TanStack Query, not service worker.

### D8: No Custom Backend / Database
- **Decision:** Serverless functions only — no persistent backend
- **Rationale:** All user data lives on Nostr relays. Wallet pass generation is stateless (fetch profile → generate pass → return). No user accounts, no database, no sessions. True Nostr-native architecture.

---

## 12. Data Flow Diagram

```
                    ┌──────────────────────┐
                    │   Nostr Relays        │
                    │ (ditto, primal, damus)│
                    └──────────┬───────────┘
                               │
                    kind:0 metadata fetch
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
    ┌─────────────┐  ┌──────────────┐  ┌──────────────┐
    │ Card View   │  │ Card Editor  │  │ Wallet Pass  │
    │ (client)    │  │ (client)     │  │ API (server) │
    │             │  │              │  │              │
    │ useAuthor() │  │ useAuthor()  │  │ nostr.query()│
    │ → render    │  │ → form       │  │ → generate   │
    │ → QR code   │  │ → publish    │  │ → sign       │
    │ → vCard     │  │   kind:0     │  │ → return     │
    └─────────────┘  └──────────────┘  └──────────────┘
         │                                    │
         │                              ┌─────┴─────┐
         ▼                              ▼           ▼
    ┌──────────┐               ┌──────────┐  ┌──────────┐
    │ QR PNG/  │               │ .pkpass  │  │ Google   │
    │ SVG      │               │ (Apple)  │  │ Save URL │
    │ download │               └──────────┘  └──────────┘
    └──────────┘
```

---

## 13. Existing Code to Keep vs. Replace

| File | Action | Notes |
|---|---|---|
| `App.tsx` | **Keep** | Provider tree is perfect as-is |
| `AppRouter.tsx` | **Modify** | Add new routes, keep structure |
| `NostrProvider.tsx` | **Keep** | NPool setup works |
| `NostrSync.tsx` | **Keep** | Relay sync logic |
| `AppProvider.tsx` | **Keep** | Config context |
| `useAuthor.ts` | **Keep** | Core hook for profile fetching |
| `useCurrentUser.ts` | **Keep** | Auth state |
| `useNostrPublish.ts` | **Keep** | Publishing events |
| `useUploadFile.ts` | **Keep** | For avatar/banner upload in editor |
| `ZapButton.tsx` | **Keep** | Used on card view |
| `ZapDialog.tsx` | **Keep** | Zap dialog |
| `LoginDialog.tsx` | **Keep** | Auth flow |
| `NIP19Page.tsx` | **Replace** | Becomes `CardViewPage.tsx` with full card UI |
| `Index.tsx` | **Replace** | Becomes `LandingPage.tsx` |
| `Messages.tsx` | **Remove** | DM feature not needed for key.card |
| `DMProvider.tsx` | **Remove** | DM feature not needed |
| `dm/` components | **Remove** | DM feature not needed |
| `comments/` | **Remove** | Not needed for v1 |
| `WalletModal.tsx` | **Remove** | NWC wallet — not related to Apple/Google Wallet |
| `NWCContext.tsx` | **Keep** (optional) | Only if we want NWC zapping on cards |

---

## 14. Implementation Priority

### Phase 1: Core Card (MVP)
1. `CardViewPage` + card components (header, body, actions)
2. `useResolveIdentifier` hook (npub + NIP-05)
3. `LandingPage` with search
4. QR code generation (basic)
5. vCard download
6. Updated `AppRouter`

### Phase 2: Editor + Polish
7. `CardEditorPage` + `LoginGate`
8. Card theming system
9. QR style customization
10. PWA setup

### Phase 3: Wallet Passes
11. Apple Wallet serverless function
12. Google Wallet serverless function
13. `WalletPassButton` component

### Phase 4: Growth
14. OG image generation (dynamic social previews)
15. Analytics (privacy-respecting, e.g., Plausible)
16. Custom domains per user (CNAME → key.card)

---

*Architecture designed for key.card v1.0 — March 2026*
*Stack: React 18 + Vite + TypeScript + Tailwind + shadcn/ui + Nostrify + TanStack Query + Vercel*
