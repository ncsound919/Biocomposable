with open('src/types.ts', 'r') as f:
    text = f.read()

text = text.replace('''export interface Contract {
  id: string;
  name: string;
  description: string;
  code: string;
}''', '''export interface Contract {
  id: string;
  name: string;
  role: string;
  decision: string;
  code: string;
}''')

with open('src/types.ts', 'w') as f:
    f.write(text)
