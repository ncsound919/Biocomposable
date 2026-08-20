import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

# List of components to remove from imports and JSX
components_to_remove = [
    "ComponentRegistry",
    "PrioritiesSection",
    "OrganoidTransfer",
    "CrossPlatformBench",
    "DeterminismSection",
    "FederatedGovernance",
    "SeparationOfConcerns" # The user might want this removed if it's overexplaining? wait, it has interactivity? grep said it has onClick or useState. Let's keep it if it has interactivity.
]

# Let's check which ones have no interactivity
sections_to_remove = [
    "components",
    "priorities",
    "organoid",
    "cross-platform",
    "determinism",
    "governance"
]

for section in sections_to_remove:
    # Regex to match the section block
    pattern = r'\{\s*/\*\s*[^>]*\s*\*/\s*\}\s*<section id="' + section + r'"[\s\S]*?</section>'
    text = re.sub(pattern, '', text)

# Remove imports
for comp in components_to_remove:
    pattern = r'import \{ ' + comp + r' \} from "\./components/' + comp + r'";\n'
    text = re.sub(pattern, '', text)

# Remove any nav links pointing to removed sections
nav_links_to_remove = [
    r'<a href="#' + sec + r'"[^>]*>.*?</a>\s*' for sec in sections_to_remove
]
for pattern in nav_links_to_remove:
    text = re.sub(pattern, '', text)


with open('src/App.tsx', 'w') as f:
    f.write(text)
