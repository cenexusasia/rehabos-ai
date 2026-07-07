'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Search,
  X,
  User,
  Stethoscope,
  MapPin,
  Clock,
  Filter,
  ChevronDown,
  Loader2,
  Check,
  Star,
} from 'lucide-react';

import { cn } from '@/lib/utils';

// ── Types ───────────────────────────────────────────────────────────────────

export interface ProviderData {
  id: string;
  first_name: string;
  last_name: string;
  specialty: string | null;
  department: string | null;
  title: string | null;
  avatar_url: string | null;
  is_available: boolean;
  next_available_time: string | null;
  location: string | null;
}

interface ProviderSearchProps {
  /** Async search function */
  onSearch: (query: string, filters?: ProviderFilters) => Promise<ProviderData[]>;
  /** Called when a provider is selected from results */
  onSelect?: (provider: ProviderData) => void;
  /** Pre-selected provider */
  selectedProvider?: ProviderData | null;
  /** Department options for filtering */
  departments?: string[];
  /** Specialty options for filtering */
  specialties?: string[];
  /** Placeholder text */
  placeholder?: string;
  /** Compact mode (inline search) */
  compact?: boolean;
  className?: string;
}

interface ProviderFilters {
  department?: string;
  specialty?: string;
  availability?: 'all' | 'available';
}

// ── Provider Card ───────────────────────────────────────────────────────────

function ProviderCard({
  provider,
  isSelected,
  onSelect,
}: {
  provider: ProviderData;
  isSelected: boolean;
  onSelect: (provider: ProviderData) => void;
}) {
  return (
    <button
      onClick={() => onSelect(provider)}
      className={cn(
        'border-border hover:bg-accent/50 group flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-all',
        isSelected && 'border-primary/40 bg-primary/5',
      )}
    >
      {/* Avatar */}
      <div className="bg-accent flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
        {provider.avatar_url ? (
          <img
            src={provider.avatar_url}
            alt={`${provider.first_name} ${provider.last_name}`}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <User className="text-muted-foreground h-5 w-5" />
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-foreground truncate text-sm font-medium group-hover:text-primary transition-colors">
            {provider.first_name} {provider.last_name}
          </p>
          {provider.is_available && (
            <span className="inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
          )}
        </div>

        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          {provider.specialty && (
            <span className="inline-flex items-center gap-1">
              <Stethoscope className="h-3 w-3" />
              {provider.specialty}
            </span>
          )}
          {provider.title && (
            <span className="inline-flex items-center gap-1">
              <Star className="h-3 w-3" />
              {provider.title}
            </span>
          )}
          {provider.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {provider.location}
            </span>
          )}
        </div>

        <div className="mt-1 flex items-center gap-3 text-[10px] text-muted-foreground">
          {provider.department && (
            <span className="bg-accent rounded-full px-2 py-0.5">
              {provider.department}
            </span>
          )}
          {provider.next_available_time && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Next: {provider.next_available_time}
            </span>
          )}
        </div>
      </div>

      {/* Selection indicator */}
      <div
        className={cn(
          'mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors',
          isSelected
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-border',
        )}
      >
        {isSelected && <Check className="h-3 w-3" />}
      </div>
    </button>
  );
}

// ── Filter Dropdown ─────────────────────────────────────────────────────────

