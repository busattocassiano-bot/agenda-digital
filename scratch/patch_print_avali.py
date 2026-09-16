import sys

file_path = r'C:\Users\cassi\.gemini\antigravity\scratch\agenda-digital\src\pages\PacientePerfil.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

print_function = """
  const handlePrintAvaliacao = (av, evolucoesVinc) => {
    const printWindow = window.open('', '_blank');
    const evolucoesHtml = evolucoesVinc.map(ev => `
      <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #ddd;">
        <p><strong>Data:</strong> ${ev.data} - <strong>Profissional:</strong> ${ev.profissionalNome || 'Não informado'} ${ev.registro ? `(${ev.registro})` : ''}</p>
        <p><strong>Evolução:</strong> ${ev.descricao || 'Sem descrição'}</p>
        <div style="margin-top: 30px; display: flex; justify-content: flex-end;">
          <div style="border-top: 1px solid #000; width: 300px; text-align: center; padding-top: 5px;">
            Assinatura / Carimbo do Profissional
          </div>
        </div>
      </div>
    `).join('');

    const html = `
      <html>
        <head>
          <title>Prontuário - Avaliação e Evoluções</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6; }
            h1 { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .header-info { margin-bottom: 20px; }
            .header-info p { margin: 5px 0; }
            .section { margin-top: 20px; border: 1px solid #ccc; padding: 15px; border-radius: 8px; }
            .section h3 { margin-top: 0; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Ficha de Prontuário Fisioterapêutico</h1>
          
          <div class="header-info">
            <p><strong>Paciente:</strong> ${paciente.nome}</p>
            <p><strong>Data de Nascimento:</strong> ${paciente.dataNascimento || 'Não informado'} | <strong>Telefone:</strong> ${paciente.telefone || 'Não informado'}</p>
            <p><strong>Data da Avaliação:</strong> ${av.data ? av.data.split('-').reverse().join('/') : 'N/A'}</p>
          </div>

          <div class="section">
            <h3>Avaliação Inicial</h3>
            <p><strong>Queixa Principal:</strong><br/>${av.queixaPrincipal || 'N/A'}</p>
            <p><strong>Hábitos de Vida:</strong><br/>${av.habitosVida || 'N/A'}</p>
            <p><strong>Testes Funcionais e Observações:</strong><br/>${av.expectativas || 'N/A'}</p>
            <p><strong>Plano de Tratamento:</strong><br/>${av.planoTratamento || 'N/A'}</p>
          </div>

          <div class="section">
            <h3>Histórico de Evoluções (${evolucoesVinc.length})</h3>
            ${evolucoesHtml || '<p>Nenhuma evolução registrada para esta avaliação.</p>'}
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleRemoveAnexo = (anexoId) => {
"""

content = content.replace("  const handleRemoveAnexo = (anexoId) => {", print_function)


btn_old = """                            <button 
                              onClick={() => setExpandedAvaliacaoId(isExpanded ? null : av.id)}
                              style={{ background: 'white', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-color)', cursor: 'pointer' }}
                            >
                              {isExpanded ? 'Ocultar Evoluções' : `Ver Evoluções (${evolucoesVinculadas.length})`}
                            </button>"""

btn_new = """                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button 
                                onClick={() => setExpandedAvaliacaoId(isExpanded ? null : av.id)}
                                style={{ background: 'white', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-color)', cursor: 'pointer' }}
                              >
                                {isExpanded ? 'Ocultar Evoluções' : `Ver Evoluções (${evolucoesVinculadas.length})`}
                              </button>
                              <button 
                                onClick={() => handlePrintAvaliacao(av, evolucoesVinculadas)}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--primary-color)', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'white', cursor: 'pointer' }}
                              >
                                <Printer size={16} /> Imprimir Prontuário
                              </button>
                            </div>"""

content = content.replace(btn_old, btn_new)

# Wait, we need Printer icon from lucide-react if not imported
if "Printer" not in content:
    content = content.replace("import { User, Calendar, DollarSign, FileText, Activity, CreditCard, Paperclip, Plus, Save, Trash2, ArrowLeft, Download, X, HeartPulse } from 'lucide-react';", 
                              "import { User, Calendar, DollarSign, FileText, Activity, CreditCard, Paperclip, Plus, Save, Trash2, ArrowLeft, Download, X, HeartPulse, Printer } from 'lucide-react';")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Print feature added!")
