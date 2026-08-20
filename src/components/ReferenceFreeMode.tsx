import { Binary, BookOpen, Layers, CheckCircle2 } from "lucide-react";

interface Props {
  activeMode?: string;
  onModeChange?: (mode: string) => void;
}

export function ReferenceFreeMode({ activeMode = "reference_free", onModeChange }: Props) {
  
  const getModeStyles = (mode: string) => {
    if (activeMode === mode) {
      if (mode === 'reference_free') {
        return "border-[#22D3EE]/50 bg-[#18181B] opacity-100 shadow-[0_0_15px_rgba(34,211,238,0.1)] ring-1 ring-[#22D3EE]/30";
      }
      return "border-[#F59E0B]/50 bg-[#18181B] opacity-100 shadow-[0_0_15px_rgba(245,158,11,0.1)] ring-1 ring-[#F59E0B]/30";
    }
    return "border-[#27272A] bg-[#09090B] opacity-60 grayscale hover:grayscale-0 hover:opacity-100 cursor-pointer hover:border-[#3F3F46]";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Atlas Mode */}
      <div 
        onClick={() => onModeChange?.("atlas")}
        className={`rounded-xl p-5 flex flex-col transition-all duration-300 ${getModeStyles("atlas")}`}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-[#27272A] rounded-lg border border-[#3F3F46]">
            <BookOpen className={`w-4 h-4 ${activeMode === 'atlas' ? 'text-[#F59E0B]' : 'text-[#A1A1AA]'}`} />
          </div>
          <h3 className="text-sm font-bold text-[#FAFAFA]">Atlas Mode</h3>
        </div>
        <p className="text-xs text-[#A1A1AA] leading-relaxed mb-4">
          Requires a fully matched, high-quality single-cell reference atlas. Traditional approach, highly dependent on reference availability and quality.
        </p>
        <div className="mt-auto">
          <span className={`text-[10px] font-mono px-2 py-1 rounded border ${activeMode === 'atlas' ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30' : 'text-[#71717A] bg-[#18181B] border-[#27272A]'}`}>
            mode="atlas"
          </span>
        </div>
      </div>

      {/* Hybrid Mode */}
      <div 
        onClick={() => onModeChange?.("hybrid")}
        className={`rounded-xl p-5 flex flex-col transition-all duration-300 ${getModeStyles("hybrid")}`}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-[#27272A] rounded-lg border border-[#3F3F46]">
            <Layers className={`w-4 h-4 ${activeMode === 'hybrid' ? 'text-[#F59E0B]' : 'text-[#A1A1AA]'}`} />
          </div>
          <h3 className="text-sm font-bold text-[#FAFAFA]">Hybrid Mode</h3>
        </div>
        <p className="text-xs text-[#A1A1AA] leading-relaxed mb-4">
          Partial reference mapping combined with de novo discovery. Useful for discovering poorly annotated states adjacent to known biology.
        </p>
        <div className="mt-auto">
          <span className={`text-[10px] font-mono px-2 py-1 rounded border ${activeMode === 'hybrid' ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30' : 'text-[#71717A] bg-[#18181B] border-[#27272A]'}`}>
            mode="hybrid"
          </span>
        </div>
      </div>

      {/* Reference-Free Mode */}
      <div 
        onClick={() => onModeChange?.("reference_free")}
        className={`rounded-xl p-5 flex flex-col relative overflow-hidden transition-all duration-300 ${getModeStyles("reference_free")}`}
      >
        <div className="absolute top-0 right-0 p-2">
          <span className={`text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${activeMode === 'reference_free' ? 'bg-[#22D3EE]/10 text-[#22D3EE] border-[#22D3EE]/30' : 'bg-[#27272A] text-[#71717A] border-[#3F3F46]'}`}>
            Phase 1 Active
          </span>
        </div>
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-lg border ${activeMode === 'reference_free' ? 'bg-[#22D3EE]/10 border-[#22D3EE]/30' : 'bg-[#27272A] border-[#3F3F46]'}`}>
            <Binary className={`w-4 h-4 ${activeMode === 'reference_free' ? 'text-[#22D3EE]' : 'text-[#A1A1AA]'}`} />
          </div>
          <h3 className="text-sm font-bold text-[#FAFAFA]">Reference-Free Mode</h3>
        </div>
        <p className="text-xs text-[#A1A1AA] leading-relaxed mb-4">
          Binary-SPA style mapping without matched single-cell reference. Extracts latent biological signals directly from spatial or bulk topology.
        </p>
        <div className="mt-auto flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className={`w-3.5 h-3.5 ${activeMode === 'reference_free' ? 'text-[#10B981]' : 'text-[#52525B]'}`} />
            <span className="text-[10px] text-[#A1A1AA]">Python/R SDK Support Built-in</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className={`w-3.5 h-3.5 ${activeMode === 'reference_free' ? 'text-[#10B981]' : 'text-[#52525B]'}`} />
            <span className="text-[10px] text-[#A1A1AA]">Available via /agent/v1/run</span>
          </div>
          <div className="mt-2">
            <span className={`text-[10px] font-mono px-2 py-1 rounded border ${activeMode === 'reference_free' ? 'bg-[#22D3EE]/10 text-[#22D3EE] border-[#22D3EE]/20' : 'bg-[#18181B] text-[#71717A] border-[#27272A]'}`}>
              mode="reference_free"
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
