import { Phone, MessageSquare, Mail, Send } from 'lucide-react';
import type { CardData } from '@/lib/cardTypes';

interface QuickActionsProps {
  data: CardData;
}

interface ActionButton {
  icon: React.ElementType;
  label: string;
  href: string;
}

export function QuickActions({ data }: QuickActionsProps) {
  const actions: ActionButton[] = [];

  const firstPhone = data.config?.phone?.[0]?.number;

  if (firstPhone) {
    actions.push({
      icon: Phone,
      label: 'Call',
      href: `tel:${firstPhone}`,
    });
    actions.push({
      icon: MessageSquare,
      label: 'SMS',
      href: `sms:${firstPhone}`,
    });
  }

  // Email from NIP-05 or config
  const email = data.nip05?.includes('@') ? data.nip05 : undefined;
  if (email) {
    actions.push({
      icon: Mail,
      label: 'Email',
      href: `mailto:${email}`,
    });
  }

  // Nostr DM — always available since we have npub
  actions.push({
    icon: Send,
    label: 'DM',
    href: `https://njump.me/${data.npub}`,
  });

  // Hide if fewer than 2 actions
  if (actions.length < 2) return null;

  return (
    <div className="flex gap-3 justify-center px-4 mt-4">
      {actions.map((action, i) => (
        <a
          key={action.label}
          href={action.href}
          target={action.label === 'DM' ? '_blank' : undefined}
          rel={action.label === 'DM' ? 'noopener noreferrer' : undefined}
          className="flex flex-col items-center gap-1.5 animate-in fade-in duration-200"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <div className="w-12 h-12 rounded-full bg-violet-500/10 hover:bg-violet-500/20 flex items-center justify-center transition-colors">
            <action.icon className="w-5 h-5 text-violet-500" />
          </div>
          <span className="text-xs text-slate-400">{action.label}</span>
        </a>
      ))}
    </div>
  );
}
