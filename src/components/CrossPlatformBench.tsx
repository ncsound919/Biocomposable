import { crossPlatformData } from "../data";
import { TestTube2, Network, Activity, BarChart2, CheckCircle2, AlertTriangle, Code2 } from "lucide-react";

export function CrossPlatformBench() {
  return (
    <div className="flex flex-col gap-6">
      
      {/* Code Config & Summary */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-5 bg-[#18181B] border border-[#27272A] rounded-xl overflow-hidden flex flex-col">
          <div className="bg-[#27272A]/50 px-4 py-2 border-b border-[#27272A] flex items-center gap-2">
            <Code2 className="w-3.5 h-3.5 text-[#A1A1AA]" />
            <span className="text-[10px] font-mono text-[#71717A]">training_config.yaml</span>
          </div>
          <div className="p-5 flex-grow font-mono text-xs text-[#A1A1AA] leading-loose">
            <div className="text-[#F59E0B]">evaluate_cross_platform: <span className="text-[#22D3EE]">true</span></div>
            <div className="text-[#F59E0B]">domain_adversarial: <span className="text-[#22D3EE]">true</span></div>
            <div className="mt-4 text-[#71717A]"># Enables the bio-bench cross-protocol track</div>
            <div className="text-[#71717A]"># Ensures library-prep robustness via domain-invariant learning.</div>
          </div>
        </div>

        <div className="md:col-span-7 bg-[#09090B] border border-[#27272A] rounded-xl p-5 flex flex-col justify-center">
          <h3 className="text-sm font-bold text-[#FAFAFA] mb-2 flex items-center gap-2">
            <Network className="w-4 h-4 text-[#22D3EE]" />
            Cross-Protocol Benchmark Track
          </h3>
          <p className="text-xs text-[#A1A1AA] leading-relaxed mb-6">
            Evaluates the locked model against paired biological samples processed with distinct library-prep kits. 
            Measures diagnosis concordance, cell-state fraction correlation, and calibration drift to ensure the model generalizes across protocols (e.g., Fragmentia-AI cfDNA variation).
          </p>
          <div className="flex items-center gap-4">
            <div className="bg-[#22D3EE]/10 border border-[#22D3EE]/30 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#22D3EE]" />
              <span className="text-[10px] font-mono font-bold text-[#22D3EE] uppercase tracking-widest">Protocol Invariant</span>
            </div>
            <span className="text-[10px] font-mono text-[#71717A]">bio-bench v2.4.0</span>
          </div>
        </div>
      </div>

      {/* Metrics Table */}
      <div className="bg-[#09090B] border border-[#27272A] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#18181B] border-b border-[#27272A]">
                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-[#71717A]">Protocol Comparison (A vs B)</th>
                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-[#71717A]">Diag. Concordance</th>
                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-[#71717A]">Cell-State Corr (R²)</th>
                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-[#71717A]">Calibration Drift (ΔECE)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A]">
              {crossPlatformData.map((metric) => {
                const isConcordanceGood = metric.concordance >= 0.90;
                const isCorrGood = metric.cellStateCorrelation >= 0.85;
                const isDriftGood = metric.calibrationDrift <= 0.05;

                return (
                  <tr key={metric.id} className="hover:bg-[#18181B]/50 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <TestTube2 className="w-3.5 h-3.5 text-[#52525B] group-hover:text-[#FAFAFA] transition-colors shrink-0" />
                          <span className="text-xs font-bold text-[#FAFAFA]">{metric.protocolA}</span>
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${metric.rpdA > 0 ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30' : 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30'}`}>
                            RpD: {metric.rpdA.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 pl-6">
                          <span className="text-[10px] font-mono text-[#71717A] shrink-0">vs</span>
                          <span className="text-xs text-[#A1A1AA]">{metric.protocolB}</span>
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${metric.rpdB > 0 ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30' : 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30'}`}>
                            RpD: {metric.rpdB.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-mono font-medium ${isConcordanceGood ? 'text-[#10B981]' : 'text-[#F59E0B]'}`}>
                          {(metric.concordance * 100).toFixed(1)}%
                        </span>
                        {!isConcordanceGood && <AlertTriangle className="w-3 h-3 text-[#F59E0B]" />}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-mono font-medium ${isCorrGood ? 'text-[#10B981]' : 'text-[#F59E0B]'}`}>
                          {metric.cellStateCorrelation.toFixed(2)}
                        </span>
                        <div className="w-16 h-1 bg-[#27272A] rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${isCorrGood ? 'bg-[#10B981]' : 'bg-[#F59E0B]'}`}
                            style={{ width: `${Math.min(metric.cellStateCorrelation * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-mono font-medium ${isDriftGood ? 'text-[#A1A1AA]' : 'text-[#EF4444]'}`}>
                          +{metric.calibrationDrift.toFixed(3)}
                        </span>
                        {isDriftGood ? (
                          <span className="text-[9px] font-mono text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.5 rounded border border-[#10B981]/20">STABLE</span>
                        ) : (
                          <span className="text-[9px] font-mono text-[#EF4444] bg-[#EF4444]/10 px-1.5 py-0.5 rounded border border-[#EF4444]/20">DRIFT</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
