import { prisma } from "./client";
import { seedRoles } from "../seeds/roles";

async function main() {
  console.log("🌱 Seeding database...");

  // Seed default roles
  // Provide an organization ID or skip if none exists yet
  const orgId = process.env.SEED_ORG_ID;
  if (orgId) {
    await seedRoles(orgId);
  } else {
    console.log(
      "  ⏭️  Skipping role seeds — set SEED_ORG_ID env var to seed roles",
    );
  }

  console.log("✅ Database seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
