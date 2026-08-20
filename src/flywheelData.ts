export interface FlywheelPhase {
  id: string;
  step: number;
  title: string;
  actor: "transplant_center" | "bio_tool" | "federated_network" | "pathologist";
  action: string;
  output: string;
  feedbackTo: string;
  icon: "blood" | "predict" | "biopsy" | "label" | "train" | "improve";
}

export const flywheelPhases: FlywheelPhase[] = [
  {
    id: "collect",
    step: 1,
    title: "cfRNA Collection & Analysis",
    actor: "transplant_center",
    action:
      "At a routine post-transplant visit, a blood sample is drawn. cfRNA is sequenced and analyzed through bio-crossmodal-align, producing cell type proportions and a rejection probability score.",
    output: "Prediction + calibrated uncertainty for this patient at this timepoint",
    feedbackTo: "active_learning_ranker",
    icon: "blood",
  },
  {
    id: "rank",
    step: 2,
    title: "Active Learning: Uncertainty Ranking",
    actor: "bio_tool",
    action:
      "The system ranks all patients across all participating centers by expected information gain — a function of prediction uncertainty and clinical actionability. Patients whose cfRNA results have high uncertainty in a clinically meaningful zone are flagged for confirmatory biopsy.",
    output: "Prioritized biopsy recommendation list (only high-information-gain patients)",
    feedbackTo: "transplant_center",
    icon: "predict",
  },
  {
    id: "biopsy",
    step: 3,
    title: "Targeted Confirmatory Biopsy",
    actor: "transplant_center",
    action:
      "The transplant center biopsies only the patients flagged by the active learning ranker — not every patient, not at fixed protocol timepoints, but specifically the patients whose cfRNA results were most uncertain. This maximizes diagnostic yield per biopsy and minimizes unnecessary procedures.",
    output: "Biopsy tissue with known cfRNA context (the prediction that triggered it)",
    feedbackTo: "pathologist",
    icon: "biopsy",
  },
  {
    id: "label",
    step: 4,
    title: "Banff Pathology Ground Truth",
    actor: "pathologist",
    action:
      "The biopsy is scored by a pathologist using the Banff classification. The structured Banff lesion scores (glomerulitis, peritubular capillaritis, tubulitis, etc.) and the continuous rejection index are recorded as ground-truth labels — linked back to the cfRNA prediction that triggered the biopsy.",
    output: "Banff-labeled (cfRNA, biopsy) paired data point at this site",
    feedbackTo: "federated_network",
    icon: "label",
  },
  {
    id: "train",
    step: 5,
    title: "Federated Model Update",
    actor: "federated_network",
    action:
      "Each site fine-tunes the deconvolution and rejection classification models locally on its new Banff-labeled pairs — raw patient data never leaves the institution. Only model gradients are sent to the coordinator, which aggregates them via secure multi-party computation. The global model is updated and distributed back to all sites.",
    output: "Improved global model (v1.N+1) distributed to all participating centers",
    feedbackTo: "bio_tool",
    icon: "train",
  },
  {
    id: "improve",
    step: 6,
    title: "Compounding Improvement",
    actor: "bio_tool",
    action:
      "The updated model is deployed across all centers. It is now better calibrated on the exact cases it was previously uncertain about. Next round: fewer biopsies are needed because uncertainty is lower, but the biopsies that ARE recommended catch more true rejections. The flywheel spins faster — each cycle produces more labeled data per biopsy and better predictions per analysis.",
    output: "Higher sensitivity, fewer unnecessary biopsies, lower uncertainty across the network",
    feedbackTo: "collect",
    icon: "improve",
  },
];

export interface CompetitiveComparison {
  feature: string;
  careDx: string;
  mmdx: string;
  ourTool: string;
  whyItMatters: string;
}

