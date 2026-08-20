import os

with open('src/types.ts', 'r') as f:
    types_content = f.read()

if 'export interface CrossPlatformMetric' not in types_content:
    types_content += """
export interface CrossPlatformMetric {
  id: string;
  protocolA: string;
  protocolB: string;
  concordance: number;
  cellStateCorrelation: number;
  calibrationDrift: number;
}
"""
    with open('src/types.ts', 'w') as f:
        f.write(types_content)

with open('src/data.ts', 'r') as f:
    data_content = f.read()

if 'CrossPlatformMetric' not in data_content:
    data_content = data_content.replace(
        "FedSite,",
        "FedSite,\n  CrossPlatformMetric,"
    )

if 'export const crossPlatformData' not in data_content:
    data_content += """
export const crossPlatformData: CrossPlatformMetric[] = [
  {
    id: "cp1",
    protocolA: "Standard RNA-seq (Poly-A)",
    protocolB: "Low-input Total RNA (Ribo-Zero)",
    concordance: 0.96,
    cellStateCorrelation: 0.94,
    calibrationDrift: 0.015,
  },
  {
    id: "cp2",
    protocolA: "Baseline cfDNA Extraction",
    protocolB: "Fragmentia-AI cfDNA Var",
    concordance: 0.92,
    cellStateCorrelation: 0.88,
    calibrationDrift: 0.042,
  },
  {
    id: "cp3",
    protocolA: "10x Genomics 3' v3.1",
    protocolB: "Parse Biosciences Evercode",
    concordance: 0.89,
    cellStateCorrelation: 0.82,
    calibrationDrift: 0.065,
  }
];
"""
    with open('src/data.ts', 'w') as f:
        f.write(data_content)
