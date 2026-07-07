/**
 * RehabOS AI — Special Orthopedic Tests Seed
 *
 * Seeds common orthopedic special tests as Assessment records with
 * category = 'special_test'. Sensitivity and specificity values from
 * the literature are stored in the normative_data JSON field.
 *
 * Usage:
 *   npx tsx packages/database/seeds/special-tests.ts
 *
 * Or import call seedSpecialTests() programmatically.
 */

import { prisma } from '../src/client';
import type { AssessmentCategory } from '@prisma/client';

// ── Types ─────────────────────────────────────────────────────────────────

interface SpecialTestSeed {
  name: string;
  subcategory: string;
  bodyRegions: string[];
  description: string;
  instructions: string;
  conditions: string[];
  estimatedDurationMinutes: number;
  sensitivity: number;
  specificity: number;
  positiveFindings: string;
  negativeFindings: string;
  cautions: string;
}

// ── Seed Data ──────────────────────────────────────────────────────────────

const SPECIAL_TESTS: SpecialTestSeed[] = [
  // ── Knee ────────────────────────────────────────────────────────────
  {
    name: 'Lachman Test',
    subcategory: 'ACL',
    bodyRegions: ['Knee'],
    description:
      'The Lachman test is the most sensitive and specific clinical test for diagnosing ACL deficiency. It assesses anterior translation of the tibia relative to the femur with the knee in 20-30 degrees of flexion.',
    instructions:
      'Position patient supine with the knee flexed to 20-30 degrees. Stabilize the distal femur with one hand while grasping the proximal tibia with the other. Apply an anterior translation force to the tibia. Compare laxity and endpoint to the uninvolved side.',
    conditions: ['Anterior Cruciate Ligament Tear', 'ACL Deficiency'],
    estimatedDurationMinutes: 2,
    sensitivity: 0.87,
    specificity: 0.93,
    positiveFindings:
      'Increased anterior translation of the tibia compared to the uninvolved side with a soft or absent endpoint.',
    negativeFindings:
      'Firm endpoint with minimal anterior translation comparable to the uninvolved side.',
    cautions:
      'Use gentle force in acute injuries. May be difficult to perform in patients with large thigh girth or guarding.',
  },
  {
    name: 'Anterior Drawer Test',
    subcategory: 'ACL',
    bodyRegions: ['Knee'],
    description:
      'The anterior drawer test assesses anterior translation of the tibia on the femur, indicating ACL integrity. Less sensitive than the Lachman test but commonly used as part of the ACL test cluster.',
    instructions:
      "Position patient supine with the hip flexed to 45 degrees and knee flexed to 90 degrees. Sit on the patient's foot to stabilize it. Grasp the proximal tibia with both hands and apply an anterior-directed force. Observe for anterior translation.",
    conditions: ['Anterior Cruciate Ligament Tear'],
    estimatedDurationMinutes: 2,
    sensitivity: 0.55,
    specificity: 0.92,
    positiveFindings:
      'Visible anterior translation of the tibia relative to the femur greater than the uninvolved side.',
    negativeFindings: 'Minimal anterior translation with a firm endpoint.',
    cautions:
      'May be false negative in acute ACL injuries due to hemarthrosis and guarding. False positive can occur with combined ligamentous laxity.',
  },
  {
    name: 'Posterior Drawer Test',
    subcategory: 'PCL',
    bodyRegions: ['Knee'],
    description:
      'The posterior drawer test is the most sensitive and specific clinical test for diagnosing PCL deficiency. It assesses posterior translation of the tibia relative to the femur.',
    instructions:
      'Position patient supine with the hip flexed to 45 degrees and knee flexed to 90 degrees. Observe the tibial step-off at the joint line. Grasp the proximal tibia and apply a posterior-directed force. Note the amount of posterior translation.',
    conditions: ['Posterior Cruciate Ligament Tear', 'PCL Deficiency'],
    estimatedDurationMinutes: 2,
    sensitivity: 0.90,
    specificity: 0.99,
    positiveFindings:
      'Loss of the normal tibial step-off (tibia sags posteriorly relative to femur). Increased posterior translation compared to uninvolved side.',
    negativeFindings: 'Normal tibial step-off maintained with minimal posterior translation.',
    cautions:
      'Always compare to the uninvolved side. The posterior sag sign may be visible before force is even applied (gravity posterior drawer).',
  },
  {
    name: "McMurray's Test",
    subcategory: 'Meniscus',
    bodyRegions: ['Knee'],
    description:
      "McMurray's test is a provocative maneuver used to detect meniscal tears. It involves flexing and extending the knee while applying rotational stress to trap a torn meniscal fragment.",
    instructions:
      "Position patient supine. Fully flex the knee. To test the medial meniscus, externally rotate the foot and extend the knee while applying a valgus stress. For the lateral meniscus, internally rotate the foot and extend the knee while applying a varus stress. Listen and feel for a click or thud.",
    conditions: ['Meniscal Tear', 'Medial Meniscus Tear', 'Lateral Meniscus Tear'],
    estimatedDurationMinutes: 3,
    sensitivity: 0.51,
    specificity: 0.77,
    positiveFindings:
      'Audible or palpable click with reproduction of pain during the maneuver, typically localized to the joint line.',
    negativeFindings: 'No click, thud, or reproduction of pain during full range of motion.',
    cautions:
      'Low sensitivity means a negative test does not rule out meniscal tear. Use in conjunction with other meniscal tests and imaging if suspicion is high.',
  },
  {
    name: 'Thompson Test',
    subcategory: 'Achilles',
    bodyRegions: ['Ankle & Foot'],
    description:
      'The Thompson test (also called the Simmonds-Thompson test) is the gold standard physical exam test for diagnosing acute Achilles tendon rupture. It assesses the integrity of the gastrocnemius-soleus complex.',
    instructions:
      "Position patient prone with feet hanging off the edge of the examination table. Squeeze the calf muscle belly (gastrocnemius) gently but firmly. Observe for plantarflexion of the foot.",
    conditions: ['Achilles Tendon Rupture'],
    estimatedDurationMinutes: 1,
    sensitivity: 0.96,
    specificity: 0.93,
    positiveFindings:
      'Absent or markedly diminished plantarflexion of the foot when the calf is squeezed.',
    negativeFindings: 'Normal plantarflexion of the foot occurs with calf squeeze.',
    cautions:
      'False negatives may occur in partial ruptures. False positives are rare. Always compare to the uninvolved side.',
  },

  // ── Shoulder ─────────────────────────────────────────────────────────
  {
    name: 'Empty Can Test',
    subcategory: 'Rotator Cuff',
    bodyRegions: ['Shoulder'],
    description:
      "The Empty Can test (Jobe's test) assesses the integrity and function of the supraspinatus tendon. The patient attempts to resist downward pressure while the arms are positioned in 90 degrees of abduction, 30 degrees of horizontal adduction, and full internal rotation (thumbs down).",
    instructions:
      "Position patient standing or sitting. Bring the patient's shoulders to 90 degrees abduction and 30 degrees horizontal adduction (scapular plane) with thumbs pointing downward (as if emptying a can). Apply downward pressure on the patient's forearms. Ask the patient to resist.",
    conditions: ['Supraspinatus Tendinopathy', 'Supraspinatus Tear', 'Rotator Cuff Pathology'],
    estimatedDurationMinutes: 2,
    sensitivity: 0.69,
    specificity: 0.62,
    positiveFindings:
      'Pain and/or weakness with resisted downward pressure in the empty can position.',
    negativeFindings: 'No pain or weakness with resisted downward pressure.',
    cautions:
      'May be provocative in patients with subacromial impingement or other rotator cuff pathology. The Full Can test (thumbs up) may be better tolerated.',
  },
  {
    name: 'Drop Arm Test',
    subcategory: 'Rotator Cuff',
    bodyRegions: ['Shoulder'],
    description:
      'The Drop Arm test assesses for a full-thickness rotator cuff tear, particularly of the supraspinatus. A positive test indicates significant rotator cuff compromise.',
    instructions:
      "Position patient standing or sitting. Passively abduct the patient's arm to 90 degrees. Ask the patient to slowly lower the arm back to the side in a controlled manner.",
    conditions: ['Full-Thickness Rotator Cuff Tear', 'Supraspinatus Tear'],
    estimatedDurationMinutes: 1,
    sensitivity: 0.21,
    specificity: 0.92,
    positiveFindings:
      "Patient is unable to control the descent of the arm — the arm drops suddenly (drop arm sign) or the patient experiences significant pain during controlled descent.",
    negativeFindings: 'Patient can lower the arm smoothly and in a controlled manner.',
    cautions:
      'High specificity but low sensitivity — a negative test does not rule out rotator cuff pathology. Use in conjunction with other shoulder tests.',
  },
  {
    name: "Neer's Test",
    subcategory: 'Impingement',
    bodyRegions: ['Shoulder'],
    description:
      "Neer's test is a provocation test for subacromial impingement. It compresses the supraspinatus tendon, long head of the biceps tendon, and subacromial bursa between the humeral head and the acromion.",
    instructions:
      "Position patient seated or standing. Stabilize the patient's scapula with one hand. With the other hand, passively elevate the patient's arm in the scapular plane (forward flexion) through full range of motion. The test is positive if pain is reproduced before 120 degrees of elevation.",
    conditions: ['Subacromial Impingement Syndrome', 'Shoulder Impingement'],
    estimatedDurationMinutes: 1,
    sensitivity: 0.72,
    specificity: 0.60,
    positiveFindings:
      'Reproduction of shoulder pain during passive forward flexion, typically between 60-120 degrees of elevation.',
    negativeFindings: 'No pain reproduced with passive full forward flexion.',
    cautions:
      'Moderate specificity — may be positive in various shoulder pathologies. The Neer impingement sign differs from the Neer impingement test (which includes anesthetic injection).',
  },
  {
    name: 'Hawkins-Kennedy Test',
    subcategory: 'Impingement',
    bodyRegions: ['Shoulder'],
    description:
      'The Hawkins-Kennedy test assesses for subacromial impingement by compressing the supraspinatus tendon against the coracoacromial arch through internal rotation of the flexed shoulder.',
    instructions:
      'Position patient seated or standing. Flex the patient\'s shoulder and elbow to 90 degrees. With one hand stabilizing the shoulder, use the other hand to passively internally rotate the arm (bring the forearm downward).',
    conditions: ['Subacromial Impingement Syndrome', 'Shoulder Impingement'],
    estimatedDurationMinutes: 1,
    sensitivity: 0.72,
    specificity: 0.66,
    positiveFindings:
      'Reproduction of shoulder pain with internal rotation in the 90/90 position.',
    negativeFindings: 'No pain with internal rotation in the 90/90 position.',
    cautions:
      'May be positive in various shoulder pathologies including rotator cuff tendinopathy and adhesive capsulitis. Use as part of an impingement test cluster.',
  },

  // ── Hip ──────────────────────────────────────────────────────────────
  {
    name: 'FABER Test (Patrick\'s Test)',
    subcategory: 'Hip / SI Joint',
    bodyRegions: ['Hip', 'Pelvis'],
    description:
      "The FABER test (Flexion, ABduction, External Rotation), also known as Patrick's test, is a screening test for hip and sacroiliac joint pathology. It loads the hip joint and stresses the sacroiliac joint.",
    instructions:
      'Position patient supine. Place the test foot on the opposite knee (figure-4 position). Gently apply downward pressure on the test knee while stabilizing the contralateral anterior superior iliac spine (ASIS).',
    conditions: ['Sacroiliac Joint Dysfunction', 'Hip Joint Pathology'],
    estimatedDurationMinutes: 2,
    sensitivity: 0.50,
    specificity: 0.75,
    positiveFindings:
      'Pain reproduced in the ipsilateral groin (hip pathology), contralateral sacrum (SI joint pathology), or ipsilateral sacrum (SI joint pathology).',
    negativeFindings: 'No pain reproduction with knee able to lower to table level bilaterally.',
    cautions:
      'Poor localization — can be positive in both hip joint and SI joint pathology. Careful interpretation of pain location is essential.',
  },
  {
    name: 'Straight Leg Raise Test',
    subcategory: 'Lumbar Radiculopathy',
    bodyRegions: ['Lumbar Spine'],
    description:
      "The Straight Leg Raise (SLR) test, also called Lasègue's sign, is a neural tension test that places tension on the sciatic nerve and lumbosacral nerve roots. It is the most commonly used test for lumbar disc herniation.",
    instructions:
      "Position patient supine. Passively elevate the patient's leg with the knee fully extended and ankle in neutral dorsiflexion. Note the angle at which symptoms are reproduced and the distribution of symptoms.",
    conditions: ['Lumbar Radiculopathy', 'Sciatica', 'Lumbar Disc Herniation'],
    estimatedDurationMinutes: 2,
    sensitivity: 0.72,
    specificity: 0.66,
    positiveFindings:
      'Reproduction of radiating leg pain (not just hamstring tightness or low back pain) between 30-70 degrees of hip flexion.',
    negativeFindings: 'No radiating leg pain reproduced with full hip flexion.',
    cautions:
      'Distinguish between radicular pain, hamstring tightness, and low back pain. Crossed SLR is less sensitive but highly specific. Always test the uninvolved side first.',
  },

  // ── Wrist & Hand ─────────────────────────────────────────────────────
  {
    name: "Phalen's Test",
    subcategory: 'Carpal Tunnel',
    bodyRegions: ['Wrist & Hand'],
    description:
      "Phalen's test (wrist flexion test) is a provocative test for carpal tunnel syndrome. Sustained wrist flexion increases pressure within the carpal tunnel, compressing the median nerve.",
    instructions:
      'Ask the patient to hold both wrists in full (but unforced) flexion by pressing the dorsum of the hands together for 60 seconds. Note any reproduction of symptoms.',
    conditions: ['Carpal Tunnel Syndrome'],
    estimatedDurationMinutes: 2,
    sensitivity: 0.57,
    specificity: 0.72,
    positiveFindings:
      'Reproduction of paresthesia, numbness, or tingling in the median nerve distribution (thumb, index, middle, and radial half of ring finger) within 60 seconds.',
    negativeFindings: 'No reproduction of symptoms in the median nerve distribution.',
    cautions:
      'Symptoms should be in the median nerve distribution — pain in the wrists alone is not a positive test.',
  },
  {
    name: "Tinel's Sign",
    subcategory: 'Carpal Tunnel',
    bodyRegions: ['Wrist & Hand'],
    description:
      "Tinel's sign is a provocative test for nerve compression or regeneration. Percussion over the median nerve at the wrist produces tingling or paresthesia in the nerve distribution in carpal tunnel syndrome.",
    instructions:
      'Position patient with forearm supinated and wrist in neutral. Using your index or middle finger, gently percuss (tap) over the median nerve at the carpal tunnel, approximately at the level of the distal wrist crease between the palmaris longus and flexor carpi radialis tendons.',
    conditions: ['Carpal Tunnel Syndrome'],
    estimatedDurationMinutes: 1,
    sensitivity: 0.36,
    specificity: 0.76,
    positiveFindings:
      'Tingling, "pins and needles," or electric shock sensation radiating into the median nerve distribution (thumb, index, middle, radial half of ring finger).',
    negativeFindings: 'No tingling or paresthesia elicited with percussion.',
    cautions:
      'Low sensitivity — negative Tinel\'s does not rule out carpal tunnel syndrome. May be positive in nerve regeneration after injury or surgery.',
  },
];

