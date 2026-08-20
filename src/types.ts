export interface Layer {
  id: string;
  name: string;
  description: string;
  details: string;
  color: string;
  components?: string[];
}

export interface Contract {
  id: string;
  name: string;
  role: string;
  decision: string;
  code: string;
}

export interface ComponentItem {
  id: string;
  name: string;
  packageName: string;
  inputContract: string;
  outputContract: string;
  description: string;
}

export type ParamType = "string" | "number" | "boolean" | "select";

export interface ComponentParameter {
  name: string;
  type: ParamType;
  default: string | number | boolean;
  options?: string[];
  description: string;
}

export interface ContractRequirement {
  upstreamOutputs: string[];
  dataContract: string;
}

export interface ContractOutput {
  outputType: string;
  uns?: string[];
  obsm?: string[];
}

export type ComponentLayer =
  | "source"
  | "preprocessing"
  | "analysis"
  | "interpretation"
  | "governance"
  | "evaluation"
  | "output";

export interface ComponentManifest {
  id: string;
  packageName: string;
  name: string;
  description: string;
  version: string;
  layer: ComponentLayer;
  requires: ContractRequirement;
  provides: ContractOutput;
  parameters: ComponentParameter[];
  defaultCondition?: string;
}

export interface RecipeStepState {
  id: string;
  params: Record<string, string | number | boolean>;
  condition: string | null;
  expanded: boolean;
}

export interface DeterminismItem {
  id: "preprocessing" | "normalization" | "inference" | "rules" | "pipeline";
  component: string;
  technique: string;
  importance: string;
}

export interface RoadmapItem {
  id: string;
  phase: number;
  components: string[];
  description: string;
  status?: "completed" | "in-progress" | "planned";
  details?: string;
  dependencies?: string[];
  linkId?: string;
}

export interface PriorityItem {
  id: string;
  title: string;
  phase: string;
  urgency?: string;
  implementation: string[];
  icon: string;
}

export interface RpdFactor {
  id: string;
  name: string;
  impact: number;
  status: "pass" | "fail" | "warn";
  description: string;
}

export interface FedSite {
  id: string;
  name: string;
  cohortSize: number;
  calibration: {
    ece: number;
    slope: number;
  };
  heterogeneity: number;
  dataRights: string;
}

export interface CrossPlatformMetric {
  id: string;
  protocolA: string;
  protocolB: string;
  concordance: number;
  cellStateCorrelation: number;
  calibrationDrift: number;
  rpdA: number;
  rpdB: number;
}

export interface TransferMetric {
  id: string;
  task: string;
  baselineAUC: number;
  transferAUC: number;
}

export interface OrganoidSource {
  id: string;
  name: string;
  version: string;
  provenance: string;
}

export interface SeparationLayer {
  id: "data" | "logic" | "orchestration";
  name: string;
  tagline: string;
  principle: string;
  monolithicFailure: string;
  composableSolution: string;
  realWorldProof: string;
  ourComponents: string[];
  codeExample: string;
}

export interface FailureCase {
  platform: string;
  coupled: string;
  consequence: string;
  lesson: string;
}
