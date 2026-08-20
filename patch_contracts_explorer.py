import re

with open('src/components/ContractsExplorer.tsx', 'r') as f:
    text = f.read()

# Replace description rendering with role and decision
old_html = """                <p className="text-[#A1A1AA] mb-4 text-xs leading-relaxed">
                  {contract.description}
                </p>"""

new_html = """                <p className="text-[#A1A1AA] mb-4 text-xs leading-relaxed font-medium">
                  {contract.role}
                </p>
                
                <div className="mb-4 bg-[#22D3EE]/5 border border-[#22D3EE]/20 rounded-xl p-4 flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#22D3EE] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Key Architectural Decision
                  </span>
                  <p className="text-xs text-[#FAFAFA] leading-relaxed">
                    {contract.decision}
                  </p>
                </div>"""

text = text.replace(old_html, new_html)

with open('src/components/ContractsExplorer.tsx', 'w') as f:
    f.write(text)
