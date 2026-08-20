export interface BioComponent {
  id: string;
  name: string;
  description: string;
  category: 'input' | 'transform' | 'analyze' | 'output';
  acceptedInputs: string[];
  providedOutputs: string[];
  params: { name: string; value: string; condition?: string }[];
}

export const registry: BioComponent[] = [
  {
    id: "bio-validate",
    name: "bio-validate",
    description: "Validates raw data against transplant schema",
    category: "input",
    acceptedInputs: ["raw_h5ad", "raw_fastq"],
    providedOutputs: ["DataContract_v1"],
    params: [{ name: "schema", value: "'transplant_v1'" }]
  },
  {
    id: "bio-refdata",
    name: "bio-refdata",
    description: "Injects reference annotations",
    category: "transform",
    acceptedInputs: ["DataContract_v1"],
    providedOutputs: ["DataContract_v1"],
    params: [{ name: "reference", value: "'GENCODE_v44'" }]
  },
  {
    id: "bio-batchdiag",
    name: "bio-batchdiag",
    description: "Calculates batch effect metrics",
    category: "analyze",
    acceptedInputs: ["DataContract_v1"],
    providedOutputs: ["BatchMetrics"],
    params: [{ name: "risk_threshold", value: "'warn'" }]
  },
  {
    id: "bio-batchcorrect",
    name: "bio-batchcorrect",
    description: "Applies Harmony/scVI integration",
    category: "transform",
    acceptedInputs: ["DataContract_v1", "BatchMetrics"],
    providedOutputs: ["DataContract_v1"],
    params: [
      { name: "method", value: "'auto'" },
      { name: "condition", value: "'batchdiag.metrics.needs_correction'" }
    ]
  },
  {
    id: "bio-crossmodal-align",
    name: "bio-crossmodal-align",
    description: "Reference-free mapping model",
    category: "analyze",
    acceptedInputs: ["DataContract_v1"],
    providedOutputs: ["Prediction"],
    params: [{ name: "model_version", value: "'cfrna_deconv_v1'" }]
  },
  {
    id: "bio-interpret",
    name: "bio-interpret",
    description: "CURE-compliant SHAP explanations",
    category: "analyze",
    acceptedInputs: ["Prediction"],
    providedOutputs: ["Explanation"],
    params: [{ name: "method", value: "'shap'" }]
  },
  {
    id: "bio-report",
    name: "bio-report",
    description: "Generates clinical RO-Crate report",
    category: "output",
    acceptedInputs: ["Explanation", "DataContract_v1"],
    providedOutputs: ["Report"],
    params: [{ name: "format", value: "'banff_compatible'" }]
  }
];
