const fs = require('fs');

let code = fs.readFileSync('src/context/AppDataContext.jsx', 'utf8');

const t1 = "const updateAgendamento = (id, data) => updateDocument('agendamentos', id, data);";
const r1 = "const updateAgendamento = (id, data) => updateDocument('agendamentos', id, data);\n  const deleteAgendamento = (id) => deleteDocument('agendamentos', id);";

code = code.replace(t1, r1);

const t2 = "agendamentos, addAgendamento, updateAgendamento, setAgendamentos,";
const r2 = "agendamentos, addAgendamento, updateAgendamento, deleteAgendamento, setAgendamentos,";

code = code.replace(t2, r2);

fs.writeFileSync('src/context/AppDataContext.jsx', code);
console.log('done');
