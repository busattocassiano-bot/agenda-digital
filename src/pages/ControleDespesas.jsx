import React, { useState } from 'react';
import { Filter, Calendar as CalendarIcon, List, Plus, Loader2, X, Check, ChevronDown, CheckCircle2, Trash2, Pencil } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';

export default function ControleDespesas() {
  const { despesas, addDespesa, updateDespesa, deleteDespesa } = useAppData();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalBaixaOpen, setModalBaixaOpen] = useState(false);
  const [modalFuturasOpen, setModalFuturasOpen] = useState(false);
  
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  
  const [selectedId, setSelectedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [dataPagamento, setDataPagamento] = useState(new Date().toISOString().split('T')[0]);

  const curr = new Date();
  const firstDay = new Date(curr.getFullYear(), curr.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(curr.getFullYear(), curr.getMonth() + 1, 0).toISOString().split('T')[0];

  const [filtroDataInicio, setFiltroDataInicio] = useState(firstDay);
  const [filtroDataFinal, setFiltroDataFinal] = useState(lastDay);

  const [isRecorrente, setIsRecorrente] = useState(false);
  const [mostrarComissoes, setMostrarComissoes] = useState(false);
  const [selectedFutureMonth, setSelectedFutureMonth] = useState(null);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const handleSave = () => {
    if (descricao && valor) {
      if (editingId) {
        updateDespesa(editingId, {
          descricao,
          valor,
          dataVencimento: data
        });
      } else {
        if (isRecorrente) {
          const parts = data.split('-');
          let dt = new Date(parts[0], parts[1] - 1, parts[2]);
          for (let i = 0; i < 12; i++) {
             let dataVenc = new Date(dt.getTime() - (dt.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
             addDespesa({
                descricao,
                valor,
                dataVencimento: dataVenc,
                status: 'A PAGAR',
                dataPagamento: '',
                isRecorrente: true
             });
             dt.setMonth(dt.getMonth() + 1);
          }
        } else {
          addDespesa({
            descricao,
            valor,
            dataVencimento: data,
            status: 'A PAGAR',
            dataPagamento: ''
          });
        }
      }
      setModalOpen(false);
      setEditingId(null);
      setDescricao('');
      setValor('');
      setIsRecorrente(false);
    }
  };

  const handleOpenEdit = (d) => {
    setEditingId(d.id);
    setDescricao(d.descricao);
    setValor(d.valor);
    if (d.dataVencimento && d.dataVencimento.includes('-')) {
      setData(d.dataVencimento);
    }
    setModalOpen(true);
  };

  const handleOpenBaixa = (d) => {
    setSelectedId(d.id);
    setDataPagamento(new Date().toISOString().split('T')[0]);
    setModalBaixaOpen(true);
  };

  const handleConfirmarBaixa = () => {
    if (selectedId) {
      updateDespesa(selectedId, {
        status: 'PAGO',
        dataPagamento
      });
      setModalBaixaOpen(false);
    }
  };

  const parseCurrency = (val) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    const str = val.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
    return parseFloat(str) || 0;
  };

  const formatCurrency = (val) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const filteredDespesas = despesas.filter(d => {
    let refDateStr = d.dataVencimento || d.dataPagamento;
    if (!refDateStr && (filtroDataInicio || filtroDataFinal)) return false;

    if (refDateStr && (filtroDataInicio || filtroDataFinal)) {
      let refDate = null;
      if (refDateStr.includes('/')) {
        const parts = refDateStr.split('/');
        if (parts.length === 3) refDate = new Date(parts[2], parts[1] - 1, parts[0]);
      } else if (refDateStr.includes('-')) {
        const parts = refDateStr.split('-');
        if (parts.length === 3) refDate = new Date(parts[0], parts[1] - 1, parts[2]);
      }

      if (refDate) {
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
      }
    }
    return true;
  }).sort((a, b) => {
    const dateA = a.dataVencimento || a.dataPagamento || '';
    const dateB = b.dataVencimento || b.dataPagamento || '';
    return dateA.localeCompare(dateB);
  });

  const totalPeriodo = filteredDespesas.reduce((acc, curr) => acc + parseCurrency(curr.valor), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--text-dark)', marginBottom: '8px' }}>Controle de despesas</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 500 }}>Gestão de gastos e lucratividade</p>
      </div>

      {/* Filter Card */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Filter size={20} color="var(--text-dark)" />
          <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-dark)' }}>Filtro de período</h3>
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
            <div style={{ marginLeft: '16px' }}>
              <button 
                style={{ 
                  background: 'var(--primary-color)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  padding: '10px 24px', 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  fontSize: '0.95rem'
                }}
              >
                Buscar período
              </button>
            </div>
        </div>
      </div>

      {/* List Card */}
      <div className="card" style={{ padding: '24px' }}>
        <div className="flex-between" style={{ marginBottom: '32px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <List size={24} color="var(--text-dark)" />
                <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-dark)' }}>Lista de despesas</h3>
             </div>
             
             <div style={{ background: '#fdf2f8', padding: '8px 16px', borderRadius: '8px', border: '1px solid #fbcfe8' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, display: 'block' }}>TOTAL DO PERÍODO</span>
                <span style={{ color: '#e11d48', fontSize: '1rem', fontWeight: 700, display: 'block' }}>{formatCurrency(totalPeriodo)}</span>
             </div>
          </div>
          
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
               <input 
                 type="checkbox" 
                 id="mostrar_comissoes" 
                 checked={mostrarComissoes}
                 onChange={(e) => setMostrarComissoes(e.target.checked)}
                 style={{ width: '16px', height: '16px', accentColor: 'var(--primary-color)' }} 
               />
               <label htmlFor="mostrar_comissoes" style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer' }}>Mostrar comissões</label>
            </div>
            <button 
              onClick={() => setModalFuturasOpen(true)}
              style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px 16px', fontWeight: 600, cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}
            >
              <List size={18} /> Despesas futuras
            </button>
            <button 
              onClick={() => {
                setEditingId(null);
                setDescricao('');
                setValor('');
                setData(new Date().toISOString().split('T')[0]);
                setModalOpen(true);
              }}
              style={{ background: '#e11d48', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: 600, cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}
            >
              <Plus size={18} /> Nova despesa
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead>
              <tr style={{ background: '#e11d48', color: 'white' }}>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.9rem' }}>Status</th>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.9rem' }}>Descrição</th>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.9rem' }}>Vencimento</th>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.9rem' }}>Pagamento</th>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.9rem' }}>Valor</th>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.9rem', textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredDespesas.length === 0 ? (
                <tr style={{ background: 'white' }}>
                  <td colSpan="6" style={{ padding: '16px', color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem' }}>
                    Nenhuma despesa encontrada para o período.
                  </td>
                </tr>
              ) : (
                filteredDespesas.map(d => (
                  <tr key={d.id} style={{ borderBottom: '1px solid var(--border-color)', background: 'white' }}>
                    <td style={{ padding: '16px' }}>
                      <span style={{ 
                        background: d.status === 'PAGO' ? '#dcfce7' : '#f8fafc', 
                        border: `1px solid ${d.status === 'PAGO' ? '#16a34a' : '#e2e8f0'}`, 
                        color: d.status === 'PAGO' ? '#16a34a' : '#64748b', 
                        fontSize: '0.7rem', fontWeight: 700, padding: '4px 8px', borderRadius: '4px', letterSpacing: '0.5px' 
                      }}>
                        {d.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-dark)', fontSize: '0.9rem', fontWeight: 500 }}>{d.descricao}</td>
                    <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{formatDate(d.dataVencimento)}</td>
                    <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{formatDate(d.dataPagamento)}</td>
                    <td style={{ padding: '16px', color: 'var(--text-dark)', fontSize: '0.9rem', fontWeight: 600 }}>{d.valor}</td>
                    <td style={{ padding: '16px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      {d.status !== 'PAGO' && (
                        <button 
                          onClick={() => handleOpenBaixa(d)}
                          style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <CheckCircle2 size={14} /> Pagar
                        </button>
                      )}
                      <button onClick={() => handleOpenEdit(d)} style={{ background: '#f1f5f9', border: 'none', padding: '8px', borderRadius: '6px', color: '#64748b', cursor: 'pointer' }} title="Editar"><Pencil size={16} /></button>
                      <button onClick={() => deleteDespesa(d.id)} style={{ background: '#fef2f2', border: 'none', padding: '8px', borderRadius: '6px', color: '#ef4444', cursor: 'pointer' }} title="Excluir"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>


      {/* Modal Nova Despesa */}
      {modalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', width: '500px', maxWidth: '95%', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            
            {/* Header */}
            <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b', fontWeight: 700 }}>
                {editingId ? 'Editar despesa' : 'Nova despesa'}
              </h2>
              <button 
                onClick={() => {
                  setModalOpen(false);
                  setEditingId(null);
                  setDescricao('');
                  setValor('');
                }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '0 24px 24px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Data */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>Data</label>
                  <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', background: 'white' }}>
                    <input type="date" value={data} onChange={(e) => setData(e.target.value)} style={{ flex: 1, border: 'none', padding: '10px 16px', outline: 'none', color: 'var(--text-main)', fontSize: '0.95rem' }} />
                  </div>
                </div>

              {/* Descrição */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>Descrição</label>
                <input 
                  type="text" 
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Ex: Energia elétrica, Aluguel..."
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', color: 'var(--text-main)', fontSize: '0.95rem' }} 
                />
              </div>

              {/* Valor */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>Valor (R$)</label>
                <input 
                  type="text" 
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  placeholder="Ex: 150,00"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', color: 'var(--text-main)', fontSize: '0.95rem' }} 
                />
              </div>

              {/* Recorrente */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-dark)', cursor: 'pointer', marginBottom: isRecorrente ? '16px' : '0' }}>
                  <input 
                    type="checkbox" 
                    checked={isRecorrente}
                    onChange={(e) => setIsRecorrente(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#1d4ed8' }} 
                  />
                  Recorrente
                </label>

                {isRecorrente && (
                  <div style={{ paddingLeft: '16px', borderLeft: '2px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>Periodicidade</label>
                      <div style={{ position: 'relative' }}>
                        <select style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', color: 'var(--text-main)', fontSize: '0.95rem', background: 'white', appearance: 'none' }}>
                          <option>Mensal</option>
                        </select>
                        <ChevronDown size={16} color="var(--text-muted)" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      </div>
                    </div>
                    
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-dark)', cursor: 'pointer' }}>
                      <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: '#1d4ed8' }} />
                      Infinito (geração mês a mês)
                    </label>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>Número de ocorrências</label>
                      <input 
                        type="text" 
                        defaultValue="12"
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', color: 'var(--text-main)', fontSize: '0.95rem' }} 
                      />
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Footer */}
            <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
              <button 
                onClick={() => {
                  setModalOpen(false);
                  setEditingId(null);
                  setDescricao('');
                  setValor('');
                }}
                style={{ background: 'transparent', color: '#64748b', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f43f5e', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 24px', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}
              >
                <Check size={18} /> Salvar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal Confirmar Pagamento Despesa */}
      {modalBaixaOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', width: '400px', maxWidth: '95%', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', background: '#f8fafc' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-dark)' }}>Pagar Despesa</h2>
              <button onClick={() => setModalBaixaOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Data do Pagamento</label>
                <input 
                  type="date" 
                  value={dataPagamento} 
                  onChange={(e) => setDataPagamento(e.target.value)} 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', color: 'var(--text-main)' }} 
                />
              </div>

            </div>
            <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border-color)', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setModalBaixaOpen(false)} style={{ padding: '10px 16px', background: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-dark)', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleConfirmarBaixa} style={{ padding: '10px 16px', background: '#10b981', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Confirmar Pagamento</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Despesas Futuras */}
      {modalFuturasOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', width: '800px', maxWidth: '95%', maxHeight: '90vh', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            
            <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', background: '#f8fafc' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                {selectedFutureMonth && (
                  <button onClick={() => setSelectedFutureMonth(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: '4px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                  </button>
                )}
                Despesas Futuras Recorrentes {selectedFutureMonth ? `- ${selectedFutureMonth.split('-')[1]}/${selectedFutureMonth.split('-')[0]}` : ''}
              </h2>
              <button onClick={() => { setModalFuturasOpen(false); setSelectedFutureMonth(null); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto', background: '#f1f5f9', flex: 1 }}>
              {(() => {
                const futureExpenses = despesas.filter(d => d.isRecorrente && d.status === 'A PAGAR' && d.dataVencimento && d.dataVencimento >= new Date().toISOString().split('T')[0]);
                
                if (!selectedFutureMonth) {
                  // Agrupar por mes
                  const grouped = futureExpenses.reduce((acc, d) => {
                    const monthKey = d.dataVencimento.substring(0, 7);
                    if (!acc[monthKey]) acc[monthKey] = { total: 0, count: 0 };
                    acc[monthKey].total += parseCurrency(d.valor);
                    acc[monthKey].count += 1;
                    return acc;
                  }, {});
                  
                  const sortedKeys = Object.keys(grouped).sort();
                  
                  if (sortedKeys.length === 0) {
                    return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', background: 'white', borderRadius: '8px' }}>Nenhuma despesa futura encontrada.</div>;
                  }

                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                      {sortedKeys.map(key => {
                        const [year, month] = key.split('-');
                        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
                        const monthName = `${monthNames[parseInt(month, 10) - 1]} / ${year}`;
                        
                        return (
                          <div 
                            key={key} 
                            onClick={() => setSelectedFutureMonth(key)}
                            style={{ background: 'white', borderRadius: '12px', padding: '20px', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', transition: 'transform 0.1s' }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          >
                            <CalendarIcon size={24} color="#3b82f6" style={{ marginBottom: '4px' }} />
                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-dark)' }}>{monthName}</h3>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{grouped[key].count} contas previstas</span>
                            <div style={{ marginTop: '8px', background: '#fee2e2', color: '#e11d48', padding: '6px 12px', borderRadius: '16px', fontWeight: 700, fontSize: '1.1rem' }}>
                              {formatCurrency(grouped[key].total)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                } else {
                  // Mostrar detalhes do mes selecionado
                  const monthExpenses = futureExpenses.filter(d => d.dataVencimento.startsWith(selectedFutureMonth)).sort((a, b) => a.dataVencimento.localeCompare(b.dataVencimento));
                  
                  return (
                    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.85rem' }}>Vencimento</th>
                            <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.85rem' }}>Descrição</th>
                            <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.85rem', textAlign: 'right' }}>Valor</th>
                            <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.85rem', textAlign: 'center' }}>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {monthExpenses.map(d => (
                            <tr key={d.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                              <td style={{ padding: '16px', color: 'var(--text-dark)', fontWeight: 500 }}>{formatDate(d.dataVencimento)}</td>
                              <td style={{ padding: '16px', color: 'var(--text-main)' }}>{d.descricao}</td>
                              <td style={{ padding: '16px', color: '#e11d48', fontWeight: 600, textAlign: 'right' }}>{formatCurrency(parseCurrency(d.valor))}</td>
                              <td style={{ padding: '16px', textAlign: 'center' }}>
                                <button onClick={() => { setModalFuturasOpen(false); handleOpenEdit(d); }} style={{ background: '#f1f5f9', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', color: '#3b82f6', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                                   <Pencil size={14} /> Editar
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                }
              })()}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
