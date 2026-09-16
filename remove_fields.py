import re
import sys

file_path = r'C:\Users\cassi\.gemini\antigravity\scratch\agenda-digital\src\components\AvaliacaoWizardModal.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the 'Dia de Vencimento' block
dia_pattern = re.compile(r"<div style=\{\{ flex: 1 \}\}>\s*<label style=\{\{ display: 'block', fontSize: '0\.85rem', fontWeight: 600, color: 'var\(--text-dark\)', marginBottom: '8px' \}\}>Dia de Vencimento</label>\s*<select\s*value=\{matriculaData\.diaVencimento\}\s*onChange=\{\(e\) => setMatriculaData\(\{ \.\.\.matriculaData, diaVencimento: e\.target\.value \}\)\}\s*style=\{\{ width: '100%', padding: '12px', border: '1px solid var\(--border-color\)', borderRadius: '8px', outline: 'none', backgroundColor: '#fff', color: 'var\(--text-main\)' \}\}\s*>\s*\{\[5, 10, 15, 20, 25\]\.map\(d => \(\s*<option key=\{d\} value=\{d\}>\{d\}</option>\s*\)\)\}\s*</select>\s*</div>", re.DOTALL)
content = dia_pattern.sub("", content)

# Remove the blue banner
banner_pattern = re.compile(r"<div style=\{\{ padding: '16px', background: '#e0f2fe', borderRadius: '8px', display: 'flex', gap: '12px', alignItems: 'flex-start' \}\}>\s*<CheckCircle2 size=\{20\} color=\"#0284c7\" style=\{\{ flexShrink: 0, marginTop: '2px' \}\} />\s*<p style=\{\{ margin: 0, fontSize: '0\.9rem', color: '#0369a1', lineHeight: '1\.5' \}\}>\s*As parcelas deste plano ser[^\<]*o geradas <strong>automaticamente</strong> no Contas a Receber ap[^\<]*s salvar\.\s*</p>\s*</div>", re.DOTALL)
content = banner_pattern.sub("", content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Removed fields successfully!")
