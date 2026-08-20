import { useState } from "react";
import { 
  Grid, 
  Layers, 
  Activity, 
  Sparkles, 
  Maximize2, 
  Zap, 
  MapPin,
  Sliders,
  Dna,
  RefreshCcw,
  Check,
  Eye
} from "lucide-react";

interface SpatialSpot {
  id: string;
  x: number;
  y: number;
  region: "Tumor Core" | "Invasive Margin" | "Tertiary Lymphoid" | "Stroma/CAF";
  dominantCell: string;
  tumorFraction: number;
  tExhaustedFraction: number;
  cafFraction: number;
  pdl1Expression: number;
}

const generateBiopsySpots = (type: "LUNG" | "PANCREATIC" | "COLORECTAL"): SpatialSpot[] => {
  return Array.from({ length: 36 }, (_, i) => {
    const x = i % 6;
    const y = Math.floor(i / 6);
    const distFromCenter = Math.sqrt((x - 2.5) ** 2 + (y - 2.5) ** 2);
    
    let region: SpatialSpot["region"] = "Stroma/CAF";
    if (distFromCenter < 1.2) region = "Tumor Core";
    else if (distFromCenter < 2.3) region = "Invasive Margin";
    else if (x === 0 && y === 0) region = "Tertiary Lymphoid";

    // Adjust ratios based on tumor type
    let tumorFraction = region === "Tumor Core" ? 0.82 : region === "Invasive Margin" ? 0.45 : 0.05;
    let tExhaustedFraction = region === "Invasive Margin" ? 0.38 : region === "Tertiary Lymphoid" ? 0.65 : 0.08;
    let cafFraction = region === "Stroma/CAF" ? 0.72 : 0.15;
    let pdl1Expression = region === "Invasive Margin" ? 8.4 : region === "Tumor Core" ? 5.2 : 0.9;

    if (type === "PANCREATIC") {
      // Pancreatic cancer is highly desmoplastic (stroma/fibrous heavy)
      cafFraction = region === "Stroma/CAF" ? 0.90 : 0.35;
      tumorFraction = region === "Tumor Core" ? 0.60 : 0.25;
      tExhaustedFraction = tExhaustedFraction * 0.4; // Cold tumor, low T-cells
      pdl1Expression = pdl1Expression * 0.5;
    } else if (type === "COLORECTAL") {
      // Colorectal MSI-H is highly immunogenic, lots of T-cells and TLS activity
      tExhaustedFraction = region === "Invasive Margin" ? 0.55 : region === "Tertiary Lymphoid" ? 0.85 : 0.20;
      tumorFraction = region === "Tumor Core" ? 0.70 : 0.30;
      cafFraction = cafFraction * 0.6;
      pdl1Expression = pdl1Expression * 1.3;
    }

    return {
      id: `SPOT-${i + 1}`,
      x,
      y,
      region,
      dominantCell: region === "Tumor Core" ? "Tumor Cell (MKI67+)" : region === "Invasive Margin" ? "CD8+ T Exhausted (PD-1+)" : region === "Tertiary Lymphoid" ? "B-cell / T-cell Zone" : "Cancer-Associated Fibroblast",
      tumorFraction: parseFloat(tumorFraction.toFixed(2)),
      tExhaustedFraction: parseFloat(tExhaustedFraction.toFixed(2)),
      cafFraction: parseFloat(cafFraction.toFixed(2)),
      pdl1Expression: parseFloat(pdl1Expression.toFixed(1)),
    };
  });
};

