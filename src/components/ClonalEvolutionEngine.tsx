import { useState } from "react";
import { 
  GitBranch, 
  Dna, 
  Activity, 
  Sliders, 
  ShieldAlert, 
  Zap,
  TrendingUp,
  Layers,
  Plus,
  Play,
  Download,
  Trash2,
  RefreshCcw
} from "lucide-react";

interface SubcloneNode {
  id: string;
  name: string;
  type: "TRUNK_FOUNDER" | "SUBCLONE_BRANCH" | "RESISTANT_EMERGENCE";
  clusterCancerCellFraction: number; // Baseline CCF %
  driverMutations: string[];
  copyNumberStatus: string;
  drugSensitivity: string;
}

const initialSubclones: SubcloneNode[] = [
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
    clusterCancerCellFraction: 8,
    driverMutations: ["EGFR (C797S)", "C-MET Overexpression"],
    copyNumberStatus: "High-level Amplification 6N",
    drugSensitivity: "Osimertinib-Resistant; Requires Antibody-Drug Conjugates",
  },
];

type DrugSelection = 
  | "UNTREATED" 
  | "ERLOTINIB_1ST_GEN" 
  | "OSIMERTINIB_3RD_GEN" 
  | "COMBINATION_OSI_MET" 
  | "ADC_HER3_RESCUE";

