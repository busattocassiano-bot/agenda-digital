import re
import sys

file_path = r'C:\Users\cassi\.gemini\antigravity\scratch\agenda-digital\src\pages\Agenda.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = re.compile(
    r"\s*<button onClick=\{\(\) => \{\s*setDataInicio\(format\(currentDate, 'yyyy-MM-dd'\)\);\s*setAgendamentoModalOpen\(true\);\s*\}\} style=\{\{ background: 'var\(--primary-color\)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' \}\}>\s*<Plus size=\{18\} />\s*</button>\s*<button style=\{\{ background: '#f1f5f9', color: 'var\(--text-main\)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' \}\}>\s*<RefreshCw size=\{18\} />\s*</button>",
    re.DOTALL
)

if not pattern.search(content):
    print("Pattern not found!")
    sys.exit(1)

content = pattern.sub("", content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Buttons removed!")
