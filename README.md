# key.card

**Your Nostr identity as a beautiful, shareable card.** key.card lets you generate a personalized digital identity card from your Nostr profile — complete with your display name, avatar, NIP-05 address, npub, and a QR code. Share it as an image, add it to Apple or Google Wallet, or print it for conferences. Built with React, Vite, and Nostrify.

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/ArcadeLabsInc/keycard.git
cd keycard
npm install

# Start development server
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

## 🏗️ Build

```bash
npm run build    # Production build → dist/
npm run test     # Run type-check, lint, and tests
```

## 🚢 Deploy

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ArcadeLabsInc/keycard)

The repo includes `vercel.json` — just connect your GitHub repo and deploy. SPA routing is handled automatically.

### Surge (Preview)

```bash
npm run build
cd dist
surge . your-preview.surge.sh
```

## ⚙️ Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_APP_URL` | No | App base URL (default: `https://key.card`) |
| `APPLE_CERT` | Production | Apple Developer certificate for Wallet passes |
| `APPLE_CERT_PASS` | Production | Apple certificate password |
| `APPLE_TEAM_ID` | Production | Apple Developer Team ID |
| `APPLE_PASS_TYPE_ID` | Production | Apple Wallet Pass Type Identifier |
| `GOOGLE_SERVICE_ACCOUNT` | Production | Google Cloud service account JSON |
| `GOOGLE_ISSUER_ID` | Production | Google Pay & Wallet Console Issuer ID |

Copy `.env.example` to `.env` and fill in values as needed.

## 🛠️ Tech Stack

- **React 18** + TypeScript
- **Vite** — fast dev server and bundler
- **TailwindCSS 3** + shadcn/ui components
- **Nostrify** — Nostr protocol integration
- **React Router** — client-side SPA routing
- **QRCode** — QR code generation

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Commit your changes (`git commit -m 'feat: add my feature'`)
4. Push to the branch (`git push origin feat/my-feature`)
5. Open a Pull Request

## 📄 License

Open source — build and share your Nostr identity.
