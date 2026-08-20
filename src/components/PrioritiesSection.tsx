import { prioritiesData } from "../data";
import { Bot, Binary, Scale, TestTube2, Network, ShieldCheck, CheckCircle2 } from "lucide-react";

const iconMap = {
  Bot,
  Binary,
  Scale,
  TestTube2,
  Network,
  ShieldCheck
};

export function PrioritiesSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {prioritiesData.map((item) => {
        const Icon = iconMap[item.icon as keyof typeof iconMap] || Bot;
        const isPhase1 = item.phase.includes("Phase 1");
        
        return (
          <div 
            key={item.id} 
            className={`group flex flex-col bg-[#09090B] border border-[#27272A] rounded-2xl p-5 hover:border-[#3F3F46] hover:bg-[#18181B] transition-colors relative ${
              isPhase1 ? "ring-1 ring-[#F59E0B]/10" : ""
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg bg-[#27272A] border border-[#3F3F46] flex items-center justify-center transition-colors ${
                  isPhase1 ? "group-hover:border-[#F59E0B]/50 group-hover:bg-[#F59E0B]/10" : "group-hover:border-[#22D3EE]/50 group-hover:bg-[#22D3EE]/10"
                }`}>
                  <Icon className={`w-4 h-4 ${isPhase1 ? "text-[#F59E0B]" : "text-[#22D3EE]"}`} />
                </div>
                <h3 className="text-sm font-bold text-[#FAFAFA]">{item.title}</h3>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className={`text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${
                isPhase1 ? "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30" : "bg-[#27272A] text-[#A1A1AA] border-[#3F3F46]"
              }`}>
                {item.phase}
              </span>
              {item.urgency && (
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded border bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30">
                  {item.urgency}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2 mt-auto">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#71717A] mb-1">
                Implementation Core
              </span>
              <ul className="space-y-2">
                {item.implementation.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] mt-0.5 shrink-0 opacity-80" />
                    <span className="text-xs text-[#A1A1AA] leading-relaxed">
                      {bullet}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
}
