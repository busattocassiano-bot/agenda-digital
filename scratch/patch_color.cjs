const fs = require('fs');

let code = fs.readFileSync('src/pages/Agenda.jsx', 'utf8');

const t1 = "const baseColor = a.tipo === 'bloqueio' ? '#94a3b8' : (srv?.cor || '#0ea5e9');";
const r1 = "let baseColor = a.tipo === 'bloqueio' ? '#94a3b8' : (srv?.cor || '#0ea5e9');\n                        if (a.status === 'Realizado') baseColor = '#22c55e';\n                        if (a.status === 'Falta') baseColor = '#ef4444';\n                        if (a.status === 'Falta Justificada') baseColor = '#f59e0b';";

code = code.split(t1).join(r1);
fs.writeFileSync('src/pages/Agenda.jsx', code);
console.log('done');
