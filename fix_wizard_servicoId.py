import re
import sys

file_path = r'C:\Users\cassi\.gemini\antigravity\scratch\agenda-digital\src\components\AvaliacaoWizardModal.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

pattern1 = re.compile(
    r"profissionalId: matriculaData\.profissionalId,\s*servico: matriculaData\.modalidade,\s*data: current\.toISOString\(\)\.split\('T'\)\[0\],",
    re.DOTALL
)

new_code1 = """profissionalId: matriculaData.profissionalId,
                servico: matriculaData.modalidade,
                servicoId: servicos.find(s => s.nome === matriculaData.modalidade)?.id || '',
                data: current.toISOString().split('T')[0],"""

pattern2 = re.compile(
    r"profissionalId: matriculaData\.profissionalId,\s*servico: matriculaData\.modalidade,\s*data: matriculaData\.dataInicio,",
    re.DOTALL
)

new_code2 = """profissionalId: matriculaData.profissionalId,
            servico: matriculaData.modalidade,
            servicoId: servicos.find(s => s.nome === matriculaData.modalidade)?.id || '',
            data: matriculaData.dataInicio,"""

if not pattern1.search(content) or not pattern2.search(content):
    print("Pattern not found!")
    sys.exit(1)

content = pattern1.sub(new_code1, content)
content = pattern2.sub(new_code2, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Replaced wizard missing servicoId!")
