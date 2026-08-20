import { federatedSitesData } from "../data";
import { ShieldCheck, Network, Database, Activity, GitBranch } from "lucide-react";

export function FederatedGovernance() {
  return (
    <div className="flex flex-col gap-6">
      
      {/* Network Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#22D3EE]/10 border border-[#22D3EE]/30 flex items-center justify-center">
            <Network className="w-5 h-5 text-[#22D3EE]" />
          </div>
          <div>
            <div className="text-2xl font-mono font-bold text-[#FAFAFA]">3</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#71717A]">Active Nodes</div>
          </div>
        </div>
        <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center">
            <Database className="w-5 h-5 text-[#10B981]" />
          </div>
          <div>
            <div className="text-2xl font-mono font-bold text-[#FAFAFA]">4,190</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#71717A]">Total Cohort Size</div>
          </div>
        </div>
        <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center justify-center">
            <Activity className="w-5 h-5 text-[#F59E0B]" />
          </div>
          <div>
            <div className="text-2xl font-mono font-bold text-[#FAFAFA]">0.03</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#71717A]">Avg. Heterogeneity</div>
          </div>
        </div>
      </div>

      {/* Sites Table */}
      <div className="bg-[#09090B] border border-[#27272A] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#18181B] border-b border-[#27272A]">
                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-[#71717A] w-1/4">Origin Site</th>
                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-[#71717A]">Cohort</th>
                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-[#71717A]">Calibration (ECE)</th>
                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-[#71717A]">Heterogeneity</th>
                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-[#71717A]">Data Rights</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A]">
              {federatedSitesData.map((site) => (
                <tr key={site.id} className="hover:bg-[#18181B]/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-3.5 h-3.5 text-[#52525B]" />
                      <span className="text-xs font-bold text-[#FAFAFA]">{site.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-mono text-[#A1A1AA]">{site.cohortSize.toLocaleString()}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono font-medium ${site.calibration.ece > 0.05 ? 'text-[#F59E0B]' : 'text-[#10B981]'}`}>
                        {site.calibration.ece.toFixed(3)}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-[#27272A] rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${site.heterogeneity > 0.1 ? 'bg-[#F59E0B]' : 'bg-[#22D3EE]'}`}
                          style={{ width: `${Math.min(site.heterogeneity * 500, 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-[#71717A]">{site.heterogeneity.toFixed(2)}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-1 rounded border bg-[#27272A] text-[#A1A1AA] border-[#3F3F46]">
                      <ShieldCheck className="w-3 h-3" />
                      {site.dataRights}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="text-[10px] text-[#71717A] text-center font-mono bg-[#18181B] border border-[#27272A] rounded-lg p-3">
        Note: Table displays <strong>GET /agent/v1/federation/report</strong> metadata only. Raw patient data remains at the origin site.
      </div>
    </div>
  );
}
