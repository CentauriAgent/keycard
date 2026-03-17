import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Key,
  Puzzle,
  Link2,
  Eye,
  EyeOff,
  Copy,
  Download,
  Upload,
  AlertTriangle,
  Check,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/useToast';
import { useLoginActions } from '@/hooks/useLoginActions';
import { generateSecretKey, getPublicKey, nip19 } from 'nostr-tools';

type AuthView = 'choose' | 'create' | 'extension' | 'nsec' | 'bunker';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin?: () => void;
  /** Which view to open by default */
  defaultView?: AuthView;
  /** Whether to show "New to Nostr?" prominently */
  signupFirst?: boolean;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  defaultView = 'choose',
  signupFirst = false,
}) => {
  const [view, setView] = useState<AuthView>(defaultView);
  const login = useLoginActions();

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setView(defaultView);
    }
  }, [isOpen, defaultView]);

  const handleSuccess = () => {
    onLogin?.();
    onClose();
  };

  const goBack = () => setView('choose');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90dvh] p-0 gap-0 overflow-hidden rounded-2xl overflow-y-auto bg-[#12121A] border-white/10 text-white">
        {view === 'choose' && (
          <ChooseView
            onSelect={setView}
            signupFirst={signupFirst}
          />
        )}
        {view === 'create' && (
          <CreateIdentityView onSuccess={handleSuccess} onBack={goBack} login={login} />
        )}
        {view === 'extension' && (
          <ExtensionView onSuccess={handleSuccess} onBack={goBack} login={login} />
        )}
        {view === 'nsec' && (
          <NsecView onSuccess={handleSuccess} onBack={goBack} login={login} />
        )}
        {view === 'bunker' && (
          <BunkerView onSuccess={handleSuccess} onBack={goBack} login={login} />
        )}
      </DialogContent>
    </Dialog>
  );
};

// ─── Choose View ─────────────────────────────────────────────

interface ChooseViewProps {
  onSelect: (view: AuthView) => void;
  signupFirst: boolean;
}

