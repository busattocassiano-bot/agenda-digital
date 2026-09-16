const fs = require('fs');

let code = fs.readFileSync('src/pages/Agenda.jsx', 'utf8');

const t = code.substring(code.indexOf('<button className="dropdown-item" onClick={() => handleUpdateStatus(\\'Realizado\\')}') , code.indexOf('deleteAgendamento(selectedAgendamento.id);'));

const r = `{selectedAgendamento.tipo !== 'bloqueio' && (
                  <>
                    <button className="dropdown-item" onClick={(e) => { e.stopPropagation(); handleUpdateStatus('Realizado'); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', borderRadius: '6px', color: '#16a34a' }}>
                      <CheckCircle2 size={16} /> Confirmar Presença
                    </button>
                    <button className="dropdown-item" onClick={(e) => { e.stopPropagation(); handleUpdateStatus('Falta'); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', borderRadius: '6px', color: '#ea580c' }}>
                      <XCircle size={16} /> Marcar como Falta
                    </button>
                    <button className="dropdown-item" onClick={(e) => { e.stopPropagation(); handleUpdateStatus('Falta Justificada'); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', borderRadius: '6px', color: '#d97706' }}>
                      <AlertCircle size={16} /> Falta Justificada
                    </button>
                    
                    <div style={{ height: '1px', background: 'var(--border-color)', margin: '8px 0' }}></div>
                    
                    {!servicos.find(s => s.id === selectedAgendamento.servicoId)?.nome?.toLowerCase().includes('avalia') && (
                      <button className="dropdown-item" onClick={(e) => {
                        e.stopPropagation();
                        setWizardOpen(true);
                        setEventMenuOpen(false);
                      }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', borderRadius: '6px', color: 'var(--text-main)' }}>
                        <Plus size={16} /> Novo Agendamento
                      </button>
                    )}
                    
                    <div style={{ height: '1px', background: 'var(--border-color)', margin: '8px 0' }}></div>
                  </>
                )}
                
                <button className="dropdown-item" onClick={(e) => {
                  e.stopPropagation();
                  `;

code = code.replace(t, r);
fs.writeFileSync('src/pages/Agenda.jsx', code);
console.log('done');
