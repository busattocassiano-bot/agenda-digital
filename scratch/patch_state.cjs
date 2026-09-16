const fs = require('fs');
let code = fs.readFileSync('src/components/AvaliacaoWizardModal.jsx', 'utf8');

const t = `  const [pacienteData, setPacienteData] = useState({`;
const r = `  const [pacienteData, setPacienteData] = useState(() => {
    if (clienteId) {
      const existing = pacientes.find(p => String(p.id) === String(clienteId));
      if (existing) {
        return {
          ...existing,
          nome: existing.nome || initialNome || '',
          telefone: existing.telefone || initialTelefone || '',
          endereco: existing.endereco || { logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '' }
        };
      }
    }
    return {`;
code = code.replace(t, r);
fs.writeFileSync('src/components/AvaliacaoWizardModal.jsx', code);
console.log('done');
