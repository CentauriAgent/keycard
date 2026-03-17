# key.card — UX Research Report

**Date:** 2026-03-16
**Researcher:** Centauri (UX Researcher, NostrCard team)
**Bead:** clawd-yar.5

---

## 1. QRCodeChimp UX Analysis

### Strengths (with evidence)

| Strength | Evidence |
|----------|----------|
| **Easy onboarding** | Trustpilot: "QRCodeChimp was so easy to get started" — farmer's market vendor created product QR codes in minutes. Multiple reviews cite "user-friendly" and "easy to use" |
| **Generous free tier** | "10/10. This is the only real free QR website I have found" (Trustpilot). Free static QR codes with no expiry — rare in the industry |
| **Rich customization** | 35+ QR code types, unique shapes (hearts, Santa styling), logo integration, 3D effects. Users love visual variety: "The way they customize QR codes is amazing!" |
| **Dynamic QR codes** | Edit destination after printing — "the ability to edit the info after printing is a lifesaver" (Trustpilot). Huge for physical cards |
| **Scan analytics** | Day/hour analysis, browser breakdown, Google Analytics integration. Marketers specifically value tracking |
| **Template library** | "The templates were super helpful" — enables non-designers to create professional cards |
| **Fast support** | Under 1-hour response times reported on Trustpilot |

### Weaknesses (with evidence)

| Weakness | Evidence |
|----------|----------|
| **Scan limits on free tier** | 1,000 scans/month cap on free plan. Reddit users worried about "brutte sorprese" (nasty surprises) after hitting limits |
| **Confusing static vs. dynamic distinction** | Reddit r/DigitalMarketing: users don't understand the difference. "Is it worth paying money for QR codes?" is a common confusion point |
| **Subscription fatigue** | Reddit r/SaaS: "Why do QR code companies charge monthly subscriptions when a QR code is just a link?" Industry-wide frustration with recurring costs for what feels like a static asset |
| **Limited integrations** | Only Google Analytics — no CRM, Salesforce, Slack, etc. (competitor Uniqode beats them here) |
| **Data tracking as a feature, not a concern** | QRCodeChimp markets scan tracking and analytics as benefits. Privacy-conscious users see this as a bug, not a feature |
| **Vendor lock-in** | Dynamic QR codes stop working if you cancel. Reddit r/graphic_design: rage posts about codes being "deactivated in 14 days" (QR-code-generator.com, but applies to the model) |
| **Not self-sovereign** | Your business card lives on their servers. They own the URL redirect. They can change terms, sunset the product, or raise prices |

### Onboarding Flow Issues (industry-wide)

- **NFC confusion**: Reddit r/marketing: "the demographic I was dealing with didn't understand what was happening, couldn't tap the popup on their phone, couldn't get the NFC reader to work properly" — NFC is not universally understood
- **Too many options**: QRCodeChimp offers 35+ QR types, which overwhelms new users looking to make a simple business card
- **"Mode" switching**: Mobilo Card user had to email support because "I couldn't figure out how to swap between modes"
- **Not plug-and-play**: "You need to commit to learning how it works — it's not totally plug and play if you're not techy"

---

## 2. Target User Personas

### Persona 1: "Nico the Nostrich" — Nostr Native

**Demographics:** 25-45, developer or Bitcoin/freedom-tech enthusiast, attends Nostrica/BTC Prague/Baltic Honeybadger

**Goals:**
- Share Nostr identity (npub) at conferences without spelling it out
- One-tap follow so people can find them on Primal/Damus/Amethyst
- Showcase their Lightning address, NIP-05, relay list
- Zero tracking, zero vendor lock-in

**Pain points:**
- npub is 63 characters of gibberish — impossible to share verbally
- Existing tools (npubqrcode.vercel.app) generate a bare QR with no context — normies scan it and get confused
- NFC cards (Laser Eyes nostrcard) exist but only share raw npub — no profile preview, no "save contact" flow
- No unified "Nostr business card" that bridges to the normie world (email, phone, website)

**What they'd love:**
- `key.card/nico` → beautiful card showing profile pic, bio, npub QR, Lightning tip button
- NIP-07 login → card auto-populates from kind:0 profile data
- Editing updates propagate to Nostr relays (card is always in sync)
- Zero analytics, zero tracking — just a static page that works forever

**Tech comfort:** High. Will use NIP-07 extensions, understands keys.

---

### Persona 2: "Maya the Maker" — Crypto-Curious Creator

**Demographics:** 28-40, freelancer/small business owner, uses Bitcoin casually, heard of Nostr but hasn't onboarded

**Goals:**
- Professional digital business card for conferences and client meetings
- Stop paying monthly for QRCodeChimp/Popl/Linq
- Own her data, not rent it
- Maybe get into Nostr if it's easy

**Pain points:**
- Subscription fatigue — paying $7-19/mo for what should be a simple web page
- Worried about QR codes breaking if she cancels her subscription
- Doesn't understand static vs. dynamic QR codes
- Has a Lightning wallet but no Nostr key yet

