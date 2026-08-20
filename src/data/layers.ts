import { Layer, ComponentLayer, SeparationLayer, FailureCase } from "../types";

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

export const COMPONENT_LAYERS: { label: string; value: ComponentLayer }[] = [
  { label: "Source", value: "source" },
  { label: "Preprocessing", value: "preprocessing" },
  { label: "Analysis", value: "analysis" },
  { label: "Interpretation", value: "interpretation" },
  { label: "Governance", value: "governance" },
  { label: "Evaluation", value: "evaluation" },
  { label: "Output", value: "output" },
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
