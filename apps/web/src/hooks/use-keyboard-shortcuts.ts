import { useEffect, useCallback } from 'react';

type ShortcutAction = () => void;
type Modifier = 'ctrl' | 'meta' | 'shift' | 'alt';

interface Shortcut {
  key: string;
  modifiers?: Modifier[];
  action: ShortcutAction;
  description: string;
  enabled?: boolean;
}

const registeredShortcuts = new Map<string, Shortcut>();

export function useKeyboardShortcut(
  key: string,
  action: ShortcutAction,
  options?: {
    modifiers?: Modifier[];
    description?: string;
    enabled?: boolean;
  },
) {
  const stableAction = useCallback(action, [action]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (options?.enabled === false) return;

      const modifiers = options?.modifiers ?? [];
      const matchModifiers = modifiers.every((mod) => {
        if (mod === 'ctrl') return e.ctrlKey || e.metaKey;
        if (mod === 'meta') return e.metaKey;
        if (mod === 'shift') return e.shiftKey;
        if (mod === 'alt') return e.altKey;
        return false;
      });

      if (matchModifiers && e.key.toLowerCase() === key.toLowerCase()) {
        e.preventDefault();
        stableAction();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, options?.modifiers, options?.enabled, stableAction]);
}

export function useCommandPalette() {
  const shortcuts = Array.from(registeredShortcuts.entries()).map(
    ([id, s]) => ({
      id,
      description: s.description,
      keys: formatKeys(s.key, s.modifiers),
    }),
  );

  return { shortcuts };
}

function formatKeys(key: string, modifiers?: Modifier[]): string[] {
  const parts: string[] = [];
  if (modifiers?.includes('ctrl')) parts.push('⌘');
  if (modifiers?.includes('shift')) parts.push('⇧');
  if (modifiers?.includes('alt')) parts.push('⌥');
  parts.push(key.toUpperCase());
  return parts;
}

export function registerShortcut(shortcut: Shortcut): () => void {
  const id = `${shortcut.modifiers?.sort().join('+') ?? ''}+${shortcut.key}`;
  registeredShortcuts.set(id, shortcut);
  return () => {
    registeredShortcuts.delete(id);
  };
}

export function getShortcutLabel(key: string, modifiers?: Modifier[]): string {
  return formatKeys(key, modifiers).join('+');
}
