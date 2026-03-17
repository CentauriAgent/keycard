import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CardData } from '@/lib/cardTypes';

interface BookingCardProps {
  data: CardData;
}

export function BookingCard({ data }: BookingCardProps) {
  const booking = data.config?.booking;
  if (!booking?.url) return null;

  return (
    <div className="px-4 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-3 mb-3">
          <Calendar className="w-5 h-5 text-primary" />
          <div>
            <h3 className="text-sm font-semibold text-card-foreground">
              {booking.label ?? 'Schedule a Meeting'}
            </h3>
            <p className="text-xs text-muted-foreground">Book a time</p>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full rounded-lg border-border text-card-foreground hover:bg-muted"
          onClick={() => window.open(booking.url, '_blank')}
        >
          Open Calendar →
        </Button>
      </div>
    </div>
  );
}