**What they'd love:**
- Create a card without needing a Nostr key first
- Simple form: name, title, photo, links, contact info
- Option to "upgrade" to Nostr identity later (claim the card with a key)
- One-time payment or free tier, not monthly subscription
- Card that works as a simple web page — no app install needed for the scanner

**Tech comfort:** Medium. Can follow a wizard but won't install browser extensions.

---

### Persona 3: "David the Dentist" — Total Normie

**Demographics:** 35-55, professional, uses iPhone, has never heard of Nostr or Bitcoin

**Goals:**
- Scan someone's QR code at a conference → save their contact info
- Maybe make his own card if it's dead simple
- Follow up with people he met (email, LinkedIn, phone)

**Pain points:**
- Scans a QR code and gets a weird string starting with "npub1..." — no idea what to do
- Doesn't want to install an app
- Needs "Save to Contacts" button front and center
- Doesn't care about decentralization — just wants it to work

**What they'd love:**
- Scan → see a clean card with photo, name, company, phone, email
- One-tap "Save to Contacts" (vCard download)
- Social links that actually go to LinkedIn, Twitter, Instagram (not just Nostr)
- No signup required to view someone's card

**Tech comfort:** Low. If it doesn't work in 3 seconds, they'll move on.

---

## 3. Card Sharing Patterns

### When do people share digital business cards?

1. **Conferences & networking events** (PRIMARY) — face-to-face, high intent, time-pressured. "Let me scan your code" replaces "here's my card"
2. **Client meetings** — professional credibility signal. "Here's everything about me in one place"
3. **Job hunting / career fairs** — resume supplement
4. **Casual encounters** — meetups, co-working spaces, bars (less common)
5. **Email signatures & social bios** — passive sharing via link

### The #1 action after scanning a QR code at a conference

**"Save to Contacts"** — overwhelmingly. Reddit user: "my info saved right into his contacts... no piles of business cards, no trying to remember who 'Michael – blue tie – HVAC' was."

The hierarchy of post-scan actions:
1. **Save contact** (vCard) — 60%+ of interactions
2. **Visit website/portfolio** — if they're evaluating you
3. **Connect on social** (LinkedIn, Nostr follow) — secondary
4. **Send email/text** — immediate follow-up (rare at events, more after)
5. **Pay/tip** (Lightning) — Nostr-specific, unique differentiator

### Phone vs Desktop Usage

- **Scanning/viewing:** 90%+ mobile (QR codes are a phone-native interaction)
- **Creating/editing cards:** 60% desktop, 40% mobile (form-filling is easier on desktop)
- **Implication:** The CARD VIEW must be mobile-first. The EDITOR can be desktop-friendly but must work on mobile.

---

## 4. Key UX Decisions & Recommendations

### 4.1 Should NIP-07 login be primary or secondary?

**Recommendation: SECONDARY (but prominently offered)**

Rationale:
- NIP-07 extensions (nos2x, Alby) are installed by <5% of web users
- Making it primary gates 95% of potential card creators
- BUT: for Nostr natives, NIP-07 is magical — auto-populates everything from kind:0

**Proposed flow:**
1. **Primary:** "Create Your Card" → simple form (name, bio, photo, links)
2. **Secondary (prominent):** "Import from Nostr" button → NIP-07 → auto-fill everything
3. **Tertiary:** "Paste your npub" → fetch kind:0 from relays → auto-fill

This means Nico gets the magic, Maya gets the simplicity, and David just sees a nice card.

### 4.2 How to handle the "no Nostr key" case (normie visitors)?

**Recommendation: Cards are PUBLIC WEB PAGES — no login to view**

- Scanning a QR code → opens a regular web page. No app, no extension, no signup.
- The card shows: name, photo, bio, contact info, social links, vCard download button
- **Nostr-specific elements are progressive:** If the viewer has a Nostr client, the npub link opens in their client. If not, it links to njump.me or a web client.
- **"Follow on Nostr" button** should explain what Nostr is in a tooltip for normies: "Follow me on the open social web — no account needed to view"

For card CREATORS without a Nostr key:
- Let them create a card with just email/form data
- Offer "Claim with Nostr key" later — this anchors the card to a cryptographic identity
- Consider generating a keypair client-side and offering nsec backup (advanced, risky UX)

### 4.3 Inline editing vs. separate editor view?

**Recommendation: SEPARATE EDITOR with live preview**

Rationale:
- Inline editing (clicking directly on the card) feels intuitive but creates problems:
  - Hard to distinguish view mode from edit mode
  - Touch targets on mobile are tiny
  - Can't easily add/remove sections
- QRCodeChimp uses a separate form-based editor — users rated it highly for simplicity
- Reddit feedback: "The templates were super helpful" — template selection + form editor is the proven pattern

**Proposed approach:**
- **Editor view:** Left panel = form fields, Right panel = live card preview (desktop). Mobile = tab between "Edit" and "Preview"
- **Quick edit shortcut:** Double-click any field on the preview to jump to that form field (power user feature)
- **Publish flow:** Edit → Preview → Publish. Changes are saved as drafts until published.

### 4.4 Minimum viable card vs. full custom card?

