import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Droplet, 
  Activity, 
  Microscope, 
  FileText, 
  Network, 
  RefreshCcw, 
  Play, 
  RotateCcw, 
  Sliders, 
  ShieldCheck, 
  Terminal, 
  CheckCircle2, 
  Cpu, 
  FileCode2,
  Database,
  Layers
} from "lucide-react";

interface StepDetail {
  id: string;
  step: number;
  title: string;
  category: string;
  action: string;
  inputPayload: string;
  outputPayload: string;
  pythonSnippet: string;
  icon: any;
}

const steps: StepDetail[] = [
  {
    id: "collect",
    step: 1,
    title: "cfRNA Deconvolution & Profiling",
    category: "Assay Ingestion",
    action: "Sequences patient plasma cfRNA to quantify cell-type specific transcriptomic proportions and rejection risk probability.",
    inputPayload: '{"sample_id": "CRRNA_9021", "cohort_size": 2500, "assay": "cfRNA_Deconv"}',
    outputPayload: '{"rejection_prob": 0.384, "uncertainty_entropy": 0.612, "cell_fractions": {"podocyte": 0.12, "tubular": 0.45}}',
    pythonSnippet: `from bio_crossmodal_align import cfRNADeconvolutionModel

model = cfRNADeconvolutionModel.load("v2.4.1")
res = model.predict(patient_cfrna_sample)
# Output: Rejection Prob=0.384, Uncertainty Entropy=0.612`,
    icon: Droplet,
  },
  {
    id: "rank",
    step: 2,
    title: "Uncertainty Active Sampling",
    category: "Information Gain Filter",
    action: "Ranks patient cohort by prediction entropy and clinical decision boundaries, identifying cases with high diagnostic information gain.",
    inputPayload: '{"entropy_threshold": 0.45, "total_screened": 2500}',
    outputPayload: '{"flagged_for_biopsy": 312, "biopsy_reduction_rate": "87.5%", "expected_info_gain": 2.41}',
    pythonSnippet: `from bio_active_learning import UncertaintyRanker

ranker = UncertaintyRanker(threshold=0.45)
flagged_cases = ranker.filter_high_information_gain(cohort_predictions)
# Output: 312 high-gain samples flagged for pathology audit`,
    icon: Activity,
  },
  {
    id: "biopsy",
    step: 3,
    title: "Targeted Pathology Acquisition",
    category: "Clinical Audit",
    action: "Biopsies are performed selectively on high-uncertainty cases, dramatically reducing procedure volume while maximizing diagnostic yield.",
    inputPayload: '{"patient_id": "PT_8842", "uncertainty_score": 0.612}',
    outputPayload: '{"biopsy_tissue_id": "BX_3301", "cfRNA_context_linked": true}',
    pythonSnippet: `# Pathology workflow links biopsy tissue specimen directly to pre-biopsy cfRNA prediction
biopsy_record = PathologySystem.acquire_specimen(patient_id="PT_8842", linked_prediction_id="PRED_9021")`,
    icon: Microscope,
  },
  {
    id: "label",
    step: 4,
    title: "Banff Lesion Ground-Truth Scoring",
    category: "Expert Annotation",
    action: "Pathologists score biopsy tissue using Banff 2019 standards (g, v, t, ci, ct) to establish verified ground-truth labels.",
    inputPayload: '{"specimen_id": "BX_3301", "banff_schema": "2019_v2"}',
    outputPayload: '{"banff_scores": {"g": 2, "v": 1, "t": 2}, "diagnosis": "TCMR_Grade_IB", "ground_truth_score": 0.850}',
    pythonSnippet: `from bio_schemas import Banff2019Spec

ground_truth = Banff2019Spec(
    glomerulitis=2, peritubular_capillaritis=1, tubulitis=2,
    diagnosis="TCMR_IB", continuous_rejection_index=0.850
)`,
    icon: FileText,
  },
  {
    id: "train",
    step: 5,
    title: "Federated Gradient Aggregation",
    category: "Privacy-Preserving Training",
    action: "Local site fine-tunes deconvolution parameters on new Banff pairs. Only encrypted gradients leave the institution via Secure MPC.",
    inputPayload: '{"site_id": "SITE_TX_04", "federated_nodes": 12, "privacy_budget_eps": 1.2}',
    outputPayload: '{"gradient_hash": "0x9f82a1...", "global_model_version": "v2.4.2_RC1"}',
    pythonSnippet: `from bio_governance import FederatedCoordinator

coordinator = FederatedCoordinator(privacy_mode="secure_mpc")
coordinator.aggregate_local_gradients(site_id="SITE_TX_04", encrypted_weights=local_weights)`,
    icon: Network,
  },
  {
    id: "improve",
    step: 6,
    title: "Model Calibration & Distribution",
    category: "Closed-Loop Deployment",
    action: "Updated global model is re-distributed to all participating sites, yielding improved calibration and reduced uncertainty for subsequent cycles.",
    inputPayload: '{"global_model": "v2.4.2", "nodes": 12}',
    outputPayload: '{"rejection_auc": 0.912, "brier_score": 0.078, "network_status": "LOCKED_SYNCHRONIZED"}',
    pythonSnippet: `# Redeploy updated model v2.4.2 across all federated clinical nodes
GlobalModelRegistry.deploy_and_verify(model_version="v2.4.2", target_nodes=12)`,
    icon: RefreshCcw,
  },
];

