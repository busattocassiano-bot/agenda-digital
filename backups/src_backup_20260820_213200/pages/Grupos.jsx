import React, { useState } from 'react';
import { Plus, RefreshCw, Edit, X, Trash2, Check } from 'lucide-react';

export default function Grupos() {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Main Card */}
      <div className="card" style={{ padding: '24px' }}>
        <div className="flex-between" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#1e293b' }}>Controle de Acesso</h2>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{ background: '#1d4ed8', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
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
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.95rem' }}>Grupo de usuários</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                onClick={() => setModalOpen(true)}
                style={{ borderBottom: '1px solid var(--border-color)', background: 'white', cursor: 'pointer' }}
                className="table-row-hover"
              >
                <td style={{ padding: '16px', color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 500 }}>Administrador</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Alterar Grupo */}
      {modalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', width: '550px', maxWidth: '100%', maxHeight: '90vh', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            
            {/* Header */}
            <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit size={18} /> Alterar Grupo
              </h2>
              <button 
                onClick={() => setModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto' }}>
              
              {/* Nome */}
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>Nome:</label>
                <input 
                  type="text" 
                  defaultValue="Administrador"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', color: 'var(--text-main)', fontSize: '0.95rem' }} 
                />
              </div>

              {/* Permissões */}
              <div>
                <label style={{ display: 'block', fontSize: '1rem', fontWeight: 700, color: '#1e40af', marginBottom: '12px' }}>Permissões:</label>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Card: Todas as Permissões */}
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', background: '#f8fafc' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 700, color: '#334155', cursor: 'pointer', marginBottom: '12px' }}>
                      <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: '#1d4ed8' }} />
                      Todas as Permissões
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', paddingLeft: '24px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: '#64748b', cursor: 'pointer' }}>
                        <input type="checkbox" style={{ width: '14px', height: '14px' }} /> Visualizar
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: '#64748b', cursor: 'pointer' }}>
                        <input type="checkbox" style={{ width: '14px', height: '14px' }} /> Inserir
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: '#64748b', cursor: 'pointer' }}>
                        <input type="checkbox" style={{ width: '14px', height: '14px' }} /> Atualizar
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: '#64748b', cursor: 'pointer' }}>
                        <input type="checkbox" style={{ width: '14px', height: '14px' }} /> Excluir
                      </label>
                    </div>
                  </div>

                  {/* Mapped Permissions */}
                  {[
                    'Agenda', 'Alterar horários', 'Aula Online', 'Cargos', 'Clientes', 
                    'Controle de despesas', 'Correção de agendamento', 'Empresas', 
                    'Grupos de permissões', 'Matrículas', 'Mensalidades', 
                    'Mensalidades do aluno', 'Modalidades', 'Parametros', 'Planos', 
                    'Relatório de matrículas', 'Reposições', 'Resumo financeiro', 'Usuários'
                  ].map(perm => (
                    <div key={perm} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', background: '#f8fafc' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 700, color: '#334155', cursor: 'pointer', marginBottom: '12px' }}>
                        <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px', accentColor: '#1d4ed8' }} />
                        {perm}
                      </label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', paddingLeft: '24px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: '#0f172a', fontWeight: 500, cursor: 'pointer' }}>
                          <input type="checkbox" defaultChecked style={{ width: '14px', height: '14px', accentColor: '#1d4ed8' }} /> Visualizar
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: '#0f172a', fontWeight: 500, cursor: 'pointer' }}>
                          <input type="checkbox" defaultChecked style={{ width: '14px', height: '14px', accentColor: '#1d4ed8' }} /> Inserir
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: '#0f172a', fontWeight: 500, cursor: 'pointer' }}>
                          <input type="checkbox" defaultChecked style={{ width: '14px', height: '14px', accentColor: '#1d4ed8' }} /> Atualizar
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: '#0f172a', fontWeight: 500, cursor: 'pointer' }}>
                          <input type="checkbox" defaultChecked style={{ width: '14px', height: '14px', accentColor: '#1d4ed8' }} /> Excluir
                        </label>
                      </div>
                    </div>
                  ))}

                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', background: '#f8fafc' }}>
              <button 
                style={{ background: 'transparent', color: '#94a3b8', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Trash2 size={16} /> Excluir
              </button>
              
              <div style={{ display: 'flex', gap: '16px' }}>
                <button 
                  onClick={() => setModalOpen(false)}
                  style={{ background: 'transparent', color: '#64748b', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => setModalOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 24px', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}
                >
                  <Check size={18} /> Salvar
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