export function SpatialTmeDeconvolution() {
  const [biopsyType, setBiopsyType] = useState<"LUNG" | "PANCREATIC" | "COLORECTAL">("LUNG");
  const [spatialSpots, setSpatialSpots] = useState<SpatialSpot[]>(generateBiopsySpots("LUNG"));
  const [selectedSpot, setSelectedSpot] = useState<SpatialSpot>(spatialSpots[14]);
  const [spotResolution, setSpotResolution] = useState<number>(10); // micrometers
  const [activeCellFilter, setActiveCellFilter] = useState<"ALL" | "TUMOR" | "TEX" | "CAF">("ALL");
  
  // Interactive Therapies State
  const [treatmentPD1, setTreatmentPD1] = useState(false);
  const [treatmentCART, setTreatmentCART] = useState(false);
  const [treatmentCAF, setTreatmentCAF] = useState(false);

  const handleRegenerateSpec = (type: "LUNG" | "PANCREATIC" | "COLORECTAL") => {
    setBiopsyType(type);
    const newSpots = generateBiopsySpots(type);
    setSpatialSpots(newSpots);
    setSelectedSpot(newSpots[14]);
    // Reset treatments
    setTreatmentPD1(false);
    setTreatmentCART(false);
    setTreatmentCAF(false);
  };

  // Compute treated spots dynamically based on active therapies
  const getTreatedSpots = (): SpatialSpot[] => {
    return spatialSpots.map((spot) => {
      let tumorFraction = spot.tumorFraction;
      let tExhaustedFraction = spot.tExhaustedFraction;
      let cafFraction = spot.cafFraction;
      let pdl1Expression = spot.pdl1Expression;

      if (treatmentPD1) {
        // Anti-PD1 converts exhausted T-cells to active, which shrinks tumor fraction
        tExhaustedFraction = parseFloat(Math.max(0.02, spot.tExhaustedFraction * 0.4).toFixed(2));
        tumorFraction = parseFloat(Math.max(0.05, spot.tumorFraction * 0.75).toFixed(2));
        pdl1Expression = parseFloat(Math.max(0.5, spot.pdl1Expression * 0.3).toFixed(1));
      }

      if (treatmentCART) {
        // CAR-T cell infusion increases active immune presence and heavily kills tumor core
        tumorFraction = parseFloat(Math.max(0.02, tumorFraction * 0.6).toFixed(2));
        tExhaustedFraction = parseFloat(Math.min(0.95, tExhaustedFraction * 1.5).toFixed(2));
      }

      if (treatmentCAF) {
        // CAF inhibitor targeting stromal components
        cafFraction = parseFloat(Math.max(0.01, spot.cafFraction * 0.3).toFixed(2));
        tumorFraction = parseFloat(Math.max(0.05, tumorFraction * 0.9).toFixed(2));
      }

      return {
        ...spot,
        tumorFraction,
        tExhaustedFraction,
        cafFraction,
        pdl1Expression
      };
    });
  };

  const activeSpots = getTreatedSpots();
  const currentSpot = activeSpots.find(s => s.id === selectedSpot.id) || selectedSpot;

  return (
    <div className="flex flex-col gap-6 w-full text-[#FAFAFA]" id="spatial-transcriptomics-system">
      
      {/* Top Header Controls */}
      <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5 flex flex-col gap-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272A] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
              <span className="text-[10px] font-mono font-bold text-[#8B5CF6] uppercase tracking-wider">
                Spatial Biology & Microenvironment (Full-System Edition)
              </span>
            </div>
            <h2 className="text-base font-bold text-[#FAFAFA]">
              Single-Cell Spatial Transcriptomics & Tumor Microenvironment Mapper
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/30">
              10x Visium / CosMx / Xenium
            </span>
            <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/30">
              Cell2location / RCTD
            </span>
          </div>
        </div>

        {/* biopsy Selector Buttons */}
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => handleRegenerateSpec("LUNG")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-colors ${
              biopsyType === "LUNG" 
                ? "bg-[#8B5CF6] text-[#FAFAFA] border-[#8B5CF6]" 
                : "bg-[#09090B] text-[#A1A1AA] border-[#27272A] hover:bg-[#27272A]"
            }`}
          >
            <RefreshCcw className="w-3 h-3" /> Lung Adenocarcinoma Spec
          </button>
          
          <button 
            onClick={() => handleRegenerateSpec("PANCREATIC")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-colors ${
              biopsyType === "PANCREATIC" 
                ? "bg-[#8B5CF6] text-[#FAFAFA] border-[#8B5CF6]" 
                : "bg-[#09090B] text-[#A1A1AA] border-[#27272A] hover:bg-[#27272A]"
            }`}
          >
            <RefreshCcw className="w-3 h-3" /> Cold Pancreatic Stromal Tumor
          </button>

          <button 
            onClick={() => handleRegenerateSpec("COLORECTAL")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-colors ${
              biopsyType === "COLORECTAL" 
                ? "bg-[#8B5CF6] text-[#FAFAFA] border-[#8B5CF6]" 
                : "bg-[#09090B] text-[#A1A1AA] border-[#27272A] hover:bg-[#27272A]"
            }`}
          >
            <RefreshCcw className="w-3 h-3" /> Hot Colorectal MSI-H Section
          </button>
        </div>

        {/* Sliders & Filter Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-[#A1A1AA] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#8B5CF6]" />
                Spatial Resolution
              </span>
              <span className="text-[#8B5CF6] font-bold">{spotResolution} µm</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="55"
              step="0.5"
              value={spotResolution}
              onChange={(e) => setSpotResolution(Number(e.target.value))}
              className="w-full accent-[#8B5CF6] bg-[#27272A] h-1.5 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] text-[#71717A]">
              Subcellular (0.5µm) to Visium Spot (55µm)
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-mono text-[#A1A1AA] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#22D3EE]" />
              Microenvironment Overlay Filter
            </span>
            <div className="flex gap-1.5 bg-[#09090B] p-1 rounded-xl border border-[#27272A]">
              {(["ALL", "TUMOR", "TEX", "CAF"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveCellFilter(filter)}
                  className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-mono transition-colors ${
                    activeCellFilter === filter
                      ? "bg-[#27272A] text-[#FAFAFA] font-bold border border-[#3F3F46]"
                      : "text-[#71717A] hover:text-[#A1A1AA]"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 justify-center bg-[#09090B] border border-[#27272A] p-3 rounded-xl font-mono text-[10px]">
            <div className="flex justify-between">
              <span className="text-[#71717A]">Active Specimen Type:</span>
              <span className="text-[#8B5CF6] font-bold">{biopsyType} BIOPSY</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#71717A]">Ligand-Receptor Pair:</span>
              <span className="text-[#10B981] font-bold">PD-L1 :: PD-1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 2D Spatial Spot Grid */}
        <div className="lg:col-span-7 bg-[#18181B] border border-[#27272A] rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
            <span className="text-xs font-mono font-bold text-[#A1A1AA] uppercase flex items-center gap-2">
              <Grid className="w-4 h-4 text-[#8B5CF6]" />
              Spatial Coordinates Grid (6x6 Spot Array)
            </span>
            <span className="text-[10px] font-mono text-[#71717A]">
              Selected: {selectedSpot.id} ({selectedSpot.region})
            </span>
          </div>

          <div className="grid grid-cols-6 gap-2 bg-[#09090B] p-4 rounded-xl border border-[#27272A] aspect-square max-w-[420px] mx-auto w-full items-center justify-center">
            {activeSpots.map((spot) => {
              const isSelected = selectedSpot.id === spot.id;
              
              let bgColor = "bg-[#27272A]";
              let displayVal = spot.id.replace("SPOT-", "S");

              // Calculate density color intensity based on active cell filter overlay
              if (activeCellFilter === "TUMOR") {
                const op = Math.round(spot.tumorFraction * 100);
                bgColor = `bg-red-500/` + (op > 75 ? "80" : op > 40 ? "50" : op > 15 ? "25" : "10");
                displayVal = `${(spot.tumorFraction * 100).toFixed(0)}%`;
              } else if (activeCellFilter === "TEX") {
                const op = Math.round(spot.tExhaustedFraction * 100);
                bgColor = `bg-emerald-500/` + (op > 75 ? "80" : op > 40 ? "50" : op > 15 ? "25" : "10");
                displayVal = `${(spot.tExhaustedFraction * 100).toFixed(0)}%`;
              } else if (activeCellFilter === "CAF") {
                const op = Math.round(spot.cafFraction * 100);
                bgColor = `bg-purple-500/` + (op > 75 ? "80" : op > 40 ? "50" : op > 15 ? "25" : "10");
                displayVal = `${(spot.cafFraction * 100).toFixed(0)}%`;
              } else {
                // Default regional coloring
                if (spot.region === "Tumor Core") bgColor = "bg-[#EF4444]/30 border-[#EF4444]/60";
                else if (spot.region === "Invasive Margin") bgColor = "bg-[#F59E0B]/30 border-[#F59E0B]/60";
                else if (spot.region === "Tertiary Lymphoid") bgColor = "bg-[#10B981]/30 border-[#10B981]/60";
                else if (spot.region === "Stroma/CAF") bgColor = "bg-[#8B5CF6]/30 border-[#8B5CF6]/60";
              }

              return (
                <button
                  key={spot.id}
                  onClick={() => setSelectedSpot(spot)}
                  className={`aspect-square rounded-lg border flex flex-col items-center justify-center p-1 transition-all text-[9px] font-mono ${bgColor} ${
                    isSelected ? "ring-2 ring-[#22D3EE] scale-105 z-10 font-bold text-[#FAFAFA]" : "hover:opacity-100 opacity-80"
                  }`}
                >
                  <span className="truncate">{displayVal}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-4 text-[10px] font-mono text-[#A1A1AA] pt-2 border-t border-[#27272A]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#EF4444]/50 border border-[#EF4444]" /> Tumor Core
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#F59E0B]/50 border border-[#F59E0B]" /> Margin
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#10B981]/50 border border-[#10B981]" /> TLS Zone
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#8B5CF6]/50 border border-[#8B5CF6]" /> Stroma
            </span>
          </div>
        </div>

        {/* Spot Inspection Panel */}
        <div className="lg:col-span-5 bg-[#18181B] border border-[#27272A] rounded-2xl p-5 flex flex-col gap-4 justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#27272A] pb-3 mb-3">
              <div>
                <span className="text-[10px] font-mono text-[#8B5CF6] uppercase font-bold">
                  Spot Deconvolution Spec: {currentSpot.id}
                </span>
                <h3 className="text-sm font-bold text-[#FAFAFA]">
                  {currentSpot.region}
                </h3>
              </div>
              <MapPin className="w-5 h-5 text-[#8B5CF6]" />
            </div>

            <div className="flex flex-col gap-3 font-mono text-[11px]">
              <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-3 flex flex-col gap-1">
                <span className="text-[10px] text-[#71717A] uppercase">Dominant Cell Phenotype</span>
                <span className="text-xs font-bold text-[#22D3EE]">{currentSpot.dominantCell}</span>
              </div>

              <div className="flex flex-col gap-2 bg-[#09090B] border border-[#27272A] rounded-xl p-3">
                <span className="text-[10px] text-[#71717A] uppercase">Deconvoluted Proportions</span>
                
                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span>Tumor Fraction</span>
                    <span className="text-[#EF4444] font-bold">{(currentSpot.tumorFraction * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-[#27272A] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#EF4444] h-full transition-all duration-300" style={{ width: `${currentSpot.tumorFraction * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span>CD8+ T Exhausted</span>
                    <span className="text-[#10B981] font-bold">{(currentSpot.tExhaustedFraction * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-[#27272A] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#10B981] h-full transition-all duration-300" style={{ width: `${currentSpot.tExhaustedFraction * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span>Stroma / CAF</span>
                    <span className="text-[#8B5CF6] font-bold">{(currentSpot.cafFraction * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-[#27272A] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#8B5CF6] h-full transition-all duration-300" style={{ width: `${currentSpot.cafFraction * 100}%` }} />
                  </div>
                </div>
              </div>

              <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-3 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-[#71717A] uppercase block">PD-L1 Normalized Expression</span>
                  <span className="text-sm font-bold text-[#F59E0B]">{currentSpot.pdl1Expression} log2(TPM+1)</span>
                </div>
                <span className={`text-[9px] font-bold px-2 py-1 rounded-lg ${
                  currentSpot.pdl1Expression > 5.0 
                    ? "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30" 
                    : "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30"
                }`}>
                  {currentSpot.pdl1Expression > 5.0 ? "IMMUNE CHECKPOINT HIGH" : "SUITABLE_REACTION"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-3 text-[10px] text-[#71717A]">
            Cell2location deconvolution matches transcript sequences directly to single-cell references.
          </div>
        </div>

      </div>

      {/* Interactive Microenvironment Immunotherapy Modeler */}
      <div className="bg-[#18181B] border border-[#8B5CF6]/30 rounded-2xl p-6 flex flex-col gap-4 mt-2">
        <div className="flex items-center gap-2.5 border-b border-[#27272A] pb-3">
          <Zap className="w-4 h-4 text-[#8B5CF6]" />
          <h3 className="text-sm font-bold text-[#FAFAFA]">Interactive Tumor Microenvironment Therapy Modeler</h3>
        </div>
        <p className="text-xs text-[#A1A1AA] leading-relaxed">
          Inject synthetic clinical formulations into the biopsy section to simulate how check-point inhibitors, receptor blockades, and engineered CAR-T immunotherapies reprogram spatial cell compositions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-1">
          {/* Therapy 1 */}
          <button
            onClick={() => setTreatmentPD1(!treatmentPD1)}
            className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
              treatmentPD1 
                ? "bg-[#10B981]/10 border-[#10B981] text-[#FAFAFA]" 
                : "bg-[#09090B] border-[#27272A] text-[#A1A1AA] hover:bg-[#18181B]"
            }`}
          >
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-none ${
              treatmentPD1 ? "bg-[#10B981] border-[#10B981]" : "border-[#3F3F46]"
            }`}>
              {treatmentPD1 && <Check className="w-3 h-3 text-[#09090B] stroke-[3]" />}
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-bold text-xs">Anti-PD-L1 Monoclonal Antibody</span>
              <span className="text-[10px] text-[#71717A] font-mono">Convert exhausted PD1+ CD8+ T-cells and reduce immune evasion.</span>
            </div>
          </button>

          {/* Therapy 2 */}
          <button
            onClick={() => setTreatmentCART(!treatmentCART)}
            className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
              treatmentCART 
                ? "bg-[#22D3EE]/10 border-[#22D3EE] text-[#FAFAFA]" 
                : "bg-[#09090B] border-[#27272A] text-[#A1A1AA] hover:bg-[#18181B]"
            }`}
          >
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-none ${
              treatmentCART ? "bg-[#22D3EE] border-[#22D3EE]" : "border-[#3F3F46]"
            }`}>
              {treatmentCART && <Check className="w-3 h-3 text-[#09090B] stroke-[3]" />}
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-bold text-xs">Engineered TCR / CAR-T Infusion</span>
              <span className="text-[10px] text-[#71717A] font-mono">Infuse custom-targeted cytotoxic T-cells to aggressively clear the Tumor Core.</span>
            </div>
          </button>

          {/* Therapy 3 */}
          <button
            onClick={() => setTreatmentCAF(!treatmentCAF)}
            className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
              treatmentCAF 
                ? "bg-[#8B5CF6]/10 border-[#8B5CF6] text-[#FAFAFA]" 
                : "bg-[#09090B] border-[#27272A] text-[#A1A1AA] hover:bg-[#18181B]"
            }`}
          >
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-none ${
              treatmentCAF ? "bg-[#8B5CF6] border-[#8B5CF6]" : "border-[#3F3F46]"
            }`}>
              {treatmentCAF && <Check className="w-3 h-3 text-[#09090B] stroke-[3]" />}
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-bold text-xs">FAP Fibroblast Core Inhibitor</span>
              <span className="text-[10px] text-[#71717A] font-mono">Inhibit cancer-associated fibroblast matrix production to unlock cold stroma.</span>
            </div>
          </button>
        </div>
      </div>

    </div>
  );
}
