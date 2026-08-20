import { useState } from "react";
import { roadmapData } from "../data";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, CircleDashed, Clock, Package, ArrowRight, Link as LinkIcon, Waypoints } from "lucide-react";

const statusConfig = {
  "completed": {
    icon: CheckCircle2,
    color: "text-[#10B981]",
    bg: "bg-[#10B981]/10",
    border: "border-[#10B981]/30",
    label: "Implemented"
  },
  "in-progress": {
    icon: Clock,
    color: "text-[#F59E0B]",
    bg: "bg-[#F59E0B]/10",
    border: "border-[#F59E0B]/30",
    label: "In Progress"
  },
  "planned": {
    icon: CircleDashed,
    color: "text-[#71717A]",
    bg: "bg-[#27272A]",
    border: "border-[#3F3F46]",
    label: "Planned"
  }
};

export function RoadmapSection() {
  const [hoveredPhase, setHoveredPhase] = useState<string | null>(null);

  const scrollToSection = (id: string) => {
    if (!id) return;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-[11px] text-[#A1A1AA] leading-relaxed mb-2 max-w-3xl">
        This roadmap represents the staged implementation of the composable architecture. The dependency DAG dictates that foundation layers (contracts) must be formalized before orchestration or benchmarking can exist. Green nodes are currently implemented and interactive in this dashboard.
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roadmapData.map((item) => {
          const status = item.status || "planned";
          const config = statusConfig[status];
          const StatusIcon = config.icon;
          const isInteractive = status === "completed" && item.linkId;
          const isHovered = hoveredPhase === item.id;
          
          // Determine if we should highlight this due to being a dependency of hovered
          const isDependency = hoveredPhase 
            ? roadmapData.find(r => r.id === hoveredPhase)?.dependencies?.includes(item.id)
            : false;
          
          const isDependent = hoveredPhase
            ? item.dependencies?.includes(hoveredPhase)
            : false;

          return (
            <div 
              key={item.id}
              onMouseEnter={() => setHoveredPhase(item.id)}
              onMouseLeave={() => setHoveredPhase(null)}
              onClick={() => isInteractive ? scrollToSection(item.linkId!) : null}
              className={`relative bg-[#09090B] border rounded-2xl p-5 flex flex-col h-full transition-all duration-300 ${
                isInteractive ? "cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:shadow-[#22D3EE]/5" : ""
              } ${
                isHovered ? "border-[#52525B]" : 
                isDependency ? "border-[#22D3EE]/40" :
                isDependent ? "border-[#F59E0B]/40" :
                "border-[#27272A]"
              }`}
            >
              {/* Connection visualizer indicator */}
              {isDependency && (
                <div className="absolute -top-2 -right-2 bg-[#22D3EE] text-[#09090B] text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Waypoints className="w-3 h-3" /> Required By Hovered
                </div>
              )}
              {isDependent && (
                <div className="absolute -top-2 -right-2 bg-[#F59E0B] text-[#09090B] text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Waypoints className="w-3 h-3" /> Blocks On Hovered
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div className={`w-8 h-8 rounded-full border ${config.border} ${config.bg} flex items-center justify-center`}>
                  <span className={`text-[11px] font-bold font-mono ${config.color}`}>P{item.phase}</span>
                </div>
                
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border ${config.border} ${config.bg}`}>
                  <StatusIcon className={`w-3 h-3 ${config.color}`} />
                  <span className={`text-[9px] font-bold uppercase tracking-widest ${config.color}`}>
                    {config.label}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-3">
                {item.components.map((comp, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 bg-[#18181B] border border-[#3F3F46] px-2 py-1 rounded-md">
                    <Package className="w-3 h-3 text-[#A1A1AA]" />
                    <span className="text-[10px] font-mono font-bold text-[#FAFAFA]">{comp}</span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-[#A1A1AA] leading-relaxed mb-4 flex-1">
                {item.description}
              </p>

              <div className="pt-4 border-t border-[#27272A] mt-auto">
                <p className="text-[10px] text-[#71717A] leading-relaxed mb-3 h-10 line-clamp-2">
                  <span className="font-bold text-[#A1A1AA]">Specs:</span> {item.details}
                </p>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase tracking-widest text-[#52525B] font-bold">Dependencies</span>
                    <div className="flex gap-1">
                      {item.dependencies && item.dependencies.length > 0 ? (
                        item.dependencies.map(dep => (
                          <span key={dep} className="w-5 h-5 rounded-full bg-[#18181B] border border-[#3F3F46] flex items-center justify-center text-[8px] font-mono text-[#A1A1AA]" title={dep}>
                            P{dep.replace('phase', '')}
                          </span>
                        ))
                      ) : (
                        <span className="text-[9px] text-[#52525B]">None</span>
                      )}
                    </div>
                  </div>
                  
                  {isInteractive && (
                    <div className="flex items-center gap-1 text-[#22D3EE] group-hover:text-[#22D3EE]">
                      <span className="text-[10px] font-bold uppercase tracking-widest">View</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
