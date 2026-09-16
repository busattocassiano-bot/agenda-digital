import re
import sys

file_path = r'C:\Users\cassi\.gemini\antigravity\scratch\agenda-digital\src\pages\Agenda.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = re.compile(
    r"\{clientMatriculas\.map\(m => <option key=\{m\.id\} value=\{m\.id\}>Avaliaç[aã]o de \{m\.modalidade \|\| m\.servico\} \(Plano: \{m\.plano\}\)</option>\)\}",
    re.DOTALL
)

new_code = r"{clientMatriculas.map(m => <option key={m.id} value={m.id}>Avaliação de {m.modalidade || m.servico} (Plano: {m.plano}) {m.dataInicio ? `- ${m.dataInicio.split('-').reverse().join('/')}` : ''}</option>)}"

if not pattern.search(content):
    print("Pattern not found in dropdown!")
    sys.exit(1)

content = pattern.sub(new_code, content)
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Replaced dropdown!")
