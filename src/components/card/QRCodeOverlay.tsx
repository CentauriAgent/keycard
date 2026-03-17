import { useEffect, useState } from 'react';
import { nip19 } from 'nostr-tools';
import { Download, Smartphone } from 'lucide-react';
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
import type { CardData } from '@/lib/cardTypes';
import QRCode from 'qrcode';

interface QRCodeOverlayProps {
  data: CardData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

export function QRCodeOverlay({ data, open, onOpenChange }: QRCodeOverlayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Build nprofile content for QR
  const nprofile = nip19.nprofileEncode({
    pubkey: data.pubkey,
    relays: ['wss://relay.ditto.pub', 'wss://relay.primal.net', 'wss://relay.damus.io'],
  });
  const qrContent = `nostr:${nprofile}`;

  // Card URL for display
  const cardUrl = data.nip05
    ? `key.card/${data.nip05}`
    : `key.card/${data.npub.slice(0, 20)}…`;

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    QRCode.toDataURL(qrContent, {
      width: 512,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: { dark: '#000000', light: '#FFFFFF' },
    }).then((url) => {
      if (!cancelled) setQrDataUrl(url);
    }).catch(console.error);

    return () => { cancelled = true; };
  }, [open, qrContent]);

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast({ title: 'Link copied!', description: 'Card URL copied to clipboard' });
  };

  const handleSaveQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `${data.displayName}-qr.png`;
    a.click();
  };

  const content = (
    <div className="flex flex-col items-center pb-6">
      {/* Avatar + info */}
      <Avatar className="w-16 h-16 mt-2">
        <AvatarImage src={data.picture} alt={data.displayName} className="object-cover" />
        <AvatarFallback className="bg-violet-500 text-white text-xl font-bold">
          {data.displayName?.[0]?.toUpperCase() ?? '?'}
        </AvatarFallback>
      </Avatar>
      <h3 className="text-lg font-bold text-center mt-3">{data.displayName}</h3>
      {data.config?.title && (
        <p className="text-sm text-slate-400 text-center">{data.config.title}</p>
      )}

      {/* QR Code */}
      <div className="bg-white rounded-2xl p-4 inline-block mx-auto mt-6">
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt="QR Code"
            className="w-64 h-64 animate-in fade-in zoom-in-95 duration-300"
          />
        ) : (
          <div className="w-64 h-64 bg-slate-100 animate-pulse rounded" />
        )}
      </div>

      {/* URL */}
      <button
        onClick={handleCopyUrl}
        className="text-xs text-slate-400 text-center mt-3 cursor-pointer hover:text-violet-500 transition-colors"
      >
        {cardUrl}
      </button>

      {/* Action buttons */}
      <div className="space-y-2 mt-4 px-4 w-full">
        <button
          onClick={handleSaveQR}
          className="w-full h-11 rounded-xl border border-slate-200 dark:border-[#2D2D44] flex items-center gap-3 px-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium">Save QR to Gallery</span>
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
            <SheetTitle>QR Code</SheetTitle>
            <SheetDescription>Scan to view card</SheetDescription>
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
          <DialogTitle>QR Code</DialogTitle>
          <DialogDescription>Scan to view card</DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
