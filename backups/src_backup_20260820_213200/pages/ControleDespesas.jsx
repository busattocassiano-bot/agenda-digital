import React, { useState } from 'react';
import { Filter, Calendar as CalendarIcon, List, Plus, Loader2, X, Check, ChevronDown, CheckCircle2, Trash2 } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';

export default function ControleDespesas() {
  const { despesas, addDespesa, updateDespesa, deleteDespesa } = useAppData();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalBaixaOpen, setModalBaixaOpen] = useState(false);
  
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState(new Date().toLocaleDateString('pt-BR'));
  
  const [selectedId, setSelectedId] = useState(null);
  const [dataPagamento, setDataPagamento] = useState(new Date().toLocaleDateString('pt-BR'));

  const handleSave = () => {
    if (descricao && valor) {
      addDespesa({
        descricao,
        valor,
        dataVencimento: data,
        status: 'A PAGAR',
        dataPagamento: ''
      });
      setModalOpen(false);
      setDescricao('');
      setValor('');
    }
  };

  const handleOpenBaixa = (d) => {
    setSelectedId(d.id);
    setDataPagamento(new Date().toLocaleDateString('pt-BR'));
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

  const totalPeriodo = despesas.reduce((acc, curr) => acc + parseCurrency(curr.valor), 0);

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
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginLeft: '16px', color: '#cbd5e1', fontWeight: 600, fontSize: '0.9rem' }}>
            <span style={{ cursor: 'pointer' }}>7 dias</span>
            <span style={{ cursor: 'pointer' }}>30 dias</span>
            <span style={{ cursor: 'pointer' }}>90 dias</span>
            <span style={{ cursor: 'pointer' }}>6 meses</span>
            <span style={{ cursor: 'pointer' }}>12 meses</span>
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
               <input type="checkbox" id="mostrar_comissoes" style={{ width: '16px', height: '16px', accentColor: 'var(--primary-color)' }} />
               <label htmlFor="mostrar_comissoes" style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer' }}>Mostrar comissões</label>
            </div>
            <button 
              onClick={() => setModalOpen(true)}
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
              {despesas.length === 0 ? (
                <tr style={{ background: 'white' }}>
                  <td colSpan="6" style={{ padding: '16px', color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem' }}>
                    Nenhuma despesa cadastrada.
                  </td>
                </tr>
              ) : (
                despesas.map(d => (
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
                    <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{d.dataVencimento}</td>
                    <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{d.dataPagamento || '-'}</td>
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
                Nova despesa
              </h2>
              <button 
                onClick={() => setModalOpen(false)}
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
                   <input type="text" defaultValue="01/07/2026" style={{ flex: 1, border: 'none', padding: '10px 16px', outline: 'none', color: 'var(--text-main)', fontSize: '0.95rem' }} />
                   <div style={{ background: '#f8fafc', padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', borderLeft: '1px solid var(--border-color)' }}>
                     <CalendarIcon size={18} />
                   </div>
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

              {/* Categoria */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>Categoria</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-dark)', cursor: 'pointer', marginBottom: '8px' }}>
                  <input 
                    type="checkbox" 
                    checked={isNovaCategoria}
                    onChange={(e) => setIsNovaCategoria(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#1d4ed8' }} 
                  />
                  Nova categoria
                </label>
                
                {isNovaCategoria ? (
                  <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', background: 'white' }}>
                    <input 
                      type="text" 
                      style={{ flex: 1, border: 'none', padding: '10px 12px', outline: 'none', color: 'var(--text-main)', fontSize: '0.95rem' }} 
                    />
                    <button style={{ background: 'transparent', border: 'none', padding: '0 12px', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                      <X size={16} strokeWidth={3} />
                    </button>
                  </div>
                ) : (
                  <div style={{ position: 'relative' }}>
                    <select style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', color: 'var(--text-main)', fontSize: '0.95rem', background: 'white', appearance: 'none' }}>
                      <option></option>
                    </select>
                    <ChevronDown size={16} color="var(--text-muted)" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  </div>
                )}
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
                onClick={() => setModalOpen(false)}
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
                  type="text" 
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

    </div>
  );
}
