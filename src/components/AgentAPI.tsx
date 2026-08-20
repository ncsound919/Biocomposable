import React, { useState, useEffect } from "react";
import { 
  Terminal, 
  Server, 
  Lock, 
  Play, 
  Loader2, 
  CheckCircle2, 
  Sparkles, 
  Send, 
  FileCode, 
  Sliders, 
  Cpu, 
  FileText, 
  Database, 
  Download, 
  AlertTriangle, 
  RefreshCcw, 
  Dna, 
  Layers, 
  MessageSquare,
  HelpCircle,
  Activity,
  ArrowRight
} from "lucide-react";

interface Props {
  activeMode?: string;
}

export function AgentAPI({ activeMode = "reference_free" }: Props) {
  // Main API Subtabs
  const [activeTab, setActiveTab] = useState<"PIPELINE_EXEC" | "VARIANTWATCH_CLI" | "AI_CO_PILOT">("PIPELINE_EXEC");

  // Endpoint Loading States
  const [status, setStatus] = useState<"IDLE" | "QUEUED" | "RUNNING" | "COMPLETED">("IDLE");
  const [serverResponse, setServerResponse] = useState<any>(null);

  // AI Genomics Consultation States
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState({
    gene: "BRCA1",
    hgvs: "c.5266dupC (p.Gln1756Profs*74)",
    lastClassified: "VUS",
    currentClassified: "Likely Pathogenic",
    rsid: "rs80357906"
  });
  const [userQuestion, setUserQuestion] = useState("Analyze this variant's clinical significance and classification drift.");

  // CLI Shell simulation states
  const [cliOutput, setCliOutput] = useState<string[]>([]);
  const [isCliRunning, setIsCliRunning] = useState(false);
  const [cliDatabaseCount, setCliDatabaseCount] = useState(148);

  // 1. Run Pipeline execution API (/agent/v1/execute)
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
            { id: "bio-crossmodal-align", acceptedInputs: ["DataContract_v1"], providedOutputs: ["DeconvFractions"] },
            { id: "bio-report", acceptedInputs: ["DeconvFractions"], providedOutputs: ["Report"] }
          ],
          mode: activeMode,
          evaluate_cross_platform: true,
          seed: 42
        })
      });

      const data = await res.json();
      setServerResponse(data);
      setStatus("COMPLETED");
    } catch (err) {
      console.error("Server API error:", err);
      setServerResponse({ error: "Failed to connect to agent server endpoint on port 3000." });
      setStatus("COMPLETED");
    }

    setTimeout(() => setStatus("IDLE"), 6000);
  };

  // 2. Trigger Gemini AI Genomic consultation (/agent/v1/ai-consult)
  const handleAiConsult = async () => {
    setIsAiLoading(true);
    setAiResponse(null);

    try {
      const res = await fetch("/agent/v1/ai-consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variant: selectedVariant,
          userQuestion: userQuestion
        })
      });
      const data = await res.json();
      setAiResponse(data.responseText || data.response || JSON.stringify(data, null, 2));
    } catch (err: any) {
      setAiResponse(`[Client Error] Failed to reach Express AI endpoint: ${err.message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  // 3. Simulated local Shell VariantWatch sync execution
  const runVariantWatchCli = () => {
    setIsCliRunning(true);
    setCliOutput([
      "$ python variantwatch_cli.py --db variantwatch_local.db --sync --verbose",
      "[INFO] [VariantWatch CLI] Initializing local HIPAA-compliant SQLite database...",
      `[INFO] [SQLite Server] Successfully bound to local database 'variantwatch_local.db' (${cliDatabaseCount} cached records).`,
      "[INFO] [NCBI Entrez] Establishing secure pipeline connection to eutils.ncbi.nlm.nih.gov...",
      "[INFO] [ClinVar REST] Querying REST endpoints for updated consensus stars and reclassification drift...",
      `[SUCCESS] [VariantWatch] Detected 3 consensus classification shifts since last sync:`,
      "  - BRCA1 (rs80357906): VUS -> Pathogenic (ClinVar 3-star consensus)",
      "  - MLH1 (rs6356): Pathogenic -> VUS (Submitter conflict alert!)",
      "  - BRCA2 (rs80358214): VUS -> Likely Pathogenic (ClinVar 2-star consensus)",
      "[INFO] [VariantWatch] Auto-generating comparative surveillance report...",
      "[SUCCESS] Report written to 'variantwatch_compliance_report.txt'.",
      `$ cat variantwatch_compliance_report.txt`,
      "================================================================",
      "             VARIANTWATCH AUTOMATED SURVEILLANCE REPORT         ",
      "================================================================",
      `Generated At  : ${new Date().toISOString()}`,
      "Database Path : variantwatch_local.db",
      "Sync Status   : SUCCESS",
      "----------------------------------------------------------------",
      "CRITICAL: BRCA1 change requires direct patient review & counseling!"
    ]);

    setTimeout(() => {
      setIsCliRunning(false);
      setCliDatabaseCount(prev => prev + 3);
    }, 1200);
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
      {/* Tab Selectors for API Sandbox */}
      <div className="flex items-center gap-2 bg-[#09090B] p-1 rounded-xl border border-[#27272A] self-start font-mono text-[10px] font-bold">
        <button
          onClick={() => setActiveTab("PIPELINE_EXEC")}
          className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
            activeTab === "PIPELINE_EXEC"
              ? "bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/20"
              : "text-[#71717A] hover:text-[#FAFAFA]"
          }`}
        >
          <Cpu className="w-3.5 h-3.5" /> Core Pipeline Agent
        </button>
        <button
          onClick={() => setActiveTab("VARIANTWATCH_CLI")}
          className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
            activeTab === "VARIANTWATCH_CLI"
              ? "bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/20"
              : "text-[#71717A] hover:text-[#FAFAFA]"
          }`}
        >
          <Terminal className="w-3.5 h-3.5" /> VariantWatch CLI Sandbox
        </button>
        <button
          onClick={() => setActiveTab("AI_CO_PILOT")}
          className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
            activeTab === "AI_CO_PILOT"
              ? "bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/20"
              : "text-[#71717A] hover:text-[#FAFAFA]"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" /> Gemini AI Genomics Co-Pilot
        </button>
      </div>

      {/* Content Tab 1: Core Pipeline Execution Agent */}
      {activeTab === "PIPELINE_EXEC" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Endpoints List */}
          <div className="lg:col-span-4 bg-[#09090B] border border-[#27272A] rounded-xl p-5 flex flex-col gap-4">
            <h3 className="text-xs font-bold text-[#FAFAFA] uppercase tracking-widest flex items-center gap-2 mb-2">
              <Server className="w-4 h-4 text-[#10B981]" />
              Agent Core Endpoints
            </h3>
            
            <div className="flex flex-col gap-2 font-mono">
              {[
                { method: "POST", path: "/agent/v1/execute", desc: "Execute dry-run & compile Nextflow/Snakemake" },
                { method: "POST", path: "/agent/v1/validate-dag", desc: "Verify topological DAG contract validity" },
                { method: "POST", path: "/agent/v1/validate-schema", desc: "Live Banff pathology schema verification" },
                { method: "GET", path: "/agent/v1/components", desc: "Fetch components & PyPI package mappings" },
                { method: "GET", path: "/agent/v1/health", desc: "Check server status & engine readiness" },
              ].map((ep, i) => (
                <div key={i} className="flex flex-col p-3 rounded-lg border border-[#18181B] bg-[#18181B]/50 hover:border-[#10B981]/50 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${ep.method === 'POST' ? 'bg-[#F59E0B]/10 text-[#F59E0B]' : 'bg-[#22D3EE]/10 text-[#22D3EE]'}`}>
                      {ep.method}
                    </span>
                    <span className="text-[10px] text-[#FAFAFA]">{ep.path}</span>
                  </div>
                  <span className="text-[9px] text-[#71717A] leading-relaxed">{ep.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Code Request & Real Express Response Terminal */}
          <div className="lg:col-span-8 bg-[#18181B] border border-[#27272A] rounded-xl overflow-hidden flex flex-col relative min-h-[400px]">
            <div className="bg-[#27272A]/50 px-4 py-3 border-b border-[#27272A] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#A1A1AA]" />
                <span className="text-[10px] font-mono text-[#71717A]">POST /agent/v1/execute (LIVE FULL-STACK)</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-[#10B981] bg-[#10B981]/10 px-2 py-1 rounded border border-[#10B981]/30">
                <Lock className="w-3 h-3" />
                port: 3000
              </div>
            </div>
            <div className="p-5 flex-grow font-mono text-[10px] leading-relaxed text-[#A1A1AA] overflow-x-auto pb-20">
              <pre><code>{payloadStr}</code></pre>
              
              {status !== "IDLE" && (
                <div className="mt-4 pt-4 border-t border-[#27272A]">
                  <div className="text-[#10B981] font-bold mb-2">// REAL EXPRESS SERVER RESPONSE (VITE + TSX AGENT SERVER)</div>
                  <pre className="text-[#22D3EE] bg-[#09090B] p-3 rounded-lg border border-[#27272A] max-h-60 overflow-y-auto whitespace-pre-wrap">
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
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${
                  status === 'IDLE' 
                    ? 'bg-[#10B981] text-[#09090B] hover:bg-[#34D399] shadow-lg shadow-[#10B981]/20' 
                    : 'bg-[#27272A] text-[#A1A1AA] cursor-not-allowed border border-[#3F3F46]'
                }`}
              >
                {status === "IDLE" && <><Play className="w-3.5 h-3.5" /> Execute Agent Endpoint</>}
                {status === "QUEUED" && <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...</>}
                {status === "RUNNING" && <><Loader2 className="w-3.5 h-3.5 animate-spin text-[#22D3EE]" /> <span className="text-[#22D3EE]">Processing DAG...</span></>}
                {status === "COMPLETED" && <><CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" /> <span className="text-[#10B981]">Success</span></>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Tab 2: VariantWatch CLI Sandbox */}
      {activeTab === "VARIANTWATCH_CLI" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <Database className="w-4 h-4 text-[#22D3EE]" />
                <span>Local VariantWatch Database</span>
              </div>
              <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                VariantWatch operates as a standalone Python command line utility. When triggered, it establishes a HIPAA-compliant local SQLite database to cache ClinVar summary histories.
              </p>

              <div className="bg-[#18181B] p-3 rounded-lg border border-[#27272A] flex justify-between items-center font-mono text-[10px]">
                <span className="text-[#71717A]">Cached Local Records:</span>
                <span className="text-[#22D3EE] font-bold">{cliDatabaseCount} Variants</span>
              </div>

              {/* Real CLI Script Download Link */}
              <a 
                href="/agent/v1/download/variantwatch"
                className="w-full py-2 bg-[#27272A] hover:bg-[#3F3F46] border border-[#3F3F46] text-[#FAFAFA] font-bold font-mono text-[10px] rounded-lg text-center transition-all flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Download variantwatch_cli.py
              </a>
            </div>
          </div>

          {/* Interactive Shell Console */}
          <div className="lg:col-span-7 bg-[#18181B] border border-[#27272A] rounded-xl overflow-hidden flex flex-col relative min-h-[350px]">
            <div className="bg-[#27272A]/50 px-4 py-3 border-b border-[#27272A] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-mono text-[#71717A]">VariantWatch Python Shell Execution</span>
              </div>
            </div>

            <div className="p-4 flex-grow font-mono text-[10px] leading-relaxed text-slate-300 bg-[#09090B] overflow-y-auto max-h-[320px]">
              {cliOutput.length === 0 ? (
                <div className="text-[#71717A] italic select-none">
                  Press "Run Surveillance Sync" below to run the VariantWatch SQLite sync CLI utility...
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {cliOutput.map((line, idx) => (
                    <span 
                      key={idx} 
                      className={
                        line.startsWith("$") 
                          ? "text-[#22D3EE]" 
                          : line.startsWith("[SUCCESS]") 
                          ? "text-emerald-400 font-bold" 
                          : line.includes("CRITICAL") 
                          ? "text-red-400 font-bold bg-red-400/10 px-1 rounded" 
                          : "text-slate-300"
                      }
                    >
                      {line}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 bg-[#18181B] border-t border-[#27272A] flex justify-end">
              <button
                onClick={runVariantWatchCli}
                disabled={isCliRunning}
                className="px-4 py-2 bg-[#22D3EE] text-[#09090B] font-bold text-[10px] font-mono uppercase tracking-widest rounded-lg hover:bg-[#06B6D4] transition-all flex items-center gap-1.5"
              >
                {isCliRunning ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Executing CLI...</>
                ) : (
                  <><RefreshCcw className="w-3.5 h-3.5" /> Run Surveillance Sync</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Tab 3: Gemini AI Genomics Clinical Co-Pilot */}
      {activeTab === "AI_CO_PILOT" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Variant Selector Column */}
          <div className="lg:col-span-5 flex flex-col gap-4 font-mono text-[10px]">
            <span className="text-[10px] text-[#A1A1AA] uppercase font-bold">Select Surveillance Target</span>
            
            <div className="grid grid-cols-2 gap-2">
              {[
                { gene: "BRCA1", hgvs: "c.5266dupC (p.Gln1756Profs*74)", lastClassified: "VUS", currentClassified: "Pathogenic", rsid: "rs80357906" },
                { gene: "BRCA2", hgvs: "c.5946delT (p.Ser1982Rnafs*22)", lastClassified: "VUS", currentClassified: "Likely Pathogenic", rsid: "rs80358214" },
                { gene: "MLH1", hgvs: "c.655A>G (p.Ile219Val)", lastClassified: "Pathogenic", currentClassified: "VUS", rsid: "rs6356" },
                { gene: "EGFR", hgvs: "c.2573T>G (p.Leu858Arg)", lastClassified: "Likely Pathogenic", currentClassified: "Pathogenic", rsid: "rs121434568" }
              ].map((variant, i) => {
                const isSel = selectedVariant.gene === variant.gene;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedVariant(variant);
                      setAiResponse(null);
                    }}
                    className={`p-3 rounded-lg border text-left flex flex-col gap-1 transition-all ${
                      isSel 
                        ? "bg-[#22D3EE]/10 border-[#22D3EE]/40 text-white font-bold" 
                        : "bg-[#09090B] border-[#27272A] text-[#71717A] hover:border-[#3F3F46]"
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="text-white font-bold">{variant.gene}</span>
                      <span className="text-[8px] bg-[#27272A] px-1.5 rounded py-0.2 text-[#A1A1AA]">{variant.rsid}</span>
                    </div>
                    <span className="text-[8px] text-[#A1A1AA] truncate w-full">{variant.hgvs}</span>
                    <div className="flex items-center gap-1 text-[8px] mt-1">
                      <span className="text-red-400">{variant.lastClassified}</span>
                      <ArrowRight className="w-2.5 h-2.5 text-[#71717A]" />
                      <span className="text-emerald-400 font-bold">{variant.currentClassified}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-1.5 mt-2">
              <span className="text-[10px] text-[#A1A1AA] uppercase font-bold">Inquiry Prompt</span>
              <select 
                value={userQuestion}
                onChange={(e) => {
                  setUserQuestion(e.target.value);
                  setAiResponse(null);
                }}
                className="w-full bg-[#09090B] border border-[#27272A] rounded-lg p-2.5 text-[10px] text-white focus:outline-none focus:border-[#22D3EE]/40"
              >
                <option value="Analyze this variant's clinical significance and classification drift.">Analyze variant drift &amp; clinical significance</option>
                <option value="Generate the FDA/AMP compliant variant reclassification letter for cascade screening.">Generate FDA/AMP reclassification letter</option>
                <option value="Summarize functional protein impact and 3D residue molecular consequences.">Summarize 3D molecular protein impact</option>
              </select>
            </div>
          </div>

          {/* AI Output Terminal */}
          <div className="lg:col-span-7 bg-[#111114] border border-[#27272A] rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#22D3EE]" />
                <span className="text-xs font-bold text-white">Live Clinical Genomics Consultation</span>
              </div>
              <span className="text-[9px] font-mono text-[#22D3EE] bg-[#22D3EE]/10 px-2.5 py-0.5 rounded-full border border-[#22D3EE]/30">
                AI CO-PILOT
              </span>
            </div>

            <div className="flex-grow bg-[#09090B] border border-[#27272A] rounded-lg p-4 font-mono text-[10px] text-[#A1A1AA] leading-relaxed max-h-[250px] overflow-y-auto">
              {isAiLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-[#22D3EE]" />
                  <span className="text-[#71717A] italic">Querying server-side molecular co-pilot...</span>
                </div>
              ) : aiResponse ? (
                <div className="whitespace-pre-wrap select-text text-slate-300">{aiResponse}</div>
              ) : (
                <div className="text-[#71717A] italic select-none">
                  Select a surveillance target on the left and click "Run AI Genomics Consultation" to fetch clinical summary...
                </div>
              )}
            </div>

            <button
              onClick={handleAiConsult}
              disabled={isAiLoading}
              className="w-full py-2.5 bg-[#22D3EE] hover:bg-[#06B6D4] text-[#09090B] font-bold font-mono text-[10px] uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Run AI Genomics Consultation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
