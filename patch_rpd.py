import re

# 1. Update types.ts
with open('src/types.ts', 'r') as f:
    types = f.read()

types = types.replace(
"""export interface CrossPlatformMetric {
  id: string;
  protocolA: string;
  protocolB: string;
  concordance: number;
  cellStateCorrelation: number;
  calibrationDrift: number;
}""",
"""export interface CrossPlatformMetric {
  id: string;
  protocolA: string;
  protocolB: string;
  concordance: number;
  cellStateCorrelation: number;
  calibrationDrift: number;
  rpdA: number;
  rpdB: number;
}"""
)
with open('src/types.ts', 'w') as f:
    f.write(types)


# 2. Update data.ts
with open('src/data.ts', 'r') as f:
    data = f.read()

new_cp_data = """export const crossPlatformData: CrossPlatformMetric[] = [
  {
    id: "cp1",
    protocolA: "Standard RNA-seq (Poly-A)",
    protocolB: "Low-input Total RNA (Ribo-Zero)",
    concordance: 0.96,
    cellStateCorrelation: 0.94,
    calibrationDrift: 0.015,
    rpdA: 0.00,
    rpdB: 0.05,
  },
  {
    id: "cp2",
    protocolA: "Baseline cfDNA Extraction",
    protocolB: "Fragmentia-AI cfDNA Var",
    concordance: 0.92,
    cellStateCorrelation: 0.88,
    calibrationDrift: 0.042,
    rpdA: 0.00,
    rpdB: 0.12,
  },
  {
    id: "cp3",
    protocolA: "10x Genomics 3' v3.1",
    protocolB: "Parse Biosciences Evercode",
    concordance: 0.89,
    cellStateCorrelation: 0.82,
    calibrationDrift: 0.065,
    rpdA: 0.00,
    rpdB: 0.08,
  }
];"""
data = re.sub(r'export const crossPlatformData: CrossPlatformMetric\[\] = \[.*?\];', new_cp_data, data, flags=re.DOTALL)

new_rpd_data = """export const rpdData: RpdFactor[] = [
  {
    id: "digest",
    name: "Missing Container Digest",
    impact: 0.0,
    status: "pass",
    description: "Docker/Singularity image is strictly identified by SHA-256 digest."
  },
  {
    id: "deps",
    name: "Unpinned Dependencies",
    impact: 0.05,
    status: "warn",
    description: "requirements.txt used, but missing exact hashes for sub-dependencies."
  },
  {
    id: "nondeterministic",
    name: "Non-Deterministic Steps",
    impact: 0.0,
    status: "pass",
    description: "PyTorch backends configured with use_deterministic_algorithms(True)."
  },
  {
    id: "seeds",
    name: "Absent Random Seeds",
    impact: 0.0,
    status: "pass",
    description: "Explicit seeds provided to all stochastic operations."
  },
  {
    id: "metadata",
    name: "Incomplete Metadata",
    impact: 0.0,
    status: "pass",
    description: "ComponentManifest completely populated with governance data."
  },
  {
    id: "tests",
    name: "Lack of Unit Tests",
    impact: 0.07,
    status: "fail",
    description: "Component tests cover < 80% of critical branching logic."
  }
];"""
data = re.sub(r'export const rpdData: RpdFactor\[\] = \[.*?\];', new_rpd_data, data, flags=re.DOTALL)

with open('src/data.ts', 'w') as f:
    f.write(data)

# 3. Update CrossPlatformBench.tsx
with open('src/components/CrossPlatformBench.tsx', 'r') as f:
    cp = f.read()

old_td = """                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <TestTube2 className="w-3 h-3 text-[#52525B] group-hover:text-[#FAFAFA] transition-colors" />
                          <span className="text-xs font-bold text-[#FAFAFA]">{metric.protocolA}</span>
                        </div>
                        <div className="flex items-center gap-2 pl-5">
                          <span className="text-[10px] font-mono text-[#71717A]">vs</span>
                          <span className="text-xs text-[#A1A1AA]">{metric.protocolB}</span>
                        </div>
                      </div>
                    </td>"""

new_td = """                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <TestTube2 className="w-3.5 h-3.5 text-[#52525B] group-hover:text-[#FAFAFA] transition-colors shrink-0" />
                          <span className="text-xs font-bold text-[#FAFAFA]">{metric.protocolA}</span>
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${metric.rpdA > 0 ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30' : 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30'}`}>
                            RpD: {metric.rpdA.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 pl-6">
                          <span className="text-[10px] font-mono text-[#71717A] shrink-0">vs</span>
                          <span className="text-xs text-[#A1A1AA]">{metric.protocolB}</span>
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${metric.rpdB > 0 ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30' : 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30'}`}>
                            RpD: {metric.rpdB.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </td>"""

cp = cp.replace(old_td, new_td)

with open('src/components/CrossPlatformBench.tsx', 'w') as f:
    f.write(cp)
