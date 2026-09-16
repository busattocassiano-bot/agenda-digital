import fs from 'fs';

let code = fs.readFileSync('src/pages/Agenda.jsx', 'utf8');

// 1. Add state variables
const stateRegex = /const \[tipoAgendamento, setTipoAgendamento\] = useState\('Normal'\);/;
const stateReplacement = `const [tipoAgendamento, setTipoAgendamento] = useState('Normal');
  const [isRecorrente, setIsRecorrente] = useState(false);
  const [diasRecorrencia, setDiasRecorrencia] = useState([]);
  const [semanasRecorrencia, setSemanasRecorrencia] = useState(4);`;

code = code.replace(stateRegex, stateReplacement);

// 2. Add UI for recurrence
const uiRegex = /<div style=\{\{ display: 'flex', gap: '16px' \}\}>\s*<div style=\{\{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' \}\}>\s*<label style=\{\{ fontSize: '0.85rem', fontWeight: 600, color: 'var\(--text-dark\)' \}\}>Data<\/label>/;

const uiReplacement = `{tipoAgendamento === 'bloqueio' && (
              <div style={{ marginTop: '16px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-dark)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={isRecorrente} onChange={(e) => setIsRecorrente(e.target.checked)} style={{ accentColor: 'var(--primary-color)' }} />
                  Bloqueio Recorrente?
                </label>

                {isRecorrente && (
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Dias da Semana</div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dia, idx) => (
                          <button 
                            key={idx} 
                            onClick={() => setDiasRecorrencia(prev => prev.includes(idx) ? prev.filter(d => d !== idx) : [...prev, idx])}
                            style={{ 
                              padding: '6px 12px', 
                              borderRadius: '16px', 
                              border: diasRecorrencia.includes(idx) ? 'none' : '1px solid var(--border-color)', 
                              background: diasRecorrencia.includes(idx) ? 'var(--primary-color)' : 'white', 
                              color: diasRecorrencia.includes(idx) ? 'white' : 'var(--text-main)', 
                              fontSize: '0.8rem', 
                              cursor: 'pointer' 
                            }}>
                            {dia}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                       <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>Repetir por quantas semanas?</label>
                       <input type="number" min="1" max="52" value={semanasRecorrencia} onChange={(e) => setSemanasRecorrencia(e.target.value)} style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', width: '100px', display: 'block', marginTop: '4px' }} />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>Data</label>`;

if(uiRegex.test(code)) {
    code = code.replace(uiRegex, uiReplacement);
} else {
    console.log("Failed to match UI regex!");
}

// 3. Add logic in handleSaveAgendamento
const saveRegex = /if \(tipoAgendamento === 'bloqueio'\) \{\s*const payload = \{\s*id: Date.now\(\).toString\(\),\s*data: dataInicio,\s*hora: horaInicio,\s*horaFim: horaFim,\s*clienteId: null,\s*matriculaId: null,\s*nomePacienteNovo: 'Bloqueio',\s*telefonePacienteNovo: null,\s*servicoId: null,\s*profissionalId,\s*tipo: 'bloqueio',\s*status: 'Bloqueio'\s*\};\s*addAgendamento\(payload\);\s*setAgendamentoModalOpen\(false\);\s*return;\s*\}/;

const saveReplacement = `if (tipoAgendamento === 'bloqueio') {
        if (isRecorrente) {
          if (diasRecorrencia.length === 0) {
            alert("Selecione pelo menos um dia da semana para o bloqueio recorrente.");
            return;
          }
          if (!semanasRecorrencia || semanasRecorrencia < 1) {
            alert("Preencha um número válido de semanas.");
            return;
          }
          const startDate = parseISO(dataInicio);
          const totalDays = semanasRecorrencia * 7;
          let blocksCreated = 0;
          for (let i = 0; i < totalDays; i++) {
             const currentDate = addDays(startDate, i);
             const currentDayOfWeek = currentDate.getDay();
             if (diasRecorrencia.includes(currentDayOfWeek)) {
                const dateStr = format(currentDate, 'yyyy-MM-dd');
                const payload = {
                    id: Date.now().toString() + '_' + i,
                    data: dateStr,
                    hora: horaInicio,
                    horaFim: horaFim,
                    clienteId: null,
                    matriculaId: null,
                    nomePacienteNovo: 'Bloqueio',
                    telefonePacienteNovo: null,
                    servicoId: null,
                    profissionalId,
                    tipo: 'bloqueio',
                    status: 'Bloqueio'
                };
                addAgendamento(payload);
                blocksCreated++;
             }
          }
          alert(\`Foram criados \${blocksCreated} bloqueios recorrentes!\`);
        } else {
          const payload = {
              id: Date.now().toString(),
              data: dataInicio,
              hora: horaInicio,
              horaFim: horaFim,
              clienteId: null,
              matriculaId: null,
              nomePacienteNovo: 'Bloqueio',
              telefonePacienteNovo: null,
              servicoId: null,
              profissionalId,
              tipo: 'bloqueio',
              status: 'Bloqueio'
          };
          addAgendamento(payload);
        }
        setAgendamentoModalOpen(false);
        return;
      }`;

code = code.replace(saveRegex, saveReplacement);

// Import addDays if it's not imported from date-fns
if (!code.includes('addDays')) {
    code = code.replace(/import \{([^}]+)\} from 'date-fns';/, "import { $1, addDays } from 'date-fns';");
}

fs.writeFileSync('src/pages/Agenda.jsx', code);
console.log('done');