export function ClinicalFlywheel() {
  const [activeStep, setActiveStep] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [entropyThreshold, setEntropyThreshold] = useState(0.45);
  const [federatedSites, setFederatedSites] = useState(12);
  const [assayType, setAssayType] = useState<"cfRNA_Deconv" | "Spatial_Diagnostic" | "Digital_Twin">("cfRNA_Deconv");
  const [logs, setLogs] = useState<string[]>([
    "[SYSTEM] Active Learning & Re-Training Engine initialized.",
    "[STATUS] Contract schemas locked: Banff2019Spec, cfRNADeconvV2.",
    "[READY] Select parameters or execute cycle simulation."
  ]);

  // Derived mathematical metrics
  const screenedCount = 2500;
  const flaggedCount = Math.round(screenedCount * (1 - entropyThreshold * 0.72));
  const biopsyReduction = (((screenedCount - flaggedCount) / screenedCount) * 100).toFixed(1);
  const sensitivityAUC = Math.min(0.965, 0.72 + Math.log10(federatedSites) * 0.12 + (0.9 - entropyThreshold) * 0.08).toFixed(3);
  const brierScore = (0.24 * Math.exp(-federatedSites / 14) + entropyThreshold * 0.04).toFixed(3);

  const currentStepDetail = steps[activeStep];

  useEffect(() => {
    let interval: any = null;
    if (isSimulating) {
      interval = setInterval(() => {
        setActiveStep((prev) => {
          const next = (prev + 1) % steps.length;
          const nextStep = steps[next];
          setLogs((l) => [
            `[EXECUTION] Step ${nextStep.step}: ${nextStep.title} executed. Output verified.`,
            ...l.slice(0, 10)
          ]);
          if (next === steps.length - 1) {
            setIsSimulating(false);
          }
          return next;
        });
      }, 1800);
    }
    return () => clearInterval(interval);
  }, [isSimulating]);

  const handleStartSimulation = () => {
    setActiveStep(0);
    setIsSimulating(true);
    setLogs((l) => [
      `[SIMULATION START] Executing 6-stage active learning cycle across ${federatedSites} federated sites...`,
      ...l.slice(0, 10)
    ]);
  };

  const handleReset = () => {
    setIsSimulating(false);
    setActiveStep(0);
    setLogs([
      "[SYSTEM] Simulation reset. Console ready."
    ]);
  };

  return (
    <div className="flex flex-col gap-6 w-full text-[#FAFAFA]">
      
      {/* Top Console Controls & Metrics */}
      <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5 flex flex-col gap-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#27272A] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span className="text-[10px] font-mono font-bold text-[#10B981] uppercase tracking-wider">
                Active Learning Engine v2.4
              </span>
            </div>
            <h2 className="text-base font-bold text-[#FAFAFA]">
              Model Re-Training & Active Sampling Simulator
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleStartSimulation}
              disabled={isSimulating}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all border ${
                isSimulating
                  ? "bg-[#10B981]/20 border-[#10B981]/40 text-[#10B981] animate-pulse"
                  : "bg-[#10B981] border-[#10B981] text-[#09090B] hover:bg-[#059669]"
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {isSimulating ? "CYCLE RUNNING..." : "EXECUTE CYCLE"}
            </button>

            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-3 py-2 rounded-xl font-mono text-xs font-bold bg-[#27272A] text-[#A1A1AA] hover:text-[#FAFAFA] border border-[#3F3F46] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              RESET
            </button>
          </div>
        </div>

        {/* Live Controls & Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Slider 1: Entropy Cutoff */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-[#A1A1AA] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#22D3EE]" />
                Uncertainty Threshold
              </span>
              <span className="text-[#22D3EE] font-bold">{entropyThreshold.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.10"
              max="0.85"
              step="0.05"
              value={entropyThreshold}
              onChange={(e) => setEntropyThreshold(parseFloat(e.target.value))}
              className="w-full accent-[#22D3EE] bg-[#27272A] h-1.5 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] text-[#71717A]">
              Controls information-gain sensitivity for biopsy filtering.
            </span>
          </div>

          {/* Slider 2: Federated Nodes */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-[#A1A1AA] flex items-center gap-1.5">
                <Network className="w-3.5 h-3.5 text-[#8B5CF6]" />
                Federated Clinical Sites
              </span>
              <span className="text-[#8B5CF6] font-bold">{federatedSites} sites</span>
            </div>
            <input
              type="range"
              min="2"
              max="50"
              step="1"
              value={federatedSites}
              onChange={(e) => setFederatedSites(parseInt(e.target.value))}
              className="w-full accent-[#8B5CF6] bg-[#27272A] h-1.5 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] text-[#71717A]">
              Institutions aggregating gradients via Secure Multi-Party Computation.
            </span>
          </div>

          {/* Assay Mode Selector */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-mono text-[#A1A1AA] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#F59E0B]" />
              Assay Contract Target
            </span>
            <div className="flex gap-1.5 bg-[#09090B] p-1 rounded-xl border border-[#27272A]">
              {(["cfRNA_Deconv", "Spatial_Diagnostic", "Digital_Twin"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setAssayType(mode)}
                  className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-mono transition-colors ${
                    assayType === mode
                      ? "bg-[#27272A] text-[#FAFAFA] font-bold border border-[#3F3F46]"
                      : "text-[#71717A] hover:text-[#A1A1AA]"
                  }`}
                >
                  {mode.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Computed Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-3 flex flex-col gap-1">
            <span className="text-[10px] font-mono text-[#71717A] uppercase">Screened Cohort</span>
            <span className="text-base font-bold font-mono text-[#FAFAFA]">{screenedCount.toLocaleString()} pts</span>
            <span className="text-[9px] text-[#A1A1AA]">Routine cfRNA Plasma</span>
          </div>

          <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-3 flex flex-col gap-1">
            <span className="text-[10px] font-mono text-[#71717A] uppercase">Biopsies Recommended</span>
            <span className="text-base font-bold font-mono text-[#22D3EE]">{flaggedCount} pts</span>
            <span className="text-[9px] text-[#10B981] font-mono">{biopsyReduction}% reduction</span>
          </div>

          <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-3 flex flex-col gap-1">
            <span className="text-[10px] font-mono text-[#71717A] uppercase">Rejection ROC-AUC</span>
            <span className="text-base font-bold font-mono text-[#10B981]">{sensitivityAUC}</span>
            <span className="text-[9px] text-[#A1A1AA]">Banff Rejection Index</span>
          </div>

          <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-3 flex flex-col gap-1">
            <span className="text-[10px] font-mono text-[#71717A] uppercase">Brier Calibration</span>
            <span className="text-base font-bold font-mono text-[#8B5CF6]">{brierScore}</span>
            <span className="text-[9px] text-[#A1A1AA]">Cross-Site Entropy</span>
          </div>
        </div>
      </div>

      {/* 6-Step Interactive Cycle Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          const isActive = activeStep === idx;
          return (
            <button
              key={s.id}
              onClick={() => {
                setIsSimulating(false);
                setActiveStep(idx);
              }}
              className={`flex flex-col p-3 rounded-xl text-left transition-all border relative ${
                isActive
                  ? "bg-[#27272A] border-[#10B981] shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                  : "bg-[#18181B] border-[#27272A] opacity-80 hover:opacity-100 hover:border-[#3F3F46]"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  isActive ? "bg-[#10B981] text-[#09090B]" : "bg-[#27272A] text-[#71717A]"
                }`}>
                  STEP {s.step}
                </span>
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#10B981]" : "text-[#71717A]"}`} />
              </div>
              <span className={`text-xs font-bold leading-tight ${isActive ? "text-[#FAFAFA]" : "text-[#A1A1AA]"}`}>
                {s.title.split(" ")[0]} {s.title.split(" ")[1]}
              </span>
              <span className="text-[9px] font-mono text-[#71717A] mt-1 truncate">
                {s.category}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Step Detailed Specification View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Step Execution Description & Payload JSON */}
        <div className="lg:col-span-6 bg-[#18181B] border border-[#27272A] rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center">
              <currentStepDetail.icon className="w-4 h-4 text-[#10B981]" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#10B981] uppercase font-bold">
                Step {currentStepDetail.step} // {currentStepDetail.category}
              </span>
              <h3 className="text-sm font-bold text-[#FAFAFA]">
                {currentStepDetail.title}
              </h3>
            </div>
          </div>

          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            {currentStepDetail.action}
          </p>

          <div className="flex flex-col gap-3 pt-2">
            <div>
              <span className="text-[10px] font-mono text-[#71717A] uppercase mb-1 block">Input Contract Payload</span>
              <div className="bg-[#09090B] border border-[#27272A] rounded-lg p-2.5 font-mono text-[11px] text-[#22D3EE] overflow-x-auto">
                <code>{currentStepDetail.inputPayload}</code>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono text-[#71717A] uppercase mb-1 block">Output State Payload</span>
              <div className="bg-[#09090B] border border-[#27272A] rounded-lg p-2.5 font-mono text-[11px] text-[#10B981] overflow-x-auto">
                <code>{currentStepDetail.outputPayload}</code>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Python Contract Executor Code */}
        <div className="lg:col-span-6 bg-[#09090B] border border-[#27272A] rounded-2xl overflow-hidden flex flex-col">
          <div className="bg-[#18181B] px-4 py-2.5 border-b border-[#27272A] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode2 className="w-3.5 h-3.5 text-[#22D3EE]" />
              <span className="text-[11px] font-mono text-[#A1A1AA]">flywheel_step_{currentStepDetail.step}.py</span>
            </div>
            <span className="text-[9px] font-mono text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/20 px-2 py-0.5 rounded">
              EXECUTABLE
            </span>
          </div>
          <div className="p-4 font-mono text-[11px] leading-relaxed text-[#A1A1AA] overflow-x-auto flex-1 bg-[#09090B]">
            <pre>
              <code>{currentStepDetail.pythonSnippet}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Real-time System Terminal Log */}
      <div className="bg-[#09090B] border border-[#27272A] rounded-2xl p-4 font-mono text-[11px] flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[#71717A] pb-2 border-b border-[#27272A]">
          <Terminal className="w-3.5 h-3.5 text-[#22D3EE]" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Engine Event Log Stream</span>
        </div>
        <div className="flex flex-col gap-1 text-[10px]">
          {logs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-[#52525B] flex-none">›</span>
              <span className={idx === 0 ? "text-[#10B981] font-semibold" : "text-[#A1A1AA]"}>
                {log}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quantitative Architecture Comparison */}
      <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5 flex flex-col gap-4">
        <h3 className="text-xs font-bold text-[#FAFAFA] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#22D3EE]" />
          Scientific Architecture Benchmark: Static vs. Closed-Loop Active Learning
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[11px]">
            <thead>
              <tr className="border-b border-[#27272A] text-[#71717A]">
                <th className="pb-2 font-normal uppercase">Dimension</th>
                <th className="pb-2 font-normal uppercase">Legacy Static Classifier</th>
                <th className="pb-2 font-normal uppercase text-[#10B981]">Bio-Composable Active Flywheel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A]/50 text-[#A1A1AA]">
              <tr>
                <td className="py-2.5 font-bold text-[#FAFAFA]">Sampling Strategy</td>
                <td className="py-2.5 text-[#EF4444]">Fixed protocol / For-cause biopsies</td>
                <td className="py-2.5 text-[#10B981]">Entropy-ranked information gain active sampling</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-[#FAFAFA]">Data Governance</td>
                <td className="py-2.5">Centralized raw tissue shipment</td>
                <td className="py-2.5 text-[#10B981]">Federated Secure MPC gradient aggregation</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-[#FAFAFA]">Ground-Truth Anchor</td>
                <td className="py-2.5">Delayed graft-loss endpoints (months)</td>
                <td className="py-2.5 text-[#10B981]">Banff 2019 pathology lesion scores (days)</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-[#FAFAFA]">Calibration Drift</td>
                <td className="py-2.5 text-[#EF4444]">Degrades over time with platform drift</td>
                <td className="py-2.5 text-[#10B981]">Compounds accuracy over cycles (Brier &lt; 0.08)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
