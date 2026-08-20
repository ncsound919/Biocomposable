import {
  RoadmapItem,
  PriorityItem,
  RpdFactor,
  FedSite,
  CrossPlatformMetric,
  TransferMetric,
  OrganoidSource,
  SeparationLayer,
  FailureCase,
  Layer,
  Contract,
  ComponentItem,
  DeterminismItem,
  ComponentManifest,
  RecipeStepState,
  ComponentLayer,
} from "./types";

export const layers: Layer[] = [
  {
    id: "orchestration",
    name: "Orchestration Layer",
    description: "Thin, optional, replaceable entry point for declarative pipelines.",
    details: "Recipe system · CLI/GUI entry point · DAG builder. Users can bypass this entirely and call components directly.",
    color: "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300",
    components: ["Recipe system", "CLI / GUI", "DAG builder"]
  },
  {
    id: "components",
    name: "Component Layer",
    description: "Independent, pip-installable packages with specific biological functions.",
    details: "Each component is independently versioned, has its own repo, CI, tests, and release cycle. They perform a single, well-defined function.",
    color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300",
    components: ["bio-validate", "bio-batchdiag", "bio-multimodal", "bio-report"]
  },
  {
    id: "contracts",
    name: "Contract Layer",
    description: "The glue that makes composability possible without tight coupling.",
    details: "Formalized interfaces (DataContract, DesignMatrixContract, ModelInterface, ComponentManifest) that dictate how data and models are structured and exchanged.",
    color: "bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300",
    components: ["DataContract", "DesignMatrix", "ModelInterface", "ComponentManifest"]
  },
  {
    id: "infrastructure",
    name: "Infrastructure Layer",
    description: "Shared foundational services and compute resources.",
    details: "Execution backends (local/SLURM/cloud), container registries, reference data stores, federated access control, and audit logging.",
    color: "bg-slate-500/10 border-slate-500/30 text-slate-700 dark:text-slate-300",
    components: ["Execution backends", "Container registry", "Data governance"]
  }
];

export const contracts: Contract[] = [
  {
    id: "datacontract",
    name: "DataContract",
    role: "The lingua franca — every component reads/writes this",
    decision: "Extends MuData with Banff scores, clinical annotations, RO-Crate provenance with checksums, and governance metadata. contract_version enables compatibility negotiation.",
    code: `DataContract extends MuData:
  - .uns['experiment_design']: DesignMatrixContract object
  - .uns['banff_scores']: structured Banff lesion scores per sample
  - .uns['clinical_annotations']: recipient/donor metadata, 
    transplant type, immunosuppression regimen
  - .uns['provenance']: RO-Crate manifest reference
  - .uns['data_governance']: access control metadata, consent scope`
  },
  {
    id: "designmatrix",
    name: "DesignMatrix",
    role: "First-class experimental design object",
    decision: 'recommend_correction_strategy() returns one of four strategies — the method that prevents over-correction of confounded designs by recommending "model as covariate" instead of integration.',
    code: `class DesignMatrix:
    factors: dict[str, Factor]        # batch, condition, donor, timepoint
    covariates: dict[str, Covariate]  # age, sex, immunosuppression level
    confounding_report: ConfoundingReport

    def compute_confounding(self) -> ConfoundingReport: ...
    def recommend_correction_strategy(self) -> str: ...`
  },
  {
    id: "modelinterface",
    name: "ModelInterface",
    role: "Python Protocol every ML model must implement",
    decision: "Four required outputs: prediction + calibrated uncertainty + attributions + counterfactuals in actionable subspaces. surrogate() method for CURE compliance.",
    code: `class ModelInterface(Protocol):
    def predict(self, data: DataContract) -> PredictionContract: ...
    def explain(self, data: DataContract, prediction: PredictionContract) -> AttributionContract: ...
    
    # CURE (Counterfactuals for Uncovering Rejection Effects)
    def surrogate(self, target: str) -> InterpretableModel: ...`
  },
  {
    id: "componentmanifest",
    name: "ComponentManifest",
    role: "Self-describing component metadata",
    decision: "Declares requirements, capabilities, compute profile, compliance status, and entry points. This is what makes the ecosystem composable — the orchestration layer reads manifests to build DAGs.",
    code: `class ComponentManifest:
    name: str = "bio-crossmodal-align"
    version: str = "1.2.0"
    contract_version: str = "v1"
    
    requires: ContractRequirement
    produces: ContractOutput
    
    def validate_inputs(self, data: DataContract) -> bool: ...`
  }
];

