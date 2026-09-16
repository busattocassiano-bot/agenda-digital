import sys
import re

file_path = r'C:\Users\cassi\.gemini\antigravity\scratch\agenda-digital\src\pages\PacientePerfil.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Try to find the button
pattern = re.compile(r'<button\s*onClick=\{\(\) => setExpandedAvaliacaoId\(isExpanded \? null : av\.id\)\}\s*style=\{\{ background: \'white\', border: \'1px solid var\(--border-color\)\', padding: \'6px 12px\', borderRadius: \'6px\', fontSize: \'0\.85rem\', fontWeight: 600, color: \'var\(--primary-color\)\', cursor: \'pointer\' \}\}\s*>\s*\{isExpanded \? \'Ocultar Evoluções\' : `Ver Evoluções \(\$\{evolucoesVinculadas\.length\}\)`\}\s*</button>', re.IGNORECASE)

replacement = """<div style={{ display: 'flex', gap: '8px' }}>
                              <button 
                                onClick={() => setExpandedAvaliacaoId(isExpanded ? null : av.id)}
                                style={{ background: 'white', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-color)', cursor: 'pointer' }}
                              >
                                {isExpanded ? 'Ocultar Evoluções' : `Ver Evoluções (${evolucoesVinculadas.length})`}
                              </button>
                              <button 
                                onClick={() => handlePrintAvaliacao(av, evolucoesVinculadas)}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--primary-color)', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'white', cursor: 'pointer' }}
                              >
                                <Printer size={16} /> Imprimir Prontuário
                              </button>
                            </div>"""

if pattern.search(content):
    print("Found! Replacing...")
    content = pattern.sub(replacement, content)
else:
    print("Not found! Let's try simpler replacement.")
    # It might have  characters because it's Windows CP1252 or something.
    pattern2 = re.compile(r'<button\s*onClick=\{\(\) => setExpandedAvaliacaoId[^{]*>.*?</button>', re.DOTALL)
    if pattern2.search(content):
        print("Found with simpler pattern!")
        content = pattern2.sub(replacement, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
