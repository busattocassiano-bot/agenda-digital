import React, { useState, useMemo } from 'react';
import { Search, FileSpreadsheet, Printer, Calendar as CalendarIcon, ChevronDown, Edit, X, Save, FileEdit } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';

export default function Evolucoes() {
  const { pacientes, profissionais, evolucoes, addEvolucao, updateEvolucao, agendamentos, updateAgendamento, matriculas, updateMatricula, planos, servicos } = useAppData();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [evolucaoText, setEvolucaoText] = useState('');
  
  const [filterCliente, setFilterCliente] = useState('');
  const [filterProfissional, setFilterProfissional] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');
  const [activeDataInicial, setActiveDataInicial] = useState('');
  const [activeDataFinal, setActiveDataFinal] = useState('');

  const handleBuscar = () => {
    setActiveDataInicial(dataInicial);
    setActiveDataFinal(dataFinal);
  };

  // Lógica de Presença
  const handlePresencaInterna = (agendamentoId) => {
    const agendamento = agendamentos.find(a => a.id === agendamentoId);
    if (!agendamento || agendamento.presenca === 'presente') return; 
    
    updateAgendamento(agendamentoId, { presenca: 'presente' });
    
    if (agendamento.matriculaId) {
      const matricula = matriculas.find(m => m.id === agendamento.matriculaId);
      if (matricula && matricula.status !== 'Encerrada') {
        const plano = planos.find(p => p.nome === matricula.plano);
        if (plano) {
          const qtd = parseInt(plano.qtdSessoes);
          if (qtd === 1) {
            updateMatricula(matricula.id, { status: 'Encerrada' });
          } else if (qtd > 1) {
            const sessoesFeitas = (matricula.sessoesRealizadas || 0) + 1;
            if (sessoesFeitas >= qtd) {
              updateMatricula(matricula.id, { sessoesRealizadas: sessoesFeitas, status: 'Encerrada' });
            } else {
              updateMatricula(matricula.id, { sessoesRealizadas: sessoesFeitas });
            }
          }
        }
      }
    }
  };

  const combinedList = useMemo(() => {
    const pAgendamentos = agendamentos.filter(a => {
      if (a.servico === 'Reposição' || a.tipo === 'Reposicao') return false;
      
      const srv = servicos.find(s => s.id === a.servicoId || s.nome === a.servico);
      const requiresEvolucao = srv ? (srv.exigeEvolucao !== undefined ? srv.exigeEvolucao : !srv.nome.toLowerCase().includes('avalia')) : true;
      
      if (!requiresEvolucao) return false;
      
      return true;
    });

    const mappedAgendamentos = pAgendamentos.map(a => {
      let ev = evolucoes.find(e => e.idAgendamento === a.id);
      if (!ev) {
        ev = evolucoes.find(e => e.data === a.data.split('-').reverse().join('/') && e.clienteId === a.clienteId);
      }
      return {
        agendamento: a,
        evolucao: ev || null,
        dataParsed: new Date(a.data + 'T00:00:00')
      };
    });

    const standaloneEvolucoes = evolucoes.filter(e => 
      !mappedAgendamentos.some(ma => ma.evolucao && ma.evolucao.id === e.id)
    ).map(e => {
      const parts = e.data.split('/');
      let dateObj = new Date();
      if (parts.length === 3) dateObj = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00`);
      return {
        agendamento: null,
        evolucao: e,
        dataParsed: dateObj
      };
    });

    let full = [...mappedAgendamentos, ...standaloneEvolucoes];

    if (filterCliente) {
      full = full.filter(item => {
        const cliId = item.agendamento ? item.agendamento.clienteId : item.evolucao.clienteId;
        return cliId === filterCliente;
      });
    }

    if (filterProfissional) {
      full = full.filter(item => {
        const profId = item.agendamento ? item.agendamento.profissionalId : item.evolucao.profissionalId;
        return profId === filterProfissional;
      });
    }
    
    if (filterStatus) {
      const hoje = new Date();
      hoje.setHours(0,0,0,0);
      full = full.filter(item => {
        const hasEvolucao = !!item.evolucao;
        if (filterStatus === 'Preenchida') return hasEvolucao;
        if (filterStatus === 'Pendente') {
          if (hasEvolucao) return false;
          if (!item.agendamento) return false;
          const dataAgendamento = new Date(item.agendamento.data + 'T00:00:00');
          return dataAgendamento <= hoje;
        }
        if (filterStatus === 'Futura') {
          if (hasEvolucao) return false;
          if (!item.agendamento) return false;
          const dataAgendamento = new Date(item.agendamento.data + 'T00:00:00');
          return dataAgendamento > hoje;
        }
        return true;
      });
    }

    if (activeDataInicial) {
      const di = new Date(`${activeDataInicial}T00:00:00`);
      full = full.filter(item => item.dataParsed >= di);
    }
    
    if (activeDataFinal) {
      const df = new Date(`${activeDataFinal}T23:59:59`);
      full = full.filter(item => item.dataParsed <= df);
    }

    // Sort descending by date (newest first)
    full.sort((a, b) => b.dataParsed - a.dataParsed);

    return full;
  }, [agendamentos, evolucoes, filterCliente, filterProfissional, filterStatus, activeDataInicial, activeDataFinal]);

  const openModal = (item) => {
    setSelectedItem(item);
    setEvolucaoText(item.evolucao ? item.evolucao.descricao : '');
    setModalOpen(true);
  };

  const saveEvolucao = () => {
    if (!evolucaoText.trim()) {
      setModalOpen(false);
      return;
    }

    if (selectedItem.evolucao) {
      updateEvolucao(selectedItem.evolucao.id, { descricao: evolucaoText });
    } else if (selectedItem.agendamento) {
      const a = selectedItem.agendamento;
      const cli = pacientes.find(p => p.id === a.clienteId);
      const prof = profissionais.find(p => p.id === a.profissionalId);
      
      addEvolucao({
        idAgendamento: a.id,
        clienteId: a.clienteId,
        clienteNome: cli ? cli.nome : a.nomeNaoCadastrado,
        profissionalId: a.profissionalId,
        profissionalNome: prof ? prof.nome : 'Profissional',
        registro: prof ? prof.registro : '',
        data: a.data.split('-').reverse().join('/'),
        descricao: evolucaoText,
        status: 'Presença'
      });

      handlePresencaInterna(a.id);
    }
    setModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div className="card" style={{ padding: '24px' }}>
        
        <div className="flex-between" style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#1e293b' }}>Lista de Evoluções e Agendamentos</h2>
        </div>

        {/* Filters */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dark)', fontWeight: 600, fontSize: '0.9rem' }}>Cliente:</label>
            <div style={{ position: 'relative' }}>
              <select 
                value={filterCliente} onChange={(e) => setFilterCliente(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', color: 'var(--text-main)', background: 'white', appearance: 'none', cursor: 'pointer' }}
              >
                <option value="">Todos os clientes</option>
                {pacientes.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
              <ChevronDown size={16} color="var(--text-muted)" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dark)', fontWeight: 600, fontSize: '0.9rem' }}>Profissional:</label>
            <div style={{ position: 'relative' }}>
              <select 
                value={filterProfissional} onChange={(e) => setFilterProfissional(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', color: 'var(--text-main)', background: 'white', appearance: 'none', cursor: 'pointer' }}
              >
                <option value="">Todos os profissionais</option>
                {profissionais.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
              <ChevronDown size={16} color="var(--text-muted)" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dark)', fontWeight: 600, fontSize: '0.9rem' }}>Status:</label>
            <div style={{ position: 'relative' }}>
              <select 
                value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', color: 'var(--text-main)', background: 'white', appearance: 'none', cursor: 'pointer' }}
              >
                <option value="">Todos os status</option>
                <option value="Preenchida">Preenchida</option>
                <option value="Pendente">Pendente</option>
                <option value="Futura">Futura</option>
              </select>
              <ChevronDown size={16} color="var(--text-muted)" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dark)', fontWeight: 600, fontSize: '0.9rem' }}>Data inicial</label>
            <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', background: 'white' }}>
               <div style={{ background: '#cbd5e1', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                 <CalendarIcon size={18} />
               </div>
               <input type="date" value={dataInicial} onChange={(e) => setDataInicial(e.target.value)} style={{ flex: 1, border: 'none', padding: '12px 16px', outline: 'none', color: 'var(--text-main)', fontWeight: 500, fontFamily: 'inherit' }} />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dark)', fontWeight: 600, fontSize: '0.9rem' }}>Data final</label>
            <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', background: 'white' }}>
               <div style={{ background: '#cbd5e1', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                 <CalendarIcon size={18} />
               </div>
               <input type="date" value={dataFinal} onChange={(e) => setDataFinal(e.target.value)} style={{ flex: 1, border: 'none', padding: '12px 16px', outline: 'none', color: 'var(--text-main)', fontWeight: 500, fontFamily: 'inherit' }} />
            </div>
          </div>
          <div style={{ paddingBottom: '2px' }}>
            <button onClick={handleBuscar} style={{ background: '#38bdf8', color: 'white', border: 'none', borderRadius: '8px', padding: '12px 24px', fontWeight: 600, cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center', height: '46px' }}>
              <Search size={18} /> Buscar
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#0275d8', color: 'white' }}>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.95rem' }}>Cliente</th>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.95rem' }}>Profissional</th>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.95rem' }}>Serviço / Conselho</th>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.95rem' }}>Status da Evolução</th>
                <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.95rem', textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {combinedList.length === 0 ? (
                <tr style={{ background: 'white' }}>
                  <td colSpan="5" style={{ padding: '16px', color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.95rem' }}>Nenhum registro encontrado.</td>
                </tr>
              ) : (
                combinedList.map((item, idx) => {
                  const clienteNome = item.evolucao ? item.evolucao.clienteNome : (item.agendamento?.nomeNaoCadastrado || pacientes.find(p => p.id === item.agendamento?.clienteId)?.nome);
                  const dataStr = item.evolucao ? item.evolucao.data : item.agendamento?.data.split('-').reverse().join('/');
                  const profNome = item.evolucao ? item.evolucao.profissionalNome : profissionais.find(p => p.id === item.agendamento?.profissionalId)?.nome;
                  const servico = item.agendamento ? item.agendamento.servico : item.evolucao?.registro;
                  
                  const hasEvolucao = !!item.evolucao;
                  
                  let statusBadge = null;
                  if (hasEvolucao) {
                    statusBadge = <span style={{ background: '#22c55e', color: 'white', fontSize: '0.75rem', fontWeight: 700, padding: '4px 8px', borderRadius: '4px' }}>Preenchida</span>;
                  } else {
                    const dataAgendamento = new Date(item.agendamento.data + 'T00:00:00');
                    const hoje = new Date();
                    hoje.setHours(0,0,0,0);
                    if (dataAgendamento > hoje) {
                      statusBadge = <span style={{ background: '#e2e8f0', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, padding: '4px 8px', borderRadius: '4px' }}>Futura</span>;
                    } else {
                      statusBadge = <span style={{ background: '#f59e0b', color: 'white', fontSize: '0.75rem', fontWeight: 700, padding: '4px 8px', borderRadius: '4px' }}>Pendente</span>;
                    }
                  }

                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)', background: 'white' }}>
                      <td style={{ padding: '16px' }}>
                        <div style={{ color: 'var(--text-dark)', fontWeight: 600, fontSize: '0.95rem', marginBottom: '4px' }}>{clienteNome}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>{dataStr} {item.agendamento?.hora && `às ${item.agendamento.hora}`}</div>
                      </td>
                      <td style={{ padding: '16px', color: 'var(--text-dark)', fontSize: '0.95rem' }}>{profNome || 'Não informado'}</td>
                      <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>{servico}</td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                          {statusBadge}
                          {hasEvolucao && (
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              "{item.evolucao.descricao}"
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <button 
                          onClick={() => openModal(item)}
                          style={{ 
                            background: hasEvolucao ? '#f0f9ff' : '#f0fdf4', 
                            border: `1px solid ${hasEvolucao ? '#bae6fd' : '#bbf7d0'}`, 
                            cursor: 'pointer', 
                            color: hasEvolucao ? '#0ea5e9' : '#16a34a',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontWeight: 600,
                            fontSize: '0.85rem'
                          }}
                        >
                          {hasEvolucao ? <><Edit size={16} /> Editar</> : <><FileEdit size={16} /> Evoluir</>}
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Modal Adicionar/Editar Evolução */}
      {modalOpen && selectedItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', width: '900px', maxWidth: '95%', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            
            {/* Header */}
            <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', background: '#f8fafc' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileEdit size={18} strokeWidth={2.5} color="var(--primary-color)" />
                {selectedItem.evolucao ? 'Editar Evolução' : 'Registrar Nova Evolução'}
              </h2>
              <button 
                onClick={() => setModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '32px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              
              {/* Left Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b', textAlign: 'center', fontWeight: 700 }}>
                  {selectedItem.evolucao ? selectedItem.evolucao.clienteNome : (selectedItem.agendamento?.nomeNaoCadastrado || pacientes.find(p => p.id === selectedItem.agendamento?.clienteId)?.nome)}
                </h3>
                
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Data do Agendamento</label>
                    <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', background: '#f8fafc' }}>
                       <div style={{ background: '#cbd5e1', padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                         <CalendarIcon size={18} />
                       </div>
                       <input 
                         type="text" 
                         value={selectedItem.evolucao ? selectedItem.evolucao.data : selectedItem.agendamento?.data.split('-').reverse().join('/')} 
                         disabled 
                         style={{ flex: 1, border: 'none', padding: '10px 12px', outline: 'none', color: 'var(--text-muted)', fontWeight: 500, background: 'transparent' }} 
                       />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Serviço</label>
                    <input 
                      type="text" 
                      value={selectedItem.agendamento ? selectedItem.agendamento.servico : '-'}
                      disabled
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', color: 'var(--text-muted)', fontSize: '0.95rem', background: '#f8fafc' }} 
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Profissional</label>
                    <input 
                      type="text" 
                      value={selectedItem.evolucao ? selectedItem.evolucao.profissionalNome : profissionais.find(p => p.id === selectedItem.agendamento?.profissionalId)?.nome || ''}
                      disabled
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', color: 'var(--text-muted)', fontSize: '0.95rem', background: '#f8fafc', textOverflow: 'ellipsis' }} 
                    />
                  </div>
                </div>

                {!selectedItem.evolucao && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', color: '#166534', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <div style={{ marginTop: '2px' }}><Search size={14} /></div>
                    <span>Ao salvar esta evolução, a <strong>Presença</strong> será automaticamente confirmada para este paciente na agenda.</span>
                  </div>
                )}

              </div>

              {/* Right Column */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Descrição da Evolução</label>
                <textarea 
                  value={evolucaoText}
                  onChange={(e) => setEvolucaoText(e.target.value)}
                  placeholder="Descreva detalhadamente a evolução do paciente..."
                  style={{ flex: 1, minHeight: '150px', width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', color: 'var(--text-main)', fontSize: '0.95rem', resize: 'none' }}
                />
              </div>

            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', background: '#f8fafc' }}>
              <button 
                onClick={saveEvolucao}
                disabled={!evolucaoText.trim()}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '8px', 
                  background: evolucaoText.trim() ? '#16a34a' : '#94a3b8', 
                  color: 'white', border: 'none', borderRadius: '8px', padding: '10px 24px', fontWeight: 600, cursor: evolucaoText.trim() ? 'pointer' : 'not-allowed', fontSize: '0.95rem' 
                }}
              >
                <Save size={18} /> Salvar Evolução
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
