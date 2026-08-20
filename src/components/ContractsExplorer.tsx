import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { contracts } from "../data";
import { FileCode2, CheckCircle2, ShieldCheck, Play, Loader2, Download, Copy, Check } from "lucide-react";

export function ContractsExplorer() {
  const [activeContract, setActiveContract] = useState(contracts[0].id);

  // Live Lesion Sandbox State
  const [lesions, setLesions] = useState({ g: 2, t: 2, v: 1, i: 2, ptc: 2, ah: 0, cg: 0 });
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleRunValidation = async () => {
    setIsValidating(true);
    try {
      const res = await fetch("/agent/v1/validate-schema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lesions)
      });
      const data = await res.json();
      setValidationResult(data);
    } catch (err) {
      console.error("Schema validation failed:", err);
    } finally {
      setIsValidating(false);
    }
  };

  const copyContractCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#09090B] border border-[#27272A] rounded-2xl overflow-hidden flex flex-col md:flex-row min-h-[420px] z-10 relative">
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

          {/* Download RO-Crate Action */}
          <div className="mt-auto pt-4 border-t border-[#27272A]">
            <a
              href="/agent/v1/download/ro-crate"
              download="ro-crate-metadata.json"
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#27272A] hover:bg-[#3F3F46] text-[#FAFAFA] rounded-xl text-[10px] font-mono border border-[#3F3F46] transition-all font-bold"
            >
              <Download className="w-3.5 h-3.5 text-[#10B981]" />
              Download RO-Crate Metadata
            </a>
          </div>
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
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h2 className="text-sm font-bold text-[#FAFAFA]">
                        {contract.name}
                      </h2>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
                        <CheckCircle2 className="w-3 h-3" />
                        Validated
                      </span>
                    </div>

                    <button
                      onClick={() => copyContractCode(contract.code)}
                      className="text-[#71717A] hover:text-[#FAFAFA] text-[10px] font-mono flex items-center gap-1 bg-[#18181B] px-2.5 py-1 rounded-lg border border-[#27272A]"
                    >
                      {copiedCode ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3" />}
                      {copiedCode ? "Copied" : "Copy Code"}
                    </button>
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
                    <div className="p-4 overflow-x-auto max-h-[220px]">
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

      {/* Real Interactive Banff 2023 Schema Validation Sandbox */}
      <div className="bg-[#09090B] border border-[#27272A] rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
            <h3 className="text-xs font-bold text-[#FAFAFA] uppercase tracking-widest">
              Live Banff 2023 Pathology Lesion Contract Validator
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/10 px-2.5 py-1 rounded-full border border-[#10B981]/30 font-bold">
            POST /agent/v1/validate-schema
          </span>
        </div>

        <p className="text-xs text-[#A1A1AA] leading-relaxed">
          Adjust Banff kidney transplant biopsy lesion scores below (0 to 3) to execute live schema validation on the Express server and compute Microvascular Inflammation (MVI) & rejection severity:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { key: "g", label: "g (Glomerulitis)", desc: "Glomerular inflammation" },
            { key: "t", label: "t (Tubulitis)", desc: "Tubular cell infiltration" },
            { key: "v", label: "v (Intimal Arteritis)", desc: "Vascular transmural" },
            { key: "i", label: "i (Interstitial)", desc: "Parenchymal inflammation" },
            { key: "ptc", label: "ptc (Peritubular)", desc: "Capillaritis score" }
          ].map(({ key, label, desc }) => (
            <div key={key} className="bg-[#18181B] border border-[#27272A] rounded-xl p-3 flex flex-col gap-1.5">
              <span className="text-[10px] font-bold font-mono text-[#FAFAFA]">{label}</span>
              <span className="text-[9px] text-[#71717A] truncate">{desc}</span>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="1"
                  value={(lesions as any)[key]}
                  onChange={(e) => setLesions({ ...lesions, [key]: Number(e.target.value) })}
                  className="w-full accent-[#10B981]"
                />
                <span className="text-xs font-bold font-mono text-[#10B981] bg-[#09090B] px-2 py-0.5 rounded border border-[#27272A]">
                  {(lesions as any)[key]}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            onClick={handleRunValidation}
            disabled={isValidating}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#10B981] hover:bg-[#34D399] text-[#09090B] rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#10B981]/20 cursor-pointer"
          >
            {isValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {isValidating ? "Validating Schema..." : "Execute Express Schema Validation"}
          </button>

          {validationResult && (
            <div className="w-full sm:w-auto flex-1 bg-[#18181B] border border-[#10B981]/30 rounded-xl p-3 font-mono text-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[#10B981] font-bold">MVI Index: {validationResult.calculatedMetrics?.mviIndex}</span>
                <span className="text-[#71717A]">|</span>
                <span className="text-[#FAFAFA]">{validationResult.calculatedMetrics?.rejectionDiagnosis}</span>
              </div>
              <span className="text-[10px] text-[#22D3EE] bg-[#09090B] px-2 py-1 rounded border border-[#27272A]">
                Hash: {validationResult.contractHash}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
