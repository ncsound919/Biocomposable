import re

with open('src/data.ts', 'r') as f:
    text = f.read()

new_contracts = """export const contracts: Contract[] = [
  {
    id: "datacontract",
    name: "DataContract",
    role: "The lingua franca — every component reads/writes this",
    decision: "Extends MuData with Banff scores, clinical annotations, RO-Crate provenance with checksums, and governance metadata. contract_version enables compatibility negotiation.",
    code: `DataContract extends MuData:
  - .uns['experiment_design']: DesignMatrixContract object
  - .uns['banff_scores']: structured Banff lesion scores per sample
  - .uns['clinical_annotations']: recipient/donor metadata, 
    transplant type, immunosuppression regimen
  - .uns['provenance']: RO-Crate manifest reference
  - .uns['data_governance']: access control metadata, consent scope`
  },
  {
    id: "designmatrix",
    name: "DesignMatrix",
    role: "First-class experimental design object",
    decision: 'recommend_correction_strategy() returns one of four strategies — the method that prevents over-correction of confounded designs by recommending "model as covariate" instead of integration.',
    code: `class DesignMatrix:
    factors: dict[str, Factor]        # batch, condition, donor, timepoint
    covariates: dict[str, Covariate]  # age, sex, immunosuppression level
    confounding_report: ConfoundingReport

    def compute_confounding(self) -> ConfoundingReport: ...
    def recommend_correction_strategy(self) -> str: ...`
  },
  {
    id: "modelinterface",
    name: "ModelInterface",
    role: "Python Protocol every ML model must implement",
    decision: "Four required outputs: prediction + calibrated uncertainty + attributions + counterfactuals in actionable subspaces. surrogate() method for CURE compliance.",
    code: `class ModelInterface(Protocol):
    def predict(self, data: DataContract) -> PredictionContract: ...
    def explain(self, data: DataContract, prediction: PredictionContract) -> AttributionContract: ...
    
    # CURE (Counterfactuals for Uncovering Rejection Effects)
    def surrogate(self, target: str) -> InterpretableModel: ...`
  },
  {
    id: "componentmanifest",
    name: "ComponentManifest",
    role: "Self-describing component metadata",
    decision: "Declares requirements, capabilities, compute profile, compliance status, and entry points. This is what makes the ecosystem composable — the orchestration layer reads manifests to build DAGs.",
    code: `class ComponentManifest:
    name: str = "bio-crossmodal-align"
    version: str = "1.2.0"
    contract_version: str = "v1"
    
    requires: ContractRequirement
    produces: ContractOutput
    
    def validate_inputs(self, data: DataContract) -> bool: ...`
  }
];"""

text = re.sub(r'export const contracts: Contract\[\] = \[.*?\];', new_contracts, text, flags=re.DOTALL)

with open('src/data.ts', 'w') as f:
    f.write(text)
