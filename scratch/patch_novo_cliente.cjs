const fs = require('fs');
let code = fs.readFileSync('src/pages/Pacientes.jsx', 'utf8');

const t = `onClick={() => setNovoClienteModalOpen(true)}
            style={{ background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}`;

const r = `onClick={() => setWizardModalOpen(true)}
            style={{ background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}`;

code = code.replace(t, r);
fs.writeFileSync('src/pages/Pacientes.jsx', code);
console.log('done');
