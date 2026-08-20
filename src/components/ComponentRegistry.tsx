import { componentsList } from "../data";
import { Package, Database } from "lucide-react";

export function ComponentRegistry() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {componentsList.map((comp) => (
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
                <span className="text-[10px] font-mono text-[#52525B]">pip install {comp.packageName}</span>
              </div>
            </div>
            <span className="text-[9px] font-mono bg-[#27272A] text-[#A1A1AA] border border-[#3F3F46] px-1.5 py-0.5 rounded">
              v{comp.version}
            </span>
          </div>

          <p className="text-xs text-[#A1A1AA] leading-relaxed mb-4 flex-grow">
            {comp.description}
          </p>

          <div className="space-y-2 mt-auto">
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
      ))}
    </div>
  );
}
