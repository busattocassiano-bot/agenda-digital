import re
import sys

file_path = r'C:\Users\cassi\.gemini\antigravity\scratch\agenda-digital\src\pages\Agenda.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = re.compile(
    r"<Plus size=\{18\} /> Usar avalia[^\s]+ de \{mat\.modalidade\}",
    re.DOTALL
)

new_code = r"<Plus size={18} /> Usar avaliação de {mat.modalidade} {mat.dataInicio ? `(criada em ${mat.dataInicio.split('-').reverse().join('/')})` : ''}"

if not pattern.search(content):
    print("Pattern not found!")
    sys.exit(1)

content = pattern.sub(new_code, content)
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Replaced!")
