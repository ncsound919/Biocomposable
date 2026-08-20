import { ComponentManifest, RecipeStepState } from "../types";

export const componentsList: ComponentManifest[] = [
  {
    id: "bio-validate",
    packageName: "bio-validate",
    name: "Data Validation",
    description: "Multi-stage validation: schema, biological sanity, QC thresholds",
    version: "0.1.0",
    layer: "source",
    requires: { upstreamOutputs: [], dataContract: "0.1.0" },
    provides: { outputType: "validated_data", uns: ["qc_report"] },
    parameters: [
      {
        name: "schema",
        type: "select",
        default: "transplant_v1",
        options: ["transplant_v1", "generic_v1"],
        description: "Validation schema to apply on ingest",
      },
    ],
  },
  {
    id: "bio-refdata",
    packageName: "bio-refdata",
    name: "Reference Versioning",
    description: "Versioned, checksummed reference databases (GENCODE, GRCh38, T2T)",
    version: "0.1.0",
    layer: "source",
    requires: { upstreamOutputs: [], dataContract: "0.1.0" },
    provides: { outputType: "reference_data", uns: ["reference_versions"] },
    parameters: [
      {
        name: "reference",
        type: "select",
        default: "GENCODE_v44",
        options: ["GENCODE_v44", "GENCODE_v46"],
        description: "Transcript annotation database version",
      },
      {
        name: "genome",
        type: "select",
        default: "GRCh38",
        options: ["GRCh38", "T2T_CHM13"],
        description: "Reference genome build",
      },
    ],
  },
  {
    id: "bio-batchdiag",
    packageName: "bio-batchdiag",
    name: "Batch Diagnostics",
    description: "Detect, quantify batch effects. Recommends correction strategy. Does NOT correct.",
    version: "0.1.0",
    layer: "preprocessing",
    requires: { upstreamOutputs: ["validated_data"], dataContract: "0.1.0" },
    provides: {
      outputType: "batch_metrics",
      uns: ["batch_metrics", "correction_recommendation"],
    },
    parameters: [
      {
        name: "risk_threshold",
        type: "select",
        default: "warn",
        options: ["warn", "error"],
        description: "Behavior when confounded design detected",
      },
      {
        name: "cell_type_key",
        type: "string",
        default: "cell_type",
        description: "obs column for biological preservation metrics",
      },
    ],
  },
  {
    id: "bio-batchcorrect",
    packageName: "bio-batchcorrect",
    name: "Batch Correction",
    description: "Applies correction recommended by bio-batchdiag. Can skip and model as covariate.",
    version: "0.1.0",
    layer: "preprocessing",
    requires: { upstreamOutputs: ["batch_metrics"], dataContract: "0.1.0" },
    provides: { outputType: "corrected_data", obsm: ["X_corrected"] },
    parameters: [
      {
        name: "method",
        type: "select",
        default: "auto",
        options: ["auto", "harmony", "scvi", "combat", "none"],
        description: "Correction method (none = model batch as GLM covariate)",
      },
    ],
    defaultCondition: "bio_batchdiag.metrics.needs_correction == true",
  },
  {
    id: "bio-crossmodal-align",
    packageName: "bio-crossmodal-align",
    name: "cfRNA Deconvolution",
    description: "Cross-modal alignment: maps cfRNA plasma signal to tissue cell type proportions",
    version: "0.1.0",
    layer: "analysis",
    requires: { upstreamOutputs: ["validated_data"], dataContract: "0.1.0" },
    provides: {
      outputType: "model_output",
      uns: ["cell_type_proportions", "calibrated_uncertainty"],
    },
    parameters: [
      {
        name: "model_version",
        type: "string",
        default: "cfrna_deconv_v1",
        description: "Deconvolution model version",
      },
      {
        name: "tissue_reference",
        type: "string",
        default: "kidney_atlas_v1",
        description: "Tissue reference atlas for alignment",
      },
    ],
  },
  {
    id: "bio-multimodal",
    packageName: "bio-multimodal",
    name: "Multi-Omics Integration",
    description: "Integrates transcriptomics, proteomics, spatial with modality-specific noise models",
    version: "0.1.0",
    layer: "analysis",
    requires: { upstreamOutputs: ["validated_data"], dataContract: "0.1.0" },
    provides: { outputType: "model_output", obsm: ["X_integrated"] },
    parameters: [
      {
        name: "integration_type",
        type: "select",
        default: "vertical",
        options: ["vertical", "diagonal", "mosaic", "cross"],
        description: "Integration strategy (Liu et al. 2025 taxonomy)",
      },
      {
        name: "method",
        type: "select",
        default: "multivi",
        options: ["multivi", "totalvi", "mowgli"],
        description: "Integration method",
      },
    ],
  },
  {
    id: "bio-interpret",
    packageName: "bio-interpret",
    name: "Model Interpretability",
    description: "Generates SHAP attributions, counterfactuals, CURE compliance reports",
    version: "0.1.0",
    layer: "interpretation",
    requires: { upstreamOutputs: ["model_output"], dataContract: "0.1.0" },
    provides: {
      outputType: "explanations",
      uns: ["feature_attributions", "counterfactuals", "cure_report"],
    },
    parameters: [
      {
        name: "method",
        type: "select",
        default: "shap",
        options: ["shap", "integrated_gradients", "attention"],
        description: "Attribution method",
      },
      {
        name: "counterfactual_space",
        type: "select",
        default: "banff_scores",
        options: ["banff_scores", "clinical", "immunosuppression"],
        description: "Feature subspace for counterfactual generation",
      },
    ],
  },
  {
    id: "bio-governance",
    packageName: "bio-governance",
    name: "Federated Access Control",
    description: "RBAC, audit logging, federated multi-center model training",
    version: "0.1.0",
    layer: "governance",
    requires: { upstreamOutputs: [], dataContract: "0.1.0" },
    provides: { outputType: "access_control", uns: ["audit_trail"] },
    parameters: [
      {
        name: "federated",
        type: "boolean",
        default: false,
        description: "Enable federated mode (raw data stays at origin site)",
      },
      {
        name: "access_tier",
        type: "select",
        default: "controlled",
        options: ["open", "controlled", "restricted"],
        description: "Data access tier",
      },
    ],
  },
  {
    id: "bio-bench",
    packageName: "bio-bench",
    name: "Benchmark Registry",
    description: "Viash/OpenProblems-compatible benchmarking with Banff ground truth",
    version: "0.1.0",
    layer: "evaluation",
    requires: { upstreamOutputs: [], dataContract: "0.1.0" },
    provides: { outputType: "benchmark_results", uns: ["metrics", "rankings"] },
    parameters: [
      {
        name: "task",
        type: "select",
        default: "deconvolution",
        options: ["deconvolution", "classification", "integration"],
        description: "Benchmark task to evaluate",
      },
    ],
  },
  {
    id: "bio-report",
    packageName: "bio-report",
    name: "Report Generation",
    description: "Dual output: full technical report + simplified Banff-compatible summary",
    version: "0.1.0",
    layer: "output",
    requires: { upstreamOutputs: ["model_output", "explanations"], dataContract: "0.1.0" },
    provides: { outputType: "report" },
    parameters: [
      {
        name: "format",
        type: "select",
        default: "banff_compatible",
        options: ["banff_compatible", "full_technical", "summary"],
        description: "Report format",
      },
    ],
  },
];

