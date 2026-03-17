import { useEffect, useCallback, type ReactNode } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ProfileSection } from './ProfileSection';
import { ExtendedInfoSection } from './ExtendedInfoSection';
import { CustomLinksSection } from './CustomLinksSection';
import { ThemeSection } from './ThemeSection';
import { BookingSection } from './BookingSection';
import { SaveButton } from './SaveButton';
import type { CardData, PhoneEntry, LinkEntry, Address, ThemeConfig } from '@/lib/cardTypes';
import type { CoreThemeColors } from '@/lib/dittoTheme';

export interface EditorFormValues {
  // Nostr profile (kind 0) fields
  profile_display_name: string;
  profile_name: string;
  profile_about: string;
  profile_picture: string;
  profile_banner: string;
  profile_website: string;
  profile_nip05: string;
  profile_lud16: string;
  // Card config fields
  title: string;
  company: string;
  email: string;
  phone: PhoneEntry[];
  address: Address;
  links: LinkEntry[];
  booking: { url: string; label: string };
  theme: {
    mode: ThemeConfig['mode'];
    background: string;
    accent: string;
    cardStyle: ThemeConfig['cardStyle'];
    // Ditto theme fields
    dittoPresetKey?: string;
    dittoColors?: CoreThemeColors;
    dittoFont?: string;
    dittoBackground?: string;
    dittoTitle?: string;
  };
}

const DRAFT_KEY = 'keycard-editor-draft';

function getDefaultValues(cardData: CardData | undefined): EditorFormValues {
  const config = cardData?.config;

  // Profile fields always come from live cardData (never from stale draft)
  const profileFields = {
    profile_display_name: cardData?.displayName ?? '',
    profile_name: cardData?.name ?? '',
    profile_about: cardData?.about ?? '',
    profile_picture: cardData?.picture ?? '',
    profile_banner: cardData?.banner ?? '',
    profile_website: cardData?.website ?? '',
    profile_nip05: cardData?.nip05 ?? '',
    profile_lud16: cardData?.lud16 ?? '',
  };

  // Try to load card-config draft from localStorage (non-profile fields only)
  try {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      const parsed = JSON.parse(draft) as EditorFormValues;
      return { ...parsed, ...profileFields };
    }
  } catch {
    // ignore parse errors
  }

  return {
    ...profileFields,
    title: config?.title ?? '',
    company: config?.company ?? '',
    email: config?.email ?? '',
    phone: config?.phone ?? [],
    address: config?.address ?? { street: '', city: '', state: '', zip: '', country: '' },
    links: config?.links ?? [],
    booking: {
      url: config?.booking?.url ?? '',
      label: config?.booking?.label ?? '',
    },
    theme: {
      mode: config?.theme?.mode ?? 'dark',
      background: config?.theme?.background ?? '#0A0A0F',
      accent: config?.theme?.accent ?? '#8B5CF6',
      cardStyle: config?.theme?.cardStyle ?? 'solid',
    },
  };
}

interface EditorFormProps {
  cardData: CardData | undefined;
  children: ReactNode;
}

/**
 * EditorForm — wraps children in FormProvider.
 * Children get access to form context. Use EditorFormContent for the actual form fields.
 */
export function EditorForm({ cardData, children }: EditorFormProps) {
  const methods = useForm<EditorFormValues>({
    defaultValues: getDefaultValues(cardData),
  });

  // Reset form when card data loads
  // Profile fields always reset from live data; config fields only reset if no draft
  useEffect(() => {
    if (!cardData) return;
    const config = cardData.config;
    const hasDraft = !!localStorage.getItem(DRAFT_KEY);

    if (hasDraft) {
      // Just update profile fields — leave card config as drafted
      methods.setValue('profile_display_name', cardData.displayName ?? '');
      methods.setValue('profile_name', cardData.name ?? '');
      methods.setValue('profile_about', cardData.about ?? '');
      methods.setValue('profile_picture', cardData.picture ?? '');
      methods.setValue('profile_banner', cardData.banner ?? '');
      methods.setValue('profile_website', cardData.website ?? '');
      methods.setValue('profile_nip05', cardData.nip05 ?? '');
      methods.setValue('profile_lud16', cardData.lud16 ?? '');
    } else {
      methods.reset({
        profile_display_name: cardData.displayName ?? '',
        profile_name: cardData.name ?? '',
        profile_about: cardData.about ?? '',
        profile_picture: cardData.picture ?? '',
        profile_banner: cardData.banner ?? '',
        profile_website: cardData.website ?? '',
        profile_nip05: cardData.nip05 ?? '',
        profile_lud16: cardData.lud16 ?? '',
        title: config?.title ?? '',
        company: config?.company ?? '',
        email: config?.email ?? '',
        phone: config?.phone ?? [],
        address: config?.address ?? { street: '', city: '', state: '', zip: '', country: '' },
        links: config?.links ?? [],
        booking: {
          url: config?.booking?.url ?? '',
          label: config?.booking?.label ?? '',
        },
        theme: {
          mode: config?.theme?.mode ?? 'dark',
          background: config?.theme?.background ?? '#0A0A0F',
          accent: config?.theme?.accent ?? '#8B5CF6',
          cardStyle: config?.theme?.cardStyle ?? 'solid',
        },
      });
    }
  }, [cardData, methods]);

  // Auto-save draft to localStorage on changes
  const saveDraft = useCallback((values: EditorFormValues) => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
    } catch {
      // Storage full or not available
    }
  }, []);

  useEffect(() => {
    const subscription = methods.watch((values) => {
      saveDraft(values as EditorFormValues);
    });
    return () => subscription.unsubscribe();
  }, [methods, saveDraft]);

  return (
    <FormProvider {...methods}>
      {children}
    </FormProvider>
  );
}

/**
 * EditorFormContent — the actual form fields with Accordion sections.
 * Must be rendered inside an EditorForm (FormProvider).
 */
interface EditorFormContentProps {
  cardData?: CardData;
}

export function EditorFormContent({ cardData }: EditorFormContentProps = {}) {
  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
      <Accordion
        type="multiple"
        defaultValue={['profile', 'extended', 'links', 'theme', 'booking']}
        className="space-y-3"
      >
        <AccordionItem value="profile" className="rounded-xl border border-slate-200 dark:border-slate-700 px-4">
          <AccordionTrigger className="text-sm font-semibold py-3">
            Nostr Profile
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <ProfileSection />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="extended" className="rounded-xl border border-slate-200 dark:border-slate-700 px-4">
          <AccordionTrigger className="text-sm font-semibold py-3">
            Extended Info
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <ExtendedInfoSection />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="links" className="rounded-xl border border-slate-200 dark:border-slate-700 px-4">
          <AccordionTrigger className="text-sm font-semibold py-3">
            Custom Links
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <CustomLinksSection />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="theme" className="rounded-xl border border-slate-200 dark:border-slate-700 px-4">
          <AccordionTrigger className="text-sm font-semibold py-3">
            Theme
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <ThemeSection />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="booking" className="rounded-xl border border-slate-200 dark:border-slate-700 px-4">
          <AccordionTrigger className="text-sm font-semibold py-3">
            Booking
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <BookingSection />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="sticky bottom-0 bg-white/80 dark:bg-[#0A0A0F]/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-700 p-4 -mx-4 mt-6 lg:static lg:bg-transparent lg:backdrop-blur-none lg:border-0 lg:p-0 lg:mx-0">
        <SaveButton />
      </div>
    </form>
  );
}
