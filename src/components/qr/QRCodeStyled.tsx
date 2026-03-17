import { useEffect, useRef } from 'react';
import QRCodeLib from 'qrcode';

export type QRStyle = 'classic' | 'nostr' | 'branded';

export interface QRCodeStyledProps {
  /** The string to encode */
  value: string;
  /** Size in pixels (default: 256) */
  size?: number;
  /** QR visual style preset */
  style?: QRStyle;
  /** Custom accent color — used when style is "branded" */
  accentColor?: string;
  /** Optional logo URL to embed in center */
  logoUrl?: string;
  /** Logo size in pixels (default: 32) */
  logoSize?: number;
  /** Additional CSS class */
  className?: string;
}

/** Color configs per style preset */
const STYLE_COLORS: Record<QRStyle, { fg: string; bg: string }> = {
  classic: { fg: '#000000', bg: '#FFFFFF' },
  nostr: { fg: '#8B5CF6', bg: '#FFFFFF' },
  branded: { fg: '#8B5CF6', bg: '#FFFFFF' }, // fg overridden by accentColor
};

/**
 * Enhanced QR code with rounded dot modules, logo embed, and preset styles.
 */
export function QRCodeStyled({
  value,
  size = 256,
  style = 'classic',
  accentColor,
  logoUrl,
  logoSize = 32,
  className,
}: QRCodeStyledProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;

    (async () => {
      const colors = { ...STYLE_COLORS[style] };
      if (style === 'branded' && accentColor) {
        colors.fg = accentColor;
      }

      // Generate QR data matrix
      const qrData = QRCodeLib.create(value, { errorCorrectionLevel: 'H' });
      const modules = qrData.modules;
      const moduleCount = modules.size;

      const ctx = canvas.getContext('2d');
      if (!ctx || cancelled) return;

      canvas.width = size;
      canvas.height = size;

      const margin = 2;
      const totalModules = moduleCount + margin * 2;
      const moduleSize = size / totalModules;

      // Fill background
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, size, size);

      // Draw modules as rounded dots
      ctx.fillStyle = colors.fg;
      const dotRadius = moduleSize * 0.42; // Slightly smaller than half for gap between dots

      for (let row = 0; row < moduleCount; row++) {
        for (let col = 0; col < moduleCount; col++) {
          if (modules.get(row, col)) {
            const cx = (col + margin + 0.5) * moduleSize;
            const cy = (row + margin + 0.5) * moduleSize;

            if (style === 'classic') {
              // Square modules for classic
              ctx.fillRect(
                (col + margin) * moduleSize,
                (row + margin) * moduleSize,
                moduleSize,
                moduleSize,
              );
            } else {
              // Rounded dots for nostr/branded
              ctx.beginPath();
              ctx.arc(cx, cy, dotRadius, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      // Draw logo in center if provided
      if (logoUrl) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          if (cancelled) return;
          const logoActualSize = logoSize;
          const logoX = (size - logoActualSize) / 2;
          const logoY = (size - logoActualSize) / 2;
          const padding = 4;

          // White circular background
          ctx.fillStyle = colors.bg;
          ctx.beginPath();
          ctx.arc(
            size / 2,
            size / 2,
            logoActualSize / 2 + padding,
            0,
            Math.PI * 2,
          );
          ctx.fill();

          // Clip to circle and draw logo
          ctx.save();
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, logoActualSize / 2, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(img, logoX, logoY, logoActualSize, logoActualSize);
          ctx.restore();
        };
        img.src = logoUrl;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [value, size, style, accentColor, logoUrl, logoSize]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size }}
    />
  );
}

/**
 * Render a styled QR to an offscreen canvas (for download/export).
 */
export async function renderStyledQRToCanvas(
  value: string,
  opts: {
    size?: number;
    style?: QRStyle;
    accentColor?: string;
    logoUrl?: string;
    logoSize?: number;
  } = {},
): Promise<HTMLCanvasElement> {
  const {
    size = 1024,
    style = 'classic',
    accentColor,
    logoUrl,
    logoSize = 64,
  } = opts;

  const colors = { ...STYLE_COLORS[style] };
  if (style === 'branded' && accentColor) {
    colors.fg = accentColor;
  }

  const qrData = QRCodeLib.create(value, { errorCorrectionLevel: 'H' });
  const modules = qrData.modules;
  const moduleCount = modules.size;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d')!;
  const margin = 2;
  const totalModules = moduleCount + margin * 2;
  const moduleSize = size / totalModules;

  // Background
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, size, size);

  // Modules
  ctx.fillStyle = colors.fg;
  const dotRadius = moduleSize * 0.42;

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (modules.get(row, col)) {
        const cx = (col + margin + 0.5) * moduleSize;
        const cy = (row + margin + 0.5) * moduleSize;

        if (style === 'classic') {
          ctx.fillRect(
            (col + margin) * moduleSize,
            (row + margin) * moduleSize,
            moduleSize,
            moduleSize,
          );
        } else {
          ctx.beginPath();
          ctx.arc(cx, cy, dotRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  // Logo
  if (logoUrl) {
    await new Promise<void>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const logoX = (size - logoSize) / 2;
        const logoY = (size - logoSize) / 2;
        const padding = 8;

        ctx.fillStyle = colors.bg;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, logoSize / 2 + padding, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, logoSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, logoX, logoY, logoSize, logoSize);
        ctx.restore();
        resolve();
      };
      img.onerror = () => resolve(); // Skip logo on error
      img.src = logoUrl;
    });
  }

  return canvas;
}

export default QRCodeStyled;