export function ClonalEvolutionEngine() {
  const [clones, setClones] = useState<SubcloneNode[]>(initialSubclones);
  const [selectedSubclone, setSelectedSubclone] = useState<SubcloneNode>(initialSubclones[2]);
  const [activeDrug, setActiveDrug] = useState<DrugSelection>("ERLOTINIB_1ST_GEN");
  const [selectionDuration, setSelectionDuration] = useState<number>(12); // months

  // List of therapeutic phases administered
  const [regimenSequence, setRegimenSequence] = useState<{ id: string; name: string; drug: DrugSelection; duration: number }[]>([
    { id: "PHASE-1", name: "First-Line Targeted Therapy", drug: "ERLOTINIB_1ST_GEN", duration: 8 },
    { id: "PHASE-2", name: "Resistance Escape Management", drug: "OSIMERTINIB_3RD_GEN", duration: 12 }
  ]);

  const handleAddPhase = (drug: DrugSelection, duration: number) => {
    let name = "Custom Therapy Stage";
    if (drug === "ERLOTINIB_1ST_GEN") name = "1st Gen EGFR Blockade";
    else if (drug === "OSIMERTINIB_3RD_GEN") name = "3rd Gen EGFR Suppression";
    else if (drug === "COMBINATION_OSI_MET") name = "MET-Bypass Combination";
    else if (drug === "ADC_HER3_RESCUE") name = "Antibody-Drug Conjugate Rescue";

    const newPhase = {
      id: `PHASE-${Date.now().toString().slice(-4)}`,
      name,
      drug,
      duration
    };

    setRegimenSequence((prev) => [...prev, newPhase]);
    setActiveDrug(drug);
    setSelectionDuration(duration);
  };

  const handleDeletePhase = (id: string) => {
    setRegimenSequence((prev) => prev.filter(p => p.id !== id));
  };

  const handleSpawnEscapeClone = () => {
    const spawned: SubcloneNode = {
      id: `CLONE-MUT-${Date.now().toString().slice(-4)}`,
      name: "Subclone D (Bypass Escape Clone)",
      type: "RESISTANT_EMERGENCE",
      clusterCancerCellFraction: 2,
      driverMutations: ["KRAS (G12C Bypass)", "HER2 Amplification"],
      copyNumberStatus: "Hyperdiploid 5N",
      drugSensitivity: "Resistant to all TKIs; Requires target-specific multi-blockade."
    };

    setClones((prev) => [...prev, spawned]);
    setSelectedSubclone(spawned);
  };

  const handleResetClones = () => {
    setClones(initialSubclones);
    setSelectedSubclone(initialSubclones[2]);
    setRegimenSequence([
      { id: "PHASE-1", name: "First-Line Targeted Therapy", drug: "ERLOTINIB_1ST_GEN", duration: 8 },
      { id: "PHASE-2", name: "Resistance Escape Management", drug: "OSIMERTINIB_3RD_GEN", duration: 12 }
    ]);
    setActiveDrug("ERLOTINIB_1ST_GEN");
    setSelectionDuration(12);
  };

  // Compute CCF shifts under sequential selective pressure
  const calculateShiftedCcf = (clone: SubcloneNode): number => {
    let CCF = clone.clusterCancerCellFraction;

    // Apply scaling shifts based on selected duration and drug selection pressure
    if (activeDrug === "ERLOTINIB_1ST_GEN") {
      if (clone.id === "CLONE-0") CCF = Math.max(30, CCF - selectionDuration * 5); // founder dies down
      else if (clone.id === "CLONE-1") CCF = Math.max(15, CCF - selectionDuration * 2); 
      else if (clone.id === "CLONE-2") CCF = Math.min(98, CCF + selectionDuration * 5); // T790M resistant clone thrives!
      else if (clone.id === "CLONE-3") CCF = Math.min(30, CCF + selectionDuration * 0.5);
      else if (clone.id.startsWith("CLONE-MUT")) CCF = Math.min(25, CCF + selectionDuration * 1);
    } 
    else if (activeDrug === "OSIMERTINIB_3RD_GEN") {
      if (clone.id === "CLONE-0") CCF = Math.max(10, CCF - selectionDuration * 4);
      else if (clone.id === "CLONE-1") CCF = Math.max(5, CCF - selectionDuration * 3);
      else if (clone.id === "CLONE-2") CCF = Math.max(2, CCF - selectionDuration * 6); // T790M sensitive to Osimertinib!
      else if (clone.id === "CLONE-3") CCF = Math.min(99, CCF + selectionDuration * 6.5); // C797S escapes Osimertinib!
      else if (clone.id.startsWith("CLONE-MUT")) CCF = Math.min(40, CCF + selectionDuration * 1.5);
    } 
    else if (activeDrug === "COMBINATION_OSI_MET") {
      // Shuts down C797S/MET bypass partially
      if (clone.id === "CLONE-3") CCF = Math.max(5, CCF - selectionDuration * 5);
      else if (clone.id === "CLONE-2") CCF = Math.max(1, CCF - selectionDuration * 5);
      else if (clone.id.startsWith("CLONE-MUT")) CCF = Math.min(75, CCF + selectionDuration * 4.5); // Escape clones thrive here!
    } 
    else if (activeDrug === "ADC_HER3_RESCUE") {
      // Kills all active subclones heavily by targeting surface HER3 / DNA payload
      CCF = Math.max(1, CCF - selectionDuration * 7);
    } 
    else if (activeDrug === "UNTREATED") {
      // Natural progression without selective bottleneck pressure
      if (clone.id === "CLONE-0") CCF = 100;
      else CCF = Math.min(90, CCF + selectionDuration * 1);
    }

    return Math.max(1, Math.min(100, Math.round(CCF)));
  };

  const handleDownloadClonalPhylogenyReport = () => {
    const reportStr = `========================================================
CANCER PHYLODYNAMICS & CLONAL FITNESS REPORT
========================================================
COHORT PATIENT REF: P-40291
CLONAL DECOMPOSITION METHOD: PyClone-VI / SciClone Deep Dirichlet Process

ACTIVE THERAPEUTIC PRESSURE SELECTION: ${activeDrug}
DURATION SPAN: ${selectionDuration} Months

EVOLVED CANCER CELL FRACTIONS (CCF):
${clones.map(clone => {
  const currentCCF = calculateShiftedCcf(clone);
  return `
- ${clone.name}:
  Base CCF: ${clone.clusterCancerCellFraction}%
  Evolved CCF: ${currentCCF}%
  Genomic Drivers: ${clone.driverMutations.join(", ")}
  Ploidy Spec: ${clone.copyNumberStatus}
  Resistance Status: ${currentCCF > clone.clusterCancerCellFraction ? "EXPANDING_UNDER_SELECTION_PRESSURE" : "SUPPRESSED"}
`;
}).join("\n")}
========================================================
RECOMMENDATIONS:
Incorporate concurrent MET-amplification diagnostics. Sequential switch 
to targeted HER3 Antibody-Drug Conjugates is advised upon C797S emergent 
expansion.
========================================================`;

    const blob = new Blob([reportStr], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `clonal_fitness_evolution_report_40291.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeSelectedCcf = calculateShiftedCcf(selectedSubclone);

  return (
    <div className="flex flex-col gap-6 w-full text-[#FAFAFA]" id="clonal-evolution-system">
      
      {/* Top Header Controls */}
      <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5 flex flex-col gap-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272A] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
              <span className="text-[10px] font-mono font-bold text-[#F59E0B] uppercase tracking-wider">
                Cancer Evolutionary Dynamics (Full-System Edition)
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

        {/* Treatment Selection Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-[#A1A1AA] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#F59E0B]" />
                Selective Therapy Duration
              </span>
              <span className="text-[#F59E0B] font-bold">{selectionDuration} Months</span>
            </div>
            <input
              type="range"
              min="1"
              max="24"
              step="1"
              value={selectionDuration}
              onChange={(e) => setSelectionDuration(Number(e.target.value))}
              className="w-full accent-[#F59E0B] bg-[#27272A] h-1.5 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] text-[#71717A]">
              Simulates competitive expansion/suppression based on selection timeframe.
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-mono text-[#A1A1AA] flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#22D3EE]" />
              Administer Selective Pressure Drug
            </span>
            <select
              value={activeDrug}
              onChange={(e) => setActiveDrug(e.target.value as DrugSelection)}
              className="bg-[#09090B] border border-[#27272A] text-xs text-[#FAFAFA] font-mono rounded-xl p-2.5 focus:outline-none focus:border-[#F59E0B]"
            >
              <option value="UNTREATED">UNTREATED (Natural Clonal Expansion)</option>
              <option value="ERLOTINIB_1ST_GEN">1st Gen EGFR Blockade (Erlotinib)</option>
              <option value="OSIMERTINIB_3RD_GEN">3rd Gen EGFR Suppression (Osimertinib)</option>
              <option value="COMBINATION_OSI_MET">Osimertinib + MET Bypass Inhibitor</option>
              <option value="ADC_HER3_RESCUE">Antibody-Drug Conjugate Rescue (HER3-ADC)</option>
            </select>
          </div>

          <div className="flex flex-col gap-2 justify-center bg-[#09090B] border border-[#27272A] p-3 rounded-xl font-mono text-[10px]">
            <div className="flex justify-between">
              <span className="text-[#71717A]">Escape Variant emergent rate:</span>
              <span className="text-[#EF4444] font-bold">HIGH (C797S Selection)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#71717A]">De Novo Clones Count:</span>
              <span className="text-[#22D3EE] font-bold">{clones.length} lineages active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Regimen Sequencer & Mutation Spawner */}
      <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
          <h3 className="text-xs font-mono font-bold text-[#A1A1AA] uppercase flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#F59E0B]" />
            Sequential Regimen Timeline & Mutation Escape Simulator
          </h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleSpawnEscapeClone}
              className="text-[10px] font-mono bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 px-3 py-1.5 rounded-xl hover:bg-[#EF4444]/25 transition-colors font-bold"
            >
              + Sprout de novo escape clone D
            </button>
            <button 
              onClick={handleResetClones}
              className="text-[10px] font-mono bg-[#27272A] text-[#A1A1AA] border border-[#3F3F46] px-3 py-1.5 rounded-xl hover:bg-[#3F3F46] transition-colors"
            >
              <RefreshCcw className="w-3 h-3 inline mr-1" /> Reset Engine
            </button>
          </div>
        </div>

        {/* Sequential Regimen List */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-mono text-[#71717A] uppercase">Active Regimen Phases Sequence</span>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {regimenSequence.map((phase, idx) => (
              <div 
                key={phase.id}
                onClick={() => {
                  setActiveDrug(phase.drug);
                  setSelectionDuration(phase.duration);
                }}
                className={`p-3 rounded-xl border text-left flex items-start justify-between transition-all cursor-pointer relative ${
                  activeDrug === phase.drug 
                    ? "bg-[#27272A] border-[#F59E0B]" 
                    : "bg-[#09090B] border-[#27272A] hover:bg-[#18181B]"
                }`}
              >
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-mono text-[#F59E0B]">Phase #{idx + 1}</span>
                  <span className="text-xs font-bold text-[#FAFAFA] block truncate">{phase.name}</span>
                  <span className="text-[10px] font-mono text-[#A1A1AA]">{phase.duration} Months duration</span>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePhase(phase.id);
                  }}
                  className="text-[#EF4444] hover:bg-[#EF4444]/10 rounded p-1 transition-colors text-xs"
                >
                  ×
                </button>
              </div>
            ))}

            {/* Quick Add Regimen Block */}
            <div className="border border-dashed border-[#27272A] rounded-xl p-2.5 flex items-center justify-center gap-2 text-xs text-[#71717A]">
              <button 
                onClick={() => handleAddPhase("COMBINATION_OSI_MET", 6)}
                className="hover:text-[#FAFAFA] text-[10px] font-mono bg-[#27272A] px-2 py-1 rounded"
              >
                + Add MET combination phase
              </button>
              <button 
                onClick={() => handleAddPhase("ADC_HER3_RESCUE", 4)}
                className="hover:text-[#FAFAFA] text-[10px] font-mono bg-[#27272A] px-2 py-1 rounded"
              >
                + Add HER3-ADC phase
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Clone Decomposition Table & Phylogenetic View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Clone Kinetic proportions table */}
        <div className="lg:col-span-7 bg-[#18181B] border border-[#27272A] rounded-2xl p-5 flex flex-col gap-4">
          <h3 className="text-xs font-mono font-bold text-[#A1A1AA] uppercase flex items-center justify-between">
            <span>Clonal Subpopulations proportions</span>
            <span className="text-[10px] text-[#71717A]">Phylogenetic Nodes</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-[11px]">
              <thead>
                <tr className="border-b border-[#27272A] text-[#71717A]">
                  <th className="pb-2 font-normal uppercase">Subclone Name</th>
                  <th className="pb-2 font-normal uppercase">Type</th>
                  <th className="pb-2 font-normal uppercase text-center">Baseline CCF</th>
                  <th className="pb-2 font-normal uppercase text-center">Evolved CCF</th>
                  <th className="pb-2 font-normal uppercase">Resistance Target status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A]/50 text-[#A1A1AA]">
                {clones.map((clone) => {
                  const isSelected = selectedSubclone.id === clone.id;
                  const currentCCF = calculateShiftedCcf(clone);
                  const isExpanding = currentCCF > clone.clusterCancerCellFraction;
                  
                  return (
                    <tr
                      key={clone.id}
                      onClick={() => setSelectedSubclone(clone)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? "bg-[#F59E0B]/10 text-[#FAFAFA]" : "hover:bg-[#27272A]"
                      }`}
                    >
                      <td className="py-3 font-bold text-[#FAFAFA]">
                        {clone.name}
                        <span className="text-[10px] text-[#71717A] block font-normal">{clone.driverMutations.join(" / ")}</span>
                      </td>
                      <td className="py-3 text-[10px]">{clone.type}</td>
                      <td className="py-3 text-center font-bold text-[#A1A1AA]">{clone.clusterCancerCellFraction}%</td>
                      <td className={`py-3 text-center font-bold text-sm ${
                        isExpanding ? "text-[#EF4444]" : "text-[#10B981]"
                      }`}>
                        {currentCCF}%
                      </td>
                      <td className="py-3">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                          isExpanding 
                            ? "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30" 
                            : "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30"
                        }`}>
                          {isExpanding ? "SELECTIVE EXPANSION" : "REGRESSED / SHUTDOWN"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Node Detailed profile */}
        <div className="lg:col-span-5 bg-[#18181B] border border-[#27272A] rounded-2xl p-5 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between border-b border-[#27272A] pb-3 mb-2">
              <div>
                <span className="text-[10px] font-mono text-[#F59E0B] uppercase font-bold">
                  Phylogenetic Node: {selectedSubclone.id}
                </span>
                <h3 className="text-sm font-bold text-[#FAFAFA]">
                  {selectedSubclone.name}
                </h3>
              </div>
              <GitBranch className="w-5 h-5 text-[#F59E0B]" />
            </div>

            <div className="flex flex-col gap-3 font-mono text-[11px]">
              <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-3 flex flex-col gap-1">
                <span className="text-[10px] text-[#71717A] uppercase">Clonal Driver Mutations</span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {selectedSubclone.driverMutations.map((mut, idx) => (
                    <span key={idx} className="bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30 text-[10px] px-2 py-0.5 rounded font-bold">
                      {mut}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-3">
                  <span className="text-[10px] text-[#71717A] uppercase block mb-1">Copy Number ploidy</span>
                  <span className="text-sm font-bold text-[#22D3EE]">{selectedSubclone.copyNumberStatus}</span>
                </div>
                <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-3">
                  <span className="text-[10px] text-[#71717A] uppercase block mb-1">Evolved Cell Fraction</span>
                  <span className="text-sm font-bold text-[#EF4444]">{activeSelectedCcf}% CCF</span>
                </div>
              </div>

              <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-3 flex flex-col gap-1">
                <span className="text-[10px] text-[#71717A] uppercase">Selective Drug Sensitivity / Actionable treatment</span>
                <p className="text-[10.5px] text-[#A1A1AA] leading-relaxed">{selectedSubclone.drugSensitivity}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between bg-[#09090B] p-2 rounded-xl border border-[#27272A]">
            <span className="text-[9px] font-mono text-[#71717A]">Evolution pressure diagnostic active.</span>
            <button 
              onClick={handleDownloadClonalPhylogenyReport}
              className="text-[9px] font-mono bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30 px-2 py-1 rounded hover:bg-[#F59E0B]/20 transition-all font-bold"
            >
              Export Fitness Profile
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
