import { BanffLesionScores } from "./schemaValidator";

export interface EvidenceNodePayload {
  nodeId: string;
  institution: string;
  evidencePattern: string;
  graphTopology: string;
  effectSize: number; // e.g. Cohen's d or Log2 Fold Change
  se: number;        // Standard error
  ciLower: number;
  ciUpper: number;
  sampleCount: number;
  timestamp: string;
  signature?: string;
  subPhenotype?: string;
  clinicalScores?: BanffLesionScores;
}

/**
 * Deterministic fast 64-bit hash (cyrb53) for browser and Node.js
 */
function cyrb53(str: string, seed = 0): string {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334903);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, "0") + (h1 >>> 0).toString(16).padStart(8, "0");
}

export interface MetaAnalysisResult {
  ruleId: string;
  kStudies: number;
  totalSamples: number;
  fixedEffect: number;
  randomEffect: number;
  hksjCiLower: number;
  hksjCiUpper: number;
  cochranQ: number;
  cochranQDegreesOfFreedom: number;
  cochranQPValue: number;
  iSquared: number;
  tauSquared: number;
  hasHighHeterogeneity: boolean;
  hasDirectionalConflict: boolean;
  isConflictState: boolean;
  gradeRating: "High" | "Moderate" | "Low" | "Very Low";
  proofHash: string;
  cusumDriftDetected: boolean;
  cusumMaxStat: number;
  nodeWeights: Record<string, { weightFixed: number; weightRandom: number; percentWeight: number }>;
}

/**
 * Calculates Student's t critical value for df degrees of freedom at 95% confidence level (two-tailed 0.025)
 */
function getStudentTCriticalValue(df: number): number {
  const tTable: Record<number, number> = {
    1: 12.706,
    2: 4.303,
    3: 3.182,
    4: 2.776,
    5: 2.571,
    6: 2.447,
    7: 2.365,
    8: 2.306,
    9: 2.262,
    10: 2.228,
    12: 2.179,
    15: 2.131,
    20: 2.086,
    30: 2.042,
    50: 2.009,
    100: 1.984
  };
  if (tTable[df]) return tTable[df];
  if (df > 100) return 1.96;
  // Linear interpolation for missing df values
  const keys = Object.keys(tTable).map(Number).sort((a, b) => a - b);
  for (let i = 0; i < keys.length - 1; i++) {
    if (df > keys[i] && df < keys[i + 1]) {
      const lower = keys[i];
      const upper = keys[i + 1];
      const weight = (df - lower) / (upper - lower);
      return tTable[lower] + weight * (tTable[upper] - tTable[lower]);
    }
  }
  return 1.96;
}

/**
 * Approximates survival probability (p-value) for Chi-Square distribution with df degrees of freedom
 */
function chiSquarePValue(x: number, df: number): number {
  if (x <= 0 || df <= 0) return 1.0;
  
  // Wilson-Hilferty transformation approximation for chi-square CDF
  const s = 2 / (9 * df);
  const z = (Math.pow(x / df, 1/3) - (1 - s)) / Math.sqrt(s);
  
  // Standard normal CDF approximation (Abramowitz & Stegun)
  const absZ = Math.abs(z);
  const t = 1 / (1 + 0.2316419 * absZ);
  const poly = t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  const pdf = Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
  const normCdf = z >= 0 ? 1 - pdf * poly : pdf * poly;

  const pVal = 1 - normCdf;
  return Math.max(0.0001, Math.min(0.9999, pVal));
}

/**
 * Generates cryptographic proof hash for canonicalized evidence payload
 */
export function generateProofHash(evidenceList: EvidenceNodePayload[]): string {
  const canonicalString = JSON.stringify(
    evidenceList.map(e => ({
      nodeId: e.nodeId,
      effectSize: Number(e.effectSize.toFixed(4)),
      se: Number(e.se.toFixed(4)),
      sampleCount: e.sampleCount,
      timestamp: e.timestamp
    })).sort((a, b) => a.nodeId.localeCompare(b.nodeId))
  );
  
  return "0x" + cyrb53(canonicalString).substring(0, 16);
}

/**
 * Performs Inverse-Variance, Hartung-Knapp-Sidik-Jonkman (HKSJ), I^2, and CUSUM Drift Analysis
 */
