import { prisma } from "../src/client";

interface BodyRegionDef {
  slug: string;
  name: string;
  description: string;
  commonDiagnoses: string[];
}

const bodyRegions: BodyRegionDef[] = [
  {
    slug: "full_body",
    name: "Full Body",
    description: "The entire body as a single functional unit, used for systemic conditions and total-body rehabilitation",
    commonDiagnoses: [
      "deconditioning",
      "generalized weakness",
      "chronic fatigue syndrome",
      "fibromyalgia",
      "systemic inflammatory conditions",
    ],
  },
  {
    slug: "head_neck",
    name: "Head and Neck",
    description: "The craniocervical region including the skull, cervical vertebrae, and associated musculature",
    commonDiagnoses: [
      "cervicogenic headache",
      "tension headache",
      "temporomandibular joint dysfunction",
      "whiplash associated disorder",
      "cervical dystonia",
    ],
  },
  {
    slug: "cervical_spine",
    name: "Cervical Spine",
    description: "The seven cervical vertebrae (C1-C7) and associated intervertebral discs, ligaments, and nerves",
    commonDiagnoses: [
      "cervical radiculopathy",
      "cervical spondylosis",
      "cervical disc herniation",
      "cervical stenosis",
      "mechanical neck pain",
      "cervical facet syndrome",
    ],
  },
  {
    slug: "thoracic_spine",
    name: "Thoracic Spine",
    description: "The twelve thoracic vertebrae (T1-T12) articulating with the rib cage and supporting upper back posture",
    commonDiagnoses: [
      "thoracic spine dysfunction",
      "postural kyphosis",
      "Scheuermann's disease",
      "thoracic outlet syndrome",
      "costovertebral joint dysfunction",
      "mid-back pain",
    ],
  },
  {
    slug: "lumbar_spine",
    name: "Lumbar Spine",
    description: "The five lumbar vertebrae (L1-L5) bearing the majority of trunk weight and providing lumbopelvic stability",
    commonDiagnoses: [
      "lumbar disc herniation",
      "lumbar radiculopathy / sciatica",
      "lumbar spinal stenosis",
      "mechanical low back pain",
      "spondylolisthesis",
      "facet joint syndrome",
      "lumbar strain",
    ],
  },
  {
    slug: "shoulder",
    name: "Shoulder",
    description: "The glenohumeral joint, scapulothoracic articulation, clavicle, and surrounding rotator cuff musculature",
    commonDiagnoses: [
      "rotator cuff tear / tendinopathy",
      "frozen shoulder / adhesive capsulitis",
      "shoulder impingement syndrome",
      "glenohumeral instability",
      "labral tear (SLAP/Bankart)",
      "acromioclavicular joint sprain",
      "shoulder osteoarthritis",
    ],
  },
  {
    slug: "elbow",
    name: "Elbow",
    description: "The humeroulnar, humeroradial, and proximal radioulnar joints enabling forearm flexion, extension, and rotation",
    commonDiagnoses: [
      "lateral epicondylitis (tennis elbow)",
      "medial epicondylitis (golfer's elbow)",
      "olecranon bursitis",
      "elbow osteoarthritis",
      "distal biceps tendon rupture",
      "ulnar collateral ligament sprain",
    ],
  },
  {
    slug: "wrist_hand",
    name: "Wrist and Hand",
    description: "The radiocarpal, intercarpal, carpometacarpal, metacarpophalangeal, and interphalangeal joints",
    commonDiagnoses: [
      "carpal tunnel syndrome",
      "De Quervain's tenosynovitis",
      "trigger finger",
      "wrist fracture (distal radius)",
      "carpometacarpal osteoarthritis",
      "ganglion cyst",
      "rheumatoid arthritis of hand",
    ],
  },
  {
    slug: "hip",
    name: "Hip",
    description: "The acetabulofemoral joint providing weight-bearing support and multi-planar lower extremity movement",
    commonDiagnoses: [
      "hip osteoarthritis",
      "femoroacetabular impingement",
      "labral tear",
      "greater trochanteric pain syndrome",
      "hip bursitis",
      "gluteal tendinopathy",
      "post-hip replacement rehabilitation",
    ],
  },
  {
    slug: "knee",
    name: "Knee",
    description: "The tibiofemoral and patellofemoral joints providing lower extremity stability and mobility",
    commonDiagnoses: [
      "anterior cruciate ligament sprain/tear",
      "meniscal tear",
      "patellofemoral pain syndrome",
      "knee osteoarthritis",
      "medial collateral ligament sprain",
      "patellar tendinopathy",
      "post-total knee replacement rehabilitation",
      "iliotibial band syndrome",
    ],
  },
  {
    slug: "ankle_foot",
    name: "Ankle and Foot",
    description: "The tibiotalar, subtalar, midtarsal, tarsometatarsal, metatarsophalangeal, and interphalangeal joints",
    commonDiagnoses: [
      "lateral ankle sprain",
      "chronic ankle instability",
      "Achilles tendinopathy / rupture",
      "plantar fasciitis",
      "posterior tibial tendon dysfunction",
      "hallux valgus / bunion",
      "Morton's neuroma",
      "stress fracture of foot",
    ],
  },
];

async function main() {
  console.log("🌱 Seeding body region reference data...");

  // NOTE: There is currently no dedicated `BodyRegion` Prisma model.
  // Body regions are stored as `String[]` on Exercise, Assessment, and Protocol models.
  // This seed stores the reference data under the `body_regions` system setting key
  // for use as a controlled vocabulary / lookup table.
  // When a dedicated BodyRegion model is added to the schema, this seed should be
  // migrated to use prisma.bodyRegion.upsert().

  const payload = bodyRegions.map((r) => ({
    slug: r.slug,
    name: r.name,
    description: r.description,
    commonDiagnoses: r.commonDiagnoses,
  }));

  await prisma.systemSetting.upsert({
    where: { key: "body_regions" },
    update: { value: payload, type: "json" },
    create: { key: "body_regions", value: payload, type: "json" },
  });

  console.log(`  ✅ Stored ${bodyRegions.length} body region entries in system_settings`);

  for (const region of bodyRegions) {
    console.log(`    - ${region.name} (${region.slug}): ${region.commonDiagnoses.length} common diagnoses`);
  }

  console.log("✅ Body region reference data seeded successfully");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding body regions:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
