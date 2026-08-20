import { useState } from "react";
import { VariantWatch } from "./VariantWatch";
import { 
  TrendingUp, 
  Dna, 
  GitBranch, 
  Activity, 
  ShieldAlert, 
  Sparkles, 
  Sliders, 
  Search, 
  Award, 
  Network, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  Layers, 
  Filter, 
  Database, 
  RefreshCcw, 
  FileText,
  Zap,
  ArrowRight
} from "lucide-react";

// ==========================================
// TYPES & DATA STRUCTURES FOR 5 CAPABILITIES
// ==========================================

export type TrajectoryTab = 
  | "patient_trajectory" 
  | "variant_interpretation" 
  | "variant_watch"
  | "pathway_analysis" 
  | "therapy_recommendation" 
  | "conflict_explorer";

interface VariantRecord {
  gene: string;
  hgvs: string;
  variantType: string;
  af: number; // Allele frequency %
  tier: "Tier I (Actionable)" | "Tier II (Potential Impact)" | "Tier III (Unknown Significance)" | "Tier IV (Benign)";
  acmgClassification: "Pathogenic" | "Likely Pathogenic" | "VUS" | "Likely Benign";
  evidenceCode: string[];
  conflictStatus: boolean;
  conflictDetails?: string;
  clinvarId: string;
  fdaApprovedDrugs: string[];
}

interface PathwayRecord {
  id: string;
  name: string;
  category: string;
  dysregulationScore: number; // 0 to 100
  alteredGenes: string[];
  keyDrivers: string[];
  cohortEnrichmentP: number;
  therapeuticTarget: string;
}

interface TherapyOption {
  rank: number;
  drugName: string;
  mechanism: string;
  predictedEfficacy: number; // %
  evidenceLevel: "Level A (FDA/NCCN)" | "Level B (Clinical Trials)" | "Level C (Off-label/Preclinical)";
  targetVariant: string;
  nctTrialId: string;
  toxicityRisk: "Low" | "Moderate" | "High";
  biomarkerMatch: string;
}

interface ConflictRecord {
  id: string;
  topic: string;
  category: "Variant Pathogenicity" | "Drug Sensitivity" | "Biomarker Cutoff" | "Mechanism of Action";
  submitterA: string;
  assertionA: string;
  submitterB: string;
  assertionB: string;
  impactScore: "High" | "Critical" | "Moderate";
  researchOpportunity: string;
  status: "Open Conflict" | "Under Review" | "Consensus Pending";
  votesA: number;
  votesB: number;
}

// Sample Patient Variants
const variantList: VariantRecord[] = [
  {
    gene: "EGFR",
    hgvs: "c.2369C>T (p.Thr790Met)",
    variantType: "Missense / Gatekeeper Resistance",
    af: 34.2,
    tier: "Tier I (Actionable)",
    acmgClassification: "Pathogenic",
    evidenceCode: ["PS1", "PS3", "PM2", "PP3"],
    conflictStatus: false,
    clinvarId: "RCV000142891",
    fdaApprovedDrugs: ["Osimertinib", "Amivantamab + Lazertinib"]
  },
  {
    gene: "EGFR",
    hgvs: "c.2389G>A (p.Cys797Ser)",
    variantType: "Missense / 3rd-Gen TKI Resistance",
    af: 18.5,
    tier: "Tier I (Actionable)",
    acmgClassification: "Pathogenic",
    evidenceCode: ["PS1", "PS2", "PM1"],
    conflictStatus: true,
    conflictDetails: "Conflicting evidence regarding cis vs. trans orientation with T790M affecting 4th-gen TKI response.",
    clinvarId: "RCV000621490",
    fdaApprovedDrugs: ["BLU-945 (Trial)", "EAI045 (Preclinical)"]
  },
  {
    gene: "TP53",
    hgvs: "c.524G>A (p.Arg175His)",
    variantType: "Missense / DNA Binding Domain",
    af: 68.4,
    tier: "Tier II (Potential Impact)",
    acmgClassification: "Pathogenic",
    evidenceCode: ["PVS1_Strong", "PS3", "PM2"],
    conflictStatus: false,
    clinvarId: "RCV000012890",
    fdaApprovedDrugs: ["APR-246 (Eprenetapopt Trial)", "Atezolizumab (Immuno-Onc)"]
  },
  {
    gene: "MET",
    hgvs: "Amplification (CN = 12)",
    variantType: "Copy Number Gain",
    af: 0.0,
    tier: "Tier I (Actionable)",
    acmgClassification: "Pathogenic",
    evidenceCode: ["PS3", "PM1"],
    conflictStatus: true,
    conflictDetails: "Varying FISH vs. NGS copy number cutoff thresholds (CN>=6 vs CN>=10) across NCCN guidelines.",
    clinvarId: "RCV000801290",
    fdaApprovedDrugs: ["Capmatinib", "Tepotinib", "Savolitinib"]
  },
  {
    gene: "PIK3CA",
    hgvs: "c.1633G>A (p.Glu545Lys)",
    variantType: "Missense / Helical Domain",
    af: 12.1,
    tier: "Tier II (Potential Impact)",
    acmgClassification: "Pathogenic",
    evidenceCode: ["PS1", "PM2", "PP2"],
    conflictStatus: false,
    clinvarId: "RCV000013892",
    fdaApprovedDrugs: ["Alpelisib", "Inavolisib"]
  }
];

