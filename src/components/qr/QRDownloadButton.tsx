import { useState } from 'react';
import { Download } from 'lucide-react';
import { renderStyledQRToCanvas, type QRStyle } from './QRCodeStyled';

export interface QRDownloadButtonProps {
  /** QR content string */
  value: string;
  /** Filename for download (without extension) */
  filename?: string;
  /** QR style preset */
  style?: QRStyle;
  /** Accent color for branded style */
  accentColor?: string;
  /** Logo URL for center embed */
  logoUrl?: string;
  /** Additional CSS class */
  className?: string;
}

/**
 * Button that renders a high-res (1024px) QR to an offscreen canvas and downloads as PNG.
 */
export function QRDownloadButton({
  value,
  filename = 'qr-code',
  style = 'classic',
  accentColor,
  logoUrl,
  className,
}: QRDownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const canvas = await renderStyledQRToCanvas(value, {
        size: 1024,
        style,
        accentColor,
        logoUrl,
        logoSize: 128, // Scaled up for 1024px canvas
      });

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png'),
      );
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('QR download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className={`w-full h-11 rounded-xl border border-slate-200 dark:border-[#2D2D44] flex items-center gap-3 px-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50 ${className ?? ''}`}
    >
      <Download className="w-4 h-4 text-slate-500" />
      <span className="text-sm font-medium">
        {downloading ? 'Downloading…' : 'Save QR to Gallery'}
      </span>
    </button>
  );
}

export default QRDownloadButton;
