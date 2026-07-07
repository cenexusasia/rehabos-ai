import { prisma } from "../src/client";

interface CategoryDef {
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
  children?: CategoryDef[];
}

const categoryTree: CategoryDef[] = [
  {
    name: "Strength",
    slug: "strength",
    description: "Exercises focused on building muscular strength, power, and endurance through resistance training",
    sortOrder: 1,
    children: [
      { name: "Upper Body", slug: "upper_body", description: "Strength exercises targeting the shoulders, arms, chest, and upper back", sortOrder: 1 },
      { name: "Lower Body", slug: "lower_body", description: "Strength exercises targeting the hips, thighs, glutes, and calves", sortOrder: 2 },
      { name: "Core", slug: "core", description: "Strength exercises targeting the abdominals, obliques, and lumbar stabilizers", sortOrder: 3 },
      { name: "Total Body", slug: "total_body", description: "Compound strength exercises engaging multiple major muscle groups simultaneously", sortOrder: 4 },
    ],
  },
  {
    name: "Flexibility",
    slug: "flexibility",
    description: "Exercises and techniques aimed at improving joint range of motion and muscle extensibility",
    sortOrder: 2,
    children: [
      { name: "Stretching", slug: "stretching", description: "Static and dynamic stretching exercises to improve muscle length and joint mobility", sortOrder: 1 },
      { name: "Range of Motion", slug: "range_of_motion", description: "Gentle exercises to maintain or restore normal joint movement patterns", sortOrder: 2 },
      { name: "Pilates", slug: "pilates", description: "Mind-body exercises emphasizing core strength, flexibility, and controlled movement", sortOrder: 3 },
    ],
  },
  {
    name: "Balance",
    slug: "balance",
    description: "Exercises designed to improve postural stability, equilibrium, and fall prevention",
    sortOrder: 3,
    children: [
      { name: "Static Balance", slug: "static_balance", description: "Exercises performed in a stationary position to challenge standing stability", sortOrder: 1 },
      { name: "Dynamic Balance", slug: "dynamic_balance", description: "Exercises combining movement with balance challenges for functional stability", sortOrder: 2 },
      { name: "Proprioception", slug: "proprioception", description: "Exercises enhancing joint position sense and neuromuscular control", sortOrder: 3 },
    ],
  },
  {
    name: "Coordination",
    slug: "coordination",
    description: "Exercises targeting motor control, agility, and neuromuscular coordination",
    sortOrder: 4,
  },
  {
    name: "Endurance",
    slug: "endurance",
    description: "Cardiovascular and muscular endurance exercises for sustained activity tolerance",
    sortOrder: 5,
  },
  {
    name: "Manual Therapy",
    slug: "manual_therapy",
    description: "Hands-on techniques including joint mobilization, soft tissue mobilization, and myofascial release",
    sortOrder: 6,
  },
  {
    name: "Neuromuscular Re-education",
    slug: "neuromuscular_re_education",
    description: "Therapeutic exercises to restore normal movement patterns, muscle recruitment, and motor control",
    sortOrder: 7,
  },
  {
    name: "Gait Training",
    slug: "gait_training",
    description: "Exercises and techniques focused on improving walking mechanics, symmetry, and efficiency",
    sortOrder: 8,
  },
];

async function main() {
  console.log("🌱 Seeding exercise categories...");

  for (const parent of categoryTree) {
    const parentRecord = await prisma.exerciseCategory.upsert({
      where: { slug: parent.slug },
      update: {
        name: parent.name,
        description: parent.description,
        sortOrder: parent.sortOrder,
      },
      create: {
        name: parent.name,
        slug: parent.slug,
        description: parent.description,
        sortOrder: parent.sortOrder,
      },
    });
    console.log(`  ✅ Parent category: ${parent.name} (${parentRecord.id})`);

    if (parent.children) {
      for (const child of parent.children) {
        const childRecord = await prisma.exerciseCategory.upsert({
          where: { slug: child.slug },
          update: {
            name: child.name,
            description: child.description,
            sortOrder: child.sortOrder,
            parentId: parentRecord.id,
          },
          create: {
            name: child.name,
            slug: child.slug,
            description: child.description,
            sortOrder: child.sortOrder,
            parentId: parentRecord.id,
          },
        });
        console.log(`    ✅ Child category: ${child.name} (${childRecord.id})`);
      }
    }
  }

  console.log("✅ Exercise categories seeded successfully");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding exercise categories:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
