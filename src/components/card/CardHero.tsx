import { useState } from 'react';
import { BadgeCheck, Copy } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/useToast';
import type { CardData } from '@/lib/cardTypes';

interface CardHeroProps {
  data: CardData;
}

export function CardHero({ data }: CardHeroProps) {
  const [bannerError, setBannerError] = useState(false);
  const { toast } = useToast();

  const accentColor = data.config?.theme?.accent ?? '#8B5CF6';

  const handleCopyNip05 = async () => {
    if (data.nip05) {
      await navigator.clipboard.writeText(data.nip05);
      toast({ title: 'Copied!', description: data.nip05 });
    }
  };

  return (
    <div>
      {/* Banner */}
      {data.banner && !bannerError ? (
        <div className="h-[200px] w-full overflow-hidden">
          <img
            src={data.banner}
            alt="Banner"
            className="h-full w-full object-cover animate-in fade-in duration-500"
            onError={() => setBannerError(true)}
          />
        </div>
      ) : (
        <div
          className="h-[200px] w-full"
          style={{
            background: `linear-gradient(135deg, ${accentColor}, #312e81)`,
          }}
        />
      )}

      {/* Avatar */}
      <div className="relative z-10 mx-auto -mt-12 w-24 h-24 animate-in fade-in zoom-in-75 duration-300">
        <Avatar className="w-24 h-24 ring-4 ring-white dark:ring-[#0A0A0F]">
          <AvatarImage src={data.picture} alt={data.displayName} className="object-cover" />
          <AvatarFallback className="bg-violet-500 text-white text-2xl font-bold">
            {data.displayName?.[0]?.toUpperCase() ?? '?'}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Identity section */}
      <div className="px-4 pt-3 pb-4 text-center space-y-0.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <h1 className="text-2xl font-bold tracking-tight">{data.displayName}</h1>

        {data.name && (
          <p className="text-sm text-slate-400 mt-0.5">@{data.name}</p>
        )}

        {data.nip05 && (
          <button
            onClick={handleCopyNip05}
            className="inline-flex items-center gap-1 text-sm text-slate-400 mt-1 hover:text-slate-300 transition-colors group"
          >
            <BadgeCheck className="w-4 h-4 text-green-500" />
            <span>{data.nip05}</span>
            <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        )}

        {(data.config?.title || data.config?.company) && (
          <div className="mt-2">
            {data.config?.title && (
              <p className="text-base font-medium">
                {data.config.title}
                {data.config?.company && (
                  <span className="text-sm text-slate-400"> at {data.config.company}</span>
                )}
              </p>
            )}
            {!data.config?.title && data.config?.company && (
              <p className="text-sm text-slate-400">{data.config.company}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
