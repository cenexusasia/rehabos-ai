import { prisma } from '../src/client';
import { exerciseSeeds } from '../../exercise-library/src/exercises';

async function main() {
  console.log('🌱 Seeding exercises...');

  const cats = await prisma.exerciseCategory.findMany();
  const catMap = new Map(cats.map((c) => [c.slug, c.id]));
  const orgId = '2361715b-21e8-44bc-a816-425e2dc3e63f';

  let seeded = 0;
  let skipped = 0;

  for (const ex of exerciseSeeds) {
    const catId = catMap.get(ex.categorySlug);
    if (!catId) {
      skipped++;
      continue;
    }

    const id = ex.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/^-+|-+$/g, '');

    const data = {
      name: ex.name,
      description: ex.description ?? '',
      instructions: ex.instructions ?? '',
      cueingPoints: ex.cueingPoints ?? [],
      categoryId: catId,
      difficulty: ex.difficulty ?? 'beginner',
      equipment: ex.equipment ?? [],
      bodyRegions: ex.bodyRegions ?? [],
      movementPatterns: ex.movementPatterns ?? [],
      contraindications: ex.contraindications ?? [],
      precautions: ex.precautions ?? [],
      updatedAt: new Date(),
    };

    await prisma.exercise.upsert({
      where: { id },
      update: data,
      create: {
        id,
        organizationId: orgId,
        ...data,
        createdAt: new Date(),
      },
    });
    seeded++;
  }

  console.log(`✅ ${seeded} exercises seeded (${skipped} skipped)`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('Failed:', e);
  process.exit(1);
});
