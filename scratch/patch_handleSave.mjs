import fs from 'fs';
let code = fs.readFileSync('src/pages/Agenda.jsx', 'utf8');

const targetFunc = `  const handleSaveAgendamento = () => {
    if (!dataInicio || !horaInicio || !horaFim) {
      alert("Preencha data e horários.");
      return;
    }
    if (!servicoId || !profissionalId) {
      alert("Selecione serviço e profissional.");
      return;
    }`;

// Since `horários` and `serviço` have special chars, let's use a regex instead.
const regex = /const handleSaveAgendamento = \(\) => {[\s\S]*?alert\("Selecione servi[^"]+"*\);\s*return;\s*}/;
const replacement = `const handleSaveAgendamento = () => {
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
    }`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/pages/Agenda.jsx', code);
console.log('done');
