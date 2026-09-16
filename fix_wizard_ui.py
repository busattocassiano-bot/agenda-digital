import re
import sys

file_path = r'C:\Users\cassi\.gemini\antigravity\scratch\agenda-digital\src\components\AvaliacaoWizardModal.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

pattern1 = re.compile(r"<h3 style=\{\{ fontSize: '1rem', color: 'var\(--text-dark\)', marginBottom: '8px' \}\}>Ficha Fisioterap.utica</h3>")
new_code1 = r"<h3 style={{ fontSize: '1rem', color: 'var(--text-dark)', marginBottom: '8px' }}>Ficha de Avaliação</h3>"

pattern2 = re.compile(
    r"(<label[^>]*>Queixa Principal</label>\s*<textarea rows=)\"3\"([^>]*queixaPrincipal[^>]*></textarea>)",
    re.DOTALL
)
new_code2 = r"\1\"6\"\2"

if not pattern1.search(content):
    print("Pattern 1 not found!")
    sys.exit(1)

if not pattern2.search(content):
    print("Pattern 2 not found!")
    sys.exit(1)

content = pattern1.sub(new_code1, content)
content = pattern2.sub(new_code2, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Replaced!")
