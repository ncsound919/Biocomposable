import os

with open('src/App.tsx', 'r') as f:
    text = f.read()

# Add import
if 'OrganoidTransfer' not in text:
    text = text.replace(
        'import { CrossPlatformBench } from "./components/CrossPlatformBench";',
        'import { CrossPlatformBench } from "./components/CrossPlatformBench";\nimport { OrganoidTransfer } from "./components/OrganoidTransfer";'
    )
    
    text = text.replace(
        'ShieldCheck, Network } from "lucide-react";',
        'ShieldCheck, Network, TestTube2 } from "lucide-react";'
    )

# Add nav link
if 'href="#organoid"' not in text:
    text = text.replace(
        '<a href="#cross-platform" className="hover:text-[#FAFAFA] transition-colors">CROSS-PLATFORM</a>',
        '<a href="#cross-platform" className="hover:text-[#FAFAFA] transition-colors">CROSS-PLATFORM</a>\n          <a href="#organoid" className="hover:text-[#FAFAFA] transition-colors">ORGANOID TRANSFER</a>'
    )

# Add section
if 'id="organoid"' not in text:
    section_html = """
          {/* Organoid Pre-Training Transfer Section */}
          <section id="organoid" className="scroll-mt-24 md:col-span-12 bg-[#18181B] border border-[#27272A] rounded-3xl p-6 md:p-8 flex flex-col relative overflow-hidden">
            <h2 className="text-[11px] font-bold text-[#71717A] uppercase tracking-widest mb-6 flex items-center gap-2">
              <TestTube2 className="w-4 h-4 text-[#FAFAFA]" />
              Organoid Pre-training & Clinical Transfer (bio-bench)
            </h2>
            <OrganoidTransfer />
          </section>
"""
    # Insert right before cross-platform so they are visually grouped together
    text = text.replace('          {/* Cross-Platform Generalization Section */}', section_html + '\n          {/* Cross-Platform Generalization Section */}')

with open('src/App.tsx', 'w') as f:
    f.write(text)
