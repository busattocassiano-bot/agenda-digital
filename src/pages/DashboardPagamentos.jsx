import React, { useState, useMemo } from 'react';
import { Filter, Search, Clock, CheckCircle2, AlertTriangle, FileText, Calendar as CalendarIcon, DollarSign } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';

export default function DashboardPagamentos() {
  const { recebimentos } = useAppData();

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

  const stats = useMemo(() => {
    let aguardandoQtd = 0;
    let aguardandoValor = 0;
    let recebidosQtd = 0;
    let recebidosValor = 0;
    let vencidosQtd = 0;
    let vencidosValor = 0;

    const today = new Date().toISOString().split('T')[0];

    recebimentos.forEach(r => {
      // Filtrar por data (usando dataPagamento se pago, senão dataVencimento)
      let rData = r.status === 'PAGO' ? (r.dataPagamento || r.dataVencimento) : r.dataVencimento;
      
      // Convert DD/MM/YYYY to YYYY-MM-DD for comparison if needed
      if (rData && rData.includes('/')) {
        rData = rData.split('/').reverse().join('-');
      }

      if (rData) {
        if (dataInicio && rData < dataInicio) return;
        if (dataFim && rData > dataFim) return;
      }

      const valor = parseCurrency(r.status === 'PAGO' ? (r.valorPago || r.valor) : r.valor);

      if (r.status === 'PAGO') {
        recebidosQtd++;
        recebidosValor += valor;
      } else {
        // Verifica se está vencido comparando com a data de hoje
        if (rData && rData < today) {
          vencidosQtd++;
          vencidosValor += valor;
        } else {
          aguardandoQtd++;
          aguardandoValor += valor;
        }
      }
    });

    const totalQtd = aguardandoQtd + recebidosQtd + vencidosQtd;
    const totalValor = aguardandoValor + recebidosValor + vencidosValor;

    const calcPercent = (val) => totalValor > 0 ? ((val / totalValor) * 100).toFixed(0) : 0;

    return {
      aguardandoQtd, aguardandoValor, aguardandoPct: calcPercent(aguardandoValor),
      recebidosQtd, recebidosValor, recebidosPct: calcPercent(recebidosValor),
      vencidosQtd, vencidosValor, vencidosPct: calcPercent(vencidosValor),
      totalQtd, totalValor
    };
  }, [recebimentos, dataInicio, dataFim]);

  const formatCurrency = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--text-dark)', marginBottom: '8px' }}>Dashboard de Pagamentos</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 500 }}>Controle de Mensalidades e Recebimentos</p>
      </div>

      {/* Filter Card */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Filter size={20} color="var(--text-dark)" />
          <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-dark)' }}>Filtro de Período</h3>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Data início</label>
            <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', background: 'white' }}>
               <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} style={{ width: '140px', border: 'none', padding: '10px 16px', outline: 'none', color: 'var(--text-main)', fontWeight: 600 }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Data fim</label>
            <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', background: 'white' }}>
               <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} style={{ width: '140px', border: 'none', padding: '10px 16px', outline: 'none', color: 'var(--text-main)', fontWeight: 600 }} />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginLeft: '16px', color: '#cbd5e1', fontWeight: 600, fontSize: '0.9rem' }}>
            <span style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => {
              const hoje = new Date();
              const seteDiasAtras = new Date(hoje);
              seteDiasAtras.setDate(hoje.getDate() - 7);
              setDataInicio(seteDiasAtras.toISOString().split('T')[0]);
              setDataFim(hoje.toISOString().split('T')[0]);
            }}>7 dias</span>
            <span style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => {
              const hoje = new Date();
              const trintaDiasAtras = new Date(hoje);
              trintaDiasAtras.setDate(hoje.getDate() - 30);
              setDataInicio(trintaDiasAtras.toISOString().split('T')[0]);
              setDataFim(hoje.toISOString().split('T')[0]);
            }}>30 dias</span>
            <span style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => {
              const hoje = new Date();
              const noventaDiasAtras = new Date(hoje);
              noventaDiasAtras.setDate(hoje.getDate() - 90);
              setDataInicio(noventaDiasAtras.toISOString().split('T')[0]);
              setDataFim(hoje.toISOString().split('T')[0]);
            }}>90 dias</span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
        {/* Aguardando Pagamento */}
        <div className="card" style={{ padding: '32px 24px', display: 'flex', gap: '24px', alignItems: 'center' }}>
          <div style={{ background: '#fef3c7', color: '#d97706', padding: '16px', borderRadius: '12px', display: 'flex' }}>
            <Clock size={32} />
          </div>
          <div>
            <p style={{ color: 'var(--text-dark)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>AGUARDANDO PAGAMENTO</p>
            <p style={{ color: '#d97706', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px' }}>{stats.aguardandoQtd} planos</p>
            <h2 style={{ fontSize: '1.8rem', margin: 0, color: 'var(--text-dark)' }}>{formatCurrency(stats.aguardandoValor)}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>Valor total aguardando</p>
          </div>
        </div>
        
        {/* Recebidos */}
        <div className="card" style={{ padding: '32px 24px', display: 'flex', gap: '24px', alignItems: 'center' }}>
          <div style={{ background: '#dcfce7', color: '#16a34a', padding: '16px', borderRadius: '12px', display: 'flex' }}>
            <CheckCircle2 size={32} />
          </div>
          <div>
            <p style={{ color: 'var(--text-dark)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>RECEBIDOS</p>
            <p style={{ color: '#16a34a', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px' }}>{stats.recebidosQtd} planos</p>
            <h2 style={{ fontSize: '1.8rem', margin: 0, color: 'var(--text-dark)' }}>{formatCurrency(stats.recebidosValor)}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>Valor total recebido</p>
          </div>
        </div>

        {/* Vencidos */}
        <div className="card" style={{ padding: '32px 24px', display: 'flex', gap: '24px', alignItems: 'center' }}>
          <div style={{ background: '#fee2e2', color: '#ef4444', padding: '16px', borderRadius: '12px', display: 'flex' }}>
            <AlertTriangle size={32} />
          </div>
          <div>
            <p style={{ color: 'var(--text-dark)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>VENCIDOS</p>
            <p style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px' }}>{stats.vencidosQtd} planos</p>
            <h2 style={{ fontSize: '1.8rem', margin: 0, color: 'var(--text-dark)' }}>{formatCurrency(stats.vencidosValor)}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>Valor total em atraso</p>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <FileText size={24} color="var(--text-dark)" />
          <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-dark)' }}>Resumo de Valores Totais</h3>
        </div>

        <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#0275d8', color: 'white' }}>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.95rem' }}>Status</th>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.95rem', textAlign: 'center' }}>Quantidade de Planos</th>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.95rem' }}>Valor Total</th>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.95rem', textAlign: 'right' }}>Percentual</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'white' }}>
                <td style={{ padding: '16px', color: 'var(--text-dark)', fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={16} color="#d97706" /> Aguardando Pagamento
                </td>
                <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.95rem', textAlign: 'center' }}>{stats.aguardandoQtd}</td>
                <td style={{ padding: '16px', color: '#d97706', fontWeight: 600, fontSize: '0.95rem' }}>{formatCurrency(stats.aguardandoValor)}</td>
                <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.95rem', textAlign: 'right' }}>{stats.aguardandoPct}%</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'white' }}>
                <td style={{ padding: '16px', color: 'var(--text-dark)', fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="#16a34a" /> Recebidos
                </td>
                <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.95rem', textAlign: 'center' }}>{stats.recebidosQtd}</td>
                <td style={{ padding: '16px', color: '#16a34a', fontWeight: 600, fontSize: '0.95rem' }}>{formatCurrency(stats.recebidosValor)}</td>
                <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.95rem', textAlign: 'right' }}>{stats.recebidosPct}%</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'white' }}>
                <td style={{ padding: '16px', color: 'var(--text-dark)', fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={16} color="#ef4444" /> Vencidos
                </td>
                <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.95rem', textAlign: 'center' }}>{stats.vencidosQtd}</td>
                <td style={{ padding: '16px', color: '#ef4444', fontWeight: 600, fontSize: '0.95rem' }}>{formatCurrency(stats.vencidosValor)}</td>
                <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.95rem', textAlign: 'right' }}>{stats.vencidosPct}%</td>
              </tr>
            </tbody>
            <tfoot>
              <tr style={{ background: '#f1f5f9' }}>
                <td style={{ padding: '16px', color: '#db2777', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <DollarSign size={16} color="#db2777" /> TOTAL GERAL
                </td>
                <td style={{ padding: '16px', color: '#db2777', fontWeight: 700, fontSize: '0.95rem', textAlign: 'center' }}>{stats.totalQtd}</td>
                <td style={{ padding: '16px', color: '#db2777', fontWeight: 700, fontSize: '0.95rem' }}>{formatCurrency(stats.totalValor)}</td>
                <td style={{ padding: '16px', color: '#db2777', fontWeight: 700, fontSize: '0.95rem', textAlign: 'right' }}>100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  );
}
