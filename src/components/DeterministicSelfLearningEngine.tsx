import { useState } from "react";
import { 
  GitBranch, 
  GitMerge, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Terminal, 
  Network, 
  Sliders, 
  Layers, 
  Cpu, 
  FileCode2, 
  Play, 
  RotateCcw,
  Sparkles,
  Search,
  Scale
} from "lucide-react";

interface NodeSummary {
  nodeId: string;
  institution: string;
  evidencePattern: string;
  graphTopology: string;
  effectSize: number; // Cohen's d or Log2 Fold Change
  ciLower: number;
  ciUpper: number;
  confidence: number;
  sampleCount: number;
  status: "CONSISTENT" | "CONFLICT_STATE" | "INSUFFICIENT_NODES";
}

interface DeterministicRule {
  ruleId: string;
  targetDomain: string;
  statement: string;
  thresholdN: number; // Min independent nodes required
  currentSupportingNodes: number;
  structuralPattern: string;
  minEffectSize: number;
  maxCiSpan: number;
  ruleStatus: "VERIFIED_ACTIVE" | "CONFLICT_FLAGGED" | "PENDING_CONSENSUS";
  conflictNodes?: string[];
  lastUpdated: string;
  proofHash: string;
}

const initialRules: DeterministicRule[] = [
  {
    ruleId: "RULE-GEO-01",
    targetDomain: "Transplant Rejection cfRNA",
    statement: "IF podocyte_fraction > 0.12 AND tubulitis_score >= 2 THEN flag_TCMR_IB_rejection",
    thresholdN: 3,
    currentSupportingNodes: 4,
    structuralPattern: "Graph pattern: [cfRNA Podocyte] -> (Correlates >= 0.82) -> [Banff t2/g2 Lesion]",
    minEffectSize: 0.80,
    maxCiSpan: 0.15,
    ruleStatus: "VERIFIED_ACTIVE",
    lastUpdated: "2026-08-20T07:40:00Z",
    proofHash: "0x9f82a1c0d482e1",
  },
  {
    ruleId: "RULE-ONC-02",
    targetDomain: "Neoantigen Immunogenicity",
    statement: "IF MHC_Kd < 50nM AND RNA_TPM > 10.0 AND mutant_entropy > 0.65 THEN classify_HighConfidenceVaccine",
    thresholdN: 3,
    currentSupportingNodes: 3,
    structuralPattern: "Graph pattern: [MHC-I Bind] -> (Kd <= 50) -> [T-Cell Receptor Activation]",
    minEffectSize: 1.20,
    maxCiSpan: 0.20,
    ruleStatus: "VERIFIED_ACTIVE",
    lastUpdated: "2026-08-20T07:42:15Z",
    proofHash: "0x4b12f9e8012c88",
  },
  {
    ruleId: "RULE-TME-03",
    targetDomain: "Spatial Immune Checkpoint",
    statement: "IF spatial_margin_distance <= 20um AND PD-L1_TPM > 5.0 THEN flag_ImmuneCheckpointResistant",
    thresholdN: 4,
    currentSupportingNodes: 2, // Node A says effect (+1.42), Node B says no effect (-0.05) -> Conflict Flagged!
    structuralPattern: "Graph pattern: [Invasive Margin CD8+] -> (Distance <= 20um) -> [PD-L1 Engagement]",
    minEffectSize: 0.75,
    maxCiSpan: 0.25,
    ruleStatus: "CONFLICT_FLAGGED",
    conflictNodes: ["Node-TX-04 (Dana-Farber)", "Node-EU-02 (Charité Berlin)"],
    lastUpdated: "2026-08-20T07:44:30Z",
    proofHash: "0xCONFLICT_STATE_0x82a9",
  },
  {
    ruleId: "RULE-MRD-04",
    targetDomain: "Liquid Biopsy ctDNA Clearance",
    statement: "IF post_op_ctDNA_VAF < 10PPM AND fragment_WPS > 0.85 THEN declare_MolecularRemission",
    thresholdN: 3,
    currentSupportingNodes: 2,
    structuralPattern: "Graph pattern: [ctDNA UMI Depth >= 30000x] -> (VAF < 10 PPM) -> [Zero Recurrence 12M]",
    minEffectSize: 0.95,
    maxCiSpan: 0.10,
    ruleStatus: "PENDING_CONSENSUS",
    lastUpdated: "2026-08-20T07:45:00Z",
    proofHash: "0x33b1e70d1998f4",
  },
];

