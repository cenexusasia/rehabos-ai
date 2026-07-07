'use client';

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  User,
  Phone,
  Mail,
  Loader2,
  Command,
  ArrowUpDown,
  X,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import type { Patient } from '@/types/patient';
import { statusColors } from '@/components/patients/patient-card';

// ── Search result item ──────────────────────────────────────────────────────

interface SearchResult {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  date_of_birth: string;
  status: Patient['status'];
  diagnosis_codes: string[];
}

// ── Props ───────────────────────────────────────────────────────────────────

interface PatientSearchProps {
  /** Optional: render trigger differently */
  trigger?: React.ReactNode;
  /** Optional: class for the dialog overlay */
  className?: string;
  /** Auto-close dialog after navigation */
  closeOnNavigate?: boolean;
}

// ── Component ───────────────────────────────────────────────────────────────

export function PatientSearch({
  trigger,
  className,
  closeOnNavigate = true,
}: PatientSearchProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  // Dialog state
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Keyboard shortcut: Cmd+K / Ctrl+K ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      // Close on Escape
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      // Small delay so the dialog renders first
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
      setSelectedIndex(-1);
      setError(null);
    }
  }, [isOpen]);

  // ── Search logic with debounce ──
  const searchPatients = useCallback(
    async (searchQuery: string) => {
      const trimmed = searchQuery.trim();
      if (trimmed.length < 1) {
        setResults([]);
        setSelectedIndex(-1);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const searchTerm = `%${trimmed}%`;
        const { data, error: queryError } = await supabase
          .from('patients')
          .select(
            'id, first_name, last_name, phone, email, date_of_birth, status, diagnosis_codes',
          )
          .is('deleted_at', null)
          .or(
            `first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},phone.ilike.${searchTerm},email.ilike.${searchTerm}`,
          )
          .order('last_name', { ascending: true })
          .limit(20);

        if (queryError) throw queryError;

        setResults((data as SearchResult[]) ?? []);
        setSelectedIndex(-1);
      } catch (err) {
        setError(
          `Search failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
        );
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [supabase],
  );

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      searchPatients(query);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, searchPatients]);

  // ── Keyboard navigation ──
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : 0,
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : results.length - 1,
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          const patient = results[selectedIndex]!;
          navigateToPatient(patient.id);
        }
      }
    },
    [results, selectedIndex, router, closeOnNavigate, setIsOpen],
  );

  // ── Navigation ──
  const navigateToPatient = useCallback(
    (patientId: string) => {
      if (closeOnNavigate) {
        setIsOpen(false);
      }
      router.push(`/patients/${patientId}`);
    },
    [router, closeOnNavigate],
  );

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex < 0 || !listRef.current) return;
    const items = listRef.current.querySelectorAll('[data-result-index]');
    const el = items[selectedIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  // ── Render ──

  return (
    <>
      {/* Trigger */}
      <div
        className={cn('inline-flex', className)}
        onClick={() => setIsOpen(true)}
      >
        {trigger ?? (
          <button
            type="button"
            className={cn(
              'border-input bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
            )}
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search patients...</span>
            <kbd className="bg-muted text-muted-foreground ml-auto hidden rounded border px-1.5 py-0.5 text-[10px] font-medium sm:inline-flex items-center gap-0.5">
              <Command className="h-2.5 w-2.5" />K
            </kbd>
          </button>
        )}
      </div>

      {/* Overlay / Dialog */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
          onClick={() => setIsOpen(false)}
        >
          {/* Backdrop */}
          <div className="bg-background/80 fixed inset-0 backdrop-blur-sm" />

          {/* Dialog */}
          <div
            className={cn(
              'relative z-10 w-full max-w-xl rounded-xl border border-border bg-card shadow-2xl',
              'animate-in fade-in zoom-in-95 duration-150',
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Search className="text-muted-foreground h-5 w-5 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search by name, phone, or email..."
                className={cn(
                  'flex-1 bg-transparent text-base text-foreground outline-none',
                  'placeholder:text-muted-foreground/60',
                )}
                autoComplete="off"
                spellCheck={false}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="text-muted-foreground hover:text-foreground rounded p-0.5 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {isLoading && <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />}
            </div>

            {/* Results or states */}
            <div
              ref={listRef}
              className="max-h-[320px] overflow-y-auto p-2"
            >
              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 px-3 py-8 text-center">
                  <p className="text-destructive w-full text-sm">{error}</p>
                </div>
              )}

              {/* Empty state */}
              {!error && !isLoading && query.trim().length >= 1 && results.length === 0 && (
                <div className="px-3 py-8 text-center">
                  <User className="text-muted-foreground/40 mx-auto mb-2 h-8 w-8" />
                  <p className="text-muted-foreground text-sm">No patients found</p>
                  <p className="text-muted-foreground/50 mt-1 text-xs">
                    Try a different search term
                  </p>
                </div>
              )}

              {/* No query yet */}
              {!error && !isLoading && query.trim().length === 0 && (
                <div className="px-3 py-8 text-center">
                  <Search className="text-muted-foreground/30 mx-auto mb-2 h-8 w-8" />
                  <p className="text-muted-foreground/60 text-sm">
                    Type a name, phone number, or email
                  </p>
                </div>
              )}

              {/* Results list */}
              {results.length > 0 && (
                <div role="listbox" aria-label="Search results">
                  {results.map((patient, index) => (
                    <button
                      key={patient.id}
                      type="button"
                      data-result-index={index}
                      role="option"
                      aria-selected={index === selectedIndex}
                      onClick={() => navigateToPatient(patient.id)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        'flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors',
                        index === selectedIndex
                          ? 'bg-accent text-accent-foreground'
                          : 'hover:bg-accent/50',
                      )}
                    >
                      {/* Avatar placeholder */}
                      <div className="bg-muted text-muted-foreground mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-medium">
                        {patient.first_name.charAt(0)}
                        {patient.last_name.charAt(0)}
                      </div>

                      {/* Patient info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-foreground truncate text-sm font-medium">
                            {patient.first_name} {patient.last_name}
                          </span>
                          <span
                            className={cn(
                              'inline-flex shrink-0 items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium capitalize',
                              statusColors[patient.status],
                            )}
                          >
                            {patient.status}
                          </span>
                        </div>

                        <div className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-3 text-xs">
                          {patient.phone && (
                            <span className="inline-flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {patient.phone}
                            </span>
                          )}
                          {patient.email && (
                            <span className="inline-flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <span className="truncate max-w-[160px]">
                                {patient.email}
                              </span>
                            </span>
                          )}
                          {patient.date_of_birth && (
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(patient.date_of_birth).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          )}
                        </div>

                        {/* Diagnosis codes chips */}
                        {patient.diagnosis_codes && patient.diagnosis_codes.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {patient.diagnosis_codes.slice(0, 3).map((code) => (
                              <span
                                key={code}
                                className="bg-secondary/10 text-secondary-foreground rounded px-1.5 py-0.5 text-[10px] font-medium"
                              >
                                {code}
                              </span>
                            ))}
                            {patient.diagnosis_codes.length > 3 && (
                              <span className="text-muted-foreground text-[10px]">
                                +{patient.diagnosis_codes.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Chevron */}
                      <ArrowUpDown className="text-muted-foreground/40 mt-1 h-4 w-4 shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer hint */}
            {results.length > 0 && (
              <div className="text-muted-foreground/50 flex items-center gap-4 border-t border-border px-4 py-2 text-[10px]">
                <span className="inline-flex items-center gap-1">
                  <ArrowUpDown className="h-3 w-3" /> Navigate
                </span>
                <span className="inline-flex items-center gap-1">
                  ↵ Select
                </span>
                <span className="inline-flex items-center gap-1">
                  Esc Close
                </span>
                {results.length === 20 && (
                  <span className="ml-auto">Showing top 20 results</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
