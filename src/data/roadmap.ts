import { RoadmapItem, PriorityItem } from "../types";

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
