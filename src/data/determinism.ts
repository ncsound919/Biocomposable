import { DeterminismItem, RpdFactor } from "../types";

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
