const fs = require('fs');

let code = fs.readFileSync('src/pages/Agenda.jsx', 'utf8');

const t = `<button className="dropdown-item" onClick={() => handleUpdateStatus('Realizado')}`;
const r = `{selectedAgendamento.tipo !== 'bloqueio' && (
                  <>
                    <button className="dropdown-item" onClick={() => handleUpdateStatus('Realizado')}`;

code = code.replace(t, r);

const t2 = `<div style={{ height: '1px', background: 'var(--border-color)', margin: '8px 0' }}></div>`;
const r2 = `<div style={{ height: '1px', background: 'var(--border-color)', margin: '8px 0' }}></div>
                  </>
                )}
                
                {selectedAgendamento.tipo !== 'bloqueio' && !servicos.find(s => s.id === selectedAgendamento.servicoId)?.nome?.toLowerCase().includes('avalia') && (
                  <button className="dropdown-item" onClick={() => {
                    setWizardOpen(true);
                    setEventMenuOpen(false);
                  }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', borderRadius: '6px', color: 'var(--text-main)' }}>
                    <Plus size={16} /> Novo Agendamento
                  </button>
                )}
                
                {/* div divider for excluir was deleted by me conceptually, let me restore it properly */}`;

// Let's use exact replacement for the whole block to be safe.
