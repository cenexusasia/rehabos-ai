'use client';

import { useMemo, useState, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Info,
  Sun,
  Moon,
  Luggage,
  LogOut,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { getWeekDays, isToday } from '@/hooks/use-appointments';

// ── Types ───────────────────────────────────────────────────────────────────

export type AvailabilityType = 'available' | 'busy' | 'break' | 'away';

export interface AvailabilitySlot {
  date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  type: AvailabilityType;
}

export interface ProviderAvailability {
  provider_id: string;
  provider_name: string;
  provider_specialty?: string | null;
  slots: AvailabilitySlot[];
}

interface AvailabilityGridProps {
  /** Schedule data for one or more providers */
  providers: ProviderAvailability[];
  /** Pre-selected provider ID */
  selectedProviderId?: string | null;
  /** Called when a time slot is clicked */
  onSlotClick?: (providerId: string, slot: AvailabilitySlot) => void;
  className?: string;
}

// ── Constants ───────────────────────────────────────────────────────────────

const START_HOUR = 6; // 6 AM
const END_HOUR = 20; // 8 PM
const TOTAL_HOURS = END_HOUR - START_HOUR;

const AVAILABILITY_STYLES: Record<
  AvailabilityType,
  { bg: string; text: string; border: string; label: string }
> = {
  available: {
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
    label: 'Available',
  },
  busy: {
    bg: 'bg-red-500/15',
    text: 'text-red-400',
    border: 'border-red-500/20',
    label: 'Busy',
  },
  break: {
    bg: 'bg-amber-500/15',
    text: 'text-amber-400',
    border: 'border-amber-500/20',
    label: 'Break',
  },
  away: {
    bg: 'bg-slate-500/15',
    text: 'text-slate-400',
    border: 'border-slate-500/20',
    label: 'Away',
  },
};

const AVAILABILITY_ICONS: Record<AvailabilityType, React.ReactNode> = {
  available: <Sun className="h-3 w-3" />,
  busy: <Luggage className="h-3 w-3" />,
  break: <Moon className="h-3 w-3" />,
  away: <LogOut className="h-3 w-3" />,
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function getHourLabel(hour: number): string {
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${h} ${ampm}`;
}

function getSlotType(
  slots: AvailabilitySlot[],
  dateKey: string,
  hour: number,
): AvailabilityType | null {
  for (const slot of slots) {
    if (slot.date !== dateKey) continue;
    const startH = parseInt(slot.start_time.split(':')[0]!, 10);
    const endH = parseInt(slot.end_time.split(':')[0]!, 10);
    if (hour >= startH && hour < endH) {
      return slot.type;
    }
  }
  return null;
}

function hasOverlap(slots: AvailabilitySlot[], dateKey: string, hour: number): boolean {
  let count = 0;
  for (const slot of slots) {
    if (slot.date !== dateKey) continue;
    const startH = parseInt(slot.start_time.split(':')[0]!, 10);
    const endH = parseInt(slot.end_time.split(':')[0]!, 10);
    if (hour >= startH && hour < endH) {
      count++;
    }
  }
  return count > 1;
}

// ── Legend ──────────────────────────────────────────────────────────────────

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
      {(Object.entries(AVAILABILITY_STYLES) as [AvailabilityType, typeof AVAILABILITY_STYLES[AvailabilityType]][]).map(
        ([type, style]) => (
          <span key={type} className="inline-flex items-center gap-1.5">
            <span
              className={cn(
                'inline-flex h-4 w-4 items-center justify-center rounded',
                style.bg,
                style.text,
              )}
            >
              {AVAILABILITY_ICONS[type]}
            </span>
            {style.label}
          </span>
        ),
      )}
    </div>
  );
}

// ── Provider Row ────────────────────────────────────────────────────────────

function ProviderRow({
  provider,
  weekDays,
  hours,
  selectedProviderId,
  onSlotClick,
}: {
  provider: ProviderAvailability;
  weekDays: Date[];
  hours: number[];
  selectedProviderId: string | null | undefined;
  onSlotClick?: (providerId: string, slot: AvailabilitySlot) => void;
}) {
  const isSelected = provider.provider_id === selectedProviderId;

  const handleSlotClick = useCallback(
    (dateKey: string, hour: number) => {
      if (!onSlotClick) return;
      const slot = provider.slots.find((s) => {
        if (s.date !== dateKey) return false;
        const startH = parseInt(s.start_time.split(':')[0]!, 10);
        const endH = parseInt(s.end_time.split(':')[0]!, 10);
        return hour >= startH && hour < endH;
      });
      if (slot) {
        onSlotClick(provider.provider_id, slot);
      }
    },
    [provider, onSlotClick],
  );

  return (
    <div
      className={cn(
        'border-border grid grid-cols-[10rem_repeat(7,1fr)] gap-px transition-colors',
      )}
    >
      {/* Provider Name */}
      <div
        className={cn(
          'sticky left-0 z-10 flex items-center gap-2 border-b border-border bg-card px-3 py-3',
          isSelected && 'bg-primary/5',
        )}
      >
        <div className="min-w-0 flex-1">
          <p className="text-foreground truncate text-sm font-medium">
            {provider.provider_name}
          </p>
          {provider.provider_specialty && (
            <p className="text-muted-foreground truncate text-[10px]">
              {provider.provider_specialty}
            </p>
          )}
        </div>
      </div>

      {/* Day columns */}
      {weekDays.map((day) => {
        const dateKey = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
        const _isToday = isToday(day);

        return (
          <div
            key={dateKey}
            className={cn(
              'border-border relative border-b border-l',
              _isToday && 'bg-primary/[0.02]',
            )}
          >
            {/* Hour blocks */}
            {hours.map((hour) => {
              const slotType = getSlotType(
                provider.slots,
                dateKey,
                hour,
              );
              const overlapping = hasOverlap(
                provider.slots,
                dateKey,
                hour,
              );

              if (!slotType) {
                return (
                  <div
                    key={hour}
                    className="h-6 border-b border-border/10"
                    title="No schedule data"
                  />
                );
              }

              const style = AVAILABILITY_STYLES[slotType];

              return (
                <div
                  key={hour}
                  onClick={() => handleSlotClick(dateKey, hour)}
                  className={cn(
                    'group relative h-6 cursor-pointer border-b border-border/10 transition-colors',
                    style.bg,
                    'hover:ring-1 hover:ring-inset hover:ring-white/10',
                    overlapping && 'ring-1 ring-inset ring-amber-400/30',
                  )}
                  title={`${provider.provider_name} — ${getHourLabel(hour)} (${style.label}${overlapping ? ', overlap detected' : ''})`}
                >
                  {/* Overlap indicator */}
                  {overlapping && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                      <Info className="h-3 w-3 text-amber-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

export function AvailabilityGrid({
  providers,
  selectedProviderId,
  onSlotClick,
  className,
}: AvailabilityGridProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);
  const hours = useMemo(
    () => Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i),
    [],
  );

  const navigateWeek = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + (direction === 'next' ? 7 : -7));
      return d;
    });
  }, []);

  const viewTitle = useMemo(() => {
    const start = weekDays[0]!;
    const end = weekDays[6]!;
    if (start.getMonth() === end.getMonth()) {
      return `${start.toLocaleDateString('en-US', { month: 'long' })} ${start.getDate()} – ${end.getDate()}, ${end.getFullYear()}`;
    }
    return `${start.toLocaleDateString('en-US', { month: 'short' })} ${start.getDate()} – ${end.toLocaleDateString('en-US', { month: 'short' })} ${end.getDate()}, ${end.getFullYear()}`;
  }, [weekDays]);

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Navigation */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateWeek('prev')}
            className="hover:bg-accent rounded-md p-1.5 transition-colors"
            aria-label="Previous week"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h3 className="text-foreground min-w-[180px] text-center text-sm font-semibold">
            {viewTitle}
          </h3>
          <button
            onClick={() => navigateWeek('next')}
            className="hover:bg-accent rounded-md p-1.5 transition-colors"
            aria-label="Next week"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-3">
        <Legend />
      </div>

      {/* Scrollable Grid */}
      <div className="overflow-x-auto">
        {/* Column Headers */}
        <div className="grid grid-cols-[10rem_repeat(7,1fr)] gap-px">
          <div className="text-muted-foreground px-3 pb-2 text-xs font-medium">
            Provider
          </div>
          {weekDays.map((day, idx) => {
            const _isToday = isToday(day);
            return (
              <div
                key={idx}
                className={cn(
                  'pb-2 text-center',
                  _isToday && 'text-primary',
                )}
              >
                <p className="text-muted-foreground text-[10px] font-medium uppercase">
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </p>
                <p
                  className={cn(
                    'text-sm font-semibold',
                    _isToday ? 'text-primary' : 'text-foreground',
                  )}
                >
                  {day.getDate()}
                </p>
              </div>
            );
          })}
        </div>

        {/* Time scale row */}
        <div className="grid grid-cols-[10rem_repeat(7,1fr)] gap-px">
          <div className="text-muted-foreground px-3 pb-1 text-[10px]">
            Time →
          </div>
          {weekDays.map((_, idx) => (
            <div key={idx} className="flex">
              {hours.filter((_, hIdx) => hIdx % 2 === 0).map((hour) => (
                <div
                  key={hour}
                  className="text-muted-foreground flex-1 text-center text-[9px]"
                >
                  {getHourLabel(hour)}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Provider Rows */}
        <div className="border-border mt-1 space-y-px border-t">
          {providers.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground text-sm">
                No provider availability data
              </p>
              <p className="text-muted-foreground/60 mt-1 text-xs">
                Add providers with schedule data to see availability
              </p>
            </div>
          ) : (
            providers.map((provider) => (
              <ProviderRow
                key={provider.provider_id}
                provider={provider}
                weekDays={weekDays}
                hours={hours}
                selectedProviderId={selectedProviderId}
                onSlotClick={onSlotClick}
              />
            ))
          )}
        </div>
      </div>

      {/* Summary */}
      {providers.length > 0 && (
        <div className="text-muted-foreground mt-4 border-t border-border pt-3 text-xs">
          <p>
            Showing {providers.length} provider{providers.length !== 1 ? 's' : ''}
            {' · '}
            Hover over blocks for details
            {' · '}
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded border border-amber-400/30 bg-amber-500/10" />
              Amber border = overlap detected
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
