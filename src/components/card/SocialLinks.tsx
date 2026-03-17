import {
  Github,
  Twitter,
  Youtube,
  Linkedin,
  Globe,
  Podcast,
  FileText,
  ExternalLink,
  Zap,
  BadgeCheck,
  ChevronRight,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { CardData, ExternalIdentity, LinkEntry } from '@/lib/cardTypes';
import { PLATFORM_URLS } from '@/lib/cardTypes';

interface SocialLinksProps {
  data: CardData;
}

const iconComponents: Record<string, React.ElementType> = {
  github: Github,
  twitter: Twitter,
  youtube: Youtube,
  linkedin: Linkedin,
  globe: Globe,
  podcast: Podcast,
  file: FileText,
  link: ExternalLink,
  nostr: Zap,
  mail: ExternalLink,
  calendar: ExternalLink,
};

function getIconComponent(icon?: string): React.ElementType {
  if (!icon) return ExternalLink;
  return iconComponents[icon.toLowerCase()] ?? ExternalLink;
}

function getPlatformUrl(identity: ExternalIdentity): string {
  const urlFn = PLATFORM_URLS[identity.platform];
  return urlFn ? urlFn(identity.identity) : '';
}

export function SocialLinks({ data }: SocialLinksProps) {
  const identities = data.identities ?? [];
  const configLinks = data.config?.links ?? [];

  // Deduplicate: if NIP-39 covers a platform, skip the same platform from links
  const coveredPlatforms = new Set(identities.map((id) => id.platform.toLowerCase()));

  const dedupedLinks = configLinks.filter((link) => {
    const iconKey = link.icon?.toLowerCase() ?? '';
    return !coveredPlatforms.has(iconKey);
  });

  // Add website from kind:0 if not already covered
  const allLinkUrls = new Set([
    ...configLinks.map((l) => l.url.toLowerCase()),
    ...identities.map((id) => getPlatformUrl(id).toLowerCase()),
  ]);

  const websiteLink: LinkEntry | undefined =
    data.website && !allLinkUrls.has(data.website.toLowerCase())
      ? { label: new URL(data.website).hostname.replace('www.', ''), url: data.website, icon: 'globe' }
      : undefined;

  const hasContent = identities.length > 0 || dedupedLinks.length > 0 || websiteLink;
  if (!hasContent) return null;

  interface DisplayRow {
    key: string;
    icon: React.ElementType;
    label: string;
    url: string;
    verified: boolean;
  }

  const rows: DisplayRow[] = [];

  // NIP-39 identities first
  for (const id of identities) {
    const url = getPlatformUrl(id);
    rows.push({
      key: `nip39-${id.platform}-${id.identity}`,
      icon: getIconComponent(id.platform),
      label: `${id.platform.charAt(0).toUpperCase() + id.platform.slice(1)}`,
      url,
      verified: true,
    });
  }

  // Kind:30078 links
  for (const link of dedupedLinks) {
    rows.push({
      key: `link-${link.url}`,
      icon: getIconComponent(link.icon),
      label: link.label,
      url: link.url,
      verified: false,
    });
  }

  // Website from kind:0
  if (websiteLink) {
    rows.push({
      key: 'website',
      icon: Globe,
      label: websiteLink.label,
      url: websiteLink.url,
      verified: false,
    });
  }

  return (
    <div className="px-4 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="rounded-xl border border-slate-200 dark:border-[#2D2D44] p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Social & Links
        </h3>

        <div className="space-y-0 -mx-4">
          {rows.map((row, i) => (
            <div key={row.key}>
              {i > 0 && <Separator className="mx-4" />}
              <a
                href={row.url || undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 px-4 transition-colors"
              >
                <row.icon className="w-5 h-5 text-slate-500 dark:text-slate-400 shrink-0" />
                <span className="text-sm font-medium flex-1">{row.label}</span>
                {row.verified && (
                  <BadgeCheck className="w-4 h-4 text-green-500 shrink-0" />
                )}
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