export const competitiveComparisons: CompetitiveComparison[] = [
  {
    feature: "Data feedback loop",
    careDx: "Closed flywheel (AlloSure → outcomes → model → AlloSure)",
    mmdx: "No feedback loop. Static classifier trained on historical data.",
    ourTool: "Open federated flywheel. Every clinical use improves the model for all centers.",
    whyItMatters:
      "A static classifier degrades as patient populations, immunosuppression regimens, and assay platforms shift. A flywheel model compounds: each cycle makes the next cycle more accurate and more efficient.",
  },
  {
    feature: "Biopsy strategy",
    careDx: "Fixed protocol biopsies + for-cause biopsies. dd-cfDNA used as a rule-out test.",
    mmdx: "Biopsy-based only. Requires tissue for every diagnostic question.",
    ourTool: "Active learning-driven: biopsies recommended only when model uncertainty is high and clinically actionable. Maximizes information per biopsy.",
    whyItMatters:
      "Protocol biopsies waste resources on low-risk patients. For-cause biopsies catch rejection late. Uncertainty-guided biopsies catch rejection earlier while reducing total biopsy count — the best of both strategies, informed by the model's own knowledge gaps.",
  },
  {
    feature: "Multi-center learning",
    careDx: "Centralized. Data flows to CareDx. Centers don't benefit from each other's data directly.",
    mmdx: "Centralized. All samples shipped to a single lab for microarray processing.",
    ourTool: "Federated. Each center trains locally. Only model parameters are aggregated. No patient data leaves any institution.",
    whyItMatters:
      "Transplant centers won't centralize patient data — privacy, IRB, and regulatory barriers make it impossible. Federated learning is the only mechanism that unlocks cross-institutional improvement without data sharing. CareDx's centralization is a legal and logistical bottleneck.",
  },
  {
    feature: "Ground truth source",
    careDx: "Clinical outcomes (graft loss, rejection events) — slow feedback (months to years).",
    mmdx: "Microarray expression profiles compared to histopathology — static validation.",
    ourTool: "Banff pathology scores linked to cfRNA predictions — fast feedback (days to weeks), actively targeted at model uncertainty.",
    whyItMatters:
      "CareDx's outcome-based flywheel takes years to spin (graft loss is a slow endpoint). Your Banff-linked flywheel spins in weeks — each biopsy produces a labeled data point immediately, and the model improves before the next patient is seen.",
  },
  {
    feature: "Ownership & governance",
    careDx: "Proprietary. CareDx owns the model, the data, and the improvements. Centers contribute data but don't own the resulting intelligence.",
    mmdx: "Proprietary. Thermo Fisher owns the entire diagnostic pipeline.",
    ourTool: "Open-source. Each center owns its data and its local model. The global model is a shared community asset governed by contributing sites.",
    whyItMatters:
      "The transplant community currently depends on a single commercial vendor (CareDx) for non-invasive diagnostics and another (Thermo Fisher/MMDx) for molecular biopsy diagnostics. An open flywheel breaks this dependency — centers contribute, centers benefit, no vendor lock-in.",
  },
];

export interface FlywheelMetric {
  metric: string;
  baseline: string;
  afterYear1: string;
  afterYear3: string;
  mechanism: string;
}

