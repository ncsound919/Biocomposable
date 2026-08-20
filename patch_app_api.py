import os

with open('src/App.tsx', 'r') as f:
    text = f.read()

# Add imports
if 'AgentAPI' not in text:
    text = text.replace(
        'import { OrganoidTransfer } from "./components/OrganoidTransfer";',
        'import { OrganoidTransfer } from "./components/OrganoidTransfer";\nimport { AgentAPI } from "./components/AgentAPI";\nimport { ReferenceFreeMode } from "./components/ReferenceFreeMode";'
    )
    
    text = text.replace(
        'ShieldCheck, Network, TestTube2 } from "lucide-react";',
        'ShieldCheck, Network, TestTube2, Server, Binary } from "lucide-react";'
    )

# Add nav links
if 'href="#agent-api"' not in text:
    text = text.replace(
        '<a href="#priorities" className="hover:text-[#FAFAFA] transition-colors">PRIORITIES</a>',
        '<a href="#priorities" className="hover:text-[#FAFAFA] transition-colors">PRIORITIES</a>\n          <a href="#agent-api" className="hover:text-[#FAFAFA] transition-colors">AGENT API</a>\n          <a href="#reference-free" className="hover:text-[#FAFAFA] transition-colors">REFERENCE-FREE</a>'
    )

# Add sections
if 'id="agent-api"' not in text:
    sections_html = """
          {/* Agent API Section */}
          <section id="agent-api" className="scroll-mt-24 md:col-span-12 bg-[#18181B] border border-[#27272A] rounded-3xl p-6 md:p-8 flex flex-col relative overflow-hidden">
            <h2 className="text-[11px] font-bold text-[#71717A] uppercase tracking-widest mb-6 flex items-center gap-2">
              <Server className="w-4 h-4 text-[#FAFAFA]" />
              Agent API (/agent/v1)
            </h2>
            <AgentAPI />
          </section>

          {/* Reference-Free Mode Section */}
          <section id="reference-free" className="scroll-mt-24 md:col-span-12 bg-[#18181B] border border-[#27272A] rounded-3xl p-6 md:p-8 flex flex-col relative overflow-hidden">
            <h2 className="text-[11px] font-bold text-[#71717A] uppercase tracking-widest mb-6 flex items-center gap-2">
              <Binary className="w-4 h-4 text-[#FAFAFA]" />
              Reference-Free Mapping Mode
            </h2>
            <ReferenceFreeMode />
          </section>
"""
    text = text.replace('          {/* Organoid Pre-Training Transfer Section */}', sections_html + '\n          {/* Organoid Pre-Training Transfer Section */}')

with open('src/App.tsx', 'w') as f:
    f.write(text)
