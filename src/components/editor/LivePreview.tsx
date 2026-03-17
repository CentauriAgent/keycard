import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { CardHero } from '@/components/card/CardHero';
import { QuickActions } from '@/components/card/QuickActions';
import { CardZapButton } from '@/components/card/ZapButton';
import { ContactInfo } from '@/components/card/ContactInfo';
import { AboutSection } from '@/components/card/AboutSection';
import { SocialLinks } from '@/components/card/SocialLinks';
import { BookingCard } from '@/components/card/BookingCard';
import type { CardData } from '@/lib/cardTypes';
import type { EditorFormValues } from './EditorForm';

interface LivePreviewProps {
  baseCardData: CardData | undefined;
}

export function LivePreview({ baseCardData }: LivePreviewProps) {
  const { watch } = useFormContext<EditorFormValues>();
  const formValues = watch();

  // Merge form values into card data for live preview
  const previewData: CardData | undefined = useMemo(() => {
    if (!baseCardData) return undefined;

    return {
      ...baseCardData,
      config: {
        v: 1 as const,
        title: formValues.title || undefined,
        company: formValues.company || undefined,
        phone: formValues.phone?.filter((p) => p.number.trim()) || undefined,
        address: formValues.address?.street || formValues.address?.city
          ? formValues.address
          : undefined,
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

  const theme = previewData.config?.theme;
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
    <div className="w-[375px] mx-auto rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xl">
      <div
        className={`min-h-[600px] ${textColorClass} ${glassClasses}`}
        style={{
          backgroundColor: gradientBg ? undefined : bgColor,
          backgroundImage: gradientBg,
        }}
      >
        <CardHero data={previewData} />
        <QuickActions data={previewData} />
        <CardZapButton data={previewData} />
        <ContactInfo data={previewData} />
        <AboutSection data={previewData} />
        <SocialLinks data={previewData} />
        <BookingCard data={previewData} />

        <div className="px-4 mt-8 mb-6 text-center">
          <p className="text-xs text-slate-400">
            Powered by{' '}
            <span className="text-violet-500">key.card</span>
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
