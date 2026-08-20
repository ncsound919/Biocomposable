import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { separationData, monolithicFailures } from "../data";
import type { FailureCase } from "../types";
import { Database, Cpu, Workflow, AlertTriangle, ArrowRight } from "lucide-react";

const layerIcons = {
  data: Database,
  logic: Cpu,
  orchestration: Workflow,
};

const layerAccents = {
  data: {
    text: "text-[#22D3EE]",
    bg: "bg-[#22D3EE]/10",
    border: "border-[#22D3EE]/30",
    dot: "bg-[#22D3EE]",
  },
  logic: {
    text: "text-[#F59E0B]",
    bg: "bg-[#F59E0B]/10",
    border: "border-[#F59E0B]/30",
    dot: "bg-[#F59E0B]",
  },
  orchestration: {
    text: "text-[#10B981]",
    bg: "bg-[#10B981]/10",
    border: "border-[#10B981]/30",
    dot: "bg-[#10B981]",
  },
};

export function SeparationOfConcerns() {
  const [activeLayer, setActiveLayer] = useState<keyof typeof layerIcons>("data");
  const active = separationData.find((d) => d.id === activeLayer)!;
  const Icon = layerIcons[activeLayer];
  const accent = layerAccents[activeLayer];

  return (
    <div className="flex flex-col gap-6">
      {/* Three-layer architecture */}
      <div className="bg-[#09090B] border border-[#27272A] rounded-2xl overflow-hidden">
        {/* Layer tabs */}
        <div className="grid grid-cols-3 border-b border-[#27272A]">
          {separationData.map((layer) => {
            const LayerIcon = layerIcons[layer.id];
            const layerAccent = layerAccents[layer.id];
            const isActive = activeLayer === layer.id;
            return (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id)}
                className={`flex items-center gap-2 px-4 py-3 border-r border-[#27272A] last:border-r-0 transition-colors ${
                  isActive ? `${layerAccent.bg} border-b-2 ${layerAccent.border.replace("/30", "")}` : "hover:bg-[#18181B]"
                }`}
                style={isActive ? { borderBottomColor: "currentColor" } : {}}
              >
                <LayerIcon className={`w-4 h-4 ${isActive ? layerAccent.text : "text-[#52525B]"}`} />
                <span className={`text-[10px] sm:text-xs font-bold ${isActive ? layerAccent.text : "text-[#71717A]"}`}>
                  {layer.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active layer detail */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeLayer}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="p-5 flex flex-col gap-4"
          >
            {/* Tagline + principle */}
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg ${accent.bg} border ${accent.border} flex items-center justify-center flex-none`}>
                <Icon className={`w-4 h-4 ${accent.text}`} />
              </div>
              <div>
                <h3 className={`text-sm font-bold ${accent.text} mb-1`}>{active.tagline}</h3>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">{active.principle}</p>
              </div>
            </div>

            {/* Monolithic failure vs composable solution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#EF4444]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#EF4444]">
                    Monolithic Failure
                  </span>
                </div>
                <p className="text-[11px] text-[#A1A1AA] leading-relaxed">{active.monolithicFailure}</p>
              </div>
              <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3.5 h-3.5 rounded-full ${accent.dot}`} />
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${accent.text}`}>
                    Composable Solution
                  </span>
                </div>
                <p className="text-[11px] text-[#A1A1AA] leading-relaxed">{active.composableSolution}</p>
              </div>
            </div>

            {/* Real-world proof */}
            <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#71717A] mb-2 block">
                Proof From The Field
              </span>
              <p className="text-[11px] text-[#A1A1AA] leading-relaxed">{active.realWorldProof}</p>
            </div>

            {/* Our components */}
            <div className="flex flex-wrap gap-2">
              {active.ourComponents.map((comp) => (
                <span
                  key={comp}
                  className={`text-[10px] font-mono px-2 py-1 rounded border ${accent.bg} ${accent.text} ${accent.border}`}
                >
                  {comp}
                </span>
              ))}
            </div>

            {/* Code example */}
            <div className="bg-[#18181B] rounded-xl border border-[#27272A] overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-[#27272A]/50 border-b border-[#27272A]">
                <div className={`w-1.5 h-1.5 rounded-full ${accent.dot}`} />
                <span className="text-[10px] font-mono text-[#71717A]">{active.id}_separation.py</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="font-mono text-[10px] leading-relaxed text-[#A1A1AA]">
                  <code>{active.codeExample}</code>
                </pre>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Monolithic failure cases */}
      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#71717A] mb-3 px-1">
          What Coupling Looks Like In Practice
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {monolithicFailures.map((failure) => (
            <FailureCard key={failure.platform} failure={failure} />
          ))}
        </div>
      </div>
    </div>
  );
}

function FailureCard({ failure }: { failure: FailureCase; key?: string }) {
  return (
    <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-4 hover:border-[#3F3F46] transition-colors">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-3.5 h-3.5 text-[#EF4444] flex-none" />
        <h4 className="text-xs font-bold text-[#FAFAFA]">{failure.platform}</h4>
        <span className="text-[9px] font-mono text-[#52525B] bg-[#27272A] px-1.5 py-0.5 rounded border border-[#3F3F46]">
          {failure.coupled}
        </span>
      </div>
      <p className="text-[11px] text-[#A1A1AA] leading-relaxed mb-3">{failure.consequence}</p>
      <div className="flex items-start gap-1.5 pt-3 border-t border-[#27272A]">
        <ArrowRight className="w-3 h-3 text-[#22D3EE] flex-none mt-0.5" />
        <p className="text-[10px] text-[#71717A] leading-relaxed italic">{failure.lesson}</p>
      </div>
    </div>
  );
}
