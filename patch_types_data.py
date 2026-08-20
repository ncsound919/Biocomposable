import os

with open('src/types.ts', 'r') as f:
    types_content = f.read()

if 'export interface RpdFactor' not in types_content:
    types_content += """
export interface RpdFactor {
  id: string;
  name: string;
  impact: number;
  status: "pass" | "fail" | "warn";
  description: string;
}

export interface FedSite {
  id: string;
  name: string;
  cohortSize: number;
  calibration: {
    ece: number;
    slope: number;
  };
  heterogeneity: number;
  dataRights: string;
}
"""
    with open('src/types.ts', 'w') as f:
        f.write(types_content)

with open('src/data.ts', 'r') as f:
    data_content = f.read()

if 'RpdFactor' not in data_content:
    data_content = data_content.replace(
        "PriorityItem,",
        "PriorityItem,\n  RpdFactor,\n  FedSite,"
    )

if 'export const rpdData' not in data_content:
    data_content += """
export const rpdData: RpdFactor[] = [
  {
    id: "digest",
    name: "Container Digest Pinned",
    impact: 0.0,
    status: "pass",
    description: "Docker/Singularity image strictly identified by SHA-256 digest."
  },
  {
    id: "seeds",
    name: "Random Seeds Fixed",
    impact: 0.0,
    status: "pass",
    description: "Explicit seeds provided to PyTorch, numpy, and third-party tools."
  },
  {
    id: "deps",
    name: "Dependencies Pinned",
    impact: 0.05,
    status: "warn",
    description: "requirements.txt used, but missing exact hashes for sub-dependencies."
  },
  {
    id: "checksums",
    name: "Data Checksums",
    impact: 0.0,
    status: "pass",
    description: "Input data verified via MD5/SHA256 upon ingest."
  },
  {
    id: "tests",
    name: "Unit Test Coverage",
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
"""
    with open('src/data.ts', 'w') as f:
        f.write(data_content)
