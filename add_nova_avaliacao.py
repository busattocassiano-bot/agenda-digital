import re

file_path = r'C:\Users\cassi\.gemini\antigravity\scratch\agenda-digital\src\pages\Agenda.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the dropdown
old_dropdown = """                            {clientMatriculas.map(m => <option key={m.id} value={m.id}>Avaliação de {m.modalidade || m.servico} (Plano: {m.plano}) {m.dataInicio ? `- ${m.dataInicio.split('-').reverse().join('/')}` : ''}</option>)}"""
new_dropdown = """                              <option value="NOVA_AVALIACAO" style={{ fontWeight: 600, color: 'var(--primary-color)' }}>+ Agendar Nova Avaliação</option>
                              {clientMatriculas.map(m => <option key={m.id} value={m.id}>Avaliação de {m.modalidade || m.servico} (Plano: {m.plano}) {m.dataInicio ? `- ${m.dataInicio.split('-').reverse().join('/')}` : ''}</option>)}"""

content = content.replace(old_dropdown, new_dropdown)

# 2. Update handleSaveAgendamento
old_save = """        matriculaId: isPacienteNaoCadastrado ? null : matriculaId,
        nomePacienteNovo: isPacienteNaoCadastrado ? nomePacienteNovo : null,"""
new_save = """        matriculaId: (isPacienteNaoCadastrado || matriculaId === 'NOVA_AVALIACAO') ? null : matriculaId,
        nomePacienteNovo: isPacienteNaoCadastrado ? nomePacienteNovo : null,"""

content = content.replace(old_save, new_save)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated options")
