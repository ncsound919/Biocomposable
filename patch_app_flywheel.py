import os

with open('src/App.tsx', 'r') as f:
    text = f.read()

# Add imports
if 'ClinicalFlywheel' not in text:
    text = text.replace(
        'import { RecipeBuilder } from "./components/RecipeBuilder";',
        'import { RecipeBuilder } from "./components/RecipeBuilder";\nimport { ClinicalFlywheel } from "./components/ClinicalFlywheel";'
    )
    
    text = text.replace(
        'Blocks } from "lucide-react";',
        'Blocks, RefreshCcw } from "lucide-react";'
    )

# Add nav links
if 'href="#flywheel"' not in text:
    text = text.replace(
        '<a href="#organoid" className="hover:text-[#FAFAFA] transition-colors">ORGANOID TRANSFER</a>',
        '<a href="#flywheel" className="hover:text-[#FAFAFA] transition-colors">FLYWHEEL</a>\n          <a href="#organoid" className="hover:text-[#FAFAFA] transition-colors">ORGANOID TRANSFER</a>'
    )

# Add section (between Recipe and Organoid)
if 'id="flywheel"' not in text:
    sections_html = """
          {/* Clinical Flywheel Section */}
          <section id="flywheel" className="scroll-mt-24 md:col-span-12 bg-[#18181B] border border-[#27272A] rounded-3xl p-6 md:p-8 flex flex-col relative overflow-hidden">
            <h2 className="text-[11px] font-bold text-[#71717A] uppercase tracking-widest mb-6 flex items-center gap-2">
              <RefreshCcw className="w-4 h-4 text-[#10B981]" />
              The Clinical Data Flywheel
            </h2>
            <ClinicalFlywheel />
          </section>
"""
    # Insert right before Organoid Transfer
    text = text.replace('          {/* Organoid Pre-Training Transfer Section */}', sections_html + '\n          {/* Organoid Pre-Training Transfer Section */}')

with open('src/App.tsx', 'w') as f:
    f.write(text)
