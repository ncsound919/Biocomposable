import { determinismData } from "../data";
import { ShieldCheck, Network, Lock, Target, Workflow, Zap, Info } from "lucide-react";

const icons = {
  preprocessing: Network,
  normalization: Lock,
  inference: Target,
  rules: ShieldCheck,
  pipeline: Workflow,
};

export function DeterminismSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {determinismData.map((item) => {
        const Icon = icons[item.id as keyof typeof icons] || ShieldCheck;
        const isFullWidth = item.id === "pipeline";
        
        return (
          <div 
            key={item.id} 
            className={`group flex flex-col bg-[#09090B] border border-[#27272A] rounded-2xl p-6 hover:border-[#3F3F46] hover:bg-[#18181B] transition-all duration-300 ${
              isFullWidth ? 'lg:col-span-2' : ''
            }`}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#27272A] border border-[#3F3F46] flex items-center justify-center group-hover:border-[#10B981]/50 group-hover:bg-[#10B981]/10 transition-colors shrink-0">
                <Icon className="w-5 h-5 text-[#10B981]" />
              </div>
              <h3 className="text-base font-bold text-[#FAFAFA] tracking-tight">{item.component}</h3>
            </div>
            
            <div className={`grid grid-cols-1 gap-4 flex-grow ${isFullWidth ? 'md:grid-cols-2 gap-6' : ''}`}>
              
              {/* Technique Box */}
              <div className="flex flex-col bg-[#18181B] border border-[#27272A] rounded-xl overflow-hidden h-full">
                <div className="bg-[#27272A]/50 px-4 py-2 border-b border-[#27272A] flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-[#22D3EE]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#22D3EE]">
                    Implementation Technique
                  </span>
                </div>
                <div className="p-4 md:p-5 flex-grow">
                  <p className="text-xs text-[#A1A1AA] leading-loose">
                    {item.technique}
                  </p>
                </div>
              </div>
              
              {/* Why It Matters Box */}
              <div className="flex flex-col bg-[#F59E0B]/5 border border-[#F59E0B]/10 rounded-xl overflow-hidden h-full">
                <div className="bg-[#F59E0B]/10 px-4 py-2 border-b border-[#F59E0B]/20 flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#F59E0B]">
                    Why It Matters
                  </span>
                </div>
                <div className="p-4 md:p-5 flex-grow">
                  <p className="text-xs text-[#FAFAFA] leading-loose opacity-90">
                    {item.importance}
                  </p>
                </div>
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
}
