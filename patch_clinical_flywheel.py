import os

with open('src/components/ClinicalFlywheel.tsx', 'r') as f:
    text = f.read()

# Add advancedCapabilities to import
text = text.replace(
    'import { flywheelPhases, competitiveComparisons, flywheelMetrics, flywheelArchitecture } from "../flywheelData";',
    'import { flywheelPhases, competitiveComparisons, flywheelMetrics, flywheelArchitecture, advancedCapabilities } from "../flywheelData";'
)

# Add new icons to import
text = text.replace(
    'FileText, Network, RefreshCcw, ArrowRight, ShieldAlert, CheckCircle2, FileCode2 } from "lucide-react";',
    'FileText, Network, RefreshCcw, ArrowRight, ShieldAlert, CheckCircle2, FileCode2, Users, GitBranch, Target } from "lucide-react";'
)

# Update iconMap if needed, though we can just map them inline or add to iconMap.
# Let's map them inline for the new component.

# Add the new section right before the final </div> of ClinicalFlywheel
new_section = """
      {/* Advanced Capabilities */}
      <div className="flex flex-col gap-4 pt-4">
        <h3 className="text-sm font-bold text-[#FAFAFA] flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-[#8B5CF6]" />
          Flywheel-Enabled Advanced Capabilities
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {advancedCapabilities.map((cap, i) => (
            <div key={i} className="bg-[#09090B] border border-[#27272A] rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-4 hover:border-[#8B5CF6]/50 transition-colors">
              <div className="flex items-center gap-3 md:w-1/3 flex-none">
                <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center flex-none">
                  {cap.icon === 'users' && <Users className="w-4 h-4 text-[#8B5CF6]" />}
                  {cap.icon === 'git-branch' && <GitBranch className="w-4 h-4 text-[#8B5CF6]" />}
                  {cap.icon === 'network' && <Network className="w-4 h-4 text-[#8B5CF6]" />}
                  {cap.icon === 'activity' && <Activity className="w-4 h-4 text-[#8B5CF6]" />}
                  {cap.icon === 'microscope' && <Microscope className="w-4 h-4 text-[#8B5CF6]" />}
                </div>
                <h4 className="text-xs font-bold text-[#FAFAFA]">{cap.capability}</h4>
              </div>
              
              <div className="flex-1 flex flex-wrap items-center gap-2">
                {cap.element.split(' → ').map((step, idx, arr) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#A1A1AA] bg-[#18181B] border border-[#3F3F46] px-2 py-1 rounded-md">
                      {step}
                    </span>
                    {idx < arr.length - 1 && (
                      <ArrowRight className="w-3 h-3 text-[#71717A]" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
"""

text = text.replace('    </div>\n  );\n}', new_section + '    </div>\n  );\n}')

with open('src/components/ClinicalFlywheel.tsx', 'w') as f:
    f.write(text)
