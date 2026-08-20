import os

with open('src/App.tsx', 'r') as f:
    text = f.read()

# Add imports
if 'RecipeBuilder' not in text:
    text = text.replace(
        'import { SeparationOfConcerns } from "./components/SeparationOfConcerns";',
        'import { SeparationOfConcerns } from "./components/SeparationOfConcerns";\nimport { RecipeBuilder } from "./components/RecipeBuilder";'
    )
    
    text = text.replace(
        'Server, Binary, Layers } from "lucide-react";',
        'Server, Binary, Layers, Blocks } from "lucide-react";'
    )

# Add sections
if 'id="recipe"' not in text:
    sections_html = """
          {/* Recipe Builder Section */}
          <section id="recipe" className="scroll-mt-24 md:col-span-12 flex flex-col relative mb-8">
            <h2 className="text-[11px] font-bold text-[#71717A] uppercase tracking-widest mb-6 flex items-center gap-2 px-2">
              <Blocks className="w-4 h-4 text-[#FAFAFA]" />
              Interactive Recipe Builder: Contract-Aware Composition
            </h2>
            <RecipeBuilder />
          </section>
"""
    # Insert right before Contracts Explorer Section
    text = text.replace('          {/* Contracts Explorer Section */}', sections_html + '\n          {/* Contracts Explorer Section */}')

with open('src/App.tsx', 'w') as f:
    f.write(text)
