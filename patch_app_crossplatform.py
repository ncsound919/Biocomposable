import os

with open('src/App.tsx', 'r') as f:
    text = f.read()

# Add import
if 'CrossPlatformBench' not in text:
    text = text.replace(
        'import { FederatedGovernance } from "./components/FederatedGovernance";',
        'import { FederatedGovernance } from "./components/FederatedGovernance";\nimport { CrossPlatformBench } from "./components/CrossPlatformBench";'
    )
    
    text = text.replace(
        'ShieldCheck } from "lucide-react";',
        'ShieldCheck, Network } from "lucide-react";'
    )

# Add nav link
if 'href="#cross-platform"' not in text:
    text = text.replace(
        '<a href="#governance" className="hover:text-[#FAFAFA] transition-colors">FEDERATED GOVERNANCE</a>',
        '<a href="#governance" className="hover:text-[#FAFAFA] transition-colors">FEDERATED GOVERNANCE</a>\n          <a href="#cross-platform" className="hover:text-[#FAFAFA] transition-colors">CROSS-PLATFORM</a>'
    )

# Add section
if 'id="cross-platform"' not in text:
    section_html = """
          {/* Cross-Platform Generalization Section */}
          <section id="cross-platform" className="scroll-mt-24 md:col-span-12 bg-[#18181B] border border-[#27272A] rounded-3xl p-6 md:p-8 flex flex-col relative overflow-hidden">
            <h2 className="text-[11px] font-bold text-[#71717A] uppercase tracking-widest mb-6 flex items-center gap-2">
              <Network className="w-4 h-4 text-[#FAFAFA]" />
              Cross-Platform Generalization (bio-bench)
            </h2>
            <CrossPlatformBench />
          </section>
"""
    text = text.replace('          {/* Determinism Section */}', section_html + '\n          {/* Determinism Section */}')

with open('src/App.tsx', 'w') as f:
    f.write(text)