const nodeSummariesData: Record<string, NodeSummary[]> = {
  "RULE-GEO-01": [
    { nodeId: "Node-US-01", institution: "Stanford Medicine", evidencePattern: "Podocyte/Tubular cfRNA Ratio", graphTopology: "[cfRNA] -> [Banff t2/g2]", effectSize: 0.88, ciLower: 0.82, ciUpper: 0.94, confidence: 0.96, sampleCount: 840, status: "CONSISTENT" },
    { nodeId: "Node-US-02", institution: "Johns Hopkins", evidencePattern: "Podocyte/Tubular cfRNA Ratio", graphTopology: "[cfRNA] -> [Banff t2/g2]", effectSize: 0.84, ciLower: 0.78, ciUpper: 0.90, confidence: 0.94, sampleCount: 620, status: "CONSISTENT" },
    { nodeId: "Node-EU-01", institution: "INSERM Paris", evidencePattern: "Podocyte/Tubular cfRNA Ratio", graphTopology: "[cfRNA] -> [Banff t2/g2]", effectSize: 0.86, ciLower: 0.80, ciUpper: 0.92, confidence: 0.95, sampleCount: 510, status: "CONSISTENT" },
    { nodeId: "Node-APAC-01", institution: "Kyoto University", evidencePattern: "Podocyte/Tubular cfRNA Ratio", graphTopology: "[cfRNA] -> [Banff t2/g2]", effectSize: 0.82, ciLower: 0.75, ciUpper: 0.89, confidence: 0.92, sampleCount: 430, status: "CONSISTENT" },
  ],
  "RULE-TME-03": [
    { nodeId: "Node-US-03", institution: "Dana-Farber Cancer Inst", evidencePattern: "Spatial PD-L1 Margin Proximity", graphTopology: "[Invasive Margin] -> [PD-L1]", effectSize: 1.42, ciLower: 1.20, ciUpper: 1.64, confidence: 0.98, sampleCount: 320, status: "CONSISTENT" },
    { nodeId: "Node-EU-02", institution: "Charité Berlin", evidencePattern: "Spatial PD-L1 Margin Proximity", graphTopology: "[Invasive Margin] -> [PD-L1]", effectSize: -0.05, ciLower: -0.22, ciUpper: 0.12, confidence: 0.91, sampleCount: 290, status: "CONFLICT_STATE" },
    { nodeId: "Node-US-04", institution: "MD Anderson", evidencePattern: "Spatial PD-L1 Margin Proximity", graphTopology: "[Invasive Margin] -> [PD-L1]", effectSize: 1.35, ciLower: 1.15, ciUpper: 1.55, confidence: 0.96, sampleCount: 410, status: "CONSISTENT" },
  ]
};

