import React, { useState } from 'react';
import { Plus, RefreshCw, Edit, X, Save, Calendar, Trash2, Download } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Feriados() {
  const { feriados, addFeriado, removeFeriado } = useAppData();
  const [modalOpen, setModalOpen] = useState(false);
  const [nomeFeriado, setNomeFeriado] = useState('');
  const [dataFeriado, setDataFeriado] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const handleSave = () => {
    if (!nomeFeriado || !dataFeriado) {
      alert('Por favor, preencha o nome e a data do feriado.');
      return;
    }
    
    addFeriado({ nome: nomeFeriado, data: dataFeriado });
    setNomeFeriado('');
    setDataFeriado('');
    setModalOpen(false);
  };

  const handleImportNacionais = async () => {
    const year = new Date().getFullYear();
    setIsImporting(true);
    try {
      const response = await fetch(`https://brasilapi.com.br/api/feriados/v1/${year}`);
      if (!response.ok) throw new Error('Falha ao buscar feriados da API');
      
      const data = await response.json();
      let importedCount = 0;
      
      data.forEach(f => {
        // Verifica se já existe um feriado na mesma data
        const exists = feriados.some(existente => existente.data === f.date);
        if (!exists) {
          addFeriado({ nome: f.name, data: f.date });
          importedCount++;
        }
      });
      
      alert(`${importedCount} feriados nacionais foram importados com sucesso para ${year}!`);
    } catch (err) {
      console.error(err);
      alert('Erro ao importar feriados. Verifique sua conexão com a internet.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Main Card */}
      <div className="card" style={{ padding: '24px' }}>
        <div className="flex-between" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#1e293b' }}>Lista de Feriados</h2>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={handleImportNacionais}
              disabled={isImporting}
              style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 14px', cursor: isImporting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, opacity: isImporting ? 0.7 : 1 }}
            >
              {isImporting ? <RefreshCw size={20} className="spin" /> : <Download size={20} />}
              Importar Feriados Nacionais
            </button>
            <button 
              onClick={() => setModalOpen(true)}
              style={{ background: '#1d4ed8', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}
            >
              <Plus size={20} /> Novo Feriado
            </button>
          </div>
        </div>

        {feriados && feriados.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>DATA</th>
                  <th style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>NOME DO FERIADO</th>
                  <th style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>AÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {feriados.sort((a, b) => new Date(a.data) - new Date(b.data)).map(feriado => (
                  <tr key={feriado.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '16px', fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 500 }}>
                      {format(parseISO(feriado.data), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                    </td>
                    <td style={{ padding: '16px', fontSize: '0.95rem', color: 'var(--text-dark)', fontWeight: 600 }}>
                      {feriado.nome}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <button 
                        onClick={() => {
                          if(window.confirm('Tem certeza que deseja excluir este feriado?')) {
                            removeFeriado(feriado.id);
                          }
                        }}
                        style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', padding: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ background: '#fef08a', color: '#854d0e', padding: '16px 20px', borderRadius: '8px', fontSize: '0.95rem' }}>
            <strong style={{ fontWeight: 700 }}>Atenção!</strong> <span style={{ fontWeight: 500 }}>Nenhum feriado foi cadastrado ainda.</span>
          </div>
        )}
      </div>

      {/* Modal Adicionar novo Feriado */}
      {modalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', width: '550px', maxWidth: '100%', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            
            {/* Header */}
            <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', background: '#f8fafc' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit size={18} /> Adicionar novo Feriado
              </h2>
              <button 
                onClick={() => setModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Nome feriado */}
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#1e40af', marginBottom: '8px' }}>Nome feriado: *</label>
                <input 
                  type="text" 
                  value={nomeFeriado}
                  onChange={(e) => setNomeFeriado(e.target.value)}
                  placeholder="Ex: Natal"
                  style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', color: 'var(--text-main)', fontSize: '0.95rem' }} 
                />
              </div>

              {/* Data */}
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#1e40af', marginBottom: '8px' }}>Data: *</label>
                <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ background: 'linear-gradient(to bottom, #94a3b8, #cbd5e1)', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid var(--border-color)' }}>
                    <Calendar size={18} color="white" />
                  </div>
                  <input 
                    type="date" 
                    value={dataFeriado}
                    onChange={(e) => setDataFeriado(e.target.value)}
                    style={{ flex: 1, padding: '12px', border: 'none', outline: 'none', color: 'var(--text-main)', fontSize: '0.95rem' }} 
                  />
                </div>
              </div>

            </div>

            {/* Footer */}
            <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', borderTop: '1px solid var(--border-color)' }}>
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
