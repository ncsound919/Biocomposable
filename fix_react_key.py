with open('src/components/RecipeBuilder.tsx', 'r') as f:
    text = f.read()

text = text.replace("key?: React.Key;", "key?: string | number;")

with open('src/components/RecipeBuilder.tsx', 'w') as f:
    f.write(text)