export function getProvidedOutputs(steps: RecipeStepState[]): Set<string> {
  return new Set(
    steps.flatMap((step) => {
      const comp = componentsList.find((c) => c.id === step.id);
      return comp?.provides.outputType ? [comp.provides.outputType] : [];
    })
  );
}

export function canAddComponent(
  comp: ComponentManifest,
  steps: RecipeStepState[]
): boolean {
  if (comp.requires.upstreamOutputs.length === 0) return true;
  const provided = getProvidedOutputs(steps);
  return comp.requires.upstreamOutputs.every((req) => provided.has(req));
}

export function getMissingRequirements(
  comp: ComponentManifest,
  steps: RecipeStepState[]
): string[] {
  if (comp.requires.upstreamOutputs.length === 0) return [];
  const provided = getProvidedOutputs(steps);
  return comp.requires.upstreamOutputs.filter((req) => !provided.has(req));
}

export type DAGStatus = "empty" | "invalid" | "valid";

export function validateDAG(steps: RecipeStepState[]): DAGStatus {
  if (steps.length === 0) return "empty";
  const provided = new Set<string>();
  for (const step of steps) {
    const comp = componentsList.find((c) => c.id === step.id);
    if (!comp) return "invalid";
    for (const req of comp.requires.upstreamOutputs) {
      if (!provided.has(req)) return "invalid";
    }
    if (comp.provides.outputType) {
      provided.add(comp.provides.outputType);
    }
  }
  return "valid";
}
