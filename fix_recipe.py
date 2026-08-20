import re

with open('src/components/RecipeBuilder.tsx', 'r') as f:
    text = f.read()

new_content = """import { useState, useMemo } from "react";
import {
  componentsList,
  COMPONENT_LAYERS,
  canAddComponent,
  getMissingRequirements,
  validateDAG,
  type RecipeStepState,
  type DAGStatus,
  type ComponentParameter,
} from "../data";
import { Plus, X, Play, Code2, ChevronRight, Lock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type CodeFormat = "python" | "yaml";

const DAG_BADGE: Record<DAGStatus, { label: string; color: string; bg: string; border: string }> = {
  empty: { label: "DAG: EMPTY", color: "text-[#71717A]", bg: "bg-[#27272A]", border: "border-[#3F3F46]" },
  invalid: { label: "DAG: INVALID", color: "text-[#EF4444]", bg: "bg-[#EF4444]/10", border: "border-[#EF4444]/30" },
  valid: { label: "DAG: VALID", color: "text-[#22C55E]", bg: "bg-[#22C55E]/10", border: "border-[#22C55E]/30" },
};

function formatParamValue(param: ComponentParameter, value: string | number | boolean): string {
  if (param.type === "boolean" || param.type === "number") return String(value);
  return `"${value}"`;
}

export function RecipeBuilder() {
  const [recipeSteps, setRecipeSteps] = useState<RecipeStepState[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [codeFormat, setCodeFormat] = useState<CodeFormat>("python");

  const dagStatus = useMemo(() => validateDAG(recipeSteps), [recipeSteps]);
  const badge = DAG_BADGE[dagStatus];

  const addStep = (id: string) => {
    const comp = componentsList.find((c) => c.id === id);
    if (!comp || recipeSteps.some((s) => s.id === id)) return;
    if (!canAddComponent(comp, recipeSteps)) return;

    const defaultParams: Record<string, string | number | boolean> = {};
    comp.parameters.forEach((p) => {
      defaultParams[p.name] = p.default;
    });

    setRecipeSteps([
      ...recipeSteps,
      {
        id,
        params: defaultParams,
        condition: comp.defaultCondition ?? null,
        expanded: false,
      },
    ]);
  };

  const removeStep = (id: string) => {
    setRecipeSteps(recipeSteps.filter((s) => s.id !== id));
  };

  const toggleExpand = (id: string) => {
    setRecipeSteps(
      recipeSteps.map((s) => (s.id === id ? { ...s, expanded: !s.expanded } : s))
    );
  };

  const updateParam = (stepId: string, paramName: string, value: string | number | boolean) => {
    setRecipeSteps(
      recipeSteps.map((s) =>
        s.id === stepId
          ? { ...s, params: { ...s.params, [paramName]: value } }
          : s
      )
    );
  };

  const toggleCondition = (stepId: string) => {
    setRecipeSteps(
      recipeSteps.map((s) => {
        if (s.id !== stepId) return s;
        const comp = componentsList.find((c) => c.id === stepId);
        return {
          ...s,
          condition: s.condition === null ? (comp?.defaultCondition ?? "") : null,
        };
      })
    );
  };

  const updateCondition = (stepId: string, value: string) => {
    setRecipeSteps(
      recipeSteps.map((s) => (s.id === stepId ? { ...s, condition: value } : s))
    );
  };

  const generateCode = (): string => {
    if (recipeSteps.length === 0) {
      return codeFormat === "python"
        ? "# Add components to build your recipe...\\n"
        : "# Add components to build your recipe...\\n";
    }

    if (codeFormat === "python") {
      let code = `# Composable transplant bioinformatics recipe\\n`;
      code += `recipe = Recipe("custom_pipeline")\\n\\n`;
      recipeSteps.forEach((step) => {
        const comp = componentsList.find((c) => c.id === step.id);
        if (!comp) return;
        const paramParts = comp.parameters.map((p) => {
          const val = step.params[p.name] ?? p.default;
          return `${p.name}=${formatParamValue(p, val)}`;
        });
        const paramStr = paramParts.length > 0 ? `, ${paramParts.join(", ")}` : "";
        const conditionStr = step.condition
          ? `,\\n                condition="${step.condition}"`
          : "";
        code += `recipe.add_step("${comp.packageName}"${paramStr}${conditionStr})\\n`;
      });
      return code;
    } else {
      let code = `name: custom_pipeline\\n`;
      code += `contract_version: "0.1.0"\\n`;
      code += `steps:\\n`;
      recipeSteps.forEach((step) => {
        const comp = componentsList.find((c) => c.id === step.id);
        if (!comp) return;
        code += `  - component: ${comp.packageName}\\n`;
        code += `    version: "${comp.version}"\\n`;
        if (comp.parameters.length > 0) {
          code += `    params:\\n`;
          comp.parameters.forEach((p) => {
            const val = step.params[p.name] ?? p.default;
            code += `      ${p.name}: ${formatParamValue(p, val)}\\n`;
          });
        }
        if (step.condition) {
          code += `    condition: "${step.condition}"\\n`;
        }
      });
      return code;
    }
  };

  return (
    <div className="bg-[#09090B] border border-[#27272A] rounded-2xl overflow-hidden flex flex-col min-h-[450px]">
      {/* Builder Side */}
      <div className="w-full p-5 flex flex-col border-b border-[#27272A]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#71717A]">
            Pipeline Steps
          </h3>
          <div className="flex items-center gap-2">
            {dagStatus === "invalid" && (
              <span className="flex items-center gap-1 text-[9px] font-mono text-[#EF4444]">
                <AlertTriangle className="w-2.5 h-2.5" />
                Unmet dependencies
              </span>
            )}
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded border ${badge.color} ${badge.bg} ${badge.border}`}
            >
              {badge.label}
            </span>
          </div>
        </div>

        {/* Layer-grouped component picker */}
        <div className="flex gap-3 overflow-x-auto pb-2 mb-3">
          {COMPONENT_LAYERS.map((layer) => {
            const layerComps = componentsList.filter((c) => c.layer === layer.value);
            if (layerComps.length === 0) return null;
            return (
              <div key={layer.value} className="flex-none">
                <span className="text-[8px] font-mono uppercase tracking-wider text-[#52525B] block mb-1">
                  {layer.label}
                </span>
                <div className="flex flex-col gap-1">
                  {layerComps.map((comp) => {
                    const isAdded = recipeSteps.some((s) => s.id === comp.id);
                    const canAdd = canAddComponent(comp, recipeSteps);
                    const missing = getMissingRequirements(comp, recipeSteps);
                    const disabled = isAdded || !canAdd;
                    return (
                      <button
                        key={comp.id}
                        onClick={() => addStep(comp.id)}
                        disabled={disabled}
                        title={
                          isAdded
                            ? "Already added"
                            : !canAdd
                            ? `Requires: ${missing.join(", ")}`
                            : comp.description
                        }
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-mono transition-colors border whitespace-nowrap ${
                          isAdded
                            ? "opacity-30 cursor-not-allowed bg-[#18181B] border-[#27272A] text-[#71717A]"
                            : !canAdd
                            ? "opacity-50 cursor-not-allowed bg-[#18181B] border-[#27272A] text-[#52525B]"
                            : "bg-[#27272A] hover:bg-[#3F3F46] border-[#3F3F46] text-[#FAFAFA]"
                        }`}
                      >
                        {disabled && !isAdded ? (
                          <Lock className="w-2.5 h-2.5" />
                        ) : (
                          <Plus className="w-3 h-3" />
                        )}
                        {comp.packageName}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Recipe steps with inline params */}
        <div className="min-h-[120px] border border-dashed border-[#3F3F46] rounded-xl p-3 flex flex-col gap-2">
          <AnimatePresence>
            {recipeSteps.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex items-center justify-center text-[#71717A] text-[10px] font-mono"
              >
                No components added yet.
              </motion.div>
            )}
            {recipeSteps.map((step, idx) => {
              const comp = componentsList.find((c) => c.id === step.id);
              if (!comp) return null;
              const hasParams = comp.parameters.length > 0;
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-[#18181B] border border-[#27272A] rounded-lg overflow-hidden"
                >
                  {/* Step header */}
                  <div className="flex items-center justify-between p-2">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-5 h-5 rounded text-[9px] font-mono bg-[#27272A] text-[#22D3EE] border border-[#3F3F46]">
                        {idx + 1}
                      </span>
                      <button
                        onClick={() => hasParams && toggleExpand(step.id)}
                        className="flex items-center gap-1 group"
                        disabled={!hasParams}
                      >
                        {hasParams && (
                          <ChevronRight
                            className={`w-3 h-3 text-[#52525B] transition-transform ${
                              step.expanded ? "rotate-90" : ""
                            }`}
                          />
                        )}
                        <span className="text-[10px] text-[#A1A1AA] font-mono group-hover:text-[#FAFAFA] transition-colors">
                          {comp.packageName}
                        </span>
                      </button>
                      {step.condition !== null && (
                        <span className="text-[8px] font-mono text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/20 px-1.5 py-0.5 rounded">
                          conditional
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {comp.defaultCondition && (
                        <button
                          onClick={() => toggleCondition(step.id)}
                          className={`text-[8px] font-mono px-1.5 py-0.5 rounded border transition-colors ${
                            step.condition !== null
                              ? "text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20"
                              : "text-[#52525B] bg-[#27272A] border-[#3F3F46] hover:text-[#71717A]"
                          }`}
                          title="Toggle conditional execution"
                        >
                          if
                        </button>
                      )}
                      <button
                        onClick={() => removeStep(step.id)}
                        className="p-1 hover:bg-[#EF4444]/10 hover:text-[#EF4444] rounded text-[#71717A] transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Inline parameter panel */}
                  <AnimatePresence>
                    {step.expanded && hasParams && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-[#27272A]"
                      >
                        <div className="p-2 pl-9 flex flex-wrap gap-2">
                          {comp.parameters.map((param) => (
                            <ParameterInput
                              key={param.name}
                              param={param}
                              value={step.params[param.name] ?? param.default}
                              onChange={(val) => updateParam(step.id, param.name, val)}
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Condition editor */}
                  <AnimatePresence>
                    {step.condition !== null && comp.defaultCondition && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-[#27272A]"
                      >
                        <div className="p-2 pl-9 flex items-center gap-2">
                          <span className="text-[8px] font-mono text-[#F59E0B]">condition:</span>
                          <input
                            type="text"
                            value={step.condition}
                            onChange={(e) => updateCondition(step.id, e.target.value)}
                            className="flex-1 bg-[#09090B] border border-[#3F3F46] rounded text-[9px] font-mono text-[#A1A1AA] px-2 py-1 focus:outline-none focus:border-[#F59E0B]/30"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Code Side */}
      <div className="w-full bg-[#18181B] flex flex-col flex-1 relative">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#27272A] bg-[#18181B]">
          <div className="flex items-center gap-2 text-[#71717A]">
            <Code2 className="w-3.5 h-3.5" />
            <span className="font-mono text-[10px] uppercase tracking-widest">Generated Recipe</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Format toggle */}
            <div className="flex bg-[#27272A] border border-[#3F3F46] rounded overflow-hidden">
              {(["python", "yaml"] as CodeFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setCodeFormat(fmt)}
                  className={`px-2 py-1 text-[9px] font-mono transition-colors ${
                    codeFormat === fmt
                      ? "bg-[#22D3EE]/10 text-[#22D3EE]"
                      : "text-[#71717A] hover:text-[#A1A1AA]"
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setIsSimulating(true);
                setTimeout(() => setIsSimulating(false), 2000);
              }}
              disabled={recipeSteps.length === 0 || dagStatus === "invalid" || isSimulating}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#22D3EE]/10 hover:bg-[#22D3EE]/20 border border-[#22D3EE]/30 disabled:opacity-30 disabled:hover:bg-[#22D3EE]/10 text-[#22D3EE] text-[10px] font-bold uppercase tracking-wider rounded transition-colors"
            >
              {isSimulating ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                  <Play className="w-3 h-3" />
                </motion.div>
              ) : (
                <Play className="w-3 h-3" />
              )}
              {isSimulating ? "Running" : "Run"}
            </button>
          </div>
        </div>

        <div className="p-5 overflow-x-auto flex-grow relative">
          <pre className="font-mono text-[10px] leading-loose text-[#A1A1AA]">
            <code>
              {generateCode().split("\\n").map((line, i) => (
                <div key={i} className="table-row">
                  <span className="table-cell text-[#3F3F46] pr-4 select-none text-right w-6">
                    {i + 1}
                  </span>
                  <span className="table-cell">{renderCodeLine(line, codeFormat)}</span>
                </div>
              ))}
            </code>
          </pre>

          <AnimatePresence>
            {isSimulating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[#09090B]/80 backdrop-blur-sm flex items-center justify-center z-10"
              >
                <div className="bg-[#18181B] border border-[#22D3EE]/30 p-5 rounded-xl max-w-[250px] w-full shadow-2xl text-center">
                  <div className="w-8 h-8 border-2 border-[#22D3EE]/20 border-t-[#22D3EE] rounded-full animate-spin mx-auto mb-3" />
                  <h4 className="text-[#FAFAFA] text-xs font-bold mb-1">Validating Contracts...</h4>
                  <p className="text-[#71717A] text-[10px] font-mono">Checking DAG edges</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function ParameterInput({
  param,
  value,
  onChange,
}: {
  param: ComponentParameter;
  value: string | number | boolean;
  onChange: (value: string | number | boolean) => void;
}) {
  if (param.type === "select" && param.options) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-[8px] font-mono text-[#52525B]">{param.name}</span>
        <select
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          className="bg-[#09090B] border border-[#3F3F46] rounded text-[9px] font-mono text-[#A1A1AA] px-1.5 py-0.5 focus:outline-none focus:border-[#22D3EE]/30"
        >
          {param.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (param.type === "boolean") {
    return (
      <div className="flex items-center gap-1">
        <span className="text-[8px] font-mono text-[#52525B]">{param.name}</span>
        <button
          onClick={() => onChange(!value)}
          className={`text-[9px] font-mono px-1.5 py-0.5 rounded border transition-colors ${
            value
              ? "bg-[#22D3EE]/10 text-[#22D3EE] border-[#22D3EE]/30"
              : "bg-[#27272A] text-[#71717A] border-[#3F3F46]"
          }`}
        >
          {value ? "true" : "false"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <span className="text-[8px] font-mono text-[#52525B]">{param.name}</span>
      <input
        type={param.type === "number" ? "number" : "text"}
        value={String(value)}
        onChange={(e) =>
          onChange(param.type === "number" ? Number(e.target.value) : e.target.value)
        }
        className="bg-[#09090B] border border-[#3F3F46] rounded text-[9px] font-mono text-[#A1A1AA] px-1.5 py-0.5 w-28 focus:outline-none focus:border-[#22D3EE]/30"
      />
    </div>
  );
}

function renderCodeLine(line: string, format: CodeFormat) {
  if (line.startsWith("#")) return <span className="text-[#71717A]">{line}</span>;

  if (format === "yaml") {
    if (line.startsWith("  - component:"))
      return (
        <span>
          <span className="text-[#52525B]">  - </span>
          <span className="text-[#F59E0B]">component</span>
          <span className="text-[#71717A]">: </span>
          <span className="text-[#22D3EE]">{line.substring(13)}</span>
        </span>
      );
    if (line.startsWith("    condition:"))
      return (
        <span>
          <span className="text-[#F59E0B]">    condition</span>
          <span className="text-[#71717A]">: </span>
          <span className="text-[#A1A1AA]">{line.substring(14)}</span>
        </span>
      );
    if (line.startsWith("    version:"))
      return (
        <span>
          <span className="text-[#71717A]">    version: </span>
          <span className="text-[#22D3EE]">{line.substring(12)}</span>
        </span>
      );
    if (line.startsWith("      "))
      return (
        <span>
          <span className="text-[#71717A]">      </span>
          <span className="text-[#F59E0B]">{line.substring(6).split(":")[0]}</span>
          <span className="text-[#71717A]">:{line.substring(6).split(":").slice(1).join(":")}</span>
        </span>
      );
    if (line.startsWith("    params:"))
      return <span className="text-[#71717A]">    params:</span>;
    if (line.startsWith("name:"))
      return (
        <span>
          <span className="text-[#F59E0B]">name</span>
          <span className="text-[#71717A]">: </span>
          <span className="text-[#22D3EE]">{line.substring(6)}</span>
        </span>
      );
    if (line.startsWith("contract"))
      return (
        <span>
          <span className="text-[#F59E0B]">{line.split(":")[0]}</span>
          <span className="text-[#71717A]">:{line.substring(line.indexOf(":"))}</span>
        </span>
      );
    return <span>{line}</span>;
  }

  // Python
  if (line.includes("Recipe("))
    return (
      <span>
        <span className="text-[#22D3EE]">Recipe</span>
        {line.substring(6)}
      </span>
    );
  if (line.includes("add_step"))
    return (
      <span>
        recipe.<span className="text-[#F59E0B]">add_step</span>
        {line.substring(15)}
      </span>
    );
  if (line.includes("condition="))
    return (
      <span>
        <span className="text-[#71717A]">{line.split("condition")[0]}</span>
        <span className="text-[#F59E0B]">condition</span>
        <span className="text-[#A1A1AA]">{line.substring(line.indexOf("condition") + 9)}</span>
      </span>
    );
  return <span>{line}</span>;
}
"""
with open('src/components/RecipeBuilder.tsx', 'w') as f:
    f.write(new_content)
