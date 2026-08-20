import { useState } from "react";
import { 
  Dna, 
  Search, 
  Sliders, 
  ShieldAlert, 
  Terminal, 
  Activity, 
  CheckCircle2, 
  FileCode2,
  Sparkles,
  Download,
  Plus,
  Trash2,
  HelpCircle,
  Cpu
} from "lucide-react";

interface NeoantigenCandidate {
  id: string;
  gene: string;
  mutation: string;
  hlaAllele: string;
  wildtypePeptide: string;
  mutantPeptide: string;
  bindingAffinityKd: number; // nM
  percentRank: number;
  rnaExpressionTpm: number;
  immunogenicityScore: number;
  status: "HIGH_CONFIDENCE" | "MODERATE" | "LOW_EXPRESSION";
}

const initialNeoantigens: NeoantigenCandidate[] = [
  {
    id: "NEO-01",
    gene: "KRAS",
    mutation: "G12D (p.Gly12Asp)",
    hlaAllele: "HLA-A*11:01",
    wildtypePeptide: "VVGAVGVGK",
    mutantPeptide: "VVGADGVGK",
    bindingAffinityKd: 14.2,
    percentRank: 0.08,
    rnaExpressionTpm: 142.5,
    immunogenicityScore: 0.94,
    status: "HIGH_CONFIDENCE",
  },
  {
    id: "NEO-02",
    gene: "TP53",
    mutation: "R248Q (p.Arg248Gln)",
    hlaAllele: "HLA-A*02:01",
    wildtypePeptide: "LTIITLEVD",
    mutantPeptide: "LTIITLEVQ",
    bindingAffinityKd: 38.6,
    percentRank: 0.22,
    rnaExpressionTpm: 88.3,
    immunogenicityScore: 0.89,
    status: "HIGH_CONFIDENCE",
  },
  {
    id: "NEO-03",
    gene: "PIK3CA",
    mutation: "E545K (p.Glu545Lys)",
    hlaAllele: "HLA-B*07:02",
    wildtypePeptide: "STRDPLSEI",
    mutantPeptide: "STRDPLSKI",
    bindingAffinityKd: 112.0,
    percentRank: 0.65,
    rnaExpressionTpm: 45.1,
    immunogenicityScore: 0.72,
    status: "MODERATE",
  },
  {
    id: "NEO-04",
    gene: "EGFR",
    mutation: "L858R (p.Leu858Arg)",
    hlaAllele: "HLA-A*02:01",
    wildtypePeptide: "KITDFGLAK",
    mutantPeptide: "KITDFGRAK",
    bindingAffinityKd: 28.4,
    percentRank: 0.15,
    rnaExpressionTpm: 210.8,
    immunogenicityScore: 0.91,
    status: "HIGH_CONFIDENCE",
  },
  {
    id: "NEO-05",
    gene: "BRAF",
    mutation: "V600E (p.Val600Glu)",
    hlaAllele: "HLA-B*27:05",
    wildtypePeptide: "LATEKSRWS",
    mutantPeptide: "LATEKSEWS",
    bindingAffinityKd: 410.5,
    percentRank: 2.10,
    rnaExpressionTpm: 0.8,
    immunogenicityScore: 0.31,
    status: "LOW_EXPRESSION",
  },
];

