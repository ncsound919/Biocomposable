import { useState } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { CapabilitiesExplorer } from "./components/CapabilitiesExplorer";
import { ArchitectureStack } from "./components/ArchitectureStack";
import { ContractsExplorer } from "./components/ContractsExplorer";
import { RecipeBuilder } from "./components/RecipeBuilder";
import { RoadmapSection } from "./components/RoadmapSection";
import { ReproducibilityMetrics } from "./components/ReproducibilityMetrics";
import { AgentAPI } from "./components/AgentAPI";
import { ReferenceFreeMode } from "./components/ReferenceFreeMode";
import { ClinicalFlywheel } from "./components/ClinicalFlywheel";
import { SelfUpdateComplianceEngine } from "./components/SelfUpdateComplianceEngine";
import { DeterministicSelfLearningEngine } from "./components/DeterministicSelfLearningEngine";
import { UnifiedOntologyEngine } from "./components/UnifiedOntologyEngine";

// 5 Major Precision Oncology & Cancer Research Additions
import { CancerNeoantigenEngine } from "./components/CancerNeoantigenEngine";
import { SpatialTmeDeconvolution } from "./components/SpatialTmeDeconvolution";
import { CrisprScreenExplorer } from "./components/CrisprScreenExplorer";
import { LiquidBiopsyMrd } from "./components/LiquidBiopsyMrd";
import { ClonalEvolutionEngine } from "./components/ClonalEvolutionEngine";
import { PatientTrajectoryExplorer } from "./components/PatientTrajectoryExplorer";

import { 
  Dna, 
  Layers, 
  FileCode2, 
  GitMerge, 
  Map, 
  Scale, 
  Server, 
  Binary, 
  RefreshCcw,
  Sparkles,
  Grid,
  Target,
  Activity,
  GitBranch,
  ShieldCheck,
  Network,
  TrendingUp
} from "lucide-react";

