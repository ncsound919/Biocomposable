import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { layers } from "../data";
import { Info, Component } from "lucide-react";

export function ArchitectureStack() {
  const [activeLayer, setActiveLayer] = useState(layers[0].id);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <div className="flex flex-col gap-3">
        {layers.map((layer, idx) => (
          <motion.button
            key={layer.id}
            onClick={() => setActiveLayer(layer.id)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`relative p-5 rounded-xl border text-left transition-all duration-200 ${
              activeLayer === layer.id 
                ? 'bg-[#27272A] border-[#22D3EE]/50 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
                : 'bg-[#09090B] border-[#3F3F46] opacity-70 hover:opacity-100 hover:border-[#71717A]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <h3 className={`text-sm font-bold font-sans tracking-tight ${activeLayer === layer.id ? 'text-[#22D3EE]' : 'text-[#FAFAFA]'}`}>
                {layer.name}
              </h3>
              {idx === 0 && <span className="text-[10px] font-mono text-[#71717A] bg-[#27272A] px-2 py-0.5 rounded">TOP</span>}
              {idx === layers.length - 1 && <span className="text-[10px] font-mono text-[#71717A] bg-[#27272A] px-2 py-0.5 rounded">BASE</span>}
            </div>
            <p className="text-[11px] opacity-80 leading-relaxed font-medium text-[#A1A1AA]">
              {layer.description}
            </p>
          </motion.button>
        ))}
      </div>

      <div className="bg-[#09090B] border border-[#27272A] rounded-2xl p-6 min-h-[350px] flex flex-col">
        <AnimatePresence mode="wait">
          {layers.map((layer) => 
            layer.id === activeLayer ? (
              <motion.div
                key={layer.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full flex flex-col"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-[#22D3EE]" />
                  <h3 className="text-sm font-bold text-[#FAFAFA]">{layer.name}</h3>
                </div>
                
                <p className="text-xs leading-relaxed text-[#A1A1AA] mb-6">
                  {layer.details}
                </p>

                {layer.components && layer.components.length > 0 && (
                  <div className="mt-auto pt-4 border-t border-[#27272A]">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#71717A] mb-3 flex items-center gap-1.5">
                      <Component className="w-3 h-3" />
                      Key Components
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {layer.components.map(c => (
                        <span key={c} className="px-2.5 py-1 bg-[#27272A] text-[#FAFAFA] rounded border border-[#3F3F46] text-[10px] font-mono">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-6 flex items-start gap-2 text-[10px] text-[#A1A1AA] bg-[#22D3EE]/5 border border-[#22D3EE]/20 p-3 rounded-lg">
                  <Info className="w-3.5 h-3.5 flex-shrink-0 text-[#22D3EE]" />
                  <p>
                    <strong className="text-[#22D3EE]">Design Rule:</strong> Each layer can be used without the layer above it. A pipeline can call a service as a standalone function.
                  </p>
                </div>
              </motion.div>
            ) : null
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
