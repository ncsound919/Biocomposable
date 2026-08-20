import os

with open('src/data.ts', 'r') as f:
    text = f.read()

import re

new_roadmap_data = """export const roadmapData: RoadmapItem[] = [
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
];"""

text = re.sub(
    r'export const roadmapData: RoadmapItem\[\] = \[.*?\];',
    new_roadmap_data,
    text,
    flags=re.DOTALL
)

with open('src/data.ts', 'w') as f:
    f.write(text)
