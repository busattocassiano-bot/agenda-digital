import React, { useState, useMemo } from 'react';
import { FileText, Calendar, Search, Printer, DollarSign, UserCheck } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';

export default function RelatorioFechamento() {
  const { recebimentos, pacientes } = useAppData();

  const [dataInicio, setDataInicio] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  
  const [dataFim, setDataFim] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    d.setDate(0);
    return d.toISOString().split('T')[0];
  });

  const parseCurrency = (val) => parseFloat(String(val).replace('R$', '').replace(/\./g, '').replace(',', '.')) || 0;
  const formatCurrency = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const relatorio = useMemo(() => {
    // Pegar apenas o que foi PAGO
    let filtrados = recebimentos.filter(r => r.status === 'PAGO' && r.dataPagamento);

    // Filtrar pela DATA DE PAGAMENTO
    filtrados = filtrados.filter(r => {
      let d = r.dataPagamento;
      // Converter DD/MM/YYYY para YYYY-MM-DD se necessário
      if (d.includes('/')) {
        d = d.split('/').reverse().join('-');
      }
      
      if (dataInicio && d < dataInicio) return false;
      if (dataFim && d > dataFim) return false;
      return true;
    });

    // Enriquecer com os dados do Paciente (CPF) e formatar
    const enriquecidos = filtrados.map(r => {
      const pac = pacientes.find(p => String(p.id) === String(r.pacienteId));
      return {
        ...r,
        cpf: pac?.cpf || 'Não informado',
        valorReal: parseCurrency(r.valorPago || r.valor),
        dataPagamentoFormatada: r.dataPagamento.includes('-') 
          ? r.dataPagamento.split('-').reverse().join('/') 
          : r.dataPagamento
      };
    });

    // Ordenar por data de pagamento (mais recentes primeiro)
    return enriquecidos.sort((a, b) => {
      let dA = a.dataPagamento.includes('/') ? a.dataPagamento.split('/').reverse().join('-') : a.dataPagamento;
      let dB = b.dataPagamento.includes('/') ? b.dataPagamento.split('/').reverse().join('-') : b.dataPagamento;
      return dB.localeCompare(dA); // Descrescente
    });

  }, [recebimentos, pacientes, dataInicio, dataFim]);

  const totalMensal = relatorio.reduce((acc, curr) => acc + curr.valorReal, 0);

  const handleImprimir = () => {
    const printWindow = window.open('', '_blank');
    
    // Construir as linhas da tabela
    const rowsHtml = relatorio.map(r => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${r.dataPagamentoFormatada}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>${r.nomePaciente}</strong></td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${r.cpf}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${r.modalidade || r.descricao || 'Serviço avulso'}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${r.tipoPagamento || 'Dinheiro'}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${formatCurrency(r.valorReal)}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <html>
        <head>
          <title>Relatório de Fechamento - NF</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
            h1 { font-size: 24px; margin-bottom: 5px; color: #1e293b; }
            p { color: #64748b; margin-top: 0; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; font-size: 14px; }
            th { background: #f8fafc; padding: 12px 10px; text-align: left; border-bottom: 2px solid #cbd5e1; color: #475569; }
            th.right { text-align: right; }
            .total-box { margin-top: 30px; padding: 20px; background: #f0fdf4; border: 1px solid #bbf7d0; display: inline-block; border-radius: 8px; }
            .total-text { font-size: 20px; font-weight: bold; color: #16a34a; margin: 0; }
          </style>
        </head>
        <body>
          <h1>Relatório de Fechamento para Notas Fiscais</h1>
          <p>Período selecionado: ${dataInicio.split('-').reverse().join('/')} a ${dataFim.split('-').reverse().join('/')}</p>
          
          <table>
            <thead>
              <tr>
                <th>Data do Pagamento</th>
                <th>Paciente / Cliente</th>
                <th>CPF</th>
                <th>Serviços Realizados</th>
                <th>Forma de Pagto</th>
                <th class="right">Valor Pago</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="total-box">
            <p class="total-text">Total Recebido: ${formatCurrency(totalMensal)}</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--text-dark)', marginBottom: '8px' }}>Fechamento para NF</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 500 }}>
            Relatório de pagamentos efetivados por clientes para emissão de Notas Fiscais
          </p>
        </div>
        <button onClick={handleImprimir} style={{ background: '#0275d8', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: 600, cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Printer size={18} /> Imprimir Relatório
        </button>
      </div>

      {/* Filtros */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Data do Pagamento (Início)</label>
            <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', background: 'white' }}>
               <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} style={{ flex: 1, width: '140px', border: 'none', padding: '10px 16px', outline: 'none', color: 'var(--text-main)', fontWeight: 600 }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Data do Pagamento (Fim)</label>
            <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', background: 'white' }}>
               <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} style={{ flex: 1, width: '140px', border: 'none', padding: '10px 16px', outline: 'none', color: 'var(--text-main)', fontWeight: 600 }} />
            </div>
          </div>

          <div style={{ paddingBottom: '4px' }}>
            <div style={{ background: '#dcfce7', color: '#16a34a', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #bbf7d0' }}>
              <DollarSign size={20} /> Total: {formatCurrency(totalMensal)}
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Resultados */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <FileText size={24} color="var(--text-dark)" />
          <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-dark)' }}>Listagem de Pagamentos ({relatorio.length})</h3>
        </div>

        {relatorio.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', background: '#f8fafc', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
            Nenhum pagamento encontrado para o período selecionado.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Data do Pagamento</th>
                  <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Paciente / Cliente</th>
                  <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>CPF</th>
                  <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Serviços Realizados</th>
                  <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Forma de Pagto</th>
                  <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textAlign: 'right' }}>Valor Pago</th>
                </tr>
              </thead>
              <tbody>
                {relatorio.map((r, index) => (
                  <tr key={r.id || index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '16px', color: 'var(--text-dark)', fontWeight: 600 }}>{r.dataPagamentoFormatada}</td>
                    <td style={{ padding: '16px', color: 'var(--text-dark)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <UserCheck size={16} color="var(--text-muted)" /> {r.nomePaciente}
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-main)' }}>{r.cpf}</td>
                    <td style={{ padding: '16px', color: 'var(--text-main)' }}>{r.modalidade || r.descricao || 'Serviço avulso'}</td>
                    <td style={{ padding: '16px', color: 'var(--text-main)' }}>
                      <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                        {r.tipoPagamento || 'Dinheiro'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: '#16a34a', fontWeight: 700, textAlign: 'right' }}>{formatCurrency(r.valorReal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
