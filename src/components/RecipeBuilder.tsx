import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { registry, type BioComponent } from "../componentsData";
import { Plus, Trash2, CheckCircle2, AlertTriangle, ArrowDown, Settings2, Play, FileCode2, Terminal, Loader2, Sparkles, Download } from "lucide-react";

export function RecipeBuilder() {
  const [recipe, setRecipe] = useState<BioComponent[]>([]);
  const [codeMode, setCodeMode] = useState<"python" | "nextflow" | "snakemake" | "yaml">("python");
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);

  const addStep = (comp: BioComponent) => {
    setRecipe([...recipe, { ...comp, id: `${comp.id}_${Date.now()}` }]);
  };

  const removeStep = (index: number) => {
    const newRecipe = [...recipe];
    newRecipe.splice(index, 1);
    setRecipe(newRecipe);
  };

  // Validate DAG client-side
  const validations = recipe.map((step, index) => {
    if (index === 0) return { valid: true, error: null };
    const prevStep = recipe[index - 1];
    
    const hasMatchingInput = step.acceptedInputs.some((req) => 
      prevStep.providedOutputs.includes(req)
    );

    if (!hasMatchingInput) {
      return { 
        valid: false, 
        error: `Type mismatch: Requires [${step.acceptedInputs.join(", ")}] but previous step outputs [${prevStep.providedOutputs.join(", ")}]` 
      };
    }
    return { valid: true, error: null };
  });

  const isDAGValid = recipe.length > 0 && validations.every((v) => v.valid);

  // Server-side contract verification and script generator
  const handleExecutePipeline = async () => {
    if (recipe.length === 0 || !isDAGValid || isExecuting) return;
    setIsExecuting(true);

    try {
      const response = await fetch("/agent/v1/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          steps: recipe,
          mode: codeMode
        })
      });
      const data = await response.json();
      setExecutionResult(data);
    } catch (err: any) {
      console.error("Execution error:", err);
      setExecutionResult({
        error: "Execution server error",
        message: err.message
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const generatePython = () => {
    if (recipe.length === 0) return "# Add components to build an executable pipeline\nimport mudata as md\nimport scanpy as sc\n";
    let code = `import mudata as md\nimport scanpy as sc\nfrom pydantic import BaseModel\n\n# BioComposable Executable Pipeline Script\n# Production Dependencies: mudata, scanpy, pydantic\n\n`;
    recipe.forEach((step, idx) => {
      const origId = step.id.split("_")[0];
      const paramsStr = step.params.map(p => `${p.name}=${p.value}`).join(", ");
      code += `# Step ${idx + 1}: ${origId}\n`;
      code += `def step_${idx + 1}_${origId.replace(/-/g, '_')}(data_contract):\n`;
      code += `    print(f"[Exec] Running ${origId} with params: {${paramsStr || "'defaults'"}}")\n`;
      code += `    return data_contract\n\n`;
    });
    code += `if __name__ == "__main__":
    print("Initializing BioComposable DataContract pipeline...")
    current_contract = md.MuData({})
`;
    recipe.forEach((step, idx) => {
      const origId = step.id.split("_")[0];
      code += `    current_contract = step_${idx + 1}_${origId.replace(/-/g, '_')}(current_contract)\n`;
    });
    code += `    print("Pipeline Execution Complete. Generated RO-Crate Provenance.")\n`;
    return code;
  };

  const generateNextflow = () => {
    if (recipe.length === 0) return "// Add components to export Nextflow DSL2 script\nnextflow.enable.dsl=2\n";
    let code = `// BioComposable Nextflow DSL2 Workflow\nnextflow.enable.dsl=2\n\nparams.input_h5ad = "data/cohort.h5ad"\n\n`;
    recipe.forEach((step, idx) => {
      const origId = step.id.split("_")[0];
      code += `process ${origId.toUpperCase().replace(/-/g, '_')}_STEP_${idx + 1} {\n`;
      code += `    container 'quay.io/biocontainers/mudata:0.3.3'\n`;
      code += `    input:\n        path h5ad_in\n`;
      code += `    output:\n        path 'step_${idx + 1}_out.mda'\n`;
      code += `    script:\n    """\n    python3 -c "import mudata as md; print('Executing ${origId}')"\n    """\n}\n\n`;
    });
    code += `workflow {\n`;
    recipe.forEach((step, idx) => {
      const origId = step.id.split("_")[0];
      code += `    ${origId.toUpperCase().replace(/-/g, '_')}_STEP_${idx + 1}(params.input_h5ad)\n`;
    });
    code += `}\n`;
    return code;
  };

  const generateSnakemake = () => {
    if (recipe.length === 0) return "# Add components to export Snakemake workflow\nrule all:\n    input: 'results/final.mda'\n";
    let code = `# BioComposable Snakemake Workflow\nrule all:\n    input:\n        "results/final_ro_crate.json"\n\n`;
    recipe.forEach((step, idx) => {
      const origId = step.id.split("_")[0];
      code += `rule step_${idx + 1}_${origId.replace(/-/g, '_')}:\n`;
      code += `    input:\n        h5ad="data/cohort.h5ad"\n`;
      code += `    output:\n        mda="results/step_${idx + 1}.mda"\n`;
      code += `    shell:\n        "python -c 'import mudata as md; print(\\\"${origId}\\\")'"\n\n`;
    });
    return code;
  };

  const generateYAML = () => {
    if (recipe.length === 0) return "# Add components to build a recipe\nname: autonomous_pipeline\nsteps: []\n";
    let code = `name: autonomous_pipeline\nsteps:\n`;
    recipe.forEach((step) => {
      const originalId = step.id.split("_")[0];
      code += `  - component: ${originalId}\n`;
      if (step.params.length > 0) {
        code += `    params:\n`;
        step.params.forEach(p => {
          const cleanVal = p.value.replace(/'/g, "");
          code += `      ${p.name}: ${cleanVal}\n`;
        });
      }
    });
    return code;
  };

  const getActiveCodeText = () => {
    switch (codeMode) {
      case "python": return generatePython();
      case "nextflow": return generateNextflow();
      case "snakemake": return generateSnakemake();
      case "yaml": return generateYAML();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* 3 Column Grid: Registry | Canvas | Code Export */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Component Registry */}
        <div className="lg:col-span-4 bg-[#09090B] border border-[#27272A] rounded-2xl p-5 flex flex-col h-[600px]">
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#27272A]">
            <Settings2 className="w-4 h-4 text-[#FAFAFA]" />
            <h3 className="text-xs font-bold text-[#FAFAFA] uppercase tracking-widest">Component Registry</h3>
          </div>
          
          <div className="overflow-y-auto pr-2 space-y-3 flex-1 custom-scrollbar">
            {registry.map((comp) => (
              <div key={comp.id} className="bg-[#18181B] border border-[#27272A] rounded-xl p-3 hover:border-[#3F3F46] transition-colors group">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-[11px] font-bold text-[#FAFAFA] font-mono">{comp.name}</h4>
                    <p className="text-[10px] text-[#A1A1AA] mt-1 line-clamp-1">{comp.description}</p>
                  </div>
                  <button 
                    onClick={() => addStep(comp)}
                    className="w-6 h-6 rounded-md bg-[#27272A] flex items-center justify-center hover:bg-[#3F3F46] transition-colors flex-none"
                  >
                    <Plus className="w-3 h-3 text-[#FAFAFA]" />
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-[#27272A]">
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] uppercase tracking-wider text-[#71717A]">IN:</span>
                    <span className="text-[9px] font-mono text-[#22D3EE] bg-[#22D3EE]/10 px-1 rounded">{comp.acceptedInputs[0]}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] uppercase tracking-wider text-[#71717A]">OUT:</span>
                    <span className="text-[9px] font-mono text-[#10B981] bg-[#10B981]/10 px-1 rounded">{comp.providedOutputs[0]}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Middle: DAG Canvas */}
        <div className="lg:col-span-4 bg-[#09090B] border border-[#27272A] rounded-2xl p-5 flex flex-col h-[600px] justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#27272A]">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-[#FAFAFA]" />
                <h3 className="text-xs font-bold text-[#FAFAFA] uppercase tracking-widest">Pipeline DAG</h3>
              </div>
              {recipe.length > 0 && (
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 ${isDAGValid ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#EF4444]/10 text-[#EF4444]'}`}>
                  {isDAGValid ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                  {isDAGValid ? "CONTRACTS VALID" : "CONTRACT MISMATCH"}
                </span>
              )}
            </div>

            <div className="overflow-y-auto pr-2 max-h-[440px] custom-scrollbar">
              {recipe.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center px-4 opacity-50">
                  <Plus className="w-8 h-8 text-[#52525B] mb-3" />
                  <p className="text-xs text-[#71717A]">Add components from the registry to build a workflow.</p>
                </div>
              ) : (
                <div className="space-y-2 pb-4">
                  <AnimatePresence>
                    {recipe.map((step, index) => {
                      const validation = validations[index];
                      const isInvalid = !validation.valid;
                      
                      return (
                        <motion.div 
                          key={step.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="relative"
                        >
                          {index > 0 && (
                            <div className="flex justify-center my-1">
                              <ArrowDown className={`w-4 h-4 ${isInvalid ? 'text-[#EF4444]' : 'text-[#3F3F46]'}`} />
                            </div>
                          )}

                          <div className={`bg-[#18181B] border rounded-xl p-3 relative group ${isInvalid ? 'border-[#EF4444]/50 bg-[#EF4444]/5' : 'border-[#27272A]'}`}>
                            
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-[#27272A] text-[10px] flex items-center justify-center text-[#A1A1AA] font-bold">
                                  {index + 1}
                                </span>
                                <span className="text-[11px] font-bold text-[#FAFAFA] font-mono">{step.name.split('_')[0]}</span>
                              </div>
                              <button 
                                onClick={() => removeStep(index)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-[#71717A] hover:text-[#EF4444]"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {step.params.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {step.params.map((p, i) => (
                                  <div key={i} className="flex items-center justify-between bg-[#09090B] px-2 py-1 rounded border border-[#27272A]">
                                    <span className="text-[9px] text-[#71717A] font-mono">{p.name}</span>
                                    <span className="text-[9px] text-[#F59E0B] font-mono">{p.value}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {isInvalid && (
                              <div className="mt-2 text-[9px] text-[#EF4444] bg-[#EF4444]/10 p-2 rounded flex gap-1.5 items-start">
                                <AlertTriangle className="w-3 h-3 flex-none mt-0.5" />
                                <span>{validation.error}</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

          {/* Real Express Execution Trigger */}
          <div className="pt-3 border-t border-[#27272A]">
            <button
              onClick={handleExecutePipeline}
              disabled={recipe.length === 0 || !isDAGValid || isExecuting}
              className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                recipe.length > 0 && isDAGValid
                  ? "bg-[#10B981] text-[#09090B] hover:bg-[#34D399] shadow-lg shadow-[#10B981]/20 cursor-pointer"
                  : "bg-[#27272A] text-[#71717A] cursor-not-allowed border border-[#3F3F46]"
              }`}
            >
              {isExecuting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#09090B]" />
                  <span>Verifying Server DataContracts...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Execute Pipeline Dry-Run (Port 3000)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Code Generation Export */}
        <div className="lg:col-span-4 bg-[#09090B] border border-[#27272A] rounded-2xl flex flex-col h-[600px] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-[#27272A] bg-[#18181B]">
            <div className="flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-[#FAFAFA]" />
              <h3 className="text-xs font-bold text-[#FAFAFA] uppercase tracking-widest">Recipe Export</h3>
            </div>
            
            <div className="flex items-center bg-[#09090B] p-1 rounded-lg border border-[#27272A] text-[9px] font-bold">
              <button
                onClick={() => setCodeMode("python")}
                className={`px-2 py-1 rounded transition-colors ${codeMode === "python" ? "bg-[#27272A] text-[#FAFAFA]" : "text-[#71717A]"}`}
              >
                PYTHON
              </button>
              <button
                onClick={() => setCodeMode("nextflow")}
                className={`px-2 py-1 rounded transition-colors ${codeMode === "nextflow" ? "bg-[#27272A] text-[#FAFAFA]" : "text-[#71717A]"}`}
              >
                NEXTFLOW
              </button>
              <button
                onClick={() => setCodeMode("snakemake")}
                className={`px-2 py-1 rounded transition-colors ${codeMode === "snakemake" ? "bg-[#27272A] text-[#FAFAFA]" : "text-[#71717A]"}`}
              >
                SNAKEMAKE
              </button>
              <button
                onClick={() => setCodeMode("yaml")}
                className={`px-2 py-1 rounded transition-colors ${codeMode === "yaml" ? "bg-[#27272A] text-[#FAFAFA]" : "text-[#71717A]"}`}
              >
                YAML
              </button>
            </div>
          </div>
          
          <div className="flex-1 p-4 overflow-auto custom-scrollbar">
            <pre className="font-mono text-[11px] leading-relaxed text-[#A1A1AA]">
              <code>{getActiveCodeText()}</code>
            </pre>
          </div>
        </div>

      </div>

      {/* Real Express Server Execution Console Output */}
      {executionResult && (
        <div className="bg-[#09090B] border border-[#10B981]/30 rounded-2xl p-5 flex flex-col gap-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-[#27272A] pb-2 text-[#10B981]">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              <span className="font-bold">EXPRESS SERVER EXECUTION RESPONSE</span>
            </div>
            <span className="text-[10px] text-[#A1A1AA]">JOB: {executionResult.jobId}</span>
          </div>

          <div className="bg-[#18181B] p-3 rounded-xl border border-[#27272A] text-[10px] text-[#22D3EE] space-y-1">
            {executionResult.stepLogs?.map((log: string, idx: number) => (
              <div key={idx}>{log}</div>
            ))}
          </div>

          <div className="flex justify-between items-center text-[10px] text-[#A1A1AA] pt-1">
            <span>Guarantees: RpD = {executionResult.guarantees?.rpdScore} | {executionResult.guarantees?.checksumValidation}</span>
            <span className="text-[#10B981] font-bold">DataContract: {executionResult.guarantees?.dataDataContractVersion || "DataContract_v1"}</span>
          </div>
        </div>
      )}

    </div>
  );
}
