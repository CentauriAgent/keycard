/**
 * NIP-05 resolution utility
 * 
 * Resolves NIP-05 identifiers (user@domain.com) to hex pubkeys
 * via the /.well-known/nostr.json endpoint.
 */

export interface Nip05Result {
  pubkey: string;
  relays?: string[];
}

/**
 * Parse a NIP-05 identifier into name and domain parts.
 */
export function parseNip05(identifier: string): { name: string; domain: string } | null {
  const trimmed = identifier.trim().toLowerCase();
  const atIndex = trimmed.indexOf('@');
  if (atIndex < 0 || atIndex !== trimmed.lastIndexOf('@')) return null;

  const name = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex + 1);
  if (!name || !domain || !domain.includes('.')) return null;

  return { name, domain };
}

/**
 * Resolve a NIP-05 identifier to a hex pubkey.
 */
export async function resolveNip05(
  identifier: string,
  signal?: AbortSignal,
): Promise<Nip05Result | null> {
  const parsed = parseNip05(identifier);
  if (!parsed) return null;

  const { name, domain } = parsed;
  const url = `https://${domain}/.well-known/nostr.json?name=${encodeURIComponent(name)}`;

  try {
    const response = await fetch(url, {
      signal: signal ?? AbortSignal.timeout(5000),
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) return null;

    const data = await response.json();
    const pubkey = data?.names?.[name];
    if (!pubkey || typeof pubkey !== 'string') return null;
    if (!/^[0-9a-f]{64}$/.test(pubkey)) return null;

    const relayHints = data?.relays?.[pubkey];
    const relays = Array.isArray(relayHints)
      ? relayHints.filter((r: unknown) => typeof r === 'string' && r.startsWith('wss://'))
      : undefined;

    return { pubkey, relays };
  } catch {
    return null;
  }
}

/**
 * Check if a string looks like a NIP-05 identifier.
 */
export function isNip05(identifier: string): boolean {
  return parseNip05(identifier) !== null;
}