// Sample Pathway Records
const pathwayList: PathwayRecord[] = [
  {
    id: "path-1",
    name: "RTK / RAS / MAPK Signaling",
    category: "Oncogenic Growth & Proliferation",
    dysregulationScore: 92,
    alteredGenes: ["EGFR", "KRAS", "BRAF", "MET"],
    keyDrivers: ["EGFR T790M", "MET Amplification"],
    cohortEnrichmentP: 0.0001,
    therapeuticTarget: "Dual EGFR / MET Inhibition"
  },
  {
    id: "path-2",
    name: "PI3K / AKT / mTOR Axis",
    category: "Cell Survival & Metabolism",
    dysregulationScore: 78,
    alteredGenes: ["PIK3CA", "PTEN", "AKT1"],
    keyDrivers: ["PIK3CA E545K"],
    cohortEnrichmentP: 0.0024,
    therapeuticTarget: "PI3K-alpha Selective Inhibitor"
  },
  {
    id: "path-3",
    name: "p53 & Cell Cycle Checkpoints",
    category: "Genome Integrity & Apoptosis",
    dysregulationScore: 85,
    alteredGenes: ["TP53", "CDKN2A", "CCND1"],
    keyDrivers: ["TP53 R175H"],
    cohortEnrichmentP: 0.0008,
    therapeuticTarget: "CDK4/6 Inhibitor + p53 Reactivator"
  },
  {
    id: "path-4",
    name: "Homologous Recombination Repair (HRR)",
    category: "DNA Damage Response",
    dysregulationScore: 42,
    alteredGenes: ["ATM", "BRCA2"],
    keyDrivers: ["ATM In-frame Deletion"],
    cohortEnrichmentP: 0.0410,
    therapeuticTarget: "PARP Inhibitors (Olaparib)"
  }
];

// Sample Therapy Recommendations
const therapyList: TherapyOption[] = [
  {
    rank: 1,
    drugName: "Osimertinib + Savolitinib",
    mechanism: "3rd-Gen EGFR TKI + MET Tyrosine Kinase Inhibitor",
    predictedEfficacy: 91,
    evidenceLevel: "Level A (FDA/NCCN)",
    targetVariant: "EGFR T790M + MET Amplification",
    nctTrialId: "NCT03778229 (SAVANNAH Trial)",
    toxicityRisk: "Moderate",
    biomarkerMatch: "EGFR T790M (+) / MET CN=12"
  },
  {
    rank: 2,
    drugName: "Amivantamab + Lazertinib",
    mechanism: "Bispecific EGFR/MET Antibody + 3rd-Gen EGFR TKI",
    predictedEfficacy: 86,
    evidenceLevel: "Level A (FDA/NCCN)",
    targetVariant: "EGFR C797S / T790M Resistance",
    nctTrialId: "NCT04077463 (MARIPOSA-2)",
    toxicityRisk: "Moderate",
    biomarkerMatch: "Exon 19del / T790M / C797S"
  },
  {
    rank: 3,
    drugName: "Inavolisib + Fulvestrant",
    mechanism: "PI3K-alpha Selective Inhibitor + SERD",
    predictedEfficacy: 72,
    evidenceLevel: "Level B (Clinical Trials)",
    targetVariant: "PIK3CA E545K",
    nctTrialId: "NCT04191499 (INAVO120)",
    toxicityRisk: "Low",
    biomarkerMatch: "PIK3CA Helical Domain Mutation"
  },
  {
    rank: 4,
    drugName: "Eprenetapopt (APR-246) + Pembrolizumab",
    mechanism: "p53 Conformation Reactivator + PD-1 Checkpoint Blockade",
    predictedEfficacy: 58,
    evidenceLevel: "Level C (Off-label/Preclinical)",
    targetVariant: "TP53 R175H",
    nctTrialId: "NCT04419389",
    toxicityRisk: "High",
    biomarkerMatch: "TP53 Mis-sense Structural Mutation"
  }
];

