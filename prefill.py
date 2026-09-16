import re

file_path = r'C:\Users\cassi\.gemini\antigravity\scratch\agenda-digital\src\components\AvaliacaoWizardModal.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_set_matricula = """      setMatriculaData({
        modalidade: '',
        plano: '',
        valor: '',
        diaVencimento: '10',
        dataInicio: new Date().toISOString().split('T')[0],
        dataFinal: '',
        profissionalId: '',"""

new_set_matricula = """      setMatriculaData({
        modalidade: '',
        plano: '',
        valor: '',
        diaVencimento: '10',
        dataInicio: new Date().toISOString().split('T')[0],
        dataFinal: '',
        profissionalId: agendamentoProfissionalId,"""

content = content.replace(old_set_matricula, new_set_matricula)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated AvaliacaoWizardModal.jsx")
