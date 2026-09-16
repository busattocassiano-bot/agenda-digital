import sys
import re

files = [
    r'C:\Users\cassi\.gemini\antigravity\scratch\agenda-digital\src\pages\Recebimentos.jsx',
    r'C:\Users\cassi\.gemini\antigravity\scratch\agenda-digital\src\pages\PacientePerfil.jsx'
]

for file in files:
    try:
        with open(file, 'r', encoding='utf-8') as f:
            code = f.read()
            
        code = code.replace("deleteRecebimento(rec.id)", "if(window.confirm('Tem certeza?')) deleteRecebimento(rec.id)")
        code = code.replace("deleteEvolucao(ev.id)", "if(window.confirm('Tem certeza?')) deleteEvolucao(ev.id)")
        
        with open(file, 'w', encoding='utf-8') as f:
            f.write(code)
        print(f"Patched {file}")
    except Exception as e:
        print(e)
