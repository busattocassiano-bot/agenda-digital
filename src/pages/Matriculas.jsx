import React, { useState, useEffect } from 'react';
import { Search, Filter, FileSpreadsheet, Plus, RefreshCw, Edit, X, User, Clock, Check, Trash2 } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import NovaMatriculaModal from '../components/NovaMatriculaModal';

export default function Matriculas() {
  const { pacientes, matriculas, servicos, planos, addMatricula, addRecebimento, profissionais, addAgendamento, agendamentos, deleteMatricula } = useAppData();
  const [modalOpen, setModalOpen] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Ativos');

  const filteredMatriculas = matriculas.filter(matricula => {
    const p = pacientes.find(pac => String(pac.id) === String(matricula.pacienteId));
    const nomeAluno = p ? p.nome : (matricula.paciente || 'Desconhecido');
    
    const matchesSearch = nomeAluno.toLowerCase().includes(searchTerm.toLowerCase());
    
    const isAtiva = matricula.status?.toLowerCase() === 'ativa' || matricula.status?.toLowerCase() === 'ativo';
    
    let matchesStatus = true;
    if (statusFilter === 'Ativos') matchesStatus = isAtiva;
    if (statusFilter === 'Inativos') matchesStatus = !isAtiva;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Search Area */}
      <div>
        <div style={{ display: 'flex', gap: '24px' }}>
          {/* Search Input */}
          <div style={{ flex: 2, display: 'flex', alignItems: 'center', background: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px 20px', gap: '12px', boxShadow: 'var(--shadow-sm)' }}>
            <Search size={20} color="#0ea5e9" style={{ strokeWidth: 2.5 }} />
            <span style={{ color: '#0ea5e9', fontWeight: 600, marginRight: '8px' }}>Pesquisar</span>
            <input 
              type="text" 
              placeholder="Informe o nome do Aluno" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', outline: 'none', flex: 1, fontSize: '1rem', color: 'var(--text-main)', background: 'transparent' }} 
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            )}
          </div>
          
          {/* Status Select */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px 20px', gap: '12px', boxShadow: 'var(--shadow-sm)' }}>
             <Filter size={20} color="var(--text-main)" />
             <span style={{ color: 'var(--text-main)', fontWeight: 600, marginRight: '8px' }}>Status</span>
             <select 
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
               style={{ border: 'none', outline: 'none', flex: 1, fontSize: '1rem', color: 'var(--text-main)', background: 'transparent', cursor: 'pointer' }}
             >
               <option value="Ativos">Ativos</option>
               <option value="Inativos">Inativos</option>
               <option value="Todos">Todos</option>
             </select>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="card" style={{ padding: '24px' }}>
        <div className="flex-between" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#1e293b' }}>Relação de Alunos e Matrículas</h2>
        </div>

        {filteredMatriculas.length === 0 ? (
          <div style={{ background: '#fef08a', color: '#854d0e', padding: '16px 20px', borderRadius: '8px', fontSize: '0.95rem' }}>
            <strong style={{ fontWeight: 700 }}>Atenção!</strong> <span style={{ fontWeight: 500 }}>Nenhum registro foi encontrado.</span>
          </div>
        ) : (
          <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Aluno</th>
                  <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Serviço</th>
                  <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Plano</th>
                  <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Data Início</th>
                  <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                  <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredMatriculas.map(matricula => {
                  const p = pacientes.find(pac => String(pac.id) === String(matricula.pacienteId));
                  const nomeAluno = p ? p.nome : (matricula.paciente || 'Desconhecido');
                  const isAtiva = matricula.status?.toLowerCase() === 'ativa' || matricula.status?.toLowerCase() === 'ativo';

                  return (
                    <tr key={matricula.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '16px', color: 'var(--text-dark)', fontWeight: 500, fontSize: '0.95rem' }}>
                        <div>{nomeAluno}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px', fontSize: '0.75rem' }}>
                          <span style={{ background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '999px' }}>ID: {matricula.id}</span>
                          <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '999px', fontWeight: 600 }}>
                            Agenda: {(agendamentos || []).filter(a => String(a.matriculaId) === String(matricula.id)).length} agendamentos
                          </span>
                          {!p && (
                            <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: '999px', fontWeight: 700 }}>
                              ⚠️ Paciente excluído (sobrando)
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '16px', color: 'var(--text-main)', fontSize: '0.95rem' }}>{matricula.modalidade || matricula.servico || '-'}</td>
                      <td style={{ padding: '16px', color: 'var(--text-main)', fontSize: '0.95rem' }}>{matricula.plano || '-'}</td>
                      <td style={{ padding: '16px', color: 'var(--text-main)', fontSize: '0.95rem' }}>{matricula.dataInicio ? matricula.dataInicio.split('-').reverse().join('/') : '-'}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ background: isAtiva ? '#dcfce7' : '#f1f5f9', color: isAtiva ? '#166534' : '#475569', padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>
                          {matricula.status ? matricula.status.charAt(0).toUpperCase() + matricula.status.slice(1).toLowerCase() : 'Ativa'}
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <button
                          onClick={() => { if (window.confirm('Tem certeza que deseja excluir esta matrícula e seus agendamentos/cobranças vinculados?')) deleteMatricula(matricula.id); }}
                          style={{ background: '#fef2f2', border: 'none', padding: '8px', borderRadius: '6px', color: '#ef4444', cursor: 'pointer' }}
                          title="Excluir Matrícula"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Nova Matrícula Modal */}
      <NovaMatriculaModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
      />

    </div>
  );
}