export const determinismData: DeterminismItem[] = [
  {
    id: "preprocessing",
    component: "Preprocessing Determinism",
    technique:
      "All preprocessing steps — read trimming, alignment, filtering, gene annotation — are executed as versioned Nextflow/Snakemake processes inside pinned Singularity/Docker containers. Input data is checksummed (SHA-256) on ingest and verified post-pipeline. Random seeds are explicitly set for every operation, including those buried inside third-party tools. The ComponentManifest declares every consumed reference database (GENCODE v44, GRCh38.p14) with its own checksum, so reference drift between runs is impossible.",
    importance:
      "Preprocessing is where silent corruption enters. A gene annotation update, a default parameter change in a trimming tool, or a different SAMtools version can shift expression quantification by 10-20% — enough to flip differential expression calls. Pinning everything from container to reference eliminates the most common source of irreproducible results.",
  },
  {
    id: "normalization",
    component: "Normalization Determinism",
    technique:
      "Normalization recipes are declarative, not implicit. Each modality ships a named normalization recipe (e.g., 'scrna_sctransform_v2', 'cfrna_cpm_length_normalized') with documented assumptions about the data distribution. The recipe is recorded in the DataContract's provenance record. Normalization parameters (min_cells, min_counts, n_hvgs, regress_out variables) are explicitly declared in the ComponentManifest, not left to library defaults that may change across versions.",
    importance:
      "Normalization choices are the single largest source of disagreement between bioinformatics analyses of the same dataset. Two teams can reach opposite conclusions purely from choosing SCTransform vs. scran normalization. Making recipes declarative and versioned means a reviewer can immediately see what was applied and reproduce it exactly — no guessing at what 'standard normalization' meant.",
  },
  {
    id: "inference",
    component: "Inference Determinism",
    technique:
      "All probabilistic models (scVI, totalVI, the cfRNA deconvolution model) are configured with deterministic PyTorch backends: torch.manual_seed, torch.use_deterministic_algorithms(True), CUBLAS_WORKSPACE_CONFIG=:4096:8. Variational inference runs are executed K times (default K=3) with different seeds; the posterior is reported as the mean ± uncertainty across runs. If variance across seeds exceeds a threshold (indicating the optimization landscape is multimodal), a warning is emitted and the full set of K results is retained for inspection rather than silently averaging.",
    importance:
      "Stochastic optimization in deep generative models produces different cell type proportions, latent embeddings, and uncertainty estimates on every run with a different seed. Without deterministic mode and multi-seed evaluation, a user might get a rejection-positive prediction on Tuesday and rejection-negative on Wednesday from the same input — with no way to explain why. Multi-seed variance is itself a diagnostic: high variance means the model hasn't converged to a stable solution.",
  },
  {
    id: "rules",
    component: "Validation Rules Determinism",
    technique:
      "Biological validation rules (Banff score consistency, cell type proportion summation, gene ID reference matching, cfRNA tissue-of-origin score normalization) are encoded as declarative predicates in a versioned LinkML schema, not as ad-hoc Python if-statements scattered across notebooks. Rules are evaluated in a fixed order (schema → biological → QC) and produce structured ValidationReports with pass/fail/warn per rule. The full ruleset version is recorded in the RO-Crate provenance manifest.",
    importance:
      "Validation rules are the guardrails that prevent biologically impossible results from reaching clinical interpretation. But if these rules live in notebooks with copy-pasted logic, they drift between labs, get selectively disabled, and can't be audited. A versioned, declarative ruleset means every analysis is held to the same biological sanity checks — and a reviewer can see exactly which ruleset version was applied.",
  },
  {
    id: "pipeline",
    component: "Pipeline-Level Reproducibility",
    technique:
      "The entire pipeline — from raw FASTQ through validated DataContract through model predictions through final report — is packaged as a single RO-Crate or DataLad dataset. This package contains: all code (Git commit hash), all containers (SHA-256 digests), all reference databases (versioned + checksummed), all parameters (declared in ComponentManifests), all random seeds, all intermediate DataContracts (versioned), and the final report. Re-execution on a different machine reproduces byte-identical output given the same input data. A 'Reproducibility Debt Score' is computed per release by comparing the current manifest's dependencies against the last validated baseline, flagging any drift in versions, references, or parameters.",
    importance:
      "A pipeline that produces different results on different machines, or that silently changes when a dependency updates, is not a scientific instrument — it's a random number generator with a user interface. Full provenance packaging with byte-level reproducibility is the difference between a tool that generates hypotheses and a tool that supports clinical decisions. The Reproducibility Debt Score turns reproducibility from a binary 'is it reproducible?' into a tracked metric that degrades measurably over time and can be actively managed.",
  },
];

