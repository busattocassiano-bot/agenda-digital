import React, { useState } from 'react';
import { Search, Plus, RefreshCw, X, ChevronDown, Save, Edit, Trash2 } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { maskCpf, maskTelefone } from '../utils/masks';

export default function Profissionais() {
  const { profissionais, setProfissionais, addProfissional } = useAppData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form states
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const [cargo, setCargo] = useState('');
  
  // Financeiro
  const [comissaoPorcentagem, setComissaoPorcentagem] = useState('');
  const [comissaoFixo, setComissaoFixo] = useState('');
  
  // Endereço states
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [showInativos, setShowInativos] = useState(false);

  const filteredProfissionais = profissionais.filter(p => {
    const matchesSearch = p.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const isActive = p.statusAtivo !== false;
    const matchesStatus = showInativos ? !isActive : isActive;
    return matchesSearch && matchesStatus;
  });

  const fetchCep = async (cepValue) => {
    const cleanCep = cepValue.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setLogradouro(data.logradouro || '');
          setBairro(data.bairro || '');
          setCidade(data.localidade || '');
          setUf(data.uf || '');
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  const handleOpenNew = () => {
    setNome('');
    setEmail('');
    setTelefone('');
    setCpf('');
    setCargo('');
    setCep('');
    setLogradouro('');
    setNumero('');
    setComplemento('');
    setBairro('');
    setCidade('');
    setUf('');
    setComissaoPorcentagem('');
    setComissaoFixo('');
    setEditingId(null);
    setModalOpen(true);
  };

  const handleEdit = (prof) => {
    setNome(prof.nome);
    setEmail(prof.email || '');
    setTelefone(prof.telefone || '');
    setCpf(prof.cpf || '');
    setCargo(prof.cargo || '');
    setCep(prof.cep || '');
    setLogradouro(prof.logradouro || '');
    setNumero(prof.numero || '');
    setComplemento(prof.complemento || '');
    setBairro(prof.bairro || '');
    setCidade(prof.cidade || '');
    setUf(prof.uf || '');
    setComissaoPorcentagem(prof.comissaoPorcentagem || '');
    setComissaoFixo(prof.comissaoFixo || '');
    setEditingId(prof.id);
    setModalOpen(true);
  };

  const deleteProfissional = (id) => {
    if(window.confirm('Tem certeza que deseja excluir este profissional?')) {
      setProfissionais(profissionais.filter(p => p.id !== id));
    }
  };

  const handleSave = () => {
    if (nome) {
      const profData = { nome, email, telefone, cpf, cargo, cep, logradouro, numero, complemento, bairro, cidade, uf, comissaoPorcentagem, comissaoFixo };
      if (editingId) {
        setProfissionais(profissionais.map(p => p.id === editingId ? { ...p, ...profData } : p));
      } else {
        addProfissional(profData);
      }
      setModalOpen(false);
      // reset
      handleOpenNew();
      setModalOpen(false); // handleOpenNew sets it to true, we want it false
    }
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Search Area */}
      <div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {/* Search Input */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px 20px', gap: '12px', boxShadow: 'var(--shadow-sm)' }}>
            <Search size={20} color="#0ea5e9" style={{ strokeWidth: 2.5 }} />
            <input 
              type="text" 
              placeholder="Pesquisar Profissional" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', outline: 'none', flex: 1, fontSize: '1rem', color: 'var(--text-main)', background: 'transparent' }} 
            />
          </div>
          <button onClick={() => setSearchTerm('')} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', padding: '0 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', paddingLeft: '4px' }}>
          <input 
            type="checkbox" 
            id="inativos_profissionais" 
            checked={showInativos}
            onChange={(e) => setShowInativos(e.target.checked)}
            style={{ width: '16px', height: '16px', accentColor: 'var(--primary-color)', cursor: 'pointer' }} 
          />
          <label htmlFor="inativos_profissionais" style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}>
            Exibir apenas Profissionais inativos.
          </label>
        </div>
      </div>

      {/* Main Card */}
      <div className="card" style={{ padding: '24px' }}>
        <div className="flex-between" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#1e293b' }}>Lista de Profissionais</h2>
          
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
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.95rem' }}>CPF</th>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.95rem' }}>Nome</th>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.95rem' }}>Cargo</th>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.95rem' }}>Telefone</th>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.95rem', textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProfissionais.length === 0 ? (
                <tr style={{ background: 'white' }}>
                  <td colSpan="5" style={{ padding: '16px', color: 'var(--text-muted)', textAlign: 'center' }}>Nenhum profissional cadastrado.</td>
                </tr>
              ) : (
                filteredProfissionais.map((prof) => (
                  <tr key={prof.id} style={{ borderBottom: '1px solid var(--border-color)', background: 'white' }}>
                    <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>{prof.cpf || '000.000.000-00'}</td>
                    <td style={{ padding: '16px', color: 'var(--text-dark)', fontWeight: 500, fontSize: '0.95rem' }}>{prof.nome}</td>
                    <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>{prof.cargo || 'Instrutor / Fisioterapeuta'}</td>
                    <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>{prof.telefone}</td>
                    <td style={{ padding: '16px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button onClick={() => handleEdit(prof)} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px', borderRadius: '6px', color: '#64748b', cursor: 'pointer' }} title="Editar"><Edit size={16} /></button>
                      <button onClick={() => deleteProfissional(prof.id)} style={{ background: '#fef2f2', border: 'none', padding: '8px', borderRadius: '6px', color: '#ef4444', cursor: 'pointer' }} title="Excluir"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Novo Profissional */}
      {modalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', width: '900px', maxWidth: '100%', maxHeight: '90vh', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            
            {/* Header */}
            <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', background: '#f8fafc' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                + Novo Profissional
              </h2>
              <button 
                onClick={() => setModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px', overflowY: 'auto' }}>
              
              {/* Seção: Dados Pessoais */}
              <div>
                <h3 style={{ fontSize: '1.05rem', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '20px', marginTop: 0 }}>Dados pessoais</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>Nome</label>
                    <input type="text" placeholder="Informe o nome do funcionário" value={nome} onChange={(e) => setNome(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', fontSize: '0.95rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>E-mail para acesso ao sistema</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', fontSize: '0.95rem' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', gridColumn: '1 / -1' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>Telefone</label>
                      <input type="text" placeholder="Informe número do telefone" value={telefone} onChange={(e) => setTelefone(maskTelefone(e.target.value))} style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', fontSize: '0.95rem' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>CPF</label>
                      <input type="text" placeholder="Informe o CPF" value={cpf} onChange={(e) => setCpf(maskCpf(e.target.value))} style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', fontSize: '0.95rem' }} />
                    </div>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>Cargo</label>
                    <select value={cargo} onChange={(e) => setCargo(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', fontSize: '0.95rem', color: '#64748b', appearance: 'none', background: 'white' }}>
                      <option>-Selecione-</option>
                      <option>Instrutor / Fisioterapeuta</option>
                      <option>Instrutor</option>
                      <option>Fisioterapeuta</option>
                    </select>
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 700, color: '#334155', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px', accentColor: '#1d4ed8' }} />
                  Status ativo
                </label>
              </div>

              {/* Seção: Endereço */}
              <div>
                <h3 style={{ fontSize: '1.05rem', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '20px', marginTop: 0 }}>Endereço</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>CEP</label>
                    <input type="text" placeholder="Informe o CEP" value={cep} onChange={(e) => setCep(e.target.value)} onBlur={(e) => fetchCep(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', fontSize: '0.95rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>Logradouro</label>
                    <input type="text" placeholder="Informe o logradouro" value={logradouro} onChange={(e) => setLogradouro(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', fontSize: '0.95rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>Numero</label>
                    <input type="text" placeholder="Informe número" value={numero} onChange={(e) => setNumero(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', fontSize: '0.95rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>Complemento</label>
                    <input type="text" placeholder="Informe o complemento" value={complemento} onChange={(e) => setComplemento(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', fontSize: '0.95rem' }} />
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginTop: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>Bairro</label>
                    <input type="text" placeholder="Informe nome do bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', fontSize: '0.95rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>Cidade</label>
                    <input type="text" placeholder="Informe nome do cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', fontSize: '0.95rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>UF</label>
                    <input type="text" placeholder="Informe a UF" value={uf} onChange={(e) => setUf(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', fontSize: '0.95rem' }} />
                  </div>
                </div>
              </div>

              {/* Seção: Financeiro */}
              <div>
                <h3 style={{ fontSize: '1.05rem', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '20px', marginTop: 0 }}>Financeiro (Comissões)</h3>
                
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>Comissão em %</label>
                    <input type="number" placeholder="Ex: 50" value={comissaoPorcentagem} onChange={(e) => setComissaoPorcentagem(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', fontSize: '0.95rem' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>Comissão Valor Fixo (R$)</label>
                    <input type="text" placeholder="Ex: 30,00" value={comissaoFixo} onChange={(e) => setComissaoFixo(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', fontSize: '0.95rem' }} />
                  </div>
                </div>
              </div>

              {/* Seção: Permissões */}
              <div>
                <h3 style={{ fontSize: '1.05rem', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '20px', marginTop: 0 }}>Permissões</h3>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>Grupos</label>
                  <select style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', fontSize: '0.95rem', color: '#64748b', appearance: 'none', background: 'white' }}>
                    <option>- Selecione -</option>
                    <option>Administrador</option>
                  </select>
                </div>

                <button style={{ background: 'transparent', border: 'none', color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: 0 }}>
                  Ver permissões do grupo <ChevronDown size={16} />
                </button>
              </div>

              {/* Seção: Observação */}
              <div>
                <h3 style={{ fontSize: '1.05rem', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '20px', marginTop: 0 }}>Observação</h3>
                
                <textarea 
                  rows={4}
                  style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', fontSize: '0.95rem', resize: 'vertical' }}
                />
              </div>

            </div>

            {/* Footer */}
            <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', borderTop: '1px solid var(--border-color)', background: 'white' }}>
              <button 
                onClick={handleSave}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 24px', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}
              >
                <Save size={18} /> Salvar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