export default function App() {
  const [agentMode, setAgentMode] = useState("reference_free");
  const [activeOncologyTab, setActiveOncologyTab] = useState<"neoantigen" | "spatial" | "crispr" | "liquid" | "clonal">("neoantigen");

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] font-sans selection:bg-[#22D3EE]/30 p-4 md:p-6 flex flex-col gap-6">
      
      {/* Platform Navigation Header */}
      <header className="flex-none h-14 bg-[#18181B] border border-[#27272A] rounded-2xl px-6 flex items-center justify-between sticky top-4 z-50 shadow-2xl max-w-[1240px] w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-[#22D3EE] rounded-lg flex items-center justify-center font-bold text-[#083344]">
            <Dna className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-bold text-xs tracking-tight uppercase text-[#FAFAFA]">
              BioComposable <span className="text-[#22D3EE] font-mono text-[11px] ml-1">v2.5</span>
            </h1>
            <span className="text-[9px] font-mono text-[#71717A]">Genomics & Cancer Research Suite</span>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-4 text-[10px] font-mono font-bold text-[#71717A]">
          <a href="#patient-trajectory" className="hover:text-[#EC4899] text-[#EC4899] transition-colors flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> TRAJECTORY & CONFLICTS
          </a>
          <a href="#compliance" className="hover:text-[#10B981] text-[#10B981] transition-colors flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> AUTO-UPDATE & COMPLIANCE
          </a>
          <a href="#self-learning" className="hover:text-[#22D3EE] text-[#22D3EE] transition-colors flex items-center gap-1">
            <GitMerge className="w-3 h-3" /> SELF-LEARNING
          </a>
          <a href="#ontology-engine" className="hover:text-[#8B5CF6] text-[#8B5CF6] transition-colors flex items-center gap-1">
            <Network className="w-3 h-3" /> ONTOLOGY
          </a>
          <a href="#oncology" className="hover:text-[#22D3EE] text-[#22D3EE] transition-colors flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> ONCOLOGY SUITE
          </a>
          <a href="#architecture" className="hover:text-[#22D3EE] transition-colors">ARCHITECTURE</a>
          <a href="#contracts" className="hover:text-[#22D3EE] transition-colors">CONTRACTS</a>
          <a href="#orchestration" className="hover:text-[#22D3EE] transition-colors">PIPELINES</a>
          <a href="#agent-api" className="hover:text-[#22D3EE] transition-colors">AGENT API</a>
          <a href="#reference-free" className="hover:text-[#22D3EE] transition-colors">ALIGNMENT</a>
          <a href="#flywheel" className="hover:text-[#10B981] transition-colors">FLYWHEEL</a>
          <a href="#rpd" className="hover:text-[#FAFAFA] transition-colors">AUDIT</a>
        </div>
      </header>

      <main className="flex-1 flex flex-col gap-6 max-w-[1240px] w-full mx-auto pb-12">
        
        {/* Enterprise Hero Section */}
        <section className="bg-[#18181B] border border-[#27272A] rounded-3xl p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex flex-col gap-3 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 uppercase tracking-wider font-bold">
                SELF-UPDATING & DETERMINISTICALLY COMPLIANT
              </span>
              <span className="text-[11px] font-mono text-[#71717A]">SPEC_REV_2026.5</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-[#FAFAFA] leading-tight">
              Precision Oncology & Deterministically Compliant Genomics
            </h2>
            <p className="text-xs md:text-sm text-[#A1A1AA] leading-relaxed">
              Integrative platform for somatic neoantigen discovery, spatial transcriptomic microenvironment mapping, CRISPR synthetic lethality, liquid biopsy ctDNA MRD tracking, and clonal evolution — backed by autonomous schema update daemons and bit-exact PRNG determinism.
            </p>
          </div>

          <div className="flex flex-col gap-2 bg-[#09090B] border border-[#27272A] p-4 rounded-2xl font-mono text-[10px] min-w-[240px]">
            <div className="flex justify-between items-center">
              <span className="text-[#71717A]">Auto-Update Sync:</span>
              <span className="text-[#10B981] font-bold">Active Daemon</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#71717A]">Determinism:</span>
              <span className="text-[#22D3EE] font-bold">IEEE-754 Bit-Exact</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#71717A]">PRNG Seed Lock:</span>
              <span className="text-[#8B5CF6] font-bold">0x42DB</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#71717A]">Regulatory Audit:</span>
              <span className="text-[#EF4444] font-bold">FDA 21 CFR Part 11</span>
            </div>
          </div>
        </section>

        {/* PLATFORM TRANSPARENCY & REAL-WORLD EXECUTION AUDIT */}
        <section className="bg-[#18181B] border border-[#F59E0B]/30 rounded-3xl p-6 md:p-8 flex flex-col gap-4 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272A] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#FAFAFA]">Platform Transparency & Architecture Reality Audit</h3>
                <p className="text-xs text-[#A1A1AA]">
                  Dual specification framework: Interactive educational whitepaper + Live full-stack execution engine.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px]">
              <span className="bg-[#10B981]/10 text-[#10B981] px-2.5 py-1 rounded-full border border-[#10B981]/30 font-bold">
                EXPRESS BACKEND LIVE (PORT 3000)
              </span>
              <span className="bg-[#22D3EE]/10 text-[#22D3EE] px-2.5 py-1 rounded-full border border-[#22D3EE]/30 font-bold">
                GEMINI 3.6 INTEGRATED
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-[11px]">
            <div className="bg-[#09090B] border border-[#27272A] p-4 rounded-2xl flex flex-col gap-2">
              <span className="text-[#F59E0B] font-bold text-xs uppercase">1. Architectural Specification</span>
              <p className="text-[#A1A1AA] text-[10px] leading-relaxed">
                Visualizes contract-first bioinformatics principles: Banff 2023 kidney transplant schemas, Reproducibility Debt (RpD) metrics, and MuData cross-modal single-cell data objects.
              </p>
            </div>

            <div className="bg-[#09090B] border border-[#27272A] p-4 rounded-2xl flex flex-col gap-2">
              <span className="text-[#10B981] font-bold text-xs uppercase">2. Real Express Agent Server</span>
              <p className="text-[#A1A1AA] text-[10px] leading-relaxed">
                Express server runs on port 3000 hosting live endpoints <code className="text-[#10B981]">/agent/v1/execute</code>, <code className="text-[#10B981]">/agent/v1/validate-dag</code>, and <code className="text-[#10B981]">/agent/v1/query</code>.
              </p>
            </div>

            <div className="bg-[#09090B] border border-[#27272A] p-4 rounded-2xl flex flex-col gap-2">
              <span className="text-[#22D3EE] font-bold text-xs uppercase">3. Production PyPI Mapping</span>
              <p className="text-[#A1A1AA] text-[10px] leading-relaxed">
                Abstract <code className="text-[#22D3EE]">bio-*</code> specifications map directly to standard production packages: <code className="text-[#22D3EE]">mudata</code>, <code className="text-[#22D3EE]">scanpy</code>, <code className="text-[#22D3EE]">pydantic</code>, and <code className="text-[#22D3EE]">decoupler</code>.
              </p>
            </div>
          </div>
        </section>

        {/* ARCHITECTURE CAPABILITIES OVERVIEW */}
        <section id="capabilities" className="scroll-mt-24">
          <ErrorBoundary>
            <CapabilitiesExplorer />
          </ErrorBoundary>
        </section>

        {/* SELF-UPDATING & DETERMINISTIC COMPLIANCE ENGINE */}
        <section id="compliance" className="scroll-mt-24">
          <SelfUpdateComplianceEngine />
        </section>

        {/* DETERMINISTIC SELF-LEARNING ENGINE */}
        <section id="self-learning" className="scroll-mt-24">
          <DeterministicSelfLearningEngine />
        </section>

        {/* UNIFIED ONTOLOGY & DETERMINISTIC MAPPING ENGINE */}
        <section id="ontology-engine" className="scroll-mt-24">
          <UnifiedOntologyEngine />
        </section>

        {/* 5 MAJOR PRECISION ONCOLOGY ADDITIONS SUITE */}
        <section id="oncology" className="scroll-mt-24 bg-[#18181B] border border-[#22D3EE]/30 rounded-3xl p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272A] pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-[#22D3EE]" />
                <span className="text-[11px] font-mono font-bold text-[#22D3EE] uppercase tracking-wider">
                  MAJOR ADDITION 1 TO 5
                </span>
              </div>
              <h2 className="text-lg font-bold text-[#FAFAFA]">
                Precision Oncology & Cancer Bioinformatics Suite
              </h2>
            </div>

            {/* Interactive Module Tabs */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveOncologyTab("neoantigen")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                  activeOncologyTab === "neoantigen"
                    ? "bg-[#22D3EE] text-[#09090B] border-[#22D3EE]"
                    : "bg-[#09090B] text-[#A1A1AA] border-[#27272A] hover:text-[#FAFAFA]"
                }`}
              >
                <Dna className="w-3.5 h-3.5" />
                1. Somatic Neoantigen Engine
              </button>

              <button
                onClick={() => setActiveOncologyTab("spatial")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                  activeOncologyTab === "spatial"
                    ? "bg-[#8B5CF6] text-[#FAFAFA] border-[#8B5CF6]"
                    : "bg-[#09090B] text-[#A1A1AA] border-[#27272A] hover:text-[#FAFAFA]"
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                2. Spatial Transcriptomics
              </button>

              <button
                onClick={() => setActiveOncologyTab("crispr")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                  activeOncologyTab === "crispr"
                    ? "bg-[#EF4444] text-[#FAFAFA] border-[#EF4444]"
                    : "bg-[#09090B] text-[#A1A1AA] border-[#27272A] hover:text-[#FAFAFA]"
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                3. CRISPR Synthetic Lethality
              </button>

              <button
                onClick={() => setActiveOncologyTab("liquid")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                  activeOncologyTab === "liquid"
                    ? "bg-[#10B981] text-[#09090B] border-[#10B981]"
                    : "bg-[#09090B] text-[#A1A1AA] border-[#27272A] hover:text-[#FAFAFA]"
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                4. Liquid Biopsy MRD
              </button>

              <button
                onClick={() => setActiveOncologyTab("clonal")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                  activeOncologyTab === "clonal"
                    ? "bg-[#F59E0B] text-[#09090B] border-[#F59E0B]"
                    : "bg-[#09090B] text-[#A1A1AA] border-[#27272A] hover:text-[#FAFAFA]"
                }`}
              >
                <GitBranch className="w-3.5 h-3.5" />
                5. Clonal Phylodynamics
              </button>
            </div>
          </div>

          {/* Tab Content Display */}
          <div className="w-full">
            {activeOncologyTab === "neoantigen" && <CancerNeoantigenEngine />}
            {activeOncologyTab === "spatial" && <SpatialTmeDeconvolution />}
            {activeOncologyTab === "crispr" && <CrisprScreenExplorer />}
            {activeOncologyTab === "liquid" && <LiquidBiopsyMrd />}
            {activeOncologyTab === "clonal" && <ClonalEvolutionEngine />}
          </div>
        </section>

        {/* Clinical Precision Trajectory, Variant Rules & Conflict Explorer Suite */}
        <section id="patient-trajectory" className="scroll-mt-24 w-full">
          <PatientTrajectoryExplorer />
        </section>

        {/* Console Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Layer Hierarchy Console */}
          <section id="architecture" className="scroll-mt-24 md:col-span-12 bg-[#18181B] border border-[#27272A] rounded-3xl p-6 md:p-8 flex flex-col">
            <h2 className="text-[11px] font-mono font-bold text-[#71717A] uppercase tracking-widest mb-6 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#22D3EE]" />
              System Layer Hierarchy
            </h2>
            <ArchitectureStack />
          </section>

          {/* Contract Specification Engine */}
          <section id="contracts" className="scroll-mt-24 md:col-span-7 bg-[#18181B] border border-[#22D3EE]/30 rounded-3xl p-6 md:p-8 flex flex-col relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <FileCode2 className="w-48 h-48 text-[#22D3EE]" />
             </div>
             <h2 className="text-[11px] font-mono font-bold text-[#22D3EE] uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10">
              <FileCode2 className="w-4 h-4" />
              Contract Specification Engine
            </h2>
            <ContractsExplorer />
          </section>

          {/* Pipeline Orchestrator */}
          <section id="orchestration" className="scroll-mt-24 md:col-span-5 bg-[#18181B] border border-[#27272A] rounded-3xl p-6 flex flex-col relative z-10">
            <h2 className="text-[11px] font-mono font-bold text-[#71717A] uppercase tracking-widest mb-6 flex items-center gap-2">
              <GitMerge className="w-4 h-4 text-[#F59E0B]" />
              Pipeline DAG Orchestrator
            </h2>
            <RecipeBuilder />
          </section>

          {/* Agent Interface REST API */}
          <section id="agent-api" className="scroll-mt-24 md:col-span-12 bg-[#18181B] border border-[#27272A] rounded-3xl p-6 md:p-8 flex flex-col relative overflow-hidden">
            <h2 className="text-[11px] font-mono font-bold text-[#71717A] uppercase tracking-widest mb-6 flex items-center gap-2">
              <Server className="w-4 h-4 text-[#FAFAFA]" />
              Agent Interface API (/agent/v1)
            </h2>
            <AgentAPI activeMode={agentMode} />
          </section>

          {/* Reference-Free Sequence Alignment */}
          <section id="reference-free" className="scroll-mt-24 md:col-span-12 bg-[#18181B] border border-[#27272A] rounded-3xl p-6 md:p-8 flex flex-col relative overflow-hidden">
            <h2 className="text-[11px] font-mono font-bold text-[#71717A] uppercase tracking-widest mb-6 flex items-center gap-2">
              <Binary className="w-4 h-4 text-[#FAFAFA]" />
              Reference-Free Sequence Alignment
            </h2>
            <ReferenceFreeMode activeMode={agentMode} onModeChange={setAgentMode} />
          </section>

          {/* Active Learning & Re-Training Flywheel */}
          <section id="flywheel" className="scroll-mt-24 md:col-span-12 bg-[#18181B] border border-[#27272A] rounded-3xl p-6 md:p-8 flex flex-col relative overflow-hidden">
            <h2 className="text-[11px] font-mono font-bold text-[#10B981] uppercase tracking-widest mb-6 flex items-center gap-2">
              <RefreshCcw className="w-4 h-4 text-[#10B981]" />
              Active Learning & Model Re-Training Engine
            </h2>
            <ClinicalFlywheel />
          </section>

          {/* Reproducibility & Lineage Audit */}
          <section id="rpd" className="scroll-mt-24 md:col-span-12 bg-[#18181B] border border-[#27272A] rounded-3xl p-6 md:p-8 flex flex-col relative overflow-hidden">
            <h2 className="text-[11px] font-mono font-bold text-[#71717A] uppercase tracking-widest mb-6 flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#FAFAFA]" />
              Reproducibility & Lineage Audit (RpD)
            </h2>
            <ReproducibilityMetrics />
          </section>

          {/* Platform Release Roadmap */}
          <section id="roadmap" className="scroll-mt-24 md:col-span-12 bg-[#18181B] border border-[#27272A] rounded-3xl p-6 md:p-8 flex flex-col">
            <h2 className="text-[11px] font-mono font-bold text-[#71717A] uppercase tracking-widest mb-6 flex items-center gap-2">
              <Map className="w-4 h-4 text-[#F59E0B]" />
              Platform Release Roadmap
            </h2>
            <RoadmapSection />
          </section>

        </div>

      </main>
      
      <footer className="flex-none flex items-center justify-between text-[10px] font-mono text-[#52525B] px-4 py-6 border-t border-[#27272A] max-w-[1240px] w-full mx-auto">
        <div>BIOCOMPOSABLE_ENGINE_V2.5 // PRECISION_ONCOLOGY_SUITE</div>
        <div>TRANSPLANT & CANCER GENOMICS ALLIANCE</div>
      </footer>
    </div>
  );
}