export const COMPONENT_LAYERS: { label: string; value: ComponentLayer }[] = [
  { label: "Source", value: "source" },
  { label: "Preprocessing", value: "preprocessing" },
  { label: "Analysis", value: "analysis" },
  { label: "Interpretation", value: "interpretation" },
  { label: "Governance", value: "governance" },
  { label: "Evaluation", value: "evaluation" },
  { label: "Output", value: "output" },
];

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

export const roadmapData: RoadmapItem[] = [
  {
    id: "phase1",
    phase: 1,
    components: ["bio-contracts"],
    description: "Everything depends on it, and the contract design work is where 80% of the architectural decisions live",
    status: "completed",
    details: "Implemented via DataContract, DesignMatrix, ModelInterface, and ComponentManifest standard schemas.",
    dependencies: [],
    linkId: "contracts"
  },
  {
    id: "phase2",
    phase: 2,
    components: ["bio-validate"],
    description: "Immediately useful standalone, validates the contract design",
    status: "planned",
    details: "Automated test suite to ensure uploaded raw data meets the structural and semantic constraints of the DataContract.",
    dependencies: ["phase1"],
    linkId: ""
  },
  {
    id: "phase3",
    phase: 3,
    components: ["bio-crossmodal-align"],
    description: "The differentiated component with highest clinical value",
    status: "completed",
    details: "Implemented Reference-Free Mapping Mode (Atlas/Hybrid/Reference-Free) mapping cfRNA profiles to rejection probabilities.",
    dependencies: ["phase1", "phase2"],
    linkId: "reference-free"
  },
  {
    id: "phase4",
    phase: 4,
    components: ["bio-batchdiag", "bio-batchcorrect"],
    description: "Needed before any multi-site analysis",
    status: "in-progress",
    details: "Integration tools like Harmony and scVI, driven by automated batch diagnostics detecting kBET/Silhouette threshold violations.",
    dependencies: ["phase1"],
    linkId: ""
  },
  {
    id: "phase5",
    phase: 5,
    components: ["bio-bench"],
    description: "Establish benchmark baselines as you build",
    status: "completed",
    details: "Organoid Pre-training & Clinical Transfer pipeline evaluating generalization robustly across different clinical contexts.",
    dependencies: ["phase3"],
    linkId: "cross-platform"
  },
  {
    id: "phase6",
    phase: 6,
    components: ["bio-interpret"],
    description: "Wrap the crossmodal model once it's trained",
    status: "planned",
    details: "CURE-compliant feature attribution (SHAP/Integrated Gradients) explaining model confidence on a per-transcript level.",
    dependencies: ["phase3"],
    linkId: ""
  },
  {
    id: "phase7",
    phase: 7,
    components: ["bio-governance"],
    description: "Needed before any clinical deployment",
    status: "completed",
    details: "Federated validation layers ensuring HIPAA/GDPR compliance, access tiers, and provenance tracking across multiple participating hospitals.",
    dependencies: ["phase1"],
    linkId: "governance"
  },
  {
    id: "phase8",
    phase: 8,
    components: ["bio-multimodal"],
    description: "Extend beyond cfRNA once core pipeline works",
    status: "planned",
    details: "Incorporating spatial transcriptomics, cfDNA methylation, and high-res imaging into a unified rejection classifier.",
    dependencies: ["phase3"],
    linkId: ""
  },
  {
    id: "phase9",
    phase: 9,
    components: ["bio-orchestrate"],
    description: "Compose everything once components are stable",
    status: "completed",
    details: "Interactive DAG visualizer and code generator for building agent-readable declarative recipes.",
    dependencies: ["phase1", "phase2", "phase3", "phase4", "phase5", "phase6", "phase7"],
    linkId: "recipe"
  }
];

