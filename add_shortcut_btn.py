import re

file_path = r'C:\Users\cassi\.gemini\antigravity\scratch\agenda-digital\src\pages\Agenda.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Revert dropdown
content = content.replace("""<option value="NOVA_AVALIACAO" style={{ fontWeight: 600, color: 'var(--primary-color)' }}>+ Agendar Nova Avaliação</option>\n""", "")

# 2. Revert handleSaveAgendamento matriculaId logic
content = content.replace("matriculaId: (isPacienteNaoCadastrado || matriculaId === 'NOVA_AVALIACAO') ? null : matriculaId,", "matriculaId: isPacienteNaoCadastrado ? null : matriculaId,")

# 3. Add startAvaliacao parameter to handleSaveAgendamento
old_func_def = "const handleSaveAgendamento = () => {"
new_func_def = "const handleSaveAgendamento = (startAvaliacao = false) => {"
content = content.replace(old_func_def, new_func_def)

# 4. In handleSaveAgendamento, if startAvaliacao, open wizard
old_save_end = """    addAgendamento(payload);

    if (gerarCobrancaAvulsa) {"""
new_save_end = """    addAgendamento(payload);

    if (startAvaliacao === true) {
        setSelectedAgendamento(payload);
        setWizardOpen(true);
    }

    if (gerarCobrancaAvulsa) {"""
content = content.replace(old_save_end, new_save_end)

# 5. Add the "Salvar e Iniciar Avaliação" button next to "Salvar Agendamento"
old_buttons = """<button onClick={() => setAgendamentoModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'white', cursor: 'pointer', fontWeight: 500 }}>Cancelar</button>
              <button onClick={handleSaveAgendamento} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Salvar Agendamento</button>"""

new_buttons = """<button onClick={() => setAgendamentoModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'white', cursor: 'pointer', fontWeight: 500 }}>Cancelar</button>
              <button onClick={() => handleSaveAgendamento(true)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--primary-color)', background: '#f0f9ff', color: 'var(--primary-color)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileEdit size={16} /> Salvar e Iniciar Avaliação
              </button>
              <button onClick={() => handleSaveAgendamento(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Salvar Agendamento</button>"""

content = content.replace(old_buttons, new_buttons)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Agenda.jsx with shortcut button")
