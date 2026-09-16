import re
import sys

file_path = r'C:\Users\cassi\.gemini\antigravity\scratch\agenda-digital\src\pages\Agenda.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = re.compile(
    r'<div style=\{\{\s*display:\s*\'flex\',\s*gap:\s*\'24px\'\s*\}\}\>.*?Nenhum aniversariante neste.*?\<\/p\>\s*\<\/div\>\s*\)\}\s*\<\/div\>',
    re.DOTALL
)

if not pattern.search(content):
    print("Pattern not found!")
    sys.exit(1)

content = pattern.sub('', content)

# Change flex-between to have justifyContent: flex-end
content = content.replace(
    "<div className=\"flex-between\" style={{ marginBottom: '24px', alignItems: 'flex-end' }}>",
    "<div className=\"flex-between\" style={{ marginBottom: '24px', alignItems: 'flex-end', justifyContent: 'flex-end' }}>"
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Removed title and birthdays block")
