export interface BanffLesionScores {
  g: number; // Glomerulitis (0-3)
  t: number; // Tubulitis (0-3)
  v: number; // Intimal Arteritis (0-3)
  i: number; // Interstitial Inflammation (0-3)
  ptc: number; // Peritubular Capillaritis (0-3)
  c4d?: number | boolean; // C4d capillary staining (0-3 or boolean)
  dsa?: boolean | "positive" | "negative"; // Donor Specific Antibodies
  molecularAbmr?: number | boolean; // MMDx / Molecular transcript score (0.0 - 1.0 or boolean)
  ci?: number; // Chronic Interstitial Fibrosis (0-3)
  ct?: number; // Chronic Tubular Atrophy (0-3)
  cv?: number; // Chronic Vascular Thickening (0-3)
  ah?: number; // Arteriolar Hyalinosis (0-3)
  cg?: number; // Chronic Allograft Arteriopathy (0-3)
}

export interface BanffValidationResult {
  valid: boolean;
  mviIndex: number; // Microvascular Inflammation (g + ptc)
  tiScore: number; // Total Inflammation (t + i)
  iftaScore: number; // Interstitial Fibrosis / Tubular Atrophy (ci + ct)
  c4dPositive: boolean;
  dsaPositive: boolean;
  molecularPositive: boolean;
  rejectionDiagnosis: string;
  riskLevel: "LOW" | "MODERATE" | "MODERATE-HIGH" | "HIGH" | "CRITICAL";
  triadCriteriaMet: {
    histologyMvi: boolean;
    endothelialInteraction: boolean;
    serologyDsa: boolean;
  };
  contractHash: string;
}

/**
 * Validates Banff 2022/2023 pathology lesion scores according to the complete
 * diagnostic triad: (1) Histologic MVI, (2) Endothelial interaction (C4d/Molecular), (3) Serological DSA.
 */
