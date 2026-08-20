import React, { useState, useEffect } from "react";
import { 
  Binary, 
  BookOpen, 
  Layers, 
  CheckCircle2, 
  Play, 
  Sparkles, 
  Cpu, 
  Sliders, 
  Dna, 
  BarChart2, 
  RefreshCcw, 
  Activity, 
  FileText 
} from "lucide-react";

interface Props {
  activeMode?: string;
  onModeChange?: (mode: string) => void;
}

export function ReferenceFreeMode({ activeMode = "reference_free", onModeChange }: Props) {
  // Selector style resolver
  const getModeStyles = (mode: string) => {
    if (activeMode === mode) {
      if (mode === 'reference_free') {
        return "border-[#22D3EE]/50 bg-[#18181B] opacity-100 shadow-[0_0_15px_rgba(34,211,238,0.1)] ring-1 ring-[#22D3EE]/30";
      }
      return "border-[#F59E0B]/50 bg-[#18181B] opacity-100 shadow-[0_0_15px_rgba(245,158,11,0.1)] ring-1 ring-[#F59E0B]/30";
    }
    return "border-[#27272A] bg-[#09090B] opacity-60 grayscale hover:grayscale-0 hover:opacity-100 cursor-pointer hover:border-[#3F3F46]";
  };

  // Alignment Playground States
  const [activeSubTab, setActiveSubTab] = useState<"DE_NOVO_ALIGNER" | "CROSS_MODAL_DECONV" | "KMER_LATENT_ENGINE">("DE_NOVO_ALIGNER");
  
  // Tab 1: Aligner States
  const [readsInput, setReadsInput] = useState<string>(
    "@READ_1_BRCA1_EXON2\nATGGATTTATCTGCTCTTCGCGTTGAAGAAGTACAAAATGTC\n+\nIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII\n@READ_2_BRCA1_MUTANT\nATGGATTTATCTGCTCTTCGCGTTGTAGAAGTACAAAATGTC\n+\nIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII"
  );
  const [mismatchPenalty, setMismatchPenalty] = useState<number>(4);
  const [gapPenalty, setGapPenalty] = useState<number>(6);
  const [alignmentLogs, setAlignmentLogs] = useState<string[]>([]);
  const [isAligning, setIsAligning] = useState<boolean>(false);
  const [alignedTracks, setAlignedTracks] = useState<Array<{
    readId: string;
    sequence: string;
    alignmentString: string;
    score: number;
    mismatchPositions: number[];
  }>>([]);

  // Tab 2: Cross-Modal cfRNA Deconvolution States
  const [cfrnaCancerFraction, setCfrnaCancerFraction] = useState<number>(34); // in %
  const [cfrnaImmuneFraction, setCfrnaImmuneFraction] = useState<number>(25); // in %
  const [cfrnaLiverFraction, setCfrnaLiverFraction] = useState<number>(41);  // in %
  
  // Computed deconvoluted cell-types (adding noise)
  const [deconvOutput, setDeconvOutput] = useState<Array<{
    cellType: string;
    inferredProportion: number;
    referenceMatchedProportion: number;
    confidenceScore: number;
  }>>([]);

  // Tab 3: K-Mer Latent States
  const [kmerSize, setKmerSize] = useState<number>(6);
  const [minFrequency, setMinFrequency] = useState<number>(3);
  const [discoveredClusters, setDiscoveredClusters] = useState<Array<{
    clusterId: string;
    kmerPattern: string;
    expressionWeight: number;
    associatedFunction: string;
    heterogeneityIndex: number;
  }>>([]);

  // Align Fastq Simulated function
  const runSimulatedAlignment = () => {
    setIsAligning(true);
    setAlignmentLogs([`[ALIGNER] Initializing reference-free Smith-Waterman locus alignment...`]);
    
    setTimeout(() => {
      const isMutation = mismatchPenalty > 2;
      const refSeq = "ATGGATTTATCTGCTCTTCGCGTTGAAGAAGTACAAAATGTC";
      
      const tracks = [
        {
          readId: "READ_1_BRCA1_EXON2",
          sequence: "ATGGATTTATCTGCTCTTCGCGTTGAAGAAGTACAAAATGTC",
          alignmentString: "||||||||||||||||||||||||||||||||||||||||||",
          score: 120 - gapPenalty * 0,
          mismatchPositions: []
        },
        {
          readId: "READ_2_BRCA1_MUTANT",
          sequence: "ATGGATTTATCTGCTCTTCGCGTTGTAGAAGTACAAAATGTC",
          alignmentString: "|||||||||||||||||||||||||X||||||||||||||||",
          score: 120 - mismatchPenalty - gapPenalty * 0,
          mismatchPositions: [25]
        }
      ];

      setAlignedTracks(tracks);
      setAlignmentLogs(prev => [
        ...prev,
        `[ALIGNER] Parsed 2 FASTQ sequencing records.`,
        `[ALIGNER] Computed reference locus sequence mapping.`,
        `[ALIGNER] Identified clinical mismatch variant at coordinate offset +25.`,
        `[ALIGNER] Read alignment score finalized. Consensus coverage is 100%.`
      ]);
      setIsAligning(false);
    }, 800);
  };

  // Run cfRNA Deconvolution simulation
  const runDeconvolutionMath = () => {
    const total = cfrnaCancerFraction + cfrnaImmuneFraction + cfrnaLiverFraction;
    const normCancer = Number(((cfrnaCancerFraction / total) * 100).toFixed(1));
    const normImmune = Number(((cfrnaImmuneFraction / total) * 100).toFixed(1));
    const normLiver = Number(((cfrnaLiverFraction / total) * 100).toFixed(1));

    setDeconvOutput([
      { cellType: "Tumor-Derived Microvesicles", inferredProportion: normCancer, referenceMatchedProportion: normCancer + (Math.random() * 4 - 2), confidenceScore: 0.94 },
      { cellType: "CD8+ Cytotoxic T-Lymphocytes", inferredProportion: normImmune, referenceMatchedProportion: normImmune + (Math.random() * 3 - 1.5), confidenceScore: 0.89 },
      { cellType: "Hepatic Sinusoidal Epithelial", inferredProportion: normLiver, referenceMatchedProportion: normLiver + (Math.random() * 5 - 2.5), confidenceScore: 0.91 }
    ]);
  };

  // Run K-mer Discovery logic
  const runKmerDiscovery = () => {
    setDiscoveredClusters([
      { clusterId: "K-CLUST-01", kmerPattern: "CAGTGC", expressionWeight: 45.2, associatedFunction: "Wnt/β-Catenin Pathway Activation", heterogeneityIndex: 0.12 },
      { clusterId: "K-CLUST-02", kmerPattern: "TGACTC", expressionWeight: 28.7, associatedFunction: "Apoptotic Signaling Enhancer", heterogeneityIndex: 0.19 },
      { clusterId: "K-CLUST-03", kmerPattern: "GGCATG", expressionWeight: 14.1, associatedFunction: "Angiogenic Growth Factor Initiator", heterogeneityIndex: 0.08 }
    ]);
  };

  // Initial trigger
  useEffect(() => {
    runSimulatedAlignment();
    runDeconvolutionMath();
    runKmerDiscovery();
  }, [cfrnaCancerFraction, cfrnaImmuneFraction, cfrnaLiverFraction, mismatchPenalty, gapPenalty, kmerSize]);

  return (
    <div className="flex flex-col gap-6">
      {/* 3-Column Standard Modes Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Atlas Mode */}
        <div 
          onClick={() => onModeChange?.("atlas")}
          className={`rounded-xl p-5 flex flex-col transition-all duration-300 ${getModeStyles("atlas")}`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-[#27272A] rounded-lg border border-[#3F3F46]">
              <BookOpen className={`w-4 h-4 ${activeMode === 'atlas' ? 'text-[#F59E0B]' : 'text-[#A1A1AA]'}`} />
            </div>
            <h3 className="text-sm font-bold text-[#FAFAFA]">Atlas Mode</h3>
          </div>
          <p className="text-xs text-[#A1A1AA] leading-relaxed mb-4">
            Requires a fully matched, high-quality single-cell reference atlas. Traditional approach, highly dependent on reference availability and quality.
          </p>
          <div className="mt-auto">
            <span className={`text-[10px] font-mono px-2 py-1 rounded border ${activeMode === 'atlas' ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30' : 'text-[#71717A] bg-[#18181B] border-[#27272A]'}`}>
              mode="atlas"
            </span>
          </div>
        </div>

        {/* Hybrid Mode */}
        <div 
          onClick={() => onModeChange?.("hybrid")}
          className={`rounded-xl p-5 flex flex-col transition-all duration-300 ${getModeStyles("hybrid")}`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-[#27272A] rounded-lg border border-[#3F3F46]">
              <Layers className={`w-4 h-4 ${activeMode === 'hybrid' ? 'text-[#F59E0B]' : 'text-[#A1A1AA]'}`} />
            </div>
            <h3 className="text-sm font-bold text-[#FAFAFA]">Hybrid Mode</h3>
          </div>
          <p className="text-xs text-[#A1A1AA] leading-relaxed mb-4">
            Partial reference mapping combined with de novo discovery. Useful for discovering poorly annotated states adjacent to known biology.
          </p>
          <div className="mt-auto">
            <span className={`text-[10px] font-mono px-2 py-1 rounded border ${activeMode === 'hybrid' ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30' : 'text-[#71717A] bg-[#18181B] border-[#27272A]'}`}>
              mode="hybrid"
            </span>
          </div>
        </div>

        {/* Reference-Free Mode */}
        <div 
          onClick={() => onModeChange?.("reference_free")}
          className={`rounded-xl p-5 flex flex-col relative overflow-hidden transition-all duration-300 ${getModeStyles("reference_free")}`}
        >
          <div className="absolute top-0 right-0 p-2">
            <span className={`text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${activeMode === 'reference_free' ? 'bg-[#22D3EE]/10 text-[#22D3EE] border-[#22D3EE]/30' : 'bg-[#27272A] text-[#71717A] border-[#3F3F46]'}`}>
              Phase 1 Active
            </span>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg border ${activeMode === 'reference_free' ? 'bg-[#22D3EE]/10 border-[#22D3EE]/30' : 'bg-[#27272A] border-[#3F3F46]'}`}>
              <Binary className={`w-4 h-4 ${activeMode === 'reference_free' ? 'text-[#22D3EE]' : 'text-[#A1A1AA]'}`} />
            </div>
            <h3 className="text-sm font-bold text-[#FAFAFA]">Reference-Free Mode</h3>
          </div>
          <p className="text-xs text-[#A1A1AA] leading-relaxed mb-4">
            Binary-SPA style mapping without matched single-cell reference. Extracts latent biological signals directly from spatial or bulk topology.
          </p>
          <div className="mt-auto flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className={`w-3.5 h-3.5 ${activeMode === 'reference_free' ? 'text-[#10B981]' : 'text-[#52525B]'}`} />
              <span className="text-[10px] text-[#A1A1AA]">Python/R SDK Support Built-in</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className={`w-3.5 h-3.5 ${activeMode === 'reference_free' ? 'text-[#10B981]' : 'text-[#52525B]'}`} />
              <span className="text-[10px] text-[#A1A1AA]">Available via /agent/v1/run</span>
            </div>
            <div className="mt-2">
              <span className={`text-[10px] font-mono px-2 py-1 rounded border ${activeMode === 'reference_free' ? 'bg-[#22D3EE]/10 text-[#22D3EE] border-[#22D3EE]/20' : 'bg-[#18181B] text-[#71717A] border-[#27272A]'}`}>
                mode="reference_free"
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Alignment Sector Advanced Playground */}
      <div className="bg-[#111114] border border-[#27272A] rounded-2xl p-6 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#18181B] pb-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-mono font-bold text-[#22D3EE] uppercase tracking-wider flex items-center gap-1.5">
              <Dna className="w-3.5 h-3.5 animate-pulse text-[#22D3EE]" /> Alignment &amp; Deconvolution Sandbox
            </span>
            <h2 className="text-base font-bold text-[#FAFAFA]">Interactive Reference-Free Alignment Ecosystem</h2>
          </div>

          {/* Sub Tab Buttons */}
          <div className="flex items-center gap-1 bg-[#09090B] p-1 rounded-lg border border-[#27272A]">
            <button
              onClick={() => setActiveSubTab("DE_NOVO_ALIGNER")}
              className={`px-3 py-1.5 rounded-md font-mono text-[10px] font-bold flex items-center gap-1 transition-all ${
                activeSubTab === "DE_NOVO_ALIGNER"
                  ? "bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/20"
                  : "text-[#71717A] hover:text-[#FAFAFA]"
              }`}
            >
              <Activity className="w-3 h-3" /> De Novo Aligner
            </button>
            <button
              onClick={() => setActiveSubTab("CROSS_MODAL_DECONV")}
              className={`px-3 py-1.5 rounded-md font-mono text-[10px] font-bold flex items-center gap-1 transition-all ${
                activeSubTab === "CROSS_MODAL_DECONV"
                  ? "bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/20"
                  : "text-[#71717A] hover:text-[#FAFAFA]"
              }`}
            >
              <Sliders className="w-3 h-3" /> bio-crossmodal-align
            </button>
            <button
              onClick={() => setActiveSubTab("KMER_LATENT_ENGINE")}
              className={`px-3 py-1.5 rounded-md font-mono text-[10px] font-bold flex items-center gap-1 transition-all ${
                activeSubTab === "KMER_LATENT_ENGINE"
                  ? "bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/20"
                  : "text-[#71717A] hover:text-[#FAFAFA]"
              }`}
            >
              <Cpu className="w-3 h-3" /> k-mer Latent Engine
            </button>
          </div>
        </div>

        {/* Content Tab 1: De Novo Sequence Aligner */}
        {activeSubTab === "DE_NOVO_ALIGNER" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-[#A1A1AA] uppercase font-bold font-mono">FASTQ Input Reads</span>
                <textarea
                  value={readsInput}
                  onChange={(e) => setReadsInput(e.target.value)}
                  className="w-full h-24 bg-[#09090B] border border-[#27272A] rounded-lg p-3 font-mono text-[10px] text-[#FAFAFA] focus:outline-none focus:border-[#22D3EE]/40 resize-none"
                />
              </div>

              {/* Slider Settings */}
              <div className="bg-[#09090B] p-4 rounded-xl border border-[#27272A] flex flex-col gap-4 font-mono text-[10px]">
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between">
                    <span className="text-[#A1A1AA]">Mismatch Penalty:</span>
                    <span className="text-[#22D3EE] font-bold">{mismatchPenalty} bp</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={mismatchPenalty}
                    onChange={(e) => setMismatchPenalty(Number(e.target.value))}
                    className="w-full accent-[#22D3EE]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between">
                    <span className="text-[#A1A1AA]">Gap Open/Extend Penalty:</span>
                    <span className="text-[#22D3EE] font-bold">{gapPenalty} bp</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="12"
                    value={gapPenalty}
                    onChange={(e) => setGapPenalty(Number(e.target.value))}
                    className="w-full accent-[#22D3EE]"
                  />
                </div>

                <button
                  onClick={runSimulatedAlignment}
                  disabled={isAligning}
                  className="w-full py-2 bg-[#22D3EE] hover:bg-[#06B6D4] text-[#09090B] font-bold font-mono text-[10px] rounded-lg transition-all flex items-center justify-center gap-1.5"
                >
                  <RefreshCcw className={`w-3.5 h-3.5 ${isAligning ? "animate-spin" : ""}`} />
                  {isAligning ? "COMPUTING SEQUENCE ALIGNMENT..." : "RE-ALIGN SEQUENCE"}
                </button>
              </div>
            </div>

            {/* Aligner Visualization Track */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-4 flex flex-col gap-3 font-mono">
                <span className="text-[10px] text-[#71717A] uppercase font-bold">Interactive BAM Alignment Track (BRCA1 Locus)</span>
                
                {/* Reference Sequence Row */}
                <div className="flex flex-col gap-1 p-2.5 bg-[#18181B] rounded-lg border border-[#27272A]">
                  <span className="text-[8px] text-[#71717A] uppercase">GENCODE v44 Locus Consensus Reference</span>
                  <div className="text-[10px] font-bold text-emerald-400 select-all tracking-widest break-all">
                    ATGGATTTATCTGCTCTTCGCGTTGAAGAAGTACAAAATGTC
                  </div>
                </div>

                {/* Simulated Stacked Tracks */}
                <div className="flex flex-col gap-3.5">
                  {alignedTracks.map((track, i) => (
                    <div key={i} className="flex flex-col gap-1.5 p-2 bg-[#18181B]/50 rounded border border-[#27272A]">
                      <div className="flex justify-between text-[8px] text-[#A1A1AA]">
                        <span>Track ID: {track.readId}</span>
                        <span className="text-[#22D3EE] font-bold">Score: {track.score}</span>
                      </div>
                      
                      {/* Nucleotides with mismatch highlighting */}
                      <div className="text-[10px] font-bold tracking-widest break-all">
                        {track.sequence.split("").map((char, charIdx) => {
                          const isMismatch = track.mismatchPositions.includes(charIdx);
                          return (
                            <span 
                              key={charIdx} 
                              className={isMismatch ? "bg-[#EF4444]/20 text-[#EF4444] border-b border-[#EF4444] px-0.5" : "text-white"}
                            >
                              {char}
                            </span>
                          );
                        })}
                      </div>

                      {/* Alignment matches row */}
                      <div className="text-[9px] text-[#22D3EE] tracking-widest leading-none opacity-80 break-all">
                        {track.alignmentString}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Logs */}
              <div className="bg-[#09090B]/60 p-3 rounded-lg border border-[#18181B] font-mono text-[9px] text-[#71717A] flex flex-col gap-1 max-h-24 overflow-y-auto">
                {alignmentLogs.map((log, index) => (
                  <span key={index}>{log}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Content Tab 2: bio-crossmodal-align cfRNA Spatial Deconvolution */}
        {activeSubTab === "CROSS_MODAL_DECONV" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 flex flex-col gap-4 font-mono text-[10px]">
              <span className="text-[10px] text-[#A1A1AA] uppercase font-bold">Input cfRNA Plasma Proportions</span>
              
              <div className="bg-[#09090B] p-4 rounded-xl border border-[#27272A] flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between">
                    <span className="text-white">Tumor Fraction:</span>
                    <span className="text-[#22D3EE] font-bold">{cfrnaCancerFraction}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="90"
                    value={cfrnaCancerFraction}
                    onChange={(e) => setCfrnaCancerFraction(Number(e.target.value))}
                    className="w-full accent-[#22D3EE]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between">
                    <span className="text-white">Immune Fraction:</span>
                    <span className="text-[#22D3EE] font-bold">{cfrnaImmuneFraction}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="90"
                    value={cfrnaImmuneFraction}
                    onChange={(e) => setCfrnaImmuneFraction(Number(e.target.value))}
                    className="w-full accent-[#22D3EE]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between">
                    <span className="text-white">Hepatic Fraction:</span>
                    <span className="text-[#22D3EE] font-bold">{cfrnaLiverFraction}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="90"
                    value={cfrnaLiverFraction}
                    onChange={(e) => setCfrnaLiverFraction(Number(e.target.value))}
                    className="w-full accent-[#22D3EE]"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-[#18181B]/50 rounded-xl border border-[#27272A] leading-relaxed text-[#71717A]">
                The cell-free RNA deconvolution component maps peripheral blood sequencing fractions to spatial cellular lineages inside organ structures, without needing paired patient reference maps.
              </div>
            </div>

            {/* Deconvolution Target Graph */}
            <div className="lg:col-span-7 flex flex-col gap-4 font-mono text-[10px]">
              <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-5 flex flex-col gap-4">
                <span className="text-[10px] text-[#A1A1AA] uppercase font-bold">Cross-Modal Decoupler Model Outputs</span>

                <div className="flex flex-col gap-4">
                  {deconvOutput.map((out, index) => {
                    return (
                      <div key={index} className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-white font-bold">{out.cellType}</span>
                          <span className="text-[#22D3EE] font-mono">{out.inferredProportion}%</span>
                        </div>

                        {/* Bar comparison */}
                        <div className="w-full h-3 bg-[#18181B] rounded-full overflow-hidden relative border border-[#27272A]">
                          <div 
                            className="h-full bg-gradient-to-r from-[#22D3EE] to-[#0891B2] rounded-full transition-all duration-300"
                            style={{ width: `${out.inferredProportion}%` }}
                          />
                        </div>

                        <div className="flex justify-between text-[8px] text-[#71717A]">
                          <span>Reference Matched: {out.referenceMatchedProportion.toFixed(1)}%</span>
                          <span className="text-emerald-400">Confidence: {(out.confidenceScore * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Tab 3: k-mer Latent Engine */}
        {activeSubTab === "KMER_LATENT_ENGINE" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 flex flex-col gap-4 font-mono text-[10px]">
              <span className="text-[10px] text-[#A1A1AA] uppercase font-bold">K-mer Profiling Inputs</span>

              <div className="bg-[#09090B] p-4 rounded-xl border border-[#27272A] flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between">
                    <span className="text-white">k-mer Window (k):</span>
                    <span className="text-[#22D3EE] font-bold">{kmerSize}</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="9"
                    value={kmerSize}
                    onChange={(e) => setKmerSize(Number(e.target.value))}
                    className="w-full accent-[#22D3EE]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between">
                    <span className="text-white">Min Frequency Threshold:</span>
                    <span className="text-[#22D3EE] font-bold">{minFrequency} reads</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={minFrequency}
                    onChange={(e) => setMinFrequency(Number(e.target.value))}
                    className="w-full accent-[#22D3EE]"
                  />
                </div>
              </div>
            </div>

            {/* Latent Clusters Output */}
            <div className="lg:col-span-7 flex flex-col gap-4 font-mono text-[10px]">
              <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-4 flex flex-col gap-3">
                <span className="text-[10px] text-[#A1A1AA] uppercase font-bold">Discovered Reference-Free Latent Clusters</span>

                <div className="flex flex-col gap-2.5">
                  {discoveredClusters.map((clust, index) => {
                    return (
                      <div key={index} className="p-3 bg-[#18181B] rounded-lg border border-[#27272A] flex justify-between items-center hover:border-[#3F3F46] transition-all">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[#FAFAFA] font-bold">{clust.clusterId}</span>
                            <span className="text-[#22D3EE] bg-[#22D3EE]/10 px-1.5 py-0.2 rounded font-mono text-[9px]">{clust.kmerPattern}</span>
                          </div>
                          <span className="text-[#71717A] text-[9px]">{clust.associatedFunction}</span>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs font-bold text-white">{clust.expressionWeight}% weight</span>
                          <span className="text-[8px] text-[#71717A]">Heterogeneity: {clust.heterogeneityIndex}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
