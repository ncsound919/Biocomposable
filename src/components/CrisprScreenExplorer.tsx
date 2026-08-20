import { useState } from "react";
import { 
  Target, 
  Search, 
  Activity, 
  Sliders, 
  Dna, 
  CheckCircle2, 
  AlertTriangle,
  Zap,
  TrendingDown,
  Cpu,
  Plus,
  Play
} from "lucide-react";

interface CrisprTarget {
  gene: string;
  l2fc: number; // Log2 fold change
  fdr: number;
  mageckRank: number;
  syntheticLethalityPartner: string;
  cancerLineage: string;
  essentialityScore: number; // DepMap CERES score
  guideEfficiency: number;
  mechanism: string;
}

const initialTargets: CrisprTarget[] = [
  {
    gene: "PARP1",
    l2fc: -3.85,
    fdr: 0.0001,
    mageckRank: 1,
    syntheticLethalityPartner: "BRCA1 / BRCA2 Mutated",
    cancerLineage: "Triple-Negative Breast (TNBC) / Ovarian",
    essentialityScore: -1.42,
    guideEfficiency: 0.96,
    mechanism: "Homologous recombination deficiency (HRD) trapping.",
  },
  {
    gene: "WRN",
    l2fc: -3.42,
    fdr: 0.0002,
    mageckRank: 2,
    syntheticLethalityPartner: "MSI-H (Microsatellite Instability)",
    cancerLineage: "Colorectal / Gastric Adenocarcinoma",
    essentialityScore: -1.35,
    guideEfficiency: 0.94,
    mechanism: "RecQ helicase dependency in MSI-high dinucleotide repeats.",
  },
  {
    gene: "STING1",
    l2fc: -2.91,
    fdr: 0.0012,
    mageckRank: 4,
    syntheticLethalityPartner: "ATM / p53 Loss",
    cancerLineage: "Pancreatic Ductal Adenocarcinoma (PDAC)",
    essentialityScore: -1.18,
    guideEfficiency: 0.91,
    mechanism: "cGAS-STING innate immunity cytosolic DNA sensing activation.",
  },
  {
    gene: "KRAS",
    l2fc: -4.12,
    fdr: 0.00005,
    mageckRank: 1,
    syntheticLethalityPartner: "G12D / G12C Amplification",
    cancerLineage: "Non-Small Cell Lung Cancer (NSCLC)",
    essentialityScore: -1.88,
    guideEfficiency: 0.98,
    mechanism: "GTPase Ras/MAPK oncogenic signaling dependency.",
  },
  {
    gene: "ATM",
    l2fc: -2.15,
    fdr: 0.0045,
    mageckRank: 8,
    syntheticLethalityPartner: "ARID1A Loss",
    cancerLineage: "Clear Cell Renal / Ovarian Cancer",
    essentialityScore: -0.89,
    guideEfficiency: 0.88,
    mechanism: "DNA double-strand break checkpoint signaling deficiency.",
  },
];

interface DesignedsgRNA {
  sequence: string;
  targetPosition: string;
  pam: string;
  onTargetScore: number;
  offTargetCount: number;
  gContent: number;
}

