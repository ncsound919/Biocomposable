import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

# Make sure we have useState imported
if 'import { useState' not in text:
    if 'import React' in text:
        text = text.replace('import React', 'import React, { useState }')
    else:
        text = 'import { useState } from "react";\n' + text

# Inject state variable
if 'const [agentMode, setAgentMode]' not in text:
    text = re.sub(
        r'(export function App\(\) \{|function App\(\) \{|export default function App\(\) \{)', 
        r'\1\n  const [agentMode, setAgentMode] = useState("reference_free");\n', 
        text
    )

# Replace <AgentAPI /> with <AgentAPI activeMode={agentMode} />
text = text.replace('<AgentAPI />', '<AgentAPI activeMode={agentMode} />')

# Replace <ReferenceFreeMode /> with <ReferenceFreeMode activeMode={agentMode} onModeChange={setAgentMode} />
text = text.replace('<ReferenceFreeMode />', '<ReferenceFreeMode activeMode={agentMode} onModeChange={setAgentMode} />')

with open('src/App.tsx', 'w') as f:
    f.write(text)
