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

export interface EditorFormValues {
  title: string;
  company: string;
  phone: PhoneEntry[];
  address: Address;
  links: LinkEntry[];
  booking: { url: string; label: string };
  theme: {
    mode: ThemeConfig['mode'];
    background: string;
    accent: string;
    cardStyle: ThemeConfig['cardStyle'];
  };
}

const DRAFT_KEY = 'keycard-editor-draft';

function getDefaultValues(cardData: CardData | undefined): EditorFormValues {
  // Try to load draft from localStorage first
  try {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      return JSON.parse(draft) as EditorFormValues;
    }
  } catch {
    // ignore parse errors
  }

  const config = cardData?.config;
  return {
    title: config?.title ?? '',
    company: config?.company ?? '',
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

  // Reset form when card data loads (but only if no draft exists)
  useEffect(() => {
    if (cardData?.config && !localStorage.getItem(DRAFT_KEY)) {
      const config = cardData.config;
      methods.reset({
        title: config.title ?? '',
        company: config.company ?? '',
        phone: config.phone ?? [],
        address: config.address ?? { street: '', city: '', state: '', zip: '', country: '' },
        links: config.links ?? [],
        booking: {
          url: config.booking?.url ?? '',
          label: config.booking?.label ?? '',
        },
        theme: {
          mode: config.theme?.mode ?? 'dark',
          background: config.theme?.background ?? '#0A0A0F',
          accent: config.theme?.accent ?? '#8B5CF6',
          cardStyle: config.theme?.cardStyle ?? 'solid',
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
            Profile (from Nostr)
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <ProfileSection cardData={cardData} />
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
