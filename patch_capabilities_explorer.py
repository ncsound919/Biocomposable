import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

# Add import
import_stmt = 'import { CapabilitiesExplorer } from "./components/CapabilitiesExplorer";\n'
text = text.replace('import { ReferenceFreeMode } from "./components/ReferenceFreeMode";', import_stmt + 'import { ReferenceFreeMode } from "./components/ReferenceFreeMode";')

# Add to nav
nav_link = '          <a href="#capabilities" className="hover:text-[#FAFAFA] transition-colors">CAPABILITIES</a>\n'
text = text.replace('          <a href="#roadmap" className="hover:text-[#FAFAFA] transition-colors">ROADMAP</a>', nav_link + '          <a href="#roadmap" className="hover:text-[#FAFAFA] transition-colors">ROADMAP</a>')

# Add section
new_section = """
          {/* Capabilities Explorer */}
          <section id="capabilities" className="scroll-mt-24 md:col-span-12 bg-[#18181B] border border-[#27272A] rounded-3xl p-6 md:p-8 flex flex-col">
            <h2 className="text-[11px] font-bold text-[#71717A] uppercase tracking-widest mb-6 flex items-center gap-2">
              <Blocks className="w-4 h-4 text-[#8B5CF6]" />
              Platform Capabilities Explorer
            </h2>
            <CapabilitiesExplorer />
          </section>
"""
text = text.replace('          {/* Roadmap Section */}', new_section + '          {/* Roadmap Section */}')

with open('src/App.tsx', 'w') as f:
    f.write(text)
