import {
  componentsList,
  canAddComponent,
  getMissingRequirements,
  getProvidedOutputs,
  validateDAG,
} from "../data/components";
import { RecipeStepState } from "../types";

console.log("Running BioComposable DAG Validation & Dependency Unit Tests...\n");

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

// Test 1: Empty recipe validation
const emptySteps: RecipeStepState[] = [];
assert(
  validateDAG(emptySteps) === "empty",
  "Empty recipe returns DAGStatus 'empty'"
);

// Test 2: Valid sequential pipeline (bio-validate -> bio-batchdiag -> bio-batchcorrect)
const validateComp = componentsList.find((c) => c.id === "bio-validate")!;
const batchDiagComp = componentsList.find((c) => c.id === "bio-batchdiag")!;
const batchCorrectComp = componentsList.find((c) => c.id === "bio-batchcorrect")!;

const validSteps: RecipeStepState[] = [
  { id: "bio-validate", params: { schema: "transplant_v1" } },
  { id: "bio-batchdiag", params: { risk_threshold: "warn", cell_type_key: "cell_type" } },
  { id: "bio-batchcorrect", params: { method: "auto" } },
];

assert(
  validateDAG(validSteps) === "valid",
  "Valid sequential DAG returns DAGStatus 'valid'"
);

// Test 3: Missing upstream dependency fails validation
const invalidSteps: RecipeStepState[] = [
  { id: "bio-batchcorrect", params: { method: "auto" } }, // requires batch_metrics
];

assert(
  validateDAG(invalidSteps) === "invalid",
  "Pipeline with missing upstream requirement returns DAGStatus 'invalid'"
);

// Test 4: Check requirements helper function
const missingForBatchCorrect = getMissingRequirements(batchCorrectComp, []);
assert(
  missingForBatchCorrect.includes("batch_metrics"),
  "getMissingRequirements identifies missing 'batch_metrics' for bio-batchcorrect"
);

// Test 5: Can add component helper
assert(
  canAddComponent(validateComp, []) === true,
  "canAddComponent returns true for source component with no requirements"
);

assert(
  canAddComponent(batchDiagComp, []) === false,
  "canAddComponent returns false when upstream requirements are unmet"
);

// Test 6: Provided outputs resolution
const providedOutputs = getProvidedOutputs([
  { id: "bio-validate", params: {} },
  { id: "bio-batchdiag", params: {} },
]);

assert(
  providedOutputs.has("validated_data") && providedOutputs.has("batch_metrics"),
  "getProvidedOutputs correctly resolves output tags from steps"
);

console.log(`\nDAG Validation Test Summary: ${passed} passed, ${failed} failed.`);

if (failed > 0) {
  process.exit(1);
}
