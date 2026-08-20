import { useState } from "react";
import { componentsList } from "../data";
import { Package, Database, Info, Download, Check, Copy, FileText } from "lucide-react";

// Mapping BioComposable contract component IDs to standard open-source PyPI packages
const pypiEquivalents: Record<string, string> = {
  "bio-validate": "mudata pydantic",
  "bio-refdata": "gseapy gencode-annotations",
  "bio-batchdiag": "scanpy kbet",
  "bio-batchcorrect": "harmony-pytorch scvi-tools",
  "bio-crossmodal-align": "decoupler mofa2",
  "bio-interpret": "shap captum",
  "bio-report": "ro-crate reportlab",
  "bio-multimodal": "mudata scanpy",
  "bio-governance": "pydantic cryptograph",
  "bio-bench": "openproblems"
};

export function ComponentRegistry() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Informative Header Banner with Direct Download Actions */}
      <div className="bg-[#18181B] border border-[#F59E0B]/30 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-[#F59E0B] flex-none mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="font-bold text-[#FAFAFA] text-sm">Contract Specification & Production PyPI Equivalents</span>
            <p className="text-[#A1A1AA] text-[11px] leading-relaxed">
              BioComposable defines contract-first component interfaces (`bio-*`). In production environments, these contracts are powered directly by established PyPI & Conda packages like <code className="text-[#22D3EE] font-mono">mudata</code>, <code className="text-[#22D3EE] font-mono">scanpy</code>, <code className="text-[#22D3EE] font-mono">pydantic</code>, and <code className="text-[#22D3EE] font-mono">decoupler</code>.
            </p>
          </div>
        </div>

        {/* Real Live Downloads from Express Server */}
        <div className="flex flex-wrap items-center gap-2 flex-none">
          <a
            href="/agent/v1/download/requirements"
            download="requirements.txt"
            className="flex items-center gap-1.5 px-3 py-2 bg-[#27272A] hover:bg-[#3F3F46] text-[#FAFAFA] rounded-xl font-mono text-[10px] border border-[#3F3F46] transition-all font-bold"
          >
            <Download className="w-3.5 h-3.5 text-[#10B981]" />
            Download requirements.txt
          </a>
          <a
            href="/agent/v1/download/python"
            download="biocomposable_pipeline.py"
            className="flex items-center gap-1.5 px-3 py-2 bg-[#10B981] hover:bg-[#34D399] text-[#09090B] rounded-xl font-mono text-[10px] transition-all font-bold shadow-md shadow-[#10B981]/20"
          >
            <FileText className="w-3.5 h-3.5" />
            Download Python Pipeline
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {componentsList.map((comp) => {
          const prodPkg = pypiEquivalents[comp.id] || "mudata scanpy";
          const pipCmd = `pip install ${prodPkg}`;

          return (
            <div 
              key={comp.id} 
              className="group flex flex-col bg-[#09090B] border border-[#27272A] rounded-2xl p-5 hover:border-[#3F3F46] hover:bg-[#18181B] transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#27272A] border border-[#3F3F46] flex items-center justify-center group-hover:border-[#F59E0B]/50 group-hover:bg-[#F59E0B]/10 transition-colors">
                    <Package className="w-4 h-4 text-[#F59E0B]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#FAFAFA]">{comp.name}</h3>
                    <span className="text-[10px] font-mono text-[#52525B]">Spec: {comp.packageName}</span>
                  </div>
                </div>
                <span className="text-[9px] font-mono bg-[#27272A] text-[#A1A1AA] border border-[#3F3F46] px-1.5 py-0.5 rounded">
                  v{comp.version}
                </span>
              </div>

              <p className="text-xs text-[#A1A1AA] leading-relaxed mb-3 flex-grow">
                {comp.description}
              </p>

              {/* Real PyPI Install Command with Copy Button */}
              <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-2.5 mb-3 flex flex-col gap-1.5 font-mono text-[10px]">
                <div className="flex items-center justify-between">
                  <span className="text-[#71717A] text-[9px] uppercase font-bold">Production PyPI Command:</span>
                  <button
                    onClick={() => handleCopy(pipCmd, comp.id)}
                    className="text-[#71717A] hover:text-[#FAFAFA] transition-colors p-1"
                    title="Copy command"
                  >
                    {copiedId === comp.id ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <code className="text-[#22D3EE] bg-[#09090B] p-1.5 rounded border border-[#27272A] text-[9.5px]">
                  {pipCmd}
                </code>
              </div>

              <div className="space-y-2 mt-auto pt-2 border-t border-[#27272A]">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#71717A]">Input</span>
                  <div className="flex items-center gap-1.5 text-[10px] text-[#A1A1AA] font-mono">
                    <Database className="w-3 h-3 text-[#71717A]" />
                    <span className="truncate max-w-[150px]" title={comp.requires.upstreamOutputs.length ? comp.requires.upstreamOutputs.join(", ") : "raw_data"}>
                      {comp.requires.upstreamOutputs.length ? comp.requires.upstreamOutputs.join(", ") : "raw_data"}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#71717A]">Output</span>
                  <div className="flex items-center gap-1.5 text-[10px] text-[#22D3EE] font-mono">
                    <Database className="w-3 h-3 text-[#22D3EE]" />
                    <span className="truncate max-w-[150px]" title={comp.provides.outputType}>
                      {comp.provides.outputType}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
