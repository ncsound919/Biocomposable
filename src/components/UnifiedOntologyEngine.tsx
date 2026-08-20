import { useState } from "react";
import { 
  Network, 
  GitBranch, 
  GitCommit, 
  History, 
  FileCode, 
  CheckCircle2, 
  Search, 
  Layers, 
  ShieldCheck, 
  Share2, 
  ArrowRight, 
  Tag, 
  Database,
  Terminal,
  Activity,
  Zap,
  Globe
} from "lucide-react";

// Ontology Node Types
type NodeType = "Gene" | "Variant" | "Pathway" | "CellState" | "Microenvironment" | "Therapy" | "Outcome";

interface OntologyNode {
  id: string;
  label: string;
  type: NodeType;
  color: string;
  details: string;
}

interface OntologyEdge {
  from: string;
  to: string;
  relation: "MUTATION_OF" | "EXPRESSED_IN" | "MEMBER_OF" | "TARGETS" | "PRODUCES_EFFECT" | "MODULATES";
}

// Versioned Rules
interface VersionedRule {
  ruleId: string;
  version: string;
  mutationX: string;
  contextY: string;
  effectZ: "RESPONSIVE" | "RESISTANT" | "IMMUNE_EVASION" | "SYNTHETIC_LETHAL" | "UNKNOWN";
  evidenceGrade: "A_CLINICAL" | "B_PRECLINICAL" | "C_IN_SILICO" | "UNKNOWN";
  changelog: string;
  authorNode: string;
  timestamp: string;
}

// Multi-Site Input Mapping Test
interface SiteInput {
  siteId: string;
  siteName: string;
  rawInputText: string;
  canonicalGraphHash: string;
  mappedNodeCount: number;
  mappedEdgeCount: number;
  determinismMatch: boolean;
}

const ontologyNodes: OntologyNode[] = [
  { id: "GENE_BRAF", label: "BRAF (Gene)", type: "Gene", color: "#22D3EE", details: "Serine/threonine-protein kinase BRAF (HGNC:1097)" },
  { id: "VAR_V600E", label: "V600E (Variant)", type: "Variant", color: "#F59E0B", details: "c.1799T>A (p.Val600Glu) Oncogenic Driver" },
  { id: "PATH_MAPK", label: "MAPK/ERK Pathway", type: "Pathway", color: "#8B5CF6", details: "Mitogen-activated protein kinase signaling cascade" },
  { id: "CELL_MELANOMA", label: "Exhausted CD8+ T-Cell", type: "CellState", color: "#EC4899", details: "PD-1 high, TIM-3 high, LAG-3 high exhausted state" },
  { id: "TME_DESMOPLASTIC", label: "Desmoplastic Stroma", type: "Microenvironment", color: "#10B981", details: "Dense extracellular matrix, TGF-beta elevated TME" },
  { id: "RX_PLX4032", label: "Vemurafenib (Therapy)", type: "Therapy", color: "#3B82F6", details: "Selective BRAF V600E kinase inhibitor" },
  { id: "OUT_RESISTANCE", label: "Acquired Drug Resistance", type: "Outcome", color: "#EF4444", details: "MAPK pathway reactivation via CRAF dimerization" },
];

const ontologyEdges: OntologyEdge[] = [
  { from: "VAR_V600E", to: "GENE_BRAF", relation: "MUTATION_OF" },
  { from: "GENE_BRAF", to: "PATH_MAPK", relation: "MEMBER_OF" },
  { from: "RX_PLX4032", to: "VAR_V600E", relation: "TARGETS" },
  { from: "CELL_MELANOMA", to: "TME_DESMOPLASTIC", relation: "EXPRESSED_IN" },
  { from: "VAR_V600E", to: "OUT_RESISTANCE", relation: "PRODUCES_EFFECT" },
];

