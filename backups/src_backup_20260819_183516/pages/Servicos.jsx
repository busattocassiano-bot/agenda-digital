import React, { useState } from 'react';
import { Search, Plus, RefreshCw, Info, X, Save, Check, Trash2, Edit } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';

export default function Servicos() {
  const { servicos, setServicos, addServico, updateServico } = useAppData();
  const [modalOpen, setModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  const [nome, setNome] = useState('');
  const [clientesMax, setClientesMax] = useState('');
  const [cor, setCor] = useState('#fda4af'); // Default color
  const [duracao, setDuracao] = useState('60'); // Default duration
  const [editingId, setEditingId] = useState(null);

  const handleOpenNew = () => {
    setNome('');
    setClientesMax('');
    setCor('#fda4af');
    setDuracao('60');
    setEditingId(null);
    setModalOpen(true);
  };

  const handleEdit = (servico) => {
    setNome(servico.nome);
    setClientesMax(servico.clientesMax || '');
    setCor(servico.cor || '#fda4af');
    setDuracao(servico.duracao || '60');
    setEditingId(servico.id);
    setModalOpen(true);
  };
  
  const handleSave = () => {
    if (nome) {
      if (editingId) {
        updateServico(editingId, { nome, clientesMax, cor, duracao });
      } else {
        addServico({ nome, clientesMax, cor, duracao });
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
          <span style={{ color: '#065f46', fontWeight: 500 }}>Registro criado com sucesso.</span>
        </div>
      )}

      {/* Top Search Area */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', background: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px 20px', gap: '12px', boxShadow: 'var(--shadow-sm)' }}>
          <Search size={20} color="#0ea5e9" style={{ strokeWidth: 2.5 }} />
          <span style={{ color: '#0ea5e9', fontWeight: 600, marginRight: '8px' }}>Pesquisar</span>
          <input 
            type="text" 
            placeholder="Informe o nome da Modalidade" 
            style={{ border: 'none', outline: 'none', flex: 1, fontSize: '1rem', color: 'var(--text-main)', background: 'transparent' }} 
          />
        </div>
      </div>

      {/* Main Card */}
      <div className="card" style={{ padding: '24px' }}>
        <div className="flex-between" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#1e293b' }}>Lista de Serviços</h2>
            <div style={{ background: '#e2e8f0', color: '#64748b', borderRadius: '4px', padding: '2px', display: 'flex', cursor: 'pointer' }}>
              <Info size={16} />
            </div>
          </div>
          
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
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.95rem', textAlign: 'left', width: '30%' }}>Modalidade</th>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.95rem', textAlign: 'left', width: '20%' }}>Vagas/Prof.</th>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.95rem', textAlign: 'left', width: '20%' }}>Duração (min)</th>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.95rem', textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {servicos.length === 0 ? (
                <tr style={{ background: 'white' }}>
                  <td colSpan="3" style={{ padding: '16px', color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.95rem' }}>Nenhum serviço encontrado.</td>
                </tr>
              ) : (
                servicos.map(servico => (
                  <tr key={servico.id} style={{ borderBottom: '1px solid var(--border-color)', background: 'white' }}>
                    <td style={{ padding: '16px', color: 'var(--text-dark)', fontWeight: 500, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: servico.cor || '#fda4af' }}></div>
                      {servico.nome}
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>{servico.clientesMax || '1'}</td>
                    <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>{servico.duracao || '60'}</td>
                    <td style={{ padding: '16px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button onClick={() => handleEdit(servico)} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px', borderRadius: '6px', color: '#64748b', cursor: 'pointer' }} title="Editar"><Edit size={16} /></button>
                      <button onClick={() => setServicos(servicos.filter(s => s.id !== servico.id))} style={{ background: '#fef2f2', border: 'none', padding: '8px', borderRadius: '6px', color: '#ef4444', cursor: 'pointer' }} title="Excluir"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Adicionar Nova Modalidade */}
      {modalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', width: '900px', maxWidth: '95%', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            
            {/* Header */}
            <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', background: '#f8fafc' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                {editingId ? 'Editar modalidade' : 'Adicionar nova modalidade'}
              </h2>
              <button 
                onClick={() => setModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              <div style={{ display: 'flex', gap: '24px' }}>
                <div style={{ flex: 2 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Nome:</label>
                  <input 
                    type="text" 
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Nome da modalidade"
                    style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', color: 'var(--text-main)', fontSize: '0.95rem' }} 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Clientes por profissional:</label>
                  <input 
                    type="text" 
                    value={clientesMax}
                    onChange={(e) => setClientesMax(e.target.value)}
                    placeholder="Número maximo de clientes"
                    style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', color: 'var(--text-main)', fontSize: '0.95rem' }} 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Duração (min):</label>
                  <input 
                    type="number" 
                    value={duracao}
                    onChange={(e) => setDuracao(e.target.value)}
                    placeholder="Ex: 50"
                    style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', color: 'var(--text-main)', fontSize: '0.95rem' }} 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Cor do Serviço:</label>
                  <input 
                    type="color" 
                    value={cor}
                    onChange={(e) => setCor(e.target.value)}
                    style={{ width: '100%', height: '48px', padding: '4px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', cursor: 'pointer' }} 
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Limitação de justificativa</label>
                <input 
                  type="number" 
                  defaultValue="0"
                  style={{ width: '200px', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', color: 'var(--text-main)', fontSize: '0.95rem', marginBottom: '12px' }} 
                />
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-dark)', cursor: 'pointer' }}>
                  <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: '#0ea5e9' }} />
                  Limitar justificativa
                </label>
              </div>

            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', background: '#f8fafc' }}>
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