// Sample Conflict Explorer Database
const conflictList: ConflictRecord[] = [
  {
    id: "CONF-101",
    topic: "EGFR C797S Cis vs. Trans Orientation with T790M",
    category: "Mechanism of Action",
    submitterA: "Memorial Sloan Kettering (MSK)",
    assertionA: "Cis-orientation confers complete resistance to Osimertinib and requires Amivantamab + Chemotherapy.",
    submitterB: "Dana-Farber Cancer Institute (DFCI)",
    assertionB: "Trans-orientation maintains sensitivity to combination 1st-Gen + 3rd-Gen TKI therapy.",
    impactScore: "Critical",
    researchOpportunity: "Requires single-molecule long-read phased DNA sequencing (PacBio / Nanopore) to resolve phasing.",
    status: "Open Conflict",
    votesA: 142,
    votesB: 128
  },
  {
    id: "CONF-102",
    topic: "MET Amplification NGS Copy Number Cutoff for TKI Response",
    category: "Biomarker Cutoff",
    submitterA: "NCCN Non-Small Cell Lung Cancer Panel",
    assertionA: "Gene Copy Number (GCN) >= 6 by NGS is sufficient to predict Capmatinib response.",
    submitterB: "European Society for Medical Oncology (ESMO)",
    assertionB: "MET/CEP7 ratio >= 2.0 by FISH or GCN >= 10 is mandatory due to false-positive focal gains.",
    impactScore: "High",
    researchOpportunity: "High-throughput FISH vs. ctDNA plasma copy number concordance trial in MET-driven post-TKI progression.",
    status: "Consensus Pending",
    votesA: 98,
    votesB: 114
  },
  {
    id: "CONF-103",
    topic: "TP53 R175H Immunogenicity & Neoantigen Presentation",
    category: "Variant Pathogenicity",
    submitterA: "NCI Center for Cancer Research",
    assertionA: "TP53 R175H presents a public neoantigen bound to HLA-A*02:01 suitable for TCR-engineered T cell therapy.",
    submitterB: "MD Anderson Cancer Center",
    assertionB: "Endogenous antigen presentation is insufficient due to proteasomal degradation kinetics.",
    impactScore: "High",
    researchOpportunity: "Mass spectrometry immunopeptidomics validation across organoid disease models.",
    status: "Under Review",
    votesA: 87,
    votesB: 91
  }
];

