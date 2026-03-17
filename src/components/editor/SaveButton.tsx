import { useFormContext } from 'react-hook-form';
import { Send, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePublishCard } from '@/hooks/usePublishCard';
import { useToast } from '@/hooks/useToast';
import type { KeyCardConfig } from '@/lib/cardTypes';
import type { EditorFormValues } from './EditorForm';

export function SaveButton() {
  const { formState: { isDirty }, getValues } = useFormContext<EditorFormValues>();
  const publishCard = usePublishCard();
  const { toast } = useToast();

  const handlePublish = async () => {
    const values = getValues();

    const config: KeyCardConfig = {
      v: 1,
      title: values.title || undefined,
      company: values.company || undefined,
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
      await publishCard.mutateAsync({ config });
      toast({
        title: 'Card published! 🎉',
        description: 'Your card is now live on Nostr relays.',
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
  const isPending = publishCard.isPending;

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
