import { validateBanffSchema, validatePipelineDAG } from "../utils/schemaValidator";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[TEST FAILURE] ${message}`);
  }
}

export function runTests() {
  console.log("Running BioComposable Schema & DAG Validator Edge-Case Tests...\n");

  // Test 1: Normal / No Rejection
  const result1 = validateBanffSchema({ g: 0, t: 0, v: 0, i: 0, ptc: 0 });
  assert(result1.mviIndex === 0, "MVI index should be 0");
  assert(result1.tiScore === 0, "TI score should be 0");
  assert(result1.riskLevel === "LOW", "Risk level should be LOW");
  assert(result1.rejectionDiagnosis === "No Active Rejection", "Diagnosis should be No Active Rejection");
  assert(result1.contractHash.startsWith("0x"), "Contract hash must begin with 0x prefix");

  // Test 2: Full Triad Active ABMR (g=2, ptc=2 -> MVI = 4, C4d=positive, DSA=positive, t=0, i=0)
  const result2 = validateBanffSchema({ g: 2, t: 0, v: 0, i: 0, ptc: 2, c4d: true, dsa: "positive" });
  assert(result2.mviIndex === 4, "MVI index should be 4");
  assert(result2.riskLevel === "HIGH", "Risk level should be HIGH for pure Definite Active ABMR");
  assert(result2.rejectionDiagnosis.includes("Definite Active Antibody-Mediated Rejection"), "Diagnosis indicates full triad Definite ABMR");
  assert(result2.triadCriteriaMet.histologyMvi === true, "Histology MVI criteria met");
  assert(result2.triadCriteriaMet.endothelialInteraction === true, "Endothelial C4d criteria met");
  assert(result2.triadCriteriaMet.serologyDsa === true, "Serological DSA criteria met");

  // Test 3: ABMR with DSA negative, C4d positive
  const resultDsaNeg = validateBanffSchema({ g: 2, ptc: 1, v: 0, t: 0, i: 0, c4d: 2, dsa: "negative" });
  assert(resultDsaNeg.rejectionDiagnosis.includes("C4d/Molecular Positive, DSA Negative"), "Identifies DSA-negative ABMR subcategory");

  // Test 4: Vascular Rejection Grade IIA (v=1) -> CRITICAL / HIGH risk
  const resultVascular = validateBanffSchema({ g: 0, t: 1, v: 1, i: 1, ptc: 0 });
  assert(resultVascular.rejectionDiagnosis.includes("Grade IIA"), "Intimal arteritis (v = 1) triggers TCMR Grade IIA");

  // Test 5: Borderline TCMR (t=1, i=1) -> MODERATE risk
  const resultBorderline = validateBanffSchema({ g: 0, t: 1, v: 0, i: 1, ptc: 0 });
  assert(resultBorderline.riskLevel === "MODERATE", "t=1, i=1 triggers MODERATE risk Borderline TCMR");
  assert(resultBorderline.rejectionDiagnosis.includes("Borderline TCMR"), "Diagnosis specifies Borderline TCMR");

  // Test 6: TCMR Grade IA (t=2, i=2)
  const result3 = validateBanffSchema({ g: 0, t: 2, v: 0, i: 2, ptc: 0 });
  assert(result3.tiScore === 4, "TI score should be 4");
  assert(result3.riskLevel === "MODERATE-HIGH", "Risk level should be MODERATE-HIGH");
  assert(result3.rejectionDiagnosis.includes("TCMR Grade IA"), "Diagnosis indicates TCMR Grade IA");

  // Test 7: Boundary clamping - Negative inputs clamped to 0
  const resultNegative = validateBanffSchema({ g: -1, t: -5, v: 0, i: -2, ptc: 0 });
  assert(resultNegative.mviIndex === 0, "Negative lesion scores clamped to 0");
  assert(resultNegative.tiScore === 0, "Negative TI scores clamped to 0");

  // Test 8: Boundary clamping - Out of bound values (>3) clamped to 3
  const resultExcess = validateBanffSchema({ g: 5, t: 4, v: 9, i: 3, ptc: 3 });
  assert(resultExcess.mviIndex === 6, "g=5 and ptc=3 clamped to 3+3=6");
  assert(resultExcess.tiScore === 6, "t=4 and i=3 clamped to 3+3=6");

  // Test 9: DAG Validation - Valid Sequential Steps
  const validDAG = validatePipelineDAG([
    { acceptedInputs: ["raw_h5ad"], providedOutputs: ["DataContract_v1"] },
    { acceptedInputs: ["DataContract_v1"], providedOutputs: ["DataContract_v1"] },
    { acceptedInputs: ["DataContract_v1"], providedOutputs: ["Report"] }
  ]);
  assert(validDAG.valid === true, "Valid DAG should pass validation");
  assert(validDAG.errors.length === 0, "Valid DAG should have 0 errors");

  // Test 10: DAG Validation - Mismatched Contract
  const invalidDAG = validatePipelineDAG([
    { acceptedInputs: ["raw_h5ad"], providedOutputs: ["IncompatibleType"] },
    { acceptedInputs: ["DataContract_v1"], providedOutputs: ["Report"] }
  ]);
  assert(invalidDAG.valid === false, "Invalid DAG should fail validation");
  assert(invalidDAG.errors.length > 0, "Invalid DAG should produce error message");

  console.log("✓ All 10 BioComposable Schema & DAG Validator Tests Passed Successfully!");
  return { status: "PASSED", testsRun: 10 };
}

// Run when executed directly via tsx
runTests();