// ── Seed Function ──────────────────────────────────────────────────────────

export async function seedSpecialTests() {
  console.log('[seed] Seeding special orthopedic tests...');

  let created = 0;
  let skipped = 0;

  for (const test of SPECIAL_TESTS) {
    const existing = await prisma.assessment.findFirst({
      where: { name: test.name, category: 'special_test' },
    });

    if (existing) {
      console.log(`  [skip] "${test.name}" already exists`);
      skipped++;
      continue;
    }

    await prisma.assessment.create({
      data: {
        name: test.name,
        category: 'special_test' as AssessmentCategory,
        subcategory: test.subcategory,
        description: test.description,
        instructions: test.instructions,
        scoringType: 'pass_fail',
        scoringInstructions: `Positive findings: ${test.positiveFindings}\n\nNegative findings: ${test.negativeFindings}\n\nCautions: ${test.cautions}`,
        higherIsBetter: true,
        normativeData: {
          sensitivity: test.sensitivity,
          specificity: test.specificity,
          positiveFindings: test.positiveFindings,
          negativeFindings: test.negativeFindings,
          cautions: test.cautions,
        },
        bodyRegions: test.bodyRegions,
        conditions: test.conditions,
        estimatedDurationMinutes: test.estimatedDurationMinutes,
        requiredEquipment: ['None'],
        isStandardized: true,
        version: '1.0',
        questions: [
          {
            id: 'result',
            questionType: 'multiple_choice',
            questionText: 'Test Result',
            options: ['Positive', 'Negative', 'Inconclusive'],
            required: true,
            weight: 1,
            sortOrder: 0,
          },
        ],
        published: true,
      },
    });

    created++;
  }

  console.log(`[seed] Special tests: ${created} created, ${skipped} skipped, ${SPECIAL_TESTS.length} total`);
  return { created, skipped, total: SPECIAL_TESTS.length };
}

// ── CLI Entrypoint ─────────────────────────────────────────────────────────

async function main() {
  const result = await seedSpecialTests();
  console.log(`\nDone. ${result.created} tests created.`);
}

if (require.main === module) {
  main()
    .catch((err) => {
      console.error('[seed] Fatal error:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
