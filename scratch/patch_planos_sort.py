import sys

file_path = r'C:\Users\cassi\.gemini\antigravity\scratch\agenda-digital\src\pages\Planos.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "return matchesSearch && matchesModalidade && matchesStatus;\n  });",
    "return matchesSearch && matchesModalidade && matchesStatus;\n  }).sort((a, b) => (a.modalidade || '').localeCompare(b.modalidade || '') || (a.nome || '').localeCompare(b.nome || ''));"
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Planos sorted!")
