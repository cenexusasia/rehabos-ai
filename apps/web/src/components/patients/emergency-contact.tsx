'use client';

import { Phone, User, AlertTriangle } from 'lucide-react';

interface EmergencyContact {
  name?: string;
  relationship?: string;
  phone?: string;
  alternative_phone?: string;
}

export function EmergencyContactCard({ contact }: { contact?: EmergencyContact | null }) {
  if (!contact || !contact.name) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertTriangle className="h-4 w-4" />
          <span>No emergency contact on file</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Emergency Contact
      </h4>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-foreground">{contact.name}</span>
          {contact.relationship && (
            <span className="text-muted-foreground">({contact.relationship})</span>
          )}
        </div>
        {contact.phone && (
          <a
            href={`tel:${contact.phone}`}
            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            <Phone className="h-4 w-4" />
            {contact.phone}
          </a>
        )}
        {contact.alternative_phone && (
          <a
            href={`tel:${contact.alternative_phone}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Phone className="h-4 w-4" />
            {contact.alternative_phone} (alt)
          </a>
        )}
      </div>
    </div>
  );
}
