import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Info, ExternalLink } from 'lucide-react';
import type { CardData } from '@/lib/cardTypes';

interface ProfileSectionProps {
  cardData: CardData | undefined;
}

export function ProfileSection({ cardData }: ProfileSectionProps) {
  return (
    <div className="space-y-4">
      {/* Avatar + Banner preview */}
      <div className="flex items-center gap-4">
        <Avatar className="w-16 h-16 ring-2 ring-slate-200 dark:ring-slate-700">
          <AvatarImage src={cardData?.picture} alt={cardData?.displayName} className="object-cover" />
          <AvatarFallback className="bg-violet-500 text-white text-lg font-bold">
            {cardData?.displayName?.[0]?.toUpperCase() ?? '?'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{cardData?.displayName || 'No name set'}</p>
          {cardData?.nip05 && (
            <p className="text-xs text-slate-400 truncate">{cardData.nip05}</p>
          )}
        </div>
      </div>

      {/* Read-only fields */}
      <div className="space-y-3">
        <div>
          <Label className="text-xs text-slate-500">Display Name</Label>
          <Input
            value={cardData?.displayName || ''}
            disabled
            className="mt-1 bg-slate-50 dark:bg-slate-900 opacity-70"
          />
        </div>
        <div>
          <Label className="text-xs text-slate-500">Username</Label>
          <Input
            value={cardData?.name ? `@${cardData.name}` : ''}
            disabled
            className="mt-1 bg-slate-50 dark:bg-slate-900 opacity-70"
          />
        </div>
        <div>
          <Label className="text-xs text-slate-500">Bio</Label>
          <Textarea
            value={cardData?.about || ''}
            disabled
            rows={3}
            className="mt-1 bg-slate-50 dark:bg-slate-900 opacity-70 resize-none"
          />
        </div>
        <div>
          <Label className="text-xs text-slate-500">NIP-05 Address</Label>
          <Input
            value={cardData?.nip05 || ''}
            disabled
            className="mt-1 bg-slate-50 dark:bg-slate-900 opacity-70"
          />
        </div>
        <div>
          <Label className="text-xs text-slate-500">Website</Label>
          <Input
            value={cardData?.website || ''}
            disabled
            className="mt-1 bg-slate-50 dark:bg-slate-900 opacity-70"
          />
        </div>
        <div>
          <Label className="text-xs text-slate-500">Lightning Address</Label>
          <Input
            value={cardData?.lud16 || ''}
            disabled
            className="mt-1 bg-slate-50 dark:bg-slate-900 opacity-70"
          />
        </div>
      </div>

      {/* Edit in Nostr client CTA */}
      <div className="rounded-lg bg-violet-500/10 border border-violet-500/20 p-3">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
          <div className="space-y-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your profile data comes from your Nostr identity. To edit it, use your Nostr client.
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href="https://primal.net/settings/profile"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-violet-500 hover:underline"
              >
                Open in Primal <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://nostrudel.ninja/#/settings/profile"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-violet-500 hover:underline"
              >
                Open in noStrudel <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
