import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { themePresets } from '@/lib/dittoTheme';
import { hslStringToHex, hslToCss } from '@/lib/colorUtils';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useDittoTheme } from '@/hooks/useDittoTheme';
import type { EditorFormValues } from './EditorForm';

const featuredPresets = Object.entries(themePresets).filter(([, p]) => p.featured);
const otherPresets = Object.entries(themePresets).filter(([, p]) => !p.featured);

export function ThemeSection() {
  const { watch, setValue } = useFormContext<EditorFormValues>();
  const dittoPresetKey = watch('theme.dittoPresetKey');
  const { user } = useCurrentUser();
  const { data: activeTheme } = useDittoTheme(user?.pubkey);

  // When the user's active kind 16767 loads and no preset is already selected,
  // pre-select the matching preset (or mark as "custom Ditto theme")
  useEffect(() => {
    if (!activeTheme || dittoPresetKey !== undefined) return;

    // Try to match against a known preset by sourceRef d-tag
    const sourceRef = activeTheme.sourceRef;
    if (sourceRef) {
      // sourceRef format: "36767:pubkey:identifier" — extract identifier
      const identifier = sourceRef.split(':')[2];
      if (identifier && themePresets[identifier]) {
        setValue('theme.dittoPresetKey', identifier, { shouldDirty: false });
        setValue('theme.dittoColors', activeTheme.colors, { shouldDirty: false });
        setValue('theme.dittoFont', activeTheme.font?.family ?? '', { shouldDirty: false });
        setValue('theme.dittoBackground', activeTheme.background?.url ?? '', { shouldDirty: false });
        setValue('theme.dittoTitle', themePresets[identifier].label, { shouldDirty: false });
        return;
      }
    }
    // No matching preset — mark as custom active theme
    setValue('theme.dittoPresetKey', '__active__', { shouldDirty: false });
    setValue('theme.dittoColors', activeTheme.colors, { shouldDirty: false });
    setValue('theme.dittoFont', activeTheme.font?.family ?? '', { shouldDirty: false });
    setValue('theme.dittoBackground', activeTheme.background?.url ?? '', { shouldDirty: false });
    setValue('theme.dittoTitle', 'Your Active Theme', { shouldDirty: false });
  }, [activeTheme, dittoPresetKey, setValue]);

  const selectPreset = (key: string) => {
    const preset = themePresets[key];
    if (!preset) return;

    // Store Ditto theme data
    setValue('theme.dittoPresetKey', key, { shouldDirty: true });
    setValue('theme.dittoColors', preset.colors, { shouldDirty: true });
    setValue('theme.dittoFont', preset.font?.family ?? '', { shouldDirty: true });
    setValue('theme.dittoBackground', preset.background?.url ?? '', { shouldDirty: true });
    setValue('theme.dittoTitle', preset.label, { shouldDirty: true });

    // Also update the legacy fields for backward compat
    const bgHex = hslStringToHex(preset.colors.background);
    const accentHex = hslStringToHex(preset.colors.primary);
    setValue('theme.background', bgHex, { shouldDirty: true });
    setValue('theme.accent', accentHex, { shouldDirty: true });

    // Auto-detect dark/light
    const { l } = (() => {
      const parts = preset.colors.background.trim().replace(/%/g, '').split(/\s+/).map(Number);
      return { h: parts[0], s: parts[1], l: parts[2] };
    })();
    setValue('theme.mode', l < 50 ? 'dark' : 'light', { shouldDirty: true });
  };

  const clearDittoTheme = () => {
    setValue('theme.dittoPresetKey', undefined, { shouldDirty: true });
    setValue('theme.dittoColors', undefined, { shouldDirty: true });
    setValue('theme.dittoFont', '', { shouldDirty: true });
    setValue('theme.dittoBackground', '', { shouldDirty: true });
    setValue('theme.dittoTitle', '', { shouldDirty: true });
  };

  const activeDittoColors = watch('theme.dittoColors');
  const activeDittoBg = watch('theme.dittoBackground');

  return (
    <div className="space-y-5">
      {/* Active custom theme (not a named preset) */}
      {dittoPresetKey === '__active__' && activeDittoColors && (
        <div>
          <Label className="text-xs text-slate-500 mb-2 block">Your Active Theme</Label>
          <div
            className="w-full h-16 rounded-xl border-2 border-violet-500 ring-2 ring-violet-500/30 flex items-center gap-3 px-4"
            style={{
              backgroundColor: hslToCss(activeDittoColors.background),
              backgroundImage: activeDittoBg ? `url(${activeDittoBg})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="w-6 h-6 rounded-full border-2 border-white/30" style={{ backgroundColor: hslToCss(activeDittoColors.primary) }} />
            <span className="text-sm font-semibold drop-shadow" style={{ color: hslToCss(activeDittoColors.text) }}>
              Your Active Theme
            </span>
          </div>
        </div>
      )}

      {/* Featured Presets */}
      <div>
        <Label className="text-xs text-slate-500 mb-2 block">Featured Themes</Label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {featuredPresets.map(([key, preset]) => (
            <button
              key={key}
              type="button"
              onClick={() => selectPreset(key)}
              className={cn(
                'relative w-full aspect-[4/3] rounded-xl border-2 cursor-pointer overflow-hidden transition-all',
                dittoPresetKey === key
                  ? 'border-violet-500 ring-2 ring-violet-500/30 scale-[1.02]'
                  : 'border-slate-200 dark:border-slate-700 hover:border-violet-300 hover:scale-[1.01]',
              )}
              style={{
                backgroundColor: hslToCss(preset.colors.background),
                backgroundImage: preset.background?.url ? `url(${preset.background.url})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
                <span className="text-lg drop-shadow-md">{preset.emoji}</span>
                <span
                  className="text-[10px] font-semibold drop-shadow-md"
                  style={{ color: hslToCss(preset.colors.text) }}
                >
                  {preset.label}
                </span>
              </div>
              {/* Accent dot */}
              <div
                className="absolute bottom-1.5 right-1.5 w-3 h-3 rounded-full border border-white/30"
                style={{ backgroundColor: hslToCss(preset.colors.primary) }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Other Presets */}
      {otherPresets.length > 0 && (
        <div>
          <Label className="text-xs text-slate-500 mb-2 block">More Themes</Label>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {otherPresets.map(([key, preset]) => (
              <button
                key={key}
                type="button"
                onClick={() => selectPreset(key)}
                className={cn(
                  'w-full aspect-square rounded-lg border-2 cursor-pointer flex flex-col items-center justify-center gap-0.5 transition-all',
                  dittoPresetKey === key
                    ? 'border-violet-500 ring-2 ring-violet-500/30'
                    : 'border-slate-200 dark:border-slate-700 hover:border-violet-300',
                )}
                style={{ backgroundColor: hslToCss(preset.colors.background) }}
              >
                <span className="text-sm">{preset.emoji}</span>
                <span className="text-[8px] font-medium" style={{ color: hslToCss(preset.colors.text) }}>
                  {preset.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active theme info */}
      {dittoPresetKey && themePresets[dittoPresetKey] && (
        <div className="flex items-center justify-between bg-violet-50 dark:bg-violet-950/30 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{themePresets[dittoPresetKey].emoji}</span>
            <div>
              <p className="text-sm font-semibold">{themePresets[dittoPresetKey].label}</p>
              {themePresets[dittoPresetKey].font && (
                <p className="text-xs text-slate-500">Font: {themePresets[dittoPresetKey].font!.family}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={clearDittoTheme}
            className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline"
          >
            Clear
          </button>
        </div>
      )}

      <p className="text-xs text-slate-400">
        Themes are published to Nostr as a kind 16767 event, compatible with Ditto&apos;s theme system.
      </p>
    </div>
  );
}
