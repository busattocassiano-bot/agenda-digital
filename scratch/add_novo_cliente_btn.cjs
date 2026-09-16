const fs = require('fs');
let code = fs.readFileSync('src/pages/Pacientes.jsx', 'utf8');

const t = `<div className="flex-between" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#1e293b' }}>Lista de Clientes</h2>
        </div>`;

const r = `<div className="flex-between" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#1e293b' }}>Lista de Clientes</h2>
          <button 
            onClick={() => setNovoClienteModalOpen(true)}
            style={{ background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          >
            <Plus size={18} /> Novo Cliente
          </button>
        </div>`;

code = code.replace(t, r);
fs.writeFileSync('src/pages/Pacientes.jsx', code);
console.log('done');
