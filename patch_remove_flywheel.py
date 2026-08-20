import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

# Regex to match the section block
pattern = r'\{\s*/\*\s*[^>]*\s*\*/\s*\}\s*<section id="flywheel"[\s\S]*?</section>'
text = re.sub(pattern, '', text)

# Remove import
pattern = r'import \{ ClinicalFlywheel \} from "\./components/ClinicalFlywheel";\n'
text = re.sub(pattern, '', text)

# Remove nav link
pattern = r'<a href="#flywheel"[^>]*>.*?</a>\s*'
text = re.sub(pattern, '', text)

with open('src/App.tsx', 'w') as f:
    f.write(text)
