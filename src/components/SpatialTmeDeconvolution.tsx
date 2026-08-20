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
  Dna
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

const spatialSpots: SpatialSpot[] = Array.from({ length: 36 }, (_, i) => {
  const x = i % 6;
  const y = Math.floor(i / 6);
  const distFromCenter = Math.sqrt((x - 2.5) ** 2 + (y - 2.5) ** 2);
  
  let region: SpatialSpot["region"] = "Stroma/CAF";
  if (distFromCenter < 1.2) region = "Tumor Core";
  else if (distFromCenter < 2.3) region = "Invasive Margin";
  else if (x === 0 && y === 0) region = "Tertiary Lymphoid";

  return {
    id: `SPOT-${i + 1}`,
    x,
    y,
    region,
    dominantCell: region === "Tumor Core" ? "Tumor Cell (MKI67+)" : region === "Invasive Margin" ? "CD8+ T Exhausted (PD-1+)" : region === "Tertiary Lymphoid" ? "B-cell / T-cell Zone" : "Cancer-Associated Fibroblast",
    tumorFraction: region === "Tumor Core" ? 0.82 : region === "Invasive Margin" ? 0.45 : 0.05,
    tExhaustedFraction: region === "Invasive Margin" ? 0.38 : region === "Tertiary Lymphoid" ? 0.65 : 0.08,
    cafFraction: region === "Stroma/CAF" ? 0.72 : 0.15,
    pdl1Expression: region === "Invasive Margin" ? 8.4 : region === "Tumor Core" ? 5.2 : 0.9,
  };
});

export function SpatialTmeDeconvolution() {
  const [selectedSpot, setSelectedSpot] = useState<SpatialSpot>(spatialSpots[14]);
  const [spotResolution, setSpotResolution] = useState<number>(10); // micrometers
  const [activeCellFilter, setActiveCellFilter] = useState<"ALL" | "TUMOR" | "TEX" | "CAF">("ALL");

  return (
    <div className="flex flex-col gap-6 w-full text-[#FAFAFA]">
      
      {/* Top Header Controls */}
      <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5 flex flex-col gap-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272A] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
              <span className="text-[10px] font-mono font-bold text-[#8B5CF6] uppercase tracking-wider">
                Spatial Biology & Microenvironment
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
              <span className="text-[#71717A]">Ligand-Receptor Pair:</span>
              <span className="text-[#10B981] font-bold">PD-L1 :: PD-1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#71717A]">Invasive Margin Score:</span>
              <span className="text-[#22D3EE] font-bold">8.42 (High Reactivity)</span>
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
            {spatialSpots.map((spot) => {
              const isSelected = selectedSpot.id === spot.id;
              
              let bgColor = "bg-[#27272A]";
              if (spot.region === "Tumor Core") bgColor = "bg-[#EF4444]/30 border-[#EF4444]/60";
              else if (spot.region === "Invasive Margin") bgColor = "bg-[#F59E0B]/30 border-[#F59E0B]/60";
              else if (spot.region === "Tertiary Lymphoid") bgColor = "bg-[#10B981]/30 border-[#10B981]/60";
              else if (spot.region === "Stroma/CAF") bgColor = "bg-[#8B5CF6]/30 border-[#8B5CF6]/60";

              return (
                <button
                  key={spot.id}
                  onClick={() => setSelectedSpot(spot)}
                  className={`aspect-square rounded-lg border flex flex-col items-center justify-center p-1 transition-all text-[9px] font-mono ${bgColor} ${
                    isSelected ? "ring-2 ring-[#22D3EE] scale-105 z-10 font-bold text-[#FAFAFA]" : "hover:opacity-100 opacity-80"
                  }`}
                >
                  <span>{spot.id.replace("SPOT-", "S")}</span>
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
        <div className="lg:col-span-5 bg-[#18181B] border border-[#27272A] rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
            <div>
              <span className="text-[10px] font-mono text-[#8B5CF6] uppercase font-bold">
                Spot Deconvolution Spec: {selectedSpot.id}
              </span>
              <h3 className="text-sm font-bold text-[#FAFAFA]">
                {selectedSpot.region}
              </h3>
            </div>
            <MapPin className="w-5 h-5 text-[#8B5CF6]" />
          </div>

          <div className="flex flex-col gap-3 font-mono text-[11px]">
            <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-3 flex flex-col gap-1">
              <span className="text-[10px] text-[#71717A] uppercase">Dominant Cell Phenotype</span>
              <span className="text-sm font-bold text-[#22D3EE]">{selectedSpot.dominantCell}</span>
            </div>

            <div className="flex flex-col gap-2 bg-[#09090B] border border-[#27272A] rounded-xl p-3">
              <span className="text-[10px] text-[#71717A] uppercase">Deconvoluted Proportions</span>
              
              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span>Tumor Fraction</span>
                  <span className="text-[#EF4444] font-bold">{(selectedSpot.tumorFraction * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-[#27272A] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#EF4444] h-full" style={{ width: `${selectedSpot.tumorFraction * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span>CD8+ T Exhausted</span>
                  <span className="text-[#10B981] font-bold">{(selectedSpot.tExhaustedFraction * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-[#27272A] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#10B981] h-full" style={{ width: `${selectedSpot.tExhaustedFraction * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span>Stroma / CAF</span>
                  <span className="text-[#8B5CF6] font-bold">{(selectedSpot.cafFraction * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-[#27272A] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#8B5CF6] h-full" style={{ width: `${selectedSpot.cafFraction * 100}%` }} />
                </div>
              </div>
            </div>

            <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-3 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-[#71717A] uppercase block">PD-L1 Normalized Expression</span>
                <span className="text-sm font-bold text-[#F59E0B]">{selectedSpot.pdl1Expression} log2(TPM+1)</span>
              </div>
              <span className="text-[9px] font-bold px-2 py-1 bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30 rounded-lg">
                IMMUNE CHECKPOINT HIGH
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
