import re

# Update types.ts
with open('src/types.ts', 'r') as f:
    types_content = f.read()

if 'export interface RoadmapItem' not in types_content:
    types_content += """
export interface RoadmapItem {
  id: string;
  phase: number;
  components: string[];
  description: string;
}
"""
    with open('src/types.ts', 'w') as f:
        f.write(types_content)

# Update data.ts
with open('src/data.ts', 'r') as f:
    data_content = f.read()

# Add RoadmapItem to imports
if 'RoadmapItem' not in data_content:
    data_content = data_content.replace(
        "import {",
        "import {\n  RoadmapItem,"
    )

if 'export const roadmapData' not in data_content:
    roadmap_data = """
export const roadmapData: RoadmapItem[] = [
  {
    id: "phase1",
    phase: 1,
    components: ["bio-contracts"],
    description: "Everything depends on it, and the contract design work is where 80% of the architectural decisions live"
  },
  {
    id: "phase2",
    phase: 2,
    components: ["bio-validate"],
    description: "Immediately useful standalone, validates the contract design"
  },
  {
    id: "phase3",
    phase: 3,
    components: ["bio-crossmodal-align"],
    description: "The differentiated component with highest clinical value"
  },
  {
    id: "phase4",
    phase: 4,
    components: ["bio-batchdiag", "bio-batchcorrect"],
    description: "Needed before any multi-site analysis"
  },
  {
    id: "phase5",
    phase: 5,
    components: ["bio-bench"],
    description: "Establish benchmark baselines as you build"
  },
  {
    id: "phase6",
    phase: 6,
    components: ["bio-interpret"],
    description: "Wrap the crossmodal model once it's trained"
  },
  {
    id: "phase7",
    phase: 7,
    components: ["bio-governance"],
    description: "Needed before any clinical deployment"
  },
  {
    id: "phase8",
    phase: 8,
    components: ["bio-multimodal"],
    description: "Extend beyond cfRNA once core pipeline works"
  },
  {
    id: "phase9",
    phase: 9,
    components: ["bio-orchestrate"],
    description: "Compose everything once components are stable"
  }
];
"""
    data_content += roadmap_data
    with open('src/data.ts', 'w') as f:
        f.write(data_content)
