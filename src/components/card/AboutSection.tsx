import { useState } from 'react';
import type { CardData } from '@/lib/cardTypes';

interface AboutSectionProps {
  data: CardData;
}

export function AboutSection({ data }: AboutSectionProps) {
  const [expanded, setExpanded] = useState(false);

  if (!data.about) return null;

  const isLong = data.about.length > 300;

  return (
    <div className="px-4 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          About
        </h3>
        <p className={`text-sm leading-relaxed text-card-foreground whitespace-pre-wrap ${isLong && !expanded ? 'line-clamp-6' : ''}`}>
          {data.about}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm font-medium text-primary hover:opacity-80 mt-2 transition-opacity"
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>
    </div>
  );
}
