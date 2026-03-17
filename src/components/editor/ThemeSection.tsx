import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { THEME_PRESETS } from '@/lib/cardTypes';
import { cn } from '@/lib/utils';
import type { EditorFormValues } from './EditorForm';

const presetEntries = Object.entries(THEME_PRESETS);
const CARD_STYLES = ['solid', 'glass', 'gradient'] as const;

export function ThemeSection() {
  const { watch, setValue } = useFormContext<EditorFormValues>();
  const background = watch('theme.background') ?? '#0A0A0F';
  const accent = watch('theme.accent') ?? '#8B5CF6';
  const cardStyle = watch('theme.cardStyle') ?? 'solid';

  const selectPreset = (key: string) => {
    const preset = THEME_PRESETS[key];
    if (!preset) return;
    setValue('theme.background', preset.background ?? '#0A0A0F', { shouldDirty: true });
    setValue('theme.accent', preset.accent ?? '#8B5CF6', { shouldDirty: true });
    setValue('theme.mode', preset.mode ?? 'dark', { shouldDirty: true });
    setValue('theme.cardStyle', preset.cardStyle ?? 'solid', { shouldDirty: true });
  };

  const isPresetActive = (key: string): boolean => {
    const preset = THEME_PRESETS[key];
    return (
      preset.background === background &&
      preset.accent === accent &&
      preset.cardStyle === cardStyle
    );
  };

  return (
    <div className="space-y-5">
      {/* Preset picker */}
      <div>
        <Label className="text-xs text-slate-500 mb-2 block">Presets</Label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {presetEntries.map(([key, preset]) => (
            <button
              key={key}
              type="button"
              onClick={() => selectPreset(key)}
              className={cn(
                'w-full aspect-square rounded-xl border-2 cursor-pointer flex flex-col items-center justify-center gap-1 transition-all',
                isPresetActive(key)
                  ? 'border-violet-500 ring-2 ring-violet-500/30'
                  : 'border-slate-200 dark:border-slate-700 hover:border-violet-300',
              )}
              style={{ backgroundColor: preset.background ?? undefined }}
            >
              <span className="text-lg">{preset.emoji}</span>
              <span className="text-[10px] font-medium" style={{ color: preset.accent ?? undefined }}>
                {preset.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom color pickers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-xs text-slate-500 mb-1.5 block">Background</Label>
          <div className="flex items-center gap-2">
            <div className="relative">
              <div
                className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700"
                style={{ backgroundColor: background }}
              />
              <input
                type="color"
                value={background}
                onChange={(e) => {
                  setValue('theme.background', e.target.value, { shouldDirty: true });
                  // Auto-detect mode from brightness
                  const hex = e.target.value.replace('#', '');
                  const r = parseInt(hex.slice(0, 2), 16);
                  const g = parseInt(hex.slice(2, 4), 16);
                  const b = parseInt(hex.slice(4, 6), 16);
                  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                  setValue('theme.mode', brightness > 128 ? 'light' : 'dark', { shouldDirty: true });
                }}
                className="absolute inset-0 opacity-0 cursor-pointer w-8 h-8"
              />
            </div>
            <Input
              value={background}
              onChange={(e) => {
                const val = e.target.value;
                if (/^#[0-9a-fA-F]{6}$/.test(val)) {
                  setValue('theme.background', val, { shouldDirty: true });
                }
              }}
              className="w-28 font-mono text-sm"
              placeholder="#0A0A0F"
            />
          </div>
        </div>
        <div>
          <Label className="text-xs text-slate-500 mb-1.5 block">Accent</Label>
          <div className="flex items-center gap-2">
            <div className="relative">
              <div
                className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700"
                style={{ backgroundColor: accent }}
              />
              <input
                type="color"
                value={accent}
                onChange={(e) => setValue('theme.accent', e.target.value, { shouldDirty: true })}
                className="absolute inset-0 opacity-0 cursor-pointer w-8 h-8"
              />
            </div>
            <Input
              value={accent}
              onChange={(e) => {
                const val = e.target.value;
                if (/^#[0-9a-fA-F]{6}$/.test(val)) {
                  setValue('theme.accent', val, { shouldDirty: true });
                }
              }}
              className="w-28 font-mono text-sm"
              placeholder="#8B5CF6"
            />
          </div>
        </div>
      </div>

      {/* Card Style */}
      <div>
        <Label className="text-xs text-slate-500 mb-2 block">Card Style</Label>
        <RadioGroup
          value={cardStyle}
          onValueChange={(val) => setValue('theme.cardStyle', val as typeof CARD_STYLES[number], { shouldDirty: true })}
          className="flex gap-4"
        >
          {CARD_STYLES.map((style) => (
            <div key={style} className="flex items-center gap-2">
              <RadioGroupItem value={style} id={`style-${style}`} />
              <Label htmlFor={`style-${style}`} className="text-sm capitalize cursor-pointer">
                {style}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
}
