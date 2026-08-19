import React from 'react';
import { Filter, Search, Clock, CheckCircle2, AlertTriangle, FileText, Calendar as CalendarIcon, DollarSign } from 'lucide-react';

export default function DashboardPagamentos() {
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
               <input type="text" defaultValue="01/07/2026" style={{ width: '120px', border: 'none', padding: '10px 16px', outline: 'none', color: 'var(--text-main)', fontWeight: 600 }} />
               <div style={{ background: '#f1f5f9', padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', borderLeft: '1px solid var(--border-color)' }}>
                 <CalendarIcon size={18} />
               </div>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Data fim</label>
            <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', background: 'white' }}>
               <input type="text" defaultValue="31/07/2026" style={{ width: '120px', border: 'none', padding: '10px 16px', outline: 'none', color: 'var(--text-main)', fontWeight: 600 }} />
               <div style={{ background: '#f1f5f9', padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', borderLeft: '1px solid var(--border-color)' }}>
                 <CalendarIcon size={18} />
               </div>
            </div>
          </div>
          <div>
            <button style={{ background: '#0275d8', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: 600, cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center', height: '42px' }}>
              <Search size={18} /> Buscar
            </button>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginLeft: '16px', color: '#cbd5e1', fontWeight: 600, fontSize: '0.9rem' }}>
            <span style={{ cursor: 'pointer' }}>7 dias</span>
            <span style={{ cursor: 'pointer' }}>30 dias</span>
            <span style={{ cursor: 'pointer' }}>90 dias</span>
            <span style={{ cursor: 'pointer' }}>6 meses</span>
            <span style={{ cursor: 'pointer' }}>12 meses</span>
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
            <p style={{ color: '#d97706', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px' }}>0 planos</p>
            <h2 style={{ fontSize: '1.8rem', margin: 0, color: 'var(--text-dark)' }}>R$ 0,00</h2>
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
            <p style={{ color: '#16a34a', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px' }}>0 planos</p>
            <h2 style={{ fontSize: '1.8rem', margin: 0, color: 'var(--text-dark)' }}>R$ 0,00</h2>
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
            <p style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px' }}>0 planos</p>
            <h2 style={{ fontSize: '1.8rem', margin: 0, color: 'var(--text-dark)' }}>R$ 0,00</h2>
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
                <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.95rem', textAlign: 'center' }}>0</td>
                <td style={{ padding: '16px', color: '#d97706', fontWeight: 600, fontSize: '0.95rem' }}>R$ 0,00</td>
                <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.95rem', textAlign: 'right' }}>0%</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'white' }}>
                <td style={{ padding: '16px', color: 'var(--text-dark)', fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="#16a34a" /> Recebidos
                </td>
                <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.95rem', textAlign: 'center' }}>0</td>
                <td style={{ padding: '16px', color: '#16a34a', fontWeight: 600, fontSize: '0.95rem' }}>R$ 0,00</td>
                <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.95rem', textAlign: 'right' }}>0%</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'white' }}>
                <td style={{ padding: '16px', color: 'var(--text-dark)', fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={16} color="#ef4444" /> Vencidos
                </td>
                <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.95rem', textAlign: 'center' }}>0</td>
                <td style={{ padding: '16px', color: '#ef4444', fontWeight: 600, fontSize: '0.95rem' }}>R$ 0,00</td>
                <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.95rem', textAlign: 'right' }}>0%</td>
              </tr>
            </tbody>
            <tfoot>
              <tr style={{ background: '#f1f5f9' }}>
                <td style={{ padding: '16px', color: '#db2777', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <DollarSign size={16} color="#db2777" /> TOTAL GERAL
                </td>
                <td style={{ padding: '16px', color: '#db2777', fontWeight: 700, fontSize: '0.95rem', textAlign: 'center' }}>0</td>
                <td style={{ padding: '16px', color: '#db2777', fontWeight: 700, fontSize: '0.95rem' }}>R$ 0,00</td>
                <td style={{ padding: '16px', color: '#db2777', fontWeight: 700, fontSize: '0.95rem', textAlign: 'right' }}>100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  );
}
