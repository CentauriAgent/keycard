import { useState, useEffect } from 'react';
import { nip19 } from 'nostr-tools';
import { Copy, Smartphone, Wallet, Plus } from 'lucide-react';
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
import { QRCodeStyled } from './QRCodeStyled';
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
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Build nprofile QR content
  const nprofile = nip19.nprofileEncode({
    pubkey: data.pubkey,
    relays: DEFAULT_RELAYS,
  });
  const qrContent = `nostr:${nprofile}`;

  // Accent color — prefer CSS var (set by Ditto theme injection) over config
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
        <AvatarFallback className="text-xl font-bold" style={{ backgroundColor: accentColor, color: '#fff' }}>
          {data.displayName?.[0]?.toUpperCase() ?? '?'}
        </AvatarFallback>
      </Avatar>
      <h3 className="text-lg font-bold text-center mt-3 text-foreground">{data.displayName}</h3>
      {data.nip05 && (
        <p className="text-sm text-muted-foreground text-center">{data.nip05}</p>
      )}

      {/* QR Code — always white bg for scannability, rounded dots in accent color */}
      <div className="bg-white rounded-2xl p-4 inline-block mx-auto mt-5">
        <QRCodeStyled
          value={qrContent}
          size={256}
          style="branded"
          accentColor={accentColor}
          logoUrl={data.picture}
          logoSize={32}
          className="animate-in fade-in zoom-in-95 duration-300"
        />
      </div>

      {/* Action buttons */}
      <div className="space-y-2 mt-5 px-4 w-full">
        <QRDownloadButton
          value={qrContent}
          filename={`${safeDisplayName}-qr`}
          style="branded"
          accentColor={accentColor}
          logoUrl={data.picture}
        />

        {[
          { icon: Copy, label: 'Copy nostr: link', onClick: handleCopyNostrLink },
          { icon: Wallet, label: 'Add to Apple Wallet', onClick: handleAppleWallet },
          { icon: Smartphone, label: 'Add to Google Wallet', onClick: handleGoogleWallet },
          { icon: Plus, label: 'Add to Home Screen', onClick: handleAddToHomeScreen },
        ].map(({ icon: Icon, label, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="w-full h-11 rounded-xl border border-border bg-card flex items-center gap-3 px-4 hover:bg-muted transition-colors"
          >
            <Icon className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[90vh] overflow-y-auto bg-card text-card-foreground border-border">
          <div className="w-10 h-1 rounded-full bg-border mx-auto mt-1 mb-4" />
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
      <DialogContent className="max-w-sm rounded-2xl bg-card text-card-foreground border-border">
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
