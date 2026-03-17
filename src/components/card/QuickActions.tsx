import { Phone, MessageSquare, Mail, Send } from 'lucide-react';
import type { CardData } from '@/lib/cardTypes';

interface QuickActionsProps {
  data: CardData;
  accentColor?: string;
}

interface ActionButton {
  icon: React.ElementType;
  label: string;
  href: string;
}

export function QuickActions({ data, accentColor }: QuickActionsProps) {
  const accent = accentColor ?? data.config?.theme?.accent ?? '#8B5CF6';
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

  // Email from card config (explicit email field)
  const email = data.config?.email;
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
    <div className="mx-4 mt-4 rounded-2xl bg-card border border-border px-4 py-3 flex gap-3 justify-center">
      {actions.map((action, i) => (
        <a
          key={action.label}
          href={action.href}
          target={action.label === 'DM' ? '_blank' : undefined}
          rel={action.label === 'DM' ? 'noopener noreferrer' : undefined}
          className="flex flex-col items-center gap-1.5 animate-in fade-in duration-200"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center transition-colors bg-muted hover:opacity-80">
            <action.icon className="w-5 h-5" style={{ color: accent }} />
          </div>
          <span className="text-xs text-muted-foreground">{action.label}</span>
        </a>
      ))}
    </div>
  );
}
