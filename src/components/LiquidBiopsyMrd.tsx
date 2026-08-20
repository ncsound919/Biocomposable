import { useState } from "react";
import { 
  Activity, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle2, 
  Sliders, 
  Search, 
  Clock,
  Dna,
  ShieldCheck
} from "lucide-react";

interface TimepointData {
  id: string;
  stage: string;
  timeLabel: string;
  vafPpm: number; // Parts per million VAF
  ctDnaCopiesPerMl: number;
  fragmentWpsScore: number;
  methylationTumorFraction: number;
  status: "BASELINE_HIGH" | "CLEARANCE" | "MRD_NEGATIVE" | "EARLY_RELAPSE_WARNING";
  variants: { gene: string; mutation: string; vafPercent: number }[];
}

const timelineData: TimepointData[] = [
  {
    id: "TP-01",
    stage: "Pre-Operative Baseline",
    timeLabel: "Day -7 (Pre-Op)",
    vafPpm: 24500, // 2.45%
    ctDnaCopiesPerMl: 1420,
    fragmentWpsScore: 0.42,
    methylationTumorFraction: 0.028,
    status: "BASELINE_HIGH",
    variants: [
      { gene: "TP53", mutation: "R273H", vafPercent: 2.45 },
      { gene: "KRAS", mutation: "G12D", vafPercent: 1.82 },
    ],
  },
  {
    id: "TP-02",
    stage: "Post-Surgical Clearance",
    timeLabel: "Day +14 (Post-Op)",
    vafPpm: 120, // 0.012%
    ctDnaCopiesPerMl: 8,
    fragmentWpsScore: 0.88,
    methylationTumorFraction: 0.0002,
    status: "CLEARANCE",
    variants: [
      { gene: "TP53", mutation: "R273H", vafPercent: 0.012 },
    ],
  },
  {
    id: "TP-03",
    stage: "Adjuvant Chemotherapy Cycle 3",
    timeLabel: "Month 3",
    vafPpm: 0, // Undetectable (<10 ppm)
    ctDnaCopiesPerMl: 0,
    fragmentWpsScore: 0.96,
    methylationTumorFraction: 0.0000,
    status: "MRD_NEGATIVE",
    variants: [],
  },
  {
    id: "TP-04",
    stage: "6-Month Surveillance",
    timeLabel: "Month 6",
    vafPpm: 45, // 0.0045% (45 ppm - early sub-clinical rebound!)
    ctDnaCopiesPerMl: 3,
    fragmentWpsScore: 0.74,
    methylationTumorFraction: 0.0001,
    status: "EARLY_RELAPSE_WARNING",
    variants: [
      { gene: "TP53", mutation: "R273H", vafPercent: 0.0045 },
    ],
  },
  {
    id: "TP-05",
    stage: "12-Month Surveillance",
    timeLabel: "Month 12",
    vafPpm: 820, // 0.082% (Relapse confirmed)
    ctDnaCopiesPerMl: 64,
    fragmentWpsScore: 0.58,
    methylationTumorFraction: 0.0012,
    status: "EARLY_RELAPSE_WARNING",
    variants: [
      { gene: "TP53", mutation: "R273H", vafPercent: 0.082 },
      { gene: "EGFR", mutation: "T790M", vafPercent: 0.018 },
    ],
  },
];

