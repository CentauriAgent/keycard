import { Zap } from 'lucide-react';
import { ZapDialog } from '@/components/ZapDialog';
import type { CardData } from '@/lib/cardTypes';

interface ZapButtonProps {
  data: CardData;
  accentColor?: string;
}

export function CardZapButton({ data, accentColor }: ZapButtonProps) {
  const accent = accentColor ?? data.config?.theme?.accent ?? '#F59E0B';
  // Need both a lightning address AND the kind:0 event to do a proper NIP-57 zap
  if (!data.lud16 || !data.profileEvent) return null;

  return (
    <div className="px-4 mt-4">
      <ZapDialog target={data.profileEvent} className="w-full">
        <button className="w-full h-12 rounded-xl text-white shadow-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors" style={{ backgroundColor: accent, boxShadow: `0 10px 15px -3px color-mix(in srgb, ${accent} 25%, transparent)` }}>
          <Zap className="w-5 h-5 fill-current" />
          Zap {data.displayName}
        </button>
      </ZapDialog>
    </div>
  );
}
