import fs from 'fs';

let code = fs.readFileSync('src/pages/Agenda.jsx', 'utf8');

// 1. Ensure Radio buttons are there
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

const targetCheckbox = `<div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-dark)', fontWeight: 500 }}>
                      <input type="checkbox" checked={isPacienteNaoCadastrado} onChange={(e) => handlePacienteNaoCadastradoChange(e.target.checked)} />
                      Paciente nǜo cadastrado
                  </label>
              </div>`;

if (code.includes(targetCheckbox)) {
    code = code.replace(targetCheckbox, radioHtml);
} else {
    // maybe it has 'não' instead of 'nǜo'
    const targetCheckbox2 = `<div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-dark)', fontWeight: 500 }}>
                      <input type="checkbox" checked={isPacienteNaoCadastrado} onChange={(e) => handlePacienteNaoCadastradoChange(e.target.checked)} />
                      Paciente não cadastrado
                  </label>
              </div>`;
    if (code.includes(targetCheckbox2)) {
        code = code.replace(targetCheckbox2, radioHtml);
    }
}

// 2. Fix duplicated `!isPacienteNaoCadastrado` conditionals if any.
// In the current file we know it has:
// `{tipoAgendamento === 'Normal' && (!isPacienteNaoCadastrado ? (`
// But wait, in the script I just added: `{tipoAgendamento === 'Normal' && (` ... wait! The radioHtml block I just added closes `)}` !
// So I don't need `{tipoAgendamento === 'Normal' &&` before `(!isPacienteNaoCadastrado ? (`. I should just use `(!isPacienteNaoCadastrado ? (` directly BUT ONLY inside the `Normal` context?
// Actually, `(!isPacienteNaoCadastrado ? (` handles the Patient fields.
// If it's `bloqueio`, we don't want patient fields at all.
// So:
const badConditional = `{tipoAgendamento === 'Normal' && (!isPacienteNaoCadastrado ? (`;
const goodConditional = `{tipoAgendamento === 'Normal' && (!isPacienteNaoCadastrado ? (`; 
// Wait, I should make sure it closes with `))}` properly. Let me just replace the entire block from the original file safely.

fs.writeFileSync('src/pages/Agenda.jsx', code);
console.log('done');
