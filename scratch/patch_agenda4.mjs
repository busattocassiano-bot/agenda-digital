import fs from 'fs';
let code = fs.readFileSync('src/pages/Agenda.jsx', 'utf8');

const s1 = `            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-dark)', fontWeight: 500 }}>
                    <input type="checkbox" checked={isPacienteNaoCadastrado} onChange={(e) => handlePacienteNaoCadastradoChange(e.target.checked)} />
                    Paciente nǜo cadastrado
                </label>
            </div>`;
const r1 = `              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-dark)', fontWeight: 500, cursor: 'pointer' }}>
                      <input type="radio" name="tipoAg" checked={tipoAgendamento === 'Normal'} onChange={() => setTipoAgendamento('Normal')} style={{ accentColor: 'var(--primary-color)' }} />
                      Agendamento Normal
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-dark)', fontWeight: 500, cursor: 'pointer' }}>
                      <input type="radio" name="tipoAg" checked={tipoAgendamento === 'bloqueio'} onChange={() => setTipoAgendamento('bloqueio')} style={{ accentColor: 'var(--primary-color)' }} />
                      Bloquear Horário
                  </label>
              </div>

              {tipoAgendamento === 'Normal' && (
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-dark)', fontWeight: 500 }}>
                        <input type="checkbox" checked={isPacienteNaoCadastrado} onChange={(e) => handlePacienteNaoCadastradoChange(e.target.checked)} />
                        Paciente nǜo cadastrado
                    </label>
                </div>
              )}`;

code = code.replace(s1, r1);

const s2 = `{!isPacienteNaoCadastrado ? (`;
const r2 = `{tipoAgendamento === 'Normal' && (!isPacienteNaoCadastrado ? (`;
code = code.replace(s2, r2);

const s3 = `                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>Telefone</label>
                        <input type="text" style={{ padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px' }} value={telefonePacienteNovo} onChange={(e) => setTelefonePacienteNovo(e.target.value)} />
                    </div>
                </div>
            )}`;
const r3 = `                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>Telefone</label>
                        <input type="text" style={{ padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px' }} value={telefonePacienteNovo} onChange={(e) => setTelefonePacienteNovo(e.target.value)} />
                    </div>
                </div>
            ) : null)}`;
code = code.replace(s3, r3);

const regex = /<label style={{ fontSize: '0\.85rem', fontWeight: 600, color: 'var\(--text-dark\)' }}>Servi[^<]+<\/label>/;
const match = code.match(regex);
if (match) {
  const startIndex = code.lastIndexOf('<div', match.index);
  const insertBefore = `{tipoAgendamento === 'Normal' && (\n                `;
  code = code.slice(0, startIndex) + insertBefore + code.slice(startIndex);
  
  const endIndex = code.indexOf('</div>', match.index) + 6;
  const insertAfter = `\n              )}`;
  code = code.slice(0, endIndex) + insertAfter + code.slice(endIndex);
}

fs.writeFileSync('src/pages/Agenda.jsx', code);
console.log('done');
