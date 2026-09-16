const fs = require('fs');

let code = fs.readFileSync('src/components/AvaliacaoWizardModal.jsx', 'utf8');

code = code.replace(
  'const handleSkipMatricula = () => {\\n    try {\\n      concluirFluxo(false);',
  'const handleSkipMatricula = async () => {\\n    try {\\n      await concluirFluxo(false);'
);

code = code.replace(
  'try {\\n      concluirFluxo(true);',
  'try {\\n      await concluirFluxo(true);'
);

code = code.replace(
  'const concluirFluxo = (comMatricula) => {',
  'const concluirFluxo = async (comMatricula) => {'
);

code = code.replace(
  'finalPacienteId = addPaciente(pacienteData);',
  'finalPacienteId = await addPaciente(pacienteData);'
);

code = code.replace(
  'novaMatriculaId = addMatricula({',
  'novaMatriculaId = await addMatricula({'
);

fs.writeFileSync('src/components/AvaliacaoWizardModal.jsx', code);
console.log('done');
