import { useState, useEffect } from "react";
import VariantWatchPipelineHub from "./VariantWatchPipelineHub";
import { 
  Dna, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Database, 
  FileText, 
  Terminal, 
  ArrowRight, 
  Search, 
  Plus, 
  Download, 
  RefreshCcw, 
  Upload, 
  Trash2, 
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Info,
  Mail,
  Copy,
  Check,
  FileSpreadsheet,
  GitMerge,
  Brain,
  FileCode,
  Globe,
  CheckSquare,
  Send,
  Sparkles
} from "lucide-react";

// Tracked variant interface
interface TrackedVariant {
  id: string;
  gene: string;
  hgvs: string;
  rsid: string;
  source: string;
  lastClassified: "Pathogenic" | "Likely Pathogenic" | "VUS" | "Likely Benign" | "Benign";
  currentClassified: "Pathogenic" | "Likely Pathogenic" | "VUS" | "Likely Benign" | "Benign";
  reviewStars: number; // ClinVar Review Status 0-4
  submittingLabs: number;
  conflictStatus: boolean;
  confidenceLevel: "HIGH" | "MODERATE" | "LOW";
  lastChecked: string;
  hasChanged: boolean;
  changeType: "UPGRADE" | "DOWNGRADE" | "NO_CHANGE" | "NEW_EVIDENCE";
  changeDetail: string;

  // Pillar 1: ClinvArbitration Logic
  arbitrationDetails?: {
    recencyWeightScore: number; // 0-100
    expertPanelCount: number;
    timeline: { date: string; classification: string; submitter: string; status: string }[];
    consensusScore: number; // 0-100
    conflictingLabs: string[];
  };

  // Pillar 2: VUS Prediction Model
  predictionModel?: {
    reclassificationRiskScore: number; // 0-100 (probability of upgrade within 2 years)
    findPredictor: "DELETERIOUS" | "BENIGN" | "NEUTRAL";
    findScore: number; // 0.0 - 1.0
    metaXvpScore: number; // 0.0 - 1.0
    revelScore: number; // 0.0 - 1.0
    caddScore: number; // 0 - 99
    alphaMissenseScore: number; // 0.0 - 1.0
  };

  // Pillar 3: FHIR Genomics Integration
  fhirResources?: {
    observationJson: string;
    sequenceJson: string;
    diagnosticReportJson: string;
  };

  // Pillar 4: ClinVar Submission Pipeline
  clinvarSubmission?: {
    prefilledXml: string;
    prefilledJson: string;
    readyForApi: boolean;
  };

  // Pillar 5: First Patient Impact & Recontact Action
  patientImpact?: {
    contactedCount: number;
    actionTaken: "GENETIC_COUNSELING_ORDERED" | "SURGERY_POSTPONED" | "CASCADE_TESTING_SCHEDULED" | "NONE_PENDING" | "THERAPY_UPDATED";
    preventedHarm: boolean;
    counselorFlagged: boolean;
    cascadeTestedRelatives: number;
  };

  // Pillar 6: Population-Specific Diversity Index
  populationDiversity?: {
    ancestralPopulation: string; // e.g. "African", "South Asian", "East Asian", "Indigenous"
    nonEuropeanVusRate: string; // e.g. "18.5%"
    europeanVusRate: string; // e.g. "15.0%"
    popEvidenceGapScore: number; // 0-100
    hazardRatio: number; // rate of reclassification vs European
  };
}

// Pre-seeded clinical sample sets
const SAMPLE_CLINICAL_VARIANTS: TrackedVariant[] = [
  {
    id: "var-001",
    gene: "MLH1",
    hgvs: "c.677G>A (p.Arg226Gln)",
    rsid: "rs63750847",
    source: "Clinical Lab Report (2022)",
    lastClassified: "Pathogenic",
    currentClassified: "VUS",
    reviewStars: 1,
    submittingLabs: 3,
    conflictStatus: true,
    confidenceLevel: "LOW",
    lastChecked: "2026-08-20",
    hasChanged: true,
    changeType: "DOWNGRADE",
    changeDetail: "Downgraded from Pathogenic to VUS due to new benign population cohort frequency data submitted by gnomAD (v4.0).",
    arbitrationDetails: {
      recencyWeightScore: 82,
      expertPanelCount: 0,
      timeline: [
        { date: "2022-03-10", classification: "Pathogenic", submitter: "GeneDx", status: "Criteria Provided" },
        { date: "2024-05-18", classification: "VUS", submitter: "Invitae", status: "Criteria Provided" },
        { date: "2026-02-14", classification: "VUS", submitter: "Sherloc (Aegis Lab)", status: "Reviewed" }
      ],
      consensusScore: 42,
      conflictingLabs: ["GeneDx (Pathogenic)", "Invitae (VUS)", "Aegis (VUS)"]
    },
    predictionModel: {
      reclassificationRiskScore: 12,
      findPredictor: "NEUTRAL",
      findScore: 0.22,
      metaXvpScore: 0.18,
      revelScore: 0.31,
      caddScore: 14,
      alphaMissenseScore: 0.25
    },
    fhirResources: {
      observationJson: `{
  "resourceType": "Observation",
  "id": "fhir-obs-var-001",
  "status": "final",
  "category": [
    {
      "coding": [
        {
          "system": "http://terminology.hl7.org/CodeSystem/observation-category",
          "code": "laboratory"
        }
      ]
    }
  ],
  "code": {
    "coding": [
      {
        "system": "http://loinc.org",
        "code": "69548-6",
        "display": "Genetic variant assessment"
      }
    ]
  },
  "subject": { "reference": "Patient/pat-009" },
  "effectiveDateTime": "2026-08-20T09:15:00Z",
  "valueCodeableConcept": {
    "coding": [
      {
        "system": "http://loinc.org",
        "code": "LA26333-7",
        "display": "Variant of Uncertain Significance (VUS)"
      }
    ]
  },
  "component": [
    {
      "code": {
        "coding": [
          {
            "system": "http://loinc.org",
            "code": "48018-6",
            "display": "Gene studied [ID]"
          }
        ]
      },
      "valueCodeableConcept": {
        "coding": [
          {
            "system": "http://www.genenames.org",
            "code": "HGNC:7127",
            "display": "MLH1"
          }
        ]
      }
    }
  ]
}`,
      sequenceJson: `{
  "resourceType": "MolecularSequence",
  "id": "fhir-seq-var-001",
  "type": "dna",
  "coordinateSystem": 1,
  "referenceSeq": {
    "chromosome": {
      "coding": [
        {
          "system": "http://unstats.un.org/unsd/methods/m49/m49.htm",
          "code": "001"
        }
      ]
    },
    "genomeBuild": "GRCh38",
    "referenceSeqId": {
      "coding": [
        {
          "system": "http://www.ncbi.nlm.nih.gov/nuccore",
          "code": "NC_000003.12"
        }
      ]
    }
  },
  "variant": [
    {
      "start": 36993427,
      "end": 36993428,
      "observedAllele": "A",
      "referenceAllele": "G"
    }
  ]
}`,
      diagnosticReportJson: `{
  "resourceType": "DiagnosticReport",
  "id": "fhir-report-var-001",
  "status": "corrected",
  "code": {
    "text": "Variant Reclassification Alert: MLH1 Pathogenic -> VUS"
  },
  "subject": { "reference": "Patient/pat-009" },
  "result": [
    { "reference": "Observation/fhir-obs-var-001" }
  ]
}`
    },
    clinvarSubmission: {
      prefilledXml: `<ClinVarSubmissionSet>
  <Submission>
    <AssertionType>variation to disease</AssertionType>
    <AttributeSet>
      <Attribute Type="HGVS">MLH1:c.677G>A</Attribute>
    </AttributeSet>
    <ClinicalSignificance>
      <ReviewStatus>criteria provided, single submitter</ReviewStatus>
      <Explanation>Reclassified as Variant of Uncertain Significance following local cohort re-analysis.</Explanation>
    </ClinicalSignificance>
  </Submission>
</ClinVarSubmissionSet>`,
      prefilledJson: `{
  "clinvar_submission": {
    "gene": "MLH1",
    "hgvs": "c.677G>A",
    "rsid": "rs63750847",
    "new_significance": "Variant of Uncertain Significance",
    "supporting_evidence": "Allele frequency exceeds thresholds for dominant disease in regional cohorts (gnomAD v4.0)."
  }
}`,
      readyForApi: true
    },
    patientImpact: {
      contactedCount: 12,
      actionTaken: "SURGERY_POSTPONED",
      preventedHarm: true,
      counselorFlagged: true,
      cascadeTestedRelatives: 3
    },
    populationDiversity: {
      ancestralPopulation: "South Asian (SAS)",
      nonEuropeanVusRate: "18.5%",
      europeanVusRate: "15.0%",
      popEvidenceGapScore: 78,
      hazardRatio: 1.34
    }
  },
  {
    id: "var-002",
    gene: "BRCA1",
    hgvs: "c.5266dupC (p.Gln1756ProfsTer6)",
    rsid: "rs80357906",
    source: "23andMe Raw Data Export",
    lastClassified: "VUS",
    currentClassified: "Likely Pathogenic",
    reviewStars: 4,
    submittingLabs: 14,
    conflictStatus: false,
    confidenceLevel: "HIGH",
    lastChecked: "2026-08-20",
    hasChanged: true,
    changeType: "UPGRADE",
    changeDetail: "Upgraded from VUS to Likely Pathogenic following multi-institutional clinical trial curation and functional assays.",
    arbitrationDetails: {
      recencyWeightScore: 98,
      expertPanelCount: 2,
      timeline: [
        { date: "2021-08-11", classification: "VUS", submitter: "EHR-Epic", status: "Criteria Provided" },
        { date: "2023-11-20", classification: "Likely Pathogenic", submitter: "Myriad Genetics", status: "Reviewed" },
        { date: "2026-04-12", classification: "Likely Pathogenic", submitter: "ENIGMA Consortium", status: "Practice Guideline" }
      ],
      consensusScore: 96,
      conflictingLabs: []
    },
    predictionModel: {
      reclassificationRiskScore: 94,
      findPredictor: "DELETERIOUS",
      findScore: 0.88,
      metaXvpScore: 0.94,
      revelScore: 0.89,
      caddScore: 32,
      alphaMissenseScore: 0.91
    },
    fhirResources: {
      observationJson: `{
  "resourceType": "Observation",
  "id": "fhir-obs-var-002",
  "status": "final",
  "code": {
    "coding": [
      {
        "system": "http://loinc.org",
        "code": "69548-6",
        "display": "Genetic variant assessment"
      }
    ]
  },
  "subject": { "reference": "Patient/pat-112" },
  "valueCodeableConcept": {
    "coding": [
      {
        "system": "http://loinc.org",
        "code": "LA26332-9",
        "display": "Likely Pathogenic"
      }
    ]
  }
}`,
      sequenceJson: `{
  "resourceType": "MolecularSequence",
  "id": "fhir-seq-var-002",
  "type": "dna",
  "coordinateSystem": 1,
  "referenceSeq": {
    "chromosome": { "coding": [{ "code": "17" }] },
    "genomeBuild": "GRCh38"
  },
  "variant": [
    {
      "start": 43044295,
      "end": 43044296,
      "observedAllele": "C",
      "referenceAllele": "-"
    }
  ]
}`,
      diagnosticReportJson: `{
  "resourceType": "DiagnosticReport",
  "id": "fhir-report-var-002",
  "status": "final",
  "code": { "text": "BRCA1 Upgrade Alert: Likely Pathogenic" }
}`
    },
    clinvarSubmission: {
      prefilledXml: `<ClinVarSubmissionSet>
  <Submission>
    <AttributeSet>
      <Attribute Type="HGVS">BRCA1:c.5266dupC</Attribute>
    </AttributeSet>
    <ClinicalSignificance>
      <ReviewStatus>practice guideline</ReviewStatus>
      <Explanation>Confirmed truncation and complete loss of function in biological assays.</Explanation>
    </ClinicalSignificance>
  </Submission>
</ClinVarSubmissionSet>`,
      prefilledJson: `{
  "clinvar_submission": {
    "gene": "BRCA1",
    "hgvs": "c.5266dupC",
    "new_significance": "Likely Pathogenic"
  }
}`,
      readyForApi: true
    },
    patientImpact: {
      contactedCount: 42,
      actionTaken: "CASCADE_TESTING_SCHEDULED",
      preventedHarm: false,
      counselorFlagged: true,
      cascadeTestedRelatives: 14
    },
    populationDiversity: {
      ancestralPopulation: "Ashkenazi Jewish / African",
      nonEuropeanVusRate: "22.1%",
      europeanVusRate: "15.0%",
      popEvidenceGapScore: 85,
      hazardRatio: 1.45
    }
  },
  {
    id: "var-003",
    gene: "TP53",
    hgvs: "c.818G>A (p.Arg273His)",
    rsid: "rs28934571",
    source: "Clinical Lab Report (2023)",
    lastClassified: "Pathogenic",
    currentClassified: "Pathogenic",
    reviewStars: 4,
    submittingLabs: 31,
    conflictStatus: false,
    confidenceLevel: "HIGH",
    lastChecked: "2026-08-20",
    hasChanged: false,
    changeType: "NO_CHANGE",
    changeDetail: "Stable pathogenic classification. Backed by multi-lab consensus and robust functional literature.",
    arbitrationDetails: {
      recencyWeightScore: 100,
      expertPanelCount: 5,
      timeline: [
        { date: "2015-02-04", classification: "Pathogenic", submitter: "IARC", status: "Practice Guideline" },
        { date: "2026-07-01", classification: "Pathogenic", submitter: "ClinGen", status: "Practice Guideline" }
      ],
      consensusScore: 100,
      conflictingLabs: []
    },
    predictionModel: {
      reclassificationRiskScore: 99,
      findPredictor: "DELETERIOUS",
      findScore: 0.98,
      metaXvpScore: 0.99,
      revelScore: 0.96,
      caddScore: 35,
      alphaMissenseScore: 0.97
    },
    patientImpact: {
      contactedCount: 154,
      actionTaken: "THERAPY_UPDATED",
      preventedHarm: true,
      counselorFlagged: true,
      cascadeTestedRelatives: 48
    },
    populationDiversity: {
      ancestralPopulation: "Global Consortium",
      nonEuropeanVusRate: "15.0%",
      europeanVusRate: "15.0%",
      popEvidenceGapScore: 12,
      hazardRatio: 1.00
    }
  },
  {
    id: "var-004",
    gene: "CHEK2",
    hgvs: "c.470T>C (p.Ile157Thr)",
    rsid: "rs17879961",
    source: "AncestryDNA Raw Export",
    lastClassified: "Likely Pathogenic",
    currentClassified: "VUS",
    reviewStars: 2,
    submittingLabs: 8,
    conflictStatus: true,
    confidenceLevel: "MODERATE",
    lastChecked: "2026-08-20",
    hasChanged: true,
    changeType: "DOWNGRADE",
    changeDetail: "Reclassified from Likely Pathogenic to VUS because of high allele frequencies in northern European populations.",
    arbitrationDetails: {
      recencyWeightScore: 78,
      expertPanelCount: 1,
      timeline: [
        { date: "2018-04-12", classification: "Likely Pathogenic", submitter: "GeneDx", status: "Criteria Provided" },
        { date: "2025-09-02", classification: "VUS", submitter: "Invitae", status: "Reviewed" }
      ],
      consensusScore: 54,
      conflictingLabs: ["Ambry (Likely Pathogenic)", "Invitae (VUS)", "Centogene (VUS)"]
    },
    predictionModel: {
      reclassificationRiskScore: 28,
      findPredictor: "NEUTRAL",
      findScore: 0.42,
      metaXvpScore: 0.35,
      revelScore: 0.41,
      caddScore: 18,
      alphaMissenseScore: 0.38
    },
    patientImpact: {
      contactedCount: 89,
      actionTaken: "SURGERY_POSTPONED",
      preventedHarm: true,
      counselorFlagged: true,
      cascadeTestedRelatives: 8
    },
    populationDiversity: {
      ancestralPopulation: "Northern European",
      nonEuropeanVusRate: "14.8%",
      europeanVusRate: "15.0%",
      popEvidenceGapScore: 22,
      hazardRatio: 0.95
    }
  },
  {
    id: "var-005",
    gene: "EGFR",
    hgvs: "c.2235_2249del15 (p.Glu746_Ala750del)",
    rsid: "rs121434254",
    source: "Clinical Lab Report (2024)",
    lastClassified: "Pathogenic",
    currentClassified: "Pathogenic",
    reviewStars: 3,
    submittingLabs: 19,
    conflictStatus: false,
    confidenceLevel: "HIGH",
    lastChecked: "2026-08-20",
    hasChanged: false,
    changeType: "NO_CHANGE",
    changeDetail: "Stable clinical driver mutation, highly validated therapeutic target for tyrosine kinase inhibitors.",
    arbitrationDetails: {
      recencyWeightScore: 100,
      expertPanelCount: 4,
      timeline: [
        { date: "2012-09-01", classification: "Pathogenic", submitter: "MSKCC", status: "Reviewed" },
        { date: "2026-01-10", classification: "Pathogenic", submitter: "ClinGen", status: "Practice Guideline" }
      ],
      consensusScore: 100,
      conflictingLabs: []
    },
    predictionModel: {
      reclassificationRiskScore: 98,
      findPredictor: "DELETERIOUS",
      findScore: 0.99,
      metaXvpScore: 0.98,
      revelScore: 0.97,
      caddScore: 42,
      alphaMissenseScore: 0.98
    },
    patientImpact: {
      contactedCount: 215,
      actionTaken: "THERAPY_UPDATED",
      preventedHarm: true,
      counselorFlagged: true,
      cascadeTestedRelatives: 12
    },
    populationDiversity: {
      ancestralPopulation: "East Asian (EAS)",
      nonEuropeanVusRate: "16.2%",
      europeanVusRate: "15.0%",
      popEvidenceGapScore: 34,
      hazardRatio: 1.12
    }
  }
];

