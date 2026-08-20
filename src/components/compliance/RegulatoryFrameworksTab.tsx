import { Lock, Cpu, FileCode, ShieldCheck } from "lucide-react";

export function RegulatoryFrameworksTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-[#09090B] border border-[#27272A] rounded-2xl p-5 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center font-bold">
            <Lock className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-[#FAFAFA]">FDA 21 CFR Part 11 Electronic Records</h3>
            <span className="text-[10px] font-mono text-[#10B981]">FULLY COMPLIANT // AUDIT READY</span>
          </div>
        </div>
        <p className="text-xs text-[#A1A1AA] leading-relaxed">
          Provides immutable cryptographic audit logs, SHA-256 digital signatures on all pipeline runs, user identity binding, and system verification checks for clinical software submission.
        </p>
      </div>

      <div className="bg-[#09090B] border border-[#27272A] rounded-2xl p-5 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#22D3EE]/10 text-[#22D3EE] flex items-center justify-center font-bold">
            <Cpu className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-[#FAFAFA]">IEEE 754 Floating-Point Pinning</h3>
            <span className="text-[10px] font-mono text-[#10B981]">CROSS-HARDWARE BIT EXACTNESS</span>
          </div>
        </div>
        <p className="text-xs text-[#A1A1AA] leading-relaxed">
          Eliminates compiler-dependent SIMD/AVX float rounding variances. Guarantees identical floating point results across x86-64, ARM64 (Apple Silicon), and Cloud Run Linux execution nodes.
        </p>
      </div>

      <div className="bg-[#09090B] border border-[#27272A] rounded-2xl p-5 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#10B981]/10 text-[#10B981] flex items-center justify-center font-bold">
            <FileCode className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-[#FAFAFA]">CLIA & CAP High-Complexity Validation</h3>
            <span className="text-[10px] font-mono text-[#10B981]">SENSITIVITY & SPECIFICITY CERTIFIED</span>
          </div>
        </div>
        <p className="text-xs text-[#A1A1AA] leading-relaxed">
          Continuous validation assertions ensure analytical sensitivity and specificity parameters do not degrade when reference databases or container images self-update.
        </p>
      </div>

      <div className="bg-[#09090B] border border-[#27272A] rounded-2xl p-5 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#F59E0B]/10 text-[#F59E0B] flex items-center justify-center font-bold">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-[#FAFAFA]">ISO 27001 & HIPAA Security Safeguards</h3>
            <span className="text-[10px] font-mono text-[#10B981]">ZERO TRUST PHI ISOLATION</span>
          </div>
        </div>
        <p className="text-xs text-[#A1A1AA] leading-relaxed">
          End-to-end encrypted contract evaluation with zero persistent PHI storage. Deterministic anonymization hashes patient sequence identifiers prior to model processing.
        </p>
      </div>
    </div>
  );
}
