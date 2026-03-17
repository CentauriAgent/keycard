import { useRef } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Upload } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useUploadFile } from '@/hooks/useUploadFile';
import { useToast } from '@/hooks/useToast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { EditorFormValues } from './EditorForm';

export function ProfileSection() {
  const queryClient = useQueryClient();
  const { user, metadata } = useCurrentUser();
  const { mutateAsync: publishEvent, isPending } = useNostrPublish();
  const { mutateAsync: uploadFile, isPending: isUploading } = useUploadFile();
  const { toast } = useToast();

  const { register, watch, setValue, handleSubmit } = useFormContext<EditorFormValues>();

  const picture = watch('profile_picture');
  const banner = watch('profile_banner');
  const displayName = watch('profile_display_name') || watch('profile_name') || '';

  const handleUpload = async (file: File, field: 'profile_picture' | 'profile_banner') => {
    try {
      const [[, url]] = await uploadFile(file);
      setValue(field, url);
      toast({ title: 'Uploaded!', description: `${field === 'profile_picture' ? 'Profile picture' : 'Banner'} updated` });
    } catch {
      toast({ title: 'Upload failed', description: 'Please try again', variant: 'destructive' });
    }
  };

  const onSaveProfile = async (values: EditorFormValues) => {
    if (!user) {
      toast({ title: 'Not logged in', variant: 'destructive' });
      return;
    }

    try {
      // Merge with existing metadata so we don't lose unknown fields
      const data: Record<string, unknown> = {
        ...metadata,
        display_name: values.profile_display_name || undefined,
        name: values.profile_name || undefined,
        about: values.profile_about || undefined,
        picture: values.profile_picture || undefined,
        banner: values.profile_banner || undefined,
        website: values.profile_website || undefined,
        nip05: values.profile_nip05 || undefined,
        lud16: values.profile_lud16 || undefined,
      };

      // Strip undefined/empty
      for (const key of Object.keys(data)) {
        if (data[key] === undefined || data[key] === '') delete data[key];
      }

      await publishEvent({ kind: 0, content: JSON.stringify(data) });

      queryClient.invalidateQueries({ queryKey: ['logins'] });
      queryClient.invalidateQueries({ queryKey: ['nostr', 'author', user.pubkey] });

      toast({ title: 'Profile saved!', description: 'Your Nostr profile has been updated' });
    } catch {
      toast({ title: 'Save failed', description: 'Please try again', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-5">
      {/* Avatar preview */}
      <div className="flex items-center gap-4">
        <Avatar className="w-16 h-16 ring-2 ring-slate-200 dark:ring-slate-700">
          <AvatarImage src={picture} alt={displayName} className="object-cover" />
          <AvatarFallback className="bg-violet-500 text-white text-lg font-bold">
            {displayName?.[0]?.toUpperCase() ?? '?'}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{displayName || 'No name set'}</p>
          <p className="text-xs text-slate-400 mt-0.5">Preview updates live →</p>
        </div>
      </div>

      {/* Display name */}
      <Field label="Display Name">
        <Input placeholder="Your display name" {...register('profile_display_name')} />
      </Field>

      {/* Username */}
      <Field label="Username" hint="Short handle, no spaces">
        <Input placeholder="username" {...register('profile_name')} />
      </Field>

      {/* Bio */}
      <Field label="Bio">
        <Textarea
          placeholder="Tell others about yourself"
          rows={3}
          className="resize-none"
          {...register('profile_about')}
        />
      </Field>

      {/* Profile picture */}
      <ImageField
        label="Profile Picture"
        placeholder="https://example.com/avatar.jpg"
        previewType="square"
        previewUrl={picture}
        onUpload={(f) => handleUpload(f, 'profile_picture')}
        {...register('profile_picture')}
      />

      {/* Banner */}
      <ImageField
        label="Banner Image"
        placeholder="https://example.com/banner.jpg"
        previewType="wide"
        previewUrl={banner}
        onUpload={(f) => handleUpload(f, 'profile_banner')}
        {...register('profile_banner')}
      />

      {/* Website */}
      <Field label="Website">
        <Input placeholder="https://yourwebsite.com" {...register('profile_website')} />
      </Field>

      {/* NIP-05 */}
      <Field label="NIP-05 Identifier" hint="Verified Nostr address">
        <Input placeholder="you@example.com" {...register('profile_nip05')} />
      </Field>

      {/* Lightning address */}
      <Field label="Lightning Address" hint="For receiving zaps (lud16)">
        <Input placeholder="you@wallet.com" {...register('profile_lud16')} />
      </Field>

      <Button
        type="button"
        className="w-full bg-violet-500 hover:bg-violet-600 text-white"
        disabled={isPending || isUploading}
        onClick={handleSubmit(onSaveProfile)}
      >
        {(isPending || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Nostr Profile
      </Button>
    </div>
  );
}

// ─── Small helper components ───────────────────────────────────

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</Label>
      {children}
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

interface ImageFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  placeholder: string;
  previewType: 'square' | 'wide';
  previewUrl?: string;
  onUpload: (file: File) => void;
}

function ImageField({ label, placeholder, previewType, previewUrl, onUpload, ...inputProps }: ImageFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <Field label={label}>
      <Input placeholder={placeholder} {...inputProps} />
      <div className="flex items-center gap-2 mt-1">
        <input
          type="file"
          ref={fileRef}
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="h-4 w-4 mr-1.5" /> Upload
        </Button>
        {previewUrl && (
          <div className={`h-9 ${previewType === 'square' ? 'w-9' : 'w-20'} rounded overflow-hidden border border-slate-200 dark:border-slate-700`}>
            <img src={previewUrl} alt="" className="h-full w-full object-cover" />
          </div>
        )}
      </div>
    </Field>
  );
}
