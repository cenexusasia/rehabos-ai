export { stratifyRisk, default } from './risk-stratification';
export { predictAdherence, default as predictAdherenceDefault } from './adherence-predictor';

export type {
  RiskLevel,
  RiskStratificationInput,
  RiskFactor,
  RiskStratificationResult,
  RiskThresholds,
} from './risk-stratification';

export type {
  PatientInfo,
  AdherenceHistory,
  ExerciseComplexity,
  AdherenceBarrier,
  Intervention,
  AdherencePrediction,
} from './adherence-predictor';