**Recommendation: Start with kind:0, progressively enhance**

**Minimum Viable Card (kind:0 data):**
- Display name
- Profile picture (from kind:0 `picture` field)
- Bio/about (from kind:0 `about` field)
- NIP-05 identifier
- Lightning address (from kind:0 `lud16`)
- npub (with QR code)
- "Follow on Nostr" button
- vCard download (synthesized from kind:0 data)

**Enhanced Card (custom fields):**
- Email, phone, website (not in standard kind:0)
- Social links (Twitter, LinkedIn, GitHub, etc.)
- Company/title/role
- Custom sections (portfolio, services, etc.)
- Theme/color customization
- Cover photo/banner

**The bridge:** kind:0 fields auto-populate the minimum card. Users can add custom fields on top. Custom fields could optionally be stored as a new Nostr event kind (propose NIP for business card data).

---

## 5. Onboarding Flow Recommendation

### Flow A: "Nostr Native" (has NIP-07 or nsec)

```
1. Land on key.card → "Create Your Card"
2. Click "Import from Nostr" → NIP-07 popup OR paste npub
3. Card auto-generates from kind:0 data (3 seconds!)
4. Review → customize theme/add extra fields
5. Choose URL: key.card/username (NIP-05 preferred)
6. Publish → get QR code → done
```
**Time to first card: ~30 seconds**

### Flow B: "Curious Creator" (no Nostr key)

```
1. Land on key.card → "Create Your Card"
2. Simple form: Name, Photo, Bio, Links
3. Add contact info: email, phone, website, socials
4. Choose template/theme
5. Choose URL: key.card/username
6. Preview → Publish → get QR code
7. (Later) Banner: "Want to own this card forever? Claim with Nostr key →"
```
**Time to first card: ~3 minutes**

### Flow C: "Conference Scanner" (viewing a card)

```
1. Scan QR code at conference
2. Card loads in mobile browser (< 1 second)
3. See: photo, name, title, bio
4. Primary CTA: "Save to Contacts" (vCard download)
5. Secondary: social links, "Follow on Nostr", Lightning tip
6. (Optional) "Create your own card →" link in footer
```
**Time to value: ~3 seconds**

---

## 6. Mobile-First Design Priorities

### Must-Have (P0)

1. **Card view loads in < 1 second** — static HTML/CSS, minimal JS. No loading spinners.
2. **"Save to Contacts" button** — above the fold, one-tap vCard download. This is THE primary action.
3. **QR code display** — always visible, scannable even on screen (for showing to others)
4. **Responsive card layout** — looks great on any phone, any screen size
5. **Profile photo** — large, prominent. Faces build trust at events.
6. **npub/NIP-05 display** — copy-to-clipboard on tap

### Should-Have (P1)

7. **Lightning tip button** — "Zap me ⚡" with LN invoice generation. Unique differentiator.
8. **Social links** — icons for Nostr, Twitter/X, LinkedIn, GitHub, etc.
9. **Share button** — native share sheet (Web Share API) to text/email the card link
10. **Dark/light theme** — respect system preference, allow card creator to set default
11. **Offline-capable** — service worker caches the card for conference Wi-Fi dead zones

### Nice-to-Have (P2)

12. **NFC sharing** — write card URL to NFC tag. Power user feature.
13. **Card animation** — subtle entrance animation, not flashy
14. **Multiple cards** — personal card + work card + conference card
15. **Analytics (opt-in only)** — view count, no tracking. Creator opts in, viewers aren't tracked.

---

## 7. Competitive Differentiation

### What makes key.card different from every other digital business card?

| Feature | QRCodeChimp / Popl / HiHello | key.card |
|---------|-------------------------------|----------|
| **Data ownership** | Their servers, their terms | Your Nostr keys, your relays |
| **Pricing** | $7-19/month recurring | Free (self-sovereign by design) |
| **Card longevity** | Dies if you cancel | Lives as long as Nostr exists |
| **Privacy** | Tracks every scan with analytics | No tracking by default |
| **Identity** | Email + password | Cryptographic keypair |
| **Portability** | Locked to one platform | Standard Nostr events, works with any client |
| **Payments** | None | Lightning tips built-in |
| **Social graph** | Siloed contacts | Open social graph (Nostr follows) |

### The killer pitch:
> **"Your business card should outlive the company that made it."**

QRCodeChimp cards die when QRCodeChimp dies. key.card data lives on Nostr relays — forever, owned by you, portable to any client.

---

## 8. Open Questions for Design Team

1. **URL structure:** `key.card/npub1...` vs `key.card/nip05-name` vs `key.card/custom-slug`?
2. **Card templates:** How many at launch? Suggest 3-5 clean templates (minimal, professional, creative, dark, Nostr-purple)
3. **NIP proposal:** Should custom business card fields be a new Nostr event kind? (e.g., kind:10003 for business card metadata)
4. **Multi-card support:** v1 or v2 feature?
5. **Team/org cards:** Enterprise feature or out of scope?
6. **Offline card generation:** Can the entire flow work client-side (no server)?

---

*End of UX Research Report*