export const prioritiesData: PriorityItem[] = [
  {
    id: "agent-api",
    title: "1. Agent API",
    phase: "Phase 1 (Now)",
    urgency: "Highest urgency",
    implementation: [
      "Dedicated route group: /agent/v1/* for autonomous access",
      "Core endpoints: /run, /jobs, /recipes, /explain, /provenance",
      "Agent-readable recipes: locked params, schemas, and container digests",
      "Structured JSON responses with deterministic: true flag"
    ],
    icon: "Bot"
  },
  {
    id: "reference-free",
    title: "2. Reference-Free Mode",
    phase: "Phase 1 (Now)",
    implementation: [
      "Literal['atlas', 'reference_free', 'hybrid'] parameter in bio-crossmodal-align",
      "Binary-SPA style mapping without matched single-cell reference",
      "Surface in Python/R SDK and /agent/v1/run endpoint"
    ],
    icon: "Binary"
  },
  {
    id: "rpd-metric",
    title: "3. Reproducibility Debt (RpD)",
    phase: "Phase 1 (Now)",
    implementation: [
      "Quantitative score (0.0 to 1.0) inside bio-bench",
      "Penalizes missing digests, unpinned deps, unseeded randomness",
      "Surfaced in API responses, reports, and CI PR gates"
    ],
    icon: "Scale"
  },
  {
    id: "organoid-pretrain",
    title: "4. Organoid Pre-Training",
    phase: "Phase 2",
    implementation: [
      "Clean pre-training on organoid datasets (Kidney AKI, Greenstone T1D)",
      "Fine-tune on clinical Banff-labeled biopsies / cfRNA",
      "Dedicated 'organoid → clinical transfer' benchmark in bio-bench"
    ],
    icon: "TestTube2"
  },
  {
    id: "cross-platform",
    title: "5. Cross-Platform Generalization",
    phase: "Phase 2",
    implementation: [
      "Cross-protocol track in bio-bench (library-prep robustness)",
      "evaluate_cross_platform flag for model evaluation",
      "Domain-adversarial/invariant learning during training"
    ],
    icon: "Network"
  },
  {
    id: "federated-governance",
    title: "6. Federated Governance Depth",
    phase: "Phase 3",
    implementation: [
      "Per-site calibration metrics and semantic heterogeneity scores",
      "Benefit-sharing and data-use metadata tracking",
      "Federated evaluation mode API (/agent/v1/federation/report)"
    ],
    icon: "ShieldCheck"
  }
];

