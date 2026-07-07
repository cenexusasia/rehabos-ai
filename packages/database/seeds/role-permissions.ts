import { prisma } from "../src/client";

interface RoleDef {
  name: string;
  description: string;
  permissions: string[];
}

const roles: Record<string, RoleDef> = {
  admin: {
    name: "admin",
    description: "Full system access with all administrative, clinical, billing, and configuration permissions",
    permissions: ["*"],
  },
  clinician: {
    name: "clinician",
    description: "Clinical staff with full patient care, documentation, exercise prescription, and scheduling permissions",
    permissions: [
      "patient:read",
      "patient:write",
      "patient:delete",
      "chart:read",
      "chart:write",
      "chart:sign",
      "soap:read",
      "soap:write",
      "soap:sign",
      "assessment:read",
      "assessment:write",
      "assessment:administer",
      "exercise:read",
      "exercise:write",
      "exercise:prescribe",
      "protocol:read",
      "protocol:apply",
      "schedule:read",
      "schedule:write",
      "message:read",
      "message:write",
      "telehealth:start",
      "telehealth:join",
      "referral:read",
      "referral:write",
    ],
  },
  billing_admin: {
    name: "billing_admin",
    description: "Billing department staff with full financial operations and patient record read access",
    permissions: [
      "patient:read",
      "billing:read",
      "billing:write",
      "billing:delete",
      "invoice:read",
      "invoice:write",
      "invoice:delete",
      "payment:read",
      "payment:write",
      "payment:refund",
      "insurance:read",
      "insurance:write",
      "report:billing",
    ],
  },
  front_desk: {
    name: "front_desk",
    description: "Front office staff managing patient intake, scheduling, and basic administrative tasks",
    permissions: [
      "patient:read",
      "patient:write",
      "schedule:read",
      "schedule:write",
      "message:read",
      "message:write",
    ],
  },
};

async function main() {
  console.log("🌱 Seeding roles and permissions...");

  // Ensure a default organization exists for seeding system-level roles.
  // In production, roles are created per-organization.
  const org = await prisma.organization.upsert({
    where: { slug: "default" },
    update: {},
    create: {
      name: "Default Organization",
      slug: "default",
      timezone: "UTC",
    },
  });
  console.log(`  ✅ Default organization: ${org.name} (${org.id})`);

  for (const [key, role] of Object.entries(roles)) {
    const record = await prisma.role.upsert({
      where: {
        organizationId_name: {
          organizationId: org.id,
          name: role.name,
        },
      },
      update: {
        description: role.description,
        permissions: role.permissions,
        isSystem: true,
      },
      create: {
        organizationId: org.id,
        name: role.name,
        description: role.description,
        permissions: role.permissions,
        isSystem: true,
      },
    });
    console.log(`  ✅ Role: ${record.name} — ${record.permissions.length} permission(s)`);
    if (record.permissions.length > 5) {
      console.log(`    ${record.permissions.slice(0, 5).join(", ")}, ... (${record.permissions.length - 5} more)`);
    } else {
      console.log(`    ${record.permissions.join(", ")}`);
    }
  }

  console.log("✅ Roles and permissions seeded successfully");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding roles and permissions:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
