import React, { useState } from 'react';
import { Search, Plus, RefreshCw, Filter, Check, X, Info, Trash2, Edit } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';

export default function Planos() {
  const { planos, setPlanos, addPlano, updatePlano, servicos } = useAppData();
  const [showToast, setShowToast] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  
  const [nome, setNome] = useState('');
  const [modalidade, setModalidade] = useState('');
  const [preco, setPreco] = useState('');
  const [atendimentoIndividual, setAtendimentoIndividual] = useState(false);
  const [mensalidadeProporcional, setMensalidadeProporcional] = useState(false);
  const [aulasFixas, setAulasFixas] = useState(false);
  const [qtdSessoes, setQtdSessoes] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterModalidade, setFilterModalidade] = useState('Todas');
  const [showInativos, setShowInativos] = useState(false);

  const filteredPlanos = planos.filter(p => {
    const matchesSearch = p.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModalidade = filterModalidade === 'Todas' || p.modalidade === filterModalidade;
    const isActive = p.statusAtivo !== false;
    const matchesStatus = showInativos ? !isActive : isActive;
    return matchesSearch && matchesModalidade && matchesStatus;
  }).sort((a, b) => (a.modalidade || '').localeCompare(b.modalidade || '') || (a.nome || '').localeCompare(b.nome || ''));

  const handleOpenNew = () => {
    setNome('');
    setModalidade('');
    setPreco('');
    setAtendimentoIndividual(false);
    setMensalidadeProporcional(false);
    setAulasFixas(false);
    setEditingId(null);
    setModalOpen(true);
  };

  const handlePrecoChange = (e) => {
    let value = e.target.value;
    value = value.replace(/\D/g, "");
    
    if (value === "") {
      setPreco("");
      return;
    }
    
    const options = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
    const result = new Intl.NumberFormat('pt-BR', options).format(
      parseFloat(value) / 100
    );
    
    setPreco("R$ " + result);
  };

  const formatCurrency = (val) => {
    if (!val) return 'R$ 0,00';
    if (typeof val === 'string' && val.includes('R$')) return val;
    const num = parseFloat(val.toString().replace(',', '.'));
    if (isNaN(num)) return val;
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleEdit = (plano) => {
    setNome(plano.nome);
    setModalidade(plano.modalidade || '');
    setPreco(plano.preco || '');
    setAtendimentoIndividual(plano.atendimentoIndividual || false);
    setMensalidadeProporcional(plano.mensalidadeProporcional || false);
    setAulasFixas(plano.aulasFixas || false);
    setQtdSessoes(plano.qtdSessoes || '');
    setEditingId(plano.id);
    setModalOpen(true);
  };
  
  const handleSave = () => {
    if (nome) {
      const planoData = { nome, modalidade, preco, atendimentoIndividual, aulasFixas, qtdSessoes: qtdSessoes ? parseInt(qtdSessoes) : null };
      if (editingId) {
        updatePlano(editingId, planoData);
      } else {
        addPlano({ id: Date.now(), ...planoData });
      }
      setModalOpen(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
      
      {/* Toast Notification */}
      {showToast && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', background: '#ecfdf5', borderLeft: '4px solid #10b981', padding: '16px 20px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', zIndex: 9999, transition: 'all 0.3s ease' }}>
          <div style={{ background: '#10b981', borderRadius: '50%', padding: '2px' }}>
            <Check size={16} color="white" />
          </div>
          <span style={{ color: '#065f46', fontWeight: 500 }}>Registro alterado com sucesso.</span>
        </div>
      )}
      {/* Top Search Area */}
      <div>
        <div style={{ display: 'flex', gap: '24px' }}>
          {/* Search Input */}
          <div style={{ flex: 2, display: 'flex', alignItems: 'center', background: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px 20px', gap: '12px', boxShadow: 'var(--shadow-sm)' }}>
            <Search size={20} color="#0ea5e9" style={{ strokeWidth: 2.5 }} />
            <span style={{ color: '#0ea5e9', fontWeight: 600, marginRight: '8px' }}>Pesquisar</span>
            <input 
              type="text" 
              placeholder="Informe o nome do Plano" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', outline: 'none', flex: 1, fontSize: '1rem', color: 'var(--text-main)', background: 'transparent' }} 
            />
          </div>
          
          {/* Modalidade Select */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px 20px', gap: '12px', boxShadow: 'var(--shadow-sm)' }}>
             <Filter size={20} color="var(--text-main)" />
             <span style={{ color: 'var(--text-main)', fontWeight: 600, marginRight: '8px' }}>Modalidade</span>
             <select 
               value={filterModalidade}
               onChange={(e) => setFilterModalidade(e.target.value)}
               style={{ border: 'none', outline: 'none', flex: 1, fontSize: '1rem', color: 'var(--text-main)', background: 'transparent', cursor: 'pointer' }}
             >
               <option value="Todas">Todas</option>
               {servicos && servicos.map(s => (
                 <option key={s.id} value={s.nome}>{s.nome}</option>
               ))}
             </select>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', paddingLeft: '4px' }}>
          <input 
            type="checkbox" 
            id="inativos_planos" 
            checked={showInativos}
            onChange={(e) => setShowInativos(e.target.checked)}
            style={{ width: '16px', height: '16px', accentColor: 'var(--primary-color)', cursor: 'pointer' }} 
          />
          <label htmlFor="inativos_planos" style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}>
            Exibir apenas planos inativos.
          </label>
        </div>
      </div>

      {/* Main Card */}
      <div className="card" style={{ padding: '24px' }}>
        <div className="flex-between" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#1e293b' }}>Planos de Pagamentos</h2>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={handleOpenNew}
              style={{ background: '#1d4ed8', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <Plus size={20} />
            </button>
            <button style={{ background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <RefreshCw size={20} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#0275d8', color: 'white' }}>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.95rem' }}>Modalidade</th>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.95rem' }}>Nome do Plano</th>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.95rem' }}>Preço</th>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.95rem' }}>Sessões semana</th>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.95rem' }}>Justificativas</th>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.95rem' }}>Recorrente?</th>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.95rem' }}>Qtd. Sessões</th>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.95rem' }}>Personal?</th>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.95rem', textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlanos.length === 0 ? (
                <tr style={{ background: 'white' }}>
                  <td colSpan="9" style={{ padding: '16px', color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.95rem' }}>Nenhum plano encontrado.</td>
                </tr>
              ) : (
                filteredPlanos.map(plano => (
                  <tr key={plano.id} style={{ borderBottom: '1px solid var(--border-color)', background: 'white' }}>
                    <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>{plano.modalidade}</td>
                    <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>{plano.nome}</td>
                    <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>{formatCurrency(plano.preco)}</td>
                    <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.95rem' }}></td>
                    <td style={{ padding: '16px' }}>
                      <input type="checkbox" checked={plano.aulasFixas} style={{ width: '16px', height: '16px', accentColor: 'var(--primary-color)', opacity: 0.8 }} disabled />
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>{plano.qtdSessoes ? plano.qtdSessoes : '-'}</td>
                    <td style={{ padding: '16px' }}>
                      <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: 'var(--primary-color)', opacity: 0.5 }} disabled />
                    </td>
                    <td style={{ padding: '16px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button onClick={() => handleEdit(plano)} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px', borderRadius: '6px', color: '#64748b', cursor: 'pointer' }} title="Editar"><Edit size={16} /></button>
                      <button onClick={() => setPlanos(planos.filter(p => p.id !== plano.id))} style={{ background: '#fef2f2', border: 'none', padding: '8px', borderRadius: '6px', color: '#ef4444', cursor: 'pointer' }} title="Excluir"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Adicionar Novo Plano */}
      {modalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', width: '900px', maxWidth: '95%', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            
            {/* Header */}
            <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', background: '#f8fafc' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} strokeWidth={3} />
                {editingId ? 'Editar plano' : 'Adicionar novo plano'}
              </h2>
              <button 
                onClick={() => setModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Row 1 */}
              <div style={{ display: 'flex', gap: '24px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Modalidade *</label>
                  <select value={modalidade} onChange={(e) => setModalidade(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', color: 'var(--text-main)', fontSize: '0.95rem', background: 'white' }}>
                    <option value="">-Selecione-</option>
                    {servicos && servicos.length > 0 ? servicos.filter(s => !s.nome.toLowerCase().includes('avalia')).map(s => (
                      <option key={s.id} value={s.nome}>{s.nome}</option>
                    )) : (
                      <option disabled>Nenhum serviço cadastrado</option>
                    )}
                  </select>
                </div>
                <div style={{ flex: 2 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Nome *</label>
                  <input 
                    type="text" 
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Nome"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #0ea5e9', borderRadius: '8px', outline: 'none', color: 'var(--text-main)', fontSize: '0.95rem', boxShadow: '0 0 0 1px #0ea5e9' }} 
                  />
                </div>
              </div>

              {/* Row 2 (Checkboxes) */}
              <div style={{ display: 'flex', gap: '48px', alignItems: 'center', marginTop: '4px' }}>
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--text-dark)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={atendimentoIndividual} onChange={(e) => setAtendimentoIndividual(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#0ea5e9' }} />
                    Atendimento individual? <Info size={14} color="var(--text-muted)" />
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--text-dark)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={aulasFixas} onChange={(e) => setAulasFixas(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#0ea5e9' }} />
                    Recorrente? <Info size={14} color="var(--text-muted)" />
                  </label>
                </div>
              </div>

              {/* Row 3 & 4 (Justificativas) */}
              <div style={{ marginTop: '4px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Limitação de justificativas</label>
                <input 
                  type="number" 
                  defaultValue="0"
                  style={{ width: '250px', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', color: 'var(--text-main)', fontSize: '0.95rem', marginBottom: '12px' }} 
                />
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-dark)', cursor: 'pointer' }}>
                  <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: '#0ea5e9' }} />
                  Limitar justificativa
                </label>
              </div>

              {/* Row 5 */}
              <div style={{ display: 'flex', gap: '24px', marginTop: '4px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Vigência *</label>
                  <select style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', color: 'var(--text-main)', fontSize: '0.95rem', background: 'white' }}>
                    <option>-Selecione-</option>
                    <option>Mensal</option>
                    <option>Bimestral</option>
                    <option>Trimestral</option>
                    <option>Quadrimestral</option>
                    <option>Semestral</option>
                    <option>Anual</option>
                    <option>Dia</option>
                    <option>Quimestral</option>
                    <option>Septimestre</option>
                    <option>Octmestral</option>
                    <option>Nonimestral</option>
                    <option>Decimestral</option>
                    <option>Enemestral</option>
                    <option>Avulso</option>
                  </select>
                </div>
              </div>

                <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Valor a ser comercializado (R$) *</label>
                    <input 
                      type="text" 
                      value={preco}
                      onChange={handlePrecoChange}
                      placeholder="R$ 0,00" 
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', color: 'var(--text-main)', fontSize: '0.95rem' }} 
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Quantidade de Sessões (Pacotes)</label>
                    <input 
                      type="number" 
                      value={qtdSessoes}
                      onChange={(e) => setQtdSessoes(e.target.value)}
                      placeholder="Ex: 10 (Deixe em branco p/ planos mensais)" 
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', color: 'var(--text-main)', fontSize: '0.95rem' }} 
                    />
                  </div>
                </div>

              {/* Row 6 */}
              <div style={{ marginTop: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px', accentColor: '#0ea5e9' }} />
                  Ativo
                </label>
              </div>

            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', background: '#f8fafc' }}>
              <button 
                onClick={handleSave}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 24px', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                Salvar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
