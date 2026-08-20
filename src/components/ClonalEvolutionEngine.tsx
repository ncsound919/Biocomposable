import { useState } from "react";
import { 
  GitBranch, 
  Dna, 
  Activity, 
  Sliders, 
  ShieldAlert, 
  Zap,
  TrendingUp,
  Layers
} from "lucide-react";

interface SubcloneNode {
  id: string;
  name: string;
  type: "TRUNK_FOUNDER" | "SUBCLONE_BRANCH" | "RESISTANT_EMERGENCE";
  clusterCancerCellFraction: number; // CCF %
  driverMutations: string[];
  copyNumberStatus: string;
  drugSensitivity: string;
}

const subcloneData: SubcloneNode[] = [
  {
    id: "CLONE-0",
    name: "Trunk (Founder Clone)",
    type: "TRUNK_FOUNDER",
    clusterCancerCellFraction: 100, // 100% of tumor cells
    driverMutations: ["TP53 (R175H)", "EGFR (L858R)"],
    copyNumberStatus: "Diploid 2N",
    drugSensitivity: "Sensitive to 1st Gen TKIs (Erlotinib)",
  },
  {
    id: "CLONE-1",
    name: "Subclone A (Metastatic Seeding)",
    type: "SUBCLONE_BRANCH",
    clusterCancerCellFraction: 45,
    driverMutations: ["PIK3CA (E545K)", "MYC Amplification"],
    copyNumberStatus: "Amplified 4N",
    drugSensitivity: "Moderate TKI Sensitivity",
  },
  {
    id: "CLONE-2",
    name: "Subclone B (Therapy-Resistant)",
    type: "RESISTANT_EMERGENCE",
    clusterCancerCellFraction: 28,
    driverMutations: ["EGFR (T790M)", "MET Amplification"],
    copyNumberStatus: "Aneuploid 3N",
    drugSensitivity: "Resistant to 1st/2nd Gen TKIs; Requires Osimertinib",
  },
  {
    id: "CLONE-3",
    name: "Subclone C (Triple Resistant)",
    type: "RESISTANT_EMERGENCE",
    clusterCancerCellFraction: 12,
    driverMutations: ["EGFR (C797S)", "C-MET Overexpression"],
    copyNumberStatus: "High-level Amplification 6N",
    drugSensitivity: "Osimertinib-Resistant; Requires Antibody-Drug Conjugates",
  },
];

