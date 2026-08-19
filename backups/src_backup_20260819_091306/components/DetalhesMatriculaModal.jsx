import React, { useState } from 'react';
import { User, X, FileText, Pause, Square, Save, Calendar, RefreshCw } from 'lucide-react';

export default function DetalhesMatriculaModal({ isOpen, onClose }) {
  const [detalhesTab, setDetalhesTab] = useState('mensalidades');

  if (!isOpen) return null;

  const inputStyle = { 
    width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', 
    borderRadius: '8px', outline: 'none', backgroundColor: '#fff', 
    color: 'var(--text-main)', fontSize: '0.9rem' 
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', borderRadius: '12px', width: '900px', maxWidth: '95%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', maxHeight: '90vh' }}>
        
        {/* Header */}
        <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', background: '#f8fafc' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dark)' }}>
            <FileText size={18} /> Detalhes da Matrícula
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', flex: 1 }}>
          
          {/* Top Section */}
          <div style={{ padding: '24px', display: 'flex', gap: '32px', borderBottom: '1px solid var(--border-color)' }}>
            
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: '0 0 200px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}><X size={14}/> Excluir</button>
                <button style={{ background: '#334155', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}><Pause size={14}/> Trancar</button>
                <button style={{ background: '#eab308', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}><Square size={14} fill="white"/> Cancelar</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                  <User size={40} />
                </div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-dark)' }}>Cassiano Busatto</div>
              </div>
            </div>

            {/* Middle Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Data de vigência</label>
                <input type="text" readOnly value="01/07/2026 até 31/07/2026" style={{ ...inputStyle, background: '#f8fafc', color: 'var(--text-main)', border: '1px solid var(--border-color)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Plano de pagamento</label>
                <input type="text" readOnly value="2x Semana - Mensal" style={{ ...inputStyle, background: '#f8fafc', color: 'var(--text-main)', border: '1px solid var(--border-color)' }} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-dark)', cursor: 'pointer' }}>
                <input type="checkbox" style={{ width: '16px', height: '16px' }} />
                Renovar automaticamente
              </label>
            </div>

            {/* Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Observação:</label>
                <textarea style={{ ...inputStyle, flex: 1, resize: 'none' }}></textarea>
              </div>
              <div>
                <button style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 24px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Save size={16} /> Salvar
                </button>
              </div>
            </div>

          </div>

          {/* Bottom Tabs */}
          <div style={{ padding: '0 24px', display: 'flex', borderBottom: '1px solid var(--border-color)', background: '#f8fafc', gap: '4px', paddingTop: '8px' }}>
            <div 
              onClick={() => setDetalhesTab('mensalidades')}
              style={{ padding: '12px 32px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, color: detalhesTab === 'mensalidades' ? 'white' : 'var(--text-muted)', background: detalhesTab === 'mensalidades' ? '#38bdf8' : 'transparent', borderRadius: '8px 8px 0 0', flex: 1, textAlign: 'center', transition: 'all 0.2s ease' }}>
              Mensalidades
            </div>
            <div 
              onClick={() => setDetalhesTab('agendamentos')}
              style={{ padding: '12px 32px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, color: detalhesTab === 'agendamentos' ? 'white' : 'var(--text-muted)', background: detalhesTab === 'agendamentos' ? '#38bdf8' : 'transparent', borderRadius: '8px 8px 0 0', flex: 1, textAlign: 'center', transition: 'all 0.2s ease' }}>
              Agendamentos
            </div>
            <div 
              onClick={() => setDetalhesTab('reposicoes')}
              style={{ padding: '12px 32px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, color: detalhesTab === 'reposicoes' ? 'white' : 'var(--text-muted)', background: detalhesTab === 'reposicoes' ? '#38bdf8' : 'transparent', borderRadius: '8px 8px 0 0', flex: 1, textAlign: 'center', transition: 'all 0.2s ease' }}>
              Reposições
            </div>
          </div>

          {/* Tab Content */}
          <div style={{ padding: '24px', background: 'white' }}>
            {detalhesTab === 'mensalidades' && (
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-dark)' }}>Lista de Mensalidades</h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{ background: '#eab308', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={16} /> Alterar data vencimento
                    </button>
                    <button style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}>
                      <RefreshCw size={16} />
                    </button>
                  </div>
                </div>
                
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', color: 'var(--text-dark)' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, borderRadius: '8px 0 0 8px' }}>Status</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700 }}>Vencimento</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700 }}>Pagamento</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700 }}>Tipo pagamento</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700 }}>Valor</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700 }}>Valor Pago</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700 }}>Desconto</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700 }}>Juros</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, borderRadius: '0 8px 8px 0' }}>Multa</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 16px' }}><span style={{ background: '#f1f5f9', color: '#64748b', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>A vencer</span></td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-main)' }}>01/07/2026</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-main)' }}></td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-main)' }}>Dinheiro</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-main)' }}>R$ 100,00</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-main)' }}>R$ 0,00</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-main)' }}>R$ 0,00</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-main)' }}>R$ 0,00</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-main)' }}>R$ 0,00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
            
            {detalhesTab === 'agendamentos' && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '150px', color: 'var(--text-muted)' }}>
                Aba de agendamentos...
              </div>
            )}
            
            {detalhesTab === 'reposicoes' && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '150px', color: 'var(--text-muted)' }}>
                Aba de reposições...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
