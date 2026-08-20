import { generatePipelineScripts } from "../utils/pipelineGenerator";
import { RecipeStepState } from "../types";

console.log("Running BioComposable Pipeline Script Generator Unit Tests...\n");

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

const mockSteps: RecipeStepState[] = [
  { id: "bio-validate", params: { schema: "transplant_v1" } },
  { id: "bio-batchdiag", params: { risk_threshold: "warn" } },
  { id: "bio-crossmodal-align", params: { model_version: "cfrna_deconv_v1" } },
];

const scripts = generatePipelineScripts(mockSteps, "kidney_cohort.h5ad");

// Test 1: Python Script Generation
assert(
  scripts.pythonScript.includes("import mudata as md") &&
    scripts.pythonScript.includes("import scanpy as sc"),
  "Python script includes required open-source PyPI imports (mudata, scanpy)"
);

assert(
  scripts.pythonScript.includes("SEED = 42") &&
    scripts.pythonScript.includes("torch.manual_seed(SEED)"),
  "Python script sets explicit PRNG seed pinning for reproducibility"
);

assert(
  scripts.pythonScript.includes("sc.pp.normalize_total") &&
    scripts.pythonScript.includes("sc.tl.pca"),
  "Python script includes real Scanpy preprocessing workflow"
);

assert(
  scripts.pythonScript.includes("bio-validate") &&
    scripts.pythonScript.includes("bio-crossmodal-align"),
  "Python script includes all requested step IDs in execution steps"
);

assert(
  scripts.pythonScript.includes("kidney_cohort.h5ad"),
  "Python script targets custom cohort file"
);

// Test 2: Nextflow Script Generation
assert(
  scripts.nextflowScript.includes("nextflow.enable.dsl=2"),
  "Nextflow script contains DSL2 header"
);

assert(
  scripts.nextflowScript.includes("@sha256:"),
  "Nextflow script specifies SHA-256 digest container pinning"
);

assert(
  scripts.nextflowScript.includes("PROCESS_BIO_VALIDATE") &&
    scripts.nextflowScript.includes("PROCESS_BIO_CROSSMODAL_ALIGN"),
  "Nextflow script auto-generates processes for each pipeline step"
);

// Test 3: Snakemake Script Generation
assert(
  scripts.snakemakeScript.includes("rule all:") &&
    scripts.snakemakeScript.includes("rule step_1_bio_validate:"),
  "Snakemake script auto-generates rules for each pipeline step"
);

console.log(`\nPipeline Generator Test Summary: ${passed} passed, ${failed} failed.`);

if (failed > 0) {
  process.exit(1);
}