export function ClonalEvolutionEngine() {
  const [selectedSubclone, setSelectedSubclone] = useState<SubcloneNode>(subcloneData[2]);
  const [treatmentSelectionMonths, setTreatmentSelectionMonths] = useState<number>(12);

  // Dynamic CCF shifts under drug selection pressure
  const selectedCcf = Math.min(
    95,
    Math.round(selectedSubclone.clusterCancerCellFraction + (selectedSubclone.type === "RESISTANT_EMERGENCE" ? treatmentSelectionMonths * 3.5 : -treatmentSelectionMonths * 2.8))
  );

  return (
    <div className="flex flex-col gap-6 w-full text-[#FAFAFA]">
      
      {/* Top Header Controls */}
      <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5 flex flex-col gap-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272A] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
              <span className="text-[10px] font-mono font-bold text-[#F59E0B] uppercase tracking-wider">
                Cancer Evolutionary Dynamics
              </span>
            </div>
            <h2 className="text-base font-bold text-[#FAFAFA]">
              Subclonal Architecture Decomposition & Drug Resistance Phylodynamics
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30">
              PyClone-VI / SciClone
            </span>
            <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/30">
              Phylogenetic Reconstruction
            </span>
          </div>
        </div>

        {/* Treatment Selection Slider */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-[#A1A1AA] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#F59E0B]" />
                Targeted Therapy Duration
              </span>
              <span className="text-[#F59E0B] font-bold">{treatmentSelectionMonths} Months</span>
            </div>
            <input
              type="range"
              min="0"
              max="24"
              step="1"
              value={treatmentSelectionMonths}
              onChange={(e) => setTreatmentSelectionMonths(Number(e.target.value))}
              className="w-full accent-[#F59E0B] bg-[#27272A] h-1.5 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] text-[#71717A]">
              Simulates selective pressure driven clone expansion/extinction.
            </span>
          </div>

          <div className="flex flex-col gap-2 justify-center bg-[#09090B] border border-[#27272A] p-3 rounded-xl font-mono text-[10px]">
            <div className="flex justify-between">
              <span className="text-[#71717A]">Founding Mutation:</span>
              <span className="text-[#FAFAFA] font-bold">EGFR L858R + TP53</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#71717A]">Resistance Mechanism:</span>
              <span className="text-[#EF4444] font-bold">EGFR T790M / C797S</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 justify-center bg-[#09090B] border border-[#27272A] p-3 rounded-xl font-mono text-[10px]">
            <div className="flex justify-between">
              <span className="text-[#71717A]">Selected Subclone CCF:</span>
              <span className="text-[#F59E0B] font-bold">{Math.max(1, selectedCcf)}% Cell Fraction</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#71717A]">Dominant Clone Status:</span>
              <span className={`font-bold ${selectedCcf > 50 ? "text-[#EF4444]" : "text-[#10B981]"}`}>
                {selectedCcf > 50 ? "DOMINANT EXPANSION" : "SUBCLONAL MINORITY"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Phylogenetic Tree & Subclones */}
        <div className="lg:col-span-7 bg-[#18181B] border border-[#27272A] rounded-2xl p-5 flex flex-col gap-4">
          <h3 className="text-xs font-mono font-bold text-[#A1A1AA] uppercase flex items-center justify-between">
            <span className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-[#F59E0B]" />
              Phylogenetic Clonal Tree
            </span>
            <span className="text-[10px] text-[#71717A]">4 Clonal Clusters</span>
          </h3>

          <div className="flex flex-col gap-3">
            {subcloneData.map((node) => {
              const isSelected = selectedSubclone.id === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedSubclone(node)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col gap-2 ${
                    isSelected
                      ? "bg-[#27272A] border-[#F59E0B] shadow-lg"
                      : "bg-[#09090B] border-[#27272A] hover:bg-[#27272A]/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        node.type === "TRUNK_FOUNDER"
                          ? "bg-[#22D3EE]"
                          : node.type === "RESISTANT_EMERGENCE"
                          ? "bg-[#EF4444]"
                          : "bg-[#F59E0B]"
                      }`} />
                      <span className="text-xs font-bold text-[#FAFAFA] font-mono">{node.name}</span>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                      node.type === "TRUNK_FOUNDER"
                        ? "bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/30"
                        : node.type === "RESISTANT_EMERGENCE"
                        ? "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30"
                        : "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30"
                    }`}>
                      {node.type}
                    </span>
                  </div>

                  <div className="flex items-center justify-between font-mono text-[11px] text-[#A1A1AA]">
                    <span>Drivers: {node.driverMutations.join(", ")}</span>
                    <span className="font-bold text-[#FAFAFA]">{node.clusterCancerCellFraction}% CCF</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Subclone Deep Inspection */}
        <div className="lg:col-span-5 bg-[#18181B] border border-[#27272A] rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
            <div>
              <span className="text-[10px] font-mono text-[#F59E0B] uppercase font-bold">
                Clonal Spec: {selectedSubclone.id}
              </span>
              <h3 className="text-sm font-bold text-[#FAFAFA]">
                {selectedSubclone.name}
              </h3>
            </div>
            <Dna className="w-5 h-5 text-[#F59E0B]" />
          </div>

          <div className="flex flex-col gap-3 font-mono text-[11px]">
            <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-3 flex flex-col gap-1">
              <span className="text-[10px] text-[#71717A] uppercase">Copy Number Alteration Status</span>
              <span className="text-sm font-bold text-[#22D3EE]">{selectedSubclone.copyNumberStatus}</span>
            </div>

            <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-3 flex flex-col gap-1">
              <span className="text-[10px] text-[#71717A] uppercase">Drug Sensitivity Profile</span>
              <span className="text-xs text-[#A1A1AA] leading-relaxed">{selectedSubclone.drugSensitivity}</span>
            </div>

            <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-3 flex flex-col gap-2">
              <span className="text-[10px] text-[#71717A] uppercase">Driver Mutations</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedSubclone.driverMutations.map((mut, idx) => (
                  <span key={idx} className="px-2 py-1 bg-[#27272A] text-[#FAFAFA] border border-[#3F3F46] rounded-lg text-[10px] font-bold">
                    {mut}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
