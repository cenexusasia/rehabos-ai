import { Meilisearch } from 'meilisearch';
import type { SearchParams } from 'meilisearch';

const MEILI_HOST = process.env.NEXT_PUBLIC_MEILI_HOST || process.env.MEILI_HOST || 'http://localhost:7700';
const MEILI_KEY = process.env.MEILI_MASTER_KEY || 'rehabos-dev-master-key';

export const searchClient = new Meilisearch({
  host: MEILI_HOST,
  apiKey: MEILI_KEY,
});

export const SEARCH_INDEXES = {
  EXERCISES: 'exercises',
  PATIENTS: 'patients',
  SOAP_NOTES: 'soap_notes',
  PROTOCOLS: 'protocols',
  EXERCISE_CATEGORIES: 'exercise_categories',
} as const;

export type SearchIndex = (typeof SEARCH_INDEXES)[keyof typeof SEARCH_INDEXES];

export async function searchIndex<T extends Record<string, any>>(
  index: SearchIndex,
  query: string,
  options?: {
    limit?: number;
    offset?: number;
    filter?: string[];
    sort?: string[];
    facets?: string[];
  },
) {
  const client = searchClient.index<T>(index);
  return client.search(query, {
    limit: options?.limit ?? 20,
    offset: options?.offset,
    filter: options?.filter,
    sort: options?.sort,
    facets: options?.facets,
  } as SearchParams);
}

export async function addDocuments<T extends Record<string, any>>(
  index: SearchIndex,
  documents: T[],
) {
  const client = searchClient.index<T>(index);
  return client.addDocuments(documents);
}

export async function deleteDocuments(
  index: SearchIndex,
  documentIds: string[],
) {
  const client = searchClient.index(index);
  return client.deleteDocuments(documentIds);
}

export async function updateIndexSettings(
  index: SearchIndex,
  settings: {
    searchableAttributes?: string[];
    filterableAttributes?: string[];
    sortableAttributes?: string[];
    rankingRules?: string[];
  },
) {
  const client = searchClient.index(index);
  return client.updateSettings(settings);
}
