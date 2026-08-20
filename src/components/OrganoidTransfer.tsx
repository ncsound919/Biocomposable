import { organoidSources, transferMetrics } from "../data";
import { Code2, Activity, ShieldCheck, FileCode2 } from "lucide-react";

export function OrganoidTransfer() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left: Config & FAIR sources */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="bg-[#18181B] border border-[#27272A] rounded-xl overflow-hidden flex flex-col">
          <div className="bg-[#27272A]/50 px-4 py-2 border-b border-[#27272A] flex items-center gap-2">
            <Code2 className="w-3.5 h-3.5 text-[#A1A1AA]" />
            <span className="text-[10px] font-mono text-[#71717A]">training_config.yaml</span>
          </div>
          <div className="p-5 font-mono text-xs leading-loose text-[#A1A1AA]">
            <div className="text-[#F59E0B]">pretrain:</div>
            <div className="pl-4">
              <div className="text-[#22D3EE]">sources:</div>
              <div className="pl-4 text-[#FAFAFA]">
                - <span className="text-[#A1A1AA]">"kidney_organoid_aki"</span><br/>
                - <span className="text-[#A1A1AA]">"greenstone_t1d"</span>
              </div>
              <div className="text-[#22D3EE] mt-1">freeze_encoder: <span className="text-[#F59E0B]">false</span></div>
            </div>
          </div>
        </div>

        <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-4 flex flex-col gap-3">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#71717A] flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
            FAIR Organoid Objects (bio-bench)
          </h3>
          {organoidSources.map(src => (
            <div key={src.id} className="flex flex-col gap-1.5 p-3 rounded-lg border border-[#3F3F46] bg-[#18181B] hover:border-[#F59E0B]/30 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#FAFAFA]">{src.name}</span>
                <span className="text-[9px] font-mono text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.5 rounded border border-[#10B981]/20">{src.version}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-[#71717A]">
                <FileCode2 className="w-3 h-3" />
                provenance: {src.provenance}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Transfer Benchmark */}
      <div className="lg:col-span-7 bg-[#18181B] border border-[#27272A] rounded-xl p-6 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-bold text-[#FAFAFA] flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-[#F59E0B]" />
              Clinical Transfer Benchmark
            </h3>
            <p className="text-xs text-[#A1A1AA]">Quantifying diagnostic gains from clean organoid pre-training applied to clinical Banff-labeled biopsies.</p>
          </div>
        </div>

        <div className="flex flex-col gap-6 flex-grow justify-center">
          {transferMetrics.map(metric => {
            const gain = metric.transferAUC - metric.baselineAUC;
            return (
              <div key={metric.id} className="flex flex-col gap-2">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-[#FAFAFA]">{metric.task}</span>
                  <span className="text-[10px] font-mono text-[#10B981] font-bold">+{gain.toFixed(2)} AUC Gain</span>
                </div>
                
                {/* Dual Bar Chart */}
                <div className="relative w-full flex flex-col gap-1">
                  {/* Baseline */}
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-mono text-[#71717A] w-12 text-right">Baseline</span>
                    <div className="flex-grow h-3 bg-[#09090B] border border-[#27272A] rounded-full overflow-hidden relative">
                      <div className="h-full bg-[#3F3F46] rounded-full" style={{ width: `${metric.baselineAUC * 100}%` }} />
                    </div>
                    <span className="text-[9px] font-mono text-[#A1A1AA] w-8">{metric.baselineAUC.toFixed(2)}</span>
                  </div>
                  {/* Transfer */}
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-mono text-[#F59E0B] font-bold w-12 text-right">Transfer</span>
                    <div className="flex-grow h-3 bg-[#09090B] border border-[#27272A] rounded-full overflow-hidden relative">
                      <div className="h-full bg-[#F59E0B] rounded-full" style={{ width: `${metric.transferAUC * 100}%` }} />
                    </div>
                    <span className="text-[9px] font-mono text-[#F59E0B] font-bold w-8">{metric.transferAUC.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
