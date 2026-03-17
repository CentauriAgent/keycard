import { useSeoMeta } from '@unhead/react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useEffect, useRef, useState } from 'react';
import { useState } from 'react';
import {
  Zap,
  RefreshCw,
  Palette,
  Smartphone,
  Download,
  QrCode,
  Lock,
  Globe,
  Key,
  Share2,
  Github,
  Check,
  X,
  Mail,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import AuthModal from '@/components/auth/AuthModal';
import { useCurrentUser } from '@/hooks/useCurrentUser';

/* ─── Intersection Observer hook for scroll animations ─── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ─── Animated section wrapper ─── */
function FadeInSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ─── Demo card component ─── */
function DemoCard() {
  return (
    <div className="relative w-[320px] mx-auto">
      {/* Glow */}
      <div className="absolute -inset-4 bg-violet-500/20 blur-3xl rounded-3xl" />
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#12121A] shadow-2xl">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-br from-violet-600 via-indigo-700 to-purple-900" />
        {/* Avatar */}
        <div className="flex justify-center -mt-10 relative z-10">
          <div className="w-20 h-20 rounded-full bg-violet-500 ring-4 ring-[#12121A] flex items-center justify-center text-2xl font-bold text-white select-none">
            D
          </div>
        </div>
        {/* Identity */}
        <div className="text-center px-5 pt-2 pb-1">
          <h3 className="text-lg font-bold text-white">Derek Ross</h3>
          <p className="text-xs text-slate-400">@derek</p>
          <p className="text-xs text-green-400 mt-1 flex items-center justify-center gap-1">
            <Check className="w-3 h-3" /> derek@nostrplebs.com
          </p>
          <p className="text-sm text-slate-300 mt-1">Developer Relations at Soapbox</p>
        </div>
        {/* Quick actions */}
        <div className="flex justify-center gap-3 px-5 pt-3">
          {['📞', '💬', '✉️', '💜'].map((emoji, i) => (
            <div key={i} className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center text-sm">
              {emoji}
            </div>
          ))}
        </div>
        {/* Zap button */}
        <div className="px-5 pt-3">
          <div className="w-full h-10 rounded-xl bg-amber-500 flex items-center justify-center gap-2 text-white text-sm font-semibold">
            <Zap className="w-4 h-4 fill-current" /> Zap Derek
          </div>
        </div>
        {/* Links preview */}
        <div className="px-5 pt-4 pb-5 space-y-2">
          {[
            { icon: <Github className="w-4 h-4" />, label: 'GitHub', verified: true },
            { icon: <Globe className="w-4 h-4" />, label: 'derekross.me', verified: false },
            { icon: <ExternalLink className="w-4 h-4" />, label: 'Nostr Plebs', verified: false },
          ].map((link, i) => (
            <div key={i} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-white/5">
              <span className="text-slate-400">{link.icon}</span>
              <span className="text-sm text-slate-200 flex-1">{link.label}</span>
              {link.verified && <Check className="w-3 h-3 text-green-500" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Index page ─── */
const Index = () => {
  const [authOpen, setAuthOpen] = useState(false);
  const [authView, setAuthView] = useState<'choose' | 'create'>('create');
  const { user } = useCurrentUser();

  useSeoMeta({
    title: 'key.card — Your Nostr Identity Card',
    description: 'Your identity. Your keys. Your card. A free, open-source digital business card powered by Nostr.',
  });

  const DEREK_CARD = '/npub18ams6ewn5aj2n3wt2qawzglx9mr4nzksxhvrdc4gzrecw7n5tvjqctp424';

  const handleCreateClick = () => {
    if (user) {
      window.location.href = '/edit';
    } else {
      setAuthView('create');
      setAuthOpen(true);
    }
  };

  const handleSignInClick = () => {
    setAuthView('choose');
    setAuthOpen(true);
  };

  const features = [
    { icon: Zap, title: 'Lightning zaps built in', desc: 'Accept Bitcoin payments right on your card. No payment processor needed.' },
    { icon: RefreshCw, title: 'Auto-updates', desc: 'Change your Nostr profile once — your card updates everywhere instantly.' },
    { icon: Palette, title: 'Beautiful themes', desc: '6 gorgeous presets plus full custom colors. Glass, solid, or gradient styles.' },
    { icon: Smartphone, title: 'Add to Wallet', desc: 'Apple Wallet and Google Wallet passes. Always in your pocket.' },
    { icon: Download, title: 'Save to Contacts', desc: 'One-tap vCard download. Works on every phone, no app needed.' },
    { icon: QrCode, title: 'QR code generator', desc: 'Instant QR codes for print, slides, or NFC tags. Share anywhere.' },
    { icon: Lock, title: 'You own your data', desc: 'Your Nostr keys = your identity. Can never be deplatformed or deleted.' },
    { icon: Globe, title: 'Works everywhere', desc: 'NIP-05 vanity URLs, PWA support, mobile-first. No app install needed.' },
  ];

  const comparisonRows = [
    { feature: 'Free forever', keycard: true, qrcodeCh: '$7/mo', hihello: '$6/mo', linktree: '$5/mo' },
    { feature: 'Own your data', keycard: true, qrcodeCh: false, hihello: false, linktree: false },
    { feature: 'Auto-updates', keycard: true, qrcodeCh: false, hihello: false, linktree: false },
    { feature: 'Lightning zaps', keycard: true, qrcodeCh: false, hihello: false, linktree: false },
    { feature: 'No vendor lock-in', keycard: true, qrcodeCh: false, hihello: false, linktree: false },
    { feature: 'Open source', keycard: true, qrcodeCh: false, hihello: false, linktree: false },
  ];

  function renderCell(val: boolean | string) {
    if (val === true) return <span className="text-green-400 font-semibold flex items-center gap-1"><Check className="w-4 h-4" /> Yes</span>;
    if (val === false) return <span className="text-red-400 flex items-center gap-1"><X className="w-4 h-4" /></span>;
    return <span className="text-red-400 flex items-center gap-1"><X className="w-4 h-4" /> {val}</span>;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white overflow-x-hidden">

      {/* ═══ STICKY HEADER ═══ */}
      <header className="sticky top-0 z-50 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-5xl mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold">
            <span className="text-xl">🔑</span>
            <span>key<span className="text-violet-500">.card</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hidden sm:inline-flex" onClick={handleSignInClick}>
              Sign In
            </Button>
            <Button size="sm" className="bg-violet-500 hover:bg-violet-600 text-white" onClick={handleCreateClick}>
              Create your card
            </Button>
          </div>
        </div>
      </header>

      {/* ═══ HERO ═══ */}
      <section className="relative pt-16 pb-20 px-4 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
              <span className="block">Your identity.</span>
              <span className="block">Your <span className="text-violet-500">keys</span>.</span>
              <span className="block">Your card.</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 mt-6 max-w-lg leading-relaxed">
              A free, open-source digital business card powered by your Nostr identity. No subscriptions. No vendor lock-in. Your card lives on relays — forever.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Button size="lg" className="w-full sm:w-auto h-12 px-8 rounded-xl bg-violet-500 hover:bg-violet-600 text-white text-base font-semibold shadow-lg shadow-violet-500/25" onClick={handleCreateClick}>
                Create your card free
              </Button>
              <Link to={DEREK_CARD}>
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 rounded-xl border-violet-500/30 text-violet-300 hover:bg-violet-500/10">
                  See a demo
                </Button>
              </Link>
            </div>
          </div>

          {/* Demo card */}
          <div className="hidden md:flex justify-center">
            <div className="animate-[float_6s_ease-in-out_infinite]">
              <DemoCard />
            </div>
          </div>
        </div>

        {/* Mobile demo card */}
        <div className="md:hidden mt-12 flex justify-center">
          <div className="scale-90">
            <DemoCard />
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="py-20 px-4 bg-[#12121A]">
        <div className="max-w-4xl mx-auto">
          <FadeInSection>
            <h2 className="text-2xl sm:text-3xl font-bold text-center">How it works</h2>
            <p className="text-slate-400 text-center mt-2">Three steps to your sovereign business card</p>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {[
              { step: '1', emoji: '🔑', title: 'Connect your Nostr identity', desc: 'Sign in with your Nostr key. Your profile becomes your card instantly.' },
              { step: '2', emoji: '✨', title: 'Customize your card', desc: 'Add your phone, links, theme, and booking URL. Preview changes in real-time.' },
              { step: '3', emoji: '📱', title: 'Share anywhere', desc: 'Get your QR code, add to Apple/Google Wallet, or share via NFC and links.' },
            ].map((s, i) => (
              <FadeInSection key={s.step} delay={i * 150}>
                <div className="rounded-2xl bg-[#1A1A2E] border border-[#2D2D44] p-6 text-center hover:-translate-y-1 transition-transform duration-200">
                  <div className="w-12 h-12 rounded-full bg-violet-500 text-white font-bold text-lg flex items-center justify-center mx-auto">
                    {s.emoji}
                  </div>
                  <h3 className="text-lg font-semibold mt-4">{s.title}</h3>
                  <p className="text-sm text-slate-400 mt-2 leading-relaxed">{s.desc}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES GRID ═══ */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <FadeInSection>
            <h2 className="text-2xl sm:text-3xl font-bold text-center">Why key.card?</h2>
            <p className="text-slate-400 text-center mt-2">Everything you need, nothing you don't</p>
          </FadeInSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-12">
            {features.map((f, i) => (
              <FadeInSection key={f.title} delay={i * 75}>
                <div className="flex gap-4 p-4 rounded-xl hover:bg-white/[0.02] transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                    <f.icon className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{f.title}</h3>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ COMPETITOR COMPARISON TABLE ═══ */}
      <section className="py-20 px-4 bg-[#12121A]">
        <div className="max-w-3xl mx-auto">
          <FadeInSection>
            <h2 className="text-2xl sm:text-3xl font-bold text-center">key.card vs. the competition</h2>
            <p className="text-slate-400 text-center mt-2">See why decentralized wins</p>
          </FadeInSection>

          <FadeInSection delay={200}>
            <div className="mt-12 rounded-xl border border-[#2D2D44] overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#2D2D44] hover:bg-transparent">
                      <TableHead className="text-slate-400 font-semibold">Feature</TableHead>
                      <TableHead className="bg-violet-500/10 text-violet-400 font-bold text-center">key.card</TableHead>
                      <TableHead className="text-slate-400 text-center">QRCodeChimp</TableHead>
                      <TableHead className="text-slate-400 text-center">HiHello</TableHead>
                      <TableHead className="text-slate-400 text-center">Linktree</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comparisonRows.map((row) => (
                      <TableRow key={row.feature} className="border-[#2D2D44] hover:bg-white/[0.02]">
                        <TableCell className="font-medium text-slate-300">{row.feature}</TableCell>
                        <TableCell className="text-center bg-violet-500/5">{renderCell(row.keycard)}</TableCell>
                        <TableCell className="text-center">{renderCell(row.qrcodeCh)}</TableCell>
                        <TableCell className="text-center">{renderCell(row.hihello)}</TableCell>
                        <TableCell className="text-center">{renderCell(row.linktree)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="py-24 px-4 text-center relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-600/5 to-transparent pointer-events-none" />
        <FadeInSection>
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold">Ready to own your identity?</h2>
            <p className="text-lg text-slate-400 mt-3 max-w-md mx-auto">
              Create your Nostr-powered business card in under 60 seconds.
            </p>
            <Button size="lg" className="mt-8 h-14 px-10 rounded-xl bg-violet-500 hover:bg-violet-600 text-white text-lg font-semibold shadow-lg shadow-violet-500/25" onClick={handleCreateClick}>
              Create your card free →
            </Button>
          </div>
        </FadeInSection>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-8 px-4 border-t border-[#2D2D44]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 text-sm font-bold">
            <span>🔑</span>
            <span>key<span className="text-violet-500">.card</span></span>
          </Link>

          <p className="text-xs text-slate-500 text-center">
            key.card is open source and built on Nostr
          </p>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/derekross/keycard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              Powered by <span className="text-violet-400 font-medium">Nostr</span> 💜
            </span>
          </div>
        </div>
      </footer>

      {/* ═══ CSS for float animation ═══ */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(1deg); }
          50% { transform: translateY(-10px) rotate(-1deg); }
        }
      `}</style>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onLogin={() => {
          setAuthOpen(false);
          window.location.href = '/edit';
        }}
        defaultView={authView}
        signupFirst={authView === 'create'}
      />
    </div>
  );
};

export default Index;
