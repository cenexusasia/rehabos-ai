// ── Marketplace Types (stub for build) ──────────────────────────────────────

export type MarketplaceItemType = 'protocol' | 'assessment' | 'exercise_template' | 'screening' | 'outcome_measure' | 'patient_education';

export type MarketplaceItemCategory = 'knee' | 'shoulder' | 'spine' | 'hip' | 'ankle' | 'elbow' | 'wrist' | 'general';

export type MarketplaceLicense = 'free' | 'premium' | 'organization';

export interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  item_type: MarketplaceItemType;
  category: MarketplaceItemCategory;
  license: MarketplaceLicense;
  is_official: boolean;
  is_featured: boolean;
  tags: string[];
  download_count: number;
  rating: number | null;
  author_name: string;
  version: string;
  created_at: string;
  updated_at: string;
}

export const MARKETPLACE_ITEM_TYPE_OPTIONS: { value: MarketplaceItemType; label: string; icon: string }[] = [
  { value: 'protocol', label: 'Protocol', icon: '📋' },
  { value: 'assessment', label: 'Assessment', icon: '📊' },
  { value: 'exercise_template', label: 'Exercise Template', icon: '💪' },
  { value: 'screening', label: 'Screening', icon: '🔍' },
  { value: 'outcome_measure', label: 'Outcome Measure', icon: '🎯' },
  { value: 'patient_education', label: 'Patient Education', icon: '📖' },
];

export const MARKETPLACE_CATEGORY_OPTIONS: { value: MarketplaceItemCategory; label: string; icon: string }[] = [
  { value: 'knee', label: 'Knee', icon: '🦵' },
  { value: 'shoulder', label: 'Shoulder', icon: '💪' },
  { value: 'spine', label: 'Spine', icon: '🔙' },
  { value: 'hip', label: 'Hip', icon: '🦵' },
  { value: 'ankle', label: 'Ankle', icon: '🦶' },
  { value: 'elbow', label: 'Elbow', icon: '💪' },
  { value: 'wrist', label: 'Wrist', icon: '✋' },
  { value: 'general', label: 'General', icon: '🏋️' },
];

export const MARKETPLACE_ITEM_TYPE_COLORS: Record<MarketplaceItemType, string> = {
  protocol: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
  assessment: 'border-purple-500/20 bg-purple-500/10 text-purple-400',
  exercise_template: 'border-green-500/20 bg-green-500/10 text-green-400',
  screening: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
  outcome_measure: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-400',
  patient_education: 'border-rose-500/20 bg-rose-500/10 text-rose-400',
};

export const LICENSE_BADGE_COLORS: Record<MarketplaceLicense, string> = {
  free: 'border-green-500/20 bg-green-500/10 text-green-400',
  premium: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
  organization: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
};