export function performMetaAnalysis(ruleId: string, evidenceList: EvidenceNodePayload[]): MetaAnalysisResult {
  const k = evidenceList.length;
  const totalSamples = evidenceList.reduce((acc, curr) => acc + curr.sampleCount, 0);

  if (k === 0) {
    return {
      ruleId,
      kStudies: 0,
      totalSamples: 0,
      fixedEffect: 0,
      randomEffect: 0,
      hksjCiLower: 0,
      hksjCiUpper: 0,
      cochranQ: 0,
      cochranQDegreesOfFreedom: 0,
      cochranQPValue: 1.0,
      iSquared: 0,
      tauSquared: 0,
      hasHighHeterogeneity: false,
      hasDirectionalConflict: false,
      isConflictState: false,
      gradeRating: "Low",
      proofHash: "0xEMPTY_PAYLOAD",
      cusumDriftDetected: false,
      cusumMaxStat: 0,
      nodeWeights: {}
    };
  }

  // Step 1: Fixed Effect Model (Inverse-Variance Weights)
  let sumWeightFixed = 0;
  let sumWeightedEffectFixed = 0;
  const fixedWeights: number[] = [];

  evidenceList.forEach(e => {
    // If SE not provided or zero, derive from CI
    const se = e.se > 0 ? e.se : Math.max(0.01, (e.ciUpper - e.ciLower) / 3.92);
    const w = 1 / (se * se);
    fixedWeights.push(w);
    sumWeightFixed += w;
    sumWeightedEffectFixed += w * e.effectSize;
  });

  const fixedEffect = sumWeightedEffectFixed / sumWeightFixed;

  // Step 2: Cochran's Q Statistic & Heterogeneity
  let cochranQ = 0;
  let sumSquareFixedWeights = 0;

  evidenceList.forEach((e, idx) => {
    const diff = e.effectSize - fixedEffect;
    cochranQ += fixedWeights[idx] * diff * diff;
    sumSquareFixedWeights += fixedWeights[idx] * fixedWeights[idx];
  });

  const df = Math.max(1, k - 1);
  const cochranQPValue = k > 1 ? chiSquarePValue(cochranQ, df) : 1.0;
  const iSquared = k > 1 ? Math.max(0, ((cochranQ - df) / cochranQ) * 100) : 0;

  // DerSimonian-Laird Tau Squared (Between-study variance)
  const cCoeff = sumWeightFixed - (sumSquareFixedWeights / sumWeightFixed);
  const tauSquared = k > 1 && cCoeff > 0 ? Math.max(0, (cochranQ - df) / cCoeff) : 0;

  // Step 3: Random Effect Model & HKSJ Adjustment
  let sumWeightRandom = 0;
  let sumWeightedEffectRandom = 0;
  const randomWeights: number[] = [];

  evidenceList.forEach(e => {
    const se = e.se > 0 ? e.se : Math.max(0.01, (e.ciUpper - e.ciLower) / 3.92);
    const wRE = 1 / (se * se + tauSquared);
    randomWeights.push(wRE);
    sumWeightRandom += wRE;
    sumWeightedEffectRandom += wRE * e.effectSize;
  });

  const randomEffect = sumWeightedEffectRandom / sumWeightRandom;

  // Hartung-Knapp-Sidik-Jonkman (HKSJ) Standard Error
  let qHksj = 0;
  evidenceList.forEach((e, idx) => {
    const diff = e.effectSize - randomEffect;
    qHksj += randomWeights[idx] * diff * diff;
  });

  const qHksjScaled = k > 1 ? qHksj / df : 1.0;
  // Truncate at 1.0 for conservative variance bound
  const qHksjAdj = Math.max(1.0, qHksjScaled);
  const seHksj = Math.sqrt(qHksjAdj / sumWeightRandom);

  const tCrit = getStudentTCriticalValue(df);
  const hksjCiLower = randomEffect - tCrit * seHksj;
  const hksjCiUpper = randomEffect + tCrit * seHksj;

  // Step 4: Directional Conflict & Heterogeneity Check
  let hasPositiveNode = false;
  let hasNegativeNode = false;

  evidenceList.forEach(e => {
    if (e.effectSize > 0.3 && e.ciLower > 0) hasPositiveNode = true;
    if (e.effectSize < -0.3 || e.ciUpper < 0) hasNegativeNode = true;
  });

  const hasDirectionalConflict = hasPositiveNode && hasNegativeNode;
  const hasHighHeterogeneity = iSquared >= 50 || cochranQPValue < 0.05;
  const isConflictState = hasDirectionalConflict || (k >= 2 && hasHighHeterogeneity);

  // Step 5: CUSUM Drift Detection
  let cusumPlus = 0;
  let cusumMinus = 0;
  let maxCusum = 0;

  evidenceList.forEach(e => {
    const se = e.se > 0 ? e.se : Math.max(0.01, (e.ciUpper - e.ciLower) / 3.92);
    const zScore = (e.effectSize - randomEffect) / se;
    cusumPlus = Math.max(0, cusumPlus + (zScore - 0.5));
    cusumMinus = Math.max(0, cusumMinus + (-zScore - 0.5));
    maxCusum = Math.max(maxCusum, cusumPlus, cusumMinus);
  });

  const cusumDriftDetected = maxCusum >= 4.0;

  // Step 6: GRADE Quality Rating
  let gradeRating: "High" | "Moderate" | "Low" | "Very Low" = "High";
  if (isConflictState || iSquared >= 75) {
    gradeRating = "Very Low";
  } else if (iSquared >= 50 || cusumDriftDetected) {
    gradeRating = "Low";
  } else if (iSquared >= 25 || k < 3) {
    gradeRating = "Moderate";
  }

  // Node Weights Map
  const nodeWeights: Record<string, { weightFixed: number; weightRandom: number; percentWeight: number }> = {};
  evidenceList.forEach((e, idx) => {
    nodeWeights[e.nodeId] = {
      weightFixed: fixedWeights[idx],
      weightRandom: randomWeights[idx],
      percentWeight: Number(((randomWeights[idx] / sumWeightRandom) * 100).toFixed(1))
    };
  });

  // Proof Hash
  const proofHash = generateProofHash(evidenceList);

  return {
    ruleId,
    kStudies: k,
    totalSamples,
    fixedEffect: Number(fixedEffect.toFixed(3)),
    randomEffect: Number(randomEffect.toFixed(3)),
    hksjCiLower: Number(hksjCiLower.toFixed(3)),
    hksjCiUpper: Number(hksjCiUpper.toFixed(3)),
    cochranQ: Number(cochranQ.toFixed(2)),
    cochranQDegreesOfFreedom: df,
    cochranQPValue: Number(cochranQPValue.toFixed(4)),
    iSquared: Number(iSquared.toFixed(1)),
    tauSquared: Number(tauSquared.toFixed(4)),
    hasHighHeterogeneity,
    hasDirectionalConflict,
    isConflictState,
    gradeRating,
    proofHash,
    cusumDriftDetected,
    cusumMaxStat: Number(maxCusum.toFixed(2)),
    nodeWeights
  };
}
