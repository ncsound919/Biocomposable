import { validateBanffSchema, validatePipelineDAG } from "../utils/schemaValidator";

// Self-contained test suite for BioComposable schema validation & DAG integrity
function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[TEST FAILURE] ${message}`);
  }
}

export function runTests() {
  console.log("Running BioComposable Schema & DAG Validator Tests...");

  // Test 1: Normal / No Rejection
  const result1 = validateBanffSchema({ g: 0, t: 0, v: 0, i: 0, ptc: 0 });
  assert(result1.mviIndex === 0, "MVI index should be 0");
  assert(result1.riskLevel === "LOW", "Risk level should be LOW");
  assert(result1.rejectionDiagnosis === "No Active Rejection", "Diagnosis should be No Active Rejection");

  // Test 2: Active ABMR (g=2, ptc=2 -> MVI = 4)
  const result2 = validateBanffSchema({ g: 2, t: 1, v: 0, i: 1, ptc: 2 });
  assert(result2.mviIndex === 4, "MVI index should be 4");
  assert(result2.riskLevel === "HIGH", "Risk level should be HIGH");
  assert(result2.rejectionDiagnosis.includes("Antibody-Mediated"), "Diagnosis should indicate ABMR");

  // Test 3: TCMR Grade IB/IIA (t=2, i=2)
  const result3 = validateBanffSchema({ g: 0, t: 2, v: 0, i: 2, ptc: 0 });
  assert(result3.riskLevel === "MODERATE-HIGH", "Risk level should be MODERATE-HIGH");
  assert(result3.rejectionDiagnosis.includes("TCMR Grade IB/IIA"), "Diagnosis should indicate TCMR");

  // Test 4: DAG Validation - Valid Sequential Steps
  const validDAG = validatePipelineDAG([
    { acceptedInputs: ["raw_h5ad"], providedOutputs: ["DataContract_v1"] },
    { acceptedInputs: ["DataContract_v1"], providedOutputs: ["DataContract_v1"] },
    { acceptedInputs: ["DataContract_v1"], providedOutputs: ["Report"] }
  ]);
  assert(validDAG.valid === true, "Valid DAG should pass validation");
  assert(validDAG.errors.length === 0, "Valid DAG should have 0 errors");

  // Test 5: DAG Validation - Mismatched Contract
  const invalidDAG = validatePipelineDAG([
    { acceptedInputs: ["raw_h5ad"], providedOutputs: ["IncompatibleType"] },
    { acceptedInputs: ["DataContract_v1"], providedOutputs: ["Report"] }
  ]);
  assert(invalidDAG.valid === false, "Invalid DAG should fail validation");
  assert(invalidDAG.errors.length > 0, "Invalid DAG should produce error message");

  console.log("✓ All 5 BioComposable Schema & DAG Validator Tests Passed Successfully!");
  return { status: "PASSED", testsRun: 5 };
}

// Run when executed directly via tsx
runTests();
