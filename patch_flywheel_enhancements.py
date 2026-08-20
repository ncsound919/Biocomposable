import os
import re

with open('src/components/ClinicalFlywheel.tsx', 'r') as f:
    text = f.read()

# 1. Add motion import
if 'import { motion } from "motion/react"' not in text:
    text = text.replace(
        'import { Droplet',
        'import { motion } from "motion/react";\nimport { Droplet'
    )

# 2. Add syntax highlighter function
highlighter_func = """
const highlightPython = (code: string) => {
  return code
    .replace(/(from|import|class|def|return|if|else|for|in)\\b/g, '<span class="text-[#F59E0B]">$1</span>')
    .replace(/\\b(model|prediction|ranker|priority|banff_label|labeled_pair|coordinator)\\b/g, '<span class="text-[#22D3EE]">$1</span>')
    .replace(/(#.*)/g, '<span class="text-[#71717A]">$1</span>')
    .replace(/("[^"]*")/g, '<span class="text-[#10B981]">$1</span>');
};
"""
if 'const highlightPython' not in text:
    text = text.replace('export function ClinicalFlywheel() {', highlighter_func + '\nexport function ClinicalFlywheel() {')

# 3. Replace pre/code block with highlighted version
text = text.replace(
    '<pre><code>{flywheelArchitecture}</code></pre>',
    '<pre><code dangerouslySetInnerHTML={{ __html: highlightPython(flywheelArchitecture) }} /></pre>'
)

# 4. Animate the 6 steps
text = text.replace(
    '<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">',
    '<motion.div \n        initial="hidden"\n        whileInView="show"\n        viewport={{ once: true, margin: "-50px" }}\n        variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.15 } } }}\n        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative"\n      >'
)

text = text.replace(
    '<div key={phase.id} className="bg-[#09090B] border border-[#27272A]',
    '<motion.div key={phase.id} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } } }} className="bg-[#09090B] border border-[#27272A]'
)

# Remember to close motion.div for the 6 steps
text = re.sub(
    r'(</motion\.div>\n\s*)}\n\s*</div>\n\s*{/\* Code Architecture Block \*/}',
    r'\1}\n      </motion.div>\n\n      {/* Code Architecture Block */}',
    text
)
# Wait, let's just do a string replace for the end of the map:
text = text.replace(
    '          );\n        })}\n      </div>\n\n      {/* Code Architecture',
    '          );\n        })}\n      </motion.div>\n\n      {/* Code Architecture'
)


# 5. Animate Advanced Capabilities
text = text.replace(
    '<div className="grid grid-cols-1 gap-3">\n          {advancedCapabilities.map',
    '<motion.div \n          initial="hidden"\n          whileInView="show"\n          viewport={{ once: true }}\n          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}\n          className="grid grid-cols-1 gap-3"\n        >\n          {advancedCapabilities.map'
)

text = text.replace(
    '<div key={i} className="bg-[#09090B] border border-[#27272A] rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-4 hover:border-[#8B5CF6]/50 transition-colors">',
    '<motion.div key={i} variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }} className="bg-[#09090B] border border-[#27272A] rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-4 hover:border-[#8B5CF6]/50 hover:bg-[#8B5CF6]/5 transition-all duration-300">'
)

text = text.replace(
    '          ))}\n        </div>\n      </div>',
    '          ))}\n        </motion.div>\n      </div>'
)

with open('src/components/ClinicalFlywheel.tsx', 'w') as f:
    f.write(text)

