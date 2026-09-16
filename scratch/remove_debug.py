import sys

file_path = r'C:\Users\cassi\.gemini\antigravity\scratch\agenda-digital\src\pages\PacientePerfil.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "`Ver Evoluções (${evolucoesVinculadas.length}) - DEBUG: ${evolucoes.filter(e => e.clienteId === id).length} total no pac`",
    "`Ver Evoluções (${evolucoesVinculadas.length})`"
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Removed DEBUG string!")