export const rpdData: RpdFactor[] = [
  {
    id: "digest",
    name: "Missing Container Digest",
    impact: 0.0,
    status: "pass",
    description: "Docker/Singularity image is strictly identified by SHA-256 digest."
  },
  {
    id: "deps",
    name: "Unpinned Dependencies",
    impact: 0.05,
    status: "warn",
    description: "requirements.txt used, but missing exact hashes for sub-dependencies."
  },
  {
    id: "nondeterministic",
    name: "Non-Deterministic Steps",
    impact: 0.0,
    status: "pass",
    description: "PyTorch backends configured with use_deterministic_algorithms(True)."
  },
  {
    id: "seeds",
    name: "Absent Random Seeds",
    impact: 0.0,
    status: "pass",
    description: "Explicit seeds provided to all stochastic operations."
  },
  {
    id: "metadata",
    name: "Incomplete Metadata",
    impact: 0.0,
    status: "pass",
    description: "ComponentManifest completely populated with governance data."
  },
  {
    id: "tests",
    name: "Lack of Unit Tests",
    impact: 0.07,
    status: "fail",
    description: "Component tests cover < 80% of critical branching logic."
  }
];

export const federatedSitesData: FedSite[] = [
  {
    id: "mgb",
    name: "Mass General Brigham",
    cohortSize: 1250,
    calibration: { ece: 0.02, slope: 1.01 },
    heterogeneity: 0.05,
    dataRights: "Controlled Access (DUA required)"
  },
  {
    id: "charite",
    name: "Charité Berlin",
    cohortSize: 840,
    calibration: { ece: 0.08, slope: 0.91 },
    heterogeneity: 0.14,
    dataRights: "EU GDPR Restricted (Local compute only)"
  },
  {
    id: "ucsf",
    name: "UCSF Medical Center",
    cohortSize: 2100,
    calibration: { ece: 0.01, slope: 0.99 },
    heterogeneity: 0.03,
    dataRights: "Open Consortium Use"
  }
];

export const crossPlatformData: CrossPlatformMetric[] = [
  {
    id: "cp1",
    protocolA: "Standard RNA-seq (Poly-A)",
    protocolB: "Low-input Total RNA (Ribo-Zero)",
    concordance: 0.96,
    cellStateCorrelation: 0.94,
    calibrationDrift: 0.015,
    rpdA: 0.00,
    rpdB: 0.05,
  },
  {
    id: "cp2",
    protocolA: "Baseline cfDNA Extraction",
    protocolB: "Fragmentia-AI cfDNA Var",
    concordance: 0.92,
    cellStateCorrelation: 0.88,
    calibrationDrift: 0.042,
    rpdA: 0.00,
    rpdB: 0.12,
  },
  {
    id: "cp3",
    protocolA: "10x Genomics 3' v3.1",
    protocolB: "Parse Biosciences Evercode",
    concordance: 0.89,
    cellStateCorrelation: 0.82,
    calibrationDrift: 0.065,
    rpdA: 0.00,
    rpdB: 0.08,
  }
];

export const organoidSources: OrganoidSource[] = [
  { id: "src1", name: "kidney_organoid_aki", version: "v1.2 (10x Multiome)", provenance: "sha256:8f4e2a1b..." },
  { id: "src2", name: "greenstone_t1d", version: "v2.0 (Parse)", provenance: "sha256:3a1b9c8d..." }
];

export const transferMetrics: TransferMetric[] = [
  { id: "m1", task: "Banff T-Cell Mediated Rejection (TCMR)", baselineAUC: 0.76, transferAUC: 0.89 },
  { id: "m2", task: "Antibody-Mediated Rejection (ABMR)", baselineAUC: 0.81, transferAUC: 0.92 },
  { id: "m3", task: "Fibrosis / IFTA chronicity", baselineAUC: 0.72, transferAUC: 0.85 }
];

