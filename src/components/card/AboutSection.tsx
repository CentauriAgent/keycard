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
      <div className="rounded-xl border border-slate-200 dark:border-[#2D2D44] p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          About
        </h3>

        <p
          className={`text-sm leading-relaxed text-slate-700 dark:text-slate-300 ${
            isLong && !expanded ? 'line-clamp-6' : ''
          }`}
        >
          {data.about}
        </p>

        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm font-medium text-violet-500 hover:text-violet-600 mt-2 transition-colors"
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>
    </div>
  );
}
