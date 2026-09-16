import React, { useState } from 'react';
import { Filter, Calendar as CalendarIcon, TrendingUp, TrendingDown, DollarSign, FileText, BarChart3, PieChart, Wallet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAppData } from '../context/AppDataContext';

export default function BalancoFinanceiro() {
  const { recebimentos, despesas } = useAppData();

  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFinal, setFiltroDataFinal] = useState('');

  const parseCurrency = (val) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    const str = val.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
    return parseFloat(str) || 0;
  };

  const formatCurrency = (val) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const isDateInRange = (dateStr) => {
    if (!dateStr) return false;
    let refDate = null;
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) refDate = new Date(parts[2], parts[1] - 1, parts[0]);
    } else if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3) refDate = new Date(parts[0], parts[1] - 1, parts[2]);
    }

    if (!refDate) return false;

    if (filtroDataInicio) {
      const parts = filtroDataInicio.split('-');
      if (parts.length === 3) {
        const startD = new Date(parts[0], parts[1] - 1, parts[2]);
        if (refDate < startD) return false;
      }
    }
    if (filtroDataFinal) {
      const parts = filtroDataFinal.split('-');
      if (parts.length === 3) {
        const endD = new Date(parts[0], parts[1] - 1, parts[2], 23, 59, 59);
        if (refDate > endD) return false;
      }
    }
    return true;
  };

  const filteredRecebimentos = (filtroDataInicio || filtroDataFinal) 
    ? recebimentos.filter(r => isDateInRange(r.dataPagamento || r.dataVencimento))
    : recebimentos;

  const filteredDespesas = (filtroDataInicio || filtroDataFinal)
    ? despesas.filter(d => isDateInRange(d.dataPagamento || d.dataVencimento))
    : despesas;

  // Calcular totais reais (apenas PAGOS)
  const totalReceita = filteredRecebimentos
    .filter(r => r.status === 'PAGO')
    .reduce((acc, curr) => acc + parseCurrency(curr.valorPago || curr.valor), 0);

  const totalDespesas = filteredDespesas
    .filter(d => d.status === 'PAGO')
    .reduce((acc, curr) => acc + parseCurrency(curr.valor), 0);

  const lucroLiquido = totalReceita - totalDespesas;
  const margem = totalReceita > 0 ? ((lucroLiquido / totalReceita) * 100).toFixed(1) : 0;

  const data = [
    { name: 'Atual', Receita: totalReceita, Despesas: totalDespesas }
  ];

  // Movimentações recentes
  const movimentacoes = [
    ...filteredRecebimentos.filter(r => r.status === 'PAGO').map(r => ({
      id: `rec-${r.id}`,
      data: r.dataPagamento,
      descricao: `Recebimento: ${r.nomePaciente} (${r.modalidade})`,
      categoria: 'Receita',
      tipo: 'Entrada',
      valor: parseCurrency(r.valorPago || r.valor)
    })),
    ...filteredDespesas.filter(d => d.status === 'PAGO').map(d => ({
      id: `desp-${d.id}`,
      data: d.dataPagamento,
      descricao: d.descricao,
      categoria: 'Despesa',
      tipo: 'Saída',
      valor: parseCurrency(d.valor)
    }))
  ].sort((a, b) => {
    // Basic date sort assuming DD/MM/YYYY
    const parseDate = (dStr) => {
      if (!dStr) return 0;
      const parts = dStr.split('/');
      if (parts.length === 3) {
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime();
      }
      return 0;
    };
    return parseDate(b.data) - parseDate(a.data);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--text-dark)', marginBottom: '8px' }}>Balanço Financeiro</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 500 }}>Controle de Receita, Despesas e Lucros</p>
      </div>

      {/* Filter Card */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Filter size={20} color="var(--text-dark)" />
          <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-dark)' }}>Filtro de Período</h3>
        </div>
        
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '16px' }}>
          Por padrão o período é o <strong style={{color: '#64748b'}}>mês calendário atual</strong> (mesma ideia da lista de Recebimentos). A receita considera apenas pagamentos efetivos (data de pagamento), sem filtro por modalidade ou plano.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
           <input type="checkbox" id="comissoes" style={{ width: '16px', height: '16px', accentColor: 'var(--primary-color)' }} />
           <label htmlFor="comissoes" style={{ color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer' }}>Considerar comissões e pré-comissões</label>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Data início</label>
            <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', background: 'white' }}>
               <input type="date" value={filtroDataInicio} onChange={(e) => setFiltroDataInicio(e.target.value)} style={{ flex: 1, border: 'none', padding: '10px 16px', outline: 'none', color: 'var(--text-main)', fontWeight: 600 }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Data fim</label>
            <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', background: 'white' }}>
               <input type="date" value={filtroDataFinal} onChange={(e) => setFiltroDataFinal(e.target.value)} style={{ flex: 1, border: 'none', padding: '10px 16px', outline: 'none', color: 'var(--text-main)', fontWeight: 600 }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginLeft: '16px', color: '#cbd5e1', fontWeight: 600, fontSize: '0.9rem' }}>
            <span style={{ cursor: 'pointer', color: 'var(--primary-color)' }}>Mês atual</span>
            <span style={{ cursor: 'pointer' }}>7 dias</span>
            <span style={{ cursor: 'pointer' }}>30 dias</span>
            <span style={{ cursor: 'pointer' }}>90 dias</span>
            <span style={{ cursor: 'pointer' }}>6 meses</span>
            <span style={{ cursor: 'pointer' }}>12 meses</span>
          </div>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        <div className="card" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: '#dcfce7', color: '#16a34a', padding: '16px', borderRadius: '12px', display: 'flex', flexShrink: 0 }}>
            <TrendingUp size={28} />
          </div>
          <div>
            <p style={{ color: 'var(--text-dark)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px' }}>RECEITA</p>
            <h2 style={{ fontSize: '1.6rem', margin: 0, color: '#16a34a' }}>{formatCurrency(totalReceita)}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px', lineHeight: '1.4' }}>Soma do valor pago no período</p>
          </div>
        </div>
        
        <div className="card" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: '#fee2e2', color: '#e11d48', padding: '16px', borderRadius: '12px', display: 'flex', flexShrink: 0 }}>
            <TrendingDown size={28} />
          </div>
          <div>
            <p style={{ color: 'var(--text-dark)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px' }}>DESPESAS</p>
            <h2 style={{ fontSize: '1.6rem', margin: 0, color: '#e11d48' }}>{formatCurrency(totalDespesas)}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px', lineHeight: '1.4' }}>Total de saídas</p>
          </div>
        </div>

        <div className="card" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: '#fce7f3', color: '#334155', padding: '16px', borderRadius: '12px', display: 'flex', flexShrink: 0 }}>
            <DollarSign size={28} />
          </div>
          <div>
            <p style={{ color: 'var(--text-dark)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px' }}>LUCRO LÍQUIDO</p>
            <h2 style={{ fontSize: '1.6rem', margin: 0, color: lucroLiquido >= 0 ? '#16a34a' : '#e11d48' }}>{formatCurrency(lucroLiquido)}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px', lineHeight: '1.4' }}>Receita - Despesas</p>
          </div>
        </div>

        <div className="card" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: '#ffedd5', color: '#475569', padding: '16px', borderRadius: '12px', display: 'flex', flexShrink: 0 }}>
            <FileText size={28} />
          </div>
          <div>
            <p style={{ color: 'var(--text-dark)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px' }}>MARGEM</p>
            <h2 style={{ fontSize: '1.6rem', margin: 0, color: '#16a34a' }}>{margem}%</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px', lineHeight: '1.4' }}>Margem de lucro</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Bar Chart */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <BarChart3 size={20} color="var(--text-dark)" />
            <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-dark)' }}>Evolução Financeira Mensal</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>Os valores por mês correspondem ao <strong style={{color: '#64748b'}}>mesmo período</strong> selecionado acima (receitas e despesas agrupadas por mês-calendário).</p>
          
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={{stroke: '#e2e8f0'}} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickCount={6} />
                <Tooltip />
                <Legend verticalAlign="top" align="center" wrapperStyle={{ paddingBottom: '20px' }} iconType="rect" />
                <Bar dataKey="Receita" fill="#5eead4" radius={[2, 2, 0, 0]} barSize={40} />
                <Bar dataKey="Despesas" fill="#fca5a5" radius={[2, 2, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart (Empty State) */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <PieChart size={20} color="var(--text-dark)" />
            <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-dark)' }}>Distribuição de Despesas</h3>
          </div>
          <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.95rem' }}>
            Nenhuma despesa no período.
          </div>
        </div>
      </div>

      {/* Table Row */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <Wallet size={20} color="var(--text-dark)" />
          <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-dark)' }}>Movimentações Recentes</h3>
        </div>

        <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#0275d8', color: 'white' }}>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.95rem' }}>Data</th>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.95rem' }}>Descrição</th>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.95rem' }}>Categoria</th>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.95rem' }}>Tipo</th>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.95rem', textAlign: 'right' }}>Valor</th>
              </tr>
            </thead>
            <tbody>
              {movimentacoes.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', background: 'white', fontSize: '0.95rem' }}>
                    Nenhuma movimentação no período.
                  </td>
                </tr>
              ) : (
                movimentacoes.map(m => (
                  <tr key={m.id} style={{ borderBottom: '1px solid var(--border-color)', background: 'white' }}>
                    <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{m.data}</td>
                    <td style={{ padding: '16px', color: 'var(--text-dark)', fontSize: '0.9rem', fontWeight: 500 }}>{m.descricao}</td>
                    <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{m.categoria}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ 
                        background: m.tipo === 'Entrada' ? '#dcfce7' : '#fee2e2', 
                        color: m.tipo === 'Entrada' ? '#16a34a' : '#e11d48', 
                        fontSize: '0.75rem', fontWeight: 700, padding: '4px 8px', borderRadius: '4px' 
                      }}>
                        {m.tipo}
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: m.tipo === 'Entrada' ? '#16a34a' : '#e11d48', fontSize: '0.9rem', fontWeight: 600, textAlign: 'right' }}>
                      {m.tipo === 'Entrada' ? '+' : '-'}{formatCurrency(m.valor)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