export const separationData: SeparationLayer[] = [
  {
    id: "data",
    name: "Data Representation",
    tagline: "The contract, not the container",
    principle:
      "Data has a life cycle independent of any tool that created or consumed it. A scRNA-seq experiment from 2024 should be analyzable by a tool written in 2026 without re-processing. This requires a stable, versioned data contract that separates what the data IS (structure, semantics, provenance) from how it's stored (HDF5, Parquet, Zarr) or what produced it (10x Cell Ranger, Parse Biosciences, BD Rhapsody).",
    monolithicFailure:
      "Monolithic platforms couple data to their internal storage format. Galaxy stores data in its own history objects. DNAnexus used to lock data into platform-specific project structures. When the platform changes its internal format, every downstream analysis breaks. When the platform is abandoned, the data becomes unreadable. This is why 15 years of bioinformatics data sit in inaccessible formats on decommissioned servers.",
    composableSolution:
      "DataContract extends MuData (AnnData for single-modal, MuData for multi-modal) with transplant-domain fields and RO-Crate provenance. The contract is versioned with semver — breaking changes require a major version bump. Components declare which contract version they support in their ComponentManifest. The storage backend (HDF5, Zarr, Parquet) is an implementation detail behind the contract interface, swappable without breaking any consumer. anndataR (2026) demonstrated this works: R users can now read H5AD files natively without Python, because the contract (AnnData schema) is independent of the runtime.",
    realWorldProof:
      "Ibis (codecentric, 2026) proved this principle for analytics: 'Analytical intent should be defined independently of the execution engine.' They decoupled the data representation (table expressions) from backends (DuckDB, Pandas, PySpark, MySQL) — write logic once, run it anywhere. scverse proved it for biology: AnnData became the contract that 50+ tools independently implement against, creating an ecosystem without a platform.",
    ourComponents: ["bio-contracts (DataContract)", "bio-contracts (DesignMatrix)", "bio-validate", "bio-refdata"],
    codeExample: `# Data representation is a CONTRACT, not a format

# This object survives tool changes, platform changes,
# even language changes (anndataR reads it in R now)
data = DataContract(
    mudata=mudata,           # AnnData/MuData — the stable schema
    banff_scores=banff,      # transplant domain extension
    clinical=clinical,       # recipient/donor metadata
    provenance=ProvenanceRecord(
        pipeline_version="0.1.0",
        container_digest="sha256:a1b2c3...",
        reference_db_versions={"GENCODE": "v44"},
    ),
    governance=GovernanceMetadata(
        access_tier="controlled",
        consent_scope=["research", "federated"],
    ),
)

# The storage backend is swappable — same contract,
# different physical representation
data.to_rocrate("output/")       # RO-Crate package
data.to_h5ad("output.h5ad")      # HDF5-backed
data.to_zarr("output.zarr/")     # cloud-optimized
# All three produce byte-different files
# but contract-identical DataContracts`,
  },
  {
    id: "logic",
    name: "Analytical Logic",
    tagline: "The algorithm, not the pipeline",
    principle:
      "An algorithm's correctness is independent of the pipeline that invokes it. SHAP attribution works the same whether called from a Nextflow pipeline, a Jupyter notebook, or an LLM agent. Batch correction with Harmony produces the same embedding whether triggered by a CLI command, a web GUI, or a federated training coordinator. Coupling logic to a specific execution context makes it untestable in isolation, unbenchmarkable against alternatives, and unusable outside its original pipeline.",
    monolithicFailure:
      "Monolithic platforms embed analytical logic inside pipeline definitions. A normalization step in a Galaxy workflow is a Galaxy tool wrapper — it can't be imported as a Python function, can't be benchmarked in OpenProblems, can't be called by an LLM agent, and can't be reused in a different workflow without re-wrapping. The logic is hostage to the platform's execution model. nf-core partially solved this with modules, but modules are still Nextflow-specific — you can't call an nf-core module from a Snakemake pipeline without rewriting the wrapper.",
    composableSolution:
      "Each analytical component is a pip-installable Python package with a uniform entry point (the ComponentManifest's python_api field). bio-batchdiag exports run_diagnostics(data, design) → BatchMetrics. bio-crossmodal-align exports cfRNADeconvolutionModel.predict(data) → Prediction. These are plain Python functions/objects — callable from notebooks, pipelines, agents, or federated coordinators. The ComponentManifest declares I/O contracts so any caller can verify compatibility before invocation. Viash wrapping (used by OpenProblems.bio) makes the same component executable as a CLI, a Nextflow module, or a Python import — same logic, three invocation surfaces.",
    realWorldProof:
      "Branda et al. (2026, Briefings in Bioinformatics) called for exactly this: 'a major opportunity is standardized workflow substrates in which agents, tools, and datasets form modular, composable components.' OpenProblems.bio proved it works: 126 methods wrapped as Viash components, benchmarked uniformly, each callable as a Python function OR a Nextflow module. pertpy (scverse, 2025) proved it for transplant-adjacent biology: perturbation analysis as a standalone, importable package that interoperates with scanpy without being coupled to any pipeline.",
    ourComponents: [
      "bio-batchdiag",
      "bio-batchcorrect",
      "bio-crossmodal-align",
      "bio-multimodal",
      "bio-interpret",
    ],
    codeExample: `# Analytical logic is a FUNCTION, not a pipeline step

# Same function, three invocation surfaces:

# 1. From a notebook (bioinformatician)
from bio_batchdiag import run_diagnostics
metrics = run_diagnostics(data, design)
# → BatchMetrics(silhouette_batch=0.12, kBET=0.85, ...)

# 2. From a Nextflow pipeline (pipeline engineer)
# bio-batchdiag is auto-wrapped as a Viash component
# → nextflow run bio-batchdiag --input data.h5ad

# 3. From an LLM agent (autonomous)
# POST /agent/v1/execute
# {"intent": "diagnose_batch_effects",
#  "data_uri": "s3://bucket/data.h5ad"}
# → {"results": {"silhouette_batch": 0.12, ...}}

# The logic doesn't know or care who called it.
# The contract guarantees the same input → same output.`,
  },
  {
    id: "orchestration",
    name: "Orchestration",
    tagline: "The glue, not the foundation",
    principle:
      "Orchestration is the thinnest layer. It reads manifests, builds a DAG, dispatches to components, and passes DataContracts between them. It contains zero analytical logic. It should be replaceable — a user should be able to bypass it entirely and call components directly, or swap it for a different orchestrator (Nextflow, Snakemake, Airflow, an LLM agent) without changing any component. The orchestration layer is convenience, not dependency.",
    monolithicFailure:
      "Monolithic platforms make orchestration the foundation. Galaxy IS the orchestrator — remove it and nothing works. The platform defines the workflow language, the execution model, the data passing mechanism, and the UI. Every tool must be wrapped in the platform's format. The orchestration layer becomes a prison: you can't use a Galaxy tool outside Galaxy, you can't replace Galaxy's scheduler, you can't let an agent compose Galaxy tools without going through Galaxy's API. DNAnexus recognized this and is pivoting (2026) from platform to orchestration layer — but only after years of lock-in that drove users away.",
    composableSolution:
      "bio-orchestrate is a thin recipe executor. A recipe is a declarative YAML/Python list of (component, version, params, condition). The executor reads ComponentManifests, validates contract compatibility, builds a topological DAG, evaluates conditions, and dispatches. No analytical logic lives here. Users bypass it by importing components directly. LLM agents bypass it by calling /agent/v1/compose to build recipes programmatically. The recipe format is portable — a recipe written for bio-orchestrate can be translated to a Nextflow config or a Snakemake Snakefile because components are self-describing via their manifests.",
    realWorldProof:
      "Anthropic's Claude (Aug 18, 2026) proved autonomous orchestration works: Claude installed tools, composed pipelines, iterated on results, and managed the full protein design stack — without a dedicated orchestration platform. It discovered tools, reasoned about their I/O, and composed them on the fly. This is only possible when components are self-describing and independently callable. DNAnexus's pivot to 'AI-driven science orchestration' (May 2026) confirms the industry direction: orchestration is becoming an intelligence layer, not a platform. Moderna's MultiStructRNA (Aug 20, 2026) shipping 'agent-readable workflow recipes' signals that the recipe-as-data pattern is entering pharma R&D.",
    ourComponents: ["bio-orchestrate (recipe executor)", "bio-orchestrate (agent API)", "bio-governance (federated coordinator)"],
    codeExample: `# Orchestration is GLUE, not logic

# The recipe is declarative — no analysis here
recipe = Recipe("transplant_cfrna_pipeline")
recipe.add_step("bio-validate", schema="transplant_v1")
recipe.add_step("bio-refdata", reference="GENCODE_v44")
recipe.add_step("bio-batchdiag", risk_threshold="warn")
recipe.add_step("bio-batchcorrect", method="auto",
                condition="batchdiag.metrics.needs_correction")
recipe.add_step("bio-crossmodal-align",
                model_version="cfrna_deconv_v1")
recipe.add_step("bio-interpret", method="shap")
recipe.add_step("bio-report", format="banff_compatible")

# The executor just reads manifests and dispatches
executor = RecipeExecutor(component_registry)
result = executor.execute(recipe, input_data)

# Or bypass orchestration entirely:
from bio_validate import validate
from bio_batchdiag import run_diagnostics
data = validate(raw, schema="transplant_v1")
metrics = run_diagnostics(data, design)
# Same result, no orchestrator needed`,
  }
];

