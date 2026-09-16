import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, Calculator, ChevronDown, CheckCircle2, FileText } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';

export default function FechamentoComissao() {
  const { profissionais, agendamentos, addDespesa } = useAppData();
  
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState(new Date().toISOString().split('T')[0]);
  const [selectedProfissional, setSelectedProfissional] = useState('Todos');

  const resultados = useMemo(() => {
    // Pegar agendamentos realizados no período
    let agendamentosNoPeriodo = agendamentos.filter(a => a.status === 'Realizado');

    // Filtrar por data
    agendamentosNoPeriodo = agendamentosNoPeriodo.filter(a => {
      let agData = a.data;
      if (!agData) return false;
      if (dataInicio && agData < dataInicio) return false;
      if (dataFim && agData > dataFim) return false;
      return true;
    });

    const comissoes = {};

    // 1. Inicializar todos os profissionais selecionados (ou todos)
    const profsParaCalcular = selectedProfissional === 'Todos' 
      ? profissionais 
      : profissionais.filter(p => String(p.id) === String(selectedProfissional));

    if (profsParaCalcular.length === 0) {
      return [];
    }

    profsParaCalcular.forEach(prof => {
      const valorFixo = parseFloat(String(prof.comissaoFixo || '0').replace(',', '.')) || 0;
      // Para futura comissão em %: const porcentagem = parseFloat(String(prof.comissaoPorcentagem || '0').replace(',', '.')) || 0;

      comissoes[prof.id] = {
        profissional: prof,
        qtdAtendimentos: 0,
        valorFixoMensal: valorFixo, 
        totalComissao: valorFixo 
      };
    });

    // 2. Somar os atendimentos informativos
    agendamentosNoPeriodo.forEach(a => {
      if (comissoes[a.profissionalId]) {
        comissoes[a.profissionalId].qtdAtendimentos += 1;
      }
    });

    return Object.values(comissoes).filter(c => c.totalComissao > 0 || c.qtdAtendimentos > 0);
  }, [agendamentos, profissionais, dataInicio, dataFim, selectedProfissional]);

  const handleGerarDespesa = (res) => {
    const confirm = window.confirm(`Gerar despesa de comissão no valor de R$ ${res.totalComissao.toFixed(2)} para ${res.profissional.nome}?`);
    if (confirm) {
      addDespesa({
        descricao: `Comissão/Fixo: ${res.profissional.nome} (${res.qtdAtendimentos} atendimentos)`,
        valor: res.totalComissao.toFixed(2).replace('.', ','),
        dataVencimento: new Date().toISOString().split('T')[0],
        status: 'A PAGAR',
        dataPagamento: ''
      });
      alert('Despesa gerada com sucesso no Controle de Despesas!');
    }
  };

  const formatCurrency = (val) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Main Card */}
      <div className="card" style={{ padding: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', margin: '0 0 24px 0', color: '#1e293b' }}>Fechamento de Comissões</h2>
        
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px' }}>
          
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dark)', fontWeight: 600, fontSize: '0.85rem' }}>Data início</label>
            <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
               <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} style={{ flex: 1, border: 'none', padding: '10px 16px', outline: 'none', color: 'var(--text-main)', fontSize: '0.95rem' }} />
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dark)', fontWeight: 600, fontSize: '0.85rem' }}>Data fim</label>
            <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
               <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} style={{ flex: 1, border: 'none', padding: '10px 16px', outline: 'none', color: 'var(--text-main)', fontSize: '0.95rem' }} />
            </div>
          </div>

          <div style={{ flex: 2 }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dark)', fontWeight: 600, fontSize: '0.85rem' }}>Profissional:</label>
            <div style={{ position: 'relative' }}>
              <select 
                value={selectedProfissional}
                onChange={(e) => setSelectedProfissional(e.target.value)}
                style={{ width: '100%', padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', color: 'var(--text-main)', background: 'white', appearance: 'none', cursor: 'pointer', fontSize: '0.95rem' }}
              >
                <option value="Todos">Todos</option>
                {profissionais.map(p => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
              <ChevronDown size={16} color="var(--text-muted)" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
          </div>

        </div>
      </div>

      {resultados.length > 0 && (
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <FileText size={24} color="var(--text-dark)" />
            <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text-dark)' }}>Resultados do Período</h3>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Profissional</th>
                  <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textAlign: 'center' }}>Atendimentos (Informativo)</th>
                  <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textAlign: 'center' }}>Valor Fixo Mensal (R$)</th>
                  <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textAlign: 'center' }}>Total a Pagar</th>
                  <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {resultados.map((res, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '16px', color: 'var(--text-dark)', fontWeight: 600 }}>{res.profissional.nome}</td>
                    <td style={{ padding: '16px', color: 'var(--text-main)', textAlign: 'center' }}>{res.qtdAtendimentos}</td>
                    <td style={{ padding: '16px', color: 'var(--text-main)', textAlign: 'center' }}>{formatCurrency(res.valorFixoMensal)}</td>
                    <td style={{ padding: '16px', color: '#16a34a', fontWeight: 700, fontSize: '1.05rem', textAlign: 'center' }}>{formatCurrency(res.totalComissao)}</td>
                    <td style={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
                      <button 
                        onClick={() => handleGerarDespesa(res)}
                        style={{ background: '#1e293b', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <CheckCircle2 size={14} /> Gerar Despesa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
