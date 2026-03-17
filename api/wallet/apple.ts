/**
 * POST /api/wallet/apple — Apple Wallet PKPass generation
 *
 * Accepts a JSON body with Nostr profile data and returns either:
 * - A signed .pkpass binary (Content-Type: application/vnd.apple.pkpass) when APPLE_CERT is set
 * - A JSON mock response describing the pass contents when APPLE_CERT is not set
 *
 * Required env vars for production:
 *   APPLE_CERT          — base64-encoded .p12 signing certificate
 *   APPLE_CERT_PASS     — certificate password
 *   APPLE_TEAM_ID       — Apple Developer Team ID
 *   APPLE_PASS_TYPE_ID  — e.g. "pass.card.key.contact"
 *   APPLE_WWDR_CERT     — base64-encoded Apple WWDR intermediate cert (optional, passkit-generator can use built-in)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
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

interface PassFieldEntry {
  key: string;
  label: string;
  value: string;
}

// ─── Helpers ──────────────────────────────────────────────────

function buildNprofileUri(pubkey: string, relays?: string[]): string {
  const nprofile = nip19.nprofileEncode({
    pubkey,
    relays: relays?.slice(0, 3) ?? [],
  });
  return `nostr:${nprofile}`;
}

function buildPassFields(data: WalletPassRequest) {
  const primaryFields: PassFieldEntry[] = [
    { key: 'name', label: 'NAME', value: data.name || 'Anonymous' },
  ];

  const secondaryFields: PassFieldEntry[] = [];
  if (data.jobTitle) {
    secondaryFields.push({ key: 'title', label: 'TITLE', value: data.jobTitle });
  }
  if (data.company) {
    secondaryFields.push({ key: 'company', label: 'ORG', value: data.company });
  }

  const auxiliaryFields: PassFieldEntry[] = [];
  if (data.nip05) {
    auxiliaryFields.push({ key: 'nip05', label: 'NOSTR', value: data.nip05 });
  }
  if (data.lud16) {
    auxiliaryFields.push({ key: 'lud16', label: 'LIGHTNING', value: data.lud16 });
  }

  const npub = nip19.npubEncode(data.pubkey);
  const backFields: PassFieldEntry[] = [
    { key: 'about', label: 'About', value: 'key.card — Your Nostr Identity Card' },
    { key: 'npub', label: 'Nostr Public Key', value: npub },
    { key: 'profile_url', label: 'Profile', value: `https://key.card/${npub}` },
    { key: 'website', label: 'Website', value: 'https://key.card' },
  ];
  if (data.lud16) {
    backFields.push({ key: 'lightning', label: 'Lightning Address', value: data.lud16 });
  }

  return { primaryFields, secondaryFields, auxiliaryFields, backFields };
}

// ─── Mock response (no Apple cert) ───────────────────────────

function buildMockResponse(data: WalletPassRequest) {
  const fields = buildPassFields(data);
  const nprofileUri = buildNprofileUri(data.pubkey, data.relays);
  const npub = nip19.npubEncode(data.pubkey);

  return {
    mock: true,
    message:
      'Apple Wallet PKPass generation requires an Apple Developer certificate ($99/yr enrollment). ' +
      'Set APPLE_CERT, APPLE_CERT_PASS, APPLE_TEAM_ID, and APPLE_PASS_TYPE_ID environment variables for production.',
    passPreview: {
      formatVersion: 1,
      passType: 'generic',
      organizationName: 'key.card',
      description: 'Nostr Contact Card',
      serialNumber: data.pubkey,
      foregroundColor: 'rgb(255, 255, 255)',
      backgroundColor: 'rgb(88, 50, 168)',
      labelColor: 'rgb(200, 180, 240)',
      logoText: 'key.card',
      generic: {
        primaryFields: fields.primaryFields,
        secondaryFields: fields.secondaryFields,
        auxiliaryFields: fields.auxiliaryFields,
        backFields: fields.backFields,
      },
      barcode: {
        format: 'PKBarcodeFormatQR',
        message: nprofileUri,
        messageEncoding: 'iso-8859-1',
      },
      thumbnailUrl: data.picture || null,
      profileUrl: `https://key.card/${npub}`,
    },
  };
}

// ─── Real PKPass generation ──────────────────────────────────

async function generateRealPKPass(data: WalletPassRequest): Promise<Buffer> {
  // Dynamic import — only loaded when certs are available
  const { PKPass } = await import('passkit-generator');

  const certBase64 = process.env.APPLE_CERT!;
  const certPassword = process.env.APPLE_CERT_PASS || '';
  const teamId = process.env.APPLE_TEAM_ID || 'XXXXXXXXXX';
  const passTypeId = process.env.APPLE_PASS_TYPE_ID || 'pass.card.key.contact';

  const signerCert = Buffer.from(certBase64, 'base64');
  const wwdrCert = process.env.APPLE_WWDR_CERT
    ? Buffer.from(process.env.APPLE_WWDR_CERT, 'base64')
    : undefined;

  const fields = buildPassFields(data);
  const nprofileUri = buildNprofileUri(data.pubkey, data.relays);
  const npub = nip19.npubEncode(data.pubkey);

  // Create the pass
  const pass = new PKPass(
    {},
    {
      wwdr: wwdrCert as any,
      signerCert,
      signerKey: signerCert, // .p12 contains both cert and key
      signerKeyPassphrase: certPassword,
    },
    {
      formatVersion: 1,
      passTypeIdentifier: passTypeId,
      teamIdentifier: teamId,
      organizationName: 'key.card',
      description: 'Nostr Contact Card',
      serialNumber: data.pubkey,
      foregroundColor: 'rgb(255, 255, 255)',
      backgroundColor: 'rgb(88, 50, 168)',
      labelColor: 'rgb(200, 180, 240)',
      logoText: 'key.card',
    },
  );

  // Set pass type to generic
  pass.type = 'generic';

  // Add fields
  for (const f of fields.primaryFields) {
    pass.primaryFields.push(f);
  }
  for (const f of fields.secondaryFields) {
    pass.secondaryFields.push(f);
  }
  for (const f of fields.auxiliaryFields) {
    pass.auxiliaryFields.push(f);
  }
  for (const f of fields.backFields) {
    pass.backFields.push(f);
  }

  // Set barcode — QR code pointing to nprofile URI
  pass.setBarcodes({
    format: 'PKBarcodeFormatQR',
    message: nprofileUri,
    messageEncoding: 'iso-8859-1',
  });

  // Generate strip image (purple gradient) — 640x246 PNG
  const stripPng = generateGradientPng(640, 246, '#5832a8', '#8B5CF6');
  pass.addBuffer('strip.png', stripPng);
  pass.addBuffer('strip@2x.png', stripPng);

  // Generate simple logo (white "K" on transparent) — 160x50 placeholder
  const logoPng = generateLogoPng();
  pass.addBuffer('icon.png', logoPng);
  pass.addBuffer('icon@2x.png', logoPng);
  pass.addBuffer('logo.png', logoPng);
  pass.addBuffer('logo@2x.png', logoPng);

  // If picture URL available, fetch and add as thumbnail
  if (data.picture) {
    try {
      const resp = await fetch(data.picture, { signal: AbortSignal.timeout(5000) });
      if (resp.ok) {
        const imgBuf = Buffer.from(await resp.arrayBuffer());
        pass.addBuffer('thumbnail.png', imgBuf);
        pass.addBuffer('thumbnail@2x.png', imgBuf);
      }
    } catch {
      // Skip thumbnail on fetch failure
    }
  }

  const passBuffer = pass.getAsBuffer();
  return passBuffer;
}

// ─── Image generation helpers ────────────────────────────────

/**
 * Generate a minimal 1x1 PNG with the given color (placeholder).
 * For a real strip image, we'd use sharp or canvas. In serverless,
 * we create a minimal valid PNG.
 */
