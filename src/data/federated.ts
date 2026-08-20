import { FedSite, CrossPlatformMetric, OrganoidSource, TransferMetric } from "../types";

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

export const crossPlatformData: CrossPlatformMetric[] = [
  {
    id: "cp1",
    protocolA: "Standard RNA-seq (Poly-A)",
    protocolB: "Low-input Total RNA (Ribo-Zero)",
    concordance: 0.96,
    cellStateCorrelation: 0.94,
    calibrationDrift: 0.015,
    rpdA: 0.00,
    rpdB: 0.05,
  },
  {
    id: "cp2",
    protocolA: "Baseline cfDNA Extraction",
    protocolB: "Fragmentia-AI cfDNA Var",
    concordance: 0.92,
    cellStateCorrelation: 0.88,
    calibrationDrift: 0.042,
    rpdA: 0.00,
    rpdB: 0.12,
  },
  {
    id: "cp3",
    protocolA: "10x Genomics 3' v3.1",
    protocolB: "Parse Biosciences Evercode",
    concordance: 0.89,
    cellStateCorrelation: 0.82,
    calibrationDrift: 0.065,
    rpdA: 0.00,
    rpdB: 0.08,
  }
];

export const organoidSources: OrganoidSource[] = [
  { id: "src1", name: "kidney_organoid_aki", version: "v1.2 (10x Multiome)", provenance: "sha256:8f4e2a1b..." },
  { id: "src2", name: "greenstone_t1d", version: "v2.0 (Parse)", provenance: "sha256:3a1b9c8d..." }
];

export const transferMetrics: TransferMetric[] = [
  { id: "m1", task: "Banff T-Cell Mediated Rejection (TCMR)", baselineAUC: 0.76, transferAUC: 0.89 },
  { id: "m2", task: "Antibody-Mediated Rejection (ABMR)", baselineAUC: 0.81, transferAUC: 0.92 },
  { id: "m3", task: "Fibrosis / IFTA chronicity", baselineAUC: 0.72, transferAUC: 0.85 }
];