function FilterDropdown({
  label,
  options,
  value,
  onChange,
  icon,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  icon: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (options.length === 0) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'border-border bg-background text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors',
          value && 'border-primary/30 text-primary',
        )}
      >
        {icon}
        {value || label}
        <ChevronDown className="h-3 w-3" />
      </button>
      {isOpen && (
        <div className="border-border bg-popover text-popover-foreground absolute left-0 z-50 mt-1 w-48 rounded-lg border p-1 shadow-lg">
          <button
            type="button"
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
            className={cn(
              'hover:bg-accent w-full rounded-md px-3 py-1.5 text-left text-xs transition-colors',
              !value && 'bg-accent font-medium',
            )}
          >
            All {label.toLocaleLowerCase()}s
          </button>
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className={cn(
                'hover:bg-accent w-full rounded-md px-3 py-1.5 text-left text-xs transition-colors',
                value === opt && 'bg-accent font-medium',
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

export function ProviderSearch({
  onSearch,
  onSelect,
  selectedProvider: externalSelectedProvider,
  departments = [],
  specialties = [],
  placeholder = 'Search providers by name or specialty...',
  compact = false,
  className,
}: ProviderSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProviderData[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<ProviderData | null>(
    externalSelectedProvider ?? null,
  );
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [filters, setFilters] = useState<ProviderFilters>({
    department: '',
    specialty: '',
    availability: 'all',
  });
  const [hasSearched, setHasSearched] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Sync external selected provider
  useEffect(() => {
    if (externalSelectedProvider && externalSelectedProvider.id !== selectedProvider?.id) {
      setSelectedProvider(externalSelectedProvider);
    }
  }, [externalSelectedProvider]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  const debouncedSearch = useCallback(
    async (q: string) => {
      if (!q.trim() && !filters.department && !filters.specialty) {
        setResults([]);
        setShowResults(false);
        setHasSearched(false);
        return;
      }
      setIsSearching(true);
      setHasSearched(true);
      try {
        const data = await onSearch(q, filters);
        setResults(data);
        setShowResults(true);
      } finally {
        setIsSearching(false);
      }
    },
    [onSearch, filters],
  );

  // Trigger search when query or filters change
  useEffect(() => {
    const timer = setTimeout(() => debouncedSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query, debouncedSearch]);

  const handleSelect = useCallback(
    (provider: ProviderData) => {
      setSelectedProvider(provider);
      setShowResults(false);
      setQuery('');
      onSelect?.(provider);
    },
    [onSelect],
  );

  const clearSelection = useCallback(() => {
    setSelectedProvider(null);
    setQuery('');
    setResults([]);
    setHasSearched(false);
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div ref={searchRef} className={cn('relative', className)}>
      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => hasSearched && results.length > 0 && setShowResults(true)}
            placeholder={placeholder}
            className={cn(
              'border-border bg-background text-foreground placeholder:text-muted-foreground w-full rounded-lg border py-2 text-sm focus:ring-2 focus:ring-blue-500/40 focus:outline-none',
              compact ? 'pl-8 pr-3 py-1.5 text-xs' : 'pl-9 pr-3',
            )}
          />
          {isSearching && (
            <Loader2 className="text-muted-foreground pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin" />
          )}
        </div>

        {/* Filters */}
        {!compact && (
          <>
            <FilterDropdown
              label="Department"
              options={departments}
              value={filters.department ?? ''}
              onChange={(v) =>
                setFilters((prev) => ({ ...prev, department: v || undefined }))
              }
              icon={<Filter className="h-3 w-3" />}
            />
            <FilterDropdown
              label="Specialty"
              options={specialties}
              value={filters.specialty ?? ''}
              onChange={(v) =>
                setFilters((prev) => ({ ...prev, specialty: v || undefined }))
              }
              icon={<Stethoscope className="h-3 w-3" />}
            />
            <button
              type="button"
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  availability:
                    prev.availability === 'available' ? 'all' : 'available',
                }))
              }
              className={cn(
                'border-border text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors',
                filters.availability === 'available' &&
                  'border-emerald-500/30 text-emerald-400',
              )}
            >
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  filters.availability === 'available'
                    ? 'bg-emerald-500'
                    : 'bg-muted-foreground',
                )}
              />
              Available
            </button>
          </>
        )}
      </div>

      {/* Selected Provider Badge */}
      {selectedProvider && (
        <div className="border-border bg-primary/5 mt-2 flex items-center gap-2 rounded-lg border px-3 py-2">
          <div className="bg-accent flex h-8 w-8 items-center justify-center rounded-full">
            <User className="text-muted-foreground h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-foreground text-sm font-medium">
              {selectedProvider.first_name} {selectedProvider.last_name}
            </p>
            {selectedProvider.specialty && (
              <p className="text-muted-foreground text-xs">
                {selectedProvider.specialty}
              </p>
            )}
          </div>
          <button
            onClick={clearSelection}
            className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors"
            aria-label="Clear selection"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Results Dropdown */}
      {showResults && (
        <div
          className={cn(
            'border-border bg-popover text-popover-foreground absolute z-50 mt-1 w-full rounded-lg border shadow-lg',
            compact ? 'max-h-60' : 'max-h-80',
            'overflow-y-auto',
          )}
        >
          {results.length === 0 && !isSearching && (
            <div className="px-4 py-6 text-center">
              <User className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
              <p className="text-muted-foreground text-sm">No providers found</p>
              <p className="text-muted-foreground/60 mt-1 text-xs">
                Try adjusting your search or filters
              </p>
            </div>
          )}

          {results.length > 0 && (
            <div className="p-2">
              <p className="text-muted-foreground mb-2 px-2 text-xs font-medium">
                {results.length} provider{results.length !== 1 ? 's' : ''} found
              </p>
              <div className="space-y-1">
                {results.map((provider) => (
                  <ProviderCard
                    key={provider.id}
                    provider={provider}
                    isSelected={selectedProvider?.id === provider.id}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active filter indicator */}
      {(filters.department || filters.specialty || filters.availability === 'available') &&
        !selectedProvider && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {filters.department && (
              <span className="bg-accent text-muted-foreground inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-medium">
                {filters.department}
                <button
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, department: '' }))
                  }
                  className="ml-0.5 hover:text-foreground"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            )}
            {filters.specialty && (
              <span className="bg-accent text-muted-foreground inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-medium">
                {filters.specialty}
                <button
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, specialty: '' }))
                  }
                  className="ml-0.5 hover:text-foreground"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            )}
            {filters.availability === 'available' && (
              <span className="bg-emerald-500/10 text-emerald-400 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-medium">
                Available now
                <button
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, availability: 'all' }))
                  }
                  className="ml-0.5 hover:text-emerald-300"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            )}
          </div>
        )}
    </div>
  );
}
