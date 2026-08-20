import re

with open('src/components/CapabilitiesExplorer.tsx', 'r') as f:
    text = f.read()

# Replace min-h-[600px] relative overflow-hidden
text = text.replace(
    'min-h-[600px] relative overflow-hidden',
    'min-h-[600px] relative'
)

# Replace w-full h-full on motion.div
text = text.replace(
    'className="w-full h-full"',
    'className="w-full"'
)

with open('src/components/CapabilitiesExplorer.tsx', 'w') as f:
    f.write(text)
