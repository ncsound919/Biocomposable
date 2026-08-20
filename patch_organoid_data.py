import os
import re

with open('src/types.ts', 'r') as f:
    types = f.read()

if 'export interface TransferMetric' not in types:
    types += """
export interface TransferMetric {
  id: string;
  task: string;
  baselineAUC: number;
  transferAUC: number;
}

export interface OrganoidSource {
  id: string;
  name: string;
  version: string;
  provenance: string;
}
"""
    with open('src/types.ts', 'w') as f:
        f.write(types)

with open('src/data.ts', 'r') as f:
    data = f.read()

if 'TransferMetric' not in data:
    data = data.replace(
        "CrossPlatformMetric,",
        "CrossPlatformMetric,\n  TransferMetric,\n  OrganoidSource,"
    )

if 'export const organoidSources' not in data:
    data += """
export const organoidSources: OrganoidSource[] = [
  { id: "src1", name: "kidney_organoid_aki", version: "v1.2 (10x Multiome)", provenance: "sha256:8f4e2a1b..." },
  { id: "src2", name: "greenstone_t1d", version: "v2.0 (Parse)", provenance: "sha256:3a1b9c8d..." }
];

export const transferMetrics: TransferMetric[] = [
  { id: "m1", task: "Banff T-Cell Mediated Rejection (TCMR)", baselineAUC: 0.76, transferAUC: 0.89 },
  { id: "m2", task: "Antibody-Mediated Rejection (ABMR)", baselineAUC: 0.81, transferAUC: 0.92 },
  { id: "m3", task: "Fibrosis / IFTA chronicity", baselineAUC: 0.72, transferAUC: 0.85 }
];
"""
    with open('src/data.ts', 'w') as f:
        f.write(data)
