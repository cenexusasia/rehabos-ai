'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from 'react';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Eye,
  EyeOff,
  Download,
  Upload,
  Loader2,
  Clock,
  Type,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SoapSectionData {
  html: string;
}

export interface SoapEditorData {
  subjective: SoapSectionData;
  objective: SoapSectionData;
  assessment: SoapSectionData;
  plan: SoapSectionData;
}

interface SoapEditorProps {
  initialData?: SoapEditorData;
  onSave?: (data: SoapEditorData) => void | Promise<void>;
  onDirtyChange?: (dirty: boolean) => void;
  autoSaveInterval?: number; // ms, default 30000
  readOnly?: boolean;
}

// ---------------------------------------------------------------------------
// Section config
// ---------------------------------------------------------------------------

interface SectionConfig {
  key: keyof SoapEditorData;
  label: string;
  abbr: string;
  placeholder: string;
  barColor: string;
  borderColor: string;
  textColor: string;
  bgHover: string;
}

const sectionConfigs: SectionConfig[] = [
  {
    key: 'subjective',
    label: 'Subjective',
    abbr: 'S',
    placeholder: 'Patient-reported symptoms, history, complaints, pain levels...',
    barColor: 'bg-blue-500/15',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-400',
    bgHover: 'hover:bg-blue-500/5',
  },
  {
    key: 'objective',
    label: 'Objective',
    abbr: 'O',
    placeholder: 'Clinical findings, vitals, ROM measurements, gait, palpation, special tests...',
    barColor: 'bg-green-500/15',
    borderColor: 'border-green-500/30',
    textColor: 'text-green-400',
    bgHover: 'hover:bg-green-500/5',
  },
  {
    key: 'assessment',
    label: 'Assessment',
    abbr: 'A',
    placeholder: 'Clinical impression, diagnosis, progress toward goals, prognosis...',
    barColor: 'bg-amber-500/15',
    borderColor: 'border-amber-500/30',
    textColor: 'text-amber-400',
    bgHover: 'hover:bg-amber-500/5',
  },
  {
    key: 'plan',
    label: 'Plan',
    abbr: 'P',
    placeholder: 'Treatment plan, exercises, frequency, next visit, referrals...',
    barColor: 'bg-purple-500/15',
    borderColor: 'border-purple-500/30',
    textColor: 'text-purple-400',
    bgHover: 'hover:bg-purple-500/5',
  },
];

// ---------------------------------------------------------------------------
// Toolbar button
// ---------------------------------------------------------------------------

function ToolbarButton({
  onClick,
  active,
  disabled,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'rounded-md p-1.5 text-sm transition-colors',
        active
          ? 'bg-primary/20 text-primary'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        disabled && 'cursor-not-allowed opacity-40',
      )}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Section editor
// ---------------------------------------------------------------------------

interface SectionEditorProps {
  config: SectionConfig;
  initialHtml: string;
  readOnly: boolean;
  editorRefs: React.MutableRefObject<Map<string, ReturnType<typeof useEditor>>>;
  onChange: () => void;
}