export function validateBanffSchema(lesions: BanffLesionScores): BanffValidationResult {
  const g = Math.max(0, Math.min(3, lesions.g || 0));
  const t = Math.max(0, Math.min(3, lesions.t || 0));
  const v = Math.max(0, Math.min(3, lesions.v || 0));
  const i = Math.max(0, Math.min(3, lesions.i || 0));
  const ptc = Math.max(0, Math.min(3, lesions.ptc || 0));
  const ci = Math.max(0, Math.min(3, lesions.ci || 0));
  const ct = Math.max(0, Math.min(3, lesions.ct || 0));

  const mviIndex = g + ptc;
  const tiScore = t + i;
  const iftaScore = ci + ct;

  // Triad evaluation flags
  const c4dPositive =
    typeof lesions.c4d === "boolean"
      ? lesions.c4d
      : typeof lesions.c4d === "number"
      ? lesions.c4d > 0
      : false;

  const dsaPositive =
    typeof lesions.dsa === "boolean"
      ? lesions.dsa
      : lesions.dsa === "positive";

  const molecularPositive =
    typeof lesions.molecularAbmr === "boolean"
      ? lesions.molecularAbmr
      : typeof lesions.molecularAbmr === "number"
      ? lesions.molecularAbmr >= 0.5
      : false;

  const histologyMvi = mviIndex >= 2 || v > 0;
  const endothelialInteraction = c4dPositive || molecularPositive;
  const serologyDsa = dsaPositive;

  let abmrDiagnosis = "";
  let tcmrDiagnosis = "";

  // 1. ABMR Diagnostic Triad Rules (Banff 2022/2023)
  if (histologyMvi && endothelialInteraction && serologyDsa) {
    abmrDiagnosis = "Definite Active Antibody-Mediated Rejection (ABMR) [Full Triad Met]";
  } else if (histologyMvi && endothelialInteraction && !serologyDsa) {
    abmrDiagnosis = "Active ABMR (C4d/Molecular Positive, DSA Negative)";
  } else if (histologyMvi && !endothelialInteraction && serologyDsa) {
    abmrDiagnosis = "Active ABMR (DSA Positive, C4d/Molecular Negative)";
  } else if (histologyMvi && !endothelialInteraction && !serologyDsa) {
    abmrDiagnosis = "Microvascular Inflammation (DSA-Negative, C4d-Negative, Pending Molecular)";
  } else if (mviIndex === 1 && (endothelialInteraction || serologyDsa)) {
    abmrDiagnosis = "Probable ABMR (Subthreshold MVI with C4d/DSA Evidence)";
  }

  // 2. TCMR Diagnostic Rules (Banff 2022/2023)
  if (v === 3) {
    tcmrDiagnosis = "Acute TCMR Grade III (Transmural Arteritis / Necrosis)";
  } else if (v === 2) {
    tcmrDiagnosis = "Acute TCMR Grade IIB (Severe Intimal Arteritis v2)";
  } else if (v === 1) {
    tcmrDiagnosis = "Acute TCMR Grade IIA (Mild/Moderate Arteritis v1)";
  } else if (i >= 2 && t === 3) {
    tcmrDiagnosis = "Acute TCMR Grade IB (Severe Tubulitis t3)";
  } else if (i >= 2 && t >= 2) {
    tcmrDiagnosis = "Acute TCMR Grade IA (Moderate Tubulitis t2 & Interstitial i2)";
  } else if (t >= 1 && i >= 1) {
    tcmrDiagnosis = "Borderline TCMR Lesion (Subthreshold Tubulitis / Interstitial)";
  }

  // Combine Diagnoses & Determine Clinical Risk Level
  let rejectionDiagnosis = "No Active Rejection";
  let riskLevel: "LOW" | "MODERATE" | "MODERATE-HIGH" | "HIGH" | "CRITICAL" = "LOW";

  if (abmrDiagnosis && tcmrDiagnosis) {
    rejectionDiagnosis = `Mixed Rejection: ${abmrDiagnosis} + ${tcmrDiagnosis}`;
    riskLevel = "CRITICAL";
  } else if (abmrDiagnosis) {
    rejectionDiagnosis = abmrDiagnosis;
    riskLevel = abmrDiagnosis.includes("Definite") || abmrDiagnosis.includes("Active") ? "HIGH" : "MODERATE-HIGH";
  } else if (tcmrDiagnosis) {
    rejectionDiagnosis = tcmrDiagnosis;
    riskLevel = tcmrDiagnosis.includes("Grade III") || tcmrDiagnosis.includes("Grade II") ? "CRITICAL" : tcmrDiagnosis.includes("Grade I") ? "MODERATE-HIGH" : "MODERATE";
  } else if (iftaScore >= 2) {
    rejectionDiagnosis = `Chronic Allograft Injury / IFTA (ci=${ci}, ct=${ct})`;
    riskLevel = "MODERATE";
  }

  const payloadString = JSON.stringify({
    g, t, v, i, ptc, ci, ct, mviIndex, tiScore, c4dPositive, dsaPositive, molecularPositive, rejectionDiagnosis
  });
  const contractHash = `0x${Buffer.from(payloadString).toString("hex").substring(0, 16)}`;

  return {
    valid: true,
    mviIndex,
    tiScore,
    iftaScore,
    c4dPositive,
    dsaPositive,
    molecularPositive,
    rejectionDiagnosis,
    riskLevel,
    triadCriteriaMet: {
      histologyMvi,
      endothelialInteraction,
      serologyDsa
    },
    contractHash
  };
}

/**
 * Validates topological DAG input-output contracts between sequential pipeline steps.
 */
export function validatePipelineDAG(steps: Array<{ acceptedInputs: string[]; providedOutputs: string[] }>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  for (let idx = 1; idx < steps.length; idx++) {
    const prev = steps[idx - 1];
    const curr = steps[idx];

    const hasMatch = curr.acceptedInputs.some((inputReq) =>
      prev.providedOutputs.includes(inputReq)
    );

    if (!hasMatch) {
      errors.push(
        `Step ${idx + 1} requires [${curr.acceptedInputs.join(", ")}] but previous step outputs [${prev.providedOutputs.join(", ")}]`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
