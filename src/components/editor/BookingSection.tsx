import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { EditorFormValues } from './EditorForm';

export function BookingSection() {
  const { register } = useFormContext<EditorFormValues>();

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="booking-url" className="text-xs text-slate-500">Booking URL</Label>
        <Input
          id="booking-url"
          type="url"
          {...register('booking.url')}
          placeholder="https://cal.com/yourname"
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="booking-label" className="text-xs text-slate-500">Button Label</Label>
        <Input
          id="booking-label"
          {...register('booking.label')}
          placeholder="Book a Meeting"
          className="mt-1"
        />
      </div>
    </div>
  );
}
