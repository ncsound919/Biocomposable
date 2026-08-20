import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

# Add RoadmapSection import
if 'RoadmapSection' not in text:
    text = text.replace(
        'import { DeterminismSection } from "./components/DeterminismSection";',
        'import { DeterminismSection } from "./components/DeterminismSection";\nimport { RoadmapSection } from "./components/RoadmapSection";'
    )
    
    text = text.replace(
        'import { Dna, Layers, FileCode2, Package, GitMerge, ShieldCheck } from "lucide-react";',
        'import { Dna, Layers, FileCode2, Package, GitMerge, ShieldCheck, Map } from "lucide-react";'
    )

# Add nav link
if 'href="#roadmap"' not in text:
    text = text.replace(
        '<a href="#determinism" className="hover:text-[#FAFAFA] transition-colors">DETERMINISM</a>',
        '<a href="#determinism" className="hover:text-[#FAFAFA] transition-colors">DETERMINISM</a>\n          <a href="#roadmap" className="hover:text-[#FAFAFA] transition-colors">ROADMAP</a>'
    )

# Add roadmap section
if 'id="roadmap"' not in text:
    roadmap_html = """
          {/* Roadmap Section */}
          <section id="roadmap" className="scroll-mt-24 md:col-span-12 bg-[#18181B] border border-[#27272A] rounded-3xl p-6 md:p-8 flex flex-col">
            <h2 className="text-[11px] font-bold text-[#71717A] uppercase tracking-widest mb-6 flex items-center gap-2">
              <Map className="w-4 h-4 text-[#F59E0B]" />
              Implementation Roadmap
            </h2>
            <RoadmapSection />
          </section>
        </div>
"""
    text = text.replace('        </div>\n\n      </main>', roadmap_html + '\n      </main>')

with open('src/App.tsx', 'w') as f:
    f.write(text)