function SectionEditor({
  config,
  initialHtml,
  readOnly,
  editorRefs,
  onChange,
}: SectionEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Placeholder.configure({
        placeholder: config.placeholder,
      }),
    ],
    content: initialHtml || '',
    editable: !readOnly,
    editorProps: {
      attributes: {
        class:
          'prose prose-sm prose-invert max-w-none focus:outline-none min-h-[100px] px-4 py-3 ' +
          'prose-p:my-1 prose-p:leading-relaxed ' +
          'prose-ul:my-1 prose-ol:my-1 ' +
          'prose-li:my-0.5 ' +
          'prose-headings:text-foreground ' +
          'prose-strong:text-foreground prose-strong:font-semibold',
      },
    },
    onUpdate: () => {
      onChange();
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor) {
      editorRefs.current.set(config.key, editor);
      return () => {
        editorRefs.current.delete(config.key);
      };
    }
  }, [editor, config.key, editorRefs]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(!readOnly);
    }
  }, [editor, readOnly]);

  const toggleBold = useCallback(() => {
    editor?.chain().focus().toggleBold().run();
  }, [editor]);

  const toggleItalic = useCallback(() => {
    editor?.chain().focus().toggleItalic().run();
  }, [editor]);

  const toggleBulletList = useCallback(() => {
    editor?.chain().focus().toggleBulletList().run();
  }, [editor]);

  const toggleOrderedList = useCallback(() => {
    editor?.chain().focus().toggleOrderedList().run();
  }, [editor]);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm transition-shadow hover:shadow-md">
      {/* Section header */}
      <div
        className={cn(
          'flex items-center justify-between px-4 py-2.5 border-b',
          config.barColor,
          config.borderColor,
          'border-l-4',
        )}
      >
        <div className={cn('flex items-center gap-2')}>
          <span
            className={cn(
              'inline-flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold',
              config.barColor,
              config.textColor,
            )}
          >
            {config.abbr}
          </span>
          <span className={cn('text-sm font-semibold', config.textColor)}>
            {config.label}
          </span>
        </div>

        {/* Mini toolbar per section */}
        {!readOnly && (
          <div className="flex items-center gap-0.5">
            <ToolbarButton
              onClick={toggleBold}
              active={editor?.isActive('bold')}
              title="Bold (Ctrl+B)"
            >
              <Bold className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton
              onClick={toggleItalic}
              active={editor?.isActive('italic')}
              title="Italic (Ctrl+I)"
            >
              <Italic className="h-3.5 w-3.5" />
            </ToolbarButton>
            <span className="mx-0.5 h-4 w-px bg-border" />
            <ToolbarButton
              onClick={toggleBulletList}
              active={editor?.isActive('bulletList')}
              title="Bullet list"
            >
              <List className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton
              onClick={toggleOrderedList}
              active={editor?.isActive('orderedList')}
              title="Ordered list"
            >
              <ListOrdered className="h-3.5 w-3.5" />
            </ToolbarButton>
          </div>
        )}
      </div>

      {/* Editor content */}
      <EditorContent editor={editor} className="tiptap-section" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Word/character count
// ---------------------------------------------------------------------------

function getCounts(editors: Map<string, ReturnType<typeof useEditor>>) {
  let words = 0;
  let chars = 0;
  for (const editor of editors.values()) {
    const text = editor?.getText() ?? '';
    chars += text.length;
    words += text ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  }
  return { words, chars };
}

// ---------------------------------------------------------------------------
// Main SOAP Editor
// ---------------------------------------------------------------------------

