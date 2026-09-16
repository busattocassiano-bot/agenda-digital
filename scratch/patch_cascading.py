import re
import sys

ctx_file = r'C:\Users\cassi\.gemini\antigravity\scratch\agenda-digital\src\context\AppDataContext.jsx'
with open(ctx_file, 'r', encoding='utf-8') as f:
    ctx_code = f.read()

# 1. Modify deletePaciente to cascade delete
old_delete_paciente = "const deletePaciente = (id) => deleteDocument('pacientes', id);"
new_delete_paciente = """const deletePaciente = async (id) => {
    // Apagar paciente
    await deleteDocument('pacientes', id);
    // Apagar agendamentos vinculados
    agendamentos.filter(a => a.clienteId === id).forEach(a => deleteDocument('agendamentos', a.id));
    // Apagar evolucoes vinculadas
    evolucoes.filter(e => e.clienteId === id).forEach(e => deleteDocument('evolucoes', e.id));
    // Apagar matriculas vinculadas
    matriculas.filter(m => m.clienteId === id).forEach(m => deleteDocument('matriculas', m.id));
    // Apagar avaliacoes vinculadas
    avaliacoes.filter(av => av.clienteId === id).forEach(av => deleteDocument('avaliacoes', av.id));
    // Apagar recebimentos vinculados
    recebimentos.filter(r => r.clienteId === id).forEach(r => deleteDocument('recebimentos', r.id));
  };"""

ctx_code = ctx_code.replace(old_delete_paciente, new_delete_paciente)

# 2. Modify deleteAgendamento to cascade delete evolucoes and recebimentos avulsos
old_delete_agendamento = "const deleteAgendamento = (id) => deleteDocument('agendamentos', id);"
new_delete_agendamento = """const deleteAgendamento = async (id) => {
    await deleteDocument('agendamentos', id);
    // Apagar evolução vinculada
    const evolucaoLinked = evolucoes.find(e => e.idAgendamento === id);
    if (evolucaoLinked) {
      deleteDocument('evolucoes', evolucaoLinked.id);
    }
    // Apagar recebimento vinculado (cobrança avulsa)
    const recebimentoLinked = recebimentos.find(r => r.idAgendamento === id);
    if (recebimentoLinked) {
      deleteDocument('recebimentos', recebimentoLinked.id);
    }
  };"""

ctx_code = ctx_code.replace(old_delete_agendamento, new_delete_agendamento)

# 3. Remove window.confirm from deleteRecebimento in Context
old_delete_recebimento = """const deleteRecebimento = (id) => {
    if (window.confirm("Tem certeza que deseja excluir este recebimento?")) {
      deleteDocument('recebimentos', id);
    }
  };"""
new_delete_recebimento = "const deleteRecebimento = (id) => deleteDocument('recebimentos', id);"
ctx_code = ctx_code.replace(old_delete_recebimento, new_delete_recebimento)

with open(ctx_file, 'w', encoding='utf-8') as f:
    f.write(ctx_code)

print("Patched AppDataContext")

# 4. Patch Financeiro.jsx to handle confirmation for deleteRecebimento
fin_file = r'C:\Users\cassi\.gemini\antigravity\scratch\agenda-digital\src\pages\Financeiro.jsx'
try:
    with open(fin_file, 'r', encoding='utf-8') as f:
        fin_code = f.read()
    
    fin_code = fin_code.replace(
        "deleteRecebimento(rec.id)",
        "if(window.confirm('Tem certeza que deseja excluir este recebimento?')) deleteRecebimento(rec.id)"
    )
    with open(fin_file, 'w', encoding='utf-8') as f:
        f.write(fin_code)
    print("Patched Financeiro")
except Exception as e:
    print(f"Failed patching Financeiro: {e}")

# 5. Patch Agenda.jsx to link recebimento to agendamento and await
agenda_file = r'C:\Users\cassi\.gemini\antigravity\scratch\agenda-digital\src\pages\Agenda.jsx'
with open(agenda_file, 'r', encoding='utf-8') as f:
    agenda_code = f.read()

# Make handleSaveAgendamento async
agenda_code = agenda_code.replace("const handleSaveAgendamento = () => {", "const handleSaveAgendamento = async () => {")

# Await addAgendamento and pass idAgendamento to addRecebimento
pattern_add_agendamento = re.compile(
    r"addAgendamento\(payload\);\s*if \(gerarCobrancaAvulsa\) \{\s*addRecebimento\(\{", 
    re.DOTALL
)

agenda_code = pattern_add_agendamento.sub("""const novoAgendamentoId = await addAgendamento(payload);
  
      if (gerarCobrancaAvulsa) {
          addRecebimento({
              idAgendamento: novoAgendamentoId,
              """, agenda_code)

with open(agenda_file, 'w', encoding='utf-8') as f:
    f.write(agenda_code)
print("Patched Agenda")
