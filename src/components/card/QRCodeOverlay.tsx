import { QRShareSheet } from '@/components/qr/QRShareSheet';
import type { CardData } from '@/lib/cardTypes';

interface QRCodeOverlayProps {
  data: CardData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * QR Code Overlay — thin wrapper that delegates to the full QRShareSheet.
 * Kept for backward compatibility with existing card page imports.
 */
export function QRCodeOverlay({ data, open, onOpenChange }: QRCodeOverlayProps) {
  return <QRShareSheet data={data} open={open} onOpenChange={onOpenChange} />;
}

export default QRCodeOverlay;