export function SoapEditor({
  initialData,
  onSave,
  onDirtyChange,
  autoSaveInterval = 30000,
  readOnly = false,
}: SoapEditorProps) {
  const editorRefs = useRef<Map<string, ReturnType<typeof useEditor>>>(new Map());
  const [previewMode, setPreviewMode] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [wordCount, setWordCount] = useState({ words: 0, chars: 0 });

  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveInProgressRef = useRef(false);

  // Build preview data from the editors
  const previewData = useMemo((): SoapEditorData | null => {
    if (!previewMode && !readOnly) return null;
    const data: SoapEditorData = {
      subjective: { html: '' },
      objective: { html: '' },
      assessment: { html: '' },
      plan: { html: '' },
    };
    for (const config of sectionConfigs) {
      const editor = editorRefs.current.get(config.key);
      if (editor) {
        data[config.key] = { html: editor.getHTML() };
      }
    }
    return data;
  }, [previewMode, readOnly]);

  // Get current data from editors
  const getCurrentData = useCallback((): SoapEditorData => {
    const data: SoapEditorData = {
      subjective: { html: '' },
      objective: { html: '' },
      assessment: { html: '' },
      plan: { html: '' },
    };
    for (const config of sectionConfigs) {
      const editor = editorRefs.current.get(config.key);
      if (editor) {
        data[config.key] = { html: editor.getHTML() };
      }
    }
    return data;
  }, []);

  // Perform the actual save
  const doSave = useCallback(async () => {
    if (saveInProgressRef.current) return;
    saveInProgressRef.current = true;
    setIsSaving(true);

    try {
      const data = getCurrentData();
      await onSave?.(data);
      setLastSaved(new Date());
      setIsDirty(false);
      onDirtyChange?.(false);
    } catch (err) {
      console.error('Auto-save failed:', err);
    } finally {
      setIsSaving(false);
      saveInProgressRef.current = false;
    }
  }, [getCurrentData, onSave, onDirtyChange]);

  // Mark dirty and start/restart auto-save timer
  const markDirty = useCallback(() => {
    if (readOnly) return;
    setIsDirty(true);
    onDirtyChange?.(true);

    // Update word count
    setWordCount(getCounts(editorRefs.current));

    // Reset auto-save timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = setTimeout(() => {
      doSave();
    }, autoSaveInterval);
  }, [readOnly, onDirtyChange, autoSaveInterval, doSave]);

  // Manual save
  const handleSave = useCallback(async () => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    await doSave();
  }, [doSave]);

  // Import from JSON
  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = JSON.parse(evt.target?.result as string) as SoapEditorData;
          for (const config of sectionConfigs) {
            const editor = editorRefs.current.get(config.key);
            if (editor && data[config.key]?.html) {
              editor.commands.setContent(data[config.key].html);
            }
          }
          markDirty();
        } catch (err) {
          console.error('Failed to parse imported JSON:', err);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [markDirty]);

  // Export as JSON
  const handleExport = useCallback(() => {
    const data = getCurrentData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `soap-note-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [getCurrentData]);

  // Cleanup auto-save timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  const initialHtmlMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const config of sectionConfigs) {
      map[config.key] = initialData?.[config.key]?.html ?? '';
    }
    return map;
  }, [initialData]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-2.5 shadow-sm">
        <div className="flex items-center gap-1">
          {!readOnly && (
            <>
              <ToolbarButton
                onClick={() => setPreviewMode(!previewMode)}
                active={previewMode}
                title={previewMode ? 'Edit mode' : 'Preview mode'}
              >
                {previewMode ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </ToolbarButton>
              <span className="mx-1 h-4 w-px bg-border" />

              <ToolbarButton onClick={handleImport} title="Import from JSON">
                <Upload className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton onClick={handleExport} title="Export as JSON">
                <Download className="h-4 w-4" />
              </ToolbarButton>

              <span className="mx-1 h-4 w-px bg-border" />
            </>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {/* Word/char count */}
          <div className="flex items-center gap-1.5">
            <Type className="h-3 w-3" />
            <span>{wordCount.words} words</span>
            <span className="opacity-40">|</span>
            <span>{wordCount.chars} chars</span>
          </div>

          {/* Auto-save indicator */}
          {!readOnly && (
            <>
              {isSaving ? (
                <span className="flex items-center gap-1 text-primary">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Saving...
                </span>
              ) : isDirty ? (
                <span className="flex items-center gap-1 text-yellow-400">
                  <Clock className="h-3 w-3" />
                  Unsaved
                </span>
              ) : lastSaved ? (
                <span className="text-muted-foreground/60">
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              ) : null}

              {isDirty && (
                <button
                  onClick={handleSave}
                  className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Save
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Section editors */}
      {previewMode || readOnly ? (
        /* Preview / Read-only mode — render saved HTML */
        <div className="space-y-4">
          {sectionConfigs.map((config) => {
            const html = previewData?.[config.key]?.html ?? '';
            return (
              <div
                key={config.key}
                className="rounded-xl border border-border bg-card overflow-hidden shadow-sm"
              >
                <div
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 border-b border-l-4',
                    config.barColor,
                    config.borderColor,
                  )}
                >
                  <span
                    className={cn(
                      'inline-flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold',
                      config.barColor,
                      config.textColor,
                    )}
                  >
                    {config.abbr}
                  </span>
                  <span className={cn('text-sm font-semibold', config.textColor)}>
                    {config.label}
                  </span>
                </div>
                <div className="p-4">
                  {html && html !== '<p></p>' ? (
                    <div
                      className="prose prose-sm prose-invert max-w-none
                        prose-p:my-1 prose-p:leading-relaxed prose-p:text-foreground
                        prose-li:text-foreground prose-li:my-0.5
                        prose-strong:text-foreground prose-strong:font-semibold
                        prose-em:text-foreground/80
                        prose-ul:my-1 prose-ol:my-1
                        prose-headings:text-foreground"
                      dangerouslySetInnerHTML={{ __html: html }}
                    />
                  ) : (
                    <p className="text-muted-foreground/60 text-sm italic">
                      No content
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Edit mode */
        <div className="space-y-4">
          {sectionConfigs.map((config) => (
            <SectionEditor
              key={config.key}
              config={config}
              initialHtml={initialHtmlMap[config.key] ?? ''}
              readOnly={readOnly}
              editorRefs={editorRefs}
              onChange={markDirty}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default SoapEditor;
