import { useState } from "react";
import { Terminal, Server, Lock, Play, Loader2, CheckCircle2, Sparkles, Send, FileCode } from "lucide-react";

interface Props {
  activeMode?: string;
}

export function AgentAPI({ activeMode = "reference_free" }: Props) {
  const [status, setStatus] = useState<"IDLE" | "QUEUED" | "RUNNING" | "COMPLETED">("IDLE");
  const [serverResponse, setServerResponse] = useState<any>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const runSim = async () => {
    if (status !== "IDLE") return;
    setStatus("QUEUED");
    setServerResponse(null);

    setTimeout(() => setStatus("RUNNING"), 400);

    try {
      const res = await fetch("/agent/v1/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipe_id: "scrna_sctransform_v2",
          steps: [
            { id: "bio-validate", acceptedInputs: ["raw_h5ad"], providedOutputs: ["DataContract_v1"] },
            { id: "bio-batchcorrect", acceptedInputs: ["DataContract_v1"], providedOutputs: ["DataContract_v1"] },
            { id: "bio-report", acceptedInputs: ["DataContract_v1"], providedOutputs: ["Report"] }
          ],
          mode: activeMode
        })
      });

      const data = await res.json();
      setServerResponse(data);
      setStatus("COMPLETED");
    } catch (err) {
      console.error("Server API error:", err);
      setServerResponse({ error: "Failed to connect to agent server endpoint." });
      setStatus("COMPLETED");
    }

    setTimeout(() => setStatus("IDLE"), 10000);
  };

  const handleAiQuery = async () => {
    if (!aiPrompt.trim() || isAiLoading) return;
    setIsAiLoading(true);
    setAiResponse(null);

    try {
      const res = await fetch("/agent/v1/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiPrompt,
          context: { activeMode, dataContract: "DataContract_v1" }
        })
      });
      const data = await res.json();
      setAiResponse(data.response || JSON.stringify(data, null, 2));
    } catch (err: any) {
      setAiResponse(`[Client Error] Failed to reach agent query endpoint: ${err.message}`);
    } finally {
      setIsAiLoading(false);
    }
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
    <div className="flex flex-col gap-6">
      {/* Top API Endpoints + Terminal Demo */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Endpoints List */}
        <div className="lg:col-span-4 bg-[#09090B] border border-[#27272A] rounded-xl p-5 flex flex-col gap-4">
          <h3 className="text-xs font-bold text-[#FAFAFA] uppercase tracking-widest flex items-center gap-2 mb-2">
            <Server className="w-4 h-4 text-[#10B981]" />
            Agent Core Endpoints
          </h3>
          
          <div className="flex flex-col gap-2">
            {[
              { method: "POST", path: "/agent/v1/execute", desc: "Execute dry-run & compile Nextflow/Snakemake" },
              { method: "POST", path: "/agent/v1/validate-dag", desc: "Verify topological DAG contract validity" },
              { method: "POST", path: "/agent/v1/query", desc: "Query Gemini AI Agent for pipeline reasoning" },
              { method: "GET", path: "/agent/v1/components", desc: "Fetch components & PyPI package mappings" },
              { method: "GET", path: "/agent/v1/health", desc: "Check server status & engine readiness" },
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

        {/* Live Code Request & Real Express Response Terminal */}
        <div className="lg:col-span-8 bg-[#18181B] border border-[#27272A] rounded-xl overflow-hidden flex flex-col relative min-h-[350px]">
          <div className="bg-[#27272A]/50 px-4 py-3 border-b border-[#27272A] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#A1A1AA]" />
              <span className="text-[10px] font-mono text-[#71717A]">POST /agent/v1/execute (LIVE BACKEND)</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-[#10B981] bg-[#10B981]/10 px-2 py-1 rounded border border-[#10B981]/30">
              <Lock className="w-3 h-3" />
              server_port: 3000
            </div>
          </div>
          <div className="p-5 flex-grow font-mono text-[11px] leading-relaxed text-[#A1A1AA] overflow-x-auto">
            <pre><code>{payloadStr}</code></pre>
            
            {status !== "IDLE" && (
              <div className="mt-4 pt-4 border-t border-[#27272A]">
                <div className="text-[#10B981] font-bold mb-2">// REAL EXPRESS SERVER RESPONSE</div>
                <pre className="text-[#22D3EE] bg-[#09090B] p-3 rounded-lg border border-[#27272A] max-h-60 overflow-y-auto">
                  <code>{serverResponse ? JSON.stringify(serverResponse, null, 2) : `{\n  "status": "${status}",\n  "message": "Connecting to Express server on port 3000..."\n}`}</code>
                </pre>
              </div>
            )}
          </div>

          {/* Action Button for Simulation */}
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
              {status === "IDLE" && <><Play className="w-3.5 h-3.5" /> Execute Agent Endpoint</>}
              {status === "QUEUED" && <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending Request...</>}
              {status === "RUNNING" && <><Loader2 className="w-3.5 h-3.5 animate-spin text-[#22D3EE]" /> <span className="text-[#22D3EE]">Processing Server DAG...</span></>}
              {status === "COMPLETED" && <><CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" /> <span className="text-[#10B981]">Response Received</span></>}
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Gemini AI Pipeline Assistant Box */}
      <div className="bg-[#09090B] border border-[#27272A] rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#22D3EE]" />
            <h3 className="text-sm font-bold text-[#FAFAFA]">Interactive Gemini AI Pipeline Assistant</h3>
          </div>
          <span className="text-[10px] font-mono text-[#22D3EE] bg-[#22D3EE]/10 px-2.5 py-1 rounded-full border border-[#22D3EE]/30 font-bold">
            GEMINI 3.6 FLASH BACKEND
          </span>
        </div>

        {/* Quick Example Query Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] text-[#71717A] uppercase font-mono font-bold">Example Queries:</span>
          {[
            "How do I structure a Banff 2023 compliant data contract?",
            "Compare Harmony vs scVI batch integration in Scanpy",
            "How is Reproducibility Debt (RpD) calculated?",
            "What packages are needed for RO-Crate provenance?"
          ].map((query, idx) => (
            <button
              key={idx}
              onClick={() => {
                setAiPrompt(query);
              }}
              className="text-[10px] bg-[#18181B] hover:bg-[#27272A] text-[#A1A1AA] hover:text-[#FAFAFA] px-2.5 py-1 rounded-lg border border-[#27272A] transition-colors font-mono"
            >
              {query}
            </button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAiQuery()}
            placeholder="Ask AI agent: e.g. How do I construct a Banff 2023 compliant data contract using MuData?"
            className="flex-1 bg-[#18181B] border border-[#27272A] text-[#FAFAFA] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#22D3EE] font-mono"
          />
          <button
            onClick={handleAiQuery}
            disabled={isAiLoading || !aiPrompt.trim()}
            className="px-5 py-2.5 bg-[#22D3EE] text-[#09090B] font-bold text-xs rounded-xl hover:bg-[#06b6d4] transition-all flex items-center justify-center gap-2 disabled:opacity-50 flex-none cursor-pointer"
          >
            {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {isAiLoading ? "Asking Gemini..." : "Send to Agent"}
          </button>
        </div>

        {aiResponse && (
          <div className="bg-[#18181B] border border-[#22D3EE]/30 rounded-xl p-4 font-mono text-xs text-[#FAFAFA] flex flex-col gap-2">
            <span className="text-[10px] text-[#22D3EE] uppercase font-bold">Agent Insight Output:</span>
            <div className="whitespace-pre-wrap leading-relaxed text-[#A1A1AA]">{aiResponse}</div>
          </div>
        )}
      </div>
    </div>
  );
}