function ChooseView({ onSelect, signupFirst }: ChooseViewProps) {
  const hasExtension = typeof window !== 'undefined' && 'nostr' in window;

  return (
    <div className="p-6 space-y-5">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold text-center text-white">
          Welcome to key.card
        </DialogTitle>
        <DialogDescription className="text-center text-slate-400 text-sm">
          Your sovereign digital business card powered by Nostr
        </DialogDescription>
      </DialogHeader>

      {/* New to Nostr? - Primary CTA */}
      <div className="space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-violet-400">
          {signupFirst ? '✨ Get started' : '✨ New to Nostr?'}
        </div>
        <button
          onClick={() => onSelect('create')}
          className="w-full group relative overflow-hidden rounded-xl border-2 border-violet-500/50 bg-violet-500/10 p-4 text-left transition-all hover:border-violet-500 hover:bg-violet-500/20"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center shrink-0">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-white">Create New Identity</div>
              <div className="text-xs text-slate-400 mt-0.5">
                Generate a new Nostr keypair — takes 10 seconds
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* Existing users */}
      <div className="space-y-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Already on Nostr?
        </div>

        {hasExtension && (
          <button
            onClick={() => onSelect('extension')}
            className="w-full rounded-xl border border-white/10 bg-white/5 p-3.5 text-left transition-all hover:border-white/20 hover:bg-white/10"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                <Puzzle className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <div className="font-medium text-sm text-white">Sign In with Extension</div>
                <div className="text-xs text-slate-500">NIP-07 browser extension detected</div>
              </div>
            </div>
          </button>
        )}

        <button
          onClick={() => onSelect('nsec')}
          className="w-full rounded-xl border border-white/10 bg-white/5 p-3.5 text-left transition-all hover:border-white/20 hover:bg-white/10"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
              <Key className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="font-medium text-sm text-white">Sign In with nsec</div>
              <div className="text-xs text-slate-500">Paste your secret key</div>
            </div>
          </div>
        </button>

        <button
          onClick={() => onSelect('bunker')}
          className="w-full rounded-xl border border-white/10 bg-white/5 p-3.5 text-left transition-all hover:border-white/20 hover:bg-white/10"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
              <Link2 className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <div className="font-medium text-sm text-white">Nostr Connect (NIP-46)</div>
              <div className="text-xs text-slate-500">Use Nsec.app, Amber, or bunker URI</div>
            </div>
          </div>
        </button>

        {!hasExtension && (
          <div className="text-center pt-1">
            <span className="text-xs text-slate-500">
              Want extension login?{' '}
              <a
                href="https://getalby.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-400 hover:underline"
              >
                Install Alby
              </a>
              {' or '}
              <a
                href="https://github.com/nickodev/nos2x-fox"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-400 hover:underline"
              >
                nos2x
              </a>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Create Identity View ────────────────────────────────────

interface ViewProps {
  onSuccess: () => void;
  onBack: () => void;
  login: ReturnType<typeof useLoginActions>;
}

function CreateIdentityView({ onSuccess, onBack, login }: ViewProps) {
  const [step, setStep] = useState<'intro' | 'keys' | 'confirm'>('intro');
  const [secretKey, setSecretKey] = useState<Uint8Array | null>(null);
  const [nsec, setNsec] = useState('');
  const [npub, setNpub] = useState('');
  const [showNsec, setShowNsec] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [copied, setCopied] = useState<'nsec' | 'npub' | null>(null);

  const generateKeys = () => {
    const sk = generateSecretKey();
    const pk = getPublicKey(sk);
    setSecretKey(sk);
    setNsec(nip19.nsecEncode(sk));
    setNpub(nip19.npubEncode(pk));
    setStep('keys');
  };

  const copyToClipboard = async (text: string, type: 'nsec' | 'npub') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
      toast({ title: `${type} copied to clipboard` });
    } catch {
      toast({ title: 'Failed to copy', variant: 'destructive' });
    }
  };

  const downloadKey = () => {
    try {
      const blob = new Blob([nsec], { type: 'text/plain; charset=utf-8' });
      const url = globalThis.URL.createObjectURL(blob);
      const filename = `nostr-keycard-${npub.slice(5, 13)}.nsec.txt`;
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      globalThis.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      toast({ title: 'Download failed', variant: 'destructive' });
    }
  };

  const finishCreation = () => {
    login.nsec(nsec);
    toast({
      title: '🎉 Identity created!',
      description: `Your card: key.card/${npub}`,
    });
    onSuccess();
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <DialogHeader className="flex-1">
          <DialogTitle className="text-lg font-bold text-white">
            {step === 'intro' && 'Create New Identity'}
            {step === 'keys' && 'Your New Keys'}
            {step === 'confirm' && 'Almost Done!'}
          </DialogTitle>
        </DialogHeader>
      </div>

      {step === 'intro' && (
        <div className="space-y-4 text-center">
          <div className="flex size-20 text-5xl bg-violet-500/10 rounded-full items-center justify-center mx-auto">
            🔑
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Your Nostr identity is a cryptographic keypair. It's like a username and password
            rolled into one — except <strong className="text-white">only you</strong> hold the key.
          </p>
          <Button
            className="w-full h-12 bg-violet-500 hover:bg-violet-600 text-white font-semibold"
            onClick={generateKeys}
          >
            <Plus className="w-4 h-4 mr-2" />
            Generate My Identity
          </Button>
        </div>
      )}

      {step === 'keys' && (
        <div className="space-y-4">
          {/* npub */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Your Public Key (npub)
            </label>
            <div className="flex gap-2">
              <Input
                value={npub}
                readOnly
                className="font-mono text-xs bg-white/5 border-white/10 text-white"
              />
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 border-white/10 hover:bg-white/10"
                onClick={() => copyToClipboard(npub, 'npub')}
              >
                {copied === 'npub' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-slate-500">This is your public identity — safe to share.</p>
          </div>

          {/* nsec */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Your Secret Key (nsec)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showNsec ? 'text' : 'password'}
                  value={nsec}
                  readOnly
                  className="font-mono text-xs pr-10 bg-white/5 border-white/10 text-white"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-slate-400"
                  onClick={() => setShowNsec(!showNsec)}
                >
                  {showNsec ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 border-white/10 hover:bg-white/10"
                onClick={() => copyToClipboard(nsec, 'nsec')}
              >
                {copied === 'nsec' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Big Warning */}
          <Alert className="bg-red-950/30 border-red-500/30">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300 text-xs leading-relaxed">
              <strong>Save your nsec somewhere safe!</strong> It's your password and{' '}
              <strong>cannot be recovered</strong> if lost. No email reset. No support desk. Write it
              down, save the file, or store it in a password manager.
            </AlertDescription>
          </Alert>

          {/* Download button */}
          <Button
            variant="outline"
            className="w-full border-white/10 hover:bg-white/10 text-white"
            onClick={downloadKey}
          >
            <Download className="w-4 h-4 mr-2" />
            Download Key File
          </Button>

          {/* Confirmation */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
            <Checkbox
              id="saved-key"
              checked={confirmed}
              onCheckedChange={(checked) => setConfirmed(checked === true)}
              className="mt-0.5 border-violet-500 data-[state=checked]:bg-violet-500"
            />
            <label htmlFor="saved-key" className="text-sm text-slate-300 cursor-pointer leading-snug">
              I've saved my secret key somewhere safe. I understand it cannot be recovered.
            </label>
          </div>

          <Button
            className="w-full h-12 bg-violet-500 hover:bg-violet-600 text-white font-semibold disabled:opacity-40"
            disabled={!confirmed}
            onClick={finishCreation}
          >
            Create My Card →
          </Button>

          {/* Card URL preview */}
          <div className="text-center text-xs text-slate-500">
            Your card will be at:{' '}
            <span className="text-violet-400 font-mono">key.card/{npub.slice(0, 16)}...</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Extension View ──────────────────────────────────────────

function ExtensionView({ onSuccess, onBack, login }: ViewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasExtension = typeof window !== 'undefined' && 'nostr' in window;

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await login.extension();
      toast({ title: 'Signed in with extension!' });
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Extension login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <DialogHeader className="flex-1">
          <DialogTitle className="text-lg font-bold text-white">
            Sign In with Extension
          </DialogTitle>
        </DialogHeader>
      </div>

      <div className="text-center space-y-4">
        <div className="flex size-20 text-5xl bg-green-500/10 rounded-full items-center justify-center mx-auto">
          <Puzzle className="w-10 h-10 text-green-400" />
        </div>

        {hasExtension ? (
          <>
            <p className="text-sm text-slate-400">
              Click below to sign in using your NIP-07 browser extension.
            </p>
            {error && (
              <Alert className="bg-red-950/30 border-red-500/30">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-300 text-xs">{error}</AlertDescription>
              </Alert>
            )}
            <Button
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold"
              onClick={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? 'Connecting...' : 'Connect Extension'}
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-slate-400">
              No Nostr extension detected. Install one to sign in this way.
            </p>
            <div className="space-y-2">
              <a
                href="https://getalby.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between w-full p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="text-left">
                  <div className="font-medium text-sm text-white">Alby</div>
                  <div className="text-xs text-slate-500">Lightning + Nostr extension</div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </a>
              <a
                href="https://github.com/nickodev/nos2x-fox"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between w-full p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="text-left">
                  <div className="font-medium text-sm text-white">nos2x</div>
                  <div className="text-xs text-slate-500">Lightweight NIP-07 extension</div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Nsec View ───────────────────────────────────────────────

function NsecView({ onSuccess, onBack, login }: ViewProps) {
  const [nsec, setNsec] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndLogin = (key: string) => {
    const trimmed = key.trim();
    if (!trimmed) {
      setError('Please enter your secret key');
      return;
    }

    // Accept nsec1... format
    if (trimmed.startsWith('nsec1')) {
      try {
        const decoded = nip19.decode(trimmed);
        if (decoded.type !== 'nsec') {
          setError('Invalid nsec format');
          return;
        }
      } catch {
        setError('Invalid nsec format. Must be a valid nsec1... key.');
        return;
      }
    } else if (/^[a-f0-9]{64}$/i.test(trimmed)) {
      // Accept 64-char hex
      // Convert hex to nsec for the login action
      try {
        const bytes = new Uint8Array(trimmed.match(/.{2}/g)!.map(b => parseInt(b, 16)));
        const nsecKey = nip19.nsecEncode(bytes);
        doLogin(nsecKey);
        return;
      } catch {
        setError('Invalid hex key format');
        return;
      }
    } else {
      setError('Invalid key format. Enter an nsec1... key or 64-character hex.');
      return;
    }

    doLogin(trimmed);
  };

  const doLogin = (key: string) => {
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      try {
        login.nsec(key);
        toast({ title: 'Signed in successfully!' });
        onSuccess();
      } catch {
        setError('Failed to login. Please check your key.');
        setIsLoading(false);
      }
    }, 50);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        validateAndLogin(content);
      } else {
        setError('Could not read file.');
      }
    };
    reader.onerror = () => setError('Failed to read file.');
    reader.readAsText(file);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <DialogHeader className="flex-1">
          <DialogTitle className="text-lg font-bold text-white">
            Sign In with nsec
          </DialogTitle>
        </DialogHeader>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          validateAndLogin(nsec);
        }}
        className="space-y-4"
      >
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Secret Key
          </label>
          <Input
            type="password"
            value={nsec}
            onChange={(e) => {
              setNsec(e.target.value);
              setError(null);
            }}
            placeholder="nsec1... or 64-char hex"
            autoComplete="off"
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-600"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>

        <Alert className="bg-amber-950/20 border-amber-500/30">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <AlertDescription className="text-amber-300 text-xs">
            Your key is stored locally in your browser. For better security, use a{' '}
            <button type="button" onClick={() => {}} className="underline text-violet-400">
              browser extension
            </button>{' '}
            or NIP-46 remote signer.
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          <Button
            type="submit"
            className="flex-1 h-11 bg-amber-500 hover:bg-amber-600 text-white font-semibold"
            disabled={isLoading || !nsec.trim()}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
          <input
            type="file"
            accept=".txt,.nsec"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-11 w-11 border-white/10 hover:bg-white/10"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            title="Upload key file"
          >
            <Upload className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}

// ─── Bunker View ─────────────────────────────────────────────

function BunkerView({ onSuccess, onBack, login }: ViewProps) {
  const [bunkerUri, setBunkerUri] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!bunkerUri.trim()) {
      setError('Please enter a bunker URI');
      return;
    }
    if (!bunkerUri.startsWith('bunker://')) {
      setError('Invalid format. Must start with bunker://');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await login.bunker(bunkerUri);
      toast({ title: 'Connected via Nostr Connect!' });
      onSuccess();
    } catch {
      setError('Failed to connect. Check the URI and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <DialogHeader className="flex-1">
          <DialogTitle className="text-lg font-bold text-white">
            Nostr Connect (NIP-46)
          </DialogTitle>
        </DialogHeader>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-slate-400">
          Connect using a remote signer like{' '}
          <a href="https://nsec.app" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">
            Nsec.app
          </a>
          {' or '}
          <a href="https://github.com/nickodev/nos2x-fox" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">
            Amber
          </a>
          . Your keys never leave the signer.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          className="space-y-3"
        >
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Connection String
            </label>
            <Input
              value={bunkerUri}
              onChange={(e) => {
                setBunkerUri(e.target.value);
                setError(null);
              }}
              placeholder="bunker://..."
              autoComplete="off"
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 font-mono text-xs"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            disabled={isLoading || !bunkerUri.trim()}
          >
            {isLoading ? 'Connecting...' : 'Connect'}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-xs text-slate-500">
            Paste the connection string from your remote signer app
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
