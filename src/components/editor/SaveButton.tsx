import { useFormContext } from 'react-hook-form';
import { Send, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePublishCard } from '@/hooks/usePublishCard';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useToast } from '@/hooks/useToast';
import { ACTIVE_THEME_KIND, buildActiveThemeTags, themePresets } from '@/lib/dittoTheme';
import type { KeyCardConfig } from '@/lib/cardTypes';
import type { EditorFormValues } from './EditorForm';

export function SaveButton() {
  const { formState: { isDirty }, getValues } = useFormContext<EditorFormValues>();
  const publishCard = usePublishCard();
  const nostrPublish = useNostrPublish();
  const { toast } = useToast();

  const handlePublish = async () => {
    const values = getValues();

    const config: KeyCardConfig = {
      v: 1,
      title: values.title || undefined,
      company: values.company || undefined,
      email: values.email || undefined,
      phone: values.phone?.filter((p) => p.number.trim()) || undefined,
      address: values.address?.street || values.address?.city
        ? values.address
        : undefined,
      links: values.links?.filter((l) => l.label.trim() && l.url.trim()) || undefined,
      booking: values.booking?.url
        ? { url: values.booking.url, label: values.booking.label || undefined }
        : undefined,
      theme: {
        mode: values.theme?.mode ?? 'dark',
        background: values.theme?.background ?? '#0A0A0F',
        accent: values.theme?.accent ?? '#8B5CF6',
        cardStyle: values.theme?.cardStyle ?? 'solid',
      },
    };

    try {
      // Publish kind:30078 card config
      await publishCard.mutateAsync({ config });

      // If a Ditto theme is selected, also publish kind 16767
      const dittoColors = values.theme?.dittoColors;
      const dittoPresetKey = values.theme?.dittoPresetKey;

      if (dittoColors && dittoPresetKey) {
        const preset = themePresets[dittoPresetKey];
        const tags = buildActiveThemeTags({
          title: values.theme?.dittoTitle || preset?.label,
          colors: dittoColors,
          font: values.theme?.dittoFont ? { family: values.theme.dittoFont } : preset?.font,
          background: values.theme?.dittoBackground
            ? { url: values.theme.dittoBackground, mode: 'cover' }
            : preset?.background,
        });

        await nostrPublish.mutateAsync({
          kind: ACTIVE_THEME_KIND,
          content: '',
          tags,
          created_at: Math.floor(Date.now() / 1000),
        });
      }

      toast({
        title: 'Card published! 🎉',
        description: dittoColors
          ? 'Your card and Ditto theme are now live on Nostr relays.'
          : 'Your card is now live on Nostr relays.',
      });
      // Clear localStorage draft
      localStorage.removeItem('keycard-editor-draft');
    } catch (err) {
      toast({
        title: 'Failed to publish',
        description: err instanceof Error ? err.message : 'Something went wrong.',
        variant: 'destructive',
      });
    }
  };

  const isSuccess = publishCard.isSuccess;
  const isPending = publishCard.isPending || nostrPublish.isPending;

  return (
    <Button
      type="button"
      onClick={handlePublish}
      disabled={isPending || (!isDirty && !isSuccess)}
      className="w-full h-12 bg-violet-500 hover:bg-violet-600 text-white shadow-lg shadow-violet-500/25 rounded-xl"
    >
      {isPending ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Publishing…
        </>
      ) : isSuccess ? (
        <>
          <CheckCircle className="w-4 h-4 mr-2" />
          Published!
        </>
      ) : (
        <>
          <Send className="w-4 h-4 mr-2" />
          Save &amp; Publish
        </>
      )}
    </Button>
  );
}
