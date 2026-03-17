import { useFormContext } from 'react-hook-form';
import { AlertTriangle, Trash2, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { EditorFormValues } from './EditorForm';

const PHONE_TYPES = ['mobile', 'work', 'home', 'fax', 'other'] as const;

export function ExtendedInfoSection() {
  const { register, watch, setValue } = useFormContext<EditorFormValues>();
  const phones = watch('phone') ?? [];

  const addPhone = () => {
    if (phones.length >= 3) return;
    setValue('phone', [...phones, { type: 'mobile', number: '' }], { shouldDirty: true });
  };

  const removePhone = (index: number) => {
    const updated = phones.filter((_, i) => i !== index);
    setValue('phone', updated, { shouldDirty: true });
  };

  const updatePhoneType = (index: number, type: string) => {
    const updated = [...phones];
    updated[index] = { ...updated[index], type: type as typeof PHONE_TYPES[number] };
    setValue('phone', updated, { shouldDirty: true });
  };

  return (
    <div className="space-y-4">
      {/* Job Title & Company */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="title" className="text-xs text-slate-500">Job Title</Label>
          <Input
            id="title"
            {...register('title')}
            placeholder="Developer Relations"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="company" className="text-xs text-slate-500">Company</Label>
          <Input
            id="company"
            {...register('company')}
            placeholder="Soapbox Technology"
            className="mt-1"
          />
        </div>
      </div>

      {/* Privacy Warning */}
      <Alert className="border-amber-500/50 bg-amber-500/10">
        <AlertTriangle className="w-4 h-4 text-amber-500" />
        <AlertTitle className="text-sm font-semibold text-amber-600 dark:text-amber-400">
          Privacy Notice
        </AlertTitle>
        <AlertDescription className="text-xs text-amber-600/80 dark:text-amber-400/80">
          Phone numbers and addresses are published to Nostr relays and visible to anyone.
          Only add info you&apos;re comfortable sharing publicly.
        </AlertDescription>
      </Alert>

      {/* Phone Numbers */}
      <div className="space-y-2">
        <Label className="text-xs text-slate-500">Phone Numbers</Label>
        {phones.map((phone, index) => (
          <div key={index} className="flex items-center gap-2">
            <Select
              value={phone.type}
              onValueChange={(val) => updatePhoneType(index, val)}
            >
              <SelectTrigger className="w-[110px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PHONE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="tel"
              value={phone.number}
              onChange={(e) => {
                const updated = [...phones];
                updated[index] = { ...updated[index], number: e.target.value };
                setValue('phone', updated, { shouldDirty: true });
              }}
              placeholder="+1-555-123-4567"
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removePhone(index)}
              className="text-red-400 hover:text-red-500 shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        {phones.length < 3 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addPhone}
            className="text-violet-500 hover:text-violet-600"
          >
            <Plus className="w-4 h-4 mr-1" /> Add phone
          </Button>
        )}
      </div>

      {/* Address */}
      <div className="space-y-3">
        <Label className="text-xs text-slate-500">Address</Label>
        <Input
          {...register('address.street')}
          placeholder="123 Freedom Lane"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <Input
            {...register('address.city')}
            placeholder="City"
          />
          <Input
            {...register('address.state')}
            placeholder="State"
          />
          <Input
            {...register('address.zip')}
            placeholder="ZIP"
            className="col-span-2 sm:col-span-1"
          />
        </div>
        <Input
          {...register('address.country')}
          placeholder="Country"
        />
      </div>
    </div>
  );
}
