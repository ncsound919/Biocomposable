import os

with open('src/App.tsx', 'r') as f:
    text = f.read()

# Add imports
if 'ReproducibilityMetrics' not in text:
    text = text.replace(
        'import { PrioritiesSection } from "./components/PrioritiesSection";',
        'import { PrioritiesSection } from "./components/PrioritiesSection";\nimport { ReproducibilityMetrics } from "./components/ReproducibilityMetrics";\nimport { FederatedGovernance } from "./components/FederatedGovernance";'
    )
    
    text = text.replace(
        'CheckCircle2 } from "lucide-react";',
        'CheckCircle2, Scale, ShieldCheck } from "lucide-react";'
    )

# Add nav links
if 'href="#rpd"' not in text:
    text = text.replace(
        '<a href="#roadmap" className="hover:text-[#FAFAFA] transition-colors">ROADMAP</a>',
        '<a href="#roadmap" className="hover:text-[#FAFAFA] transition-colors">ROADMAP</a>\n          <a href="#rpd" className="hover:text-[#FAFAFA] transition-colors">RPD METRICS</a>\n          <a href="#governance" className="hover:text-[#FAFAFA] transition-colors">FEDERATED GOVERNANCE</a>'
    )

# Add sections
if 'id="rpd"' not in text:
    sections_html = """
          {/* Reproducibility Debt Section */}
          <section id="rpd" className="scroll-mt-24 md:col-span-12 bg-[#18181B] border border-[#27272A] rounded-3xl p-6 md:p-8 flex flex-col relative overflow-hidden">
            <h2 className="text-[11px] font-bold text-[#71717A] uppercase tracking-widest mb-6 flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#FAFAFA]" />
              Reproducibility Debt (RpD) Metrics
            </h2>
            <ReproducibilityMetrics />
          </section>

          {/* Federated Governance Section */}
          <section id="governance" className="scroll-mt-24 md:col-span-12 bg-[#18181B] border border-[#27272A] rounded-3xl p-6 md:p-8 flex flex-col relative overflow-hidden">
            <h2 className="text-[11px] font-bold text-[#71717A] uppercase tracking-widest mb-6 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#FAFAFA]" />
              Federated Governance Layer
            </h2>
            <FederatedGovernance />
          </section>
"""
    text = text.replace('          {/* Roadmap Section */}', sections_html + '\n          {/* Roadmap Section */}')

with open('src/App.tsx', 'w') as f:
    f.write(text)
