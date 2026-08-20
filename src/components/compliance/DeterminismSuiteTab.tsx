import { Sliders, Play, RefreshCw, CheckCircle2 } from "lucide-react";

export interface ComplianceAssertion {
  id: string;
  module: string;
  testName: string;
  expectedHash: string;
  actualHash: string;
  status: "passed" | "verifying" | "failed";
  executionTimeMs: number;
  seed: number;
  standard: string;
}

interface Props {
  assertions: ComplianceAssertion[];
  selectedSeed: number;
  setSelectedSeed: (seed: number) => void;
  handleRunVerification: () => void;
}

export function DeterminismSuiteTab({
  assertions,
  selectedSeed,
  setSelectedSeed,
  handleRunVerification,
}: Props) {
  return (
    <div className="flex flex-col gap-6">
      {/* Seed Control Bar */}
      <div className="bg-[#09090B] border border-[#27272A] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#10B981]/10 text-[#10B981] flex items-center justify-center font-mono font-bold text-xs">
            <Sliders className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#FAFAFA]">Global PRNG Seed Pinning</span>
            <span className="text-[10px] font-mono text-[#71717A]">
              Locks random seed state across Monte Carlo & MCMC simulations
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[#71717A]">Seed:</span>
          <input
            type="number"
            value={selectedSeed}
            onChange={(e) => setSelectedSeed(Number(e.target.value))}
            className="w-24 px-3 py-1.5 rounded-xl bg-[#18181B] border border-[#27272A] text-xs font-mono text-[#10B981] font-bold focus:outline-none focus:border-[#10B981]"
          />
          <button
            onClick={handleRunVerification}
            className="px-3 py-1.5 rounded-xl bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 text-xs font-mono font-bold hover:bg-[#10B981]/20 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Play className="w-3 h-3 fill-current" /> Run Assertions
          </button>
        </div>
      </div>

      {/* Assertions Table */}
      <div className="bg-[#09090B] border border-[#27272A] rounded-2xl overflow-hidden">
        <div className="grid grid-cols-12 bg-[#18181B] px-4 py-3 border-b border-[#27272A] text-[10px] font-mono font-bold text-[#71717A] uppercase tracking-wider">
          <div className="col-span-3">Module & Test Name</div>
          <div className="col-span-3">Expected Hash (Blake3)</div>
          <div className="col-span-3">Actual Output Hash</div>
          <div className="col-span-1">Latency</div>
          <div className="col-span-2 text-right">Verification</div>
        </div>

        <div className="divide-y divide-[#27272A]">
          {assertions.map((assert) => (
            <div
              key={assert.id}
              className="grid grid-cols-12 px-4 py-3.5 items-center text-xs hover:bg-[#18181B]/50 transition-colors"
            >
              <div className="col-span-3 flex flex-col">
                <span className="font-bold text-[#FAFAFA]">{assert.testName}</span>
                <span className="text-[10px] font-mono text-[#22D3EE]">
                  {assert.module} ({assert.standard})
                </span>
              </div>

              <div className="col-span-3 font-mono text-[11px] text-[#71717A]">
                <code>{assert.expectedHash}</code>
              </div>

              <div className="col-span-3 font-mono text-[11px] text-[#10B981]">
                <code>{assert.actualHash}</code>
              </div>

              <div className="col-span-1 font-mono text-[11px] text-[#A1A1AA]">
                {assert.executionTimeMs} ms
              </div>

              <div className="col-span-2 flex items-center justify-end">
                {assert.status === "verifying" ? (
                  <span className="px-2.5 py-1 rounded-lg bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/30 text-[10px] font-mono font-bold flex items-center gap-1 animate-pulse">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Verifying...
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-lg bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 text-[10px] font-mono font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> 100% Match
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
