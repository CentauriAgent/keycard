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
        <div className="min-h-16 backdrop-blur-xl border-t flex items-center justify-around px-4 pb-[env(safe-area-inset-bottom)]" style={{ backgroundColor: 'rgba(10,10,15,0.92)', borderColor: '#2D2D44', boxShadow: '0 -4px 12px rgba(0,0,0,0.5)' }}>
          {buttons.map((btn) => (
            <button
              key={btn.label}
              onClick={btn.onClick}
              className="flex flex-col items-center gap-1 text-slate-200 active:text-violet-400 transition-colors"
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
