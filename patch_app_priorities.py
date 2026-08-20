import os

with open('src/App.tsx', 'r') as f:
    text = f.read()

if 'PrioritiesSection' not in text:
    text = text.replace(
        'import { RoadmapSection } from "./components/RoadmapSection";',
        'import { RoadmapSection } from "./components/RoadmapSection";\nimport { PrioritiesSection } from "./components/PrioritiesSection";'
    )
    
    text = text.replace(
        'import { Dna, Layers, FileCode2, Package, GitMerge, ShieldCheck, Map } from "lucide-react";',
        'import { Dna, Layers, FileCode2, Package, GitMerge, ShieldCheck, Map, CheckCircle2 } from "lucide-react";'
    )

if 'href="#priorities"' not in text:
    text = text.replace(
        '<a href="#determinism" className="hover:text-[#FAFAFA] transition-colors">DETERMINISM</a>',
        '<a href="#priorities" className="hover:text-[#FAFAFA] transition-colors">PRIORITIES</a>\n          <a href="#determinism" className="hover:text-[#FAFAFA] transition-colors">DETERMINISM</a>'
    )

if 'id="priorities"' not in text:
    priorities_html = """
          {/* Architecture Priorities */}
          <section id="priorities" className="scroll-mt-24 md:col-span-12 bg-[#18181B] border border-[#27272A] rounded-3xl p-6 md:p-8 flex flex-col">
            <h2 className="text-[11px] font-bold text-[#71717A] uppercase tracking-widest mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              Core Architecture Priorities
            </h2>
            <PrioritiesSection />
          </section>
"""
    text = text.replace('          {/* Determinism Section */}', priorities_html + '\n          {/* Determinism Section */}')

with open('src/App.tsx', 'w') as f:
    f.write(text)
