import fs from 'fs';

let code = fs.readFileSync('src/pages/Agenda.jsx', 'utf8');

// 1. Update handleSaveAgendamento
const oldHandleSave = `    const handleSaveAgendamento = (startAvaliacao = false) => {
      if (!dataInicio || !horaInicio || !horaFim) {
        alert("Preencha data e horários.");
        return;
      }
      if (!servicoId || !profissionalId) {
        alert("Selecione serviço e profissional.");
        return;
      }

      const novoAgendamento = {
          data: dataInicio,
          hora: horaInicio,
          horaFim: horaFim,
          clienteId,
          matriculaId,
          nomePacienteNovo: isPacienteNaoCadastrado ? nomePacienteNovo : null,
          telefonePacienteNovo: isPacienteNaoCadastrado ? telefonePacienteNovo : null,
          servicoId,
          profissionalId,
          tipo: 'Agendamento',
          status: 'Agendado'
      };`;

const newHandleSave = `    const handleSaveAgendamento = (startAvaliacao = false) => {
      if (!dataInicio || !horaInicio || !horaFim) {
        alert("Preencha data e horários.");
        return;
      }
      if (tipoAgendamento === 'Normal' && (!servicoId || !profissionalId)) {
        alert("Selecione serviço e profissional.");
        return;
      }
      if (tipoAgendamento === 'bloqueio' && !profissionalId) {
        alert("Selecione o profissional para o bloqueio de horário.");
        return;
      }

      if (tipoAgendamento === 'bloqueio') {
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
        setAgendamentoModalOpen(false);
        return;
      }

      const novoAgendamento = {
          data: dataInicio,
          hora: horaInicio,
          horaFim: horaFim,
          clienteId,
          matriculaId,
          nomePacienteNovo: isPacienteNaoCadastrado ? nomePacienteNovo : null,
          telefonePacienteNovo: isPacienteNaoCadastrado ? telefonePacienteNovo : null,
          servicoId,
          profissionalId,
          tipo: 'Agendamento',
          status: 'Agendado'
      };`;

// In case the encoding of `horários` is messed up:
const oldHandleSaveRegex = /const handleSaveAgendamento = \(startAvaliacao = false\) => {[\s\S]*?status: 'Agendado'\s*};/;
code = code.replace(oldHandleSaveRegex, newHandleSave);


// 2. Update the Modal UI to insert radio buttons and conditionally hide fields
const modalUIStartRegex = /<div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>\s*<label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var\(--text-dark\)', fontWeight: 500 }}>\s*<input type="checkbox" checked={isPacienteNaoCadastrado}[^>]+>\s*Paciente não cadastrado\s*<\/label>\s*<\/div>/;

const newModalUIStart = `
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
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

code = code.replace(modalUIStartRegex, newModalUIStart);

// Conditionally render the patient block
code = code.replace(/{!isPacienteNaoCadastrado \? \(/g, `{tipoAgendamento === 'Normal' && (!isPacienteNaoCadastrado ? (`);
code = code.replace(/<label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var\(--text-dark\)' }}>Nome Completo<\/label>/g, `<label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>Nome Completo</label>`);
code = code.replace(/<\/div>\s*<\/div>\s*\)\}\s*<div style={{ display: 'flex', gap: '16px' }}>/g, `</div>
                </div>
            ) : null)}

            <div style={{ display: 'flex', gap: '16px' }}>`);

// Conditionally render the servico block (we will just match the exact servico div)
const servicoDivRegex = /<div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>\s*<label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var\(--text-dark\)' }}>Serviço<\/label>\s*<select style={{ padding: '10px 12px', border: '1px solid var\(--border-color\)', borderRadius: '8px' }} value={servicoId} onChange={\(e\) => handleServicoChange\(e.target.value\)}>\s*<option value="">Selecione...<\/option>\s*{servicos.map\(s => <option key={s.id} value={s.id}>{s.nome}<\/option>\)}\s*<\/select>\s*<\/div>/;

const newServicoDiv = `{tipoAgendamento === 'Normal' && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>Serviço</label>
                  <select style={{ padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px' }} value={servicoId} onChange={(e) => handleServicoChange(e.target.value)}>
                    <option value="">Selecione...</option>
                    {servicos.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                  </select>
                </div>
              )}`;

code = code.replace(servicoDivRegex, newServicoDiv);


// Also check the event calendar cell rendering
// "Bloqueio" doesn't have a service, so baseColor shouldn't crash
// Let's replace:
// const srv = servicos.find(s => s.id === a.servicoId);
// const baseColor = srv?.cor || '#0ea5e9';
// with:
// const srv = servicos.find(s => s.id === a.servicoId);
// const baseColor = a.tipo === 'bloqueio' ? '#94a3b8' : (srv?.cor || '#0ea5e9');

code = code.replace(/const baseColor = srv\?\.cor \|\| '#0ea5e9';/g, `const baseColor = a.tipo === 'bloqueio' ? '#94a3b8' : (srv?.cor || '#0ea5e9');`);

fs.writeFileSync('src/pages/Agenda.jsx', code);
console.log('done');
