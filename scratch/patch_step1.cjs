const fs = require('fs');
let code = fs.readFileSync('src/components/AvaliacaoWizardModal.jsx', 'utf8');

const t = `<button onClick={() => setStep(step + 1)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: 600, cursor: 'pointer' }}>`;
const r = `<button onClick={async () => {
                  try {
                    let finalPacienteId = clienteId;
                    if (!clienteId) {
                      finalPacienteId = await addPaciente({
                        ...pacienteData,
                        nomePesquisa: pacienteData.nome.toLowerCase()
                      });
                    } else {
                      updatePaciente(clienteId, pacienteData);
                    }
                    alert('Cadastro salvo com sucesso!');
                    onClose();
                  } catch (err) {
                    alert('Erro ao Salvar: ' + err.message);
                  }
                }} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 20px', fontWeight: 600, cursor: 'pointer' }}>
                  Apenas Salvar Cadastro
                </button>
                <button onClick={() => setStep(step + 1)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: 600, cursor: 'pointer' }}>`;

code = code.replace(t, r);
fs.writeFileSync('src/components/AvaliacaoWizardModal.jsx', code);