export function LiquidBiopsyMrd() {
  const [selectedTp, setSelectedTp] = useState<TimepointData>(timelineData[3]);
  const [sensitivityCutoffPpm, setSensitivityCutoffPpm] = useState<number>(10); // 10 ppm = 0.001%

  return (
    <div className="flex flex-col gap-6 w-full text-[#FAFAFA]">
      
      {/* Top Header Controls */}
      <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5 flex flex-col gap-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272A] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span className="text-[10px] font-mono font-bold text-[#10B981] uppercase tracking-wider">
                Non-Invasive Diagnostics
              </span>
            </div>
            <h2 className="text-base font-bold text-[#FAFAFA]">
              Liquid Biopsy ctDNA Minimal Residual Disease (MRD) Tracker
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30">
              Tumor-Informed Hybrid Capture
            </span>
            <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/30">
              Fragmentomics & Methylation
            </span>
          </div>
        </div>

        {/* Sensitivity & Metrics Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-[#A1A1AA] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#10B981]" />
                Assay Limit of Detection
              </span>
              <span className="text-[#10B981] font-bold">{sensitivityCutoffPpm} PPM (0.001%)</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              step="1"
              value={sensitivityCutoffPpm}
              onChange={(e) => setSensitivityCutoffPpm(Number(e.target.value))}
              className="w-full accent-[#10B981] bg-[#27272A] h-1.5 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] text-[#71717A]">
              1 PPM = 1 mutant ctDNA molecule per 1,000,000 wildtype genome equivalents
            </span>
          </div>

          <div className="flex flex-col gap-2 justify-center bg-[#09090B] border border-[#27272A] p-3 rounded-xl font-mono text-[10px]">
            <div className="flex justify-between">
              <span className="text-[#71717A]">Lead Time over Imaging:</span>
              <span className="text-[#10B981] font-bold">5.2 Months Earlier</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#71717A]">Relapse Risk Alert:</span>
              <span className="text-[#F59E0B] font-bold">Month 6 Subclinical Rebound</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 justify-center bg-[#09090B] border border-[#27272A] p-3 rounded-xl font-mono text-[10px]">
            <div className="flex justify-between">
              <span className="text-[#71717A]">Current Selected TP:</span>
              <span className="text-[#22D3EE] font-bold">{selectedTp.timeLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#71717A]">ctDNA VAF Signal:</span>
              <span className={`font-bold ${selectedTp.vafPpm > 0 ? "text-[#EF4444]" : "text-[#10B981]"}`}>
                {selectedTp.vafPpm} PPM
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Longitudinal Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Timeline Navigation Bar */}
        <div className="lg:col-span-12 grid grid-cols-1 sm:grid-cols-5 gap-3">
          {timelineData.map((tp) => {
            const isSelected = selectedTp.id === tp.id;
            return (
              <button
                key={tp.id}
                onClick={() => setSelectedTp(tp)}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  isSelected
                    ? "bg-[#27272A] border-[#10B981] shadow-lg scale-[1.02]"
                    : "bg-[#18181B] border-[#27272A] hover:bg-[#27272A]/50"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-[#71717A]">
                  <span>{tp.timeLabel}</span>
                  <Clock className="w-3 h-3 text-[#10B981]" />
                </div>
                <span className="text-xs font-bold text-[#FAFAFA] truncate">{tp.stage}</span>
                <span className={`text-[10px] font-mono font-bold ${
                  tp.vafPpm === 0 ? "text-[#10B981]" : tp.vafPpm < 100 ? "text-[#F59E0B]" : "text-[#EF4444]"
                }`}>
                  {tp.vafPpm === 0 ? "MRD NEGATIVE" : `${tp.vafPpm} PPM VAF`}
                </span>
              </button>
            );
          })}
        </div>

        {/* Timepoint Detailed Inspection */}
        <div className="lg:col-span-6 bg-[#18181B] border border-[#27272A] rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
            <div>
              <span className="text-[10px] font-mono text-[#10B981] uppercase font-bold">
                Timepoint: {selectedTp.timeLabel}
              </span>
              <h3 className="text-sm font-bold text-[#FAFAFA]">
                {selectedTp.stage}
              </h3>
            </div>
            <Activity className="w-5 h-5 text-[#10B981]" />
          </div>

          <div className="flex flex-col gap-3 font-mono text-[11px]">
            <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-3 flex justify-between items-center">
              <span className="text-[#71717A] uppercase">Circulating Tumor DNA (ctDNA) VAF</span>
              <span className={`text-base font-bold ${selectedTp.vafPpm > 0 ? "text-[#EF4444]" : "text-[#10B981]"}`}>
                {selectedTp.vafPpm} PPM ({(selectedTp.vafPpm / 10000).toFixed(4)}%)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-3">
                <span className="text-[10px] text-[#71717A] uppercase block mb-1">Copies / mL Plasma</span>
                <span className="text-sm font-bold text-[#22D3EE]">{selectedTp.ctDnaCopiesPerMl} copies</span>
              </div>
              <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-3">
                <span className="text-[10px] text-[#71717A] uppercase block mb-1">Window Protection Score</span>
                <span className="text-sm font-bold text-[#10B981]">{selectedTp.fragmentWpsScore}</span>
              </div>
            </div>

            <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-3 flex flex-col gap-2">
              <span className="text-[10px] text-[#71717A] uppercase">Detected Somatic Variants</span>
              {selectedTp.variants.length === 0 ? (
                <span className="text-[#10B981] text-xs font-bold">No Somatic Mutations Detected (Clean Clearance)</span>
              ) : (
                <div className="flex flex-col gap-1">
                  {selectedTp.variants.map((v, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="text-[#FAFAFA] font-bold">{v.gene} {v.mutation}</span>
                      <span className="text-[#EF4444] font-bold">{v.vafPercent}% VAF</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Relapse Warning & Clinical Guidance */}
        <div className="lg:col-span-6 bg-[#18181B] border border-[#27272A] rounded-2xl p-5 flex flex-col justify-between gap-4">
          <div>
            <h3 className="text-xs font-mono font-bold text-[#A1A1AA] uppercase mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              Clinical Decision Support Guidance
            </h3>

            {selectedTp.status === "EARLY_RELAPSE_WARNING" ? (
              <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-xl p-4 flex flex-col gap-2 text-xs">
                <div className="flex items-center gap-2 text-[#F59E0B] font-bold">
                  <AlertCircle className="w-4 h-4" />
                  SUBCLINICAL RELAPSE DETECTED AT MONTH 6
                </div>
                <p className="text-[#A1A1AA] leading-relaxed">
                  ctDNA rebound detected at 45 PPM prior to radiologic visibility on CT/PET scan. Recommend early therapeutic escalation or targeted immunotherapy switch.
                </p>
              </div>
            ) : selectedTp.status === "MRD_NEGATIVE" ? (
              <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl p-4 flex flex-col gap-2 text-xs">
                <div className="flex items-center gap-2 text-[#10B981] font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  COMPLETE MOLECULAR RESPONSE
                </div>
                <p className="text-[#A1A1AA] leading-relaxed">
                  Zero detectable ctDNA variants below the 10 PPM detection limit. Patient remains in molecular remission.
                </p>
              </div>
            ) : (
              <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-4 text-xs text-[#A1A1AA]">
                Standard surveillance monitoring active.
              </div>
            )}
          </div>

          <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-3 font-mono text-[10px] text-[#71717A] flex justify-between">
            <span>Assay Protocol: Hybrid Capture + UMI 30000x Depth</span>
            <span>CLIA / CAP VALIDATED</span>
          </div>
        </div>

      </div>

    </div>
  );
}
