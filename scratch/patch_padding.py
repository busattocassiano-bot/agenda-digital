import sys

file_path = r'C:\Users\cassi\.gemini\antigravity\scratch\agenda-digital\src\pages\Agenda.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "<div style={{ padding: '32px', height: '100vh', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', position: 'relative' }}>",
    "<div style={{ padding: '8px 32px 32px 32px', height: '100vh', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', position: 'relative' }}>"
)

content = content.replace(
    "<div className=\"flex-between\" style={{ marginBottom: '24px', alignItems: 'center' }}>",
    "<div className=\"flex-between\" style={{ marginBottom: '12px', alignItems: 'center' }}>"
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Padding adjusted!")