const ruleSetVersions: VersionedRule[] = [
  {
    ruleId: "RULE-ONT-101",
    version: "v2.5.0",
    mutationX: "BRAF p.V600E",
    contextY: "Melanoma + Desmoplastic TME (TGF-b high)",
    effectZ: "RESISTANT",
    evidenceGrade: "A_CLINICAL",
    changelog: "Upgraded effect from UNKNOWN to RESISTANT based on multi-site stroma profiling.",
    authorNode: "Node-US-01 (Stanford)",
    timestamp: "2026-08-20T06:12:00Z"
  },
  {
    ruleId: "RULE-ONT-102",
    version: "v2.5.0",
    mutationX: "KRAS p.G12D",
    contextY: "Pancreatic Ductal Adenocarcinoma (PDAC)",
    effectZ: "SYNTHETIC_LETHAL",
    evidenceGrade: "B_PRECLINICAL",
    changelog: "Added synthetic lethality rule with WRN helicase inhibition.",
    authorNode: "Node-EU-01 (INSERM Paris)",
    timestamp: "2026-08-19T14:30:00Z"
  },
  {
    ruleId: "RULE-ONT-103",
    version: "v2.4.2",
    mutationX: "EGFR p.T790M",
    contextY: "NSCLC post-Erlotinib exposure",
    effectZ: "RESPONSIVE",
    evidenceGrade: "A_CLINICAL",
    changelog: "Third-generation EGFR TKI (Osimertinib) sensitivity verified.",
    authorNode: "Node-APAC-01 (Kyoto)",
    timestamp: "2026-08-15T09:00:00Z"
  },
  {
    ruleId: "RULE-ONT-104",
    version: "v2.4.1",
    mutationX: "ARID1A Loss-of-Function",
    contextY: "Ovarian Clear Cell Carcinoma",
    effectZ: "UNKNOWN",
    evidenceGrade: "UNKNOWN",
    changelog: "Initial placeholder rule awaiting multi-node cohort evidence.",
    authorNode: "Node-US-02 (Hopkins)",
    timestamp: "2026-08-10T11:20:00Z"
  }
];

const multiSiteInputs: SiteInput[] = [
  {
    siteId: "SITE-01",
    siteName: "Stanford Cancer Center (USA)",
    rawInputText: "{ 'variant': 'BRAF_V600E', 'tumor_type': 'Melanoma', 'stroma': 'TGFb_high' }",
    canonicalGraphHash: "0x8f3c92a10b48e72d",
    mappedNodeCount: 7,
    mappedEdgeCount: 5,
    determinismMatch: true,
  },
  {
    siteId: "SITE-02",
    siteName: "Charité Comprehensive Cancer Center (Germany)",
    rawInputText: "<spec><gene>BRAF</gene><hgvs>c.1799T>A</hgvs><tme>desmoplastic</tme></spec>",
    canonicalGraphHash: "0x8f3c92a10b48e72d", // IDENTICAL CANONICAL GRAPH HASH!
    mappedNodeCount: 7,
    mappedEdgeCount: 5,
    determinismMatch: true,
  },
  {
    siteId: "SITE-03",
    siteName: "National Cancer Center Tokyo (Japan)",
    rawInputText: "JSON: { \"mutation\": \"V600E\", \"target_pathway\": \"MAPK\", \"drug\": \"Vemurafenib\" }",
    canonicalGraphHash: "0x8f3c92a10b48e72d", // IDENTICAL CANONICAL GRAPH HASH!
    mappedNodeCount: 7,
    mappedEdgeCount: 5,
    determinismMatch: true,
  }
];

