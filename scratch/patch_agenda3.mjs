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


const s4 = `            <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>Servio</label>`;

const r4 = `            <div style={{ display: 'flex', gap: '16px' }}>
                {tipoAgendamento === 'Normal' && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>Servio</label>`;
code = code.replace(s4, r4);


const s5 = `                  </select>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>Profissional</label>`;

const r5 = `                  </select>
                </div>
                )}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>Profissional</label>`;
// We will replace the SECOND occurrence of s5 because the first one is for Matricula/NovaAvaliação?
// Wait, to be safe, I'll just write it manually without replace if it fails. Let's do indexOf.
const idx = code.indexOf(`Servio</label>`);
if (idx > -1) {
  const nextSelectClose = code.indexOf(`</select>`, idx);
  if (nextSelectClose > -1) {
    const endDiv = code.indexOf(`</div>`, nextSelectClose);
    if (endDiv > -1) {
       code = code.slice(0, endDiv + 6) + `\n                )}` + code.slice(endDiv + 6);
    }
  }
}

fs.writeFileSync('src/pages/Agenda.jsx', code);
console.log('done');