const INITIAL_VARIANTS: TrackedVariant[] = [
  {
    id: "var-003",
    gene: "TP53",
    hgvs: "c.818G>A (p.Arg273His)",
    rsid: "rs28934571",
    source: "Clinical Lab Report (2023)",
    lastClassified: "Pathogenic",
    currentClassified: "Pathogenic",
    reviewStars: 4,
    submittingLabs: 31,
    conflictStatus: false,
    confidenceLevel: "HIGH",
    lastChecked: "2026-08-10",
    hasChanged: false,
    changeType: "NO_CHANGE",
    changeDetail: "Stable pathogenic classification. Backed by multi-lab consensus and robust functional literature.",
    arbitrationDetails: {
      recencyWeightScore: 100,
      expertPanelCount: 5,
      timeline: [
        { date: "2015-02-04", classification: "Pathogenic", submitter: "IARC", status: "Practice Guideline" },
        { date: "2026-07-01", classification: "Pathogenic", submitter: "ClinGen", status: "Practice Guideline" }
      ],
      consensusScore: 100,
      conflictingLabs: []
    },
    predictionModel: {
      reclassificationRiskScore: 99,
      findPredictor: "DELETERIOUS",
      findScore: 0.98,
      metaXvpScore: 0.99,
      revelScore: 0.96,
      caddScore: 35,
      alphaMissenseScore: 0.97
    },
    patientImpact: {
      contactedCount: 154,
      actionTaken: "THERAPY_UPDATED",
      preventedHarm: true,
      counselorFlagged: true,
      cascadeTestedRelatives: 48
    },
    populationDiversity: {
      ancestralPopulation: "Global Consortium",
      nonEuropeanVusRate: "15.0%",
      europeanVusRate: "15.0%",
      popEvidenceGapScore: 12,
      hazardRatio: 1.00
    }
  },
  {
    id: "var-005",
    gene: "EGFR",
    hgvs: "c.2235_2249del15 (p.Glu746_Ala750del)",
    rsid: "rs121434254",
    source: "Clinical Lab Report (2024)",
    lastClassified: "Pathogenic",
    currentClassified: "Pathogenic",
    reviewStars: 3,
    submittingLabs: 19,
    conflictStatus: false,
    confidenceLevel: "HIGH",
    lastChecked: "2026-08-10",
    hasChanged: false,
    changeType: "NO_CHANGE",
    changeDetail: "Stable clinical driver mutation, highly validated therapeutic target for tyrosine kinase inhibitors.",
    arbitrationDetails: {
      recencyWeightScore: 100,
      expertPanelCount: 4,
      timeline: [
        { date: "2012-09-01", classification: "Pathogenic", submitter: "MSKCC", status: "Reviewed" },
        { date: "2026-01-10", classification: "Pathogenic", submitter: "ClinGen", status: "Practice Guideline" }
      ],
      consensusScore: 100,
      conflictingLabs: []
    },
    predictionModel: {
      reclassificationRiskScore: 98,
      findPredictor: "DELETERIOUS",
      findScore: 0.99,
      metaXvpScore: 0.98,
      revelScore: 0.97,
      caddScore: 42,
      alphaMissenseScore: 0.98
    },
    patientImpact: {
      contactedCount: 215,
      actionTaken: "THERAPY_UPDATED",
      preventedHarm: true,
      counselorFlagged: true,
      cascadeTestedRelatives: 12
    },
    populationDiversity: {
      ancestralPopulation: "East Asian (EAS)",
      nonEuropeanVusRate: "16.2%",
      europeanVusRate: "15.0%",
      popEvidenceGapScore: 34,
      hazardRatio: 1.12
    }
  }
];

// Dynamic enrichment of any variant to fuel the Six Pillars of Clinical Knowledge
function getEnrichedDossier(v: TrackedVariant) {
  // Safe defaults if fields are missing
  const arb = v.arbitrationDetails || {
    consensusScore: v.conflictStatus ? 68 : 94,
    recencyWeightScore: 88,
    expertPanelCount: v.reviewStars >= 3 ? 2 : 1,
    conflictingLabs: v.conflictStatus ? ["Invitae", "Ambry Genetics"] : [],
    timeline: [
      { date: "2026-04-12", submitter: "ClinGen Expert Panel", classification: v.currentClassified, status: "Review Complete" },
      { date: "2025-09-08", submitter: "Invitae", classification: v.currentClassified, status: "Inferred" },
      { date: "2024-01-15", submitter: "University of Washington", classification: v.lastClassified, status: "Submitted" }
    ]
  };

  const pred = v.predictionModel || {
    reclassificationRiskScore: v.currentClassified === "VUS" ? 78 : 12,
    findPredictor: v.currentClassified === "VUS" ? "DELETERIOUS" : "NEUTRAL",
    findScore: v.currentClassified === "VUS" ? "0.89/1.0" : "0.14/1.0",
    metaXvpScore: v.currentClassified === "VUS" ? "0.91 (High Risk)" : "0.08 (Low Risk)",
    revelScore: "0.84",
    caddScore: "28.4",
    alphaMissenseScore: "0.875"
  };

  const pat = v.patientImpact || {
    contactedCount: v.currentClassified === "Pathogenic" || v.currentClassified === "Likely Pathogenic" ? 145 : 42,
    actionTaken: v.changeType === "UPGRADE" ? "SURVEILLANCE_ENHANCED" : v.changeType === "DOWNGRADE" ? "THERAPY_UPDATED" : "RECORD_AUDITED",
    preventedHarm: true,
    counselorFlagged: true,
    cascadeTestedRelatives: v.changeType === "UPGRADE" ? 18 : 3
  };

  const pop = v.populationDiversity || {
    ancestralPopulation: "African / African American (AFR)",
    nonEuropeanVusRate: "18.4%",
    europeanVusRate: "12.1%",
    popEvidenceGapScore: 72,
    hazardRatio: 1.45
  };

  // Dynamic FHIR resource generation based on the actual variant selected
  const observationJson = `{
  "resourceType": "Observation",
  "id": "obs-genetics-${v.id}",
  "status": "final",
  "category": [
    {
      "coding": [
        {
          "system": "http://terminology.hl7.org/CodeSystem/observation-category",
          "code": "laboratory",
          "display": "Laboratory"
        }
      ]
    }
  ],
  "code": {
    "coding": [
      {
        "system": "http://loinc.org",
        "code": "69548-6",
        "display": "Genetic variant assessment"
      }
    ]
  },
  "subject": {
    "reference": "Patient/pat-003891",
    "display": "VariantWatch Surveillance Cohort"
  },
  "effectiveDateTime": "${new Date().toISOString()}",
  "issued": "${new Date().toISOString()}",
  "performer": [
    {
      "reference": "Organization/lab-diagnostics",
      "display": "Clinical Molecular Interpretation Laboratory"
    }
  ],
  "valueCodeableConcept": {
    "coding": [
      {
        "system": "http://loinc.org",
        "code": "${v.currentClassified === "Pathogenic" ? "LA6668-3" : v.currentClassified === "Likely Pathogenic" ? "LA26332-9" : "LA26333-7"}",
        "display": "${v.currentClassified}"
      }
    ]
  },
  "component": [
    {
      "code": {
        "coding": [
          {
            "system": "http://loinc.org",
            "code": "48018-6",
            "display": "Gene studied"
          }
        ]
      },
      "valueCodeableConcept": {
        "coding": [
          {
            "system": "http://www.genenames.org",
            "code": "${v.gene}",
            "display": "${v.gene}"
          }
        ]
      }
    },
    {
      "code": {
        "coding": [
          {
            "system": "http://loinc.org",
            "code": "48004-6",
            "display": "DNA change (HGVS)"
          }
        ]
      },
      "valueString": "${v.hgvs}"
    }
  ]
}`;

  const sequenceJson = `{
  "resourceType": "MolecularSequence",
  "id": "seq-${v.id}",
  "patient": {
    "reference": "Patient/pat-003891"
  },
  "coordinateSystem": 1,
  "type": "dna",
  "referenceSeq": {
    "chromosome": {
      "coding": [
        {
          "system": "http://hl7.org/fhir/ValueSet/chromosome-human",
          "code": "17",
          "display": "Chromosome 17"
        }
      ]
    },
    "genomeBuild": "GRCh38"
  },
  "variant": [
    {
      "start": 43044295,
      "end": 43044296,
      "observedAllele": "A",
      "referenceAllele": "G",
      "outer": {
        "reference": "http://www.ncbi.nlm.nih.gov/projects/SNP",
        "id": "${v.rsid}"
      }
    }
  ]
}`;

  const diagnosticReportJson = `{
  "resourceType": "DiagnosticReport",
  "id": "rep-${v.id}",
  "status": "final",
  "code": {
    "coding": [
      {
        "system": "http://loinc.org",
        "code": "51969-4",
        "display": "Genetic analysis overall findings"
      }
    ]
  },
  "subject": {
    "reference": "Patient/pat-003891"
  },
  "issued": "${new Date().toISOString()}",
  "performer": [
    {
      "reference": "Practitioner/director-01"
    }
  ],
  "result": [
    {
      "reference": "Observation/obs-genetics-${v.id}"
    }
  ],
  "conclusion": "Continuous Surveillance Alert: Interpretive status shifted from ${v.lastClassified} to ${v.currentClassified} based on ${v.submittingLabs} submissions."
}`;

  // ClinVar Submission API payload
  const prefilledXml = `<ClinVarSubmissionSet id="SUB-${v.id}">
  <ClinVarSubmission localID="vw-${v.id}" submissionDate="${new Date().toISOString().split("T")[0]}">
    <RecordStatus>ClinVar Consensus Resolution</RecordStatus>
    <SimpleAllele>
      <GeneSymbol>${v.gene}</GeneSymbol>
      <HGVS>${v.hgvs}</HGVS>
      <dbSNP>${v.rsid}</dbSNP>
    </SimpleAllele>
    <ClinicalSignificance>
      <ReviewStatus>criteria provided, single submitter</ReviewStatus>
      <Description>${v.currentClassified}</Description>
      <Explanation>${v.changeDetail}</Explanation>
    </ClinicalSignificance>
  </ClinVarSubmission>
</ClinVarSubmissionSet>`;

  const prefilledJson = `{
  "submissionName": "VW_CONFLICT_RESOLUTION_${v.gene}",
  "submissionDate": "${new Date().toISOString().split("T")[0]}",
  "submitter": {
    "organization": "VariantWatch Consortium",
    "contact": "surveillance@variantwatch.org"
  },
  "assertions": [
    {
      "localID": "vw-${v.id}",
      "gene": "${v.gene}",
      "hgvs": "${v.hgvs}",
      "previousInterpretation": "${v.lastClassified}",
      "currentInterpretation": "${v.currentClassified}",
      "expertConfidenceScore": ${arb.consensusScore},
      "clinicalEvidenceNotes": "${v.changeDetail}"
    }
  ]
}`;

  return {
    arb,
    pred,
    fhir: {
      observationJson,
      sequenceJson,
      diagnosticReportJson
    },
    clinvarSub: {
      prefilledXml,
      prefilledJson
    },
    pat,
    pop
  };
}

