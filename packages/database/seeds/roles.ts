/**
 * RehabOS AI — Role Seeds
 *
 * Seeds the default system roles into the database for a given organization.
 * Each role includes its name, description, and the set of permissions
 * defined in the application's permission system.
 *
 * Usage:
 *   npx tsx packages/database/seeds/roles.ts <org-id>
 *
 * Or call seedRoles(orgId) programmatically from your main seed script.
 */

import { prisma } from "../src/client";
import { ROLES } from "../../../apps/web/src/lib/permissions";

export type RoleName = "admin" | "clinician" | "billing_admin" | "front_desk";

interface RoleSeed {
  name: RoleName;
  description: string;
}

const ROLE_DEFINITIONS: RoleSeed[] = [
  {
    name: "admin",
    description:
      "Full system access — manage users, settings, patients, billing, and audit logs",
  },
  {
    name: "clinician",
    description:
      "Core clinical user — manage patients, SOAP notes, assessments, and view schedules",
  },
  {
    name: "billing_admin",
    description: "Billing and financial operations — manage invoices and payments",
  },
  {
    name: "front_desk",
    description:
      "Front desk staff — manage patient intake, scheduling, and check-in",
  },
];

/**
 * Seed all default roles for a given organization.
 * Uses upsert so it's safe to run multiple times.
 */
export async function seedRoles(organizationId: string): Promise<void> {
  console.log(`🌱 Seeding roles for organization: ${organizationId}`);

  for (const def of ROLE_DEFINITIONS) {
    const permissions = ROLES[def.name] ?? [];

    await prisma.role.upsert({
      where: {
        organizationId_name: {
          organizationId,
          name: def.name,
        },
      },
      create: {
        organizationId,
        name: def.name,
        description: def.description,
        isSystem: true,
        permissions,
      },
      update: {
        description: def.description,
        permissions,
      },
    });

    console.log(`  ✅ ${def.name} — ${permissions.length} permissions`);
  }

  console.log("✅ Roles seeded successfully");
}

/**
 * Run directly via CLI: `npx tsx packages/database/seeds/roles.ts <org-id>`
 */
async function main() {
  const orgId = process.argv[2];

  if (!orgId) {
    console.error(
      "❌ Please provide an organization ID:\n  npx tsx packages/database/seeds/roles.ts <org-id>",
    );
    process.exit(1);
  }

  try {
    await seedRoles(orgId);
  } catch (error) {
    console.error("❌ Failed to seed roles:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Allow both direct execution and programmatic import
if (require.main === module) {
  main();
}
