import re

file_path = r'C:\Users\cassi\.gemini\antigravity\scratch\agenda-digital\src\pages\Agenda.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace state
content = content.replace("const [tipoAgendamento, setTipoAgendamento] = useState('Normal');", "const [tipoAgendamento, setTipoAgendamento] = useState('Normal');\n    const [isNovaAvaliacaoToggle, setIsNovaAvaliacaoToggle] = useState(false);")

# Find the vincular block using regex
pattern = re.compile(r"<div style=\{\{ display: 'flex', flexDirection: 'column', gap: '6px' \}\}>\s*<label style=\{\{ fontSize: '0\.85rem', fontWeight: 600, color: 'var\(--text-dark\)' \}\}>Vincular à Avaliação / Tratamento</label>\s*<select[^>]+>\s*<option value=\"\">Sem vínculo \(Sessão Isolada\)</option>\s*\{clientMatriculas\.map[^\}]+\}\)\}\s*</select>\s*</div>")

new_vincular = """<div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>Qual o objetivo deste agendamento?</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => setIsNovaAvaliacaoToggle(false)}
                            style={{ flex: 1, padding: '8px', border: !isNovaAvaliacaoToggle ? '1px solid var(--primary-color)' : '1px solid var(--border-color)', background: !isNovaAvaliacaoToggle ? '#f0f9ff' : 'white', color: !isNovaAvaliacaoToggle ? 'var(--primary-color)' : 'var(--text-muted)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                          >
                            Sessão de Rotina
                          </button>
                          <button 
                            onClick={() => {
                                setIsNovaAvaliacaoToggle(true);
                                const avaliacaoSrv = servicos.find(s => s.nome.toLowerCase().includes('avalia'));
                                if (avaliacaoSrv) handleServicoChange(avaliacaoSrv.id);
                            }}
                            style={{ flex: 1, padding: '8px', border: isNovaAvaliacaoToggle ? '1px solid var(--primary-color)' : '1px solid var(--border-color)', background: isNovaAvaliacaoToggle ? '#f0f9ff' : 'white', color: isNovaAvaliacaoToggle ? 'var(--primary-color)' : 'var(--text-muted)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                          >
                            Nova Avaliação
                          </button>
                        </div>
                      </div>
                      
                      {!isNovaAvaliacaoToggle && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>Vincular à Avaliação / Tratamento</label>
                          <select style={{ padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px' }} value={matriculaId} onChange={(e) => handleMatriculaChange(e.target.value)}>
                              <option value="">Sem vínculo (Sessão Isolada)</option>
                              {clientMatriculas.map(m => <option key={m.id} value={m.id}>Avaliação de {m.modalidade || m.servico} (Plano: {m.plano}) {m.dataInicio ? `- ${m.dataInicio.split('-').reverse().join('/')}` : ''}</option>)}
                          </select>
                        </div>
                      )}"""

content = pattern.sub(new_vincular, content)

# update bottom buttons
old_buttons = """<button onClick={() => handleSaveAgendamento(true)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--primary-color)', background: '#f0f9ff', color: 'var(--primary-color)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileEdit size={16} /> Salvar e Iniciar Avaliação
              </button>
              <button onClick={() => handleSaveAgendamento(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Salvar Agendamento</button>"""

new_buttons = """{isNovaAvaliacaoToggle ? (
                <button onClick={() => handleSaveAgendamento(true)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileEdit size={16} /> Salvar e Iniciar Avaliação
                </button>
              ) : (
                <button onClick={() => handleSaveAgendamento(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Salvar Agendamento</button>
              )}"""

content = content.replace(old_buttons, new_buttons)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Agenda.jsx with toggle buttons via Regex")
