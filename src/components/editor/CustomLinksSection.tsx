import { useFormContext } from 'react-hook-form';
import { Trash2, Plus, GripVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { EditorFormValues } from './EditorForm';

const ICON_OPTIONS = [
  { value: 'link', label: 'Link' },
  { value: 'github', label: 'GitHub' },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'globe', label: 'Website' },
  { value: 'podcast', label: 'Podcast' },
  { value: 'mail', label: 'Email' },
  { value: 'calendar', label: 'Calendar' },
  { value: 'file', label: 'Document' },
  { value: 'nostr', label: 'Nostr' },
  { value: 'bitcoin', label: 'Bitcoin' },
] as const;

const MAX_LINKS = 20;
const WARN_THRESHOLD = 15;

export function CustomLinksSection() {
  const { watch, setValue } = useFormContext<EditorFormValues>();
  const links = watch('links') ?? [];

  const addLink = () => {
    if (links.length >= MAX_LINKS) return;
    setValue('links', [...links, { label: '', url: '', icon: 'link' }], { shouldDirty: true });
  };

  const removeLink = (index: number) => {
    const updated = links.filter((_, i) => i !== index);
    setValue('links', updated, { shouldDirty: true });
  };

  const updateLink = (index: number, field: 'label' | 'url' | 'icon', value: string) => {
    const updated = [...links];
    updated[index] = { ...updated[index], [field]: value };
    setValue('links', updated, { shouldDirty: true });
  };

  const moveLink = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= links.length) return;
    const updated = [...links];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setValue('links', updated, { shouldDirty: true });
  };

  return (
    <div className="space-y-3">
      {links.length >= WARN_THRESHOLD && links.length < MAX_LINKS && (
        <p className="text-xs text-amber-500">
          {MAX_LINKS - links.length} link{MAX_LINKS - links.length === 1 ? '' : 's'} remaining
        </p>
      )}

      {links.map((link, index) => (
        <div key={index} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="cursor-grab text-slate-400 hover:text-slate-600 shrink-0"
              onClick={() => moveLink(index, -1)}
              disabled={index === 0}
              title="Move up"
            >
              <GripVertical className="w-4 h-4" />
            </button>
            <Select
              value={link.icon ?? 'link'}
              onValueChange={(val) => updateLink(index, 'icon', val)}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ICON_OPTIONS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={link.label}
              onChange={(e) => updateLink(index, 'label', e.target.value)}
              placeholder="Label"
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeLink(index)}
              className="text-red-400 hover:text-red-500 shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <div className="pl-6">
            <Label className="text-xs text-slate-500">URL</Label>
            <Input
              type="url"
              value={link.url}
              onChange={(e) => updateLink(index, 'url', e.target.value)}
              placeholder="https://github.com/username"
              className="mt-1"
            />
          </div>
        </div>
      ))}

      {links.length < MAX_LINKS && (
        <Button
          type="button"
          variant="outline"
          onClick={addLink}
          className="w-full border-dashed"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Link
        </Button>
      )}
    </div>
  );
}
