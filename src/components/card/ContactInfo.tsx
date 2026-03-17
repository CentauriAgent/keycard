import { Phone, Mail, MapPin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { CardData } from '@/lib/cardTypes';

interface ContactInfoProps {
  data: CardData;
}

export function ContactInfo({ data }: ContactInfoProps) {
  const config = data.config;
  const hasPhone = config?.phone && config.phone.length > 0;
  const hasAddress = config?.address && (config.address.street || config.address.city);

  // Only show if we have extended contact info from kind:30078
  if (!hasPhone && !hasAddress) return null;

  const addressParts: string[] = [];
  if (config?.address) {
    const addr = config.address;
    if (addr.street) addressParts.push(addr.street);
    const cityLine = [addr.city, addr.state, addr.zip].filter(Boolean).join(', ');
    if (cityLine) addressParts.push(cityLine);
    if (addr.country) addressParts.push(addr.country);
  }

  const mapsUrl = config?.address
    ? `https://maps.google.com/?q=${encodeURIComponent(addressParts.join(', '))}`
    : undefined;

  interface ContactRow {
    icon: React.ElementType;
    value: string;
    label?: string;
    href?: string;
  }

  const rows: ContactRow[] = [];

  if (hasPhone) {
    for (const phone of config!.phone!) {
      rows.push({
        icon: Phone,
        value: phone.number,
        label: phone.label ?? phone.type.charAt(0).toUpperCase() + phone.type.slice(1),
        href: `tel:${phone.number}`,
      });
    }
  }

  if (config?.address && addressParts.length > 0) {
    rows.push({
      icon: MapPin,
      value: addressParts.join('\n'),
      label: undefined,
      href: mapsUrl,
    });
  }

  if (rows.length === 0) return null;

  return (
    <div className="px-4 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Contact Info
        </h3>

        <div className="space-y-0">
          {rows.map((row, i) => (
            <div key={i}>
              {i > 0 && <Separator className="my-0" />}
              <a
                href={row.href}
                target={row.icon === MapPin ? '_blank' : undefined}
                rel={row.icon === MapPin ? 'noopener noreferrer' : undefined}
                className="flex items-start gap-3 py-2.5 hover:opacity-80 transition-opacity"
              >
                <row.icon className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium whitespace-pre-line">{row.value}</p>
                  {row.label && (
                    <p className="text-xs text-slate-400">{row.label}</p>
                  )}
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
