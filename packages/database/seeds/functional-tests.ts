/**
 * RehabOS AI — Functional Performance Tests Seed
 *
 * Seeds common functional performance tests as Assessment records with
 * category = 'functional_test'. Normative data by age/gender is stored
 * in the normative_data JSON field.
 *
 * Usage:
 *   npx tsx packages/database/seeds/functional-tests.ts
 *
 * Or import call seedFunctionalTests() programmatically.
 */

import { prisma } from '../src/client';
import type { AssessmentCategory } from '@prisma/client';

// ── Types ─────────────────────────────────────────────────────────────────

interface NormativeRange {
  ageRange: string;
  gender: 'male' | 'female' | 'all';
  excellent: string;
  good: string;
  average: string;
  belowAverage: string;
  poor: string;
}

interface FunctionalTestSeed {
  name: string;
  subcategory: string;
  bodyRegions: string[];
  description: string;
  instructions: string;
  conditions: string[];
  estimatedDurationMinutes: number;
  requiredEquipment: string[];
  minScore: number;
  maxScore: number;
  higherIsBetter: boolean;
  normativeRanges: NormativeRange[];
  interpretationGuide: string;
  contraindications: string;
}

// ── Seed Data ──────────────────────────────────────────────────────────────

const FUNCTIONAL_TESTS: FunctionalTestSeed[] = [
  // ── Lower Body Strength ─────────────────────────────────────────────
  {
    name: '30-Second Chair Stand Test',
    subcategory: 'Lower Body Strength',
    bodyRegions: ['Lower Extremity'],
    description:
      'The 30-Second Chair Stand Test (30CST) measures lower body strength and endurance by counting the number of full stands a person can complete in 30 seconds. It is a reliable, valid measure for community-dwelling older adults and various clinical populations.',
    instructions:
      'Place a standard-height chair (43-45 cm) against a wall for stability. Seat the patient in the middle of the chair with feet flat on the floor and arms crossed over the chest. On "Go," the patient rises to full standing and returns to seated position as many times as possible in 30 seconds. Count each complete stand.',
    conditions: ['Lower Extremity Weakness', 'Deconditioning', 'Fall Risk', 'Osteoarthritis'],
    estimatedDurationMinutes: 5,
    requiredEquipment: ['Standard chair (43-45 cm seat height)', 'Stopwatch'],
    minScore: 0,
    maxScore: 30,
    higherIsBetter: true,
    normativeRanges: [
      { ageRange: '60-64', gender: 'male', excellent: '>17', good: '15-17', average: '12-14', belowAverage: '10-11', poor: '<10' },
      { ageRange: '60-64', gender: 'female', excellent: '>16', good: '14-16', average: '11-13', belowAverage: '9-10', poor: '<9' },
      { ageRange: '65-69', gender: 'male', excellent: '>16', good: '14-16', average: '11-13', belowAverage: '9-10', poor: '<9' },
      { ageRange: '65-69', gender: 'female', excellent: '>15', good: '13-15', average: '10-12', belowAverage: '8-9', poor: '<8' },
      { ageRange: '70-74', gender: 'male', excellent: '>15', good: '13-15', average: '10-12', belowAverage: '8-9', poor: '<8' },
      { ageRange: '70-74', gender: 'female', excellent: '>14', good: '12-14', average: '9-11', belowAverage: '7-8', poor: '<7' },
      { ageRange: '75-79', gender: 'male', excellent: '>14', good: '12-14', average: '9-11', belowAverage: '7-8', poor: '<7' },
      { ageRange: '75-79', gender: 'female', excellent: '>13', good: '11-13', average: '8-10', belowAverage: '6-7', poor: '<6' },
      { ageRange: '80-84', gender: 'male', excellent: '>13', good: '11-13', average: '8-10', belowAverage: '6-7', poor: '<6' },
      { ageRange: '80-84', gender: 'female', excellent: '>12', good: '10-12', average: '7-9', belowAverage: '5-6', poor: '<5' },
      { ageRange: '85-89', gender: 'male', excellent: '>12', good: '10-12', average: '7-9', belowAverage: '5-6', poor: '<5' },
      { ageRange: '85-89', gender: 'female', excellent: '>11', good: '9-11', average: '6-8', belowAverage: '4-5', poor: '<4' },
      { ageRange: '90-94', gender: 'male', excellent: '>10', good: '8-10', average: '5-7', belowAverage: '3-4', poor: '<3' },
      { ageRange: '90-94', gender: 'female', excellent: '>9', good: '7-9', average: '4-6', belowAverage: '2-3', poor: '<2' },
    ],
    interpretationGuide:
      'Lower scores indicate decreased lower extremity strength and power. A change of 2-3 repetitions is considered clinically meaningful in older adult populations. Scores below age/gender norms indicate increased fall risk.',
    contraindications:
      'Uncontrolled hypertension, recent cardiac event, acute lower extremity injury or surgery, severe osteoporosis, or inability to stand without assistance.',
  },
  {
    name: 'Timed Up and Go (TUG)',
    subcategory: 'Mobility',
    bodyRegions: ['Lower Extremity'],
    description:
      'The Timed Up and Go (TUG) test is a simple functional mobility test that measures the time a person takes to rise from a chair, walk 3 meters, turn around, walk back, and sit down. It is widely used to assess dynamic balance and functional mobility.',
    instructions:
      'Place a standard chair (seat height 43-45 cm) with armrests at the starting line. Mark a line 3 meters (or 10 feet) from the chair. Instruct the patient to sit with back against the chair. On "Go," the patient rises, walks to the 3-meter line, turns, walks back to the chair, and sits down. Time from "Go" until the patient\'s back touches the chair backrest.',
    conditions: ['Mobility Impairment', 'Fall Risk', 'Vestibular Disorders', 'Parkinson\'s Disease'],
    estimatedDurationMinutes: 5,
    requiredEquipment: ['Standard chair with armrests', 'Stopwatch', 'Tape measure', 'Cone or marker at 3 meters'],
    minScore: 0,
    maxScore: 60,
    higherIsBetter: false,
    normativeRanges: [
      { ageRange: '60-69', gender: 'all', excellent: '<7.0', good: '7.0-8.0', average: '8.1-9.0', belowAverage: '9.1-10.0', poor: '>10.0' },
      { ageRange: '70-79', gender: 'all', excellent: '<8.0', good: '8.0-9.0', average: '9.1-10.0', belowAverage: '10.1-11.5', poor: '>11.5' },
      { ageRange: '80-89', gender: 'all', excellent: '<9.0', good: '9.0-10.5', average: '10.6-12.0', belowAverage: '12.1-14.0', poor: '>14.0' },
      { ageRange: '90-99', gender: 'all', excellent: '<11.0', good: '11.0-13.0', average: '13.1-15.5', belowAverage: '15.6-18.0', poor: '>18.0' },
    ],
    interpretationGuide:
      'Times > 13.5 seconds are associated with increased fall risk in community-dwelling older adults. The minimal detectable change (MDC) is approximately 2-3 seconds depending on population. A change of 1.5-2.5 seconds is generally considered clinically meaningful.',
    contraindications:
      'Inability to walk 3 meters without an assistive device normally used, recent lower extremity surgery, severe vestibular disorders.',
  },
  {
    name: 'Single-Leg Stance Test',
    subcategory: 'Balance',
    bodyRegions: ['Lower Extremity'],
    description:
      'The Single-Leg Stance Test (SLST) measures static balance by timing how long a person can stand on one leg without loss of balance. It is a reliable indicator of fall risk and lower extremity function.',
    instructions:
      'Ask the patient to stand on one leg with arms crossed over the chest and the non-stance foot lifted off the ground (not resting on the stance leg). Start timing when the foot leaves the ground. Stop timing when: the foot touches the ground, the arms uncross, the stance foot shifts position, or 45 seconds is reached. Perform 3 trials and use the best score.',
    conditions: ['Balance Impairment', 'Fall Risk', 'Vestibular Disorders', 'Lower Extremity Weakness'],
    estimatedDurationMinutes: 5,
    requiredEquipment: ['Stopwatch', 'Flat, non-slip surface'],
    minScore: 0,
    maxScore: 45,
    higherIsBetter: true,
    normativeRanges: [
      { ageRange: '18-39', gender: 'male', excellent: '>45', good: '35-45', average: '25-34', belowAverage: '15-24', poor: '<15' },
      { ageRange: '18-39', gender: 'female', excellent: '>45', good: '30-44', average: '20-29', belowAverage: '12-19', poor: '<12' },
      { ageRange: '40-59', gender: 'male', excellent: '>40', good: '28-40', average: '18-27', belowAverage: '10-17', poor: '<10' },
      { ageRange: '40-59', gender: 'female', excellent: '>40', good: '25-40', average: '15-24', belowAverage: '8-14', poor: '<8' },
      { ageRange: '60-69', gender: 'male', excellent: '>30', good: '20-30', average: '12-19', belowAverage: '6-11', poor: '<6' },
      { ageRange: '60-69', gender: 'female', excellent: '>30', good: '18-30', average: '10-17', belowAverage: '5-9', poor: '<5' },
      { ageRange: '70-79', gender: 'male', excellent: '>20', good: '12-20', average: '7-11', belowAverage: '3-6', poor: '<3' },
      { ageRange: '70-79', gender: 'female', excellent: '>18', good: '10-18', average: '6-9', belowAverage: '2-5', poor: '<2' },
      { ageRange: '80+', gender: 'all', excellent: '>10', good: '6-10', average: '3-5', belowAverage: '1-2', poor: '<1' },
    ],
    interpretationGuide:
      'Inability to stand on one leg for 5 seconds is associated with increased fall risk in older adults. A change of 3-5 seconds is considered clinically meaningful. Always test and compare both sides; a side-to-side difference > 5 seconds is significant.',
    contraindications:
      'Acute lower extremity injury (weight-bearing restriction), severe dizziness/vertigo, uncontrolled vestibular disorders.',
  },
  {
    name: 'Step-Down Test',
    subcategory: 'Lower Extremity Control',
    bodyRegions: ['Lower Extremity'],
    description:
      'The Step-Down Test assesses lower extremity neuromuscular control, eccentric strength, and dynamic balance by counting the number of step-downs a patient can perform in 30 seconds with proper form from a standardized step height.',
    instructions:
      'Place a step/platform of 15-20 cm height. Instruct the patient to stand on the step with arms crossed over the chest. The patient steps down with the test leg (touching heel to floor) and returns to full extension on the step. Repeat as many times as possible in 30 seconds. Count only repetitions with proper form (no trunk sway, knee stays aligned over second toe).',
    conditions: ['Patellofemoral Pain', 'ACL Reconstruction', 'Ankle Instability', 'Lower Extremity Weakness'],
    estimatedDurationMinutes: 5,
    requiredEquipment: ['Step/platform (15-20 cm height)', 'Stopwatch'],
    minScore: 0,
    maxScore: 30,
    higherIsBetter: true,
    normativeRanges: [
      { ageRange: '18-30', gender: 'male', excellent: '>25', good: '21-25', average: '16-20', belowAverage: '11-15', poor: '<11' },
      { ageRange: '18-30', gender: 'female', excellent: '>23', good: '19-23', average: '14-18', belowAverage: '10-13', poor: '<10' },
      { ageRange: '31-45', gender: 'male', excellent: '>22', good: '18-22', average: '13-17', belowAverage: '9-12', poor: '<9' },
      { ageRange: '31-45', gender: 'female', excellent: '>20', good: '16-20', average: '11-15', belowAverage: '7-10', poor: '<7' },
      { ageRange: '46-60', gender: 'male', excellent: '>18', good: '14-18', average: '10-13', belowAverage: '6-9', poor: '<6' },
      { ageRange: '46-60', gender: 'female', excellent: '>16', good: '12-16', average: '8-11', belowAverage: '5-7', poor: '<5' },
      { ageRange: '61+', gender: 'all', excellent: '>12', good: '9-12', average: '6-8', belowAverage: '4-5', poor: '<4' },
    ],
    interpretationGuide:
      'A side-to-side difference of more than 3 repetitions or observable form breakdown (medial knee collapse, trunk lean, excessive hip drop) indicates neuromuscular control deficits. Use a mirror or video feedback for form assessment.',
    contraindications:
      'Acute lower extremity injury, inability to bear weight fully, severe balance impairment, or recent knee/hip replacement.',
  },
  {
    name: '6-Minute Walk Test',
    subcategory: 'Endurance',
    bodyRegions: ['Full Body'],
    description:
      'The 6-Minute Walk Test (6MWT) measures the distance a person can walk in 6 minutes on a flat, hard surface. It is a submaximal exercise test that assesses aerobic capacity and functional endurance commonly used in cardiac, pulmonary, and rehabilitation settings.',
    instructions:
      'Mark a 30-meter (or 100-foot) walkway on a flat, hard surface with cones at each end. Instruct the patient to walk as far as possible in 6 minutes, covering as much ground as possible. Allow patient to set the pace and rest if needed (time continues). Provide standardized encouragement each minute. Measure total distance walked.',
    conditions: ['COPD', 'Heart Failure', 'Peripheral Artery Disease', 'Deconditioning', 'Pulmonary Rehabilitation', 'Cardiac Rehabilitation'],
    estimatedDurationMinutes: 10,
    requiredEquipment: ['Tape measure (30-meter/100-ft walkway)', 'Stopwatch', 'Two cones', 'Borg RPE scale', 'Pulse oximeter (optional)'],
    minScore: 0,
    maxScore: 900,
    higherIsBetter: true,
    normativeRanges: [
      { ageRange: '40-49', gender: 'male', excellent: '>650', good: '600-649', average: '546-599', belowAverage: '490-545', poor: '<490' },
      { ageRange: '40-49', gender: 'female', excellent: '>600', good: '550-599', average: '503-549', belowAverage: '450-502', poor: '<450' },
      { ageRange: '50-59', gender: 'male', excellent: '>620', good: '570-619', average: '512-569', belowAverage: '460-511', poor: '<460' },
      { ageRange: '50-59', gender: 'female', excellent: '>570', good: '520-569', average: '470-519', belowAverage: '420-469', poor: '<420' },
      { ageRange: '60-69', gender: 'male', excellent: '>580', good: '530-579', average: '475-529', belowAverage: '425-474', poor: '<425' },
      { ageRange: '60-69', gender: 'female', excellent: '>540', good: '490-539', average: '438-489', belowAverage: '385-437', poor: '<385' },
      { ageRange: '70-79', gender: 'male', excellent: '>540', good: '475-539', average: '415-474', belowAverage: '360-414', poor: '<360' },
      { ageRange: '70-79', gender: 'female', excellent: '>490', good: '440-489', average: '382-439', belowAverage: '330-381', poor: '<330' },
      { ageRange: '80-89', gender: 'male', excellent: '>450', good: '390-449', average: '330-389', belowAverage: '275-329', poor: '<275' },
      { ageRange: '80-89', gender: 'female', excellent: '>400', good: '350-399', average: '290-349', belowAverage: '235-289', poor: '<235' },
    ],
    interpretationGuide:
      'The minimal clinically important difference (MCID) is approximately 30-50 meters across most populations. A decline of > 80 meters over time is associated with increased morbidity and mortality in chronic conditions. Always record Borg RPE, heart rate, oxygen saturation, and any symptoms during the test.',
    contraindications:
      'Unstable angina, uncontrolled hypertension (>180/100 mmHg at rest), recent MI (within 3-6 months), resting HR > 120 bpm, or other conditions that would make walking unsafe.',
  },
  {
    name: 'Y-Balance Test',
    subcategory: 'Dynamic Balance',
    bodyRegions: ['Lower Extremity'],
    description:
      'The Y-Balance Test (YBT) is a dynamic test of balance, proprioception, and neuromuscular control. It is derived from the Star Excursion Balance Test (SEBT) and measures the maximum reach distance in three directions: anterior, posteromedial, and posterolateral.',
    instructions:
      'Mark three lines on the floor at 120-degree angles (anterior, posteromedial, posterolateral directions) using tape or a Y-Balance Test Kit. Patient stands on one leg with hands on hips. With the reaching foot, the patient pushes the reach indicator as far as possible in each direction without losing balance. Record the maximum reach distance for each direction. Normalize to leg length.',
    conditions: ['Chronic Ankle Instability', 'ACL Reconstruction', 'Patellofemoral Pain', 'Injury Risk Screening'],
    estimatedDurationMinutes: 10,
    requiredEquipment: ['Y-Balance Test Kit (or tape measure + tape)', 'Measuring tape (for leg length)'],
    minScore: 0,
    maxScore: 120,
    higherIsBetter: true,
    normativeRanges: [
      { ageRange: '18-30', gender: 'male', excellent: '>105', good: '95-105', average: '85-94', belowAverage: '75-84', poor: '<75' },
      { ageRange: '18-30', gender: 'female', excellent: '>110', good: '100-110', average: '89-99', belowAverage: '78-88', poor: '<78' },
      { ageRange: '31-45', gender: 'male', excellent: '>100', good: '90-100', average: '80-89', belowAverage: '70-79', poor: '<70' },
      { ageRange: '31-45', gender: 'female', excellent: '>105', good: '95-105', average: '84-94', belowAverage: '73-83', poor: '<73' },
      { ageRange: '46-60', gender: 'male', excellent: '>95', good: '85-95', average: '74-84', belowAverage: '64-73', poor: '<64' },
      { ageRange: '46-60', gender: 'female', excellent: '>100', good: '90-100', average: '79-89', belowAverage: '68-78', poor: '<68' },
      { ageRange: '61+', gender: 'all', excellent: '>85', good: '75-85', average: '65-74', belowAverage: '55-64', poor: '<55' },
    ],
    interpretationGuide:
      'Normalize reaches to leg length: composite score = (sum of 3 reaches / (3 × leg length)) × 100%. A composite score < 94% is associated with increased injury risk in athletes. A side-to-side difference > 4 cm in the anterior direction is significant.',
    contraindications:
      'Acute lower extremity injury with weight-bearing restriction, severe balance impairment (unable to stand on one leg for 10 seconds), recent surgery.',
  },
  {
    name: 'Sit-and-Reach Test',
    subcategory: 'Flexibility',
    bodyRegions: ['Lumbar Spine', 'Lower Extremity'],
    description:
      'The Sit-and-Reach Test is a common measure of hamstring and lower back flexibility. It assesses the flexibility of the posterior chain (hamstrings, lower back, and gluteals) in a seated forward flexion position.',
    instructions:
      'Set up a standard sit-and-reach box or mark a 15-inch (38 cm) line on the floor with a tape measure extending 15 inches (38 cm) toward the patient. Patient sits on the floor with legs extended, feet flat against the box (or at the 15-inch mark), shoes removed. Patient slowly reaches forward as far as possible, keeping palms down and fingers aligned. Hold the maximum reach for 2 seconds. Record the distance. Perform two trials and use the best score.',
    conditions: ['Hamstring Tightness', 'Low Back Pain', 'Decreased Flexibility', 'Postural Dysfunction'],
    estimatedDurationMinutes: 5,
    requiredEquipment: ['Sit-and-reach box (standard 9-inch / 23 cm height)', 'Ruler or tape measure'],
    minScore: 0,
    maxScore: 60,
    higherIsBetter: true,
    normativeRanges: [
      { ageRange: '18-25', gender: 'male', excellent: '>38', good: '34-38', average: '28-33', belowAverage: '23-27', poor: '<23' },
      { ageRange: '18-25', gender: 'female', excellent: '>41', good: '37-41', average: '32-36', belowAverage: '27-31', poor: '<27' },
      { ageRange: '26-35', gender: 'male', excellent: '>36', good: '32-36', average: '26-31', belowAverage: '21-25', poor: '<21' },
      { ageRange: '26-35', gender: 'female', excellent: '>40', good: '35-40', average: '29-34', belowAverage: '24-28', poor: '<24' },
      { ageRange: '36-45', gender: 'male', excellent: '>35', good: '30-35', average: '24-29', belowAverage: '19-23', poor: '<19' },
      { ageRange: '36-45', gender: 'female', excellent: '>38', good: '34-38', average: '28-33', belowAverage: '22-27', poor: '<22' },
      { ageRange: '46-55', gender: 'male', excellent: '>33', good: '28-33', average: '22-27', belowAverage: '17-21', poor: '<17' },
      { ageRange: '46-55', gender: 'female', excellent: '>36', good: '31-36', average: '26-30', belowAverage: '20-25', poor: '<20' },
      { ageRange: '56-65', gender: 'male', excellent: '>30', good: '25-30', average: '19-24', belowAverage: '14-18', poor: '<14' },
      { ageRange: '56-65', gender: 'female', excellent: '>33', good: '29-33', average: '23-28', belowAverage: '18-22', poor: '<18' },
      { ageRange: '66+', gender: 'male', excellent: '>27', good: '22-27', average: '15-21', belowAverage: '10-14', poor: '<10' },
      { ageRange: '66+', gender: 'female', excellent: '>30', good: '26-30', average: '20-25', belowAverage: '15-19', poor: '<15' },
    ],
    interpretationGuide:
      'A score at "poor" level indicates significant hamstring tightness that may predispose to low back pain and postural dysfunction. The modified sit-and-reach (single leg) may more accurately measure unilateral hamstring flexibility.',
    contraindications:
      'Acute low back pain (severe/radicular), recent spine surgery, symptomatic disc herniation, hamstring avulsion.',
  },
];

