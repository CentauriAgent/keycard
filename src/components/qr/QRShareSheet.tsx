import { useState, useEffect } from 'react';
import { nip19 } from 'nostr-tools';
import { Copy, Download, Smartphone, Wallet, Plus } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/useToast';
import { QRCodeStyled, type QRStyle } from './QRCodeStyled';
import { QRDownloadButton } from './QRDownloadButton';
import type { CardData } from '@/lib/cardTypes';

export interface QRShareSheetProps {
  data: CardData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DEFAULT_RELAYS = [
  'wss://relay.ditto.pub',
  'wss://relay.primal.net',
  'wss://relay.damus.io',
];

const STYLE_OPTIONS: { key: QRStyle; label: string }[] = [
  { key: 'classic', label: 'Classic' },
  { key: 'nostr', label: 'Nostr' },
  { key: 'branded', label: 'Branded' },
];

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

export function QRShareSheet({ data, open, onOpenChange }: QRShareSheetProps) {
  const [selectedStyle, setSelectedStyle] = useState<QRStyle>('nostr');
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Build nprofile QR content
  const nprofile = nip19.nprofileEncode({
    pubkey: data.pubkey,
    relays: DEFAULT_RELAYS,
  });
  const qrContent = `nostr:${nprofile}`;

  // Accent color from theme
  const accentColor = data.config?.theme?.accent ?? '#8B5CF6';

  // Filename for downloads
  const safeDisplayName = data.displayName.replace(/[^a-zA-Z0-9_-]/g, '_');

  const handleCopyNostrLink = async () => {
    try {
      await navigator.clipboard.writeText(qrContent);
      toast({ title: 'Copied!', description: 'nostr: link copied to clipboard' });
    } catch {
      toast({ title: 'Failed to copy', description: 'Clipboard access denied' });
    }
  };

  // Build full wallet pass payload from card data
  const walletPayload = {
    pubkey: data.pubkey,
    name: data.displayName || data.name || 'Anonymous',
    jobTitle: data.config?.title,
    company: data.config?.company,
    nip05: data.nip05,
    lud16: data.lud16,
    picture: data.picture,
    relays: DEFAULT_RELAYS,
  };

  const handleAppleWallet = async () => {
    try {
      const res = await fetch('/api/wallet/apple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(walletPayload),
      });
      if (!res.ok) throw new Error('Failed to generate pass');

      const contentType = res.headers.get('Content-Type') || '';
      if (contentType.includes('application/vnd.apple.pkpass')) {
        // Real PKPass binary — trigger download
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${safeDisplayName}.pkpass`;
        a.click();
        URL.revokeObjectURL(url);
        toast({ title: 'Apple Wallet', description: 'Pass downloaded!' });
      } else {
        // Mock mode — show info
        const json = await res.json();
        toast({
          title: 'Apple Wallet (Preview)',
          description: json.message || 'Pass preview generated — Apple cert needed for real passes.',
        });
      }
    } catch {
      toast({ title: 'Apple Wallet', description: 'Failed to generate pass. Try again.' });
    }
  };

  const handleGoogleWallet = async () => {
    try {
      const res = await fetch('/api/wallet/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(walletPayload),
      });
      if (!res.ok) throw new Error('Failed to generate pass');

      const json = await res.json();
      if (json.saveUrl && !json.mock) {
        window.open(json.saveUrl, '_blank', 'noopener,noreferrer');
        toast({ title: 'Google Wallet', description: 'Opening Google Pay...' });
      } else {
        toast({
          title: 'Google Wallet (Preview)',
          description: json.message || 'Pass preview generated — Google service account needed for real passes.',
        });
      }
    } catch {
      toast({ title: 'Google Wallet', description: 'Failed to generate pass. Try again.' });
    }
  };

  const handleAddToHomeScreen = () => {
    toast({
      title: 'Add to Home Screen',
      description: 'Use your browser\'s "Add to Home Screen" option to save this card',
    });
  };

  const content = (
    <div className="flex flex-col items-center pb-6">
      {/* Profile header */}
      <Avatar className="w-16 h-16 mt-2">
        <AvatarImage src={data.picture} alt={data.displayName} className="object-cover" />
        <AvatarFallback className="bg-violet-500 text-white text-xl font-bold">
          {data.displayName?.[0]?.toUpperCase() ?? '?'}
        </AvatarFallback>
      </Avatar>
      <h3 className="text-lg font-bold text-center mt-3">{data.displayName}</h3>
      {data.nip05 && (
        <p className="text-sm text-slate-400 text-center">{data.nip05}</p>
      )}

      {/* Style selector tabs */}
      <div className="flex gap-1 mt-5 bg-slate-100 dark:bg-white/5 rounded-lg p-1">
        {STYLE_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSelectedStyle(opt.key)}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
              selectedStyle === opt.key
                ? 'bg-white dark:bg-[#1A1A2E] text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* QR Code */}
      <div className="bg-white rounded-2xl p-4 inline-block mx-auto mt-4">
        <QRCodeStyled
          value={qrContent}
          size={256}
          style={selectedStyle}
          accentColor={accentColor}
          logoUrl={data.picture}
          logoSize={32}
          className="animate-in fade-in zoom-in-95 duration-300"
        />
      </div>

      {/* Action buttons */}
      <div className="space-y-2 mt-5 px-4 w-full">
        {/* Download QR */}
        <QRDownloadButton
          value={qrContent}
          filename={`${safeDisplayName}-qr`}
          style={selectedStyle}
          accentColor={accentColor}
          logoUrl={data.picture}
        />

        {/* Copy nostr: link */}
        <button
          onClick={handleCopyNostrLink}
          className="w-full h-11 rounded-xl border border-slate-200 dark:border-[#2D2D44] flex items-center gap-3 px-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
        >
          <Copy className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium">Copy nostr: link</span>
        </button>

        {/* Apple Wallet */}
        <button
          onClick={handleAppleWallet}
          className="w-full h-11 rounded-xl border border-slate-200 dark:border-[#2D2D44] flex items-center gap-3 px-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
        >
          <Wallet className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium">Add to Apple Wallet</span>
        </button>

        {/* Google Wallet */}
        <button
          onClick={handleGoogleWallet}
          className="w-full h-11 rounded-xl border border-slate-200 dark:border-[#2D2D44] flex items-center gap-3 px-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
        >
          <Smartphone className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium">Add to Google Wallet</span>
        </button>

        {/* Add to Home Screen */}
        <button
          onClick={handleAddToHomeScreen}
          className="w-full h-11 rounded-xl border border-slate-200 dark:border-[#2D2D44] flex items-center gap-3 px-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
        >
          <Plus className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium">Add to Home Screen</span>
        </button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[90vh] overflow-y-auto">
          <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600 mx-auto mt-1 mb-4" />
          <SheetHeader className="sr-only">
            <SheetTitle>Share Card</SheetTitle>
            <SheetDescription>Share this key.card via QR code</SheetDescription>
          </SheetHeader>
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Share Card</DialogTitle>
          <DialogDescription>Share this key.card via QR code</DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}

export default QRShareSheet;
