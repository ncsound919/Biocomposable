import { ShieldCheck, Cpu, Database, GitMerge, FileCode2, Zap } from "lucide-react";

export function CapabilitiesExplorer() {
  const capabilities = [
    {
      id: "contract-validation",
      icon: ShieldCheck,
      title: "Contract-First Schema Validation",
      description: "Strict typed interface definitions for single-cell multiomics (MuData, Scanpy) and Banff 2023 pathology lesion scoring.",
      color: "#10B981"
    },
    {
      id: "rpd-engine",
      icon: Cpu,
      title: "Reproducibility Debt (RpD) Engine",
      description: "Quantifies mathematical drift, version mismatches, and contract violations across pipeline steps in real time.",
      color: "#22D3EE"
    },
    {
      id: "workflow-export",
      icon: GitMerge,
      title: "Multi-Engine Workflow Export",
      description: "Generates executable Nextflow DSL2 (main.nf), Snakemake (Snakefile), and standalone Python pipeline scripts.",
      color: "#F59E0B"
    },
    {
      id: "provenance-crate",
      icon: Database,
      title: "W3C RO-Crate Provenance",
      description: "Outputs standardized JSON-LD metadata for full reproducibility and clinical audit compliance.",
      color: "#EC4899"
    },
    {
      id: "gemini-reasoning",
      icon: Zap,
      title: "Gemini 3.6 Flash Agentic Reasoning",
      description: "Server-side AI query engine for single-cell pipeline topology optimization and Banff schema compliance.",
      color: "#A855F7"
    },
    {
      id: "pypi-mapping",
      icon: FileCode2,
      title: "Production PyPI Package Mapping",
      description: "Maps abstract bio-* contracts to real packages: mudata, scanpy, scvi-tools, decoupler, and harmony-pytorch.",
      color: "#3B82F6"
    }
  ];

  return (
    <div className="bg-[#09090B] border border-[#27272A] rounded-2xl p-6 flex flex-col gap-6">
      <div className="flex flex-col gap-1 border-b border-[#27272A] pb-4">
        <h3 className="text-base font-bold text-[#FAFAFA]">BioComposable Architecture Capabilities</h3>
        <p className="text-xs text-[#A1A1AA]">
          Comprehensive feature set powering contract-first bioinformatics for transplant research and clinical AI audit.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {capabilities.map((cap) => {
          const Icon = cap.icon;
          return (
            <div
              key={cap.id}
              className="bg-[#18181B] border border-[#27272A] hover:border-[#3F3F46] p-4 rounded-xl flex flex-col gap-3 transition-all"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${cap.color}15`, color: cap.color }}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="text-xs font-bold text-[#FAFAFA]">{cap.title}</h4>
                <p className="text-[11px] text-[#A1A1AA] leading-relaxed">{cap.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
