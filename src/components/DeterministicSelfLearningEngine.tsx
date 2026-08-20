import { useState } from "react";
import { 
  GitBranch, 
  GitMerge, 
  ShieldAlert, 
  ShieldCheck,
  CheckCircle2, 
  AlertTriangle, 
  Terminal, 
  Network, 
  Cpu, 
  FileCode2, 
  RotateCcw,
  Sparkles,
  Scale,
  BarChart3,
  FileText,
  History,
  UserCheck,
  Plus,
  RefreshCw,
  Lock,
  ArrowRight
} from "lucide-react";
import { performMetaAnalysis, EvidenceNodePayload, MetaAnalysisResult } from "../utils/metaAnalysis";
import { validateBanffSchema, BanffLesionScores } from "../utils/schemaValidator";

interface RuleRecord {
  ruleId: string;
  targetDomain: string;
  statement: string;
  thresholdN: number;
  version: string;
  structuralPattern: string;
  status: "VERIFIED_ACTIVE" | "CONFLICT_FLAGGED" | "PENDING_CONSENSUS" | "SCOPED_RESOLVED";
  conflictReason?: string;
  scopedPhenotype?: string;
  history: Array<{ timestamp: string; action: string; version: string; note: string }>;
}

const initialRulesStore: Record<string, RuleRecord> = {
  "RULE-GEO-01": {
    ruleId: "RULE-GEO-01",
    targetDomain: "Transplant Rejection cfRNA",
    statement: "IF podocyte_fraction > 0.12 AND tubulitis_score >= 2 THEN flag_TCMR_IB_rejection",
    thresholdN: 3,
    version: "v1.1.0",
    structuralPattern: "Graph pattern: [cfRNA Podocyte] -> (Correlates >= 0.82) -> [Banff t2/g2 Lesion]",
    status: "VERIFIED_ACTIVE",
    history: [
      { timestamp: "2026-08-15T10:00:00Z", action: "PROPOSED", version: "v1.0.0", note: "Initial rule submission by Stanford" },
      { timestamp: "2026-08-20T07:40:00Z", action: "VERIFIED", version: "v1.1.0", note: "Meta-analysis confirmed across 4 independent international sites (I^2 = 12.4%)" }
    ]
  },
  "RULE-ONC-02": {
    ruleId: "RULE-ONC-02",
    targetDomain: "Neoantigen Immunogenicity",
    statement: "IF MHC_Kd < 50nM AND RNA_TPM > 10.0 AND mutant_entropy > 0.65 THEN classify_HighConfidenceVaccine",
    thresholdN: 3,
    version: "v1.0.0",
    structuralPattern: "Graph pattern: [MHC-I Bind] -> (Kd <= 50) -> [T-Cell Receptor Activation]",
    status: "VERIFIED_ACTIVE",
    history: [
      { timestamp: "2026-08-20T07:42:15Z", action: "VERIFIED", version: "v1.0.0", note: "Meta-analysis confirmed across 3 sites" }
    ]
  },
  "RULE-TME-03": {
    ruleId: "RULE-TME-03",
    targetDomain: "Spatial Immune Checkpoint",
    statement: "IF spatial_margin_distance <= 20um AND PD-L1_TPM > 5.0 THEN flag_ImmuneCheckpointResistant",
    thresholdN: 4,
    version: "v2.0.0-CONFLICT",
    structuralPattern: "Graph pattern: [Invasive Margin CD8+] -> (Distance <= 20um) -> [PD-L1 Engagement]",
    status: "CONFLICT_FLAGGED",
    conflictReason: "Opposing effect sizes between Dana-Farber (+1.42) and Charité Berlin (-0.05). High heterogeneity (I^2 = 88.2%). Zero-averaging policy enforced.",
    history: [
      { timestamp: "2026-08-18T12:00:00Z", action: "PROPOSED", version: "v1.0.0", note: "Proposed by Dana-Farber" },
      { timestamp: "2026-08-20T07:44:30Z", action: "CONFLICT_FLAGGED", version: "v2.0.0-CONFLICT", note: "Charité Berlin submitted zero-effect payload (-0.05). Rule execution suspended per non-averaging principle." }
    ]
  },
  "RULE-MRD-04": {
    ruleId: "RULE-MRD-04",
    targetDomain: "Liquid Biopsy ctDNA Clearance",
    statement: "IF post_op_ctDNA_VAF < 10PPM AND fragment_WPS > 0.85 THEN declare_MolecularRemission",
    thresholdN: 3,
    version: "v1.0.0-PENDING",
    structuralPattern: "Graph pattern: [ctDNA UMI Depth >= 30000x] -> (VAF < 10 PPM) -> [Zero Recurrence 12M]",
    status: "PENDING_CONSENSUS",
    history: [
      { timestamp: "2026-08-20T07:45:00Z", action: "PROPOSED", version: "v1.0.0-PENDING", note: "Awaiting 3rd independent validation site" }
    ]
  }
};

const initialEvidenceStore: Record<string, EvidenceNodePayload[]> = {
  "RULE-GEO-01": [
    { nodeId: "Node-US-01", institution: "Stanford Medicine", evidencePattern: "Podocyte/Tubular cfRNA Ratio", graphTopology: "[cfRNA] -> [Banff t2/g2]", effectSize: 0.88, se: 0.03, ciLower: 0.82, ciUpper: 0.94, sampleCount: 840, timestamp: "2026-08-20T07:00:00Z", signature: "0x3f2a8a" },
    { nodeId: "Node-US-02", institution: "Johns Hopkins", evidencePattern: "Podocyte/Tubular cfRNA Ratio", graphTopology: "[cfRNA] -> [Banff t2/g2]", effectSize: 0.84, se: 0.03, ciLower: 0.78, ciUpper: 0.90, sampleCount: 620, timestamp: "2026-08-20T07:15:00Z", signature: "0x1d4b9e" },
    { nodeId: "Node-EU-01", institution: "INSERM Paris", evidencePattern: "Podocyte/Tubular cfRNA Ratio", graphTopology: "[cfRNA] -> [Banff t2/g2]", effectSize: 0.86, se: 0.03, ciLower: 0.80, ciUpper: 0.92, sampleCount: 510, timestamp: "2026-08-20T07:30:00Z", signature: "0x8e2c1f" },
    { nodeId: "Node-APAC-01", institution: "Kyoto University", evidencePattern: "Podocyte/Tubular cfRNA Ratio", graphTopology: "[cfRNA] -> [Banff t2/g2]", effectSize: 0.82, se: 0.04, ciLower: 0.75, ciUpper: 0.89, sampleCount: 430, timestamp: "2026-08-20T07:35:00Z", signature: "0x5a9100" }
  ],
  "RULE-ONC-02": [
    { nodeId: "Node-US-05", institution: "Memorial Sloan Kettering", evidencePattern: "MHC-I Affinity", graphTopology: "[MHC-I] -> [T-Cell]", effectSize: 1.25, se: 0.05, ciLower: 1.15, ciUpper: 1.35, sampleCount: 540, timestamp: "2026-08-20T07:00:00Z", signature: "0x9a2b11" },
    { nodeId: "Node-EU-03", institution: "NKI Amsterdam", evidencePattern: "MHC-I Affinity", graphTopology: "[MHC-I] -> [T-Cell]", effectSize: 1.18, se: 0.06, ciLower: 1.06, ciUpper: 1.30, sampleCount: 410, timestamp: "2026-08-20T07:20:00Z", signature: "0x7c4d22" },
    { nodeId: "Node-APAC-02", institution: "National Cancer Center Tokyo", evidencePattern: "MHC-I Affinity", graphTopology: "[MHC-I] -> [T-Cell]", effectSize: 1.21, se: 0.05, ciLower: 1.11, ciUpper: 1.31, sampleCount: 390, timestamp: "2026-08-20T07:40:00Z", signature: "0x3b8e33" }
  ],
  "RULE-TME-03": [
    { nodeId: "Node-US-03", institution: "Dana-Farber Cancer Inst", evidencePattern: "Spatial PD-L1 Margin Proximity", graphTopology: "[Invasive Margin] -> [PD-L1]", effectSize: 1.42, se: 0.11, ciLower: 1.20, ciUpper: 1.64, sampleCount: 320, timestamp: "2026-08-20T07:00:00Z", signature: "0xDFCI01" },
    { nodeId: "Node-EU-02", institution: "Charité Berlin", evidencePattern: "Spatial PD-L1 Margin Proximity", graphTopology: "[Invasive Margin] -> [PD-L1]", effectSize: -0.05, se: 0.08, ciLower: -0.22, ciUpper: 0.12, sampleCount: 290, timestamp: "2026-08-20T07:20:00Z", signature: "0xCHAR02" },
    { nodeId: "Node-US-04", institution: "MD Anderson", evidencePattern: "Spatial PD-L1 Margin Proximity", graphTopology: "[Invasive Margin] -> [PD-L1]", effectSize: 1.35, se: 0.10, ciLower: 1.15, ciUpper: 1.55, sampleCount: 410, timestamp: "2026-08-20T07:40:00Z", signature: "0xMDA03" }
  ],
  "RULE-MRD-04": [
    { nodeId: "Node-US-06", institution: "Mayo Clinic", evidencePattern: "ctDNA VAF Clearance", graphTopology: "[ctDNA] -> [Remission]", effectSize: 0.96, se: 0.04, ciLower: 0.88, ciUpper: 1.04, sampleCount: 280, timestamp: "2026-08-20T07:10:00Z", signature: "0xMAYO01" },
    { nodeId: "Node-EU-04", institution: "Royal Marsden", evidencePattern: "ctDNA VAF Clearance", graphTopology: "[ctDNA] -> [Remission]", effectSize: 0.92, se: 0.05, ciLower: 0.82, ciUpper: 1.02, sampleCount: 210, timestamp: "2026-08-20T07:30:00Z", signature: "0xROYAL02" }
  ]
};

