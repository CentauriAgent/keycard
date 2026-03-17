import { QrCode, Share2, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { downloadVCard } from '@/lib/vcard';
import type { CardData } from '@/lib/cardTypes';

interface StickyToolbarProps {
  data: CardData;
  onQrClick: () => void;
}

export function StickyToolbar({ data, onQrClick }: StickyToolbarProps) {
  const { toast } = useToast();

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${data.displayName} — key.card`,
          text: `Check out ${data.displayName}'s digital business card`,
          url,
        });
      } catch {
        // User cancelled or share failed — fall back to clipboard
        await fallbackCopy(url);
      }
    } else {
      await fallbackCopy(url);
    }
  };

  const fallbackCopy = async (url: string) => {
    await navigator.clipboard.writeText(url);
    toast({ title: 'Link copied!', description: 'Card link copied to clipboard' });
  };

  const handleSaveContact = () => {
    downloadVCard(data);
    toast({ title: 'Contact saved!', description: `${data.displayName}.vcf downloaded` });
  };

  const buttons = [
    { icon: QrCode, label: 'QR Code', onClick: onQrClick },
    { icon: Share2, label: 'Share', onClick: handleShare },
    { icon: UserPlus, label: 'Save Contact', onClick: handleSaveContact },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300">
      <div className="max-w-[480px] mx-auto">
        <div className="h-16 bg-white/80 dark:bg-[#0A0A0F]/80 backdrop-blur-xl border-t border-slate-200 dark:border-[#2D2D44] shadow-[0_-4px_12px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_12px_rgba(0,0,0,0.4)] flex items-center justify-around px-4 pb-[env(safe-area-inset-bottom)]">
          {buttons.map((btn) => (
            <button
              key={btn.label}
              onClick={btn.onClick}
              className="flex flex-col items-center gap-1 active:text-violet-500 transition-colors"
            >
              <btn.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{btn.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
