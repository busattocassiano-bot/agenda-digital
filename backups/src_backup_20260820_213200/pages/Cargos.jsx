import React, { useState } from 'react';
import { Plus, RefreshCw, Edit, Info, X, Save } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';

export default function Cargos() {
  const { cargos, addCargo } = useAppData();
  const [modalOpen, setModalOpen] = useState(false);
  
  // form state
  const [nome, setNome] = useState('');
  
  const handleSave = () => {
    if (nome) {
      addCargo({ nome });
      setNome('');
      setModalOpen(false);
    }
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Main Card */}
      <div className="card" style={{ padding: '24px' }}>
        <div className="flex-between" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#1e293b' }}>Cargos</h2>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={() => setModalOpen(true)}
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
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.95rem' }}>Nome</th>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.95rem' }}>Utiliza agenda?</th>
              </tr>
            </thead>
            <tbody>
              {cargos.length === 0 ? (
                <tr style={{ background: 'white' }}>
                  <td colSpan="2" style={{ padding: '16px', color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.95rem' }}>Nenhum cargo encontrado.</td>
                </tr>
              ) : (
                cargos.map(cargo => (
                  <tr key={cargo.id} style={{ borderBottom: '1px solid var(--border-color)', background: 'white' }}>
                    <td style={{ padding: '16px', color: 'var(--text-dark)', fontWeight: 500, fontSize: '0.95rem' }}>{cargo.nome}</td>
                    <td style={{ padding: '16px' }}>
                      <input type="checkbox" defaultChecked disabled style={{ width: '16px', height: '16px' }} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Adicionar novo cargo */}
      {modalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', width: '600px', maxWidth: '100%', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            
            {/* Header */}
            <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', background: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Edit size={18} /> Adicionar novo cargo
                </h2>
                <div style={{ background: '#e2e8f0', borderRadius: '4px', padding: '2px 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                  <Info size={14} />
                </div>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Nome */}
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>Nome:</label>
                <input 
                  type="text" 
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome do Cargo"
                  style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', color: 'var(--text-main)', fontSize: '0.95rem' }} 
                />
              </div>

              {/* Checkboxes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', color: '#334155', cursor: 'pointer' }}>
                  <input type="checkbox" style={{ width: '18px', height: '18px', borderRadius: '4px', accentColor: '#1d4ed8' }} />
                  Utiliza agenda?
                </label>
              </div>

            </div>

            {/* Footer */}
            <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', borderTop: '1px solid var(--border-color)', background: 'white' }}>
              <button 
                onClick={handleSave}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}
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
