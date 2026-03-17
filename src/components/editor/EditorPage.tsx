import { useState } from 'react';
import { nip19 } from 'nostr-tools';
import { Eye, Pencil } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useCardData } from '@/hooks/useCardData';
import { EditorForm, EditorFormContent } from './EditorForm';
import { LivePreview } from './LivePreview';
import { cn } from '@/lib/utils';
import LoginDialog from '@/components/auth/LoginDialog';
import type { CardData } from '@/lib/cardTypes';

type MobileTab = 'edit' | 'preview';

export function EditorPage() {
  const { user } = useCurrentUser();
  const [showLogin, setShowLogin] = useState(false);

  if (!user) {
    return (
      <LoginGate
        showLogin={showLogin}
        onOpenLogin={() => setShowLogin(true)}
        onCloseLogin={() => setShowLogin(false)}
      />
    );
  }

  return <AuthenticatedEditor pubkey={user.pubkey} />;
}

// ─── Login gate ────────────────────────────────────────────────

interface LoginGateProps {
  showLogin: boolean;
  onOpenLogin: () => void;
  onCloseLogin: () => void;
}

function LoginGate({ showLogin, onOpenLogin, onCloseLogin }: LoginGateProps) {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0A0A0F] flex items-center justify-center">
      <div className="max-w-sm mx-auto p-8 text-center">
        <div className="flex size-24 text-5xl bg-violet-500/10 rounded-full items-center justify-center mx-auto">
          🔑
        </div>
        <h1 className="text-xl font-bold mt-6">Sign in to edit your card</h1>
        <p className="text-sm text-slate-400 mt-2">
          Connect your Nostr identity to create and customize your digital business card.
        </p>
        <button
          onClick={onOpenLogin}
          className="mt-6 w-full h-12 rounded-xl bg-violet-500 hover:bg-violet-600 text-white font-medium transition-colors"
        >
          Connect to Nostr
        </button>
        <p className="text-xs text-slate-400 mt-4">
          Don&apos;t have a Nostr key?{' '}
          <a
            href="https://nostr.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-500 hover:underline"
          >
            Learn more →
          </a>
        </p>
      </div>
      <LoginDialog
        isOpen={showLogin}
        onClose={onCloseLogin}
        onLogin={onCloseLogin}
      />
    </div>
  );
}

// ─── Authenticated editor ──────────────────────────────────────

function AuthenticatedEditor({ pubkey }: { pubkey: string }) {
  const [mobileTab, setMobileTab] = useState<MobileTab>('edit');
  const npub = nip19.npubEncode(pubkey);
  const { data: cardData, isLoading } = useCardData(npub);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-[#0A0A0F] flex items-center justify-center">
        <div className="animate-pulse text-sm text-slate-400">Loading your card…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0F]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-6xl mx-auto px-4 lg:px-6 h-14 flex items-center justify-between">
          <a href="/" className="text-lg font-bold">
            key<span className="text-violet-500">.card</span>
            <span className="text-sm font-normal text-slate-400 ml-2">editor</span>
          </a>

          {/* Mobile tab toggle */}
          <div className="lg:hidden flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setMobileTab('edit')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                mobileTab === 'edit'
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
                  : 'text-slate-500',
              )}
            >
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
            <button
              onClick={() => setMobileTab('preview')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                mobileTab === 'preview'
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
                  : 'text-slate-500',
              )}
            >
              <Eye className="w-3.5 h-3.5" /> Preview
            </button>
          </div>
        </div>
      </header>

      {/* Content — EditorForm provides the FormProvider context */}
      <EditorForm cardData={cardData}>
        <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6">
          <div className="lg:grid lg:grid-cols-[1fr_420px] lg:gap-8">
            {/* Form panel */}
            <div className={cn('lg:block', mobileTab === 'edit' ? 'block' : 'hidden')}>
              <EditorFormContent cardData={cardData} />
            </div>

            {/* Preview panel */}
            <div className={cn('lg:block', mobileTab === 'preview' ? 'block' : 'hidden')}>
              <div className="lg:sticky lg:top-20">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 hidden lg:block">
                  Live Preview
                </p>
                <LivePreview baseCardData={cardData} />
              </div>
            </div>
          </div>
        </div>
      </EditorForm>
    </div>
  );
}