// ── Seed Function ──────────────────────────────────────────────────────────

export async function seedFunctionalTests() {
  console.log('[seed] Seeding functional performance tests...');

  let created = 0;
  let skipped = 0;

  for (const test of FUNCTIONAL_TESTS) {
    const existing = await prisma.assessment.findFirst({
      where: { name: test.name, category: 'functional_test' },
    });

    if (existing) {
      console.log(`  [skip] "${test.name}" already exists`);
      skipped++;
      continue;
    }

    await prisma.assessment.create({
      data: {
        name: test.name,
        category: 'functional_test' as AssessmentCategory,
        subcategory: test.subcategory,
        description: test.description,
        instructions: test.instructions,
        scoringType: 'numeric',
        scoringInstructions: test.interpretationGuide,
        minScore: test.minScore,
        maxScore: test.maxScore,
        higherIsBetter: test.higherIsBetter,
        normativeData: JSON.parse(JSON.stringify({
          normativeRanges: test.normativeRanges,
          contraindications: test.contraindications,
          interpretationGuide: test.interpretationGuide,
        })),
        bodyRegions: test.bodyRegions,
        conditions: test.conditions,
        estimatedDurationMinutes: test.estimatedDurationMinutes,
        requiredEquipment: test.requiredEquipment,
        isStandardized: true,
        version: '1.0',
        questions: [
          {
            id: 'result',
            questionType: 'numeric',
            questionText: 'Test Result',
            instructions: 'Enter the measured value for this functional test.',
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

  console.log(`[seed] Functional tests: ${created} created, ${skipped} skipped, ${FUNCTIONAL_TESTS.length} total`);
  return { created, skipped, total: FUNCTIONAL_TESTS.length };
}

// ── CLI Entrypoint ─────────────────────────────────────────────────────────

async function main() {
  const result = await seedFunctionalTests();
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
