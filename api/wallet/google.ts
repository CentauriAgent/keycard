/**
 * POST /api/wallet/google — Google Wallet JWT pass generation
 *
 * Accepts a JSON body with Nostr profile data and returns either:
 * - A signed JWT + Google Pay save URL when GOOGLE_SERVICE_ACCOUNT is set
 * - An unsigned JWT + mock save URL when GOOGLE_SERVICE_ACCOUNT is not set
 *
 * Required env vars for production:
 *   GOOGLE_SERVICE_ACCOUNT — base64-encoded Google service account JSON
 *   GOOGLE_ISSUER_ID       — Google Wallet issuer ID (from Google Pay & Wallet Console)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { nip19 } from 'nostr-tools';

// ─── Types ────────────────────────────────────────────────────

interface WalletPassRequest {
  pubkey: string;       // hex pubkey
  name: string;
  jobTitle?: string;
  company?: string;
  nip05?: string;
  lud16?: string;
  picture?: string;
  relays?: string[];
}

interface GoogleServiceAccount {
  client_email: string;
  private_key: string;
  [key: string]: unknown;
}

// ─── Helpers ──────────────────────────────────────────────────

function buildNprofileUri(pubkey: string, relays?: string[]): string {
  const nprofile = nip19.nprofileEncode({
    pubkey,
    relays: relays?.slice(0, 3) ?? [],
  });
  return `nostr:${nprofile}`;
}

function buildGenericObject(data: WalletPassRequest, issuerId: string) {
  const npub = nip19.npubEncode(data.pubkey);
  const nprofileUri = buildNprofileUri(data.pubkey, data.relays);

  const textModules: Array<{ id: string; header: string; body: string }> = [];

  if (data.nip05) {
    textModules.push({ id: 'nip05', header: 'Nostr Address', body: data.nip05 });
  }
  if (data.lud16) {
    textModules.push({ id: 'lightning', header: 'Lightning', body: data.lud16 });
  }
  if (data.company) {
    textModules.push({ id: 'company', header: 'Organization', body: data.company });
  }
  textModules.push({ id: 'npub', header: 'Nostr Public Key', body: npub });
  textModules.push({ id: 'profile', header: 'Profile', body: `https://key.card/${npub}` });

  return {
    id: `${issuerId}.keycard-${data.pubkey.slice(0, 16)}`,
    classId: `${issuerId}.keycard-contact`,
    genericType: 'GENERIC_TYPE_UNSPECIFIED',
    hexBackgroundColor: '#5832a8',
    logo: {
      sourceUri: {
        uri: 'https://key.card/logo.png',
      },
      contentDescription: {
        defaultValue: { language: 'en-US', value: 'key.card logo' },
      },
    },
    cardTitle: {
      defaultValue: { language: 'en-US', value: 'key.card' },
    },
    header: {
      defaultValue: { language: 'en-US', value: data.name || 'Anonymous' },
    },
    subheader: {
      defaultValue: {
        language: 'en-US',
        value: data.jobTitle || data.nip05 || 'Nostr Contact',
      },
    },
    textModulesData: textModules,
    barcode: {
      type: 'QR_CODE',
      value: nprofileUri,
    },
    ...(data.picture && {
      heroImage: {
        sourceUri: { uri: data.picture },
        contentDescription: {
          defaultValue: { language: 'en-US', value: `${data.name}'s profile` },
        },
      },
    }),
  };
}

// ─── Mock response (no Google service account) ───────────────

function buildMockResponse(data: WalletPassRequest) {
  const issuerId = 'mock-issuer';
  const genericObject = buildGenericObject(data, issuerId);

  // Build unsigned JWT payload (for testing the flow)
  const payload = {
    iss: 'mock-service-account@key-card.iam.gserviceaccount.com',
    aud: 'google',
    typ: 'savetowallet',
    iat: Math.floor(Date.now() / 1000),
    origins: ['https://key.card'],
    payload: {
      genericObjects: [genericObject],
    },
  };

  // Base64url encode the payload (unsigned — for testing only)
  const headerB64 = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' }))
    .toString('base64url');
  const payloadB64 = Buffer.from(JSON.stringify(payload))
    .toString('base64url');
  const unsignedJwt = `${headerB64}.${payloadB64}.`;

  return {
    mock: true,
    message:
      'Google Wallet pass generation requires a Google service account with Wallet API access. ' +
      'Set GOOGLE_SERVICE_ACCOUNT (base64-encoded service account JSON) and GOOGLE_ISSUER_ID environment variables for production.',
    jwt: unsignedJwt,
    saveUrl: `https://pay.google.com/gp/v/save/${unsignedJwt}`,
    passPreview: {
      genericObject,
    },
  };
}

// ─── Real JWT generation ─────────────────────────────────────

function buildSignedJwt(data: WalletPassRequest): { jwt: string; saveUrl: string } {
  const saBase64 = process.env.GOOGLE_SERVICE_ACCOUNT!;
  const issuerId = process.env.GOOGLE_ISSUER_ID || 'keycard-issuer';

  let serviceAccount: GoogleServiceAccount;
  try {
    const saJson = Buffer.from(saBase64, 'base64').toString('utf-8');
    serviceAccount = JSON.parse(saJson);
  } catch {
    throw new Error('Failed to parse GOOGLE_SERVICE_ACCOUNT — must be base64-encoded JSON');
  }

  if (!serviceAccount.client_email || !serviceAccount.private_key) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT must contain client_email and private_key');
  }

  const genericObject = buildGenericObject(data, issuerId);

  const payload = {
    iss: serviceAccount.client_email,
    aud: 'google',
    typ: 'savetowallet',
    iat: Math.floor(Date.now() / 1000),
    origins: ['https://key.card'],
    payload: {
      genericObjects: [genericObject],
    },
  };

  const signedJwt = jwt.sign(payload, serviceAccount.private_key, {
    algorithm: 'RS256',
  });

  return {
    jwt: signedJwt,
    saveUrl: `https://pay.google.com/gp/v/save/${signedJwt}`,
  };
}

// ─── Handler ─────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const body = req.body as WalletPassRequest;

    // Validate required fields
    if (!body.pubkey || typeof body.pubkey !== 'string') {
      return res.status(400).json({ error: 'Missing required field: pubkey (hex string)' });
    }
    if (!/^[0-9a-f]{64}$/.test(body.pubkey)) {
      return res.status(400).json({ error: 'Invalid pubkey: must be 64-char hex string' });
    }
    if (!body.name || typeof body.name !== 'string') {
      return res.status(400).json({ error: 'Missing required field: name' });
    }

    // Mock mode: no Google service account configured
    if (!process.env.GOOGLE_SERVICE_ACCOUNT) {
      return res.status(200).json(buildMockResponse(body));
    }

    // Real mode: generate signed JWT
    const result = buildSignedJwt(body);

    return res.status(200).json({
      mock: false,
      jwt: result.jwt,
      saveUrl: result.saveUrl,
    });
  } catch (err: any) {
    console.error('Google Wallet pass generation error:', err);
    return res.status(500).json({
      error: 'Failed to generate Google Wallet pass',
      details: err.message || String(err),
    });
  }
}
