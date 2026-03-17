/**
 * vCard 3.0 generator for key.card
 * 
 * Generates vCard strings from CardData and triggers downloads.
 * Spec: RFC 2426 (vCard 3.0)
 */

import type { CardData } from '@/lib/cardTypes';

/**
 * Escape special characters for vCard text values.
 */
function escapeVCard(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Generate a vCard 3.0 string from CardData.
 */
export function generateVCard(data: CardData): string {
  const displayName = data.displayName || data.name || 'Unknown';

  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${escapeVCard(displayName)}`,
    `N:${escapeVCard(displayName)};;;;`,
  ];

  // Organization & Title from kind:30078
  if (data.config?.company) {
    lines.push(`ORG:${escapeVCard(data.config.company)}`);
  }
  if (data.config?.title) {
    lines.push(`TITLE:${escapeVCard(data.config.title)}`);
  }

  // Bio / about
  if (data.about) {
    lines.push(`NOTE:${escapeVCard(data.about)}`);
  }

  // Avatar
  if (data.picture) {
    lines.push(`PHOTO;VALUE=URI:${data.picture}`);
  }

  // Website
  if (data.website) {
    lines.push(`URL:${data.website}`);
  }

  // Email — use NIP-05 if it looks like an email (not _@domain)
  if (data.nip05 && data.nip05.includes('@') && !data.nip05.startsWith('_@')) {
    lines.push(`EMAIL;TYPE=INTERNET:${data.nip05}`);
  }

  // Phone numbers from kind:30078
  if (data.config?.phone) {
    for (const phone of data.config.phone) {
      const typeMap: Record<string, string> = {
        mobile: 'CELL',
        work: 'WORK',
        home: 'HOME',
        fax: 'FAX',
        other: 'VOICE',
      };
      const vcardType = typeMap[phone.type] || 'VOICE';
      lines.push(`TEL;TYPE=${vcardType}:${phone.number}`);
    }
  }

  // Address from kind:30078
  if (data.config?.address) {
    const addr = data.config.address;
    // ADR: PO Box;Extended;Street;City;State;Zip;Country
    const parts = [
      '', '', // PO Box, Extended
      addr.street || '',
      addr.city || '',
      addr.state || '',
      addr.zip || '',
      addr.country || '',
    ].map(escapeVCard);
    lines.push(`ADR;TYPE=WORK:${parts.join(';')}`);
  }

  // Lightning address
  if (data.lud16) {
    lines.push(`X-LIGHTNING:${data.lud16}`);
  }

  // Nostr pubkey
  lines.push(`X-NOSTR-NPUB:${data.npub}`);
  lines.push(`X-NOSTR-PUBKEY:${data.pubkey}`);

  // Booking URL
  if (data.config?.booking?.url) {
    lines.push(`URL;TYPE=BOOKING:${data.config.booking.url}`);
  }

  // Custom links
  if (data.config?.links) {
    for (const link of data.config.links) {
      lines.push(`URL;TYPE=${escapeVCard(link.label)}:${link.url}`);
    }
  }

  lines.push('END:VCARD');
  return lines.join('\r\n');
}

/**
 * Trigger a vCard file download in the browser.
 */
export function downloadVCard(data: CardData): void {
  const vcf = generateVCard(data);
  const blob = new Blob([vcf], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const displayName = data.displayName || data.name || 'contact';
  const filename = `${displayName.replace(/[^a-zA-Z0-9_-]/g, '_')}.vcf`;

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
