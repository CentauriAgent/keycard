import { useState, useLayoutEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCardData } from '@/hooks/useCardData';
import { useDittoTheme } from '@/hooks/useDittoTheme';
import { buildThemeCssFromCore, isDarkTheme } from '@/lib/colorUtils';
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

/** Build a Google Fonts CSS URL for a given font family */
function googleFontUrl(family: string): string {
  return `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@400;500;600;700&display=swap`;
}

export function CardPage() {
  const { identifier } = useParams<{ identifier: string }>();
  const { cardData, isLoading, error } = useCardData(identifier);
  const { data: dittoTheme } = useDittoTheme(cardData?.pubkey);
  const [qrOpen, setQrOpen] = useState(false);

  /**
   * Inject theme CSS tokens + background into the page — same approach as Ditto's ProfilePage.
   * We inject onto :root so all Tailwind utility classes (bg-card, text-foreground, etc.)
   * automatically use the profile owner's theme. No manual color props needed.
   */
  useLayoutEffect(() => {
    if (!dittoTheme?.colors) return;

    const { colors, font, background } = dittoTheme;

    // 1. Inject CSS custom properties onto :root
    const css = buildThemeCssFromCore(colors.background, colors.text, colors.primary);
    let styleEl = document.getElementById('keycard-theme-vars') as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'keycard-theme-vars';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = css;

    // 2. Load custom font
    if (font?.family) {
      const linkId = `keycard-font-${font.family.replace(/\s+/g, '-')}`;
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = font.url || googleFontUrl(font.family);
        document.head.appendChild(link);
      }
      document.documentElement.style.fontFamily = `"${font.family}", sans-serif`;
    }

    // 3. Apply background image to body
    if (background?.url) {
      document.body.style.backgroundImage = `url("${background.url}")`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundRepeat = 'no-repeat';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundAttachment = 'fixed';
    }

    // Cleanup: restore default styles when navigating away
    return () => {
      document.getElementById('keycard-theme-vars')?.remove();
      document.documentElement.style.fontFamily = '';
      document.body.style.backgroundImage = '';
      document.body.style.backgroundSize = '';
      document.body.style.backgroundRepeat = '';
      document.body.style.backgroundPosition = '';
      document.body.style.backgroundAttachment = '';
    };
  }, [dittoTheme]);

  if (isLoading) return <SkeletonCard />;
  if (error || !cardData) return <CardNotFound />;

  // ─── Resolve effective theme values ──────────────────────────────────
  const hasDittoTheme = !!dittoTheme?.colors;
  const configTheme = cardData.config?.theme;

  // When Ditto theme is active, CSS tokens handle everything.
  // For config theme (old path), compute values manually.
  let bgColor: string;
  let isDark: boolean;
  let accentColor: string;

  if (hasDittoTheme) {
    bgColor = `hsl(${dittoTheme.colors.background})`;
    isDark = isDarkTheme(dittoTheme.colors.background);
    accentColor = `hsl(${dittoTheme.colors.primary})`;
  } else {
    isDark = configTheme?.mode !== 'light';
    bgColor = configTheme?.background ?? (isDark ? '#0A0A0F' : '#FFFFFF');
    accentColor = configTheme?.accent ?? '#8B5CF6';
  }

  const cardStyle = configTheme?.cardStyle ?? 'solid';
  const glassClasses = !hasDittoTheme && cardStyle === 'glass'
    ? 'backdrop-blur-xl bg-white/5 border border-white/10'
    : '';
  const gradientBg = !hasDittoTheme && cardStyle === 'gradient' && configTheme?.background
    ? `linear-gradient(to bottom, ${configTheme.background}, ${adjustColor(configTheme.background, -20)})`
    : undefined;

  // When Ditto theme is active: the card container is transparent so the body
  // background image shows through. bg-card token (from CSS vars) provides the
  // subtle card surface color for content sections automatically.
  const outerBg = hasDittoTheme ? 'transparent' : bgColor;
  const cardInnerStyle = hasDittoTheme
    ? { fontFamily: dittoTheme.font?.family ? `"${dittoTheme.font.family}", sans-serif` : undefined }
    : { backgroundColor: gradientBg ? undefined : bgColor, backgroundImage: gradientBg ?? undefined };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: outerBg }}
    >
      <div
        className={`mx-auto max-w-[480px] min-h-screen sm:my-8 sm:min-h-0 sm:rounded-2xl sm:shadow-2xl sm:overflow-hidden ${hasDittoTheme ? 'text-foreground' : isDark ? 'text-white' : 'text-slate-900'} ${glassClasses}`}
        style={cardInnerStyle}
      >
        <CardHero data={cardData} accentColor={accentColor} />
        <QuickActions data={cardData} accentColor={accentColor} />
        <CardZapButton data={cardData} accentColor={accentColor} />
        <ContactInfo data={cardData} />
        <AboutSection data={cardData} />
        <SocialLinks data={cardData} accentColor={accentColor} />
        <BookingCard data={cardData} />

        <div className="px-4 mt-8 mb-6 text-center" style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}>
          <p className="text-xs text-muted-foreground">
            Powered by{' '}
            <a href="/" style={{ color: accentColor }} className="hover:underline">
              key.card
            </a>
          </p>
          <p className="text-xs text-muted-foreground/50 mt-1">
            Your identity. Your keys. Your card.
          </p>
        </div>
      </div>

      <StickyToolbar data={cardData} onQrClick={() => setQrOpen(true)} />
      <QRCodeOverlay data={cardData} open={qrOpen} onOpenChange={setQrOpen} />
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

function adjustColor(hex: string, amount: number): string {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount));
  const b = Math.max(0, Math.min(255, (num & 0xff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