export function CancerNeoantigenEngine() {
  const [candidates, setCandidates] = useState<NeoantigenCandidate[]>(initialNeoantigens);
  const [selectedAllele, setSelectedAllele] = useState<string>("ALL");
  const [kdCutoff, setKdCutoff] = useState<number>(200); // max Kd in nM
  const [minTpm, setMinTpm] = useState<number>(1.0);
  const [selectedCandidate, setSelectedCandidate] = useState<NeoantigenCandidate>(initialNeoantigens[0]);
  
  // Custom Somatic Generator state
  const [newGene, setNewGene] = useState("IDH1");
  const [newMutation, setNewMutation] = useState("R132H");
  const [newHla, setNewHla] = useState("HLA-A*02:01");
  const [newWtPeptide, setNewWtPeptide] = useState("GWVKPIIIG");
  const [newMutPeptide, setNewMutPeptide] = useState("GWVKPIIIH");
  const [newTpm, setNewTpm] = useState(65.0);

  // Selected candidates for mRNA Multivalent Vaccine Formulation
  const [vaccineCandidates, setVaccineCandidates] = useState<string[]>(["NEO-01", "NEO-02", "NEO-04"]);
  const [vaccineLinker, setVaccineLinker] = useState("AAY"); // linker peptide sequence

  const handlePredictBinding = () => {
    if (!newGene || !newMutation || !newWtPeptide || !newMutPeptide) return;

    // Simulated neural-network predictor for binding affinity (using string distance & sequence parameters)
    const lenMut = newMutPeptide.trim().length;
    const lenWt = newWtPeptide.trim().length;
    
    // Calculate a simulated Kd affinity based on basic sequence inputs
    let baseKd = 45.0;
    if (newHla === "HLA-A*02:01") baseKd -= 20.0;
    if (lenMut !== 9) baseKd += 150.0; // HLA class I prefers 9-mers
    
    // Add minor pseudo-random variations based on mutation characters to keep it deterministic but realistic
    const charSum = newMutation.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const simulatedKd = parseFloat(Math.max(5.4, Math.min(495.5, baseKd + (charSum % 120))).toFixed(1));
    const simulatedPercentRank = parseFloat(Math.max(0.01, Math.min(5.5, (simulatedKd / 500) * 2.5)).toFixed(2));
    const simulatedImmunogenicity = parseFloat(Math.max(0.15, Math.min(0.99, 1.0 - (simulatedKd / 600) - (newTpm < 10 ? 0.4 : 0))).toFixed(2));
    
    let simulatedStatus: NeoantigenCandidate["status"] = "HIGH_CONFIDENCE";
    if (newTpm < 5.0) {
      simulatedStatus = "LOW_EXPRESSION";
    } else if (simulatedKd > 150) {
      simulatedStatus = "MODERATE";
    }

    const newCandidate: NeoantigenCandidate = {
      id: `NEO-CUSTOM-${Date.now().toString().slice(-4)}`,
      gene: newGene.toUpperCase(),
      mutation: `${newMutation} (Simulated prediction)`,
      hlaAllele: newHla,
      wildtypePeptide: newWtPeptide.toUpperCase().trim(),
      mutantPeptide: newMutPeptide.toUpperCase().trim(),
      bindingAffinityKd: simulatedKd,
      percentRank: simulatedPercentRank,
      rnaExpressionTpm: newTpm,
      immunogenicityScore: simulatedImmunogenicity,
      status: simulatedStatus
    };

    setCandidates((prev) => [newCandidate, ...prev]);
    setSelectedCandidate(newCandidate);
  };

  const handleDeleteCandidate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCandidates((prev) => prev.filter((c) => c.id !== id));
    // Reset selected if deleted
    if (selectedCandidate.id === id) {
      const remaining = candidates.filter((c) => c.id !== id);
      if (remaining.length > 0) setSelectedCandidate(remaining[0]);
    }
  };

  const toggleVaccineInclusion = (id: string) => {
    setVaccineCandidates((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const filteredCandidates = candidates.filter((item) => {
    const matchesAllele = selectedAllele === "ALL" || item.hlaAllele === selectedAllele;
    const matchesKd = item.bindingAffinityKd <= kdCutoff;
    const matchesTpm = item.rnaExpressionTpm >= minTpm;
    return matchesAllele && matchesKd && matchesTpm;
  });

  const highConfidenceCount = filteredCandidates.filter(c => c.status === "HIGH_CONFIDENCE").length;

  // Compile full personalized vaccine construct sequence
  const activeVaccinePeptides = candidates.filter(c => vaccineCandidates.includes(c.id));
  const fullEpitopeSequence = activeVaccinePeptides.map(c => c.mutantPeptide).join(`-${vaccineLinker}-`);

  const handleExportFormulation = () => {
    const formulationData = {
      patientCohortId: "P-COHORT-40291",
      linker: vaccineLinker,
      constructSpecs: {
        cap5: "7-methylguanosine (m7GpppG)",
        kozakConsensus: "GCCACCATGG",
        signalPeptide: "MRLVALLFCLAALAAASA",
        epitopesChain: fullEpitopeSequence,
        traffickingDomain: "MHC-I Cytoplasmic Tail (MITD)",
        polyATail: "A120_Tail_Sequence"
      },
      selectedEpitopes: activeVaccinePeptides
    };

    const blob = new Blob([JSON.stringify(formulationData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `vaccine_formulation_cohort_40291.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 w-full text-[#FAFAFA]" id="neoantigen-profiler-system">
      
      {/* Top Controls & Metrics */}
      <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5 flex flex-col gap-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272A] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#22D3EE]" />
              <span className="text-[10px] font-mono font-bold text-[#22D3EE] uppercase tracking-wider">
                Precision Oncology Module (Full-System Edition)
              </span>
            </div>
            <h2 className="text-base font-bold text-[#FAFAFA]">
              Somatic Neoantigen & HLA Binding Affinity Profiler
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/30">
              NetMHCpan-4.1 / NetMHCIIpan
            </span>
            <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30">
              TCGA Multi-Omics
            </span>
          </div>
        </div>

        {/* Filter Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-[#A1A1AA] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#22D3EE]" />
                Max Binding Affinity (Kd)
              </span>
              <span className="text-[#22D3EE] font-bold">{kdCutoff} nM</span>
            </div>
            <input
              type="range"
              min="10"
              max="500"
              step="10"
              value={kdCutoff}
              onChange={(e) => setKdCutoff(Number(e.target.value))}
              className="w-full accent-[#22D3EE] bg-[#27272A] h-1.5 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] text-[#71717A]">
              Strong binders: &lt;50 nM | Weak binders: 50-500 nM
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-[#A1A1AA] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#10B981]" />
                Min RNA Expression (TPM)
              </span>
              <span className="text-[#10B981] font-bold">{minTpm.toFixed(1)} TPM</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="20.0"
              step="0.5"
              value={minTpm}
              onChange={(e) => setMinTpm(Number(e.target.value))}
              className="w-full accent-[#10B981] bg-[#27272A] h-1.5 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] text-[#71717A]">
              Filters out non-expressed somatic variants.
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-mono text-[#A1A1AA] flex items-center gap-1.5">
              <Dna className="w-3.5 h-3.5 text-[#8B5CF6]" />
              HLA Allele Filter
            </span>
            <select
              value={selectedAllele}
              onChange={(e) => setSelectedAllele(e.target.value)}
              className="bg-[#09090B] border border-[#27272A] text-xs text-[#FAFAFA] font-mono rounded-xl p-2 focus:outline-none focus:border-[#8B5CF6]"
            >
              <option value="ALL">ALL HLA ALLELES</option>
              <option value="HLA-A*02:01">HLA-A*02:01</option>
              <option value="HLA-A*11:01">HLA-A*11:01</option>
              <option value="HLA-B*07:02">HLA-B*07:02</option>
              <option value="HLA-B*27:05">HLA-B*27:05</option>
            </select>
          </div>
        </div>

        {/* Dynamic Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-3 flex flex-col gap-1">
            <span className="text-[10px] font-mono text-[#71717A] uppercase">Total Candidates</span>
            <span className="text-base font-bold font-mono text-[#FAFAFA]">{candidates.length} peptides</span>
          </div>

          <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-3 flex flex-col gap-1">
            <span className="text-[10px] font-mono text-[#71717A] uppercase">Filtered Match</span>
            <span className="text-base font-bold font-mono text-[#22D3EE]">{filteredCandidates.length} targets</span>
          </div>

          <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-3 flex flex-col gap-1">
            <span className="text-[10px] font-mono text-[#71717A] uppercase">Qualified vaccine vaccine targets</span>
            <span className="text-base font-bold font-mono text-[#10B981]">{vaccineCandidates.length} Selected</span>
          </div>

          <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-3 flex flex-col gap-1">
            <span className="text-[10px] font-mono text-[#71717A] uppercase">Top Immunogenicity Score</span>
            <span className="text-base font-bold font-mono text-[#8B5CF6]">0.94 (KRAS G12D)</span>
          </div>
        </div>
      </div>

      {/* Somatic Candidate Entry Form */}
      <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5 flex flex-col gap-4">
        <h3 className="text-xs font-mono font-bold text-[#A1A1AA] uppercase flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#22D3EE]" />
          Predict Custom Somatic Mutation Binding Kinetics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-[#A1A1AA]">GENE</label>
            <input 
              type="text" 
              value={newGene} 
              onChange={(e) => setNewGene(e.target.value)} 
              className="bg-[#09090B] border border-[#27272A] text-xs font-mono p-2 rounded-lg text-[#FAFAFA] focus:outline-none focus:border-[#22D3EE]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-[#A1A1AA]">MUTATION</label>
            <input 
              type="text" 
              value={newMutation} 
              onChange={(e) => setNewMutation(e.target.value)} 
              className="bg-[#09090B] border border-[#27272A] text-xs font-mono p-2 rounded-lg text-[#FAFAFA] focus:outline-none focus:border-[#22D3EE]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-[#A1A1AA]">HLA ALLELE</label>
            <select 
              value={newHla} 
              onChange={(e) => setNewHla(e.target.value)} 
              className="bg-[#09090B] border border-[#27272A] text-xs font-mono p-2 rounded-lg text-[#FAFAFA] focus:outline-none focus:border-[#22D3EE]"
            >
              <option value="HLA-A*02:01">HLA-A*02:01</option>
              <option value="HLA-A*11:01">HLA-A*11:01</option>
              <option value="HLA-B*07:02">HLA-B*07:02</option>
              <option value="HLA-B*27:05">HLA-B*27:05</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-[#A1A1AA]">WILDTYPE 9-MER</label>
            <input 
              type="text" 
              value={newWtPeptide} 
              onChange={(e) => setNewWtPeptide(e.target.value)} 
              className="bg-[#09090B] border border-[#27272A] text-xs font-mono p-2 rounded-lg text-[#FAFAFA] focus:outline-none focus:border-[#22D3EE]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-[#A1A1AA]">MUTANT 9-MER</label>
            <input 
              type="text" 
              value={newMutPeptide} 
              onChange={(e) => setNewMutPeptide(e.target.value)} 
              className="bg-[#09090B] border border-[#27272A] text-xs font-mono p-2 rounded-lg text-[#FAFAFA] focus:outline-none focus:border-[#22D3EE]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-[#A1A1AA]">TPM EXPRESSION</label>
            <input 
              type="number" 
              value={newTpm} 
              onChange={(e) => setNewTpm(parseFloat(e.target.value) || 0)} 
              className="bg-[#09090B] border border-[#27272A] text-xs font-mono p-2 rounded-lg text-[#FAFAFA] focus:outline-none focus:border-[#22D3EE]"
            />
          </div>
        </div>

        <button 
          onClick={handlePredictBinding}
          className="bg-[#22D3EE] text-[#09090B] font-bold font-mono text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 hover:bg-[#06B6D4] transition-all self-end"
        >
          <Plus className="w-4 h-4" /> Run Simulated Neural Binding Prediction
        </button>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Table of Candidates */}
        <div className="lg:col-span-7 bg-[#18181B] border border-[#27272A] rounded-2xl p-5 flex flex-col gap-4">
          <h3 className="text-xs font-mono font-bold text-[#A1A1AA] uppercase flex items-center justify-between">
            <span>Somatic Neoantigen Candidate Portfolio</span>
            <span className="text-[10px] text-[#71717A]">{filteredCandidates.length} Selected</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-[11px]">
              <thead>
                <tr className="border-b border-[#27272A] text-[#71717A]">
                  <th className="pb-2 font-normal uppercase">Vac Match</th>
                  <th className="pb-2 font-normal uppercase">Gene & Mutation</th>
                  <th className="pb-2 font-normal uppercase">HLA Allele</th>
                  <th className="pb-2 font-normal uppercase">Kd (nM)</th>
                  <th className="pb-2 font-normal uppercase">TPM</th>
                  <th className="pb-2 font-normal uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A]/50 text-[#A1A1AA]">
                {filteredCandidates.map((c) => {
                  const isSelected = selectedCandidate.id === c.id;
                  const inVaccine = vaccineCandidates.includes(c.id);
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedCandidate(c)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? "bg-[#22D3EE]/10 text-[#FAFAFA]" : "hover:bg-[#27272A]"
                      }`}
                    >
                      <td className="py-3" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          checked={inVaccine} 
                          onChange={() => toggleVaccineInclusion(c.id)}
                          className="accent-[#10B981] w-3.5 h-3.5 cursor-pointer rounded"
                        />
                      </td>
                      <td className="py-3 font-bold text-[#FAFAFA]">
                        {c.gene} <span className="text-[#22D3EE] font-normal text-[10px] block">{c.mutation}</span>
                      </td>
                      <td className="py-3 text-[#A1A1AA]">{c.hlaAllele}</td>
                      <td className={`py-3 font-bold ${c.bindingAffinityKd < 50 ? "text-[#10B981]" : "text-[#F59E0B]"}`}>
                        {c.bindingAffinityKd} nM
                      </td>
                      <td className="py-3 text-[#A1A1AA]">{c.rnaExpressionTpm}</td>
                      <td className="py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={(e) => handleDeleteCandidate(c.id, e)}
                          className="text-[#EF4444] hover:bg-[#EF4444]/10 p-1.5 rounded transition-colors"
                          title="Remove Candidate"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Candidate Detailed Inspection */}
        <div className="lg:col-span-5 bg-[#18181B] border border-[#27272A] rounded-2xl p-5 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between border-b border-[#27272A] pb-3 mb-3">
              <div>
                <span className="text-[10px] font-mono text-[#22D3EE] uppercase font-bold">
                  Target Spec: {selectedCandidate.id}
                </span>
                <h3 className="text-sm font-bold text-[#FAFAFA]">
                  {selectedCandidate.gene} {selectedCandidate.mutation}
                </h3>
              </div>
              <Sparkles className="w-5 h-5 text-[#22D3EE]" />
            </div>

            <div className="flex flex-col gap-3 font-mono text-[11px]">
              <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-3 flex flex-col gap-2">
                <span className="text-[10px] text-[#71717A] uppercase">Peptide Substitution Context</span>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#71717A]">Wildtype: </span>
                    <span className="text-[#EF4444] font-bold block">{selectedCandidate.wildtypePeptide}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#71717A]">Mutant: </span>
                    <span className="text-[#10B981] font-bold block">{selectedCandidate.mutantPeptide}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-3">
                  <span className="text-[10px] text-[#71717A] uppercase block mb-1">MHC % Rank</span>
                  <span className="text-sm font-bold text-[#22D3EE]">{selectedCandidate.percentRank}%</span>
                </div>
                <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-3">
                  <span className="text-[10px] text-[#71717A] uppercase block mb-1">Immunogenicity Score</span>
                  <span className="text-sm font-bold text-[#10B981]">{selectedCandidate.immunogenicityScore} / 1.00</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-[#71717A] uppercase block mb-1">Executable Python API Payload</span>
                <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-3 text-[10px] text-[#A1A1AA] overflow-x-auto max-h-[140px]">
                  <pre>
                    <code>{`from bio_neoantigen import VaccineCandidate

candidate = VaccineCandidate(
    gene="${selectedCandidate.gene}",
    mutation="${selectedCandidate.mutation}",
    hla_allele="${selectedCandidate.hlaAllele}",
    mutant_peptide="${selectedCandidate.mutantPeptide}",
    kd_affinity_nm=${selectedCandidate.bindingAffinityKd}
)
vaccine_formulation = candidate.generate_mrna_construct()`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#09090B] p-2.5 rounded-xl border border-[#27272A] text-[10px] font-mono text-[#71717A]">
            Selected candidate qualifies for active multivalent formulation compilation.
          </div>
        </div>

      </div>

      {/* Multivalent Personalized Vaccine Construct Builder Section */}
      <div className="bg-[#18181B] border border-[#10B981]/30 rounded-2xl p-6 flex flex-col gap-5 mt-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272A] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#10B981]/10 text-[#10B981] flex items-center justify-center font-bold border border-[#10B981]/30">
              <Dna className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#FAFAFA]">Multi-Epitope mRNA Vaccine Construct Formulator</h3>
              <p className="text-xs text-[#A1A1AA]">
                Assemble selected high-affinity peptides into a multivalent mRNA delivery vector.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-mono text-[#A1A1AA]">Epitope Linker:</label>
            <select 
              value={vaccineLinker} 
              onChange={(e) => setVaccineLinker(e.target.value)} 
              className="bg-[#09090B] border border-[#27272A] text-xs font-mono p-1.5 rounded-lg text-[#FAFAFA] focus:outline-none"
            >
              <option value="AAY">AAY Linker</option>
              <option value="GPGPG">GPGPG Linker</option>
              <option value="KK">Lys-Lys (KK)</option>
            </select>
          </div>
        </div>

        {/* Construct Blueprint Graphic */}
        <div className="flex flex-col gap-3 font-mono text-[11px]">
          <span className="text-[10px] text-[#A1A1AA] uppercase font-bold">Vaccine Vector Sequence Blueprint</span>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-2 text-center text-[10px]">
            <div className="bg-[#1E1B4B] border border-[#4338CA] p-2.5 rounded-xl text-[#A5B4FC]">
              <span className="font-bold block">5&apos; CAP Spec</span>
              <span className="text-[8px] text-[#71717A]">m7GpppG</span>
            </div>
            <div className="bg-[#022C22] border border-[#065F46] p-2.5 rounded-xl text-[#34D399]">
              <span className="font-bold block">Kozak/Signal</span>
              <span className="text-[8px] text-[#71717A]">MRLVALLFCLA</span>
            </div>
            <div className="bg-[#18181B] border border-[#22D3EE] p-2.5 rounded-xl text-[#22D3EE] md:col-span-3 truncate">
              <span className="font-bold block">Multivalent Epitopes ({activeVaccinePeptides.length} peptides)</span>
              <span className="text-[8px] text-[#71717A] block truncate">{fullEpitopeSequence || "No Peptides Selected"}</span>
            </div>
            <div className="bg-[#4C0519] border border-[#9F1239] p-2.5 rounded-xl text-[#FDA4AF]">
              <span className="font-bold block">Poly(A) Tail</span>
              <span className="text-[8px] text-[#71717A]">A(120) Tail</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#09090B] border border-[#27272A] p-4 rounded-xl mt-2">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-[#FAFAFA] font-bold">mRNA Translation Sequence Sequence</span>
              <p className="text-[10px] text-[#A1A1AA] leading-relaxed max-w-2xl font-mono truncate">
                MRLVALLFCLAALAAASA-{fullEpitopeSequence || "NO_VACCINE_PEPTIDES"}-MITD-A(120)
              </p>
            </div>
            <button 
              onClick={handleExportFormulation}
              disabled={activeVaccinePeptides.length === 0}
              className="bg-[#10B981] text-[#09090B] font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 hover:bg-[#059669] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" /> Export formulation Specs
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
