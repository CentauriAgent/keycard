import { useEffect, useRef, useCallback } from 'react';
import QRCodeLib from 'qrcode';

export interface QRCodeProps {
  /** The string to encode in the QR code */
  value: string;
  /** Size in pixels (default: 256) */
  size?: number;
  /** Foreground color (default: #000000) */
  fgColor?: string;
  /** Background color (default: #FFFFFF) */
  bgColor?: string;
  /** Error correction level (default: H for logo overlay support) */
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  /** Additional CSS class */
  className?: string;
}

/**
 * Core QR code component — renders onto an HTML canvas.
 * Supports color customization and provides ref access for download.
 */
export function QRCode({
  value,
  size = 256,
  fgColor = '#000000',
  bgColor = '#FFFFFF',
  errorCorrectionLevel = 'H',
  className,
}: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    QRCodeLib.toCanvas(canvas, value, {
      width: size,
      margin: 2,
      errorCorrectionLevel,
      color: { dark: fgColor, light: bgColor },
    }).catch(console.error);
  }, [value, size, fgColor, bgColor, errorCorrectionLevel]);

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
 * Renders a QR code to an offscreen canvas and returns it.
 * Useful for download/export at arbitrary resolution.
 */
export async function renderQRToCanvas(
  value: string,
  size: number = 1024,
  fgColor: string = '#000000',
  bgColor: string = '#FFFFFF',
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  await QRCodeLib.toCanvas(canvas, value, {
    width: size,
    margin: 2,
    errorCorrectionLevel: 'H',
    color: { dark: fgColor, light: bgColor },
  });
  return canvas;
}

/**
 * Hook that provides a stable `getCanvas` callback for the current QR ref.
 */
export function useQRCanvas(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  return useCallback(() => canvasRef.current, [canvasRef]);
}

export default QRCode;