export const flywheelMetrics: FlywheelMetric[] = [
  {
    metric: "Rejection detection sensitivity",
    baseline: "~70% (cfRNA alone, single-center trained)",
    afterYear1: "~82% (federated across 10 centers, ~500 Banff-labeled pairs)",
    afterYear3: "~90%+ (federated across 50+ centers, ~5,000+ pairs)",
    mechanism: "Each Banff-labeled biopsy that was triggered by high uncertainty directly improves the model on exactly the cases it was getting wrong.",
  },
  {
    metric: "Unnecessary biopsies avoided",
    baseline: "0% (protocol biopsies at fixed timepoints regardless of risk)",
    afterYear1: "~40% reduction (model confident enough to skip low-uncertainty patients)",
    afterYear3: "~60% reduction (calibrated uncertainty means only genuinely ambiguous cases are biopsied)",
    mechanism: "Active learning ranks patients by information gain. Patients with low uncertainty (high-confidence no-rejection) skip biopsy. Patients with high uncertainty get biopsied — exactly where information is needed.",
  },
  {
    metric: "Time to rejection detection",
    baseline: "For-cause: symptoms appear, biopsy confirms → weeks to months of subclinical rejection missed",
    afterYear1: "~2 weeks earlier (high-uncertainty cfRNA triggers biopsy before symptoms)",
    afterYear3: "~4-6 weeks earlier (model calibrated enough to detect rejection signatures in cfRNA before histological changes appear)",
    mechanism: "cfRNA reflects molecular changes that precede histological damage. As the model learns the cfRNA signatures of early rejection from Banff-confirmed cases, it detects rejection earlier in the next cohort.",
  },
  {
    metric: "Model calibration (Brier score)",
    baseline: "~0.25 (poorly calibrated, single-center, small training set)",
    afterYear1: "~0.15 (improved via federated learning + per-site calibration)",
    afterYear3: "~0.08 (well-calibrated across diverse populations, platforms, and centers)",
    mechanism: "Federated learning across diverse centers naturally improves calibration — the model sees different patient populations, immunosuppression regimens, and assay platforms, reducing overfitting to any single site's biases.",
  },
];

export const flywheelArchitecture = `# The Clinical Data Flywheel — Architecture

# STEP 1: cfRNA analysis at each center (local, no data leaves)
from bio_crossmodal_align import cfRNADeconvolutionModel
from bio_interpret import ModelExplainer

model = cfRNADeconvolutionModel.load("cfrna_deconv_v1.N")
prediction = model.predict(patient_data)
# → Prediction(rejection_prob=0.34, uncertainty=0.28)

# STEP 2: Active learning ranks patients by information gain
from bio_active_learning import UncertaintyRanker

ranker = UncertaintyRanker(model=model)
priority = ranker.rank_patients(all_predictions_this_week)
# → [Patient A (info_gain=0.82), Patient B (0.71), Patient C (0.03)...]
# Only Patient A and B are recommended for confirmatory biopsy

# STEP 3: Center biopsies high-uncertainty patients only
# (not protocol, not for-cause — information-driven)

# STEP 4: Banff scores become ground truth, linked to cfRNA prediction
banff_label = BanffScores(
    glomerulitis=2, peritubular_capillaritis=1,
    tubulitis=2, banff_diagnosis="TCMR_IB",
    continuous_rejection_index=0.62
)
labeled_pair = (patient_data, banff_label)  # stays local

# STEP 5: Federated training — only gradients leave the site
from bio_governance import FederatedCoordinator

coordinator = FederatedCoordinator(sites=participating_centers)
coordinator.train_round(
    model=model,
    local_data=[labeled_pair],  # never leaves this site
)
# → Each site sends only model gradients (encrypted)
# → Coordinator aggregates → new global model v1.N+1
# → Distributed back to all centers

# STEP 6: The flywheel spins
# Model v1.N+1 is better calibrated on the exact cases
# it was uncertain about. Fewer biopsies needed next round.
# More centers join → more data → faster improvement.
# The moat is the flywheel, not the model.`;

export interface AdvancedCapability {
  capability: string;
  element: string;
  icon: string;
}

export const advancedCapabilities: AdvancedCapability[] = [
  {
    capability: "Spatial companion diagnostic",
    element: "Flywheel output → locked assay → clinical use → outcomes feedback",
    icon: "microscope"
  },
  {
    capability: "Non-invasive spatial prediction",
    element: "cfRNA → predict spatial TME → biopsy only when uncertain → ground truth → improve model",
    icon: "activity"
  },
  {
    capability: "Digital twin",
    element: "Twin simulation → predict response → treat → measure outcome → update twin",
    icon: "users"
  },
  {
    capability: "Counterfactual reasoning",
    element: "Counterfactual prediction → select combination → treat → validate prediction → improve counterfactuals",
    icon: "git-branch"
  },
  {
    capability: "Federated validation",
    element: "Multi-center biomarker test → per-site performance → model refinement → re-validate",
    icon: "network"
  }
];