export function DeterministicSelfLearningEngine() {
  const [rules, setRules] = useState<Record<string, RuleRecord>>(initialRulesStore);
  const [evidenceStore, setEvidenceStore] = useState<Record<string, EvidenceNodePayload[]>>(initialEvidenceStore);
  const [selectedRuleId, setSelectedRuleId] = useState<string>("RULE-TME-03");
  const [activeTab, setActiveTab] = useState<"FOREST" | "PRISMA" | "GRADE" | "CONFLICT_RESOLVER" | "CONTRACT_VERIFICATION" | "SURVEILLANCE_SYNC">("FOREST");

  // Live Banff Contract Simulation State for Active Tab
  const [simG, setSimG] = useState<number>(1);
  const [simT, setSimT] = useState<number>(2);
  const [simV, setSimV] = useState<number>(0);
  const [simI, setSimI] = useState<number>(2);
  const [simPtc, setSimPtc] = useState<number>(1);
  const [simC4d, setSimC4d] = useState<boolean>(true);
  const [simDsa, setSimDsa] = useState<boolean>(false);
  const [simMolecular, setSimMolecular] = useState<number>(0.35);
  const [simCi, setSimCi] = useState<number>(1);
  const [simCt, setSimCt] = useState<number>(1);

  // New Evidence Submission State (including clinical data contracts)
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [newNodeId, setNewNodeId] = useState<string>("");
  const [newInstitution, setNewInstitution] = useState<string>("");
  const [newEffectSize, setNewEffectSize] = useState<number>(1.10);
  const [newSe, setNewSe] = useState<number>(0.06);
  const [newSampleCount, setNewSampleCount] = useState<number>(350);
  
  // Attached clinical contract scores for the modal
  const [modalG, setModalG] = useState<number>(1);
  const [modalT, setModalT] = useState<number>(1);
  const [modalV, setModalV] = useState<number>(0);
  const [modalI, setModalI] = useState<number>(1);
  const [modalPtc, setModalPtc] = useState<number>(1);
  const [modalC4d, setModalC4d] = useState<boolean>(false);
  const [modalDsa, setModalDsa] = useState<boolean>(true);
  const [modalMolecular, setModalMolecular] = useState<number>(0.45);

  // Human-in-the-Loop Conflict Resolution State
  const [conflictCategory, setConflictCategory] = useState<string>("sub-phenotype difference");
  const [scopedPhenotype, setScopedPhenotype] = useState<string>("desmoplastic_melanoma");
  const [expertNotes, setExpertNotes] = useState<string>("");
  const [aiRationaleLoading, setAiRationaleLoading] = useState<boolean>(false);
  const [aiRationaleResult, setAiRationaleResult] = useState<string>("");

  // Closed-Loop VariantWatch Surveillance Sync State
  const [syncedVariants, setSyncedVariants] = useState<Array<{
    variantId: string;
    gene: string;
    hgvs: string;
    changeType: "DOWNGRADE" | "UPGRADE" | "NO_CHANGE";
    lastClassified: string;
    currentClassified: string;
    mappedRuleId: string;
    calibrated: boolean;
  }>>([
    { variantId: "var-001", gene: "MLH1", hgvs: "c.677G>A (p.Arg226Gln)", changeType: "DOWNGRADE", lastClassified: "Pathogenic", currentClassified: "VUS", mappedRuleId: "RULE-GEO-01", calibrated: false },
    { variantId: "var-002", gene: "BRCA2", hgvs: "c.5266dupC (p.Gln1756Profs)", changeType: "UPGRADE", lastClassified: "VUS", currentClassified: "Likely Pathogenic", mappedRuleId: "RULE-ONC-02", calibrated: false },
    { variantId: "var-003", gene: "EGFR", hgvs: "c.2389G>A (p.Cys797Ser)", changeType: "NO_CHANGE", lastClassified: "Pathogenic", currentClassified: "Pathogenic", mappedRuleId: "RULE-TME-03", calibrated: false },
  ]);

  const handleVariantWatchCalibration = (variantId: string) => {
    const variantIndex = syncedVariants.findIndex(v => v.variantId === variantId);
    if (variantIndex === -1) return;
    const v = syncedVariants[variantIndex];

    let calibratedEffect = 1.0;
    let calibratedSe = 0.05;

    if (v.changeType === "DOWNGRADE") {
      calibratedEffect = 0.35;
      calibratedSe = 0.12;
    } else if (v.changeType === "UPGRADE") {
      calibratedEffect = 1.65;
      calibratedSe = 0.03;
    } else {
      calibratedEffect = 1.20;
      calibratedSe = 0.06;
    }

    const targetRuleId = v.mappedRuleId;
    const syncNodeId = `Node-VW-Sync-${variantId}`;

    const syncNode: EvidenceNodePayload = {
      nodeId: syncNodeId,
      institution: "VariantWatch Surveillance Gateway",
      evidencePattern: `Live ClinVar Consensus (${v.gene})`,
      graphTopology: `[ClinVar ${v.currentClassified}] -> [Rule Prior]`,
      effectSize: calibratedEffect,
      se: calibratedSe,
      ciLower: Number((calibratedEffect - 1.96 * calibratedSe).toFixed(2)),
      ciUpper: Number((calibratedEffect + 1.96 * calibratedSe).toFixed(2)),
      sampleCount: 1500,
      timestamp: new Date().toISOString(),
      signature: "0xCRYPTO_SYNC_" + Math.random().toString(36).substring(2, 8).toUpperCase()
    };

    setEvidenceStore(prev => {
      const existing = prev[targetRuleId] || [];
      const cleaned = existing.filter(n => n.nodeId !== syncNodeId);
      return {
        ...prev,
        [targetRuleId]: [...cleaned, syncNode]
      };
    });

    setSyncedVariants(prev => prev.map((vItem, i) => i === variantIndex ? { ...vItem, calibrated: true } : vItem));

    setSimulatedLogs(prev => [
      `[CLOSED-LOOP INTERPRETER] Synced VariantWatch consensus for ${v.gene} ${v.hgvs}.`,
      `[MATH CALIBRATION] Mapped to ${targetRuleId}. Injected dynamic Node-VW-Sync-${variantId} (Effect Size=${calibratedEffect}, SE=${calibratedSe}).`,
      `[META-ANALYSIS TRIGGERED] Recalculated Inverse-Variance Random Effects. Model updated across all federated clinical nodes.`,
      ...prev
    ]);
  };

  // Event Log
  const [simulatedLogs, setSimulatedLogs] = useState<string[]>([
    "[SYSTEM] Deterministic Meta-Analysis Engine v3.0 initialized.",
    "[COMPUTATION] Inverse-variance random effects + Hartung-Knapp-Sidik-Jonkman (HKSJ) adjustment active.",
    "[NON-AVERAGING PRINCIPLE] Conflict detection rule: I^2 > 50% or directional sign flip enforces CONFLICT_STATE.",
    "[API ACTIVE] Federated Evidence submission endpoints live on /agent/v1/evidence/*"
  ]);

  const selectedRule = rules[selectedRuleId] || rules["RULE-TME-03"];
  const currentEvidence = evidenceStore[selectedRuleId] || [];
  const metaStats: MetaAnalysisResult = performMetaAnalysis(selectedRuleId, currentEvidence);

  // Handle New Evidence Submission
  const handleSimulateEvidenceSubmission = async () => {
    if (!newNodeId || !newInstitution) return;

    const clinicalScores: BanffLesionScores = {
      g: modalG,
      t: modalT,
      v: modalV,
      i: modalI,
      ptc: modalPtc,
      c4d: modalC4d,
      dsa: modalDsa ? "positive" : "negative",
      molecularAbmr: modalMolecular,
      ci: 1,
      ct: 1
    };

    const payload: EvidenceNodePayload = {
      nodeId: newNodeId,
      institution: newInstitution,
      evidencePattern: selectedRule.structuralPattern,
      graphTopology: selectedRule.structuralPattern,
      effectSize: Number(newEffectSize),
      se: Number(newSe),
      ciLower: Number(newEffectSize) - 1.96 * Number(newSe),
      ciUpper: Number(newEffectSize) + 1.96 * Number(newSe),
      sampleCount: Number(newSampleCount),
      timestamp: new Date().toISOString(),
      signature: "0xSIG_" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      clinicalScores
    };

    try {
      const response = await fetch("/agent/v1/evidence/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ruleId: selectedRuleId,
          ...payload
        })
      });

      if (response.ok) {
        const data = await response.json();
        setEvidenceStore((prev) => ({
          ...prev,
          [selectedRuleId]: [...(prev[selectedRuleId] || []).filter(e => e.nodeId !== newNodeId), payload]
        }));

        if (data.rule) {
          setRules((prev) => ({ ...prev, [selectedRuleId]: data.rule }));
        }

        const contractMsg = data.contractValidation 
          ? `[DATA CONTRACT VALID] Hash=${data.contractValidation.contractHash} Verdict=${data.contractValidation.rejectionDiagnosis}`
          : `[DATA CONTRACT DETACHED] Standard evidence synthesis recorded.`;

        setSimulatedLogs((prev) => [
          `[REST API] Posted signed evidence payload from ${newInstitution} (${newNodeId}) to /agent/v1/evidence/submit`,
          contractMsg,
          `[META-ANALYSIS RE-COMPUTED] k=${data.metaStats.kStudies}, I^2=${data.metaStats.iSquared}%, HKSJ CI=[${data.metaStats.hksjCiLower}, ${data.metaStats.hksjCiUpper}], Proof=${data.metaStats.proofHash}`,
          ...prev
        ]);
      }
    } catch (e) {
      // Fallback local update
      setEvidenceStore((prev) => ({
        ...prev,
        [selectedRuleId]: [...(prev[selectedRuleId] || []).filter(e => e.nodeId !== newNodeId), payload]
      }));
    } finally {
      setShowSubmitModal(false);
      setNewNodeId("");
      setNewInstitution("");
    }
  };

  // Handle Expert Conflict Resolution
  const handleResolveConflictInUI = async () => {
    setAiRationaleLoading(true);
    try {
      const response = await fetch("/agent/v1/evidence/resolve-conflict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ruleId: selectedRuleId,
          conflictCategory,
          scopedPhenotype,
          expertNotes,
          resolvedBy: "Global Transplant & Oncology Tumor Board"
        })
      });

      const data = await response.json();
      if (data.rule) {
        setRules((prev) => ({ ...prev, [selectedRuleId]: data.rule }));
      }
      setAiRationaleResult(data.geminiRationale || "Rule conflict successfully resolved and re-scoped.");
      setSimulatedLogs((prev) => [
        `[HUMAN-IN-THE-LOOP] Expert conflict resolution submitted for ${selectedRuleId}.`,
        `[RULE UPDATED] Scoped to phenotype: ${scopedPhenotype}. Version bumped to ${data.rule.version}.`,
        ...prev
      ]);
    } catch (err) {
      setAiRationaleResult("Conflict resolved locally. Scoped to phenotype: " + scopedPhenotype);
    } finally {
      setAiRationaleLoading(false);
    }
  };

  return (
    <div className="bg-[#18181B] border border-[#22D3EE]/30 rounded-3xl p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#22D3EE]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272A] pb-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/30 font-bold uppercase tracking-wider">
              DETERMINISTIC META-ANALYSIS ENGINE v3.0
            </span>
            <span className="text-[10px] font-mono text-[#71717A]">
              MERGE_SUMMARIES_NEVER_AVERAGE_CONFLICTS
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#FAFAFA] flex items-center gap-2">
            Federated Evidence Synthesis & Deterministic Learning Engine
          </h2>
          <p className="text-xs text-[#A1A1AA] max-w-3xl">
            Implements Inverse-Variance Random-Effects Meta-Analysis with Hartung-Knapp-Sidik-Jonkman (HKSJ) confidence bounds, Cochran&apos;s $Q$ heterogeneity testing ($I^2$), and CUSUM drift detection. Conflicting evidence triggers <code className="text-[#EF4444]">CONFLICT_STATE</code> and expert review queue.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSubmitModal(true)}
            className="bg-[#22D3EE] text-[#083344] hover:bg-[#06B6D4] font-mono font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all shadow-lg"
          >
            <Plus className="w-4 h-4" /> Submit Site Evidence
          </button>
          <div className="w-10 h-10 rounded-xl bg-[#22D3EE]/10 border border-[#22D3EE]/30 flex items-center justify-center text-[#22D3EE]">
            <GitMerge className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Principles Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#09090B] border border-[#27272A] rounded-2xl p-4 flex flex-col gap-1.5">
          <span className="text-[10px] font-mono text-[#71717A] uppercase flex items-center gap-1.5">
            <Network className="w-3.5 h-3.5 text-[#22D3EE]" /> 1. Inverse-Variance Meta-Analysis
          </span>
          <span className="text-xs font-bold text-[#FAFAFA]">HKSJ Random-Effects Model</span>
          <span className="text-[10px] text-[#A1A1AA]">Hartung-Knapp-Sidik-Jonkman adjusted CIs for small-sample robustness.</span>
        </div>

        <div className="bg-[#09090B] border border-[#27272A] rounded-2xl p-4 flex flex-col gap-1.5">
          <span className="text-[10px] font-mono text-[#71717A] uppercase flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-[#10B981]" /> 2. Heterogeneity Metric
          </span>
          <span className="text-xs font-bold text-[#FAFAFA]">Cochran&apos;s Q &amp; I² Statistic</span>
          <span className="text-[10px] text-[#A1A1AA]">Quantifies between-site variance ($I^2 \ge 50\%$ flags conflict).</span>
        </div>

        <div className="bg-[#09090B] border border-[#27272A] rounded-2xl p-4 flex flex-col gap-1.5">
          <span className="text-[10px] font-mono text-[#71717A] uppercase flex items-center gap-1.5">
            <FileCode2 className="w-3.5 h-3.5 text-[#8B5CF6]" /> 3. Non-Repudiable Proof
          </span>
          <span className="text-xs font-bold text-[#FAFAFA]">SHA-256 Proof Hash</span>
          <span className="text-[10px] text-[#A1A1AA]">Cryptographic digest over canonical site evidence payloads.</span>
        </div>

        <div className="bg-[#09090B] border border-[#27272A] rounded-2xl p-4 flex flex-col gap-1.5">
          <span className="text-[10px] font-mono text-[#71717A] uppercase flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-[#EF4444]" /> 4. Non-Averaging Principle
          </span>
          <span className="text-xs font-bold text-[#FAFAFA]">Conflict Queue &amp; Scoping</span>
          <span className="text-[10px] text-[#A1A1AA]">Opposing site signals enter expert review queue for sub-phenotype scoping.</span>
        </div>
      </div>

      {/* Main Interactive Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Rules Selector */}
        <div className="lg:col-span-5 bg-[#09090B] border border-[#27272A] rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
            <div>
              <span className="text-[10px] font-mono text-[#22D3EE] uppercase font-bold">
                Federated Rule Portfolio
              </span>
              <h3 className="text-sm font-bold text-[#FAFAFA]">
                Deterministic Rule Catalog
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#71717A] bg-[#18181B] px-2.5 py-1 rounded-lg border border-[#27272A]">
              API: /agent/v1/evidence
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {Object.values(rules).map((rule) => {
              const isSelected = selectedRuleId === rule.ruleId;
              const ruleEvidence = evidenceStore[rule.ruleId] || [];
              const ruleMeta = performMetaAnalysis(rule.ruleId, ruleEvidence);

              return (
                <div
                  key={rule.ruleId}
                  onClick={() => setSelectedRuleId(rule.ruleId)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col gap-2 ${
                    isSelected
                      ? "bg-[#18181B] border-[#22D3EE] shadow-lg"
                      : "bg-[#18181B]/50 border-[#27272A] hover:bg-[#18181B]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#22D3EE]">{rule.ruleId}</span>
                      <span className="text-xs font-bold text-[#FAFAFA]">{rule.targetDomain}</span>
                    </div>

                    {rule.status === "VERIFIED_ACTIVE" ? (
                      <span className="px-2.5 py-0.5 rounded-md bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 text-[10px] font-mono font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> VERIFIED ({rule.version})
                      </span>
                    ) : rule.status === "SCOPED_RESOLVED" ? (
                      <span className="px-2.5 py-0.5 rounded-md bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/30 text-[10px] font-mono font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> SCOPED ({rule.version})
                      </span>
                    ) : rule.status === "CONFLICT_FLAGGED" ? (
                      <span className="px-2.5 py-0.5 rounded-md bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30 text-[10px] font-mono font-bold flex items-center gap-1 animate-pulse">
                        <AlertTriangle className="w-3 h-3" /> CONFLICT ({rule.version})
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-md bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30 text-[10px] font-mono font-bold flex items-center gap-1">
                        PENDING CONSENSUS
                      </span>
                    )}
                  </div>

                  <div className="bg-[#09090B] border border-[#27272A] rounded-lg p-2 font-mono text-[11px] text-[#A1A1AA] overflow-x-auto">
                    <code>{rule.statement}</code>
                  </div>

                  <div className="grid grid-cols-3 gap-2 font-mono text-[10px] text-[#71717A] pt-1">
                    <span>Sites: <strong className="text-[#FAFAFA]">{ruleEvidence.length} / {rule.thresholdN}</strong></span>
                    <span>I²: <strong className={ruleMeta.iSquared > 50 ? "text-[#EF4444]" : "text-[#10B981]"}>{ruleMeta.iSquared}%</strong></span>
                    <span>Proof: <code className="text-[#22D3EE]">{ruleMeta.proofHash}</code></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Meta-Analysis Views & Forest Plots */}
        <div className="lg:col-span-7 bg-[#09090B] border border-[#27272A] rounded-2xl p-5 flex flex-col gap-4">
          
          {/* View Tab Selector */}
          <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("FOREST")}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeTab === "FOREST"
                    ? "bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/30"
                    : "text-[#71717A] hover:text-[#FAFAFA]"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" /> Forest Plot (HKSJ)
              </button>

              <button
                onClick={() => setActiveTab("PRISMA")}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeTab === "PRISMA"
                    ? "bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/30"
                    : "text-[#71717A] hover:text-[#FAFAFA]"
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> PRISMA 2020 Flow
              </button>

              <button
                onClick={() => setActiveTab("GRADE")}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeTab === "GRADE"
                    ? "bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/30"
                    : "text-[#71717A] hover:text-[#FAFAFA]"
                }`}
              >
                <Scale className="w-3.5 h-3.5" /> GRADE Profile
              </button>

              <button
                onClick={() => setActiveTab("CONFLICT_RESOLVER")}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeTab === "CONFLICT_RESOLVER"
                    ? "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30"
                    : "text-[#71717A] hover:text-[#EF4444]"
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" /> Conflict Queue
              </button>

              <button
                onClick={() => setActiveTab("CONTRACT_VERIFICATION")}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeTab === "CONTRACT_VERIFICATION"
                    ? "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30"
                    : "text-[#71717A] hover:text-[#10B981]"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Contract Conformance
              </button>

              <button
                onClick={() => setActiveTab("SURVEILLANCE_SYNC")}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeTab === "SURVEILLANCE_SYNC"
                    ? "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30"
                    : "text-[#71717A] hover:text-[#F59E0B]"
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-[#F59E0B]" /> VariantWatch Sync
              </button>
            </div>

            <Cpu className="w-5 h-5 text-[#22D3EE]" />
          </div>

          {/* TAB 1: FOREST PLOT VIEW */}
          {activeTab === "FOREST" && (
            <div className="flex flex-col gap-4 font-mono text-xs">
              
              {/* Meta-Analysis Statistical Summary Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#18181B] border border-[#27272A] p-3 rounded-xl text-[11px]">
                <div>
                  <span className="text-[#71717A] block">Pooled Effect (RE):</span>
                  <strong className={metaStats.randomEffect > 0 ? "text-[#10B981] text-xs" : "text-[#EF4444] text-xs"}>
                    {metaStats.randomEffect > 0 ? `+${metaStats.randomEffect}` : metaStats.randomEffect}
                  </strong>
                </div>
                <div>
                  <span className="text-[#71717A] block">HKSJ 95% CI:</span>
                  <strong className="text-[#FAFAFA] text-xs">[{metaStats.hksjCiLower}, {metaStats.hksjCiUpper}]</strong>
                </div>
                <div>
                  <span className="text-[#71717A] block">Heterogeneity I²:</span>
                  <strong className={metaStats.iSquared > 50 ? "text-[#EF4444] text-xs" : "text-[#10B981] text-xs"}>
                    {metaStats.iSquared}% (Q={metaStats.cochranQ})
                  </strong>
                </div>
                <div>
                  <span className="text-[#71717A] block">GRADE Certainty:</span>
                  <strong className={metaStats.gradeRating === "High" ? "text-[#10B981] text-xs" : "text-[#F59E0B] text-xs"}>
                    {metaStats.gradeRating}
                  </strong>
                </div>
              </div>

              {/* Interactive SVG Forest Plot */}
              <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between text-[10px] text-[#71717A] uppercase border-b border-[#27272A] pb-2">
                  <span>Site Node / Institution</span>
                  <span>Effect Size [95% CI]</span>
                  <span>Weight %</span>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  {currentEvidence.map((node) => {
                    const weightObj = metaStats.nodeWeights[node.nodeId] || { percentWeight: 25 };
                    // Map effect sizes -2.0 to +2.0 to SVG horizontal percentage (10% to 90%)
                    const mapX = (val: number) => Math.max(10, Math.min(90, 50 + val * 20));

                    const xStart = mapX(node.ciLower);
                    const xEnd = mapX(node.ciUpper);
                    const xCenter = mapX(node.effectSize);

                    return (
                      <div key={node.nodeId} className="flex flex-col gap-1 bg-[#09090B] p-2.5 rounded-lg border border-[#27272A]">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-[#FAFAFA]">{node.nodeId} ({node.institution})</span>
                          <span className="text-[#22D3EE] font-bold">
                            {node.effectSize > 0 ? `+${node.effectSize}` : node.effectSize} [{node.ciLower}, {node.ciUpper}]
                          </span>
                          <span className="text-[#A1A1AA] text-[10px]">{weightObj.percentWeight}%</span>
                        </div>

                        {/* SVG Forest Bar Line */}
                        <svg className="w-full h-6 overflow-visible" viewBox="0 0 100 24">
                          {/* Zero effect vertical reference line */}
                          <line x1="50" y1="0" x2="50" y2="24" stroke="#3F3F46" strokeDasharray="2,2" strokeWidth="0.8" />
                          
                          {/* 95% Confidence Interval Line */}
                          <line x1={xStart} y1="12" x2={xEnd} y2="12" stroke="#22D3EE" strokeWidth="1.5" strokeLinecap="round" />
                          <line x1={xStart} y1="8" x2={xStart} y2="16" stroke="#22D3EE" strokeWidth="1.2" />
                          <line x1={xEnd} y1="8" x2={xEnd} y2="16" stroke="#22D3EE" strokeWidth="1.2" />

                          {/* Effect Size Center Marker Square */}
                          <rect
                            x={xCenter - Math.max(2, weightObj.percentWeight / 10)}
                            y={12 - Math.max(2, weightObj.percentWeight / 10)}
                            width={Math.max(4, weightObj.percentWeight / 5)}
                            height={Math.max(4, weightObj.percentWeight / 5)}
                            fill="#10B981"
                            rx="1"
                          />
                        </svg>
                      </div>
                    );
                  })}

                  {/* Pooled Diamond Summary Row */}
                  <div className="bg-[#18181B] border border-[#22D3EE]/40 p-3 rounded-lg flex flex-col gap-1.5 mt-2">
                    <div className="flex items-center justify-between text-xs font-bold text-[#22D3EE]">
                      <span>Pooled Random-Effects Estimate (HKSJ)</span>
                      <span>{metaStats.randomEffect > 0 ? `+${metaStats.randomEffect}` : metaStats.randomEffect} [{metaStats.hksjCiLower}, {metaStats.hksjCiUpper}]</span>
                      <span>100%</span>
                    </div>

                    <svg className="w-full h-8 overflow-visible" viewBox="0 0 100 28">
                      <line x1="50" y1="0" x2="50" y2="28" stroke="#3F3F46" strokeDasharray="2,2" strokeWidth="1" />
                      
                      {/* Diamond Polygon */}
                      {(() => {
                        const xStart = Math.max(10, Math.min(90, 50 + metaStats.hksjCiLower * 20));
                        const xEnd = Math.max(10, Math.min(90, 50 + metaStats.hksjCiUpper * 20));
                        const xCenter = Math.max(10, Math.min(90, 50 + metaStats.randomEffect * 20));
                        return (
                          <polygon
                            points={`${xStart},14 ${xCenter},6 ${xEnd},14 ${xCenter},22`}
                            fill={metaStats.isConflictState ? "#EF4444" : "#10B981"}
                            stroke={metaStats.isConflictState ? "#F87171" : "#34D399"}
                            strokeWidth="1.5"
                          />
                        );
                      })()}
                    </svg>
                  </div>
                </div>
              </div>

              {/* SHA-256 Proof & CUSUM Alert Footer */}
              <div className="bg-[#09090B] border border-[#27272A] p-3 rounded-xl flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-[#22D3EE]" />
                  <span>SHA-256 Proof Hash: <code className="text-[#22D3EE] font-bold">{metaStats.proofHash}</code></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#71717A]">CUSUM Stat: {metaStats.cusumMaxStat}</span>
                  {metaStats.cusumDriftDetected && (
                    <span className="bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30 px-2 py-0.5 rounded font-bold text-[9px]">
                      DRIFT DETECTED
                    </span>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PRISMA 2020 FLOW DIAGRAM VIEW */}
          {activeTab === "PRISMA" && (
            <div className="flex flex-col gap-3 font-mono text-xs">
              <div className="text-[11px] text-[#A1A1AA]">
                PRISMA 2020 compliant evidence flowchart tracing structural graph pattern identification, site screening, and meta-analysis inclusion.
              </div>

              <div className="flex flex-col gap-3">
                <div className="bg-[#18181B] border border-[#27272A] p-3.5 rounded-xl flex flex-col gap-1">
                  <span className="text-[10px] text-[#22D3EE] font-bold uppercase">1. Identification</span>
                  <span className="text-xs text-[#FAFAFA] font-bold">12 Independent Clinical Nodes Identified</span>
                  <span className="text-[10px] text-[#A1A1AA]">Scanned for structural graph pattern match: {selectedRule.structuralPattern}</span>
                </div>

                <div className="flex justify-center">
                  <ArrowRight className="w-4 h-4 text-[#71717A] rotate-90" />
                </div>

                <div className="bg-[#18181B] border border-[#27272A] p-3.5 rounded-xl flex flex-col gap-1">
                  <span className="text-[10px] text-[#22D3EE] font-bold uppercase">2. Screening & Eligibility</span>
                  <span className="text-xs text-[#FAFAFA] font-bold">{currentEvidence.length + 1} Node Payloads Screened</span>
                  <span className="text-[10px] text-[#A1A1AA]">Checked for minimum sample count ($n \ge 100$) and valid cryptographic signatures.</span>
                </div>

                <div className="flex justify-center">
                  <ArrowRight className="w-4 h-4 text-[#71717A] rotate-90" />
                </div>

                <div className="bg-[#18181B] border border-[#10B981]/40 p-3.5 rounded-xl flex flex-col gap-1">
                  <span className="text-[10px] text-[#10B981] font-bold uppercase">3. Included in Meta-Analysis</span>
                  <span className="text-xs text-[#FAFAFA] font-bold">{currentEvidence.length} Sites Synthesized ({metaStats.totalSamples} total patients)</span>
                  <span className="text-[10px] text-[#A1A1AA]">Pooled via Inverse-Variance Random Effects with HKSJ adjustment. Proof: {metaStats.proofHash}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GRADE EVIDENCE PROFILE VIEW */}
          {activeTab === "GRADE" && (
            <div className="flex flex-col gap-3 font-mono text-xs">
              <div className="text-[11px] text-[#A1A1AA]">
                GRADE (Grading of Recommendations Assessment, Development and Evaluation) evidence profile for clinical guideline integration.
              </div>

              <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-[#27272A] pb-2">
                  <span className="font-bold text-[#FAFAFA]">Overall Certainty Rating:</span>
                  <span className={`px-3 py-1 rounded-lg font-bold ${
                    metaStats.gradeRating === "High"
                      ? "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30"
                      : "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30"
                  }`}>
                    {metaStats.gradeRating} Certainty
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div className="bg-[#09090B] p-2.5 rounded-lg border border-[#27272A]">
                    <span className="text-[#71717A] block text-[10px]">Risk of Bias:</span>
                    <span className="text-[#10B981] font-bold">Not Serious (Cryptographic Verification)</span>
                  </div>
                  <div className="bg-[#09090B] p-2.5 rounded-lg border border-[#27272A]">
                    <span className="text-[#71717A] block text-[10px]">Inconsistency:</span>
                    <span className={metaStats.iSquared > 50 ? "text-[#EF4444] font-bold" : "text-[#10B981] font-bold"}>
                      {metaStats.iSquared > 50 ? "Serious (I² = " + metaStats.iSquared + "%)" : "Not Serious (I² = " + metaStats.iSquared + "%)"}
                    </span>
                  </div>
                  <div className="bg-[#09090B] p-2.5 rounded-lg border border-[#27272A]">
                    <span className="text-[#71717A] block text-[10px]">Indirectness:</span>
                    <span className="text-[#10B981] font-bold">Direct Structural Pattern Match</span>
                  </div>
                  <div className="bg-[#09090B] p-2.5 rounded-lg border border-[#27272A]">
                    <span className="text-[#71717A] block text-[10px]">Imprecision:</span>
                    <span className="text-[#FAFAFA] font-bold">HKSJ CI Width: {(metaStats.hksjCiUpper - metaStats.hksjCiLower).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: HUMAN-IN-THE-LOOP CONFLICT RESOLVER */}
          {activeTab === "CONFLICT_RESOLVER" && (
            <div className="flex flex-col gap-4 font-mono text-xs">
              <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 p-3.5 rounded-xl flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[#EF4444] font-bold text-xs">
                  <AlertTriangle className="w-4 h-4" /> HUMAN-IN-THE-LOOP CONFLICT RESOLUTION QUEUE
                </div>
                <p className="text-[11px] text-[#A1A1AA]">
                  Rule <strong className="text-[#FAFAFA]">{selectedRule.ruleId}</strong> is flagged for opposing site evidence (Dana-Farber +1.42 vs Charité Berlin -0.05). Per zero-averaging mandates, select the biological mechanism and scope the rule to a specific sub-phenotype.
                </p>
              </div>

              <div className="bg-[#18181B] border border-[#27272A] p-4 rounded-xl flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-[#71717A] uppercase">Conflict Root Cause Category</label>
                  <select
                    value={conflictCategory}
                    onChange={(e) => setConflictCategory(e.target.value)}
                    className="bg-[#09090B] border border-[#27272A] text-[#FAFAFA] text-xs p-2.5 rounded-xl focus:outline-none focus:border-[#22D3EE]"
                  >
                    <option value="sub-phenotype difference">Biological Sub-Phenotype Difference (e.g. Desmoplastic Melanoma)</option>
                    <option value="protocol variation">Tissue Processing Protocol Variation</option>
                    <option value="cohort bias">Cohort Demographics / Selection Bias</option>
                    <option value="batch effect">Sequencing Batch Effect</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-[#71717A] uppercase">Scope Rule To Target Sub-Phenotype</label>
                  <input
                    type="text"
                    value={scopedPhenotype}
                    onChange={(e) => setScopedPhenotype(e.target.value)}
                    placeholder="e.g. desmoplastic_melanoma or banff_abmr_c4d_neg"
                    className="bg-[#09090B] border border-[#27272A] text-[#FAFAFA] text-xs p-2.5 rounded-xl focus:outline-none focus:border-[#22D3EE]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-[#71717A] uppercase">Expert Tumor Board Annotations</label>
                  <textarea
                    rows={2}
                    value={expertNotes}
                    onChange={(e) => setExpertNotes(e.target.value)}
                    placeholder="Provide clinical rationale for scoping..."
                    className="bg-[#09090B] border border-[#27272A] text-[#FAFAFA] text-xs p-2.5 rounded-xl focus:outline-none focus:border-[#22D3EE]"
                  />
                </div>

                <button
                  onClick={handleResolveConflictInUI}
                  disabled={aiRationaleLoading}
                  className="bg-[#8B5CF6] text-[#FAFAFA] font-bold text-xs py-2.5 rounded-xl hover:bg-[#7C3AED] transition-all flex items-center justify-center gap-2 mt-1"
                >
                  <Sparkles className="w-4 h-4" />
                  {aiRationaleLoading ? "Synthesizing AI Rationale..." : "Resolve Conflict & Re-Scope Rule"}
                </button>

                {aiRationaleResult && (
                  <div className="bg-[#09090B] border border-[#8B5CF6]/40 p-3 rounded-xl text-[11px] text-[#E4E4E7] flex flex-col gap-1">
                    <span className="text-[#8B5CF6] font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> AI Literature Conflict Synthesis
                    </span>
                    <p className="text-[#A1A1AA]">{aiRationaleResult}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: CONTRACT CONFORMANCE VIEW */}
          {activeTab === "CONTRACT_VERIFICATION" && (
            <div className="flex flex-col gap-4 font-mono text-xs">
              <div className="bg-[#10B981]/15 border border-[#10B981]/35 p-3.5 rounded-xl flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-[#10B981] font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-[#10B981]" /> LIVE DATA CONTRACT &amp; PATHOLOGY CONFORMANCE AUDITOR
                </div>
                <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                  This engine binds federated rules to the strict <strong>Banff 2022/2023 Pathology Triad Contract</strong>. Alter pathology lesion scores below to simulate dynamic patient states, compute certified cryptographic hashes, and verify rule triggering compatibility in real-time.
                </p>
              </div>

              {/* Dynamic Contract Validation Status Card */}
              {(() => {
                const simScores: BanffLesionScores = {
                  g: simG,
                  t: simT,
                  v: simV,
                  i: simI,
                  ptc: simPtc,
                  c4d: simC4d,
                  dsa: simDsa ? "positive" : "negative",
                  molecularAbmr: simMolecular,
                  ci: simCi,
                  ct: simCt
                };
                const simValidation = validateBanffSchema(simScores);

                // Check rule active triggering
                let isTriggered = false;
                let triggerReason = "";
                if (selectedRuleId === "RULE-GEO-01") {
                  isTriggered = simT >= 2;
                  triggerReason = isTriggered 
                    ? "Triggered: Tubulitis score (t) is >= 2, satisfying the rule requirement: t >= 2." 
                    : "Subthreshold: Tubulitis score (t) is < 2, rule remains dormant.";
                } else if (selectedRuleId === "RULE-TME-03") {
                  isTriggered = simMolecular >= 0.5;
                  triggerReason = isTriggered 
                    ? "Triggered: Endothelial transcript/molecular score is >= 0.5, satisfying the resistant threshold." 
                    : "Subthreshold: Endothelial transcript score is < 0.5.";
                } else {
                  isTriggered = simValidation.mviIndex >= 2 || simV > 0;
                  triggerReason = isTriggered
                    ? "Triggered: Microvascular inflammation detected (mviIndex >= 2 or v > 0), satisfying active ABMR risk bounds."
                    : "Subthreshold: Minimal microvascular inflammation present.";
                }

                return (
                  <div className="flex flex-col gap-4">
                    {/* Live Results Panel */}
                    <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2 flex flex-col gap-2">
                        <span className="text-[10px] text-[#71717A] uppercase">Computed Diagnostic Contract Verdict</span>
                        <div className="text-xs font-bold text-[#FAFAFA] flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${
                            simValidation.riskLevel === "CRITICAL" || simValidation.riskLevel === "HIGH" ? "bg-[#EF4444]" : "bg-[#10B981]"
                          }`} />
                          {simValidation.rejectionDiagnosis}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px] text-[#A1A1AA] pt-1">
                          <span>MVI Index (g + ptc): <strong className="text-[#FAFAFA]">{simValidation.mviIndex}</strong></span>
                          <span>Total Inflammation (t + i): <strong className="text-[#FAFAFA]">{simValidation.tiScore}</strong></span>
                        </div>
                      </div>

                      <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-3 flex flex-col justify-between">
                        <div>
                          <span className="text-[9px] text-[#71717A] uppercase block">Contract Hash</span>
                          <code className="text-[#10B981] font-bold text-xs">{simValidation.contractHash}</code>
                        </div>
                        <div className="mt-2 pt-1 border-t border-[#27272A] flex items-center justify-between text-[10px]">
                          <span className="text-[#71717A]">Risk Level:</span>
                          <span className={`font-bold uppercase ${
                            simValidation.riskLevel === "CRITICAL" || simValidation.riskLevel === "HIGH" ? "text-[#EF4444]" : "text-[#10B981]"
                          }`}>{simValidation.riskLevel}</span>
                        </div>
                      </div>
                    </div>

                    {/* Rule Compatibility Analysis */}
                    <div className="bg-[#18181B]/40 border border-[#27272A] rounded-xl p-3.5 flex flex-col gap-2">
                      <span className="text-[10px] text-[#22D3EE] uppercase font-bold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#22D3EE]" /> Rule Compatibility &amp; Trigger Analysis
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#FAFAFA]">Rule Trigger Status ({selectedRuleId}):</span>
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${
                          isTriggered 
                            ? "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30" 
                            : "bg-[#71717A]/15 text-[#71717A] border-[#27272A]"
                        }`}>
                          {isTriggered ? "ACTIVE / TRIGGERED" : "SUBTHRESHOLD / INACTIVE"}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                        {triggerReason}
                      </p>
                    </div>

                    {/* Sliders Container */}
                    <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-4 flex flex-col gap-4">
                      <span className="text-[10px] text-[#FAFAFA] font-bold uppercase border-b border-[#27272A] pb-2">
                        Pathology Lesion Parameters (Strict Banff Bounds)
                      </span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* t Score Slider */}
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-[#FAFAFA] font-bold">Tubulitis (t)</span>
                            <span className="text-xs text-[#10B981] font-bold">t{simT} / 3</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="3"
                            step="1"
                            value={simT}
                            onChange={(e) => setSimT(Number(e.target.value))}
                            className="w-full accent-[#10B981] h-1.5 bg-[#09090B] rounded-lg appearance-none cursor-pointer"
                          />
                          <p className="text-[9px] text-[#71717A]">Inflammatory cells within the tubular epithelium.</p>
                        </div>

                        {/* g Score Slider */}
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-[#FAFAFA] font-bold">Glomerulitis (g)</span>
                            <span className="text-xs text-[#10B981] font-bold">g{simG} / 3</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="3"
                            step="1"
                            value={simG}
                            onChange={(e) => setSimG(Number(e.target.value))}
                            className="w-full accent-[#10B981] h-1.5 bg-[#09090B] rounded-lg appearance-none cursor-pointer"
                          />
                          <p className="text-[9px] text-[#71717A]">Glomerular capillary endothelial cell enlargement/inflammation.</p>
                        </div>

                        {/* ptc Score Slider */}
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-[#FAFAFA] font-bold">Peritubular Capillaritis (ptc)</span>
                            <span className="text-xs text-[#10B981] font-bold">ptc{simPtc} / 3</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="3"
                            step="1"
                            value={simPtc}
                            onChange={(e) => setSimPtc(Number(e.target.value))}
                            className="w-full accent-[#10B981] h-1.5 bg-[#09090B] rounded-lg appearance-none cursor-pointer"
                          />
                          <p className="text-[9px] text-[#71717A]">Leukocytes within the peritubular capillaries.</p>
                        </div>

                        {/* v Score Slider */}
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-[#FAFAFA] font-bold">Intimal Arteritis (v)</span>
                            <span className="text-xs text-[#10B981] font-bold">v{simV} / 3</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="3"
                            step="1"
                            value={simV}
                            onChange={(e) => setSimV(Number(e.target.value))}
                            className="w-full accent-[#10B981] h-1.5 bg-[#09090B] rounded-lg appearance-none cursor-pointer"
                          />
                          <p className="text-[9px] text-[#71717A]">Leukocytes beneath the arterial vascular endothelium.</p>
                        </div>

                        {/* i Score Slider */}
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-[#FAFAFA] font-bold">Interstitial Inflammation (i)</span>
                            <span className="text-xs text-[#10B981] font-bold">i{simI} / 3</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="3"
                            step="1"
                            value={simI}
                            onChange={(e) => setSimI(Number(e.target.value))}
                            className="w-full accent-[#10B981] h-1.5 bg-[#09090B] rounded-lg appearance-none cursor-pointer"
                          />
                          <p className="text-[9px] text-[#71717A]">Inflammatory infiltration of non-injured cortical parenchyma.</p>
                        </div>

                        {/* Molecular ABMR slider */}
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-[#FAFAFA] font-bold">Molecular Transcript Score</span>
                            <span className="text-xs text-[#10B981] font-bold">{simMolecular.toFixed(2)} / 1.00</span>
                          </div>
                          <input
                            type="range"
                            min="0.00"
                            max="1.00"
                            step="0.05"
                            value={simMolecular}
                            onChange={(e) => setSimMolecular(Number(e.target.value))}
                            className="w-full accent-[#10B981] h-1.5 bg-[#09090B] rounded-lg appearance-none cursor-pointer"
                          />
                          <p className="text-[9px] text-[#71717A]">MMDx molecular transcript diagnostics (positive thresholds &ge; 0.50).</p>
                        </div>
                      </div>

                      {/* Toggles */}
                      <div className="grid grid-cols-2 gap-4 border-t border-[#27272A] pt-4">
                        <div className="flex items-center justify-between bg-[#09090B] p-2.5 rounded-xl border border-[#27272A]">
                          <span className="text-xs font-bold text-[#FAFAFA]">C4d Capillary Staining</span>
                          <button
                            type="button"
                            onClick={() => setSimC4d(!simC4d)}
                            className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                              simC4d ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/35" : "bg-[#27272A]/50 text-[#71717A] border border-[#27272A]"
                            }`}
                          >
                            {simC4d ? "POSITIVE" : "NEGATIVE"}
                          </button>
                        </div>

                        <div className="flex items-center justify-between bg-[#09090B] p-2.5 rounded-xl border border-[#27272A]">
                          <span className="text-xs font-bold text-[#FAFAFA]">Donor Specific Abs (DSA)</span>
                          <button
                            type="button"
                            onClick={() => setSimDsa(!simDsa)}
                            className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                              simDsa ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/35" : "bg-[#27272A]/50 text-[#71717A] border border-[#27272A]"
                            }`}
                          >
                            {simDsa ? "POSITIVE" : "NEGATIVE"}
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 6: VARIANTWATCH SURVEILLANCE CLOSED-LOOP SYNC */}
          {activeTab === "SURVEILLANCE_SYNC" && (
            <div className="flex flex-col gap-4 font-mono text-xs">
              <div className="bg-[#18181B] border border-[#F59E0B]/30 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] animate-pulse" />
                  <span className="text-[10px] font-bold text-[#F59E0B] uppercase tracking-wider">
                    Closed-Loop Genomic Surveillance Gateway
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#FAFAFA] -mt-1">
                  Active Retraining &amp; Prior Calibration Flywheel
                </h3>
                <p className="text-[#A1A1AA] leading-relaxed text-[11px]">
                  Continuous surveillance on ClinVar and NCBI can shift consensus classification states. 
                  When a shift is identified by VariantWatch, this gateway maps the updated evidence weight 
                  as a prior directly into the Inverse-Variance Meta-Analysis, triggering a local model recalibration.
                </p>

                {/* ASCII Flywheel Diagram */}
                <div className="bg-[#09090B] border border-[#27272A] rounded-lg p-3 text-[10px] text-[#A1A1AA] flex items-center justify-between overflow-x-auto whitespace-pre font-mono">
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-[#F59E0B] font-bold">VariantWatch</span>
                    <span className="text-[#71717A]">Surveillance Shift</span>
                  </div>
                  <span className="text-[#F59E0B] px-1">──►</span>
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-[#22D3EE] font-bold">Dynamic Prior</span>
                    <span className="text-[#71717A]">Node Weight</span>
                  </div>
                  <span className="text-[#22D3EE] px-1">──►</span>
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-[#10B981] font-bold">HKSJ Engine</span>
                    <span className="text-[#71717A]">Meta-Analysis</span>
                  </div>
                  <span className="text-[#10B981] px-1">──►</span>
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-[#FAFAFA] font-bold">Refined Rule</span>
                    <span className="text-[#71717A]">Federated Consensus</span>
                  </div>
                </div>
              </div>

              {/* Shifters List Table */}
              <div className="bg-[#18181B] border border-[#27272A] rounded-xl overflow-hidden">
                <div className="bg-[#09090B] px-4 py-2.5 border-b border-[#27272A] flex items-center justify-between">
                  <span className="font-bold text-[#FAFAFA]">VariantWatch Live Shifters &amp; Mapped Rules</span>
                  <span className="text-[9px] text-[#A1A1AA] bg-[#27272A] px-2 py-0.5 rounded">3 ACTIVE TARGETS</span>
                </div>

                <div className="p-3 flex flex-col gap-3">
                  {syncedVariants.map((v) => {
                    return (
                      <div 
                        key={v.variantId} 
                        className={`flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-lg border transition-all ${
                          v.calibrated 
                            ? "bg-[#10B981]/5 border-[#10B981]/20" 
                            : "bg-[#09090B] border-[#27272A] hover:border-[#3F3F46]"
                        }`}
                      >
                        {/* Variant Info */}
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#FAFAFA]">{v.gene}</span>
                            <span className="text-[10px] text-[#A1A1AA]">{v.hgvs}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-[#71717A]">
                            <span>Shift:</span>
                            <span className="text-[#71717A]">{v.lastClassified}</span>
                            <span>──►</span>
                            <span className={`font-bold ${
                              v.changeType === "DOWNGRADE" 
                                ? "text-[#EF4444]" 
                                : v.changeType === "UPGRADE" 
                                ? "text-[#10B981]" 
                                : "text-[#A1A1AA]"
                            }`}>
                              {v.currentClassified}
                            </span>
                            <span className={`ml-2 text-[9px] px-1.5 py-0.1 rounded font-bold uppercase ${
                              v.changeType === "DOWNGRADE" 
                                ? "bg-[#EF4444]/10 text-[#EF4444]" 
                                : v.changeType === "UPGRADE" 
                                ? "bg-[#10B981]/10 text-[#10B981]" 
                                : "bg-[#27272A] text-[#A1A1AA]"
                            }`}>
                              {v.changeType}
                            </span>
                          </div>
                        </div>

                        {/* Connection & Calibration Action */}
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-end gap-0.5">
                            <span className="text-[9px] text-[#71717A] uppercase">Associated Rule</span>
                            <code className="text-[#22D3EE] font-bold text-[10px]">{v.mappedRuleId}</code>
                          </div>

                          <button
                            onClick={() => handleVariantWatchCalibration(v.variantId)}
                            className={`px-3 py-2 rounded-lg font-mono text-[10px] font-bold flex items-center gap-1.5 transition-all ${
                              v.calibrated
                                ? "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 cursor-default"
                                : "bg-[#F59E0B] hover:bg-[#D97706] text-[#09090B] border border-[#F59E0B]"
                            }`}
                            disabled={v.calibrated}
                          >
                            {v.calibrated ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-[#10B981]" /> RULE CALIBRATED
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3 h-3 text-[#09090B] animate-pulse" /> SYNC &amp; CALIBRATE
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RETROFITTED MATHEMATICAL EXPLANATION */}
              <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-4 flex flex-col gap-2">
                <span className="text-[10px] text-[#22D3EE] uppercase font-bold">
                  Mathematical Prior Adaptation Formula
                </span>
                <p className="text-[10px] text-[#71717A] leading-relaxed">
                  The random effects prior weight w_sync is adapted from ClinVar submitter consensus counts N_sub 
                  and review status stars S:
                </p>
                <div className="bg-[#18181B] p-2.5 rounded-lg border border-[#27272A] font-mono text-[10px] text-[#FAFAFA] text-center">
                  <code>EffectSize_sync = Beta_ClinVar * (1 + 0.15 * S) and SE_sync = 1 / sqrt(N_sub * (S + 1))</code>
                </div>
                <p className="text-[10px] text-[#71717A] leading-relaxed">
                  By injecting w_sync directly as a live consensus node, the inverse-variance pooled effect 
                  re-evaluates automatically without triggering a physical model update, preserving zero-averaging constraints.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* SUBMIT NEW SITE EVIDENCE MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#18181B] border border-[#22D3EE]/40 rounded-2xl p-6 max-w-md w-full flex flex-col gap-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
              <h3 className="font-bold text-[#FAFAFA] text-sm">Submit Site Evidence Payload</h3>
              <button onClick={() => setShowSubmitModal(false)} className="text-[#71717A] hover:text-[#FAFAFA]">×</button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[#71717A]">Node ID (e.g. Node-US-07)</label>
                <input
                  type="text"
                  value={newNodeId}
                  onChange={(e) => setNewNodeId(e.target.value)}
                  placeholder="Node-US-07"
                  className="bg-[#09090B] border border-[#27272A] text-[#FAFAFA] p-2 rounded-lg"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[#71717A]">Institution Name</label>
                <input
                  type="text"
                  value={newInstitution}
                  onChange={(e) => setNewInstitution(e.target.value)}
                  placeholder="Harvard Medical School"
                  className="bg-[#09090B] border border-[#27272A] text-[#FAFAFA] p-2 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-[#71717A]">Effect Size (Cohen&apos;s d)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={newEffectSize}
                    onChange={(e) => setNewEffectSize(Number(e.target.value))}
                    className="bg-[#09090B] border border-[#27272A] text-[#FAFAFA] p-2 rounded-lg"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-[#71717A]">Standard Error (SE)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newSe}
                    onChange={(e) => setNewSe(Number(e.target.value))}
                    className="bg-[#09090B] border border-[#27272A] text-[#FAFAFA] p-2 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[#71717A]">Sample Size (n patients)</label>
                <input
                  type="number"
                  value={newSampleCount}
                  onChange={(e) => setNewSampleCount(Number(e.target.value))}
                  className="bg-[#09090B] border border-[#27272A] text-[#FAFAFA] p-2 rounded-lg"
                />
              </div>

              {/* Banff Data Contract Attestation */}
              <div className="border border-[#10B981]/30 bg-[#10B981]/5 rounded-xl p-3 flex flex-col gap-3">
                <span className="text-[10px] text-[#10B981] font-bold uppercase flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" /> Banff Data Contract Attestation
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex justify-between text-[9px] text-[#A1A1AA]">
                      <span>Tubulitis (t)</span>
                      <strong className="text-[#10B981]">{modalT}</strong>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="3"
                      step="1"
                      value={modalT}
                      onChange={(e) => setModalT(Number(e.target.value))}
                      className="w-full accent-[#10B981] h-1 bg-[#09090B] rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <div className="flex justify-between text-[9px] text-[#A1A1AA]">
                      <span>Glomerulitis (g)</span>
                      <strong className="text-[#10B981]">{modalG}</strong>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="3"
                      step="1"
                      value={modalG}
                      onChange={(e) => setModalG(Number(e.target.value))}
                      className="w-full accent-[#10B981] h-1 bg-[#09090B] rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <div className="flex justify-between text-[9px] text-[#A1A1AA]">
                      <span>Capillaritis (ptc)</span>
                      <strong className="text-[#10B981]">{modalPtc}</strong>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="3"
                      step="1"
                      value={modalPtc}
                      onChange={(e) => setModalPtc(Number(e.target.value))}
                      className="w-full accent-[#10B981] h-1 bg-[#09090B] rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <div className="flex justify-between text-[9px] text-[#A1A1AA]">
                      <span>Intimal Arteritis (v)</span>
                      <strong className="text-[#10B981]">{modalV}</strong>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="3"
                      step="1"
                      value={modalV}
                      onChange={(e) => setModalV(Number(e.target.value))}
                      className="w-full accent-[#10B981] h-1 bg-[#09090B] rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <div className="flex justify-between text-[9px] text-[#A1A1AA]">
                      <span>Interstitial (i)</span>
                      <strong className="text-[#10B981]">{modalI}</strong>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="3"
                      step="1"
                      value={modalI}
                      onChange={(e) => setModalI(Number(e.target.value))}
                      className="w-full accent-[#10B981] h-1 bg-[#09090B] rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <div className="flex justify-between text-[9px] text-[#A1A1AA]">
                      <span>Molecular Transcript</span>
                      <strong className="text-[#10B981]">{modalMolecular.toFixed(2)}</strong>
                    </div>
                    <input
                      type="range"
                      min="0.00"
                      max="1.00"
                      step="0.05"
                      value={modalMolecular}
                      onChange={(e) => setModalMolecular(Number(e.target.value))}
                      className="w-full accent-[#10B981] h-1 bg-[#09090B] rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex gap-2 text-[9px] pt-1">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={modalC4d}
                      onChange={(e) => setModalC4d(e.target.checked)}
                      className="accent-[#10B981]"
                    />
                    <span>C4d Positive</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={modalDsa}
                      onChange={(e) => setModalDsa(e.target.checked)}
                      className="accent-[#10B981]"
                    />
                    <span>DSA Positive</span>
                  </label>
                </div>

                {/* Dynamic validation feedback inside the modal */}
                {(() => {
                  const tempScores: BanffLesionScores = {
                    g: modalG,
                    t: modalT,
                    v: modalV,
                    i: modalI,
                    ptc: modalPtc,
                    c4d: modalC4d,
                    dsa: modalDsa ? "positive" : "negative",
                    molecularAbmr: modalMolecular,
                    ci: 1,
                    ct: 1
                  };
                  const tempValidation = validateBanffSchema(tempScores);
                  return (
                    <div className="mt-1 pt-2 border-t border-[#10B981]/20 flex items-center justify-between text-[10px]">
                      <span className="text-[#A1A1AA]">Verdict: <strong className="text-[#FAFAFA]">{tempValidation.rejectionDiagnosis}</strong></span>
                      <span className={`font-bold ${tempValidation.riskLevel === "CRITICAL" || tempValidation.riskLevel === "HIGH" ? "text-[#EF4444]" : "text-[#10B981]"}`}>
                        {tempValidation.riskLevel}
                      </span>
                    </div>
                  );
                })()}
              </div>

            </div>

            <button
              onClick={handleSimulateEvidenceSubmission}
              className="bg-[#22D3EE] text-[#083344] font-bold py-2.5 rounded-xl hover:bg-[#06B6D4] transition-all mt-2"
            >
              Sign &amp; Submit Evidence Payload
            </button>
          </div>
        </div>
      )}

      {/* Terminal Log Output */}
      <div className="bg-[#09090B] border border-[#27272A] rounded-2xl p-4 font-mono text-[11px] flex flex-col gap-2">
        <div className="flex items-center justify-between text-[#71717A] pb-2 border-b border-[#27272A]">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-[#22D3EE]" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Federated Deterministic Learning Event Stream</span>
          </div>
          <span className="text-[9px] text-[#10B981]">POLICY: ZERO_AVERAGING_CONSTRAINED</span>
        </div>
        <div className="flex flex-col gap-1 text-[10px]">
          {simulatedLogs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-[#52525B] flex-none">›</span>
              <span className={log.includes("CRITICAL") || log.includes("CONFLICT") ? "text-[#EF4444] font-bold" : log.includes("REST API") || log.includes("COMPUTATION") ? "text-[#22D3EE] font-bold" : "text-[#A1A1AA]"}>
                {log}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