export function VariantWatch() {
  const [activeAppView, setActiveAppView] = useState<"DASHBOARD" | "AUTOMATION_PIPELINE">("DASHBOARD");
  const [trackedVariants, setTrackedVariants] = useState<TrackedVariant[]>(INITIAL_VARIANTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"ALL" | "CHANGES" | "HIGH" | "LOW">("ALL");
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "variantwatch-cli v1.0.0 initializing...",
    "Local SQLite database detected at 'variantwatch.db' [2 variants loaded]",
    "Type 'variantwatch --help' or click an action below to command clinical surveillance."
  ]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncDone, setSyncDone] = useState(false);

  // Manual input state
  const [newGene, setNewGene] = useState("");
  const [newHgvs, setNewHgvs] = useState("");
  const [newRsid, setNewRsid] = useState("");
  const [newSource, setNewSource] = useState("Manual Entry");
  const [newClass, setNewClass] = useState<"Pathogenic" | "Likely Pathogenic" | "VUS" | "Likely Benign" | "Benign">("VUS");
  const [newStars, setNewStars] = useState(1);
  const [newSubmittingLabs, setNewSubmittingLabs] = useState(2);
  const [newConflict, setNewConflict] = useState(false);

  // Lab Report Info
  const [labName, setLabName] = useState("Transplant & Oncology Molecular Diagnostics Lab");
  const [directorName, setDirectorName] = useState("Dr. Sarah Vance, FACMG");
  const [reportNotes, setReportNotes] = useState("Continuous variant surveillance performed via automated ClinVar API integration. Reclassification triggers require patient record audit.");

  // Enhancement States
  const [addMode, setAddMode] = useState<"SINGLE" | "BULK">("SINGLE");
  const [pastedVariantsInput, setPastedVariantsInput] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [highlightedVariantId, setHighlightedVariantId] = useState<string | null>(null);
  const [focusedClassificationCategory, setFocusedClassificationCategory] = useState<string | null>(null);
  const [selectedRecontactVariantId, setSelectedRecontactVariantId] = useState<string>("");
  const [recontactLetterType, setRecontactLetterType] = useState<"PATIENT" | "PHYSICIAN" | "AUDIT">("PATIENT");
  const [copiedRecontactSuccess, setCopiedRecontactSuccess] = useState(false);
  const [customPatientName, setCustomPatientName] = useState("Eleanor Vance");
  const [customPhysicianName, setCustomPhysicianName] = useState("Dr. Marcus Brody, MD");

  // Advanced Six Pillars States
  const [activeDossierTab, setActiveDossierTab] = useState<"ARBITRATION" | "ML_PREDICTION" | "FHIR" | "SUBMISSION" | "PATIENT_ACTION" | "POP_DIVERSITY" | "AI_CONSULT">("ARBITRATION");
  const [activeFhirTab, setActiveFhirTab] = useState<"OBS" | "SEQ" | "REP">("OBS");
  const [submissionSimulated, setSubmissionSimulated] = useState(false);
  const [copiedDossierRaw, setCopiedDossierRaw] = useState(false);
  const [dossierChecklist, setDossierChecklist] = useState<Record<string, boolean>>({
    audit: false,
    counseling: false,
    cascade: false,
    pathology: false
  });

  // AI Co-Pilot State Variables
  const [aiQuestion, setAiQuestion] = useState("Synthesize molecular pathogenesis, ACMG criteria shifts, and clinical recommendations for this variant.");
  const [aiConsultResult, setAiConsultResult] = useState<string | null>(null);
  const [isConsultLoading, setIsConsultLoading] = useState(false);
  const [aiConsultMode, setAiConsultMode] = useState<"LIVE" | "OFFLINE" | null>(null);

  // Stored refined/custom letters state
  const [customLetters, setCustomLetters] = useState<Record<string, string>>({});
  const [isLetterEnhancing, setIsLetterEnhancing] = useState(false);

  // Generate confidence badge helper
  const calculateConfidence = (stars: number, labs: number, conflict: boolean): "HIGH" | "MODERATE" | "LOW" => {
    if (conflict) return "LOW";
    if (stars >= 3 && labs >= 10) return "HIGH";
    if (stars >= 2 || labs >= 5) return "MODERATE";
    return "LOW";
  };

  // Add Terminal Log Line
  const addLog = (line: string) => {
    setTerminalLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${line}`]);
  };

  useEffect(() => {
    setAiConsultResult(null);
    setAiConsultMode(null);
  }, [selectedRecontactVariantId]);

  // Action: Import 23andMe Genotype raw data
  const handleImportDTCData = () => {
    addLog("variantwatch import --source=23andme --file=genome_raw_data.txt");
    addLog("Analyzing genotype coordinates for known ClinVar identifiers...");
    
    // Check if BRCA1 & CHEK2 are already added
    const hasBrca = trackedVariants.some(v => v.gene === "BRCA1");
    if (hasBrca) {
      addLog("DTC data already imported or duplicate coordinates ignored.");
      return;
    }

    const brca = SAMPLE_CLINICAL_VARIANTS.find(v => v.gene === "BRCA1")!;
    const chek2 = SAMPLE_CLINICAL_VARIANTS.find(v => v.gene === "CHEK2")!;

    // Initial state: imported with last known classifications
    const brcaImported: TrackedVariant = {
      ...brca,
      currentClassified: "VUS", // starts as VUS as reported in 2022 raw data
      hasChanged: false,
      changeType: "NO_CHANGE"
    };

    const chek2Imported: TrackedVariant = {
      ...chek2,
      currentClassified: "Likely Pathogenic", // starts as Likely Pathogenic
      hasChanged: false,
      changeType: "NO_CHANGE"
    };

    setTrackedVariants((prev) => [...prev, brcaImported, chek2Imported]);
    addLog("✓ Successfully loaded 2 coordinates from 23andMe.");
    addLog("SQLite updated: added BRCA1 c.5266dupC (rs80357906) & CHEK2 c.470T>C (rs17879961).");
    setSyncDone(false);
  };

  // Action: Import clinical report
  const handleImportClinical = () => {
    addLog("variantwatch import --source=clinical --file=lab_pathology_2022.txt");
    addLog("Parsing clinical genetic mutations file...");

    const hasMlh1 = trackedVariants.some(v => v.gene === "MLH1");
    if (hasMlh1) {
      addLog("Clinical mutations are already registered in database.");
      return;
    }

    const mlh1 = SAMPLE_CLINICAL_VARIANTS.find(v => v.gene === "MLH1")!;
    
    const mlh1Imported: TrackedVariant = {
      ...mlh1,
      currentClassified: "Pathogenic", // starts as pathogenic
      hasChanged: false,
      changeType: "NO_CHANGE"
    };

    setTrackedVariants((prev) => [...prev, mlh1Imported]);
    addLog("✓ Successfully loaded MLH1 c.677G>A (rs63750847) into tracking registry.");
    setSyncDone(false);
  };

  // Action: Run ClinVar Check (automated surveillance check)
  const handleVariantCheck = () => {
    if (isSyncing) return;
    setIsSyncing(true);
    addLog("variantwatch check --db=variantwatch.db");
    addLog("Connecting to public NCBI E-utilities ClinVar API (retmode=json)...");
    
    let step = 0;
    const interval = setInterval(() => {
      if (step === 0) {
        addLog(`Querying current statuses for ${trackedVariants.length} registered variants...`);
      } else if (step === 1) {
        // Find if we have imported MLH1, BRCA1, or CHEK2, and apply their true updated status
        setTrackedVariants((prev) => 
          prev.map((v) => {
            const match = SAMPLE_CLINICAL_VARIANTS.find(s => s.id === v.id);
            if (match && match.hasChanged) {
              return {
                ...v,
                currentClassified: match.currentClassified,
                hasChanged: true,
                changeType: match.changeType,
                changeDetail: match.changeDetail,
                reviewStars: match.reviewStars,
                submittingLabs: match.submittingLabs,
                conflictStatus: match.conflictStatus,
                confidenceLevel: calculateConfidence(match.reviewStars, match.submittingLabs, match.conflictStatus),
                lastChecked: new Date().toISOString().split("T")[0]
              };
            }
            return {
              ...v,
              lastChecked: new Date().toISOString().split("T")[0]
            };
          })
        );
        addLog("Comparing old vs. new classification schemas inside SQLite comparisons...");
      } else if (step === 2) {
        // Count how many changed
        const changes = trackedVariants.filter(v => {
          const match = SAMPLE_CLINICAL_VARIANTS.find(s => s.id === v.id);
          return match && match.hasChanged;
        }).length;

        if (changes > 0) {
          addLog(`[WARN] Reclassification identified in ${changes} variant(s)!`);
          addLog("  • MLH1 c.677G>A: Pathogenic ➔ VUS (DOWNGRADE - CRITICAL PATIENT SAFETY RISK)");
          addLog("  • BRCA1 c.5266dupC: VUS ➔ Likely Pathogenic (UPGRADE - MISSED DIAGNOSIS ALERT)");
          addLog("  • CHEK2 c.470T>C: Likely Pathogenic ➔ VUS (DOWNGRADE - REDUCE SURGICAL URGENCIES)");
        } else {
          addLog("✓ Zero classification changes detected across tracked cohort.");
        }
        addLog("Database transaction completed. Tracking logs synchronized.");
        setIsSyncing(false);
        setSyncDone(true);
        clearInterval(interval);
      }
      step++;
    }, 900);
  };

  // Action: Add variant manually
  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGene || !newHgvs) return;

    const conf = calculateConfidence(newStars, newSubmittingLabs, newConflict);
    const customVar: TrackedVariant = {
      id: `manual-${Date.now()}`,
      gene: newGene.toUpperCase(),
      hgvs: newHgvs,
      rsid: newRsid || "N/A",
      source: newSource,
      lastClassified: newClass,
      currentClassified: newClass,
      reviewStars: newStars,
      submittingLabs: newSubmittingLabs,
      conflictStatus: newConflict,
      confidenceLevel: conf,
      lastChecked: new Date().toISOString().split("T")[0],
      hasChanged: false,
      changeType: "NO_CHANGE",
      changeDetail: "Manually registered and validated."
    };

    setTrackedVariants((prev) => [customVar, ...prev]);
    addLog(`Manual entry added: ${customVar.gene} ${customVar.hgvs}`);
    
    // Clear form
    setNewGene("");
    setNewHgvs("");
    setNewRsid("");
  };

  // Action: Parse pasted sandbox coordinate records
  const handleSandboxPasteParse = (textToParse: string) => {
    if (!textToParse.trim()) return;
    addLog("Analyzing payload for genomic coordinates...");
    
    const lines = textToParse.split("\n");
    let count = 0;
    const newVars: TrackedVariant[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("//")) return;

      // split by tab, comma, or spaces
      const parts = trimmed.split(/[\s,;\t]+/);
      if (parts.length >= 2) {
        let geneVal = "";
        let hgvsVal = "";
        let rsidVal = "N/A";
        let classVal: "Pathogenic" | "Likely Pathogenic" | "VUS" | "Likely Benign" | "Benign" = "VUS";

        parts.forEach((part) => {
          const pt = part.trim();
          if (/^[A-Z0-9]{2,10}$/.test(pt)) {
            geneVal = pt;
          } else if (/^(c\.|p\.|g\.)/.test(pt)) {
            hgvsVal = pt;
          } else if (/^rs\d+$/.test(pt)) {
            rsidVal = pt;
          } else if (/^(Pathogenic|VUS|Benign|Likely|Likely_Pathogenic|Likely_Benign)$/i.test(pt)) {
            const raw = pt.toLowerCase().replace("_", " ");
            if (raw.includes("pathogenic") && raw.includes("likely")) {
              classVal = "Likely Pathogenic";
            } else if (raw.includes("pathogenic")) {
              classVal = "Pathogenic";
            } else if (raw.includes("benign") && raw.includes("likely")) {
              classVal = "Likely Benign";
            } else if (raw.includes("benign")) {
              classVal = "Benign";
            } else {
              classVal = "VUS";
            }
          }
        });

        if (geneVal && hgvsVal) {
          const id = `sandbox-${Date.now()}-${count}`;
          newVars.push({
            id,
            gene: geneVal.toUpperCase(),
            hgvs: hgvsVal,
            rsid: rsidVal,
            source: "Sandbox DTC Upload",
            lastClassified: classVal,
            currentClassified: classVal,
            reviewStars: 2,
            submittingLabs: 6,
            conflictStatus: false,
            confidenceLevel: "MODERATE",
            lastChecked: new Date().toISOString().split("T")[0],
            hasChanged: false,
            changeType: "NO_CHANGE",
            changeDetail: "Pasted and loaded into watch.db registry."
          });
          count++;
        }
      }
    });

    if (newVars.length > 0) {
      setTrackedVariants((prev) => [...newVars, ...prev]);
      addLog(`✓ Parsed and loaded ${newVars.length} new coordinates into SQLite registry.`);
      setPastedVariantsInput("");
    } else {
      addLog("⚠️ Parsing failed. No rows matched 'GENE nomenclature' format (e.g., 'BRCA2 c.3847_3848delGT').");
    }
  };

  // Sync selected recontact variant
  useEffect(() => {
    const changed = trackedVariants.find(v => v.hasChanged);
    if (changed && !selectedRecontactVariantId) {
      setSelectedRecontactVariantId(changed.id);
    } else if (trackedVariants.length > 0 && !selectedRecontactVariantId) {
      setSelectedRecontactVariantId(trackedVariants[0].id);
    }
  }, [trackedVariants]);

  // Action: Delete variant
  const handleDeleteVariant = (id: string, gene: string, hgvs: string) => {
    setTrackedVariants((prev) => prev.filter(v => v.id !== id));
    addLog(`Deleted variant ${gene} ${hgvs} from SQLite registry.`);
  };

  // Generate Report TXT Content
  const getReportText = (): string => {
    const changes = trackedVariants.filter(v => v.hasChanged);
    let txt = `========================================================================\n`;
    txt += `              CLINICAL CLINVAR RECLASSIFICATION COMPLIANCE REPORT      \n`;
    txt += `========================================================================\n\n`;
    txt += `Laboratory Name : ${labName}\n`;
    txt += `Lab Director    : ${directorName}\n`;
    txt += `Date Generated  : ${new Date().toISOString().split("T")[0]}\n`;
    txt += `ACMG Policy Code: ACMG-Surveillance-CFR21\n\n`;
    txt += `------------------------------------------------------------------------\n`;
    txt += `Executive Summary:\n`;
    txt += `------------------------------------------------------------------------\n`;
    txt += `Total Tracked Variants: ${trackedVariants.length}\n`;
    txt += `Total Reclassified Variants Detected: ${changes.length}\n`;
    txt += `Critical Safety Notifications: ${changes.filter(c => c.changeType === "DOWNGRADE").length} (Downgrades)\n`;
    txt += `Missed Diagnosis Alerts: ${changes.filter(c => c.changeType === "UPGRADE").length} (Upgrades)\n\n`;
    txt += `Notes: ${reportNotes}\n\n`;

    txt += `------------------------------------------------------------------------\n`;
    txt += `Surveillance Alerts & Recontact Registry:\n`;
    txt += `------------------------------------------------------------------------\n`;
    
    if (changes.length === 0) {
      txt += `No variant reclassifications detected. All local interpretations remain compliant.\n`;
    } else {
      changes.forEach((c, idx) => {
        txt += `${idx + 1}. [${c.changeType}] Gene: ${c.gene} | HGVS: ${c.hgvs}\n`;
        txt += `   rsID: ${c.rsid} | Source: ${c.source}\n`;
        txt += `   Pre-Reclassification : ${c.lastClassified}\n`;
        txt += `   Post-Reclassification: ${c.currentClassified}\n`;
        txt += `   Review Star Rating   : ${"★".repeat(c.reviewStars)}${"☆".repeat(4 - c.reviewStars)} (${c.reviewStars} Stars, ${c.submittingLabs} submissions)\n`;
        txt += `   Conflict Status      : ${c.conflictStatus ? "CONFLICT DETECTED" : "CONSENSUS"}\n`;
        txt += `   Confidence Level     : ${c.confidenceLevel}\n`;
        txt += `   Rationale            : ${c.changeDetail}\n`;
        if (c.changeType === "DOWNGRADE") {
          txt += `   ACTION RECOMMENDED   : AUDIT PATIENT RE-CONTACT MATRIX. Contact patients who received prophylactic treatment suggestions or active surveillance based on the prior Pathogenic rating.\n`;
        } else if (c.changeType === "UPGRADE") {
          txt += `   ACTION RECOMMENDED   : RE-SCREEN COHORT FOR MISSED DIAGNOSIS. Reach out to patients reported with VUS to update their clinical management strategy.\n`;
        }
        txt += `\n`;
      });
    }

    txt += `------------------------------------------------------------------------\n`;
    txt += `Full Database Audit Trail (SQLite Tracked State):\n`;
    txt += `------------------------------------------------------------------------\n`;
    trackedVariants.forEach((v) => {
      txt += `• ${v.gene} ${v.hgvs} (Source: ${v.source}) | Current: ${v.currentClassified} | Confidence: ${v.confidenceLevel} | Last Checked: ${v.lastChecked}\n`;
    });

    txt += `\n========================================================================\n`;
    txt += `                        END OF LAB SURVEILLANCE REPORT                  \n`;
    txt += `========================================================================\n`;
    return txt;
  };

  // Download Report
  const handleDownloadReport = () => {
    const text = getReportText();
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `variantwatch_compliance_report_${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog("Exported Lab Surveillance and Patient Recontact Compliance Report.");
  };

  // Filter lists
  const filteredVariants = trackedVariants.filter((v) => {
    const matchesSearch = 
      v.gene.toLowerCase().includes(searchQuery.toLowerCase()) || 
      v.hgvs.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.rsid.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeFilter === "CHANGES") return v.hasChanged;
    if (activeFilter === "HIGH") return v.confidenceLevel === "HIGH";
    if (activeFilter === "LOW") return v.confidenceLevel === "LOW";
    return true;
  });

  const changedVariants = trackedVariants.filter(v => v.hasChanged);

  return (
    <div className="flex flex-col gap-6 text-[#FAFAFA]">
      
      {/* SECTION EXPLANATORY INTRO CARD */}
      <div className="bg-[#18181B] border border-[#F59E0B]/30 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative">
        <div className="flex flex-col gap-2 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase">
              ACMG / AMP VARIANT SURVEILLANCE POLICY
            </span>
            <span className="text-xs text-[#71717A] font-mono">STANDALONE CLINICAL UTILITY</span>
          </div>
          <h3 className="text-lg font-bold text-[#FAFAFA]">VariantWatch: ClinVar Reclassification Tracker</h3>
          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            Clinical variant interpretations change continuously—over <strong className="text-white">30% over 5 years</strong>, yet genetic records remain frozen. VariantWatch mimics a secure local-first CLI that tracks your patient variant registry against ClinVar E-utilities APIs, generating automated safety alerts, confidence badges, and patient recontact directives.
          </p>
        </div>

        <div className="flex flex-col gap-2 font-mono text-[10px] bg-[#09090B] border border-[#27272A] p-4 rounded-xl min-w-[220px]">
          <div className="flex justify-between">
            <span className="text-[#71717A]">SQLite Core:</span>
            <span className="text-[#10B981] font-bold">Enabled</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#71717A]">API Engine:</span>
            <span className="text-[#22D3EE] font-bold">NCBI E-utilities</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#71717A]">Privacy Level:</span>
            <span className="text-[#F59E0B] font-bold">Local-First (No-Upload)</span>
          </div>
        </div>
      </div>

      {/* APP VIEW TOGGLE BUTTONS */}
      <div className="flex border-b border-[#27272A] pb-0.5">
        <button
          onClick={() => setActiveAppView("DASHBOARD")}
          className={`px-5 py-3 text-xs font-mono font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeAppView === "DASHBOARD"
              ? "border-[#F59E0B] text-[#F59E0B]"
              : "border-transparent text-[#71717A] hover:text-[#A1A1AA]"
          }`}
        >
          <Dna className="w-3.5 h-3.5" /> Clinical Surveillance & Recontact Board
        </button>
        <button
          onClick={() => setActiveAppView("AUTOMATION_PIPELINE")}
          className={`px-5 py-3 text-xs font-mono font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeAppView === "AUTOMATION_PIPELINE"
              ? "border-[#22D3EE] text-[#22D3EE]"
              : "border-transparent text-[#71717A] hover:text-[#A1A1AA]"
          }`}
        >
          <GitMerge className="w-3.5 h-3.5" /> 6-Layer Automation Pipeline Hub
        </button>
      </div>

      {activeAppView === "DASHBOARD" ? (
        <>
          {/* THREE HIGH-CONTRAST METRICS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-[#18181B] border border-[#27272A] p-5 rounded-2xl flex flex-col gap-2">
          <div className="flex justify-between items-center text-[#71717A]">
            <span className="text-xs font-mono font-bold uppercase">SQLite Surveillance State</span>
            <Database className="w-4 h-4 text-[#22D3EE]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#FAFAFA] font-mono">{trackedVariants.length}</span>
            <span className="text-[11px] text-[#A1A1AA]">Variants Registered</span>
          </div>
          <span className="text-[10px] text-[#71717A] font-mono">
            Last query session: {trackedVariants[0]?.lastChecked || "Never"}
          </span>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#18181B] border border-[#27272A] p-5 rounded-2xl flex flex-col gap-2">
          <div className="flex justify-between items-center text-[#71717A]">
            <span className="text-xs font-mono font-bold uppercase">Reclassifications Detected</span>
            <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#F59E0B] font-mono">{changedVariants.length}</span>
            <span className="text-[11px] text-[#A1A1AA]">Altered Statuses</span>
          </div>
          <div className="flex gap-2 text-[10px] font-mono">
            <span className="text-[#EF4444] font-bold">
              {changedVariants.filter(v => v.changeType === "DOWNGRADE").length} Downgrades
            </span>
            <span className="text-[#10B981] font-bold">
              {changedVariants.filter(v => v.changeType === "UPGRADE").length} Upgrades
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#18181B] border border-[#27272A] p-5 rounded-2xl flex flex-col gap-2">
          <div className="flex justify-between items-center text-[#71717A]">
            <span className="text-xs font-mono font-bold uppercase">Evidence Reliability</span>
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#10B981] font-mono">
              {Math.round((trackedVariants.filter(v => v.confidenceLevel === "HIGH").length / (trackedVariants.length || 1)) * 100)}%
            </span>
            <span className="text-[11px] text-[#A1A1AA]">High-Confidence Ratio</span>
          </div>
          <span className="text-[10px] text-[#71717A] font-mono">
            Flags: {trackedVariants.filter(v => v.conflictStatus).length} evidence conflicts registered
          </span>
        </div>

      </div>

      {/* RECLASSIFICATION DRIFT PATHWAY FLOWS */}
      <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#F59E0B]" />
            <div>
              <h4 className="text-sm font-bold text-white">Cohort Reclassification Drift Pathways</h4>
              <p className="text-[11px] text-[#A1A1AA]">
                Interactive flow mapping of baseline database interpretations (left) to current ClinVar consensus statuses (right).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-[#71717A]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#10B981]" /> Upgrade</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#EF4444]" /> Downgrade</span>
            <span className="text-[#A1A1AA]">Hover paths to audit drift corridors</span>
          </div>
        </div>

        <div className="relative w-full overflow-hidden bg-[#09090B] rounded-xl border border-[#27272A] p-4">
          {/* Interactive SVG Workspace */}
          <svg viewBox="0 0 800 300" className="w-full h-auto select-none" style={{ minHeight: "260px" }}>
            <defs>
              {["Pathogenic", "Likely Pathogenic", "VUS", "Likely Benign", "Benign"].map((cat) => (
                <linearGradient key={cat} id={`grad-${cat.replace(" ", "-")}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={cat === "Pathogenic" ? "#EF4444" : cat === "Likely Pathogenic" ? "#F59E0B" : cat === "VUS" ? "#3B82F6" : cat === "Likely Benign" ? "#10B981" : "#6B7280"} stopOpacity="0.4" />
                  <stop offset="100%" stopColor={cat === "Pathogenic" ? "#EF4444" : cat === "Likely Pathogenic" ? "#F59E0B" : cat === "VUS" ? "#3B82F6" : cat === "Likely Benign" ? "#10B981" : "#6B7280"} stopOpacity="0.1" />
                </linearGradient>
              ))}
              <linearGradient id="drift-upgrade" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="drift-downgrade" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#EF4444" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#EF4444" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="drift-stable" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#27272A" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#27272A" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {/* SVG Flow Connections */}
            <g>
              {trackedVariants.map((v, idx) => {
                const cats = ["Pathogenic", "Likely Pathogenic", "VUS", "Likely Benign", "Benign"];
                const fromIdx = cats.indexOf(v.lastClassified);
                const toIdx = cats.indexOf(v.currentClassified);
                if (fromIdx === -1 || toIdx === -1) return null;

                // Spread out the lines slightly to avoid overlay
                const offsetMultiplier = (idx - (trackedVariants.length / 2)) * 3.5;
                const y1 = 40 + fromIdx * 54 + offsetMultiplier;
                const y2 = 40 + toIdx * 54 + offsetMultiplier;
                const x1 = 180;
                const x2 = 620;

                const pathD = `M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`;

                const isHighlighted = highlightedVariantId === v.id;
                const isDimmed = 
                  (highlightedVariantId !== null && !isHighlighted) ||
                  (focusedClassificationCategory !== null && 
                    v.lastClassified !== focusedClassificationCategory && 
                    v.currentClassified !== focusedClassificationCategory);

                let strokeColor = "url(#drift-stable)";
                if (v.hasChanged) {
                  strokeColor = v.changeType === "UPGRADE" ? "url(#drift-upgrade)" : "url(#drift-downgrade)";
                }
                if (isHighlighted) {
                  strokeColor = v.changeType === "UPGRADE" ? "#10B981" : v.changeType === "DOWNGRADE" ? "#EF4444" : "#3B82F6";
                }

                return (
                  <path
                    key={v.id}
                    d={pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={isHighlighted ? 4 : 2}
                    opacity={isDimmed ? 0.08 : isHighlighted ? 1.0 : 0.45}
                    className="transition-all duration-200 cursor-pointer"
                    onMouseEnter={() => setHighlightedVariantId(v.id)}
                    onMouseLeave={() => setHighlightedVariantId(null)}
                  />
                );
              })}
            </g>

            {/* Left Column Nodes */}
            <g>
              {["Pathogenic", "Likely Pathogenic", "VUS", "Likely Benign", "Benign"].map((cat, idx) => {
                const count = trackedVariants.filter((v) => v.lastClassified === cat).length;
                const isFocused = focusedClassificationCategory === cat;
                const isDimmed = focusedClassificationCategory !== null && !isFocused;
                const color = cat === "Pathogenic" ? "#EF4444" : cat === "Likely Pathogenic" ? "#F59E0B" : cat === "VUS" ? "#3B82F6" : cat === "Likely Benign" ? "#10B981" : "#6B7280";

                return (
                  <g 
                    key={`left-${cat}`} 
                    className="cursor-pointer"
                    onMouseEnter={() => setFocusedClassificationCategory(cat)}
                    onMouseLeave={() => setFocusedClassificationCategory(null)}
                    opacity={isDimmed ? 0.35 : 1}
                  >
                    <rect
                      x={30}
                      y={20 + idx * 54}
                      width={150}
                      height={34}
                      rx={6}
                      fill="#18181B"
                      stroke={isFocused ? color : "#27272A"}
                      strokeWidth={isFocused ? 2 : 1}
                      className="transition-all duration-200"
                    />
                    <rect
                      x={30}
                      y={20 + idx * 54}
                      width={4}
                      height={34}
                      rx={1}
                      fill={color}
                    />
                    <text x={44} y={38} fill="#FAFAFA" className="text-[10px] font-mono font-bold">{cat}</text>
                    <text x={44} y={48} fill="#71717A" className="text-[8px] font-mono font-semibold">BASELINE ({count})</text>
                  </g>
                );
              })}
            </g>

            {/* Right Column Nodes */}
            <g>
              {["Pathogenic", "Likely Pathogenic", "VUS", "Likely Benign", "Benign"].map((cat, idx) => {
                const count = trackedVariants.filter((v) => v.currentClassified === cat).length;
                const isFocused = focusedClassificationCategory === cat;
                const isDimmed = focusedClassificationCategory !== null && !isFocused;
                const color = cat === "Pathogenic" ? "#EF4444" : cat === "Likely Pathogenic" ? "#F59E0B" : cat === "VUS" ? "#3B82F6" : cat === "Likely Benign" ? "#10B981" : "#6B7280";

                return (
                  <g 
                    key={`right-${cat}`} 
                    className="cursor-pointer"
                    onMouseEnter={() => setFocusedClassificationCategory(cat)}
                    onMouseLeave={() => setFocusedClassificationCategory(null)}
                    opacity={isDimmed ? 0.35 : 1}
                  >
                    <rect
                      x={620}
                      y={20 + idx * 54}
                      width={150}
                      height={34}
                      rx={6}
                      fill="#18181B"
                      stroke={isFocused ? color : "#27272A"}
                      strokeWidth={isFocused ? 2 : 1}
                      className="transition-all duration-200"
                    />
                    <rect
                      x={766}
                      y={20 + idx * 54}
                      width={4}
                      height={34}
                      rx={1}
                      fill={color}
                    />
                    <text x={634} y={38} fill="#FAFAFA" className="text-[10px] font-mono font-bold">{cat}</text>
                    <text x={634} y={48} fill="#71717A" className="text-[8px] font-mono font-semibold">CLINVAR ({count})</text>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Hover Overlay Tooltip Info */}
          <div className="mt-2 min-h-[44px] bg-[#18181B] border border-[#27272A] rounded-lg p-2.5 text-[10px] font-mono flex items-center justify-between text-[#A1A1AA]">
            {highlightedVariantId ? (
              (() => {
                const v = trackedVariants.find((x) => x.id === highlightedVariantId);
                if (!v) return <span>Hover a pathway to inspect clinical drift details</span>;
                return (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-bold">{v.gene} {v.hgvs}</span>
                      <span className="text-[#71717A]">rsID: {v.rsid}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[#EF4444] line-through">{v.lastClassified}</span>
                        <ArrowRight className="w-3 h-3" />
                        <span className="text-white font-bold">{v.currentClassified}</span>
                      </div>
                    </div>
                    <span className={`text-[9px] font-bold ${v.hasChanged ? "text-[#F59E0B]" : "text-[#71717A]"}`}>
                      {v.hasChanged ? `${v.changeType}: ${v.changeDetail}` : "Stable Variant State"}
                    </span>
                  </div>
                );
              })()
            ) : focusedClassificationCategory ? (
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-[#22D3EE]" />
                <span>Showing all genomic trajectories associated with category: <strong className="text-white">{focusedClassificationCategory}</strong></span>
              </div>
            ) : (
              <span className="text-[#71717A] flex items-center gap-1.5 justify-center w-full">
                <TrendingUp className="w-3.5 h-3.5 text-[#F59E0B]" /> Hover any pathway line or classification node to audit reclassification routes in real-time.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* CORE INTERACTION MATRIX: CLI TERMINAL + QUICK ACTION BOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Quick Action Shell Commands (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5 flex flex-col gap-4">
            <h4 className="text-xs font-mono font-bold text-[#FAFAFA] uppercase border-b border-[#27272A] pb-2 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-[#F59E0B]" />
              VariantWatch CLI Simulator
            </h4>

            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-mono text-[#71717A] uppercase">1. Import Stale Registries</span>
              
              <button
                onClick={handleImportDTCData}
                className="w-full text-left bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] p-3 rounded-xl flex items-center justify-between group transition-all"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold font-mono text-[#FAFAFA]">variantwatch import --23andme</span>
                  <span className="text-[10px] text-[#A1A1AA]">Load consumer genotype file (BRCA1, CHEK2)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#71717A] group-hover:text-white transition-transform" />
              </button>

              <button
                onClick={handleImportClinical}
                className="w-full text-left bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] p-3 rounded-xl flex items-center justify-between group transition-all"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold font-mono text-[#FAFAFA]">variantwatch import --clinical</span>
                  <span className="text-[10px] text-[#A1A1AA]">Load pathology report file (MLH1)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#71717A] group-hover:text-white transition-transform" />
              </button>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <span className="text-[10px] font-mono text-[#71717A] uppercase">2. Sync with ClinVar API</span>
              
              <button
                onClick={handleVariantCheck}
                disabled={isSyncing}
                className={`w-full py-3.5 px-4 rounded-xl font-mono text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
                  isSyncing 
                    ? "bg-[#27272A] text-[#71717A] border-[#27272A] cursor-not-allowed animate-pulse"
                    : "bg-[#F59E0B] text-[#09090B] border-[#F59E0B] hover:bg-[#D97706]"
                }`}
              >
                <RefreshCcw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                {isSyncing ? "SURVEILLANCE IN PROGRESS..." : "variantwatch check"}
              </button>
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-[#27272A]">
              <span className="text-[10px] font-mono text-[#71717A] uppercase">3. Local DB File Stats</span>
              <div className="bg-[#09090B] p-3 rounded-xl border border-[#27272A] text-[10px] font-mono text-[#A1A1AA] flex flex-col gap-1">
                <div className="flex justify-between">
                  <span>SQLite Database:</span>
                  <span className="text-[#10B981]">variantwatch.db</span>
                </div>
                <div className="flex justify-between">
                  <span>File Size:</span>
                  <span>142.5 KB (Transient memory)</span>
                </div>
                <div className="flex justify-between">
                  <span>Data Protection:</span>
                  <span className="text-[#22D3EE]">Local Sandbox (100% HIPAA)</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Linux Shell Console (8 cols) */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="bg-[#09090B] border border-[#27272A] rounded-2xl flex flex-col h-full overflow-hidden font-mono text-xs min-h-[340px] md:min-h-0">
            {/* Terminal Header */}
            <div className="bg-[#18181B] border-b border-[#27272A] px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                </div>
                <span className="text-[11px] font-bold text-[#A1A1AA]">bash - variantwatch --surveillance</span>
              </div>
              <span className="text-[10px] text-[#71717A]">HIPAA Local Compliance Sandbox</span>
            </div>

            {/* Terminal Screen Body */}
            <div className="p-4 flex-1 flex flex-col gap-2 overflow-y-auto max-h-[300px] text-[#A1A1AA]">
              {terminalLogs.map((log, idx) => (
                <div key={idx} className="leading-relaxed">
                  {log.startsWith("[") ? (
                    <span className="text-xs">
                      <span className="text-[#71717A] mr-1.5">{log.substring(0, 11)}</span>
                      <span className={
                        log.includes("WARN") ? "text-[#F59E0B] font-bold" :
                        log.includes("ALERT") ? "text-[#EF4444] font-bold" :
                        log.includes("✓") ? "text-[#10B981] font-bold" :
                        log.includes("variantwatch") ? "text-white font-bold" : "text-[#E4E4E7]"
                      }>
                        {log.substring(12)}
                      </span>
                    </span>
                  ) : (
                    <span className="text-white">{log}</span>
                  )}
                </div>
              ))}
              {isSyncing && (
                <div className="text-[#22D3EE] animate-pulse">
                  Querying NCBI db_clinvar indexes: [==============&gt;] 100% complete...
                </div>
              )}
              <div className="flex items-center text-white mt-1">
                <span className="text-[#10B981] mr-1.5">variantwatch_cli $</span>
                <span className="w-1.5 h-3.5 bg-white animate-pulse" />
              </div>
            </div>

            {/* Terminal Footer */}
            <div className="bg-[#18181B] border-t border-[#27272A] px-4 py-2 flex items-center justify-between text-[10px] text-[#71717A]">
              <span>Session: ACTIVE</span>
              <span>API Request Limit: 120/min</span>
            </div>
          </div>
        </div>

      </div>

      {/* COMPLIANCE WARNINGS / ALERTS PANEL (If Sync done or changes exist) */}
      {changedVariants.length > 0 && syncDone && (
        <div className="bg-[#18181B] border border-[#EF4444]/30 rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2.5 border-b border-[#27272A] pb-3 text-[#EF4444]">
            <ShieldAlert className="w-5 h-5" />
            <h4 className="text-sm font-black uppercase tracking-wide">
              Critical Surveillance Action Plan Required ({changedVariants.length} Triggers)
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {changedVariants.map((c) => (
              <div 
                key={c.id} 
                className={`p-4 rounded-xl border flex flex-col gap-2 text-xs ${
                  c.changeType === "DOWNGRADE" 
                    ? "bg-[#EF4444]/5 border-[#EF4444]/20" 
                    : "bg-[#F59E0B]/5 border-[#F59E0B]/20"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="font-bold text-white font-mono text-xs">{c.gene} {c.hgvs}</span>
                    <span className="text-[10px] text-[#71717A] font-mono">Source: {c.source}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold ${
                    c.changeType === "DOWNGRADE" ? "bg-[#EF4444]/10 text-[#EF4444]" : "bg-[#F59E0B]/10 text-[#F59E0B]"
                  }`}>
                    {c.changeType === "DOWNGRADE" ? "PATHOLOGY DOWNGRADE" : "MISSED DIAGNOSIS UPGRADE"}
                  </span>
                </div>

                <div className="flex items-center gap-2 py-1 border-y border-[#27272A] text-[11px] font-mono">
                  <span className="text-[#A1A1AA]">Prior:</span>
                  <span className="text-[#71717A] line-through">{c.lastClassified}</span>
                  <ArrowRight className="w-3 h-3 text-[#A1A1AA]" />
                  <span className="text-[#A1A1AA]">Current:</span>
                  <span className="text-white font-bold">{c.currentClassified}</span>
                </div>

                <p className="text-[#A1A1AA] text-[11px] leading-relaxed">
                  <strong>Rationale:</strong> {c.changeDetail}
                </p>

                <div className="bg-[#09090B] p-2.5 rounded-lg border border-[#27272A] flex flex-col gap-1 text-[10px] leading-relaxed">
                  <span className="font-bold text-white font-mono uppercase flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-[#22D3EE]" /> Recommended Action:
                  </span>
                  <span className="text-[#A1A1AA]">
                    {c.changeType === "DOWNGRADE" 
                      ? "De-escalate aggressive surveillance. Audit for completed surgeries or medical liabilities and document update."
                      : "Audit patient files immediately to order confirmatory assays and discuss therapeutic updates."}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DETAILED SURVEILLANCE REGISTRY & SQL DATABASE VIEWER */}
      <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-6 flex flex-col gap-5">
        
        {/* Table Filters & Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272A] pb-4">
          <div className="flex flex-col gap-1">
            <h4 className="text-sm font-bold text-[#FAFAFA]">Local SQLite Variant Registry</h4>
            <p className="text-[11px] text-[#A1A1AA]">HIPAA-compliant patient genetic alterations under continuous watch.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Gene, HGVS, rsID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#09090B] border border-[#27272A] text-xs pl-8 pr-3 py-2 rounded-xl text-[#FAFAFA] font-mono focus:outline-none focus:border-[#F59E0B] w-full md:w-[220px]"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5 bg-[#09090B] p-1 rounded-xl border border-[#27272A] text-[10px] font-mono">
              <button
                onClick={() => setActiveFilter("ALL")}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  activeFilter === "ALL" ? "bg-[#27272A] text-white" : "text-[#71717A] hover:text-white"
                }`}
              >
                ALL ({trackedVariants.length})
              </button>
              <button
                onClick={() => setActiveFilter("CHANGES")}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  activeFilter === "CHANGES" ? "bg-[#27272A] text-[#F59E0B]" : "text-[#71717A] hover:text-white"
                }`}
              >
                CHANGES ({trackedVariants.filter(v => v.hasChanged).length})
              </button>
              <button
                onClick={() => setActiveFilter("HIGH")}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  activeFilter === "HIGH" ? "bg-[#27272A] text-[#10B981]" : "text-[#71717A] hover:text-white"
                }`}
              >
                HIGH CONF
              </button>
            </div>
          </div>
        </div>

        {/* The Grid Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-[#27272A] text-[#71717A] uppercase text-[10px] tracking-wider font-bold">
                <th className="py-3 px-4">Gene / rsID</th>
                <th className="py-3 px-4">HGVS Variant Syntax</th>
                <th className="py-3 px-4">Original Class</th>
                <th className="py-3 px-4">Current ClinVar Status</th>
                <th className="py-3 px-4">Review Stars / Labs</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredVariants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-[#71717A]">
                    No matching variants registered in local database.
                  </td>
                </tr>
              ) : (
                filteredVariants.map((v) => (
                  <tr 
                    key={v.id} 
                    className={`border-b border-[#27272A] hover:bg-[#18181B]/40 transition-colors ${
                      v.hasChanged ? "bg-[#F59E0B]/5" : ""
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-xs">{v.gene}</span>
                        <span className="text-[10px] text-[#71717A]">{v.rsid}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#A1A1AA] max-w-[200px] truncate" title={v.hgvs}>
                      {v.hgvs}
                    </td>
                    <td className="py-3.5 px-4 text-[#71717A]">
                      {v.lastClassified}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold ${
                          v.currentClassified === "Pathogenic" || v.currentClassified === "Likely Pathogenic" 
                            ? "text-[#EF4444]" 
                            : v.currentClassified === "VUS" ? "text-[#F59E0B]" : "text-[#10B981]"
                        }`}>
                          {v.currentClassified}
                        </span>
                        {v.hasChanged && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30 animate-pulse font-bold">
                            DIFF
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex text-[#F59E0B]">
                          {"★".repeat(v.reviewStars)}
                          {"☆".repeat(4 - v.reviewStars)}
                        </div>
                        <span className="text-[10px] text-[#71717A]">{v.submittingLabs} submissions</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        v.confidenceLevel === "HIGH" 
                          ? "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30" 
                          : v.confidenceLevel === "MODERATE" 
                          ? "bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/30" 
                          : "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30"
                      }`}>
                        {v.confidenceLevel}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleDeleteVariant(v.id, v.gene, v.hgvs)}
                        className="p-1 rounded text-[#71717A] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-all"
                        title="Delete from SQLite"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Manual Variant Addition Form */}
        <div className="border-t border-[#27272A] pt-5">
          <form onSubmit={handleAddManual} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#09090B] p-4 rounded-xl border border-[#27272A]">
            <div className="flex flex-col gap-1 md:col-span-4 border-b border-[#27272A] pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1">
                <Plus className="w-3.5 h-3.5 text-[#F59E0B]" /> Add Custom Variant to watch.db
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-[#71717A] uppercase font-bold">Gene Symbol</label>
              <input
                type="text"
                placeholder="e.g. BRCA2"
                required
                value={newGene}
                onChange={(e) => setNewGene(e.target.value)}
                className="bg-[#18181B] border border-[#27272A] text-xs px-2.5 py-1.5 rounded-lg text-white font-mono focus:outline-none focus:border-[#F59E0B]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-[#71717A] uppercase font-bold">HGVS Nomenclature</label>
              <input
                type="text"
                placeholder="e.g. c.156C>G"
                required
                value={newHgvs}
                onChange={(e) => setNewHgvs(e.target.value)}
                className="bg-[#18181B] border border-[#27272A] text-xs px-2.5 py-1.5 rounded-lg text-white font-mono focus:outline-none focus:border-[#F59E0B]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-[#71717A] uppercase font-bold">dbSNP rsID</label>
              <input
                type="text"
                placeholder="e.g. rs28934572"
                value={newRsid}
                onChange={(e) => setNewRsid(e.target.value)}
                className="bg-[#18181B] border border-[#27272A] text-xs px-2.5 py-1.5 rounded-lg text-white font-mono focus:outline-none focus:border-[#F59E0B]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-[#71717A] uppercase font-bold">Last Known Class</label>
              <select
                value={newClass}
                onChange={(e: any) => setNewClass(e.target.value)}
                className="bg-[#18181B] border border-[#27272A] text-xs px-2.5 py-1.5 rounded-lg text-white font-mono focus:outline-none focus:border-[#F59E0B]"
              >
                <option value="Pathogenic">Pathogenic</option>
                <option value="Likely Pathogenic">Likely Pathogenic</option>
                <option value="VUS">VUS</option>
                <option value="Likely Benign">Likely Benign</option>
                <option value="Benign">Benign</option>
              </select>
            </div>

            {/* Advanced Criteria fields */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-[#71717A] uppercase font-bold">Review Status (Stars)</label>
              <select
                value={newStars}
                onChange={(e: any) => setNewStars(Number(e.target.value))}
                className="bg-[#18181B] border border-[#27272A] text-xs px-2.5 py-1.5 rounded-lg text-white font-mono focus:outline-none focus:border-[#F59E0B]"
              >
                <option value={0}>0 Stars (No criteria met)</option>
                <option value={1}>1 Star (Single submitter)</option>
                <option value={2}>2 Stars (Multiple submitters)</option>
                <option value={3}>3 Stars (Reviewed panel)</option>
                <option value={4}>4 Stars (Practice guideline)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-[#71717A] uppercase font-bold">Submitting Labs</label>
              <input
                type="number"
                min={1}
                value={newSubmittingLabs}
                onChange={(e) => setNewSubmittingLabs(Number(e.target.value))}
                className="bg-[#18181B] border border-[#27272A] text-xs px-2.5 py-1.5 rounded-lg text-white font-mono focus:outline-none focus:border-[#F59E0B]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-[#71717A] uppercase font-bold">Evidence Conflict?</label>
              <div className="flex items-center gap-2 h-full mt-1.5">
                <input
                  type="checkbox"
                  id="newConflictCheck"
                  checked={newConflict}
                  onChange={(e) => setNewConflict(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#F59E0B] focus:ring-[#F59E0B] accent-[#F59E0B]"
                />
                <label htmlFor="newConflictCheck" className="text-xs text-[#A1A1AA]">
                  Flag conflict status
                </label>
              </div>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-[#10B981] hover:bg-[#059669] text-[#022C22] font-mono text-xs font-bold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Commit to SQLite
              </button>
            </div>

          </form>
        </div>

      </div>

      {/* SELECTION-BASED SIX-PILLAR CLINICAL DOSSIER */}
      {(() => {
        const selectedVar = trackedVariants.find(v => v.id === selectedRecontactVariantId) || trackedVariants[0];
        if (!selectedVar) return null;

        const { arb, pred, fhir, clinvarSub, pat, pop } = getEnrichedDossier(selectedVar);

        const handleCopyDossier = (text: string) => {
          navigator.clipboard.writeText(text);
          setCopiedDossierRaw(true);
          setTimeout(() => setCopiedDossierRaw(false), 2000);
          addLog(`✓ Copied clinical intelligence metrics to clipboard.`);
        };

        const handleSimulateNCBI = () => {
          setSubmissionSimulated(true);
          addLog(`[NCBI Submission API] Transmitting payload for ${selectedVar.gene} ${selectedVar.hgvs}...`);
          setTimeout(() => {
            addLog(`✓ ClinVar API Submission SUCCESS. Received ID: SUB-${Math.floor(Math.random() * 900000) + 100000}`);
          }, 1500);
        };

        const letterTemplates = {
          PATIENT: `Subject: Important Medical Update Regarding Your Genetic Screening Results

Dear ${customPatientName},

We are writing to provide you with an important clinical update regarding the genetic testing you underwent previously. 

Our continuous genomic surveillance system (VariantWatch) has detected that the variant identified in your genetic report in the ${selectedVar.gene} gene (${selectedVar.hgvs}) has been reclassified in the ClinVar consensus database:

- Previous Interpretation: ${selectedVar.lastClassified}
- Current Consensus Status: ${selectedVar.currentClassified}
- Surveillance Confidence: ${selectedVar.confidenceLevel}

This change in classification is based on newly available global clinical evidence and population reference database records (gnomAD).

What this means for you:
${selectedVar.changeType === "DOWNGRADE" 
  ? "Your variant was downgraded, suggesting it is highly likely to be a benign regional variation. Aggressive surveillance or surgical preventative interventions may no longer be indicated. Please schedule a consultation to discuss de-escalating your active clinical management."
  : "Your variant was upgraded to a higher significance status. It is important to review this update with your physician to discuss potential updates to your clinical care, diagnostic screening, or hereditary cascade testing for relatives."
}

We strongly recommend contacting your clinical provider or our lab genetic counselors to schedule a short review of this update.

Sincerely,
${directorName}
${labName}`,
          PHYSICIAN: `CONFIDENTIAL CLINICAL ADVISORY: GENETIC INTERPRETATION RECLASSIFICATION

Date: ${new Date().toISOString().split("T")[0]}
To: ${customPhysicianName}
From: ${directorName}, Lab Director (${labName})
Regarding Patient Record ID: PAT-${selectedVar.id.toUpperCase()}

Dear Colleague,

We are issuing this Pathology Advisory because a genomic alteration previously reported for your patient has undergone a formal ClinVar consensus reclassification.

ALTERATION UNDER WATCH:
• Gene Symbol: ${selectedVar.gene}
• Coordinate (HGVS): ${selectedVar.hgvs}
• dbSNP Reference: ${selectedVar.rsid}
• Interpretation Shift: ${selectedVar.lastClassified} ➔ ${selectedVar.currentClassified}

EVIDENCE & ACTION REQUIRED:
${selectedVar.changeDetail}

We have graded our confidence in this reclassification as ${selectedVar.confidenceLevel} based on submission-level recency metrics (ClinvArbitration consensus score of ${arb.consensusScore}% across ${selectedVar.submittingLabs} submissions).

Clinical Recommendation:
${selectedVar.changeType === "DOWNGRADE"
  ? "1. DE-ESCALATE active diagnostic screening or surgery. This variant is now considered a VUS/Benign allele.\\n2. Review any previous therapeutic decisions made under the prior pathogenic classification."
  : "1. ORDER confirmatory clinical-grade screening.\\n2. RE-EVALUATE family history. Highly recommend hereditary cascade screening for first-degree relatives of PAT-${selectedVar.id.toUpperCase()}."
}

Please contact our Molecular Interpretation Suite at any time to consult with our variant scientists.

Regards,
${directorName}`,
          AUDIT: `INTERNAL CLINICAL QUALITY ASSURANCE AUDIT REPORT
Document ID: AUD-${selectedVar.id.toUpperCase()}-${new Date().getFullYear()}
Status: IN PROGRESS

RECLASSIFICATION METRICS:
- Variant: ${selectedVar.gene} ${selectedVar.hgvs}
- Shift: ${selectedVar.lastClassified} -> ${selectedVar.currentClassified}
- Submitting Laboratories: ${selectedVar.submittingLabs}
- Conflict Status: ${selectedVar.conflictStatus ? "ACTIVE DISAGREEMENT" : "CONSENSUS"}

AUDIT CONTROL MATRIX:
[${dossierChecklist.audit ? "✓" : " "}] 1. IDENTIFY and isolate all patient EHR files matching this genomic alteration.
[${dossierChecklist.counseling ? "✓" : " "}] 2. BRIEF clinical genetic counselors regarding interpretive shift details.
[${dossierChecklist.cascade ? "✓" : " "}] 3. PREPARE custom advisory letters for active clinical providers.
[${dossierChecklist.pathology ? "✓" : " "}] 4. REGISTER outcome audit metrics in lab quality management suite (LQMS).

CURRENT COHORT STATS FOR ${selectedVar.gene}:
- Enrolled Patients: ${pat.contactedCount}
- Prevented/Avoided Harm Rate: ${pat.preventedHarm ? "100% (Surveillance Protected)" : "Audit Pending"}
- Cascade Relatives Screened: ${pat.cascadeTestedRelatives}

Authorizing Clinical Officer: ${directorName}`
        };

        const handleToggleChecklist = (key: string) => {
          setDossierChecklist(prev => {
            const newVal = !prev[key];
            addLog(`Updated audit control matrix checklist [${key.toUpperCase()}]: ${newVal ? "COMPLETED" : "PENDING"}`);
            return { ...prev, [key]: newVal };
          });
        };

        const handleAiConsult = async () => {
          if (!selectedVar) return;
          setIsConsultLoading(true);
          setAiConsultResult(null);
          addLog(`[AI Co-Pilot] Dispatching Clinical Consultation Request for ${selectedVar.gene} ${selectedVar.hgvs}...`);
          try {
            const res = await fetch("/agent/v1/ai-consult", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ variant: selectedVar, userQuestion: aiQuestion })
            });
            if (!res.ok) {
              throw new Error(`HTTP status code ${res.status}`);
            }
            const data = await res.json();
            setAiConsultResult(data.response);
            setAiConsultMode(data.mode === "GEMINI_3.7_LIVE" ? "LIVE" : "OFFLINE");
            addLog(`✓ AI Clinical Consultation resolved successfully (Mode: ${data.mode}).`);
          } catch (err: any) {
            addLog(`[ERROR] AI Consultation failed: ${err.message || err}`);
            setAiConsultResult(`### Clinical Consultation Error\nUnable to reach VariantWatch AI Co-Pilot services. Please verify your server connection.\n\nDetails: ${err.message || "Unknown communication fault"}`);
            setAiConsultMode(null);
          } finally {
            setIsConsultLoading(false);
          }
        };

        const handleEnhanceLetter = async () => {
          if (!selectedVar) return;
          setIsLetterEnhancing(true);
          addLog(`[AI Co-Pilot] Enhancing ${recontactLetterType} advisory letter for ${selectedVar.gene}...`);
          try {
            const recipientName = recontactLetterType === "PATIENT" ? customPatientName : recontactLetterType === "PHYSICIAN" ? customPhysicianName : "Internal Audit";
            const currentText = letterTemplates[recontactLetterType];
            
            const res = await fetch("/agent/v1/ai-enhance-letter", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                variant: selectedVar,
                letterType: recontactLetterType,
                currentText,
                recipientName,
                labName,
                directorName
              })
            });
            if (!res.ok) {
              throw new Error(`HTTP status code ${res.status}`);
            }
            const data = await res.json();
            const letterKey = `${selectedVar.id}_${recontactLetterType}`;
            setCustomLetters(prev => ({
              ...prev,
              [letterKey]: data.response
            }));
            addLog(`✓ ${recontactLetterType} letter successfully optimized and signed (Mode: ${data.mode}).`);
          } catch (err: any) {
            addLog(`[ERROR] AI Letter optimization failed: ${err.message || err}`);
          } finally {
            setIsLetterEnhancing(false);
          }
        };

        return (
          <div className="bg-[#18181B] border border-[#22D3EE]/30 rounded-2xl p-6 flex flex-col gap-5">
            {/* Header with Title and Selected Variant Badge */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272A] pb-4">
              <div className="flex items-center gap-2.5 text-[#22D3EE]">
                <Dna className="w-5 h-5 animate-pulse" />
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Pillars of Knowledge: Genomic Dossier</h4>
                  <p className="text-[11px] text-[#A1A1AA]">
                    System-level clinical intelligence and action panel for the active selection.
                  </p>
                </div>
              </div>

              {/* Selected Variant Selector Summary Card */}
              <div className="bg-[#09090B] border border-[#27272A] px-4 py-2.5 rounded-xl flex items-center gap-3 text-xs">
                <span className="text-[#71717A] uppercase font-bold font-mono">Surveillance Target:</span>
                <span className="text-white font-bold font-mono bg-[#22D3EE]/10 text-[#22D3EE] px-2 py-0.5 rounded border border-[#22D3EE]/20">
                  {selectedVar.gene} {selectedVar.hgvs}
                </span>
                <span className="text-[11px] text-[#A1A1AA] font-mono hidden sm:inline">({selectedVar.rsid})</span>
              </div>
            </div>

            {/* Pillar Tabs Navigation */}
            <div className="flex flex-wrap gap-1.5 border-b border-[#27272A] pb-3 text-xs font-mono">
              <button
                type="button"
                onClick={() => setActiveDossierTab("ARBITRATION")}
                className={`px-3 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                  activeDossierTab === "ARBITRATION"
                    ? "bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/30"
                    : "text-[#71717A] hover:text-white"
                }`}
              >
                <GitMerge className="w-3.5 h-3.5 text-[#22D3EE]" /> 1. ClinvArbitration
              </button>
              <button
                type="button"
                onClick={() => setActiveDossierTab("ML_PREDICTION")}
                className={`px-3 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                  activeDossierTab === "ML_PREDICTION"
                    ? "bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/30"
                    : "text-[#71717A] hover:text-white"
                }`}
              >
                <Brain className="w-3.5 h-3.5 text-[#3B82F6]" /> 2. VUS Prognosis
              </button>
              <button
                type="button"
                onClick={() => setActiveDossierTab("FHIR")}
                className={`px-3 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                  activeDossierTab === "FHIR"
                    ? "bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/30"
                    : "text-[#71717A] hover:text-white"
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-[#10B981]" /> 3. FHIR Genomics
              </button>
              <button
                type="button"
                onClick={() => setActiveDossierTab("SUBMISSION")}
                className={`px-3 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                  activeDossierTab === "SUBMISSION"
                    ? "bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/30"
                    : "text-[#71717A] hover:text-white"
                }`}
              >
                <Upload className="w-3.5 h-3.5 text-[#A855F7]" /> 4. Submission Feed
              </button>
              <button
                type="button"
                onClick={() => setActiveDossierTab("POP_DIVERSITY")}
                className={`px-3 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                  activeDossierTab === "POP_DIVERSITY"
                    ? "bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/30"
                    : "text-[#71717A] hover:text-white"
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-[#14B8A6]" /> 5. Population Diversity
              </button>
              <button
                type="button"
                onClick={() => setActiveDossierTab("PATIENT_ACTION")}
                className={`px-3 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                  activeDossierTab === "PATIENT_ACTION"
                    ? "bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/30"
                    : "text-[#71717A] hover:text-white"
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5 text-[#EF4444]" /> 6. Impact Letter Board
              </button>
              <button
                type="button"
                onClick={() => setActiveDossierTab("AI_CONSULT")}
                className={`px-3 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                  activeDossierTab === "AI_CONSULT"
                    ? "bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/30"
                    : "text-[#71717A] hover:text-white"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#F59E0B] animate-pulse" /> ✨ AI Clinical Consultant
              </button>
            </div>

            {/* TAB CONTENT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[300px]">
              
              {/* Pillar 1: ClinvArbitration Details */}
              {activeDossierTab === "ARBITRATION" && (
                <div className="lg:col-span-12 flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#09090B] border border-[#27272A] p-4 rounded-xl flex flex-col gap-1.5">
                      <span className="text-[10px] font-mono uppercase text-[#71717A]">Consensus Weighting Score</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-[#22D3EE] font-mono">{arb.consensusScore}%</span>
                        <span className="text-xs text-[#A1A1AA]">Consensus level</span>
                      </div>
                      <p className="text-[10px] text-[#71717A] leading-normal">
                        Aggregates all submissions with exponential recency decay weights and star score validation.
                      </p>
                    </div>

                    <div className="bg-[#09090B] border border-[#27272A] p-4 rounded-xl flex flex-col gap-1.5">
                      <span className="text-[10px] font-mono uppercase text-[#71717A]">Recency Decay Factor</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-[#10B981] font-mono">{arb.recencyWeightScore}/100</span>
                        <span className="text-xs text-[#A1A1AA]">Freshness index</span>
                      </div>
                      <p className="text-[10px] text-[#71717A] leading-normal">
                        Prioritizes submissions post-2024 to filter old criteria models and historical noise.
                      </p>
                    </div>

                    <div className="bg-[#09090B] border border-[#27272A] p-4 rounded-xl flex flex-col gap-1.5">
                      <span className="text-[10px] font-mono uppercase text-[#71717A]">Expert Panel Reviews</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-[#F59E0B] font-mono">{arb.expertPanelCount}</span>
                        <span className="text-xs text-[#A1A1AA]">Verified Consortiums</span>
                      </div>
                      <p className="text-[10px] text-[#71717A] leading-normal">
                        Matches against professional groups like ClinGen, ENIGMA, or IARC with maximum star weight.
                      </p>
                    </div>
                  </div>

                  {/* Submission Timeline */}
                  <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-[#27272A] pb-2 text-[10px] font-mono uppercase font-bold text-[#71717A]">
                      <span>ClinVar Submission Registry Timeline</span>
                      <span className={selectedVar.conflictStatus ? "text-[#EF4444]" : "text-[#10B981]"}>
                        {selectedVar.conflictStatus ? "⚠ CONFLICT DETECTED" : "✔ COMPLIANT CONSENSUS"}
                      </span>
                    </div>

                    <div className="flex flex-col gap-3.5 font-mono text-xs">
                      {arb.timeline.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-4 relative pl-3 border-l border-[#27272A]">
                          {/* Timeline node */}
                          <div className={`w-2.5 h-2.5 rounded-full absolute -left-[5.5px] top-1 ${
                            item.classification === "Pathogenic" || item.classification === "Likely Pathogenic"
                              ? "bg-[#EF4444]"
                              : item.classification === "VUS" ? "bg-[#F59E0B]" : "bg-[#10B981]"
                          }`} />
                          
                          <div className="text-[10px] text-[#71717A] w-[80px] shrink-0 pt-0.5">{item.date}</div>
                          
                          <div className="flex flex-col gap-0.5 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">{item.submitter}</span>
                              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                item.classification === "Pathogenic" || item.classification === "Likely Pathogenic"
                                  ? "bg-[#EF4444]/10 text-[#EF4444]"
                                  : item.classification === "VUS" ? "bg-[#F59E0B]/10 text-[#F59E0B]" : "bg-[#10B981]/10 text-[#10B981]"
                              }`}>
                                {item.classification}
                              </span>
                            </div>
                            <span className="text-[10px] text-[#A1A1AA]">Status: {item.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {selectedVar.conflictStatus && arb.conflictingLabs.length > 0 && (
                      <div className="mt-2 bg-[#EF4444]/5 border border-[#EF4444]/20 p-3 rounded-lg text-[11px] text-[#EF4444] leading-relaxed">
                        <strong>Arbitration Warning:</strong> Active conflicts exist between submitting laboratories: <span className="font-bold text-white">{arb.conflictingLabs.join(" vs ")}</span>. ClinvArbitration recency filters favor newer submissions, downgrading active pathogenics if solid benign datasets are submitted.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Pillar 2: VUS Reclassification Prediction */}
              {activeDossierTab === "ML_PREDICTION" && (
                <div className="lg:col-span-12 flex flex-col gap-4">
                  <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-5 flex flex-col md:flex-row gap-6 items-center justify-between">
                    <div className="flex flex-col gap-2 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/20 px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono">
                          FIND & METAXVP ENGINES
                        </span>
                        <span className="text-xs text-[#71717A]">ACMG 2026 PREDICTIVE STANDARD</span>
                      </div>
                      <h5 className="text-sm font-bold text-white">Reclassification Prognosis Matrix</h5>
                      <p className="text-xs text-[#A1A1AA] leading-relaxed">
                        Quantifies the mathematical risk that a variant currently classed as VUS is structurally deleterious, projecting its likelihood of being upgraded to Pathogenic or downgraded to Benign as biological curation deepens.
                      </p>
                    </div>

                    <div className="bg-[#18181B] border border-[#27272A] p-4 rounded-xl min-w-[200px] flex flex-col items-center gap-1">
                      <span className="text-[9px] font-mono text-[#71717A] uppercase font-bold">2-Year Upgrade Risk</span>
                      <span className={`text-4xl font-black font-mono ${
                        pred.reclassificationRiskScore > 70 ? "text-[#EF4444]" : pred.reclassificationRiskScore > 30 ? "text-[#F59E0B]" : "text-[#10B981]"
                      }`}>
                        {pred.reclassificationRiskScore}%
                      </span>
                      <span className="text-[10px] text-[#A1A1AA] font-mono">Prediction Probability</span>
                    </div>
                  </div>

                  {/* Prediction models grid */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 font-mono text-xs">
                    
                    {/* Model 1 */}
                    <div className="bg-[#09090B] border border-[#27272A] p-3.5 rounded-xl flex flex-col justify-between h-[110px]">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] text-[#71717A] uppercase font-bold">FIND (2025)</span>
                        <span className={`font-bold ${pred.findPredictor === "DELETERIOUS" ? "text-[#EF4444]" : "text-[#10B981]"}`}>
                          {pred.findPredictor}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline border-t border-[#27272A] pt-1.5 text-[10px]">
                        <span className="text-[#71717A]">Score:</span>
                        <span className="text-white font-bold">{pred.findScore}</span>
                      </div>
                    </div>

                    {/* Model 2 */}
                    <div className="bg-[#09090B] border border-[#27272A] p-3.5 rounded-xl flex flex-col justify-between h-[110px]">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] text-[#71717A] uppercase font-bold">MetaXVP (2026)</span>
                        <span className="text-white font-bold">Consensus ML</span>
                      </div>
                      <div className="flex justify-between items-baseline border-t border-[#27272A] pt-1.5 text-[10px]">
                        <span className="text-[#71717A]">Score:</span>
                        <span className="text-white font-bold">{pred.metaXvpScore}</span>
                      </div>
                    </div>

                    {/* Model 3 */}
                    <div className="bg-[#09090B] border border-[#27272A] p-3.5 rounded-xl flex flex-col justify-between h-[110px]">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] text-[#71717A] uppercase font-bold">REVEL Ensemble</span>
                        <span className="text-white font-bold">Rare Missense</span>
                      </div>
                      <div className="flex justify-between items-baseline border-t border-[#27272A] pt-1.5 text-[10px]">
                        <span className="text-[#71717A]">Score:</span>
                        <span className="text-white font-bold">{pred.revelScore}</span>
                      </div>
                    </div>

                    {/* Model 4 */}
                    <div className="bg-[#09090B] border border-[#27272A] p-3.5 rounded-xl flex flex-col justify-between h-[110px]">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] text-[#71717A] uppercase font-bold">CADD Phred</span>
                        <span className="text-white font-bold">Genome-Wide</span>
                      </div>
                      <div className="flex justify-between items-baseline border-t border-[#27272A] pt-1.5 text-[10px]">
                        <span className="text-[#71717A]">Phred:</span>
                        <span className="text-white font-bold">{pred.caddScore}</span>
                      </div>
                    </div>

                    {/* Model 5 */}
                    <div className="bg-[#09090B] border border-[#27272A] p-3.5 rounded-xl flex flex-col justify-between h-[110px]">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] text-[#71717A] uppercase font-bold">AlphaMissense</span>
                        <span className="text-white font-bold">Structural AI</span>
                      </div>
                      <div className="flex justify-between items-baseline border-t border-[#27272A] pt-1.5 text-[10px]">
                        <span className="text-[#71717A]">Probability:</span>
                        <span className="text-white font-bold">{pred.alphaMissenseScore}</span>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Pillar 3: FHIR Genomics Integration */}
              {activeDossierTab === "FHIR" && (
                <div className="lg:col-span-12 flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-[#27272A] pb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono uppercase text-[#71717A]">HL7 FHIR Genomics REST Resources</span>
                    </div>

                    <div className="flex items-center gap-1 bg-[#09090B] p-0.5 rounded-lg border border-[#27272A] text-[9px] font-mono">
                      <button
                        type="button"
                        onClick={() => setActiveFhirTab("OBS")}
                        className={`px-2 py-1 rounded-md transition-all ${
                          activeFhirTab === "OBS" ? "bg-[#27272A] text-white" : "text-[#71717A] hover:text-white"
                        }`}
                      >
                        Observation
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveFhirTab("SEQ")}
                        className={`px-2 py-1 rounded-md transition-all ${
                          activeFhirTab === "SEQ" ? "bg-[#27272A] text-white" : "text-[#71717A] hover:text-white"
                        }`}
                      >
                        MolecularSequence
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveFhirTab("REP")}
                        className={`px-2 py-1 rounded-md transition-all ${
                          activeFhirTab === "REP" ? "bg-[#27272A] text-white" : "text-[#71717A] hover:text-white"
                        }`}
                      >
                        DiagnosticReport
                      </button>
                    </div>
                  </div>

                  {/* Code Block Viewer */}
                  <div className="relative">
                    <pre className="bg-[#09090B] border border-[#27272A] p-4 rounded-xl text-[11px] text-[#10B981] font-mono overflow-x-auto max-h-[240px] leading-relaxed">
                      {activeFhirTab === "OBS" ? fhir.observationJson : activeFhirTab === "SEQ" ? fhir.sequenceJson : fhir.diagnosticReportJson}
                    </pre>

                    <button
                      type="button"
                      onClick={() => handleCopyDossier(
                        activeFhirTab === "OBS" ? fhir.observationJson : activeFhirTab === "SEQ" ? fhir.sequenceJson : fhir.diagnosticReportJson
                      )}
                      className="absolute right-3 top-3 bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#22D3EE] px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all"
                    >
                      <Copy className="w-3 h-3" /> Copy FHIR Resource
                    </button>
                  </div>

                  <p className="text-[10px] text-[#71717A] leading-normal font-mono flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" /> Compliant with HL7 Version 3 Genomic Sequencing specifications. Perfect for automated EHR pipelines (Epic/Cerner interoperability).
                  </p>
                </div>
              )}

              {/* Pillar 4: ClinVar Submission Pipeline */}
              {activeDossierTab === "SUBMISSION" && (
                <div className="lg:col-span-12 flex flex-col gap-4">
                  <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-5 flex flex-col md:flex-row gap-6 items-center justify-between">
                    <div className="flex flex-col gap-2 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20 px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono">
                          CLINVAR API PARTNERSHIP
                        </span>
                        <span className="text-xs text-[#71717A]">AMP VARIANT DATA SHARING MANDATE</span>
                      </div>
                      <h5 className="text-sm font-bold text-white">Consortium Feedback Loop (ClinVar Submission API)</h5>
                      <p className="text-xs text-[#A1A1AA] leading-relaxed">
                        To resolve global variant classification conflicts, clinical laboratories have a duty to share their evidence. This tab formats and prepares submission-ready JSON and XML manifests of your local reclassifications for immediate ClinVar API dispatch.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleSimulateNCBI}
                      disabled={submissionSimulated}
                      className={`px-4 py-3 rounded-xl font-mono text-xs font-bold transition-all border flex items-center gap-2 shrink-0 ${
                        submissionSimulated
                          ? "bg-[#27272A] text-[#71717A] border-[#27272A] cursor-not-allowed"
                          : "bg-[#10B981] text-[#022C22] border-[#10B981] hover:bg-[#059669]"
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      {submissionSimulated ? "TRANSMITTED TO ClinVar" : "Simulate API Dispatch"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-mono uppercase text-[#71717A] font-bold">Standard ClinVar Submission XML</span>
                      <pre className="bg-[#09090B] border border-[#27272A] p-3 rounded-xl text-[10px] text-[#A1A1AA] font-mono overflow-x-auto max-h-[160px] leading-relaxed">
                        {clinvarSub.prefilledXml}
                      </pre>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-mono uppercase text-[#71717A] font-bold">REST API Request Payload (JSON)</span>
                      <pre className="bg-[#09090B] border border-[#27272A] p-3 rounded-xl text-[10px] text-[#A1A1AA] font-mono overflow-x-auto max-h-[160px] leading-relaxed">
                        {clinvarSub.prefilledJson}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* Pillar 5: Population-Specific Intelligence */}
              {activeDossierTab === "POP_DIVERSITY" && (
                <div className="lg:col-span-12 flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-[#09090B] border border-[#27272A] p-4 rounded-xl flex flex-col gap-1">
                      <span className="text-[9px] font-mono uppercase text-[#71717A] font-bold">Highest-Ratio Ancestry</span>
                      <span className="text-xl font-black text-white font-mono mt-1">{pop.ancestralPopulation}</span>
                      <span className="text-[9px] text-[#A1A1AA] font-mono">gnomAD reference frequency</span>
                    </div>

                    <div className="bg-[#09090B] border border-[#27272A] p-4 rounded-xl flex flex-col gap-1">
                      <span className="text-[9px] font-mono uppercase text-[#71717A] font-bold">Pop Evidence Gap Score</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-black text-[#EF4444] font-mono">{pop.popEvidenceGapScore}/100</span>
                        <span className="text-[10px] text-[#A1A1AA]">Gap level</span>
                      </div>
                      <span className="text-[9px] text-[#71717A] font-mono">Under-representation index</span>
                    </div>

                    <div className="bg-[#09090B] border border-[#27272A] p-4 rounded-xl flex flex-col gap-1">
                      <span className="text-[9px] font-mono uppercase text-[#71717A] font-bold">Ancestral VUS vs European</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-xl font-black text-[#F59E0B] font-mono">{pop.nonEuropeanVusRate} vs {pop.europeanVusRate}</span>
                      </div>
                      <span className="text-[9px] text-[#71717A] font-mono">Higher false-positive rates</span>
                    </div>

                    <div className="bg-[#09090B] border border-[#27272A] p-4 rounded-xl flex flex-col gap-1">
                      <span className="text-[9px] font-mono uppercase text-[#71717A] font-bold">Reclassification Hazard Ratio</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-black text-[#22D3EE] font-mono">{pop.hazardRatio}x</span>
                        <span className="text-[10px] text-[#A1A1AA]">Elevation</span>
                      </div>
                      <span className="text-[9px] text-[#71717A] font-mono">Probability of drift vs European</span>
                    </div>
                  </div>

                  <div className="bg-[#09090B] border border-[#27272A] p-4 rounded-xl text-xs leading-relaxed text-[#A1A1AA] flex flex-col gap-2">
                    <span className="font-bold text-white font-mono uppercase flex items-center gap-1">
                      <Globe className="w-4 h-4 text-[#22D3EE]" /> Precision Medicine Bias Commentary:
                    </span>
                    <p className="text-[11px]">
                      Because genomic reference reference databases are heavily skewed (~80% European ancestry), variants unique to minority ancestries often start classified as VUS (false positives) due to lack of biological studies. As databases grow, these variants are downgraded rapidly. A Hazard Ratio of <strong className="text-[#22D3EE] font-mono">{pop.hazardRatio}x</strong> indicates this alteration is statistically more vulnerable to classification drift due to historic evidence gaps.
                    </p>
                  </div>
                </div>
              )}

              {/* Pillar 6: Impact Letters and Recontact Board */}
              {activeDossierTab === "PATIENT_ACTION" && (
                <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-12 gap-5">
                  
                  {/* Left Controls & Checklists (4 cols) */}
                  <div className="md:col-span-4 flex flex-col gap-4">
                    <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-4 flex flex-col gap-3">
                      <span className="text-[10px] font-mono uppercase text-[#71717A] font-bold border-b border-[#27272A] pb-1.5 flex items-center gap-1.5">
                        <CheckSquare className="w-4 h-4 text-[#10B981]" /> Clinical Action Plan Checklist
                      </span>

                      <div className="flex flex-col gap-2 font-mono text-xs text-[#A1A1AA]">
                        <label className="flex items-start gap-2.5 cursor-pointer p-1.5 hover:bg-[#18181B]/40 rounded-lg transition-all">
                          <input
                            type="checkbox"
                            checked={dossierChecklist.audit}
                            onChange={() => handleToggleChecklist("audit")}
                            className="mt-0.5 rounded border-gray-300 text-[#22D3EE] focus:ring-[#22D3EE] accent-[#22D3EE]"
                          />
                          <div>
                            <span className="font-bold text-white block">Cohort EHR Audit</span>
                            <span className="text-[10px] text-[#71717A]">Extract patient roster matching gene</span>
                          </div>
                        </label>

                        <label className="flex items-start gap-2.5 cursor-pointer p-1.5 hover:bg-[#18181B]/40 rounded-lg transition-all">
                          <input
                            type="checkbox"
                            checked={dossierChecklist.counseling}
                            onChange={() => handleToggleChecklist("counseling")}
                            className="mt-0.5 rounded border-gray-300 text-[#22D3EE] focus:ring-[#22D3EE] accent-[#22D3EE]"
                          />
                          <div>
                            <span className="font-bold text-white block">Brief Genetic Counselor</span>
                            <span className="text-[10px] text-[#71717A]">Review clinical implications</span>
                          </div>
                        </label>

                        <label className="flex items-start gap-2.5 cursor-pointer p-1.5 hover:bg-[#18181B]/40 rounded-lg transition-all">
                          <input
                            type="checkbox"
                            checked={dossierChecklist.cascade}
                            onChange={() => handleToggleChecklist("cascade")}
                            className="mt-0.5 rounded border-gray-300 text-[#22D3EE] focus:ring-[#22D3EE] accent-[#22D3EE]"
                          />
                          <div>
                            <span className="font-bold text-white block">Cascade Letters</span>
                            <span className="text-[10px] text-[#71717A]">Prepare screening invitations for kin</span>
                          </div>
                        </label>

                        <label className="flex items-start gap-2.5 cursor-pointer p-1.5 hover:bg-[#18181B]/40 rounded-lg transition-all">
                          <input
                            type="checkbox"
                            checked={dossierChecklist.pathology}
                            onChange={() => handleToggleChecklist("pathology")}
                            className="mt-0.5 rounded border-gray-300 text-[#22D3EE] focus:ring-[#22D3EE] accent-[#22D3EE]"
                          />
                          <div>
                            <span className="font-bold text-white block">EHR Diagnostic Update</span>
                            <span className="text-[10px] text-[#71717A]">Update clinical reporting signatures</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-4 flex flex-col gap-3">
                      <span className="text-[10px] font-mono uppercase text-[#71717A] font-bold border-b border-[#27272A] pb-1.5">
                        Customize Letters
                      </span>

                      <div className="flex flex-col gap-3 text-xs font-mono">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-[#71717A] uppercase">Target Patient Name</label>
                          <input
                            type="text"
                            value={customPatientName}
                            onChange={(e) => setCustomPatientName(e.target.value)}
                            className="bg-[#18181B] border border-[#27272A] text-xs px-2 py-1 rounded-lg text-white font-mono focus:outline-none focus:border-[#22D3EE]"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-[#71717A] uppercase">Ordering Physician Name</label>
                          <input
                            type="text"
                            value={customPhysicianName}
                            onChange={(e) => setCustomPhysicianName(e.target.value)}
                            className="bg-[#18181B] border border-[#27272A] text-xs px-2 py-1 rounded-lg text-white font-mono focus:outline-none focus:border-[#22D3EE]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Preview Letter Box (8 cols) */}
                  <div className="md:col-span-8 flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-[#27272A] pb-2 text-[10px] font-mono">
                      <span className="text-[#71717A] uppercase font-bold">Surveillance Impact Letter Workspace</span>
                      <div className="flex items-center gap-1.5 bg-[#09090B] p-0.5 rounded-lg border border-[#27272A]">
                        <button
                          type="button"
                          onClick={() => setRecontactLetterType("PATIENT")}
                          className={`px-2.5 py-1 rounded-md transition-all font-bold ${
                            recontactLetterType === "PATIENT" ? "bg-[#27272A] text-[#22D3EE]" : "text-[#71717A] hover:text-white"
                          }`}
                        >
                          Patient Letter
                        </button>
                        <button
                          type="button"
                          onClick={() => setRecontactLetterType("PHYSICIAN")}
                          className={`px-2.5 py-1 rounded-md transition-all font-bold ${
                            recontactLetterType === "PHYSICIAN" ? "bg-[#27272A] text-[#22D3EE]" : "text-[#71717A] hover:text-white"
                          }`}
                        >
                          Physician Alert
                        </button>
                        <button
                          type="button"
                          onClick={() => setRecontactLetterType("AUDIT")}
                          className={`px-2.5 py-1 rounded-md transition-all font-bold ${
                            recontactLetterType === "AUDIT" ? "bg-[#27272A] text-[#22D3EE]" : "text-[#71717A] hover:text-white"
                          }`}
                        >
                          Internal Audit
                        </button>
                      </div>
                    </div>

                    <div className="relative">
                      <textarea
                        value={customLetters[`${selectedVar.id}_${recontactLetterType}`] || letterTemplates[recontactLetterType]}
                        onChange={(e) => {
                          const letterKey = `${selectedVar.id}_${recontactLetterType}`;
                          setCustomLetters(prev => ({
                            ...prev,
                            [letterKey]: e.target.value
                          }));
                        }}
                        rows={11}
                        className="w-full bg-[#09090B] border border-[#27272A] p-4 pt-12 rounded-xl text-[11px] text-[#A1A1AA] font-mono focus:outline-none resize-none leading-relaxed"
                      />

                      <div className="absolute right-3 top-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleEnhanceLetter}
                          disabled={isLetterEnhancing}
                          className="bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] disabled:border-[#27272A] disabled:opacity-50 text-[#F59E0B] px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all"
                        >
                          <Sparkles className={`w-3.5 h-3.5 ${isLetterEnhancing ? "animate-spin" : ""}`} />
                          {isLetterEnhancing ? "Refining..." : "✨ Optimize with AI"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyDossier(customLetters[`${selectedVar.id}_${recontactLetterType}`] || letterTemplates[recontactLetterType])}
                          className="bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#22D3EE] px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all"
                        >
                          <Copy className="w-3.5 h-3.5" /> Copy Document
                        </button>
                      </div>
                    </div>

                    <p className="text-[10px] text-[#71717A] leading-normal font-mono">
                      Surveillance tracking saves lives: This dashboard has screened and flagged <strong className="text-white font-mono">{pat.contactedCount}</strong> patients for recontact. Action Taken: <strong className="text-[#22D3EE] font-mono">{pat.actionTaken.replace(/_/g, " ")}</strong>. Screened <strong className="text-[#10B981] font-mono">{pat.cascadeTestedRelatives}</strong> cascade relatives.
                    </p>
                  </div>

                </div>
              )}

              {/* Pillar 7: AI Clinical Consultant */}
              {activeDossierTab === "AI_CONSULT" && (
                <div className="lg:col-span-12 flex flex-col gap-4">
                  
                  {/* AI Co-Pilot Header Panel */}
                  <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-5 flex flex-col md:flex-row gap-5 items-center justify-between">
                    <div className="flex flex-col gap-2 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20 px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono uppercase flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-[#F59E0B] animate-pulse" /> Gemini 3.7-Flash Cognitive Engine
                        </span>
                        <span className="text-xs text-[#71717A] font-mono">ACMG 2026 AI CO-PILOT</span>
                      </div>
                      <h5 className="text-sm font-bold text-white">Interactive AI Clinical Advisory Desk</h5>
                      <p className="text-xs text-[#A1A1AA] leading-relaxed">
                        Access real-time automated literature synthesis, molecular mechanism modeling, and custom evidence aggregation. VariantWatch uses advanced server-side intelligence to help resolve complex clinical reclassification conflicts.
                      </p>
                    </div>

                    <div className="bg-[#18181B] border border-[#27272A] p-4 rounded-xl min-w-[200px] flex flex-col items-center gap-1 self-stretch md:self-auto justify-center">
                      <span className="text-[9px] font-mono text-[#71717A] uppercase font-bold">Consultation Status</span>
                      <span className={`text-sm font-bold font-mono ${isConsultLoading ? "text-[#F59E0B] animate-pulse" : aiConsultResult ? "text-[#10B981]" : "text-[#71717A]"}`}>
                        {isConsultLoading ? "GENERATING ANALYSIS..." : aiConsultResult ? "READY" : "AWAITING QUESTION"}
                      </span>
                      {aiConsultMode && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold font-mono mt-1 ${
                          aiConsultMode === "LIVE" ? "bg-[#10B981]/15 text-[#10B981]" : "bg-[#F59E0B]/15 text-[#F59E0B]"
                        }`}>
                          {aiConsultMode === "LIVE" ? "⚡ LIVE RESEARCH" : "⚙ OFFLINE FALLBACK"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Query & Recommendations Area */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                    
                    {/* Left: Input Desk (5 cols) */}
                    <div className="md:col-span-5 flex flex-col gap-3.5">
                      <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-4 flex flex-col gap-3">
                        <span className="text-[10px] font-mono uppercase text-[#71717A] font-bold border-b border-[#27272A] pb-1.5">
                          Select Analytical Blueprint
                        </span>

                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => setAiQuestion("Synthesize molecular pathogenesis, ACMG criteria shifts, and clinical recommendations for this variant.")}
                            className={`text-left p-2.5 rounded-lg border text-[11px] leading-snug transition-all ${
                              aiQuestion === "Synthesize molecular pathogenesis, ACMG criteria shifts, and clinical recommendations for this variant."
                                ? "bg-[#22D3EE]/10 border-[#22D3EE]/30 text-white font-bold"
                                : "bg-[#18181B]/40 border-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-[#18181B]"
                            }`}
                          >
                            <span className="text-[#F59E0B] font-bold block mb-0.5 font-mono">1. Standard Molecular Curation</span>
                            Pathogenesis, functional assay summaries, and risk factors.
                          </button>

                          <button
                            type="button"
                            onClick={() => setAiQuestion("Analyze ClinVar laboratory submission conflicts. Detail the conflicting classifications, submitter history, and recency weighting to resolve the dispute.")}
                            className={`text-left p-2.5 rounded-lg border text-[11px] leading-snug transition-all ${
                              aiQuestion === "Analyze ClinVar laboratory submission conflicts. Detail the conflicting classifications, submitter history, and recency weighting to resolve the dispute."
                                ? "bg-[#22D3EE]/10 border-[#22D3EE]/30 text-white font-bold"
                                : "bg-[#18181B]/40 border-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-[#18181B]"
                            }`}
                          >
                            <span className="text-[#A855F7] font-bold block mb-0.5 font-mono">2. Disagreement & Conflict Audit</span>
                            Analyze why laboratories disagree and how ClinvArbitration scores weight them.
                          </button>

                          <button
                            type="button"
                            onClick={() => setAiQuestion("Draft a comprehensive genetic counseling talking-points outline for clinicians explaining this classification change, including disease penetrance and family screening advice.")}
                            className={`text-left p-2.5 rounded-lg border text-[11px] leading-snug transition-all ${
                              aiQuestion === "Draft a comprehensive genetic counseling talking-points outline for clinicians explaining this classification change, including disease penetrance and family screening advice."
                                ? "bg-[#22D3EE]/10 border-[#22D3EE]/30 text-white font-bold"
                                : "bg-[#18181B]/40 border-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-[#18181B]"
                            }`}
                          >
                            <span className="text-[#10B981] font-bold block mb-0.5 font-mono">3. Genetic Counseling Blueprint</span>
                            Actionable speaking scripts and family risk advisory points.
                          </button>
                        </div>
                      </div>

                      <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-4 flex flex-col gap-2">
                        <label className="text-[10px] font-mono uppercase text-[#71717A] font-bold">Custom Clinical Inquiry</label>
                        <textarea
                          value={aiQuestion}
                          onChange={(e) => setAiQuestion(e.target.value)}
                          rows={4}
                          placeholder="Type clinical question regarding this variant's reclassification details, functional assays, or ACMG rule mappings..."
                          className="w-full bg-[#18181B] border border-[#27272A] p-3 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-[#22D3EE] leading-relaxed resize-none"
                        />

                        <button
                          type="button"
                          onClick={handleAiConsult}
                          disabled={isConsultLoading || !aiQuestion.trim()}
                          className="w-full bg-[#F59E0B] hover:bg-[#D97706] disabled:bg-[#27272A] disabled:text-[#71717A] text-black font-mono font-bold text-xs py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 mt-1.5"
                        >
                          {isConsultLoading ? (
                            <>
                              <RefreshCcw className="w-4 h-4 animate-spin" /> Synthesizing Analysis...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 text-black animate-pulse" /> Query AI Advisor
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Right: Output Workspace (7 cols) */}
                    <div className="md:col-span-7 flex flex-col gap-3 min-h-[350px]">
                      <div className="flex items-center justify-between border-b border-[#27272A] pb-2 text-[10px] font-mono">
                        <span className="text-[#71717A] uppercase font-bold">Surveillance Analysis Report</span>
                        {aiConsultResult && (
                          <button
                            type="button"
                            onClick={() => handleCopyDossier(aiConsultResult)}
                            className="bg-[#09090B] hover:bg-[#18181B] border border-[#27272A] text-[#22D3EE] px-2 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 transition-all"
                          >
                            <Copy className="w-3 h-3" /> Copy Output
                          </button>
                        )}
                      </div>

                      <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-5 flex-1 overflow-y-auto max-h-[420px] scrollbar-thin scrollbar-thumb-[#27272A]">
                        {isConsultLoading ? (
                          <div className="h-full flex flex-col items-center justify-center gap-4 py-12 text-center">
                            <div className="relative flex items-center justify-center">
                              <div className="w-12 h-12 rounded-full border-4 border-[#F59E0B]/20 border-t-[#F59E0B] animate-spin" />
                              <Sparkles className="w-5 h-5 text-[#F59E0B] absolute animate-pulse" />
                            </div>
                            <div className="flex flex-col gap-1 font-mono">
                              <span className="text-xs text-white font-bold">CRITICAL COGNITIVE SYNTHESIS ENGAGED</span>
                              <span className="text-[10px] text-[#A1A1AA] animate-pulse">Querying PubMed indices, aggregation servers & ACMG structures...</span>
                            </div>
                          </div>
                        ) : aiConsultResult ? (
                          <div className="space-y-2 text-xs leading-relaxed text-white">
                            {(() => {
                              const text = aiConsultResult;
                              return text.split("\n").map((line, index) => {
                                const trimmed = line.trim();
                                if (trimmed.startsWith("###")) {
                                  return <h5 key={index} className="text-xs font-bold text-[#F59E0B] mt-4 mb-2 font-mono flex items-center gap-1.5 border-b border-[#27272A] pb-1"><Sparkles className="w-3 h-3 text-[#F59E0B]" /> {trimmed.substring(3).trim()}</h5>;
                                }
                                if (trimmed.startsWith("##")) {
                                  return <h4 key={index} className="text-sm font-black text-white mt-5 mb-2 font-mono border-b border-[#F59E0B]/30 pb-1 uppercase tracking-wider">{trimmed.substring(2).trim()}</h4>;
                                }
                                if (trimmed.startsWith("#")) {
                                  return <h3 key={index} className="text-base font-black text-[#22D3EE] mt-6 mb-3 font-mono uppercase tracking-widest">{trimmed.substring(1).trim()}</h3>;
                                }
                                if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
                                  return <p key={index} className="text-xs font-bold text-[#22D3EE] mt-2 mb-1">{trimmed.split("**").join("")}</p>;
                                }
                                if (trimmed.startsWith("-") || trimmed.startsWith("•")) {
                                  const raw = trimmed.substring(1).trim();
                                  const match = raw.match(/^\*\*(.*?)\*\*(.*)$/);
                                  if (match) {
                                    return (
                                      <li key={index} className="text-[11px] text-[#A1A1AA] ml-4 list-disc leading-relaxed my-1">
                                        <strong className="text-white font-mono">{match[1]}</strong>{match[2]}
                                      </li>
                                    );
                                  }
                                  return <li key={index} className="text-[11px] text-[#A1A1AA] ml-4 list-disc leading-relaxed my-1">{raw}</li>;
                                }
                                if (trimmed.match(/^\d+\./)) {
                                  const raw = trimmed.replace(/^\d+\./, "").trim();
                                  const match = raw.match(/^\*\*(.*?)\*\*(.*)$/);
                                  const num = trimmed.match(/^\d+/)?.[0] || "1";
                                  if (match) {
                                    return (
                                      <div key={index} className="flex gap-2 text-[11px] text-[#A1A1AA] ml-2 leading-relaxed my-1.5 font-mono">
                                        <span className="text-[#22D3EE] font-bold">{num}.</span>
                                        <div>
                                          <strong className="text-white font-mono">{match[1]}</strong>{match[2]}
                                        </div>
                                      </div>
                                    );
                                  }
                                  return (
                                    <div key={index} className="flex gap-2 text-[11px] text-[#A1A1AA] ml-2 leading-relaxed my-1.5 font-mono">
                                      <span className="text-[#22D3EE] font-bold">{num}.</span>
                                      <span>{raw}</span>
                                    </div>
                                  );
                                }
                                if (trimmed === "") return <div key={index} className="h-2" />;
                                
                                const parts = line.split(/(\*\*.*?\*\*)/g);
                                return (
                                  <p key={index} className="text-[11px] text-[#A1A1AA] leading-relaxed my-1">
                                    {parts.map((part, pIdx) => {
                                      if (part.startsWith("**") && part.endsWith("**")) {
                                        return <strong key={pIdx} className="text-white font-mono">{part.split("**").join("")}</strong>;
                                      }
                                      return part;
                                    })}
                                  </p>
                                );
                              });
                            })()}
                          </div>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-center py-12 text-[#71717A] gap-2">
                            <Sparkles className="w-8 h-8 text-[#27272A]" />
                            <p className="text-xs font-mono uppercase font-bold">No Analysis Generated Yet</p>
                            <p className="text-[10px] max-w-xs text-[#52525B]">Select a preset blueprint on the left or enter a custom clinical inquiry, then click &quot;Query AI Advisor&quot;.</p>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                </div>
              )}

            </div>
          </div>
        );
      })()}

      {/* COMPLIANCE REPORT CUSTOMIZATION & DOWNLOAD BLOCK */}
      <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-6 flex flex-col gap-5">
        <div className="flex items-center gap-2 border-b border-[#27272A] pb-3">
          <FileText className="w-5 h-5 text-[#22D3EE]" />
          <div>
            <h4 className="text-sm font-bold text-white">Clinical Compliance & Patient Recontact Report</h4>
            <p className="text-[11px] text-[#A1A1AA]">
              Generate a formatted lab-certified document detailing variant classification drift outcomes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Customization controls */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-[#71717A] uppercase font-bold">Reporting Institution</label>
              <input
                type="text"
                value={labName}
                onChange={(e) => setLabName(e.target.value)}
                className="bg-[#09090B] border border-[#27272A] text-xs px-2.5 py-1.5 rounded-lg text-white font-mono focus:outline-none focus:border-[#22D3EE]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-[#71717A] uppercase font-bold">Lab Director / Authorizing Agent</label>
              <input
                type="text"
                value={directorName}
                onChange={(e) => setDirectorName(e.target.value)}
                className="bg-[#09090B] border border-[#27272A] text-xs px-2.5 py-1.5 rounded-lg text-white font-mono focus:outline-none focus:border-[#22D3EE]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-[#71717A] uppercase font-bold">Clinical Interpretation Caveats</label>
              <textarea
                value={reportNotes}
                onChange={(e) => setReportNotes(e.target.value)}
                rows={3}
                className="bg-[#09090B] border border-[#27272A] text-xs px-2.5 py-1.5 rounded-lg text-white font-mono focus:outline-none focus:border-[#22D3EE] resize-none"
              />
            </div>
          </div>

          {/* Live Preview & Download button */}
          <div className="bg-[#09090B] border border-[#27272A] p-4 rounded-xl flex flex-col justify-between">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-[10px] text-[#71717A]">
                <span>LIVE REPORT METADATA PREVIEW</span>
                <span className="text-[#22D3EE] font-bold">ACMG 2026 AUDIT COMPLIANT</span>
              </div>
              <div className="font-mono text-[9px] text-[#A1A1AA] border border-[#27272A] bg-[#18181B]/40 p-3 rounded-lg overflow-hidden max-h-[140px] leading-relaxed whitespace-pre">
                {getReportText().substring(0, 320)}... [truncated preview]
              </div>
            </div>

            <button
              onClick={handleDownloadReport}
              className="mt-4 bg-[#22D3EE] hover:bg-[#06B6D4] text-[#083344] font-mono text-xs font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> Export Pathology Surveillance Report (TXT)
            </button>
          </div>

        </div>
      </div>

      {/* CLINICAL STANDALONE PYPI DOWNLOAD FOR CITIZEN SCIENTISTS */}
      <div className="border border-[#F59E0B]/30 bg-[#F59E0B]/5 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Dna className="w-6 h-6 text-[#F59E0B]" />
          <div>
            <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
              Download variantwatch Python CLI (Local-First Tool)
            </h4>
            <p className="text-[11px] text-[#A1A1AA]">
              Includes E-utilities ClinVar queries, automated SQLite schema, and PDF summary generators.
            </p>
          </div>
        </div>

        <a
          href="/agent/v1/download/variantwatch"
          download="variantwatch_cli.py"
          className="bg-[#F59E0B]/10 text-[#F59E0B] hover:bg-[#F59E0B]/20 border border-[#F59E0B]/30 px-4 py-2 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 transition-all self-stretch md:self-auto justify-center"
        >
          <Download className="w-4 h-4" /> Download variantwatch_cli.py
        </a>
      </div>

        </>
      ) : (
        <VariantWatchPipelineHub />
      )}

    </div>
  );
}
