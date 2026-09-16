const fs = require('fs');
let code = fs.readFileSync('src/pages/Agenda.jsx', 'utf8');

const regex = /(<div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>\s*<label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var\(--text-dark\)' }}>Servi[^<]+<\/label>\s*<select style={{ padding: '10px 12px', border: '1px solid var\(--border-color\)', borderRadius: '8px' }} value={servicoId} onChange={\(e\) => handleServicoChange\(e.target.value\)}>\s*<option value="">Selecione...<\/option>\s*\{servicos.map\(s => <option key={s.id} value={s.id}>{s.nome}<\/option>\)\}\s*<\/select>\s*<\/div>)/;

code = code.replace(regex, "{tipoAgendamento === 'Normal' && (\n$1\n)}");

fs.writeFileSync('src/pages/Agenda.jsx', code);
console.log('done');
