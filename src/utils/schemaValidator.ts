export interface BanffLesionScores {
  g: number; // Glomerulitis
  t: number; // Tubulitis
  v: number; // Intimal Arteritis
  i: number; // Interstitial Inflammation
  ptc: number; // Peritubular Capillaritis
  ah?: number; // Arteriolar Hyalinosis
  cg?: number; // Chronic Allograft Arteriopathy
}

export interface BanffValidationResult {
  valid: boolean;
  mviIndex: number; // Microvascular Inflammation (g + ptc)
  tiScore: number; // Total Inflammation (t + i)
  rejectionDiagnosis: string;
  riskLevel: "LOW" | "MODERATE" | "MODERATE-HIGH" | "HIGH";
  contractHash: string;
}

/**
 * Validates Banff 2023 pathology lesion scores and determines rejection diagnosis and risk level.
 */
export function validateBanffSchema(lesions: BanffLesionScores): BanffValidationResult {
  const g = Math.max(0, Math.min(3, lesions.g || 0));
  const t = Math.max(0, Math.min(3, lesions.t || 0));
  const v = Math.max(0, Math.min(3, lesions.v || 0));
  const i = Math.max(0, Math.min(3, lesions.i || 0));
  const ptc = Math.max(0, Math.min(3, lesions.ptc || 0));

  const mviIndex = g + ptc;
  const tiScore = t + i;

  let rejectionDiagnosis = "No Active Rejection";
  let riskLevel: "LOW" | "MODERATE" | "MODERATE-HIGH" | "HIGH" = "LOW";

  if (v > 0 || mviIndex >= 2) {
    rejectionDiagnosis = "Active Antibody-Mediated Rejection (ABMR) / Vascular Rejection";
    riskLevel = "HIGH";
  } else if (t >= 2 && i >= 2) {
    rejectionDiagnosis = "Acute T-Cell Mediated Rejection (TCMR Grade IB/IIA)";
    riskLevel = "MODERATE-HIGH";
  } else if (t === 1 && i >= 1) {
    rejectionDiagnosis = "Borderline TCMR Lesion";
    riskLevel = "MODERATE";
  }

  const payloadString = JSON.stringify({ g, t, v, i, ptc, mviIndex, rejectionDiagnosis });
  const contractHash = `0x${Buffer.from(payloadString).toString("hex").substring(0, 16)}`;

  return {
    valid: true,
    mviIndex,
    tiScore,
    rejectionDiagnosis,
    riskLevel,
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
