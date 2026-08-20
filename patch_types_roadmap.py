import os

with open('src/types.ts', 'r') as f:
    text = f.read()

text = text.replace(
    'export interface RoadmapItem {\n  id: string;\n  phase: number;\n  components: string[];\n  description: string;\n}',
    'export interface RoadmapItem {\n  id: string;\n  phase: number;\n  components: string[];\n  description: string;\n  status?: "completed" | "in-progress" | "planned";\n  details?: string;\n  dependencies?: string[];\n  linkId?: string;\n}'
)

with open('src/types.ts', 'w') as f:
    f.write(text)
