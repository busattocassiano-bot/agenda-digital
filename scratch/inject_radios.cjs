const fs = require('fs');
let code = fs.readFileSync('src/pages/Agenda.jsx', 'utf8');

const regex = /<div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>\s*<label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var\(--text-dark\)', fontWeight: 500 }}>\s*<input type="checkbox" checked={isPacienteNaoCadastrado} onChange={\(e\) => handlePacienteNaoCadastradoChange\(e.target.checked\)} \/>\s*Paciente n.*o cadastrado\s*<\/label>\s*<\/div>/;

const radioHtml = `              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
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
                        Paciente não cadastrado
                    </label>
                </div>
              )}`;

if (regex.test(code)) {
    code = code.replace(regex, radioHtml);
    fs.writeFileSync('src/pages/Agenda.jsx', code);
    console.log('Successfully injected radio buttons!');
} else {
    console.log('Regex did not match!');
}
