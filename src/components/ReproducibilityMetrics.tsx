import { useState } from "react";
import { rpdData } from "../data";
import { Scale, CheckCircle2, AlertTriangle, XCircle, MousePointer2 } from "lucide-react";

export function ReproducibilityMetrics() {
  const [factors, setFactors] = useState(rpdData);

  const handleToggle = (id: string) => {
    setFactors(prev => prev.map(f => {
      if (f.id !== id) return f;
      if (f.status === 'pass') return { ...f, status: 'warn', impact: 0.05, badge: 'Warn' };
      if (f.status === 'warn') return { ...f, status: 'fail', impact: 0.15, badge: 'Fail' };
      return { ...f, status: 'pass', impact: 0.0, badge: 'Pass' };
    }));
  };

  const totalDebt = factors.reduce((acc, curr) => acc + curr.impact, 0).toFixed(2);
  const debtValue = Number(totalDebt);

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Score Panel */}
      <div className="w-full md:w-1/3 bg-[#18181B] border border-[#27272A] rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden transition-colors duration-500">
        <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[${debtValue > 0.10 ? '#EF4444' : '#10B981'}]/50 to-transparent transition-colors duration-500`} />
        <Scale className={`w-8 h-8 mb-4 transition-colors duration-500 ${debtValue > 0.10 ? 'text-[#EF4444]' : 'text-[#10B981]'}`} />
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA] mb-1">
          Reproducibility Debt (RpD)
        </h3>
        <div className="text-5xl font-mono font-bold text-[#FAFAFA] mb-2 tracking-tighter transition-all duration-300">
          {totalDebt}
        </div>
        
        <div className="w-full px-4 mt-2">
          <div className="w-full bg-[#09090B] border border-[#27272A] rounded-full h-2 overflow-hidden relative">
            <div 
              className={`h-full absolute left-0 top-0 transition-all duration-500 ${debtValue > 0.10 ? 'bg-[#EF4444]' : 'bg-[#10B981]'}`}
              style={{ width: `${Math.min(debtValue * 100, 100)}%` }}
            />
            {/* Target line */}
            <div className="absolute left-[10%] top-0 bottom-0 w-px bg-[#FAFAFA] z-10" />
          </div>
          <div className="flex justify-between items-center w-full mt-2">
            <span className="text-[9px] font-mono text-[#10B981]">0.0</span>
            <span className="text-[9px] font-mono text-[#FAFAFA]">Target &lt;0.10</span>
            <span className="text-[9px] font-mono text-[#EF4444]">1.0</span>
          </div>
        </div>
        <p className="text-[11px] text-[#A1A1AA] mt-4 leading-relaxed">
          Scores every pipeline entry in bio-bench. Penalizes non-deterministic risks, missing digests, and unpinned dependencies. 
        </p>
      </div>

      {/* Factors List */}
      <div className="w-full md:w-2/3 flex flex-col gap-3 relative">
        <div className="absolute -top-3 right-2 flex items-center gap-1.5 px-2 py-1 bg-[#27272A] rounded-full text-[9px] uppercase tracking-widest text-[#A1A1AA] border border-[#3F3F46]">
          <MousePointer2 className="w-3 h-3" />
          Interactive Demo
        </div>
        {factors.map((factor) => {
          let statusConfig = {
            icon: CheckCircle2,
            color: "text-[#10B981]",
            bg: "bg-[#10B981]/10",
            border: "border-[#10B981]/30",
            badge: "Pass",
          };

          if (factor.status === "warn") {
            statusConfig = {
              icon: AlertTriangle,
              color: "text-[#F59E0B]",
              bg: "bg-[#F59E0B]/10",
              border: "border-[#F59E0B]/30",
              badge: "Warn",
            };
          } else if (factor.status === "fail") {
            statusConfig = {
              icon: XCircle,
              color: "text-[#EF4444]",
              bg: "bg-[#EF4444]/10",
              border: "border-[#EF4444]/30",
              badge: "Fail",
            };
          }

          const Icon = statusConfig.icon;

          return (
            <div 
              key={factor.id}
              onClick={() => handleToggle(factor.id)}
              className="bg-[#09090B] border border-[#27272A] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:border-[#3F3F46] hover:bg-[#18181B] transition-all duration-200 select-none group"
            >
              <div className="flex items-start sm:items-center gap-3">
                <div className={`mt-0.5 sm:mt-0 p-1.5 rounded-lg transition-colors ${statusConfig.bg} ${statusConfig.border} border shrink-0`}>
                  <Icon className={`w-4 h-4 transition-colors ${statusConfig.color}`} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#FAFAFA] mb-0.5 group-hover:text-[#22D3EE] transition-colors">{factor.name}</h4>
                  <p className="text-[10px] text-[#A1A1AA] font-mono leading-relaxed">{factor.description}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 self-start sm:self-auto shrink-0 pl-11 sm:pl-0">
                {factor.impact > 0 ? (
                  <span className="text-[11px] font-mono text-[#EF4444] font-bold">
                    +{factor.impact.toFixed(2)} RpD
                  </span>
                ) : (
                  <span className="text-[11px] font-mono text-[#71717A]">
                    +0.00
                  </span>
                )}
                <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border transition-colors ${statusConfig.bg} ${statusConfig.border} ${statusConfig.color}`}>
                  {statusConfig.badge}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
