const fs = require('fs');

let code = fs.readFileSync('src/pages/Agenda.jsx', 'utf8');

const t1 = "!servicos.find(s => s.id === selectedAgendamento.servicoId)?.nome.toLowerCase().includes('avalia')";
const r1 = "!servicos.find(s => s.id === selectedAgendamento.servicoId)?.nome?.toLowerCase().includes('avalia')";

code = code.split(t1).join(r1);

const t2 = "servicos.find(s => s.id === selectedAgendamento.servicoId)?.nome.toLowerCase().includes('avalia')";
const r2 = "servicos.find(s => s.id === selectedAgendamento.servicoId)?.nome?.toLowerCase().includes('avalia')";

code = code.split(t2).join(r2);

fs.writeFileSync('src/pages/Agenda.jsx', code);
console.log('done');
