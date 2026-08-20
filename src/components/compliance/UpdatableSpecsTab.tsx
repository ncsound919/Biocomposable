import { GitCommit, Zap, Check, Terminal } from "lucide-react";

export interface UpdatableSpec {
  id: string;
  name: string;
  currentVersion: string;
  latestVersion: string;
  sourceRegistry: string;
  lastChecked: string;
  status: "up_to_date" | "update_available" | "updating" | "verified";
  sha256Digest: string;
  deterministicComplianceScore: number;
}

interface Props {
  specs: UpdatableSpec[];
  autoUpdateEnabled: boolean;
  setAutoUpdateEnabled: (val: boolean) => void;
  updateLogs: string[];
}

export function UpdatableSpecsTab({
  specs,
  autoUpdateEnabled,
  setAutoUpdateEnabled,
  updateLogs,
}: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Spec List Table */}
      <div className="lg:col-span-8 flex flex-col gap-3">
        <div className="flex justify-between items-center bg-[#09090B] border border-[#27272A] px-4 py-3 rounded-2xl">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
            <span className="text-xs font-mono text-[#FAFAFA] font-bold">
              Auto-Update Sync Daemon
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-[#71717A]">Cron: Every 1 hr</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoUpdateEnabled}
                onChange={(e) => setAutoUpdateEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-[#27272A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#22D3EE]"></div>
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {specs.map((spec) => (
            <div
              key={spec.id}
              className="bg-[#09090B] border border-[#27272A] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#3F3F46] transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#18181B] border border-[#27272A] flex items-center justify-center text-[#22D3EE] font-bold text-xs shrink-0 mt-0.5">
                  <GitCommit className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#FAFAFA]">{spec.name}</span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#27272A] text-[#71717A]">
                      {spec.sourceRegistry}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#71717A] mt-1">
                    SHA-256: <code className="text-[#A1A1AA]">{spec.sha256Digest}</code>
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 border-[#27272A] pt-2 md:pt-0">
                <div className="flex flex-col text-right font-mono text-[11px]">
                  <span className="text-[#71717A]">
                    Current: <strong className="text-[#FAFAFA]">{spec.currentVersion}</strong>
                  </span>
                  <span className="text-[10px] text-[#A1A1AA]">
                    Latest: <strong className="text-[#22D3EE]">{spec.latestVersion}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {spec.status === "update_available" ? (
                    <span className="px-2.5 py-1 rounded-lg bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30 text-[10px] font-mono font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Update Ready
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 text-[10px] font-mono font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Up to Date
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Update Terminal Stream */}
      <div className="lg:col-span-4 bg-[#09090B] border border-[#27272A] rounded-2xl p-4 flex flex-col gap-3 font-mono">
        <div className="flex justify-between items-center border-b border-[#27272A] pb-2 text-[11px]">
          <div className="flex items-center gap-2 text-[#22D3EE] font-bold">
            <Terminal className="w-3.5 h-3.5" />
            Live Self-Update Event Stream
          </div>
          <span className="text-[9px] text-[#71717A]">PORT 3000 // EVENT_BUS</span>
        </div>

        <div className="flex-1 bg-[#18181B] rounded-xl p-3 border border-[#27272A] overflow-y-auto max-h-[320px] text-[10px] leading-relaxed flex flex-col gap-2">
          {updateLogs.map((log, index) => (
            <div
              key={index}
              className={`${
                log.includes("SUCCESS")
                  ? "text-[#10B981] font-bold"
                  : log.includes("NETMHCPAN") || log.includes("CLINVAR")
                  ? "text-[#22D3EE]"
                  : "text-[#A1A1AA]"
              }`}
            >
              {log}
            </div>
          ))}
        </div>

        <div className="p-3 rounded-xl bg-[#22D3EE]/5 border border-[#22D3EE]/20 flex flex-col gap-1 text-[10px]">
          <span className="font-bold text-[#22D3EE]">Hot-Reload Contract Engine</span>
          <p className="text-[#A1A1AA]">
            Schema updates do not interrupt running pipelines. Zero-downtime hot reloading swaps model specs deterministically in memory.
          </p>
        </div>
      </div>
    </div>
  );
}