function generateGradientPng(width: number, height: number, _color1: string, _color2: string): Buffer {
  // Minimal valid PNG — single purple pixel tiled
  // In production, use sharp/canvas for proper gradient
  return createSolidPng(width, height, [88, 50, 168, 255]);
}

function generateLogoPng(): Buffer {
  // Minimal 32x32 white-ish PNG placeholder
  return createSolidPng(32, 32, [255, 255, 255, 200]);
}

/**
 * Create a minimal valid PNG with solid RGBA color.
 * Uses uncompressed IDAT for simplicity in serverless (no native deps).
 */
function createSolidPng(width: number, height: number, rgba: [number, number, number, number]): Buffer {
  // We use the simplest possible valid PNG structure
  const { deflateSync } = require('zlib') as typeof import('zlib');

  // Build raw image data (filter byte 0 + RGBA pixels per row)
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const offset = y * rowSize;
    rawData[offset] = 0; // filter: None
    for (let x = 0; x < width; x++) {
      const px = offset + 1 + x * 4;
      rawData[px] = rgba[0];
      rawData[px + 1] = rgba[1];
      rawData[px + 2] = rgba[2];
      rawData[px + 3] = rgba[3];
    }
  }

  const compressed = deflateSync(rawData);

  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBytes = Buffer.from(type, 'ascii');
  const crcInput = Buffer.concat([typeBytes, data]);

  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcInput), 0);

  return Buffer.concat([len, typeBytes, data, crc]);
}

function crc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
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

    // Mock mode: no Apple cert configured
    if (!process.env.APPLE_CERT) {
      return res.status(200).json(buildMockResponse(body));
    }

    // Real mode: generate signed PKPass
    const passBuffer = await generateRealPKPass(body);

    res.setHeader('Content-Type', 'application/vnd.apple.pkpass');
    res.setHeader('Content-Disposition', `attachment; filename="keycard-${body.pubkey.slice(0, 8)}.pkpass"`);
    return res.status(200).send(passBuffer);
  } catch (err: any) {
    console.error('Apple Wallet pass generation error:', err);
    return res.status(500).json({
      error: 'Failed to generate Apple Wallet pass',
      details: err.message || String(err),
    });
  }
}