export const monolithicFailures: FailureCase[] = [
  {
    platform: "Galaxy",
    coupled: "Data + Logic + Orchestration",
    consequence:
      "Tools wrapped as Galaxy-specific XML can't be imported as Python functions, benchmarked in OpenProblems, or called by LLM agents. 15 years of community-contributed tools are locked behind the Galaxy execution model.",
    lesson: "Wrapping tools in a platform-specific format makes them unusable outside that platform. Components must be native functions first, platform integrations second.",
  },
  {
    platform: "DNAnexus (pre-2026)",
    coupled: "Data + Storage + Orchestration",
    consequence:
      "Data locked into platform-specific project structures. When the platform changed its internal format, downstream analyses broke. Users migrated away rather than re-wrapping everything.",
    lesson: "Coupling data to a storage format creates migration debt. The data contract must be independent of the physical storage backend. DNAnexus recognized this and pivoted to an orchestration-only layer in 2026.",
  },
  {
    platform: "MMDx (Thermo Fisher)",
    coupled: "Data + Logic + Orchestration + Commercial",
    consequence:
      "The entire molecular rejection diagnostic pipeline — from RNAlater preservation through microarray hybridization to the ML classifier — is proprietary. No open-source equivalent exists. The transplant community depends on a single vendor for molecular diagnostics.",
    lesson: "Coupling analytical logic to a commercial platform creates a single point of failure for an entire clinical domain. Open-source components with standard contracts break this dependency — your tool fills this exact gap.",
  },
  {
    platform: "Custom lab pipelines",
    coupled: "Data + Logic + Orchestration + Notebook",
    consequence:
      "Analysis code lives in Jupyter notebooks with hardcoded paths, implicit data assumptions, and version-unpinned dependencies. 'The code doesn't run, dependencies are broken, datasets are tiny or cherry-picked, and very little of it is reproducible' (r/bioinformatics, Nov 2025).",
    lesson: "When data, logic, and orchestration are all mixed in a notebook, none of them are testable, reusable, or reproducible. Separating them into contracts, functions, and recipes makes each independently auditable.",
  }
];
