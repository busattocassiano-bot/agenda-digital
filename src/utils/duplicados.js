// Verificação de pacientes possivelmente duplicados (nome, CPF ou telefone).
const norm = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
const digits = (s) => (s || '').replace(/\D/g, '');

export function encontrarDuplicados(pacientes, { nome, telefone, cpf }, ignorarId = null) {
  const n = norm(nome);
  const t = digits(telefone);
  const c = digits(cpf);
  const motivos = [];
  (pacientes || []).filter(p => p.id !== ignorarId).forEach(p => {
    if (n && norm(p.nome) === n) motivos.push(`• Mesmo NOME: ${p.nome}${p.telefone ? ` (${p.telefone})` : ''}`);
    else if (c.length === 11 && digits(p.cpf) === c) motivos.push(`• Mesmo CPF: ${p.nome} (${p.cpf})`);
    else if (t.length >= 10 && digits(p.telefone) === t) motivos.push(`• Mesmo TELEFONE: ${p.nome} (${p.telefone})`);
  });
  return motivos;
}

// Retorna true se pode continuar (sem duplicados ou usuário confirmou).
export function confirmarSeDuplicado(pacientes, dados, ignorarId = null, mensagemExtra = '') {
  const motivos = encontrarDuplicados(pacientes, dados, ignorarId);
  if (!motivos.length) return true;
  return window.confirm(
    `⚠️ Atenção! Já existe paciente cadastrado parecido:\n\n${motivos.slice(0, 5).join('\n')}\n\n${mensagemExtra}Deseja continuar mesmo assim?`
  );
}
