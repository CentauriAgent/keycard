import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CardData } from '@/lib/cardTypes';

interface ZapButtonProps {
  data: CardData;
}

export function CardZapButton({ data }: ZapButtonProps) {
  if (!data.lud16) return null;

  const handleZap = () => {
    // Open Lightning address in wallet or fallback to LNURL
    const lnurl = `lightning:${data.lud16}`;
    window.open(lnurl, '_blank');
  };

  return (
    <div className="px-4 mt-4">
      <Button
        onClick={handleZap}
        className="w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/25 text-sm font-semibold"
      >
        <Zap className="w-5 h-5 mr-2 fill-current" />
        Zap {data.displayName}
      </Button>
    </div>
  );
}
