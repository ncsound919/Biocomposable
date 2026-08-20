import re

with open('src/components/ReproducibilityMetrics.tsx', 'r') as f:
    text = f.read()

old_html = """        <div className="text-xs text-[#71717A] font-mono border border-[#3F3F46] bg-[#27272A] px-2 py-1 rounded">
          Target: &lt; 0.10
        </div>
        <p className="text-[11px] text-[#A1A1AA] mt-4 leading-relaxed">
          Quantitative measure of non-deterministic risks, missing digests, and unpinned dependencies. 
        </p>"""

new_html = """        <div className="w-full px-4 mt-2">
          <div className="w-full bg-[#09090B] border border-[#27272A] rounded-full h-2 overflow-hidden relative">
            <div 
              className={`h-full absolute left-0 top-0 ${Number(totalDebt) > 0.10 ? 'bg-[#EF4444]' : 'bg-[#10B981]'}`}
              style={{ width: `${Math.min(Number(totalDebt) * 100, 100)}%` }}
            />
            {/* Target line */}
            <div className="absolute left-[10%] top-0 bottom-0 w-px bg-[#FAFAFA] z-10" />
          </div>
          <div className="flex justify-between items-center w-full mt-2">
            <span className="text-[9px] font-mono text-[#10B981]">0.0</span>
            <span className="text-[9px] font-mono text-[#FAFAFA]">Target &lt;0.10</span>
            <span className="text-[9px] font-mono text-[#EF4444]">1.0</span>
          </div>
        </div>
        <p className="text-[11px] text-[#A1A1AA] mt-4 leading-relaxed">
          Scores every pipeline entry in bio-bench. Penalizes non-deterministic risks, missing digests, and unpinned dependencies. 
        </p>"""

text = text.replace(old_html, new_html)

with open('src/components/ReproducibilityMetrics.tsx', 'w') as f:
    f.write(text)
