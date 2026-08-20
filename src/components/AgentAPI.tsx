import { useState } from "react";
import { Terminal, Server, Lock, Play, Loader2, CheckCircle2 } from "lucide-react";

interface Props {
  activeMode?: string;
}

export function AgentAPI({ activeMode = "reference_free" }: Props) {
  const [status, setStatus] = useState<"IDLE" | "QUEUED" | "RUNNING" | "COMPLETED">("IDLE");

  const runSim = () => {
    if (status !== "IDLE") return;
    setStatus("QUEUED");
    setTimeout(() => setStatus("RUNNING"), 1200);
    setTimeout(() => setStatus("COMPLETED"), 4000);
    setTimeout(() => setStatus("IDLE"), 8000);
  };

  const payloadStr = `{
  "recipe_id": "scrna_sctransform_v2",
  "data_contract_ref": "sha256:9f86d081884c7d659a2feaa0c55ad015...",
  "execution_context": {
    "deterministic_mode": true,
    "enforce_pinned_digests": true,
    "seed": 42
  },
  "parameters": {
    "mode": "${activeMode}",
    "evaluate_cross_platform": true
  }
}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Endpoints List */}
      <div className="lg:col-span-4 bg-[#09090B] border border-[#27272A] rounded-xl p-5 flex flex-col gap-4">
        <h3 className="text-xs font-bold text-[#FAFAFA] uppercase tracking-widest flex items-center gap-2 mb-2">
          <Server className="w-4 h-4 text-[#10B981]" />
          Agent Core Endpoints
        </h3>
        
        <div className="flex flex-col gap-2">
          {[
            { method: "POST", path: "/agent/v1/run", desc: "Execute locked pipeline recipes" },
            { method: "GET", path: "/agent/v1/jobs", desc: "Poll deterministic execution status" },
            { method: "GET", path: "/agent/v1/recipes", desc: "Fetch agent-readable schemas" },
            { method: "POST", path: "/agent/v1/explain", desc: "Generate CURE counterfactuals" },
            { method: "GET", path: "/agent/v1/provenance", desc: "Retrieve RO-Crate manifests" },
          ].map((ep, i) => (
            <div key={i} className="flex flex-col p-3 rounded-lg border border-[#3F3F46] bg-[#18181B] hover:border-[#10B981]/50 transition-colors">
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${ep.method === 'POST' ? 'bg-[#F59E0B]/10 text-[#F59E0B]' : 'bg-[#22D3EE]/10 text-[#22D3EE]'}`}>
                  {ep.method}
                </span>
                <span className="text-xs font-mono text-[#FAFAFA]">{ep.path}</span>
              </div>
              <span className="text-[10px] text-[#A1A1AA]">{ep.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Code Demo */}
      <div className="lg:col-span-8 bg-[#18181B] border border-[#27272A] rounded-xl overflow-hidden flex flex-col relative">
        <div className="bg-[#27272A]/50 px-4 py-3 border-b border-[#27272A] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#A1A1AA]" />
            <span className="text-[10px] font-mono text-[#71717A]">POST /agent/v1/run</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-[#10B981] bg-[#10B981]/10 px-2 py-1 rounded border border-[#10B981]/30">
            <Lock className="w-3 h-3" />
            deterministic: true
          </div>
        </div>
        <div className="p-5 flex-grow font-mono text-[11px] leading-relaxed text-[#A1A1AA] overflow-x-auto">
          <pre><code>{payloadStr}</code></pre>
          
          {status !== "IDLE" && (
            <div className="mt-4 pt-4 border-t border-[#27272A]">
              <div className="text-[#71717A] mb-2">// RESPONSE</div>
              <pre className="text-[#22D3EE]"><code>{`{
  "job_id": "job_01HFWx92pL...",
  "status": "${status}",
${status === "COMPLETED" ? `  "guarantees": {
    "rpd_score": 0.0,
    "checksum_validation": "PASSED"
  }` : `  "progress": "Executing ${activeMode} parameters..."`}
}`}</code></pre>
            </div>
          )}
        </div>

        {/* Floating Action Button for Simulation */}
        <div className="absolute bottom-4 right-4">
          <button 
            onClick={runSim}
            disabled={status !== "IDLE"}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all ${
              status === 'IDLE' 
                ? 'bg-[#10B981] text-[#09090B] hover:bg-[#34D399] shadow-lg shadow-[#10B981]/20' 
                : 'bg-[#27272A] text-[#A1A1AA] cursor-not-allowed border border-[#3F3F46]'
            }`}
          >
            {status === "IDLE" && <><Play className="w-3.5 h-3.5" /> Execute Agent</>}
            {status === "QUEUED" && <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Queued...</>}
            {status === "RUNNING" && <><Loader2 className="w-3.5 h-3.5 animate-spin text-[#22D3EE]" /> <span className="text-[#22D3EE]">Running...</span></>}
            {status === "COMPLETED" && <><CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" /> <span className="text-[#10B981]">Success</span></>}
          </button>
        </div>
      </div>
    </div>
  );
}