export function DeterministicSelfLearningEngine() {
  const [selectedRule, setSelectedRule] = useState<DeterministicRule>(initialRules[2]); // Default to CONFLICT_FLAGGED Rule
  const [minIndependentNodes, setMinIndependentNodes] = useState<number>(3);
  const [effectSizeThreshold, setEffectSizeThreshold] = useState<number>(0.75);
  const [ciSpanMax, setCiSpanMax] = useState<number>(0.25);
  const [simulatedLogs, setSimulatedLogs] = useState<string[]>([
    "[SYSTEM] Deterministic Self-Learning Engine v2.5 initialized.",
    "[PROTOCOL] Rule aggregation policy: Merging structural summaries ONLY (Zero raw data transfer).",
    "[RULE EVALUATION] Rule RULE-TME-03: Node-US-03 (+1.42) vs Node-EU-02 (-0.05) -> NO AVERAGING PERMITTED.",
    "[CONFLICT RESOLUTION] Flagged CONFLICT_STATE for RULE-TME-03. Rule execution suspended until cohort stratification resolved."
  ]);

  const activeSummaries = nodeSummariesData[selectedRule.ruleId] || [
    { nodeId: "Node-01", institution: "Global Node Alpha", evidencePattern: selectedRule.structuralPattern, graphTopology: selectedRule.structuralPattern, effectSize: 0.92, ciLower: 0.85, ciUpper: 0.99, confidence: 0.95, sampleCount: 500, status: "CONSISTENT" },
    { nodeId: "Node-02", institution: "Global Node Beta", evidencePattern: selectedRule.structuralPattern, graphTopology: selectedRule.structuralPattern, effectSize: 0.88, ciLower: 0.80, ciUpper: 0.96, confidence: 0.94, sampleCount: 420, status: "CONSISTENT" },
  ];

  // Resolve conflict or trigger rule evaluation deterministically
  const handleEvaluateRule = (rule: DeterministicRule) => {
    setSelectedRule(rule);
    setSimulatedLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] EVALUATING_RULE: ${rule.ruleId} against ≥${minIndependentNodes} independent nodes...`,
      `[STRUCTURAL CHECK] Graph pattern match: ${rule.structuralPattern}`,
      ...prev
    ]);

    if (rule.ruleStatus === "CONFLICT_FLAGGED") {
      setSimulatedLogs((prev) => [
        `[CRITICAL CONFLICT DETECTED] Node A (Dana-Farber, Effect=+1.42) != Node B (Charité, Effect=-0.05).`,
        `[NON-AVERAGING PRINCIPLE] Averaging prohibited to prevent masking biological sub-phenotypes. Rule flagged as CONFLICT_STATE.`,
        ...prev
      ]);
    } else {
      setSimulatedLogs((prev) => [
        `[DETERMINISTIC CONSENSUS] ${rule.currentSupportingNodes} / ${rule.thresholdN} nodes confirm effect size >= ${effectSizeThreshold}.`,
        `[RULE UPDATED] Rule ${rule.ruleId} verified active & signed into global deterministic contract.`,
        ...prev
      ]);
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
              DETERMINISTIC SELF-LEARNING ARCHITECTURE
            </span>
            <span className="text-[10px] font-mono text-[#71717A]">
              SUMMARY_MERGE_NO_MODELS
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#FAFAFA] flex items-center gap-2">
            Deterministic Rule-Based Self-Learning Engine
          </h2>
          <p className="text-xs text-[#A1A1AA] max-w-3xl">
            Global self-learning operates strictly by merging structural evidence summaries (graph patterns, effect sizes, confidence bounds) across independent nodes. Averaging conflicting signals is strictly prohibited — conflicting nodes trigger explicit <code className="text-[#EF4444]">CONFLICT_STATE</code> flags.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right font-mono text-[10px]">
            <span className="text-[#71717A]">Global Learning Mode:</span>
            <span className="text-[#10B981] font-bold">MERGE SUMMARIES ONLY</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#22D3EE]/10 border border-[#22D3EE]/30 flex items-center justify-center text-[#22D3EE]">
            <GitMerge className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Principles Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-[#09090B] border border-[#27272A] rounded-2xl p-4 flex flex-col gap-1.5">
          <span className="text-[10px] font-mono text-[#71717A] uppercase flex items-center gap-1.5">
            <Network className="w-3.5 h-3.5 text-[#22D3EE]" /> 1. Data Isolation
          </span>
          <span className="text-xs font-bold text-[#FAFAFA]">Merge Summaries, Not Data</span>
          <span className="text-[10px] text-[#A1A1AA]">Zero raw genomic data or dense model weights leave local nodes.</span>
        </div>

        <div className="bg-[#09090B] border border-[#27272A] rounded-2xl p-4 flex flex-col gap-1.5">
          <span className="text-[10px] font-mono text-[#71717A] uppercase flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-[#10B981]" /> 2. Aggregation Rule
          </span>
          <span className="text-xs font-bold text-[#FAFAFA]">Update Rule R if ≥N Nodes Confirm</span>
          <span className="text-[10px] text-[#A1A1AA]">Update rule R if ≥N independent nodes show consistent evidence E.</span>
        </div>

        <div className="bg-[#09090B] border border-[#27272A] rounded-2xl p-4 flex flex-col gap-1.5">
          <span className="text-[10px] font-mono text-[#71717A] uppercase flex items-center gap-1.5">
            <FileCode2 className="w-3.5 h-3.5 text-[#8B5CF6]" /> 3. Structural Evidence
          </span>
          <span className="text-xs font-bold text-[#FAFAFA]">Graph + Effect Size + CI</span>
          <span className="text-[10px] text-[#A1A1AA]">Evidence defined by graph patterns, effect sizes, and 95% CIs.</span>
        </div>

        <div className="bg-[#09090B] border border-[#27272A] rounded-2xl p-4 flex flex-col gap-1.5">
          <span className="text-[10px] font-mono text-[#71717A] uppercase flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-[#EF4444]" /> 4. Conflict Resolution
          </span>
          <span className="text-xs font-bold text-[#FAFAFA]">Never Average Conflicts</span>
          <span className="text-[10px] text-[#A1A1AA]">If Node A says 'effect' and Node B says 'no effect', flag CONFLICT_STATE.</span>
        </div>

      </div>

      {/* Interactive Controls & Rule Catalog */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Rules Table */}
        <div className="lg:col-span-7 bg-[#09090B] border border-[#27272A] rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
            <div>
              <span className="text-[10px] font-mono text-[#22D3EE] uppercase font-bold">
                Global Self-Learning Rule Portfolio
              </span>
              <h3 className="text-sm font-bold text-[#FAFAFA]">
                Deterministic Rule Catalog
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#71717A] bg-[#18181B] px-2.5 py-1 rounded-lg border border-[#27272A]">
              Aggregation Policy: N ≥ {minIndependentNodes}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {initialRules.map((rule) => {
              const isSelected = selectedRule.ruleId === rule.ruleId;
              return (
                <div
                  key={rule.ruleId}
                  onClick={() => handleEvaluateRule(rule)}
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

                    {rule.ruleStatus === "VERIFIED_ACTIVE" ? (
                      <span className="px-2.5 py-0.5 rounded-md bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 text-[10px] font-mono font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> VERIFIED ACTIVE
                      </span>
                    ) : rule.ruleStatus === "CONFLICT_FLAGGED" ? (
                      <span className="px-2.5 py-0.5 rounded-md bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30 text-[10px] font-mono font-bold flex items-center gap-1 animate-pulse">
                        <AlertTriangle className="w-3 h-3" /> CONFLICT FLAGGED
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-md bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30 text-[10px] font-mono font-bold flex items-center gap-1">
                        PENDING CONSENSUS
                      </span>
                    )}
                  </div>

                  <div className="bg-[#09090B] border border-[#27272A] rounded-lg p-2.5 font-mono text-[11px] text-[#A1A1AA] overflow-x-auto">
                    <code>{rule.statement}</code>
                  </div>

                  <div className="flex items-center justify-between font-mono text-[10px] text-[#71717A] pt-1">
                    <span>
                      Supporting Nodes: <strong className="text-[#FAFAFA]">{rule.currentSupportingNodes} / {rule.thresholdN}</strong>
                    </span>
                    <span>Proof Hash: <code className="text-[#22D3EE]">{rule.proofHash}</code></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Rule Node Summary Evidence & Conflict Inspector */}
        <div className="lg:col-span-5 bg-[#09090B] border border-[#27272A] rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
            <div>
              <span className="text-[10px] font-mono text-[#22D3EE] uppercase font-bold">
                Rule Evidence Inspector
              </span>
              <h3 className="text-sm font-bold text-[#FAFAFA]">
                {selectedRule.ruleId} // {selectedRule.targetDomain}
              </h3>
            </div>
            <Cpu className="w-5 h-5 text-[#22D3EE]" />
          </div>

          <div className="flex flex-col gap-3 font-mono text-[11px]">
            {/* Structural Graph Pattern Spec */}
            <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-3 flex flex-col gap-1">
              <span className="text-[10px] text-[#71717A] uppercase">Structural Graph Evidence Pattern</span>
              <span className="text-xs text-[#22D3EE] font-bold">{selectedRule.structuralPattern}</span>
            </div>

            {/* Conflict Warning or Verification Banner */}
            {selectedRule.ruleStatus === "CONFLICT_FLAGGED" ? (
              <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[#EF4444] font-bold text-xs">
                  <AlertTriangle className="w-4 h-4" /> CONFLICT STATE ENFORCED (NO AVERAGING)
                </div>
                <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                  Node A (Dana-Farber) reported strong effect (+1.42), while Node B (Charité Berlin) reported no effect (-0.05). System refused to average signals to prevent biological artifact masking.
                </p>
                <div className="text-[10px] text-[#EF4444] font-bold">
                  Conflicting Nodes: {selectedRule.conflictNodes?.join(" vs ")}
                </div>
              </div>
            ) : (
              <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl p-3 flex items-center justify-between text-xs text-[#10B981] font-bold">
                <span>Deterministic Consensus Achieved</span>
                <span>Proof: {selectedRule.proofHash}</span>
              </div>
            )}

            {/* Node Evidence Summaries List */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-[#71717A] uppercase">Independent Node Summaries</span>
              {activeSummaries.map((node, idx) => (
                <div key={idx} className="bg-[#18181B] border border-[#27272A] rounded-xl p-3 flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#FAFAFA]">{node.nodeId} ({node.institution})</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      node.status === "CONSISTENT"
                        ? "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30"
                        : "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30"
                    }`}>
                      {node.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[10px] text-[#A1A1AA] pt-1 border-t border-[#27272A]">
                    <div>
                      <span className="text-[#71717A] block">Effect Size:</span>
                      <strong className={node.effectSize > 0 ? "text-[#10B981]" : "text-[#EF4444]"}>
                        {node.effectSize > 0 ? `+${node.effectSize}` : node.effectSize}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[#71717A] block">95% CI:</span>
                      <strong>[{node.ciLower}, {node.ciUpper}]</strong>
                    </div>
                    <div>
                      <span className="text-[#71717A] block">Cohort Size:</span>
                      <strong>n={node.sampleCount} pts</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Event Stream Terminal */}
      <div className="bg-[#09090B] border border-[#27272A] rounded-2xl p-4 font-mono text-[11px] flex flex-col gap-2">
        <div className="flex items-center justify-between text-[#71717A] pb-2 border-b border-[#27272A]">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-[#22D3EE]" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Deterministic Learning Log Stream</span>
          </div>
          <span className="text-[9px] text-[#10B981]">POLICY: ZERO_AVERAGING_CONSTRAINED</span>
        </div>
        <div className="flex flex-col gap-1 text-[10px]">
          {simulatedLogs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-[#52525B] flex-none">›</span>
              <span className={log.includes("CRITICAL") ? "text-[#EF4444] font-bold" : log.includes("DETERMINISTIC") ? "text-[#10B981] font-bold" : "text-[#A1A1AA]"}>
                {log}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
