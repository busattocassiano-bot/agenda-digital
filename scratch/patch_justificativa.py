import sys
import re

file_path = r'C:\Users\cassi\.gemini\antigravity\scratch\agenda-digital\src\pages\Agenda.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add state variable
content = content.replace(
    "const [tipoAgendamento, setTipoAgendamento] = useState('Normal');",
    "const [tipoAgendamento, setTipoAgendamento] = useState('Normal');\n  const [justificativaBloqueio, setJustificativaBloqueio] = useState('');"
)

# 2. Add to handleSlotClick to reset
content = content.replace(
    "setIsPacienteNaoCadastrado(false);",
    "setIsPacienteNaoCadastrado(false);\n    setJustificativaBloqueio('');"
)

# 3. Add to Plus button to reset
content = content.replace(
    "setAgendamentoModalOpen(true);",
    "setAgendamentoModalOpen(true);\n                    setJustificativaBloqueio('');"
)
# Note: since the Plus button replacement might hit twice, I'll restrict it later or let it run. Wait, I'd better be precise.
# Let's fix the above replace - it's safer to use regex.

with open(file_path, 'r', encoding='utf-8') as f:
    content_raw = f.read()

# Let's just do targeted replaces
import codecs
content_raw = content_raw.replace(
    "const [tipoAgendamento, setTipoAgendamento] = useState('Normal');",
    "const [tipoAgendamento, setTipoAgendamento] = useState('Normal');\n  const [justificativaBloqueio, setJustificativaBloqueio] = useState('');"
)

content_raw = content_raw.replace(
    "nomePacienteNovo: 'Bloqueio',",
    "nomePacienteNovo: justificativaBloqueio ? 'Bloqueio - ' + justificativaBloqueio : 'Bloqueio',"
)

# Add input field in the modal UI
ui_insertion = """            {tipoAgendamento === 'bloqueio' && (
              <div style={{ marginTop: '16px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
                <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>Justificativa do Bloqueio (Opcional)</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Almoço, Reunião, Feriado..." 
                    value={justificativaBloqueio} 
                    onChange={(e) => setJustificativaBloqueio(e.target.value)} 
                    style={{ padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px' }} 
                  />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-dark)', cursor: 'pointer' }}>"""

# Note the string in original is 'bloqueio' && ( \n <div style={{ marginTop... \n <label style={{ display... Bloqueio Recorrente?
original_ui = """            {tipoAgendamento === 'bloqueio' && (
              <div style={{ marginTop: '16px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-dark)', cursor: 'pointer' }}>"""

content_raw = content_raw.replace(original_ui, ui_insertion)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content_raw)
print("Added justificativaBloqueio!")
