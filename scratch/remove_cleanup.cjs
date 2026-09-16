const fs = require('fs');

// 1. Remove from Dashboard.jsx
let dash = fs.readFileSync('src/pages/Dashboard.jsx', 'utf8');

dash = dash.replace(
    "const { pacientes, profissionais, agendamentos, recebimentos, despesas, limparOrfaos } = useAppData();",
    "const { pacientes, profissionais, agendamentos, recebimentos, despesas } = useAppData();"
);

const oldButtonStr = `
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => window.print()} style={{ background: 'white', border: '1px solid var(--border-color)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: 'var(--text-dark)' }}>Imprimir Relatório</button>
            <button onClick={() => { if(window.confirm('Isto fará uma varredura apagando todos os registros fantasmas no banco. Continuar?')) limparOrfaos() }} style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: '#ef4444' }}>Limpar Dados Órfãos</button>
          </div>
`;

dash = dash.replace(
    oldButtonStr,
    "<button onClick={() => window.print()} style={{ background: 'white', border: '1px solid var(--border-color)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: 'var(--text-dark)' }}>Imprimir Relatório</button>"
);

fs.writeFileSync('src/pages/Dashboard.jsx', dash);

// 2. Remove from AppDataContext.jsx
let ctx = fs.readFileSync('src/context/AppDataContext.jsx', 'utf8');

const orphanScript = `
  const limparOrfaos = async () => {
    let count = 0;
    // 1. Agendamentos orfaos (que não são bloqueios e não têm paciente correspondente)
    const agendsToDel = agendamentos.filter(a => a.tipo !== 'bloqueio' && a.clienteId && !pacientes.some(p => p.id === a.clienteId));
    for (const a of agendsToDel) {
      await deleteDocument('agendamentos', a.id);
      count++;
    }
    // 2. Evolucoes orfas
    const evoToDel = evolucoes.filter(e => e.clienteId && !pacientes.some(p => p.id === e.clienteId));
    for (const e of evoToDel) {
      await deleteDocument('evolucoes', e.id);
      count++;
    }
    // 3. Recebimentos orfaos
    const recToDel = recebimentos.filter(r => r.clienteId && !pacientes.some(p => p.id === r.clienteId));
    for (const r of recToDel) {
      await deleteDocument('recebimentos', r.id);
      count++;
    }
    // 4. Avaliacoes orfas
    const avaToDel = avaliacoes.filter(av => av.clienteId && !pacientes.some(p => p.id === av.clienteId));
    for (const av of avaToDel) {
      await deleteDocument('avaliacoes', av.id);
      count++;
    }
    // 5. Matriculas orfas
    const matToDel = matriculas.filter(m => m.clienteId && !pacientes.some(p => p.id === m.clienteId));
    for (const m of matToDel) {
      await deleteDocument('matriculas', m.id);
      count++;
    }
    alert(\`Limpeza concluída! \${count} registros órfãos (antigos) foram apagados do banco.\`);
  };

  const resetData = async () => {
`;

ctx = ctx.replace(orphanScript, "const resetData = async () => {\n");
ctx = ctx.replace("resetData, limparOrfaos", "resetData");

fs.writeFileSync('src/context/AppDataContext.jsx', ctx);
console.log('Removed limparOrfaos completely');
