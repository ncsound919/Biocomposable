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
  Download
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

const neoantigenData: NeoantigenCandidate[] = [
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
  const [selectedAllele, setSelectedAllele] = useState<string>("ALL");
  const [kdCutoff, setKdCutoff] = useState<number>(150); // max Kd in nM
  const [minTpm, setMinTpm] = useState<number>(5.0);
  const [selectedCandidate, setSelectedCandidate] = useState<NeoantigenCandidate>(neoantigenData[0]);

  const filteredCandidates = neoantigenData.filter((item) => {
    const matchesAllele = selectedAllele === "ALL" || item.hlaAllele === selectedAllele;
    const matchesKd = item.bindingAffinityKd <= kdCutoff;
    const matchesTpm = item.rnaExpressionTpm >= minTpm;
    return matchesAllele && matchesKd && matchesTpm;
  });

  const highConfidenceCount = filteredCandidates.filter(c => c.status === "HIGH_CONFIDENCE").length;

  return (
    <div className="flex flex-col gap-6 w-full text-[#FAFAFA]">
      
      {/* Top Controls & Metrics */}
      <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5 flex flex-col gap-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272A] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#22D3EE]" />
              <span className="text-[10px] font-mono font-bold text-[#22D3EE] uppercase tracking-wider">
                Precision Oncology Module
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
            <span className="text-base font-bold font-mono text-[#FAFAFA]">{neoantigenData.length} peptide targets</span>
          </div>

          <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-3 flex flex-col gap-1">
            <span className="text-[10px] font-mono text-[#71717A] uppercase">Filtered Qualified</span>
            <span className="text-base font-bold font-mono text-[#22D3EE]">{filteredCandidates.length} targets</span>
          </div>

          <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-3 flex flex-col gap-1">
            <span className="text-[10px] font-mono text-[#71717A] uppercase">High Confidence Vaccines</span>
            <span className="text-base font-bold font-mono text-[#10B981]">{highConfidenceCount} peptides</span>
          </div>

          <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-3 flex flex-col gap-1">
            <span className="text-[10px] font-mono text-[#71717A] uppercase">Top Immunogenicity Score</span>
            <span className="text-base font-bold font-mono text-[#8B5CF6]">0.94 (KRAS G12D)</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Table of Candidates */}
        <div className="lg:col-span-7 bg-[#18181B] border border-[#27272A] rounded-2xl p-5 flex flex-col gap-4">
          <h3 className="text-xs font-mono font-bold text-[#A1A1AA] uppercase flex items-center justify-between">
            <span>Neoantigen Candidate Portfolio</span>
            <span className="text-[10px] text-[#71717A]">{filteredCandidates.length} Selected</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-[11px]">
              <thead>
                <tr className="border-b border-[#27272A] text-[#71717A]">
                  <th className="pb-2 font-normal uppercase">Gene & Mutation</th>
                  <th className="pb-2 font-normal uppercase">HLA Allele</th>
                  <th className="pb-2 font-normal uppercase">Kd (nM)</th>
                  <th className="pb-2 font-normal uppercase">TPM</th>
                  <th className="pb-2 font-normal uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A]/50 text-[#A1A1AA]">
                {filteredCandidates.map((c) => {
                  const isSelected = selectedCandidate.id === c.id;
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedCandidate(c)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? "bg-[#22D3EE]/10 text-[#FAFAFA]" : "hover:bg-[#27272A]"
                      }`}
                    >
                      <td className="py-3 font-bold text-[#FAFAFA]">
                        {c.gene} <span className="text-[#22D3EE] font-normal text-[10px]">{c.mutation}</span>
                      </td>
                      <td className="py-3 text-[#A1A1AA]">{c.hlaAllele}</td>
                      <td className={`py-3 font-bold ${c.bindingAffinityKd < 50 ? "text-[#10B981]" : "text-[#F59E0B]"}`}>
                        {c.bindingAffinityKd} nM
                      </td>
                      <td className="py-3 text-[#A1A1AA]">{c.rnaExpressionTpm}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          c.status === "HIGH_CONFIDENCE"
                            ? "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30"
                            : c.status === "MODERATE"
                            ? "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30"
                            : "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30"
                        }`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Candidate Detailed Inspection */}
        <div className="lg:col-span-5 bg-[#18181B] border border-[#27272A] rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
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
                  <span className="text-[#EF4444] font-bold">{selectedCandidate.wildtypePeptide}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#71717A]">Mutant: </span>
                  <span className="text-[#10B981] font-bold">{selectedCandidate.mutantPeptide}</span>
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
              <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-3 text-[10px] text-[#A1A1AA] overflow-x-auto">
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

      </div>

    </div>
  );
}
