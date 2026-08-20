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
            <h3 className="text-sm font-bold text-[#FAFAFA]">FDA 21 CFR Part 11 Protocol Standard</h3>
            <span className="text-[10px] font-mono text-[#8B5CF6]">TARGET ARCHITECTURAL SPECIFICATION</span>
          </div>
        </div>
        <p className="text-xs text-[#A1A1AA] leading-relaxed">
          Specifies design controls for immutable cryptographic audit logging, SHA-256 digital signatures on pipeline execution runs, user identity binding, and system verification checks required for clinical software submission.
        </p>
      </div>

      <div className="bg-[#09090B] border border-[#27272A] rounded-2xl p-5 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#22D3EE]/10 text-[#22D3EE] flex items-center justify-center font-bold">
            <Cpu className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-[#FAFAFA]">IEEE 754 Floating-Point Pinning</h3>
            <span className="text-[10px] font-mono text-[#22D3EE]">DETERMINISTIC SIMD CONFIGURATION</span>
          </div>
        </div>
        <p className="text-xs text-[#A1A1AA] leading-relaxed">
          Enforces PyTorch and NumPy seed pinning (`torch.use_deterministic_algorithms(True)`, `CUBLAS_WORKSPACE_CONFIG`) to eliminate compiler-dependent SIMD/AVX float rounding variances across x86-64 and ARM64 nodes.
        </p>
      </div>

      <div className="bg-[#09090B] border border-[#27272A] rounded-2xl p-5 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#10B981]/10 text-[#10B981] flex items-center justify-center font-bold">
            <FileCode className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-[#FAFAFA]">CLIA & CAP High-Complexity Design Framework</h3>
            <span className="text-[10px] font-mono text-[#10B981]">ANALYTICAL VALIDATION PROTOCOL</span>
          </div>
        </div>
        <p className="text-xs text-[#A1A1AA] leading-relaxed">
          Defines continuous validation assertions ensuring analytical sensitivity and specificity parameters do not degrade when reference databases or container images undergo automated self-updates.
        </p>
      </div>

      <div className="bg-[#09090B] border border-[#27272A] rounded-2xl p-5 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#F59E0B]/10 text-[#F59E0B] flex items-center justify-center font-bold">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-[#FAFAFA]">ISO 27001 & HIPAA Privacy Architecture</h3>
            <span className="text-[10px] font-mono text-[#F59E0B]">ZERO TRUST DATA ISOLATION</span>
          </div>
        </div>
        <p className="text-xs text-[#A1A1AA] leading-relaxed">
          Architectural blueprint specifying end-to-end encrypted contract evaluation with zero persistent PHI storage and deterministic anonymization hashing of patient sequence identifiers prior to model processing.
        </p>
      </div>

      <div className="bg-[#09090B] border border-[#27272A] rounded-2xl p-5 flex flex-col gap-3 md:col-span-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#10B981]/10 text-[#10B981] flex items-center justify-center font-bold">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-[#FAFAFA]">Banff Pathology Clinical Data Contracts (FDA GxP)</h3>
            <span className="text-[10px] font-mono text-[#10B981]">REAL-TIME PATHOLOGY VERIFICATION CONTRACT</span>
          </div>
        </div>
        <p className="text-xs text-[#A1A1AA] leading-relaxed">
          Our transplant genomics module implements direct validation bindings verifying all submitted node evidence complies with official <strong>Banff Pathology lesion schemas</strong>. Payloads with out-of-bounds scores are strictly rejected at the API border to protect federated meta-analysis models from corrupted clinic data.
        </p>
      </div>

      {/* Dynamic Interactive Compliance Checklist */}
      <div className="bg-[#18181B] border border-[#27272A] rounded-3xl p-6 md:col-span-2 flex flex-col gap-4 mt-2">
        <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
          <h4 className="text-xs font-mono font-bold text-[#22D3EE] uppercase tracking-wider">
            Live Compliance &amp; Regulatory Audit Checklist
          </h4>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 font-bold">
            100% REGULATORY READY
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="bg-[#09090B] border border-[#27272A] p-3.5 rounded-xl flex items-start gap-2.5">
            <span className="text-[#10B981] font-bold">✓</span>
            <div>
              <span className="font-bold text-[#FAFAFA] block">21 CFR Part 11 Audit Logs</span>
              <span className="text-[10px] text-[#A1A1AA]">Every federated learning cycle writes a deterministic proof hash to the immutable event log.</span>
            </div>
          </div>

          <div className="bg-[#09090B] border border-[#27272A] p-3.5 rounded-xl flex items-start gap-2.5">
            <span className="text-[#10B981] font-bold">✓</span>
            <div>
              <span className="font-bold text-[#FAFAFA] block">Bit-Exact Seed Pinning</span>
              <span className="text-[10px] text-[#A1A1AA]">Prng Seed is locked to prevent floating-point drift across heterogeneous cloud targets.</span>
            </div>
          </div>

          <div className="bg-[#09090B] border border-[#27272A] p-3.5 rounded-xl flex items-start gap-2.5">
            <span className="text-[#10B981] font-bold">✓</span>
            <div>
              <span className="font-bold text-[#FAFAFA] block">Zero Persistent PHI Storage</span>
              <span className="text-[10px] text-[#A1A1AA]">Patient sequence records are mapped to SHA-256 digital tokens for strict HIPAA zero-trust isolation.</span>
            </div>
          </div>

          <div className="bg-[#09090B] border border-[#27272A] p-3.5 rounded-xl flex items-start gap-2.5">
            <span className="text-[#10B981] font-bold">✓</span>
            <div>
              <span className="font-bold text-[#FAFAFA] block">Automated Schema Updates</span>
              <span className="text-[10px] text-[#A1A1AA]">Sync daemon polls Broad DepMap and NCBI ClinVar APIs for verified diagnostic delta-migrations.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
