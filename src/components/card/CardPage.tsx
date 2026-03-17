import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCardData } from '@/hooks/useCardData';
import { CardHero } from './CardHero';
import { QuickActions } from './QuickActions';
import { CardZapButton } from './ZapButton';
import { ContactInfo } from './ContactInfo';
import { AboutSection } from './AboutSection';
import { SocialLinks } from './SocialLinks';
import { BookingCard } from './BookingCard';
import { StickyToolbar } from './StickyToolbar';
import { SkeletonCard } from './SkeletonCard';
import { QRCodeOverlay } from './QRCodeOverlay';

export function CardPage() {
  const { identifier } = useParams<{ identifier: string }>();
  const { cardData, isLoading, error } = useCardData(identifier);
  const [qrOpen, setQrOpen] = useState(false);

  if (isLoading) {
    return <SkeletonCard />;
  }

  if (error || !cardData) {
    return <CardNotFound />;
  }

  // Apply theme
  const theme = cardData.config?.theme;
  const isDark = theme?.mode !== 'light';
  const bgColor = theme?.background ?? (isDark ? '#0A0A0F' : '#FFFFFF');
  const textColorClass = isDark ? 'text-white' : 'text-slate-900';
  const cardStyle = theme?.cardStyle ?? 'solid';

  const glassClasses = cardStyle === 'glass'
    ? 'backdrop-blur-xl bg-white/5 border border-white/10'
    : '';

  const gradientBg = cardStyle === 'gradient' && theme?.background
    ? `linear-gradient(to bottom, ${theme.background}, ${adjustColor(theme.background, -20)})`
    : undefined;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0A0A0F]" style={{ backgroundColor: isDark ? '#0A0A0F' : undefined }}>
      <div
        className={`mx-auto max-w-[480px] min-h-screen sm:my-8 sm:min-h-0 sm:rounded-2xl sm:shadow-2xl sm:overflow-hidden ${textColorClass} ${glassClasses}`}
        style={{
          backgroundColor: gradientBg ? undefined : bgColor,
          backgroundImage: gradientBg,
        }}
      >
        <CardHero data={cardData} />
        <QuickActions data={cardData} />
        <CardZapButton data={cardData} />
        <ContactInfo data={cardData} />
        <AboutSection data={cardData} />
        <SocialLinks data={cardData} />
        <BookingCard data={cardData} />

        {/* Footer */}
        <div className="px-4 mt-8 mb-6 pb-20 text-center">
          <p className="text-xs text-slate-400">
            Powered by{' '}
            <a href="/" className="text-violet-500 hover:underline">
              key.card
            </a>
          </p>
          <p className="text-xs text-slate-400/60 mt-1">
            Your identity. Your keys. Your card.
          </p>
        </div>

        <StickyToolbar data={cardData} onQrClick={() => setQrOpen(true)} />

        <QRCodeOverlay
          data={cardData}
          open={qrOpen}
          onOpenChange={setQrOpen}
        />
      </div>
    </div>
  );
}

function CardNotFound() {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0A0A0F] flex items-center justify-center">
      <div className="max-w-[480px] mx-auto p-8 text-center">
        <UserPlus className="w-16 h-16 text-slate-300 mx-auto" />
        <h1 className="text-xl font-bold mt-4">Card not found</h1>
        <p className="text-sm text-slate-400 mt-2">
          This Nostr identity doesn't have a profile yet.
        </p>
        <Link to="/">
          <Button className="mt-6 bg-violet-500 hover:bg-violet-600 text-white">
            Create your own card
          </Button>
        </Link>
      </div>
    </div>
  );
}

// Helper to darken a hex color for gradient
function adjustColor(hex: string, amount: number): string {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount));
  const b = Math.max(0, Math.min(255, (num & 0xff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
