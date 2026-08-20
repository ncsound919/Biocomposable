import re

with open('src/types.ts', 'r') as f:
    text = f.read()

text = text.replace(
"""export interface DeterminismItem {
  id: string;
  component: string;
  technique: string;
  importance: string;
}""",
"""export interface DeterminismItem {
  id: "preprocessing" | "normalization" | "inference" | "rules" | "pipeline";
  component: string;
  technique: string;
  importance: string;
}"""
)

with open('src/types.ts', 'w') as f:
    f.write(text)