export function PatientTrajectoryExplorer() {
  const [activeTab, setActiveTab] = useState<TrajectoryTab>("patient_trajectory");
  
  // Trajectory Simulation Controls
  const [selectedTherapySequence, setSelectedTherapySequence] = useState<string[]>([
    "Line 1: Osimertinib (TKI)",
    "Line 2: Amivantamab + Savolitinib",
    "Line 3: ADC + Met Inhibitor"
  ]);
  const [simulationTimeMonths, setSimulationTimeMonths] = useState<number>(24);

  // Variant Interpretation Controls
  const [selectedVariant, setSelectedVariant] = useState<VariantRecord>(variantList[0]);

  // Conflict Explorer State
  const [conflicts, setConflicts] = useState<ConflictRecord[]>(conflictList);
  const [userVotes, setUserVotes] = useState<Record<string, "A" | "B" | null>>({});
  const [aiSynthesisLoading, setAiSynthesisLoading] = useState<Record<string, boolean>>({});
  const [aiSynthesisResults, setAiSynthesisResults] = useState<Record<string, string>>({});

  // New Therapy Addition State
  const [newTherapyInput, setNewTherapyInput] = useState<string>("");

  const handleAddTherapyLine = () => {
    if (!newTherapyInput.trim()) return;
    const nextLineNum = selectedTherapySequence.length + 1;
    setSelectedTherapySequence((prev) => [...prev, `Line ${nextLineNum}: ${newTherapyInput.trim()}`]);
    setNewTherapyInput("");
  };

  const handleRemoveTherapyLine = (idx: number) => {
    if (selectedTherapySequence.length <= 1) return;
    setSelectedTherapySequence((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSynthesizeConflictWithAI = async (conflict: ConflictRecord) => {
    setAiSynthesisLoading((prev) => ({ ...prev, [conflict.id]: true }));
    try {
      const response = await fetch("/agent/v1/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `You are a molecular oncologist & transplant bioinformatician. Synthesize the scientific conflict for "${conflict.topic}". 
          Submitter A (${conflict.submitterA}): ${conflict.assertionA}.
          Submitter B (${conflict.submitterB}): ${conflict.assertionB}.
          Provide a 3-bullet concise summary: (1) Pathophysiologic rationale, (2) Clinical trial evidence weight, (3) Recommended diagnostic/experimental resolution.`
        })
      });
      const data = await response.json();
      setAiSynthesisResults((prev) => ({
        ...prev,
        [conflict.id]: data.response || "AI synthesis completed."
      }));
    } catch (err) {
      setAiSynthesisResults((prev) => ({
        ...prev,
        [conflict.id]: "Error connecting to Gemini AI reasoning engine."
      }));
    } finally {
      setAiSynthesisLoading((prev) => ({ ...prev, [conflict.id]: false }));
    }
  };

  const handleVote = (conflictId: string, choice: "A" | "B") => {
    setConflicts((prev) =>
      prev.map((c) => {
        if (c.id === conflictId) {
          const isA = choice === "A";
          return {
            ...c,
            votesA: isA ? c.votesA + 1 : c.votesA,
            votesB: !isA ? c.votesB + 1 : c.votesB
          };
        }
        return c;
      })
    );
    setUserVotes((prev) => ({ ...prev, [conflictId]: choice }));
  };

  // Calculations for Trajectory
  const predictedPfsMonths = Math.round(18.4 + (selectedTherapySequence.length * 4.2));
  const estimatedTumorBurden = Math.max(12, Math.round(85 - (simulationTimeMonths * 2.1) + (simulationTimeMonths > 14 ? (simulationTimeMonths - 14) * 4.5 : 0)));

  return (
    <div className="bg-[#09090B] border border-[#27272A] rounded-2xl p-6 flex flex-col gap-6 text-[#FAFAFA]">
      
      {/* Header & Capability Selector Tabs */}
      <div className="flex flex-col gap-4 border-b border-[#27272A] pb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#22D3EE]/10 border border-[#22D3EE]/30 flex items-center justify-center text-[#22D3EE]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#FAFAFA]">
                Clinical Precision Decision & Patient Trajectory Suite
              </h2>
              <p className="text-xs text-[#A1A1AA]">
                Multi-dimensional cancer evolution modeling, variant rules, pathway impact, ranked therapies, and conflict exploration.
              </p>
            </div>
          </div>

          <span className="text-[10px] font-mono bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 self-start md:self-auto">
            <Sparkles className="w-3.5 h-3.5" /> CLINICAL DECISION ENGINE v2.5
          </span>
        </div>

        {/* 5 Core Feature Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button
            onClick={() => setActiveTab("patient_trajectory")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-mono text-xs font-bold transition-all ${
              activeTab === "patient_trajectory"
                ? "bg-[#22D3EE] text-[#083344] shadow-md shadow-[#22D3EE]/20"
                : "bg-[#18181B] text-[#A1A1AA] border border-[#27272A] hover:bg-[#27272A] hover:text-[#FAFAFA]"
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            1. Patient Trajectory
          </button>

          <button
            onClick={() => setActiveTab("variant_interpretation")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-mono text-xs font-bold transition-all ${
              activeTab === "variant_interpretation"
                ? "bg-[#10B981] text-[#022C22] shadow-md shadow-[#10B981]/20"
                : "bg-[#18181B] text-[#A1A1AA] border border-[#27272A] hover:bg-[#27272A] hover:text-[#FAFAFA]"
            }`}
          >
            <Dna className="w-3.5 h-3.5" />
            2. Variant Interpretation
          </button>

          <button
            onClick={() => setActiveTab("variant_watch")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-mono text-xs font-bold transition-all ${
              activeTab === "variant_watch"
                ? "bg-[#F59E0B] text-[#09090B] shadow-md shadow-[#F59E0B]/20"
                : "bg-[#18181B] text-[#A1A1AA] border border-[#27272A] hover:bg-[#27272A] hover:text-[#FAFAFA]"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            3. VariantWatch Surveillance
          </button>

          <button
            onClick={() => setActiveTab("pathway_analysis")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-mono text-xs font-bold transition-all ${
              activeTab === "pathway_analysis"
                ? "bg-[#8B5CF6] text-[#2E1065] shadow-md shadow-[#8B5CF6]/20"
                : "bg-[#18181B] text-[#A1A1AA] border border-[#27272A] hover:bg-[#27272A] hover:text-[#FAFAFA]"
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            4. Pathway Analysis
          </button>

          <button
            onClick={() => setActiveTab("therapy_recommendation")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-mono text-xs font-bold transition-all ${
              activeTab === "therapy_recommendation"
                ? "bg-[#F59E0B] text-[#451A03] shadow-md shadow-[#F59E0B]/20"
                : "bg-[#18181B] text-[#A1A1AA] border border-[#27272A] hover:bg-[#27272A] hover:text-[#FAFAFA]"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            5. Therapy Recommendation
          </button>

          <button
            onClick={() => setActiveTab("conflict_explorer")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-mono text-xs font-bold transition-all ${
              activeTab === "conflict_explorer"
                ? "bg-[#EC4899] text-[#500724] shadow-md shadow-[#EC4899]/20"
                : "bg-[#18181B] text-[#A1A1AA] border border-[#27272A] hover:bg-[#27272A] hover:text-[#FAFAFA]"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            6. Conflict Explorer
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: PATIENT TRAJECTORY PREDICTION                      */}
      {/* ======================================================== */}
      {activeTab === "patient_trajectory" && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Sequence Builder & Simulation Slider */}
            <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5 flex flex-col gap-5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#FAFAFA]">
                <Sliders className="w-4 h-4 text-[#22D3EE]" />
                Therapy Sequence Setup
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-[11px] text-[#A1A1AA] font-mono">
                  Simulation Timeline ({simulationTimeMonths} Months)
                </label>
                <input
                  type="range"
                  min={6}
                  max={36}
                  step={3}
                  value={simulationTimeMonths}
                  onChange={(e) => setSimulationTimeMonths(Number(e.target.value))}
                  className="w-full accent-[#22D3EE] bg-[#27272A] h-2 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-[#71717A]">
                  <span>6 Months</span>
                  <span>18 Months</span>
                  <span>36 Months</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#A1A1AA] font-mono">Sequential Therapy Line Order</span>
                  <span className="text-[10px] text-[#71717A] font-mono">{selectedTherapySequence.length} Lines</span>
                </div>
                {selectedTherapySequence.map((line, idx) => (
                  <div 
                    key={idx}
                    className="bg-[#09090B] border border-[#27272A] p-2.5 rounded-xl flex items-center justify-between text-xs font-mono gap-2"
                  >
                    <span className="text-[#FAFAFA] font-bold truncate">{line}</span>
                    <div className="flex items-center gap-1 flex-none">
                      <span className="text-[10px] text-[#22D3EE] bg-[#22D3EE]/10 px-2 py-0.5 rounded border border-[#22D3EE]/30">
                        Phase {idx + 1}
                      </span>
                      {selectedTherapySequence.length > 1 && (
                        <button
                          onClick={() => handleRemoveTherapyLine(idx)}
                          className="text-[10px] text-[#EF4444] hover:bg-[#EF4444]/10 px-1.5 py-0.5 rounded font-bold"
                          title="Remove line"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add Custom Therapy Line */}
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    placeholder="Add drug (e.g. Capmatinib + Osimertinib)"
                    value={newTherapyInput}
                    onChange={(e) => setNewTherapyInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddTherapyLine()}
                    className="bg-[#09090B] border border-[#27272A] text-[#FAFAFA] text-xs px-2.5 py-1.5 rounded-xl font-mono focus:outline-none focus:border-[#22D3EE] flex-1"
                  />
                  <button
                    onClick={handleAddTherapyLine}
                    className="bg-[#22D3EE] text-[#083344] font-bold font-mono text-xs px-3 py-1.5 rounded-xl hover:bg-[#06B6D4] transition-all flex-none"
                  >
                    + Add
                  </button>
                </div>
              </div>

              <div className="bg-[#09090B] border border-[#10B981]/30 p-4 rounded-xl flex flex-col gap-2">
                <span className="text-[10px] font-mono text-[#10B981] uppercase font-bold">Model Predictions</span>
                <div className="flex justify-between text-xs">
                  <span className="text-[#A1A1AA]">Predicted PFS:</span>
                  <span className="font-bold text-[#FAFAFA] font-mono">{predictedPfsMonths} Months</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#A1A1AA]">Current Tumor Burden:</span>
                  <span className="font-bold text-[#22D3EE] font-mono">{estimatedTumorBurden}% baseline</span>
                </div>
              </div>
            </div>

            {/* Trajectory Evolution Chart & Clonal Sweeps */}
            <div className="lg:col-span-2 bg-[#18181B] border border-[#27272A] rounded-2xl p-5 flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#FAFAFA]">
                  <Activity className="w-4 h-4 text-[#10B981]" />
                  Clonal Architecture Trajectory Simulation
                </div>
                <span className="text-[10px] font-mono text-[#71717A]">
                  Phylodynamic Sweep Simulator
                </span>
              </div>

              {/* Simulated Clonal Frequency Progression Bars */}
              <div className="flex flex-col gap-4 bg-[#09090B] p-4 rounded-xl border border-[#27272A]">
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#FAFAFA] font-bold">Founder Clone (EGFR L858R / TP53)</span>
                    <span className="text-[#71717A]">{Math.max(5, 100 - simulationTimeMonths * 3)}% CCF</span>
                  </div>
                  <div className="w-full bg-[#27272A] h-3 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#3B82F6] h-full transition-all duration-500" 
                      style={{ width: `${Math.max(5, 100 - simulationTimeMonths * 3)}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#FAFAFA] font-bold">Resistance Subclone A (EGFR T790M)</span>
                    <span className="text-[#F59E0B]">{simulationTimeMonths < 12 ? simulationTimeMonths * 4 : Math.max(10, 60 - (simulationTimeMonths - 12) * 4)}% CCF</span>
                  </div>
                  <div className="w-full bg-[#27272A] h-3 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#F59E0B] h-full transition-all duration-500" 
                      style={{ width: `${simulationTimeMonths < 12 ? simulationTimeMonths * 4 : Math.max(10, 60 - (simulationTimeMonths - 12) * 4)}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#FAFAFA] font-bold">Secondary Resistance Subclone B (MET Amp / C797S)</span>
                    <span className="text-[#EC4899]">{simulationTimeMonths > 12 ? (simulationTimeMonths - 12) * 3.8 : 0}% CCF</span>
                  </div>
                  <div className="w-full bg-[#27272A] h-3 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#EC4899] h-full transition-all duration-500" 
                      style={{ width: `${simulationTimeMonths > 12 ? (simulationTimeMonths - 12) * 3.8 : 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Milestones Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-[#09090B] border border-[#27272A] p-3 rounded-xl flex flex-col gap-1 text-xs">
                  <span className="text-[10px] font-mono text-[#3B82F6]">MONTH 0-9</span>
                  <span className="font-bold text-[#FAFAFA]">Primary Response</span>
                  <p className="text-[11px] text-[#A1A1AA]">Osimertinib suppresses founder clone. Rapid drop in ctDNA.</p>
                </div>

                <div className="bg-[#09090B] border border-[#27272A] p-3 rounded-xl flex flex-col gap-1 text-xs">
                  <span className="text-[10px] font-mono text-[#F59E0B]">MONTH 10-18</span>
                  <span className="font-bold text-[#FAFAFA]">T790M Gatekeeper Emergence</span>
                  <p className="text-[11px] text-[#A1A1AA]">Subclone A expansion triggers second-line combination therapy.</p>
                </div>

                <div className="bg-[#09090B] border border-[#27272A] p-3 rounded-xl flex flex-col gap-1 text-xs">
                  <span className="text-[10px] font-mono text-[#EC4899]">MONTH 19-36</span>
                  <span className="font-bold text-[#FAFAFA]">Bypass Activation</span>
                  <p className="text-[11px] text-[#A1A1AA]">MET focal gain requires amivantamab + savolitinib bispecific targeting.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: VARIANT INTERPRETATION & EVIDENCE RULES            */}
      {/* ======================================================== */}
      {activeTab === "variant_interpretation" && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Variant Selector */}
            <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5 flex flex-col gap-3">
              <span className="text-xs font-bold text-[#FAFAFA]">Select Somatic Variant</span>
              <div className="flex flex-col gap-2">
                {variantList.map((v, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedVariant(v)}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                      selectedVariant.gene === v.gene && selectedVariant.hgvs === v.hgvs
                        ? "bg-[#10B981]/10 border-[#10B981] text-[#FAFAFA]"
                        : "bg-[#09090B] border-[#27272A] text-[#A1A1AA] hover:bg-[#27272A]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold font-mono text-xs text-[#FAFAFA]">{v.gene} {v.hgvs}</span>
                      {v.conflictStatus && (
                        <span className="text-[9px] bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30 px-1.5 py-0.5 rounded font-mono">
                          Conflict
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#71717A] font-mono">{v.tier}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Detailed Evidence & ACMG Rules */}
            <div className="lg:col-span-2 bg-[#18181B] border border-[#27272A] rounded-2xl p-5 flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#FAFAFA] font-mono">{selectedVariant.gene} {selectedVariant.hgvs}</span>
                  <span className="text-[10px] bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 px-2 py-0.5 rounded font-mono font-bold">
                    {selectedVariant.acmgClassification}
                  </span>
                </div>
                <span className="text-xs font-mono text-[#71717A]">ClinVar ID: {selectedVariant.clinvarId}</span>
              </div>

              {/* Evidence Code Breakdown */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-[#FAFAFA]">ACMG / AMP Evidence Criteria Triggered</span>
                <div className="flex flex-wrap gap-2">
                  {selectedVariant.evidenceCode.map((code, idx) => (
                    <span 
                      key={idx}
                      className="px-2.5 py-1 bg-[#27272A] border border-[#3F3F46] text-[#22D3EE] font-mono text-xs rounded-lg font-bold"
                    >
                      {code}
                    </span>
                  ))}
                </div>
              </div>

              {/* Conflict Status Warning */}
              {selectedVariant.conflictStatus && (
                <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 p-4 rounded-xl flex items-start gap-3 text-xs">
                  <AlertTriangle className="w-5 h-5 text-[#EF4444] flex-none mt-0.5" />
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-[#EF4444]">Evidence Conflict Detected</span>
                    <p className="text-[#A1A1AA] text-[11px] leading-relaxed">{selectedVariant.conflictDetails}</p>
                  </div>
                </div>
              )}

              {/* FDA Approved / Off-label Options */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-[#FAFAFA]">Targeted FDA / Clinical Trial Regimens</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedVariant.fdaApprovedDrugs.map((drug, idx) => (
                    <div key={idx} className="bg-[#09090B] border border-[#27272A] p-3 rounded-xl flex items-center justify-between text-xs">
                      <span className="font-bold text-[#FAFAFA] font-mono">{drug}</span>
                      <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: VARIANT WATCH CLI & SURVEILLANCE MATRIX             */}
      {/* ======================================================== */}
      {activeTab === "variant_watch" && (
        <VariantWatch />
      )}

      {/* ======================================================== */}
      {/* TAB 3: PATHWAY ANALYSIS & GENE ENRICHMENT                 */}
      {/* ======================================================== */}
      {activeTab === "pathway_analysis" && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pathwayList.map((path) => (
              <div 
                key={path.id}
                className="bg-[#18181B] border border-[#27272A] p-5 rounded-2xl flex flex-col gap-4 hover:border-[#8B5CF6]/50 transition-colors"
              >
                <div className="flex items-start justify-between border-b border-[#27272A] pb-3">
                  <div className="flex flex-col">
                    <h3 className="text-sm font-bold text-[#FAFAFA]">{path.name}</h3>
                    <span className="text-[10px] font-mono text-[#8B5CF6]">{path.category}</span>
                  </div>
                  <span className="text-xs font-mono font-bold bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/30 px-2.5 py-1 rounded-xl">
                    Score: {path.dysregulationScore}/100
                  </span>
                </div>

                <div className="flex flex-col gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#A1A1AA]">Altered Genes:</span>
                    <span className="font-mono text-[#FAFAFA] font-bold">{path.alteredGenes.join(", ")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A1A1AA]">Primary Driver:</span>
                    <span className="font-mono text-[#22D3EE] font-bold">{path.keyDrivers.join(", ")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A1A1AA]">Cohort Enrichment p-value:</span>
                    <span className="font-mono text-[#10B981]">p = {path.cohortEnrichmentP}</span>
                  </div>
                </div>

                <div className="bg-[#09090B] p-3 rounded-xl border border-[#27272A] flex items-center justify-between text-xs font-mono">
                  <span className="text-[#A1A1AA]">Therapeutic Strategy:</span>
                  <span className="text-[#FAFAFA] font-bold">{path.therapeuticTarget}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: THERAPY RECOMMENDATIONS                           */}
      {/* ======================================================== */}
      {activeTab === "therapy_recommendation" && (
        <div className="flex flex-col gap-4">
          {therapyList.map((t) => (
            <div 
              key={t.rank}
              className="bg-[#18181B] border border-[#27272A] p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-[#F59E0B]/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B] font-bold font-mono text-sm flex-none">
                  #{t.rank}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#FAFAFA]">{t.drugName}</h3>
                    <span className="text-[10px] font-mono bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 px-2 py-0.5 rounded">
                      {t.evidenceLevel}
                    </span>
                  </div>
                  <p className="text-xs text-[#A1A1AA]">{t.mechanism}</p>
                  <div className="flex items-center gap-3 text-[11px] font-mono text-[#71717A] mt-1">
                    <span>Target: <strong className="text-[#22D3EE]">{t.targetVariant}</strong></span>
                    <span>Trial: <strong className="text-[#FAFAFA]">{t.nctTrialId}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 flex-none self-end md:self-center">
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-2xl font-black text-[#F59E0B]">{t.predictedEfficacy}%</span>
                  <span className="text-[10px] text-[#A1A1AA]">Predicted Efficacy</span>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                  t.toxicityRisk === "Low" ? "bg-[#10B981]/10 text-[#10B981]" : t.toxicityRisk === "Moderate" ? "bg-[#F59E0B]/10 text-[#F59E0B]" : "bg-[#EF4444]/10 text-[#EF4444]"
                }`}>
                  Toxicity: {t.toxicityRisk}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: CONFLICT EXPLORER (RESEARCH OPPORTUNITIES)         */}
      {/* ======================================================== */}
      {activeTab === "conflict_explorer" && (
        <div className="flex flex-col gap-5">
          <div className="bg-[#18181B] border border-[#EC4899]/30 p-4 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-[#EC4899]" />
              <div className="flex flex-col">
                <span className="font-bold text-[#FAFAFA]">Open Evidence Conflicts & Research Opportunities</span>
                <span className="text-[11px] text-[#A1A1AA]">
                  Browse contradictory evidence across institutions, participate in consensus voting, or trigger targeted experimental studies.
                </span>
              </div>
            </div>
            <span className="font-mono text-[10px] bg-[#EC4899]/10 text-[#EC4899] border border-[#EC4899]/30 px-3 py-1.5 rounded-xl font-bold">
              3 Active Conflicts
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {conflicts.map((c) => {
              const myVote = userVotes[c.id];
              const totalVotes = c.votesA + c.votesB;
              const pctA = Math.round((c.votesA / totalVotes) * 100);
              const pctB = 100 - pctA;

              return (
                <div 
                  key={c.id}
                  className="bg-[#18181B] border border-[#27272A] p-5 rounded-2xl flex flex-col gap-4"
                >
                  <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#EC4899]">{c.id}</span>
                      <h3 className="text-xs font-bold text-[#FAFAFA]">{c.topic}</h3>
                    </div>
                    <span className="text-[10px] font-mono bg-[#27272A] text-[#A1A1AA] border border-[#3F3F46] px-2 py-0.5 rounded">
                      {c.category}
                    </span>
                  </div>

                  {/* Conflicting Assertions Side-by-Side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Submitter A */}
                    <div className={`p-4 rounded-xl border flex flex-col gap-2 transition-all ${
                      myVote === "A" ? "bg-[#22D3EE]/10 border-[#22D3EE]" : "bg-[#09090B] border-[#27272A]"
                    }`}>
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="font-bold text-[#22D3EE]">{c.submitterA}</span>
                        <span className="text-[#71717A]">{pctA}% Consensus ({c.votesA} votes)</span>
                      </div>
                      <p className="text-xs text-[#A1A1AA] leading-relaxed">{c.assertionA}</p>
                      <button
                        onClick={() => handleVote(c.id, "A")}
                        className="mt-2 self-start px-3 py-1.5 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-[#FAFAFA] font-mono text-[10px] font-bold transition-all"
                      >
                        {myVote === "A" ? "✓ Voted Assertion A" : "Vote for Assertion A"}
                      </button>
                    </div>

                    {/* Submitter B */}
                    <div className={`p-4 rounded-xl border flex flex-col gap-2 transition-all ${
                      myVote === "B" ? "bg-[#EC4899]/10 border-[#EC4899]" : "bg-[#09090B] border-[#27272A]"
                    }`}>
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="font-bold text-[#EC4899]">{c.submitterB}</span>
                        <span className="text-[#71717A]">{pctB}% Consensus ({c.votesB} votes)</span>
                      </div>
                      <p className="text-xs text-[#A1A1AA] leading-relaxed">{c.assertionB}</p>
                      <button
                        onClick={() => handleVote(c.id, "B")}
                        className="mt-2 self-start px-3 py-1.5 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-[#FAFAFA] font-mono text-[10px] font-bold transition-all"
                      >
                        {myVote === "B" ? "✓ Voted Assertion B" : "Vote for Assertion B"}
                      </button>
                    </div>
                  </div>

                  {/* Highlighted Research Opportunity & AI Reasoning Trigger */}
                  <div className="bg-[#09090B] border border-[#F59E0B]/30 p-3.5 rounded-xl flex flex-col gap-3 text-xs">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-[#F59E0B] flex-none" />
                        <span className="text-[#A1A1AA]">
                          <strong className="text-[#FAFAFA]">Research Opportunity:</strong> {c.researchOpportunity}
                        </span>
                      </div>
                      <button
                        onClick={() => handleSynthesizeConflictWithAI(c)}
                        disabled={aiSynthesisLoading[c.id]}
                        className="text-[10px] font-mono bg-[#8B5CF6]/10 text-[#8B5CF6] hover:bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 flex-none transition-all"
                      >
                        <Sparkles className="w-3 h-3" />
                        {aiSynthesisLoading[c.id] ? "Synthesizing AI..." : "Synthesize with Gemini AI"}
                      </button>
                    </div>

                    {/* AI Reasoning Response Result Box */}
                    {aiSynthesisResults[c.id] && (
                      <div className="bg-[#18181B] border border-[#8B5CF6]/30 p-3.5 rounded-xl text-xs flex flex-col gap-1.5 text-[#E4E4E7] font-mono leading-relaxed mt-1">
                        <div className="flex items-center gap-2 text-[#8B5CF6] font-bold text-[11px]">
                          <Sparkles className="w-3.5 h-3.5" /> Gemini AI Conflict Literature Synthesis
                        </div>
                        <div className="whitespace-pre-wrap text-[11px] text-[#A1A1AA]">
                          {aiSynthesisResults[c.id]}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STANDALONE PACKAGE EXPORTER TERMINAL BAR                  */}
      {/* ======================================================== */}
      <div className="border-t border-[#27272A] pt-5 mt-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#18181B]/60 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-[#22D3EE]" />
          <div>
            <h4 className="text-xs font-bold text-[#FAFAFA]">Export Standalone PyPI Packages & Workflow Tools</h4>
            <p className="text-[11px] text-[#A1A1AA]">Download decoupled, tool-agnostic modules generated by BioComposable.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
          <a
            href="/agent/v1/download/banff-validator"
            download="banff_validator.py"
            className="bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20 border border-[#10B981]/30 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all"
          >
            <FileText className="w-3.5 h-3.5" /> banff-validator.py
          </a>

          <a
            href="/agent/v1/download/rpd-cli"
            download="rpd_cli.py"
            className="bg-[#22D3EE]/10 text-[#22D3EE] hover:bg-[#22D3EE]/20 border border-[#22D3EE]/30 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all"
          >
            <FileText className="w-3.5 h-3.5" /> rpd-cli.py
          </a>

          <a
            href="/agent/v1/download/scverse-transplant"
            download="scverse_transplant.py"
            className="bg-[#8B5CF6]/10 text-[#8B5CF6] hover:bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all"
          >
            <FileText className="w-3.5 h-3.5" /> scverse_transplant.py
          </a>

          <a
            href="/agent/v1/download/nextflow"
            download="main.nf"
            className="bg-[#F59E0B]/10 text-[#F59E0B] hover:bg-[#F59E0B]/20 border border-[#F59E0B]/30 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all"
          >
            <FileText className="w-3.5 h-3.5" /> main.nf (DSL2)
          </a>

          <a
            href="/agent/v1/download/ro-crate"
            download="ro-crate-metadata.json"
            className="bg-[#EC4899]/10 text-[#EC4899] hover:bg-[#EC4899]/20 border border-[#EC4899]/30 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all"
          >
            <FileText className="w-3.5 h-3.5" /> RO-Crate (JSON-LD)
          </a>

          <a
            href="/agent/v1/download/variantwatch"
            download="variantwatch_cli.py"
            className="bg-[#F59E0B]/10 text-[#F59E0B] hover:bg-[#F59E0B]/20 border border-[#F59E0B]/30 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all"
            title="Download VariantWatch CLI Python tool"
          >
            <FileText className="w-3.5 h-3.5" /> variantwatch_cli.py
          </a>
        </div>
      </div>

    </div>
  );
}
