import os

with open('src/App.tsx', 'r') as f:
    text = f.read()

# Add imports
if 'SeparationOfConcerns' not in text:
    text = text.replace(
        'import { AgentAPI } from "./components/AgentAPI";',
        'import { SeparationOfConcerns } from "./components/SeparationOfConcerns";\nimport { AgentAPI } from "./components/AgentAPI";'
    )
    
    text = text.replace(
        'ShieldCheck, Network, TestTube2, Server, Binary } from "lucide-react";',
        'ShieldCheck, Network, TestTube2, Server, Binary, Layers } from "lucide-react";'
    )

# Add nav links
if 'href="#architecture"' not in text:
    text = text.replace(
        '<a href="#contracts" className="hover:text-[#FAFAFA] transition-colors">CONTRACTS</a>',
        '<a href="#architecture" className="hover:text-[#FAFAFA] transition-colors">ARCHITECTURE</a>\n          <a href="#contracts" className="hover:text-[#FAFAFA] transition-colors">CONTRACTS</a>'
    )

# Add sections
if 'id="architecture"' not in text:
    sections_html = """
          {/* Core Architecture Section (Separation of Concerns) */}
          <section id="architecture" className="scroll-mt-24 md:col-span-12 bg-[#18181B] border border-[#27272A] rounded-3xl p-6 md:p-8 flex flex-col relative overflow-hidden">
            <h2 className="text-[11px] font-bold text-[#71717A] uppercase tracking-widest mb-6 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#FAFAFA]" />
              Separation of Concerns: The Composable Architecture
            </h2>
            <SeparationOfConcerns />
          </section>
"""
    # Insert right after Hero (before Contracts)
    text = text.replace('          {/* Contracts Explorer Section */}', sections_html + '\n          {/* Contracts Explorer Section */}')

with open('src/App.tsx', 'w') as f:
    f.write(text)