export function CrisprScreenExplorer() {
  const [targets, setTargets] = useState<CrisprTarget[]>(initialTargets);
  const [selectedTarget, setSelectedTarget] = useState<CrisprTarget>(initialTargets[0]);
  const [selectedLineage, setSelectedLineage] = useState<string>("ALL");
  const [fdrThreshold, setFdrThreshold] = useState<number>(0.01);

  // Synthetic lethality partner query
  const [queryDriver, setQueryDriver] = useState<string>("BRCA1 / BRCA2 Mutated");

  // sgRNA designer parameters
  const [customPam, setCustomPam] = useState<string>("NGG");
  const [targetExon, setTargetExon] = useState<number>(3);
  const [minGc, setMinGc] = useState<number>(45);
  const [designedsgRNAs, setDesignedsgRNAs] = useState<DesignedsgRNA[]>([
    { sequence: "CGCGGTCGAGGTCGCCGCTA", targetPosition: "Chr1:1143892", pam: "TGG", onTargetScore: 0.94, offTargetCount: 0, gContent: 55 },
    { sequence: "GTCGGACGGCCGCACTACGC", targetPosition: "Chr1:1143924", pam: "CGG", onTargetScore: 0.89, offTargetCount: 1, gContent: 60 }
  ]);
  const [isDesigning, setIsDesigning] = useState(false);

  const handleRunGuideDesign = () => {
    setIsDesigning(true);
    setTimeout(() => {
      // Deterministically generate 3 custom guides based on selected target and GC content
      const baseChars = "ACTG";
      const wordSeed = selectedTarget.gene;
      
      const guides: DesignedsgRNA[] = Array.from({ length: 3 }, (_, idx) => {
        // Construct pseudo-random biological-looking sgRNA string
        let seq = "";
        for (let i = 0; i < 20; i++) {
          const charIdx = (wordSeed.charCodeAt(i % wordSeed.length) + idx + i) % 4;
          seq += baseChars[charIdx];
        }

        const simulatedOnTarget = parseFloat(Math.min(0.99, 0.75 + (minGc / 500) + (idx * 0.06)).toFixed(2));
        const simulatedOffTarget = (idx * 2) % 3;
        const targetPos = `Chr` + ((wordSeed.charCodeAt(0) % 22) + 1) + ":" + (2013890 + (idx * 142));

        return {
          sequence: seq,
          targetPosition: targetPos,
          pam: customPam === "NGG" ? "CGG" : "AAG",
          onTargetScore: simulatedOnTarget,
          offTargetCount: simulatedOffTarget,
          gContent: minGc + (idx * 4)
        };
      });

      setDesignedsgRNAs(guides);
      setIsDesigning(false);
    }, 450);
  };

  const handleAddCustomTarget = () => {
    // Allows injecting custom knockout targets derived from clinical insights
    const custom: CrisprTarget = {
      gene: "PTEN",
      l2fc: -2.75,
      fdr: 0.002,
      mageckRank: 5,
      syntheticLethalityPartner: "PIK3CA Activated / EGFR Overexpression",
      cancerLineage: "Glioblastoma Multiforme (GBM)",
      essentialityScore: -1.05,
      guideEfficiency: 0.92,
      mechanism: "Reactivation of PIP3 phosphatase activity under selective inhibition."
    };
    setTargets((prev) => [custom, ...prev]);
    setSelectedTarget(custom);
    setQueryDriver("PIK3CA Activated / EGFR Overexpression");
  };

  const filteredTargets = targets.filter((t) => {
    const matchesLineage = selectedLineage === "ALL" || t.cancerLineage.includes(selectedLineage);
    const matchesFdr = t.fdr <= fdrThreshold;
    return matchesLineage && matchesFdr;
  });

  return (
    <div className="flex flex-col gap-6 w-full text-[#FAFAFA]" id="crispr-discovery-system">
      
      {/* Header Controls */}
      <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5 flex flex-col gap-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272A] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
              <span className="text-[10px] font-mono font-bold text-[#EF4444] uppercase tracking-wider">
                Functional Genomics & Target Discovery (Full-System Edition)
              </span>
            </div>
            <h2 className="text-base font-bold text-[#FAFAFA]">
              Genome-Wide CRISPR Screen & Synthetic Lethality Engine
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30">
              MAGeCK-VisPR / BAGEL
            </span>
            <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/30">
              DepMap / Project Achilles
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-[#A1A1AA] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#EF4444]" />
                FDR Significance Cutoff
              </span>
              <span className="text-[#EF4444] font-bold">FDR &lt; {fdrThreshold}</span>
            </div>
            <input
              type="range"
              min="0.0001"
              max="0.01"
              step="0.0005"
              value={fdrThreshold}
              onChange={(e) => setFdrThreshold(Number(e.target.value))}
              className="w-full accent-[#EF4444] bg-[#27272A] h-1.5 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] text-[#71717A]">
              Controls false discovery rate threshold for sgRNA dropout enrichment.
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-mono text-[#A1A1AA] flex items-center gap-1.5">
              <Dna className="w-3.5 h-3.5 text-[#22D3EE]" />
              Cancer Lineage DepMap Filter
            </span>
            <select
              value={selectedLineage}
              onChange={(e) => setSelectedLineage(e.target.value)}
              className="bg-[#09090B] border border-[#27272A] text-xs text-[#FAFAFA] font-mono rounded-xl p-2 focus:outline-none focus:border-[#22D3EE]"
            >
              <option value="ALL">ALL CANCER LINEAGES</option>
              <option value="Breast">TNBC / Breast</option>
              <option value="Colorectal">Colorectal (MSI-H)</option>
              <option value="Pancreatic">Pancreatic (PDAC)</option>
              <option value="Lung">Non-Small Cell Lung (NSCLC)</option>
            </select>
          </div>

          <div className="flex flex-col gap-2 justify-center bg-[#09090B] border border-[#27272A] p-3 rounded-xl font-mono text-[10px]">
            <div className="flex justify-between">
              <span className="text-[#71717A]">Active Target Discovery:</span>
              <span className="text-[#EF4444] font-bold">{filteredTargets.length} Screen Matches</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#71717A]">Top Essential Gene:</span>
              <span className="text-[#EF4444] font-bold">PARP1 (CERES -1.42)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Synthetic Lethality Matcher tool */}
      <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
          <h3 className="text-xs font-mono font-bold text-[#A1A1AA] uppercase flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#EF4444]" />
            Somatic Driver-to-Lethality Dependency Matcher
          </h3>
          <button 
            onClick={handleAddCustomTarget}
            className="text-[10px] font-mono bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 px-2 py-1 rounded hover:bg-[#EF4444]/25 transition-colors"
          >
            + Add PTEN Glioblastoma Screen Target
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-[10px] font-mono text-[#A1A1AA]">Select Patient Somatic Driver Loss</label>
            <select
              value={queryDriver}
              onChange={(e) => {
                setQueryDriver(e.target.value);
                // Auto align matching target
                const matched = targets.find(t => t.syntheticLethalityPartner.includes(e.target.value.split(" ")[0]));
                if (matched) setSelectedTarget(matched);
              }}
              className="bg-[#09090B] border border-[#27272A] text-xs text-[#FAFAFA] font-mono rounded-xl p-2.5 focus:outline-none focus:border-[#EF4444]"
            >
              <option value="BRCA1 / BRCA2 Mutated">BRCA1 / BRCA2 Mutated (Homologous Recombination Deficiency)</option>
              <option value="MSI-H (Microsatellite Instability)">MSI-H (Microsatellite Instability-High)</option>
              <option value="ATM / p53 Loss">ATM / p53 Loss (G2/M Checkpoint Deletion)</option>
              <option value="G12D / G12C Amplification">G12D / G12C Amplification (Ras Hyper-activation)</option>
              <option value="ARID1A Loss">ARID1A Loss (SWI/SNF Complex Deficiency)</option>
              <option value="PIK3CA Activated / EGFR Overexpression">PIK3CA Activated / EGFR Overexpression</option>
            </select>
          </div>

          <div className="bg-[#09090B] border border-[#27272A] p-3 rounded-xl md:col-span-2 flex flex-col gap-1 font-mono text-[11px]">
            <span className="text-[9px] text-[#71717A] uppercase block">Matched Lethal Screen Partner</span>
            <div className="flex justify-between items-center mt-0.5">
              <span className="text-sm font-bold text-[#EF4444]">{selectedTarget.gene}</span>
              <span className="text-[10px] bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 px-2 py-0.5 rounded font-bold">
                DepMap CERES Essentiality: {selectedTarget.essentialityScore}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Targets and sgRNA Designer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* MAGeCK Gene Ranking Table */}
        <div className="lg:col-span-7 bg-[#18181B] border border-[#27272A] rounded-2xl p-5 flex flex-col gap-4">
          <h3 className="text-xs font-mono font-bold text-[#A1A1AA] uppercase flex items-center justify-between">
            <span>Essentiality & Synthetic Lethality Targets</span>
            <span className="text-[10px] text-[#71717A]">{filteredTargets.length} Ranked</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-[11px]">
              <thead>
                <tr className="border-b border-[#27272A] text-[#71717A]">
                  <th className="pb-2 font-normal uppercase">Rank</th>
                  <th className="pb-2 font-normal uppercase">Target Gene</th>
                  <th className="pb-2 font-normal uppercase">CERES Score</th>
                  <th className="pb-2 font-normal uppercase">Log2 Fold Change</th>
                  <th className="pb-2 font-normal uppercase">Synthetic Partner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A]/50 text-[#A1A1AA]">
                {filteredTargets.map((t) => {
                  const isSelected = selectedTarget.gene === t.gene;
                  return (
                    <tr
                      key={t.gene}
                      onClick={() => {
                        setSelectedTarget(t);
                        setQueryDriver(t.syntheticLethalityPartner);
                      }}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? "bg-[#EF4444]/10 text-[#FAFAFA]" : "hover:bg-[#27272A]"
                      }`}
                    >
                      <td className="py-3 font-bold text-[#EF4444]">#{t.mageckRank}</td>
                      <td className="py-3 font-bold text-[#FAFAFA]">{t.gene}</td>
                      <td className="py-3 text-[#22D3EE] font-bold">{t.essentialityScore}</td>
                      <td className="py-3 text-[#EF4444] font-bold">{t.l2fc}</td>
                      <td className="py-3 text-[#10B981]">{t.syntheticLethalityPartner}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Target Deep Dive & sgRNA designer */}
        <div className="lg:col-span-5 bg-[#18181B] border border-[#27272A] rounded-2xl p-5 flex flex-col gap-4 justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#27272A] pb-3 mb-2">
              <div>
                <span className="text-[10px] font-mono text-[#EF4444] uppercase font-bold">
                  Target Spec: {selectedTarget.gene}
                </span>
                <h3 className="text-xs font-bold text-[#FAFAFA]">
                  {selectedTarget.cancerLineage}
                </h3>
              </div>
              <Target className="w-5 h-5 text-[#EF4444]" />
            </div>

            <div className="flex flex-col gap-3 font-mono text-[11px]">
              <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-3 flex flex-col gap-1">
                <span className="text-[10px] text-[#71717A] uppercase">Synthetic Lethality Pair</span>
                <span className="text-xs font-bold text-[#10B981]">{selectedTarget.syntheticLethalityPartner}</span>
              </div>

              <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-3 flex flex-col gap-1">
                <span className="text-[10px] text-[#71717A] uppercase">Lethal Mechanism</span>
                <p className="text-[10.5px] text-[#A1A1AA] leading-relaxed">{selectedTarget.mechanism}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-3">
                  <span className="text-[10px] text-[#71717A] uppercase block mb-1">Target sgRNA Efficiency</span>
                  <span className="text-sm font-bold text-[#22D3EE]">{(selectedTarget.guideEfficiency * 100).toFixed(0)}%</span>
                </div>
                <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-3">
                  <span className="text-[10px] text-[#71717A] uppercase block mb-1">FDR Confidence</span>
                  <span className="text-sm font-bold text-[#10B981]">{selectedTarget.fdr}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-3 text-[10px] text-[#71717A]">
            Project Achilles screening leverages CRISPR-Cas9 genome editing to identify essential survival drivers.
          </div>
        </div>

      </div>

      {/* sgRNA Guide Custom Designer Section */}
      <div className="bg-[#18181B] border border-[#EF4444]/30 rounded-2xl p-6 flex flex-col gap-5 mt-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272A] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EF4444]/10 text-[#EF4444] flex items-center justify-center font-bold border border-[#EF4444]/30">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#FAFAFA]">Interactive sgRNA Library & Guide Designer</h3>
              <p className="text-xs text-[#A1A1AA]">
                Design custom sgRNA spacer candidates targeting gene <strong className="text-[#EF4444]">{selectedTarget.gene}</strong>.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className="text-[#A1A1AA]">PAM:</span>
              <select 
                value={customPam} 
                onChange={(e) => setCustomPam(e.target.value)}
                className="bg-[#09090B] border border-[#27272A] text-xs text-[#FAFAFA] font-mono p-1 rounded"
              >
                <option value="NGG">SpCas9 (5&apos;-NGG)</option>
                <option value="NG">SaurCas9 (5&apos;-NNGRRT)</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className="text-[#A1A1AA]">Target Exon:</span>
              <input 
                type="number" 
                value={targetExon} 
                onChange={(e) => setTargetExon(parseInt(e.target.value) || 1)} 
                className="bg-[#09090B] border border-[#27272A] text-xs text-[#FAFAFA] font-mono p-1 rounded w-12 text-center"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className="text-[#A1A1AA]">GC Content:</span>
              <span className="text-[#EF4444] font-bold">{minGc}%</span>
              <input 
                type="range" 
                min="35" 
                max="65" 
                step="5" 
                value={minGc} 
                onChange={(e) => setMinGc(parseInt(e.target.value))} 
                className="accent-[#EF4444] w-20"
              />
            </div>
          </div>
        </div>

        {/* Designed sgRNAs List */}
        <div className="flex flex-col gap-3 font-mono text-[11px]">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-[#A1A1AA] uppercase font-bold">Synthesized Spacers Candidates (20-mer Spacer)</span>
            <button
              onClick={handleRunGuideDesign}
              disabled={isDesigning}
              className="bg-[#EF4444] text-[#FAFAFA] font-bold text-xs py-1.5 px-3.5 rounded-xl hover:bg-red-600 transition-all flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-[#FAFAFA]" />
              {isDesigning ? "Synthesizing Guides..." : `Compile spacer guides for ${selectedTarget.gene}`}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {designedsgRNAs.map((guide, idx) => (
              <div key={idx} className="bg-[#09090B] border border-[#27272A] p-4 rounded-xl flex flex-col gap-2">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-[#EF4444] font-bold">Guide #{idx + 1} Spec</span>
                  <span className="text-[#71717A]">{guide.targetPosition}</span>
                </div>
                <div className="bg-[#18181B] p-2 rounded border border-[#27272A] text-xs font-bold text-center tracking-wider text-[#FAFAFA]">
                  {guide.sequence} <span className="text-[#EF4444] font-normal">{guide.pam}</span>
                </div>
                <div className="grid grid-cols-3 text-center text-[9px] text-[#A1A1AA] pt-1">
                  <div>
                    <span className="block text-[#10B981] font-bold">{(guide.onTargetScore * 100).toFixed(0)}%</span>
                    On-Target
                  </div>
                  <div>
                    <span className="block text-[#EF4444] font-bold">{guide.offTargetCount} sites</span>
                    Off-Target
                  </div>
                  <div>
                    <span className="block text-[#22D3EE] font-bold">{guide.gContent}%</span>
                    GC Ratio
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
