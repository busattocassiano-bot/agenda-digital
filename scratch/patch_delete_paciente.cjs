const fs = require('fs');

// Patch AppDataContext.jsx
let ctxCode = fs.readFileSync('src/context/AppDataContext.jsx', 'utf8');

if (!ctxCode.includes('const deletePaciente =')) {
    ctxCode = ctxCode.replace(
        "const updatePaciente = (id, data) => updateDocument('pacientes', id, data);",
        "const updatePaciente = (id, data) => updateDocument('pacientes', id, data);\n  const deletePaciente = (id) => deleteDocument('pacientes', id);"
    );
    ctxCode = ctxCode.replace(
        "pacientes, addPaciente, setPacientes, updatePaciente,",
        "pacientes, addPaciente, setPacientes, updatePaciente, deletePaciente,"
    );
    fs.writeFileSync('src/context/AppDataContext.jsx', ctxCode);
    console.log('Patched AppDataContext');
}

// Patch Pacientes.jsx
let pacCode = fs.readFileSync('src/pages/Pacientes.jsx', 'utf8');
if (pacCode.includes('setPacientes(pacientes.filter')) {
    pacCode = pacCode.replace(
        "const { pacientes, addPaciente, updatePaciente } = useAppData();",
        "const { pacientes, addPaciente, updatePaciente, deletePaciente } = useAppData();"
    );
    
    // There might be multiple occurrences of useAppData, let's just use regex for safety on the exact button
    const targetBtn = /<button onClick=\{\(\) => setPacientes\(pacientes\.filter\(p => p\.id !== paciente\.id\)\)\} style=\{\{ background: '#fef2f2', border: 'none', padding: '8px', borderRadius: '6px', color: '#ef4444', cursor: 'pointer' \}\} title="Excluir"><Trash2 size=\{16\} \/><\/button>/;
    const newBtn = `<button onClick={() => { if(window.confirm('Tem certeza que deseja excluir este paciente permanentemente?')) deletePaciente(paciente.id); }} style={{ background: '#fef2f2', border: 'none', padding: '8px', borderRadius: '6px', color: '#ef4444', cursor: 'pointer' }} title="Excluir"><Trash2 size={16} /></button>`;
    
    pacCode = pacCode.replace(targetBtn, newBtn);
    fs.writeFileSync('src/pages/Pacientes.jsx', pacCode);
    console.log('Patched Pacientes.jsx');
}
