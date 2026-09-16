const fs = require('fs');
let code = fs.readFileSync('src/pages/Agenda.jsx', 'utf8');

// 1. Change weekStartsOn from 1 (Monday) to 0 (Sunday)
code = code.replace(/weekStartsOn:\s*1/g, 'weekStartsOn: 0');

// 2. Fix Month View Headers to start with Dom, and fix encoding
const oldMonthHeaders = /\['Seg',\s*'Ter',\s*'Qua',\s*'Qui',\s*'Sex',\s*'.*?',\s*'Dom'\]/g;
code = code.replace(oldMonthHeaders, "['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']");

// 3. Fix encoding of any other 'Sǭb' back to 'Sáb'
code = code.replace(/Sǭb/g, 'Sáb');

// 4. Capitalize 'EEEE' format in weekly view
const oldEeee = `<div style={{ fontWeight: 600, color: feriado ? '#ef4444' : 'var(--text-dark)', fontSize: '0.95rem' }}>{format(day, 'EEEE', { locale: ptBR }).split('-')[0]}</div>`;
const newEeee = `<div style={{ fontWeight: 600, color: feriado ? '#ef4444' : 'var(--text-dark)', fontSize: '0.95rem', textTransform: 'capitalize' }}>{format(day, 'EEEE', { locale: ptBR }).split('-')[0]}</div>`;
code = code.replace(oldEeee, newEeee);

fs.writeFileSync('src/pages/Agenda.jsx', code);
console.log('patched Agenda.jsx for sunday start and capitalize');
