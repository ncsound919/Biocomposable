import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { registry, type BioComponent } from "../componentsData";
import { Plus, Trash2, CheckCircle2, AlertTriangle, Code2, ArrowDown, Settings2, Play, FileCode2 } from "lucide-react";

export function RecipeBuilder() {
  const [recipe, setRecipe] = useState<BioComponent[]>([]);
  const [codeMode, setCodeMode] = useState<"python" | "yaml">("python");

  const addStep = (comp: BioComponent) => {
    // Generate a unique instance ID for multiple uses of the same component
    setRecipe([...recipe, { ...comp, id: `${comp.id}_${Date.now()}` }]);
  };

  const removeStep = (index: number) => {
    const newRecipe = [...recipe];
    newRecipe.splice(index, 1);
    setRecipe(newRecipe);
  };

  // Validate DAG
  const validations = recipe.map((step, index) => {
    if (index === 0) return { valid: true, error: null }; // First step accepts external input implicitly here
    const prevStep = recipe[index - 1];
    
    // Check if the current step accepts ANY of the previous step's outputs
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

  const generatePython = () => {
    if (recipe.length === 0) return "# Add components to build a recipe\n\nrecipe = Recipe('autonomous_pipeline')\n";
    let code = `from bio_orchestrate import Recipe, RecipeExecutor\n\nrecipe = Recipe("autonomous_pipeline")\n\n`;
    recipe.forEach((step) => {
      const originalId = step.id.split("_")[0];
      const paramsStr = step.params.map(p => `${p.name}=${p.value}`).join(", ");
      code += `recipe.add_step(\n    "${originalId}", \n    ${paramsStr}\n)\n\n`;
    });
    code += `executor = RecipeExecutor(registry)\nresult = executor.execute(recipe, input_data)`;
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
          // Clean up the quotes for YAML rendering
          const cleanVal = p.value.replace(/'/g, "");
          code += `      ${p.name}: ${cleanVal}\n`;
        });
      }
    });
    return code;
  };

  return (
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
      <div className="lg:col-span-4 bg-[#09090B] border border-[#27272A] rounded-2xl p-5 flex flex-col h-[600px]">
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

        <div className="overflow-y-auto pr-2 flex-1 custom-scrollbar">
          {recipe.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4 opacity-50">
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
                      {/* Arrow between steps */}
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

                        {/* Inline Params */}
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

                        {/* Validation Error */}
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

      {/* Right: Code Generation */}
      <div className="lg:col-span-4 bg-[#09090B] border border-[#27272A] rounded-2xl flex flex-col h-[600px] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[#27272A] bg-[#18181B]">
          <div className="flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-[#FAFAFA]" />
            <h3 className="text-xs font-bold text-[#FAFAFA] uppercase tracking-widest">Recipe Export</h3>
          </div>
          
          <div className="flex items-center bg-[#09090B] p-1 rounded-lg border border-[#27272A]">
            <button
              onClick={() => setCodeMode("python")}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors ${
                codeMode === "python" ? "bg-[#27272A] text-[#FAFAFA]" : "text-[#71717A] hover:text-[#A1A1AA]"
              }`}
            >
              PYTHON
            </button>
            <button
              onClick={() => setCodeMode("yaml")}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors ${
                codeMode === "yaml" ? "bg-[#27272A] text-[#FAFAFA]" : "text-[#71717A] hover:text-[#A1A1AA]"
              }`}
            >
              YAML
            </button>
          </div>
        </div>
        
        <div className="flex-1 p-4 overflow-auto custom-scrollbar">
          <pre className="font-mono text-[11px] leading-relaxed text-[#A1A1AA]">
            <code>{codeMode === "python" ? generatePython() : generateYAML()}</code>
          </pre>
        </div>
      </div>

    </div>
  );
}
