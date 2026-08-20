import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { contracts } from "../data";
import { FileCode2, CheckCircle2 } from "lucide-react";

export function ContractsExplorer() {
  const [activeContract, setActiveContract] = useState(contracts[0].id);

  return (
    <div className="bg-[#09090B] border border-[#27272A] rounded-2xl overflow-hidden flex flex-col md:flex-row min-h-[400px] z-10 relative">
      <div className="w-full md:w-1/3 bg-[#18181B] border-b md:border-b-0 md:border-r border-[#27272A] p-4 flex flex-col gap-2">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#71717A] mb-2 px-2">
          Defined Contracts
        </h3>
        <nav className="flex flex-col gap-1">
          {contracts.map((contract) => (
            <button
              key={contract.id}
              onClick={() => setActiveContract(contract.id)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-colors ${
                activeContract === contract.id
                  ? 'bg-[#27272A] text-[#22D3EE] font-semibold border border-[#3F3F46]'
                  : 'text-[#A1A1AA] hover:bg-[#27272A]/50 border border-transparent'
              }`}
            >
              <FileCode2 className={`w-4 h-4 ${activeContract === contract.id ? 'text-[#22D3EE]' : 'opacity-50'}`} />
              <span className="text-xs truncate">{contract.name}</span>
            </button>
          ))}
        </nav>
      </div>
      
      <div className="w-full md:w-2/3 p-5 flex flex-col">
        <AnimatePresence mode="wait">
          {contracts.map((contract) => 
            contract.id === activeContract ? (
              <motion.div
                key={contract.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col h-full"
              >
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-sm font-bold text-[#FAFAFA]">
                    {contract.name}
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
                    <CheckCircle2 className="w-3 h-3" />
                    Validated
                  </span>
                </div>
                
                <p className="text-[#A1A1AA] mb-4 text-xs leading-relaxed font-medium">
                  {contract.role}
                </p>
                
                <div className="mb-4 bg-[#22D3EE]/5 border border-[#22D3EE]/20 rounded-xl p-4 flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#22D3EE] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Key Architectural Decision
                  </span>
                  <p className="text-xs text-[#FAFAFA] leading-relaxed">
                    {contract.decision}
                  </p>
                </div>
                
                <div className="mt-auto bg-[#18181B] rounded-xl border border-[#27272A] overflow-hidden flex flex-col">
                  <div className="flex items-center gap-2 px-3 py-2 bg-[#27272A]/50 border-b border-[#27272A]">
                    <span className="text-[10px] font-mono text-[#71717A]">
                      {contract.name.toLowerCase()}.py
                    </span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="font-mono text-[11px] leading-relaxed text-[#A1A1AA]">
                      <code>{contract.code}</code>
                    </pre>
                  </div>
                </div>
              </motion.div>
            ) : null
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
