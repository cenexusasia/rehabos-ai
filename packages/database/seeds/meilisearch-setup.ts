import { Meilisearch } from 'meilisearch';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const meili = new Meilisearch({
  host: process.env.MEILI_HOST || 'http://localhost:7700',
  apiKey: process.env.MEILI_MASTER_KEY || 'rehabos-dev-master-key',
});

async function setupExerciseIndex() {
  const index = meili.index('exercises');

  await index.updateSettings({
    searchableAttributes: ['name', 'description', 'instructions', 'bodyRegions', 'categories'],
    filterableAttributes: ['bodyRegionIds', 'categoryIds', 'difficulty', 'equipment'],
    sortableAttributes: ['name', 'createdAt'],
    rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
  });

  console.log('✓ Meilisearch "exercises" index configured');
}

async function setupPatientIndex() {
  const index = meili.index('patients');

  await index.updateSettings({
    searchableAttributes: ['firstName', 'lastName', 'email', 'phone', 'diagnosis'],
    filterableAttributes: ['organizationId', 'clinicianId', 'status'],
    sortableAttributes: ['lastName', 'createdAt'],
    rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
  });

  console.log('✓ Meilisearch "patients" index configured');
}

async function setupSoapNotesIndex() {
  const index = meili.index('soap_notes');

  await index.updateSettings({
    searchableAttributes: ['subjective', 'objective', 'assessment', 'plan', 'patientName'],
    filterableAttributes: ['patientId', 'clinicianId', 'organizationId', 'status'],
    sortableAttributes: ['createdAt', 'updatedAt'],
    rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
  });

  console.log('✓ Meilisearch "soap_notes" index configured');
}

async function setupProtocolIndex() {
  const index = meili.index('protocols');

  await index.updateSettings({
    searchableAttributes: ['name', 'description', 'goals', 'tags'],
    filterableAttributes: ['organizationId', 'categoryId', 'isPublic'],
    sortableAttributes: ['name', 'createdAt'],
    rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
  });

  console.log('✓ Meilisearch "protocols" index configured');
}

async function main() {
  console.log('Setting up Meilisearch indexes for RehabOS AI...\n');

  try {
    const health = await meili.health();
    console.log(`Meilisearch server: ${health.status}\n`);
  } catch {
    console.error('⚠ Meilisearch server not reachable. Make sure it is running.');
    console.error('  Default: http://localhost:7700');
    console.error('  Start: docker compose up -d meilisearch\n');
    process.exit(1);
  }

  await Promise.all([
    setupExerciseIndex(),
    setupPatientIndex(),
    setupSoapNotesIndex(),
    setupProtocolIndex(),
  ]);

  console.log('\n✓ All Meilisearch indexes configured successfully!');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('Failed to configure Meilisearch:', e);
  process.exit(1);
});
