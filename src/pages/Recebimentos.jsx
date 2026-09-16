import React, { useState } from 'react';
import { FileSpreadsheet, RefreshCw, Calendar as CalendarIcon, ChevronDown, Plus, CheckCircle2, X, Trash2, Edit } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';

export default function Recebimentos() {
  const { recebimentos, updateRecebimento, addRecebimento, servicos, planos, deleteRecebimento } = useAppData();
  
  const [modalBaixaOpen, setModalBaixaOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [tipoPagamento, setTipoPagamento] = useState('PIX');
  const [dataPagamento, setDataPagamento] = useState(new Date().toISOString().split('T')[0]);
  const [valorPago, setValorPago] = useState('');

  const [modalAvulsoOpen, setModalAvulsoOpen] = useState(false);
  const [avulsoNome, setAvulsoNome] = useState('');
  const [avulsoValor, setAvulsoValor] = useState('');
  const [avulsoData, setAvulsoData] = useState(new Date().toISOString().split('T')[0]);

  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [editNome, setEditNome] = useState('');
  const [editValor, setEditValor] = useState('');
  const [editData, setEditData] = useState('');
  const [editStatus, setEditStatus] = useState('A VENCER');

  const handleOpenEdit = (r) => {
    setSelectedId(r.id);
    setEditNome(r.nomePaciente || '');
    setEditValor(r.valor || '');
    
    let dateStr = r.dataVencimento || '';
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) dateStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    setEditData(dateStr);
    setEditStatus(r.status || 'A VENCER');
    setModalEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (selectedId) {
      updateRecebimento(selectedId, {
        nomePaciente: editNome,
        valor: editValor,
        dataVencimento: editData,
        status: editStatus
      });
      setModalEditOpen(false);
    }
  };

  const handleSaveAvulso = () => {
    if (avulsoNome && avulsoValor) {
      addRecebimento({
        pacienteId: null,
        nomePaciente: avulsoNome,
        modalidade: 'Avulso',
        plano: '-',
        valor: avulsoValor,
        valorPago: 0,
        status: 'A VENCER',
        dataVencimento: avulsoData,
        tipoPagamento: '',
        dataPagamento: ''
      });
      setModalAvulsoOpen(false);
      setAvulsoNome('');
      setAvulsoValor('');
    }
  };

  const handleOpenBaixa = (r) => {
    setSelectedId(r.id);
    setTipoPagamento(r.tipoPagamento || 'PIX');
    setDataPagamento(new Date().toLocaleDateString('pt-BR'));
    setValorPago(r.valor);
    setModalBaixaOpen(true);
  };

  const handleConfirmarBaixa = () => {
    if (selectedId) {
      updateRecebimento(selectedId, {
        status: 'PAGO',
        tipoPagamento,
        dataPagamento,
        valorPago
      });

      // Lógica de recorrência
      const r = recebimentos.find(rec => rec.id === selectedId);
      if (r && r.plano && r.plano !== '-' && r.plano.toLowerCase() !== 'avulsa' && r.plano.toLowerCase() !== 'avulso') {
        // Gerar o próximo mês automaticamente
        let nextVencimento = '';
        if (r.dataVencimento) {
           const parts = r.dataVencimento.split(r.dataVencimento.includes('-') ? '-' : '/');
           if (parts.length === 3) {
             let year = parseInt(r.dataVencimento.includes('-') ? parts[0] : parts[2], 10);
             let month = parseInt(parts[1], 10);
             let day = parseInt(r.dataVencimento.includes('-') ? parts[2] : parts[0], 10);
             
             month += 1;
             if (month > 12) {
               month = 1;
               year += 1;
             }
             
             const strDay = String(day).padStart(2, '0');
             const strMonth = String(month).padStart(2, '0');
             nextVencimento = r.dataVencimento.includes('-') ? `${year}-${strMonth}-${strDay}` : `${strDay}/${strMonth}/${year}`;
           }
        }

        addRecebimento({
          ...r,
          id: undefined, // ensure new ID
          status: 'A VENCER',
          tipoPagamento: '',
          dataPagamento: '',
          valorPago: 0,
          dataVencimento: nextVencimento || r.dataVencimento // fallback se der erro de parse
        });
      }

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

  const [filtroReferencia, setFiltroReferencia] = useState('Data Vencimento');
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFinal, setFiltroDataFinal] = useState('');
  const [filtroModalidade, setFiltroModalidade] = useState('Todas');
  const [filtroPlano, setFiltroPlano] = useState('Todos');

  const filteredRecebimentos = recebimentos.filter(r => {
    if (filtroStatus !== 'Todos' && r.status !== filtroStatus) return false;
    if (filtroModalidade !== 'Todas' && r.modalidade !== filtroModalidade) return false;
    if (filtroPlano !== 'Todos' && r.plano !== filtroPlano) return false;

    // Data parsing logic
    const refDateStr = filtroReferencia === 'Data Vencimento' ? r.dataVencimento : r.dataPagamento;
    if (!refDateStr && (filtroDataInicio || filtroDataFinal)) return false;

    if (refDateStr && (filtroDataInicio || filtroDataFinal)) {
      // Parse reference date
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
  });

  const totalAReceber = filteredRecebimentos.filter(r => r.status === 'A VENCER').reduce((acc, curr) => acc + parseCurrency(curr.valor), 0);
  const totalRecebido = filteredRecebimentos.filter(r => r.status === 'PAGO').reduce((acc, curr) => acc + parseCurrency(curr.valorPago || curr.valor), 0);
  const totalGeral = totalAReceber + totalRecebido;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Main Card */}
      <div className="card" style={{ padding: '24px' }}>
        
        {/* Header & Top Buttons */}
        <div className="flex-between" style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#1e293b' }}>Lista Mensalidades</h2>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{ background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <RefreshCw size={20} />
            </button>
          </div>
        </div>

        {/* Filters Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px', marginBottom: '16px' }}>
          
          {/* Referência */}
          <div style={{ gridColumn: 'span 1' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dark)', fontWeight: 600, fontSize: '0.85rem' }}>Referência</label>
            <div style={{ position: 'relative' }}>
              <select value={filtroReferencia} onChange={e => setFiltroReferencia(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', color: 'var(--text-main)', background: 'white', appearance: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>
                <option value="Data Vencimento">Data Vencimento</option>
                <option value="Data Pagamento">Data Pagamento</option>
              </select>
              <ChevronDown size={16} color="var(--text-muted)" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
          </div>

          {/* Status */}
          <div style={{ gridColumn: 'span 1' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dark)', fontWeight: 600, fontSize: '0.85rem' }}>Status</label>
            <div style={{ position: 'relative' }}>
              <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', color: 'var(--text-main)', background: 'white', appearance: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>
                <option value="Todos">Todos</option>
                <option value="PAGO">PAGO</option>
                <option value="A VENCER">A VENCER</option>
              </select>
              <ChevronDown size={16} color="var(--text-muted)" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
          </div>

          {/* Data início */}
          <div style={{ gridColumn: 'span 1' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dark)', fontWeight: 600, fontSize: '0.85rem' }}>Data início</label>
            <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
              <input type="date" value={filtroDataInicio} onChange={e => setFiltroDataInicio(e.target.value)} style={{ flex: 1, border: 'none', padding: '10px', outline: 'none', color: 'var(--text-main)', fontSize: '0.9rem', width: '100%', fontWeight: 500 }} />
            </div>
          </div>

          {/* Data final */}
          <div style={{ gridColumn: 'span 1' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dark)', fontWeight: 600, fontSize: '0.85rem' }}>Data final</label>
            <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
              <input type="date" value={filtroDataFinal} onChange={e => setFiltroDataFinal(e.target.value)} style={{ flex: 1, border: 'none', padding: '10px', outline: 'none', color: 'var(--text-main)', fontSize: '0.9rem', width: '100%', fontWeight: 500 }} />
            </div>
          </div>

          {/* Modalidade */}
          <div style={{ gridColumn: 'span 1' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dark)', fontWeight: 600, fontSize: '0.85rem' }}>Modalidade</label>
            <div style={{ position: 'relative' }}>
              <select value={filtroModalidade} onChange={e => setFiltroModalidade(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', color: 'var(--text-main)', background: 'white', appearance: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>
                <option value="Todas">Todas</option>
                {servicos && servicos.map(s => <option key={s.id} value={s.nome}>{s.nome}</option>)}
              </select>
              <ChevronDown size={16} color="var(--text-muted)" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
          </div>

          {/* Plano */}
          <div style={{ gridColumn: 'span 1' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dark)', fontWeight: 600, fontSize: '0.85rem' }}>Plano</label>
            <div style={{ position: 'relative' }}>
              <select value={filtroPlano} onChange={e => setFiltroPlano(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', color: 'var(--text-main)', background: 'white', appearance: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>
                <option value="Todos">Todos</option>
                {planos && planos.map(p => <option key={p.id} value={p.nome}>{p.nome}</option>)}
              </select>
              <ChevronDown size={16} color="var(--text-muted)" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
          </div>
        </div>

        {/* Buscar Button */}
        <div style={{ marginBottom: '24px' }}>
          <button style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 32px', fontWeight: 600, cursor: 'pointer' }}>
            Buscar
          </button>
        </div>

        {/* Informative Text */}
        <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '24px' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.6', margin: 0 }}>
            Para comparar o total <strong style={{color: '#64748b'}}>Recebido</strong> com a <strong style={{color: '#64748b'}}>Receita</strong> do Balanço financeiro (novo), use a referência <strong style={{color: '#64748b'}}>Data Pagamento</strong>, o mesmo intervalo de datas, e modalidade/plano em "Todas"/"Todos" — o balanço não aplica esses filtros. Com <strong style={{color: '#64748b'}}>Data Vencimento</strong>, os valores seguem o vencimento da parcela, não a data em que o pagamento entrou.
          </p>
        </div>

        {/* Financial Summary */}
        <div style={{ display: 'flex', gap: '80px', marginBottom: '16px' }}>
          <div style={{ paddingLeft: '12px', borderLeft: '3px solid #ef4444' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>A Receber</div>
            <div style={{ fontSize: '1.25rem', color: 'var(--text-dark)' }}>{formatCurrency(totalAReceber)}</div>
          </div>
          <div style={{ paddingLeft: '12px', borderLeft: '3px solid #22c55e' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>Recebido</div>
            <div style={{ fontSize: '1.25rem', color: 'var(--text-dark)' }}>{formatCurrency(totalRecebido)}</div>
          </div>
          <div style={{ paddingLeft: '12px', borderLeft: '3px solid #0ea5e9' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>Total</div>
            <div style={{ fontSize: '1.25rem', color: 'var(--text-dark)' }}>{formatCurrency(totalGeral)}</div>
          </div>
        </div>

        {/* Action Row */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <button 
            onClick={() => setModalAvulsoOpen(true)}
            style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 16px', fontWeight: 600, cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}
          >
            <Plus size={18} /> Adicionar valor avulso
          </button>
        </div>

        {/* Table */}
        <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1200px' }}>
            <thead>
              <tr style={{ background: '#0275d8', color: 'white' }}>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.9rem' }}>Status</th>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.9rem' }}>Cliente</th>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.9rem' }}>Vencimento</th>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.9rem' }}>Pagamento</th>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.9rem' }}>Tipo pagamento</th>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.9rem' }}>Valor</th>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.9rem' }}>Valor pago</th>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.9rem' }}>Descontos</th>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.9rem' }}>Juros</th>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.9rem' }}>Multa</th>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.9rem' }}>Modalidade</th>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.9rem' }}>Plano</th>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.9rem' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecebimentos.length === 0 ? (
                <tr style={{ background: 'white' }}>
                  <td colSpan="13" style={{ padding: '16px', color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem' }}>
                    Nenhum recebimento encontrado com os filtros atuais.
                  </td>
                </tr>
              ) : (
                filteredRecebimentos.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)', background: 'white' }}>
                    <td style={{ padding: '16px' }}>
                      <span style={{ 
                        background: r.status === 'PAGO' ? '#dcfce7' : '#f8fafc', 
                        border: `1px solid ${r.status === 'PAGO' ? '#16a34a' : '#e2e8f0'}`, 
                        color: r.status === 'PAGO' ? '#16a34a' : '#64748b', 
                        fontSize: '0.7rem', fontWeight: 700, padding: '4px 8px', borderRadius: '4px', letterSpacing: '0.5px' 
                      }}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-dark)', fontSize: '0.9rem' }}>{r.nomePaciente}</td>
                    <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{r.dataVencimento && r.dataVencimento.includes('-') ? r.dataVencimento.split('-').reverse().join('/') : r.dataVencimento}</td>
                    <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{r.dataPagamento && r.dataPagamento.includes('-') ? r.dataPagamento.split('-').reverse().join('/') : r.dataPagamento || '-'}</td>
                    <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{r.tipoPagamento || '-'}</td>
                    <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{r.valor}</td>
                    <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{r.valorPago || '-'}</td>
                    <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>R$ 0,00</td>
                    <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>R$ 0,00</td>
                    <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>R$ 0,00</td>
                    <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{r.modalidade}</td>
                    <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{r.plano}</td>
                    <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', gap: '8px' }}>
                      {r.status !== 'PAGO' && (
                        <button 
                          onClick={() => handleOpenBaixa(r)}
                          title="Dar Baixa"
                          style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <CheckCircle2 size={14} /> Dar Baixa
                        </button>
                      )}
                      <button 
                        onClick={() => handleOpenEdit(r)}
                        title="Editar"
                        style={{ background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      >
                        <Edit size={14} />
                      </button>
                      <button 
                        onClick={() => deleteRecebimento(r.id)} 
                        title="Excluir"
                        style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Modal de Baixa */}
      {modalBaixaOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', width: '500px', maxWidth: '95%', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', background: '#f8fafc' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-dark)' }}>Confirmar Pagamento</h2>
              <button onClick={() => setModalBaixaOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Valor Pago (R$)</label>
                <input 
                  type="text" 
                  value={valorPago} 
                  onChange={(e) => setValorPago(e.target.value)} 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', color: 'var(--text-main)' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Data do Pagamento</label>
                <input 
                  type="date" 
                  value={dataPagamento} 
                  onChange={(e) => setDataPagamento(e.target.value)} 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', color: 'var(--text-main)' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Forma de Pagamento</label>
                <select 
                  value={tipoPagamento} 
                  onChange={(e) => setTipoPagamento(e.target.value)} 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', color: 'var(--text-main)', background: 'white' }}
                >
                  <option value="PIX">PIX</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Cartão de Débito">Cartão de Débito</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Boleto">Boleto</option>
                </select>
              </div>

            </div>
            <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border-color)', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setModalBaixaOpen(false)} style={{ padding: '10px 16px', background: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-dark)', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleConfirmarBaixa} style={{ padding: '10px 16px', background: '#16a34a', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Confirmar Recebimento</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {modalEditOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', width: '500px', maxWidth: '95%', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', background: '#f8fafc' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-dark)' }}>Editar Recebimento</h2>
              <button onClick={() => setModalEditOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Cliente / Descrição</label>
                <input 
                  type="text" 
                  value={editNome} 
                  onChange={(e) => setEditNome(e.target.value)} 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', color: 'var(--text-main)' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Valor (R$)</label>
                <input 
                  type="text" 
                  value={editValor} 
                  onChange={(e) => setEditValor(e.target.value)} 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', color: 'var(--text-main)' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Data do Vencimento</label>
                <input 
                  type="date" 
                  value={editData} 
                  onChange={(e) => setEditData(e.target.value)} 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', color: 'var(--text-main)' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Status</label>
                <select 
                  value={editStatus} 
                  onChange={(e) => setEditStatus(e.target.value)} 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', color: 'var(--text-main)', background: 'white' }}
                >
                  <option value="A VENCER">A VENCER</option>
                  <option value="PAGO">PAGO</option>
                  <option value="ATRASADO">ATRASADO</option>
                </select>
              </div>

            </div>
            <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border-color)', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setModalEditOpen(false)} style={{ padding: '10px 16px', background: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-dark)', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleSaveEdit} style={{ padding: '10px 16px', background: '#3b82f6', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Salvar Alterações</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Valor Avulso */}
      {modalAvulsoOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', width: '500px', maxWidth: '95%', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', background: '#f8fafc' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-dark)' }}>Novo Valor Avulso</h2>
              <button onClick={() => setModalAvulsoOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Descrição / Cliente</label>
                <input 
                  type="text" 
                  value={avulsoNome} 
                  onChange={(e) => setAvulsoNome(e.target.value)} 
                  placeholder="Ex: Venda Creme Pilates"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', color: 'var(--text-main)' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Valor a Cobrar (R$)</label>
                <input 
                  type="text" 
                  value={avulsoValor} 
                  onChange={(e) => setAvulsoValor(e.target.value)} 
                  placeholder="R$ 0,00"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', color: 'var(--text-main)' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Data do Vencimento</label>
                <input 
                  type="date" 
                  value={avulsoData} 
                  onChange={(e) => setAvulsoData(e.target.value)} 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', color: 'var(--text-main)' }} 
                />
              </div>

            </div>
            <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border-color)', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setModalAvulsoOpen(false)} style={{ padding: '10px 16px', background: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-dark)', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleSaveAvulso} style={{ padding: '10px 16px', background: '#16a34a', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Gerar Cobrança</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