export function UnifiedOntologyEngine() {
  const [activeSchemaVersion, setActiveSchemaVersion] = useState("v2.5.0");
  const [selectedRule, setSelectedRule] = useState<VersionedRule>(ruleSetVersions[0]);
  const [selectedNodeType, setSelectedNodeType] = useState<NodeType | "ALL">("ALL");
  const [isMappingActive, setIsMappingActive] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "[ONTOLOGY_DAEMON] Schema v2.5.0 loaded into memory.",
    "[DETERMINISTIC_MAPPER] Initializing graph mapping engine... 7 Node types, 6 Edge types active.",
    "[MULTI_SITE_VERIFIER] Input normalization check: Site 01, Site 02, Site 03 -> Hash 0x8f3c92a10b48e72d (100% BIT-EXACT MATCH)."
  ]);

  const handleTestMultiSiteMapping = () => {
    setIsMappingActive(true);
    setTerminalLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] DETERMINISTIC_MAPPER: Ingesting heterogeneous raw site formats under Schema ${activeSchemaVersion}...`,
      `[NORMALIZE_SITE_01] Parsing JSON payload from Stanford Medicine...`,
      `[NORMALIZE_SITE_02] Parsing XML payload from Charité Berlin...`,
      `[NORMALIZE_SITE_03] Parsing key-value string payload from NCC Tokyo...`,
      ...prev
    ]);

    setTimeout(() => {
      setTerminalLogs((prev) => [
        `[GRAPH_RECONSTRUCTION] Mapping all 3 sites to Unified Ontology Nodes (Gene, Variant, Pathway, CellState, Microenvironment, Therapy, Outcome)...`,
        `[HASH_ASSERTION] Canonical Blake3 Graph Hash generated: 0x8f3c92a10b48e72d across all 3 sites.`,
        `[SUCCESS] Zero graph divergence detected across sites! Deterministic mapping verified.`,
        ...prev
      ]);
      setIsMappingActive(false);
    }, 1200);
  };

  const filteredNodes = selectedNodeType === "ALL" 
    ? ontologyNodes 
    : ontologyNodes.filter((n) => n.type === selectedNodeType);

  return (
    <div className="bg-[#18181B] border border-[#22D3EE]/30 rounded-3xl p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#8B5CF6]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272A] pb-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/30 font-bold uppercase tracking-wider">
              UNIFIED ONTOLOGY & VERSIONED RULE ENGINE
            </span>
            <span className="text-[10px] font-mono text-[#71717A]">
              SCHEMA_SPEC_{activeSchemaVersion}
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#FAFAFA] flex items-center gap-2">
            Unified Knowledge Graph & Deterministic Multi-Site Mapping
          </h2>
          <p className="text-xs text-[#A1A1AA] max-w-3xl">
            Standardizes Genes, Variants, Pathways, Cell States, Microenvironments, Therapies, and Outcomes into a single strongly-typed graph. Versioned rules deterministically map any site input to the exact same canonical graph structure.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right font-mono text-[10px]">
            <span className="text-[#71717A]">Schema Version:</span>
            <span className="text-[#8B5CF6] font-bold">{activeSchemaVersion} (STABLE)</span>
          </div>
          <button
            onClick={handleTestMultiSiteMapping}
            disabled={isMappingActive}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#8B5CF6] text-[#FAFAFA] font-mono text-xs font-bold hover:bg-[#7c3aed] transition-all shadow-lg disabled:opacity-50"
          >
            <Zap className={`w-4 h-4 ${isMappingActive ? "animate-spin" : ""}`} />
            {isMappingActive ? "Mapping Graphs..." : "Run Multi-Site Mapping Test"}
          </button>
        </div>
      </div>

      {/* 7 Node Types Badge Row */}
      <div className="flex flex-wrap items-center gap-2 bg-[#09090B] border border-[#27272A] p-3 rounded-2xl text-[11px] font-mono">
        <span className="text-[#71717A] font-bold uppercase mr-2 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-[#22D3EE]" /> 7 Ontology Node Types:
        </span>
        
        <button
          onClick={() => setSelectedNodeType("ALL")}
          className={`px-2.5 py-1 rounded-lg transition-all ${
            selectedNodeType === "ALL" ? "bg-[#27272A] text-[#FAFAFA] font-bold" : "text-[#71717A] hover:text-[#FAFAFA]"
          }`}
        >
          ALL (7)
        </button>

        <button
          onClick={() => setSelectedNodeType("Gene")}
          className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
            selectedNodeType === "Gene" ? "bg-[#22D3EE]/20 text-[#22D3EE] font-bold" : "text-[#A1A1AA] hover:text-[#FAFAFA]"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#22D3EE]" /> Gene
        </button>

        <button
          onClick={() => setSelectedNodeType("Variant")}
          className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
            selectedNodeType === "Variant" ? "bg-[#F59E0B]/20 text-[#F59E0B] font-bold" : "text-[#A1A1AA] hover:text-[#FAFAFA]"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#F59E0B]" /> Variant
        </button>

        <button
          onClick={() => setSelectedNodeType("Pathway")}
          className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
            selectedNodeType === "Pathway" ? "bg-[#8B5CF6]/20 text-[#8B5CF6] font-bold" : "text-[#A1A1AA] hover:text-[#FAFAFA]"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" /> Pathway
        </button>

        <button
          onClick={() => setSelectedNodeType("CellState")}
          className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
            selectedNodeType === "CellState" ? "bg-[#EC4899]/20 text-[#EC4899] font-bold" : "text-[#A1A1AA] hover:text-[#FAFAFA]"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#EC4899]" /> Cell State
        </button>

        <button
          onClick={() => setSelectedNodeType("Microenvironment")}
          className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
            selectedNodeType === "Microenvironment" ? "bg-[#10B981]/20 text-[#10B981] font-bold" : "text-[#A1A1AA] hover:text-[#FAFAFA]"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#10B981]" /> Microenvironment
        </button>

        <button
          onClick={() => setSelectedNodeType("Therapy")}
          className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
            selectedNodeType === "Therapy" ? "bg-[#3B82F6]/20 text-[#3B82F6] font-bold" : "text-[#A1A1AA] hover:text-[#FAFAFA]"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#3B82F6]" /> Therapy
        </button>

        <button
          onClick={() => setSelectedNodeType("Outcome")}
          className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
            selectedNodeType === "Outcome" ? "bg-[#EF4444]/20 text-[#EF4444] font-bold" : "text-[#A1A1AA] hover:text-[#FAFAFA]"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#EF4444]" /> Outcome
        </button>
      </div>

      {/* Main Grid: Ontology Graph Topology & Versioned Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Visual Graph Topology */}
        <div className="lg:col-span-7 bg-[#09090B] border border-[#27272A] rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
            <div>
              <span className="text-[10px] font-mono text-[#8B5CF6] uppercase font-bold">
                Graph Representation
              </span>
              <h3 className="text-sm font-bold text-[#FAFAFA]">
                Unified Directed Knowledge Graph
              </h3>
            </div>
            <Network className="w-5 h-5 text-[#8B5CF6]" />
          </div>

          {/* Nodes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredNodes.map((node) => (
              <div
                key={node.id}
                className="bg-[#18181B] border border-[#27272A] rounded-xl p-3 flex flex-col gap-1.5 hover:border-[#3F3F46] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#FAFAFA]">{node.label}</span>
                  <span
                    className="px-2 py-0.5 rounded text-[9px] font-mono font-bold"
                    style={{ backgroundColor: `${node.color}20`, color: node.color, border: `1px solid ${node.color}40` }}
                  >
                    {node.type}
                  </span>
                </div>
                <p className="text-[10px] text-[#A1A1AA] leading-snug">{node.details}</p>
              </div>
            ))}
          </div>

          {/* Edge Relationships */}
          <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-3 flex flex-col gap-2 font-mono text-[10px]">
            <span className="text-[#71717A] uppercase font-bold">Strongly Typed Directed Edges</span>
            <div className="flex flex-wrap gap-2">
              {ontologyEdges.map((edge, idx) => (
                <div key={idx} className="bg-[#09090B] border border-[#27272A] px-2.5 py-1 rounded-lg text-[#A1A1AA] flex items-center gap-1.5">
                  <span className="text-[#FAFAFA]">{edge.from}</span>
                  <ArrowRight className="w-3 h-3 text-[#8B5CF6]" />
                  <span className="text-[#8B5CF6] font-bold">[{edge.relation}]</span>
                  <ArrowRight className="w-3 h-3 text-[#8B5CF6]" />
                  <span className="text-[#FAFAFA]">{edge.to}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Versioned Rules Engine & Changelogs */}
        <div className="lg:col-span-5 bg-[#09090B] border border-[#27272A] rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
            <div>
              <span className="text-[10px] font-mono text-[#8B5CF6] uppercase font-bold">
                Global Rule Versioning
              </span>
              <h3 className="text-sm font-bold text-[#FAFAFA]">
                Versioned Rules & Changelog
              </h3>
            </div>
            <History className="w-5 h-5 text-[#8B5CF6]" />
          </div>

          <div className="flex flex-col gap-3 font-mono text-[11px]">
            {ruleSetVersions.map((rule) => {
              const isSelected = selectedRule.ruleId === rule.ruleId;
              return (
                <div
                  key={rule.ruleId}
                  onClick={() => setSelectedRule(rule)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col gap-2 ${
                    isSelected
                      ? "bg-[#18181B] border-[#8B5CF6] shadow-lg"
                      : "bg-[#18181B]/50 border-[#27272A] hover:bg-[#18181B]"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#22D3EE]">{rule.ruleId}</span>
                      <span className="px-2 py-0.5 rounded bg-[#8B5CF6]/20 text-[#8B5CF6] font-bold text-[10px]">
                        {rule.version}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      rule.effectZ === "RESISTANT" ? "bg-[#EF4444]/20 text-[#EF4444]" :
                      rule.effectZ === "RESPONSIVE" ? "bg-[#10B981]/20 text-[#10B981]" :
                      rule.effectZ === "SYNTHETIC_LETHAL" ? "bg-[#8B5CF6]/20 text-[#8B5CF6]" :
                      "bg-[#27272A] text-[#71717A]"
                    }`}>
                      {rule.effectZ}
                    </span>
                  </div>

                  <div className="bg-[#09090B] border border-[#27272A] rounded-lg p-2 font-mono text-[10px] text-[#FAFAFA]">
                    <code>IF {rule.mutationX} IN [{rule.contextY}] → {rule.effectZ}</code>
                  </div>

                  <p className="text-[10px] text-[#A1A1AA] italic">"{rule.changelog}"</p>

                  <div className="flex justify-between text-[9px] text-[#71717A] pt-1 border-t border-[#27272A]">
                    <span>Node: {rule.authorNode}</span>
                    <span>Grade: {rule.evidenceGrade}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Multi-Site Deterministic Mapping Verification Panel */}
      <div className="bg-[#09090B] border border-[#27272A] rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#8B5CF6]" />
            <div>
              <h3 className="text-sm font-bold text-[#FAFAFA]">Multi-Site Deterministic Mapping Verification</h3>
              <span className="text-[10px] text-[#71717A] font-mono">
                Ingests heterogeneous local site inputs & resolves to identical canonical graph topology
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px] text-[#10B981] bg-[#10B981]/10 px-3 py-1.5 rounded-xl border border-[#10B981]/30 font-bold">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% CANONICAL HASH EQUIVALENCE
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-[11px]">
          {multiSiteInputs.map((site) => (
            <div
              key={site.siteId}
              className="bg-[#18181B] border border-[#27272A] rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden"
            >
              <div className="flex justify-between items-center text-xs border-b border-[#27272A] pb-2">
                <span className="font-bold text-[#FAFAFA]">{site.siteName}</span>
                <span className="text-[9px] text-[#22D3EE] font-bold">{site.siteId}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-[#71717A] uppercase">Raw Unstructured Site Input:</span>
                <div className="bg-[#09090B] border border-[#27272A] rounded-lg p-2 text-[10px] text-[#A1A1AA] truncate">
                  <code>{site.rawInputText}</code>
                </div>
              </div>

              <div className="flex flex-col gap-1 pt-1">
                <span className="text-[9px] text-[#71717A] uppercase">Mapped Canonical Graph Hash:</span>
                <div className="bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-[#8B5CF6] rounded-lg p-2 text-[10px] font-bold">
                  <code>{site.canonicalGraphHash}</code>
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] pt-1 text-[#10B981] font-bold">
                <span>Nodes: {site.mappedNodeCount} | Edges: {site.mappedEdgeCount}</span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Bit-Exact Match
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Terminal Stream Log */}
      <div className="bg-[#09090B] border border-[#27272A] rounded-2xl p-4 font-mono text-[11px] flex flex-col gap-2">
        <div className="flex items-center justify-between text-[#71717A] pb-2 border-b border-[#27272A]">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Ontology Mapping Terminal</span>
          </div>
          <span className="text-[9px] text-[#8B5CF6]">SCHEMA: v2.5.0</span>
        </div>
        <div className="flex flex-col gap-1 text-[10px]">
          {terminalLogs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-[#52525B] flex-none">›</span>
              <span className={log.includes("SUCCESS") ? "text-[#10B981] font-bold" : log.includes("DETERMINISTIC") ? "text-[#8B5CF6] font-bold" : "text-[#A1A1AA]"}>
                {log}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
