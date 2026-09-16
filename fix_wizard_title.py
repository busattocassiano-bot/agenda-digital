import re
import sys

file_path = r'C:\Users\cassi\.gemini\antigravity\scratch\agenda-digital\src\components\AvaliacaoWizardModal.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace any variant of Recepcionar Novo Aluno (Avaliação) with just Avaliação
pattern = re.compile(r"Recepcionar Novo Aluno \(Avalia[^\)]+\)")

new_code = r"Avaliação"

if not pattern.search(content):
    print("Pattern not found!")
    sys.exit(1)

content = pattern.sub(new_code, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Replaced title safely!")
