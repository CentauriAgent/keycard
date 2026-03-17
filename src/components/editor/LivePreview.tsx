import { useMemo, useLayoutEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { CardHero } from '@/components/card/CardHero';
import { QuickActions } from '@/components/card/QuickActions';
import { CardZapButton } from '@/components/card/ZapButton';
import { ContactInfo } from '@/components/card/ContactInfo';
import { AboutSection } from '@/components/card/AboutSection';
import { SocialLinks } from '@/components/card/SocialLinks';
import { BookingCard } from '@/components/card/BookingCard';
import { buildThemeCssFromCore, isDarkTheme } from '@/lib/colorUtils';
import type { CardData } from '@/lib/cardTypes';
import type { CoreThemeColors } from '@/lib/dittoTheme';
import type { EditorFormValues } from './EditorForm';

interface LivePreviewProps {
  baseCardData: CardData | undefined;
}

function googleFontUrl(family: string): string {
  return `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@400;500;600;700&display=swap`;
}

export function LivePreview({ baseCardData }: LivePreviewProps) {
  const { watch } = useFormContext<EditorFormValues>();
  const formValues = watch();
  const previewRef = useRef<HTMLDivElement>(null);

  // Ditto theme from form
  const dittoColors: CoreThemeColors | undefined = formValues.theme?.dittoColors;
  const dittoFont: string = formValues.theme?.dittoFont ?? '';
  const dittoBackground: string = formValues.theme?.dittoBackground ?? '';
  const hasDittoTheme = !!dittoColors;

  // Inject Ditto theme CSS tokens into the preview container via a scoped <style>
  useLayoutEffect(() => {
    const el = previewRef.current;
    if (!el || !dittoColors) return;

    // Build CSS scoped to the preview container
    const tokens = buildThemeCssFromCore(dittoColors.background, dittoColors.text, dittoColors.primary);
    // Scope to preview container by replacing :root with our selector
    const scopedId = 'keycard-preview-theme';
    let styleEl = document.getElementById(scopedId) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = scopedId;
      document.head.appendChild(styleEl);
    }
    // Use a data attribute as selector hook
    el.setAttribute('data-keycard-preview', 'true');
    styleEl.textContent = tokens.replace(':root', '[data-keycard-preview="true"]');

    // Load font
    if (dittoFont) {
      const linkId = `preview-font-${dittoFont.replace(/\s+/g, '-')}`;
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = googleFontUrl(dittoFont);
        document.head.appendChild(link);
      }
    }

    return () => {
      document.getElementById(scopedId)?.remove();
      el.removeAttribute('data-keycard-preview');
    };
  }, [dittoColors, dittoFont]);

  const previewData: CardData | undefined = useMemo(() => {
    if (!baseCardData) return undefined;
    return {
      ...baseCardData,
      displayName: formValues.profile_display_name || baseCardData.displayName,
      name: formValues.profile_name || baseCardData.name,
      about: formValues.profile_about || baseCardData.about,
      picture: formValues.profile_picture || baseCardData.picture,
      banner: formValues.profile_banner || baseCardData.banner,
      website: formValues.profile_website || baseCardData.website,
      nip05: formValues.profile_nip05 || baseCardData.nip05,
      lud16: formValues.profile_lud16 || baseCardData.lud16,
      config: {
        v: 1 as const,
        title: formValues.title || undefined,
        company: formValues.company || undefined,
        email: formValues.email || undefined,
        phone: formValues.phone?.filter((p) => p.number.trim()) || undefined,
        address: formValues.address?.street || formValues.address?.city ? formValues.address : undefined,
        links: formValues.links?.filter((l) => l.label.trim() && l.url.trim()) || undefined,
        booking: formValues.booking?.url
          ? { url: formValues.booking.url, label: formValues.booking.label || undefined }
          : undefined,
        theme: {
          mode: formValues.theme?.mode ?? 'dark',
          background: formValues.theme?.background ?? '#0A0A0F',
          accent: formValues.theme?.accent ?? '#8B5CF6',
          cardStyle: formValues.theme?.cardStyle ?? 'solid',
        },
      },
    };
  }, [baseCardData, formValues]);

  if (!previewData) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-slate-400">
        Loading preview…
      </div>
    );
  }

  // Resolve display values
  const configTheme = previewData.config?.theme;
  let bgColor: string;
  let accentColor: string;
  let isDark: boolean;

  if (hasDittoTheme && dittoColors) {
    bgColor = `hsl(${dittoColors.background})`;
    accentColor = `hsl(${dittoColors.primary})`;
    isDark = isDarkTheme(dittoColors.background);
  } else {
    isDark = configTheme?.mode !== 'light';
    bgColor = configTheme?.background ?? (isDark ? '#0A0A0F' : '#FFFFFF');
    accentColor = configTheme?.accent ?? '#8B5CF6';
  }

  const cardStyle = configTheme?.cardStyle ?? 'solid';
  const glassClasses = !hasDittoTheme && cardStyle === 'glass' ? 'backdrop-blur-xl bg-white/5 border border-white/10' : '';
  const gradientBg = !hasDittoTheme && cardStyle === 'gradient' && configTheme?.background
    ? `linear-gradient(to bottom, ${configTheme.background}, ${adjustColor(configTheme.background, -20)})`
    : undefined;

  return (
    <div className="w-[375px] mx-auto rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xl">
      <div
        ref={previewRef}
        className={`min-h-[600px] ${hasDittoTheme ? 'text-foreground' : isDark ? 'text-white' : 'text-slate-900'} ${glassClasses}`}
        style={{
          backgroundColor: hasDittoTheme ? bgColor : (gradientBg ? undefined : bgColor),
          backgroundImage: hasDittoTheme
            ? (dittoBackground ? `url(${dittoBackground})` : undefined)
            : (gradientBg ?? undefined),
          backgroundSize: hasDittoTheme && dittoBackground ? 'cover' : undefined,
          backgroundPosition: hasDittoTheme && dittoBackground ? 'center' : undefined,
          backgroundRepeat: hasDittoTheme && dittoBackground ? 'no-repeat' : undefined,
          fontFamily: dittoFont ? `"${dittoFont}", sans-serif` : undefined,
        }}
      >
        <CardHero data={previewData} accentColor={accentColor} />
        <QuickActions data={previewData} accentColor={accentColor} />
        <CardZapButton data={previewData} accentColor={accentColor} />
        <ContactInfo data={previewData} />
        <AboutSection data={previewData} />
        <SocialLinks data={previewData} accentColor={accentColor} />
        <BookingCard data={previewData} />

        <div className="px-4 mt-8 pb-6 text-center">
          <p className="text-xs text-muted-foreground">
            Powered by <span style={{ color: accentColor }}>key.card</span>
          </p>
        </div>
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
