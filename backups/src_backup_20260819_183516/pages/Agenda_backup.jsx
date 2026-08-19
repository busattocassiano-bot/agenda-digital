import React, { useState, useMemo, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, Plus, RefreshCw, Filter, 
  LayoutList, LayoutGrid, Calendar as CalendarIcon, X, FileEdit, CheckCircle2, XCircle, User, CreditCard
} from 'lucide-react';
import { 
  format, addDays, startOfWeek, endOfWeek, isSameDay, 
  addMinutes, startOfDay, setHours, parseISO, isAfter, isBefore, isWithinInterval
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAppData } from '../context/AppDataContext';
import { checkOverlapsAndCapacity } from '../utils/agendamentoUtils';

export default function Agenda() {
  const { 
    agendamentos, setAgendamentos, addAgendamento, updateAgendamento, deleteAgendamento,
    pacientes, profissionais, servicos, recebimentos, addRecebimento, matriculas
  } = useAppData();

  const [view, setView] = useState('tabela');
  const [interval, setInterval] = useState(15);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState('semana');

  // Modal states
  const [agendamentoModalOpen, setAgendamentoModalOpen] = useState(false);
  const [eventMenuOpen, setEventMenuOpen] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  
  // Agendamento form states
  const [tipoAgendamento, setTipoAgendamento] = useState('Normal'); // Normal, Avaliação
  const [isPacienteNaoCadastrado, setIsPacienteNaoCadastrado] = useState(false);
  const [clienteId, setClienteId] = useState('');
  const [matriculaId, setMatriculaId] = useState('');
  const [nomePacienteNovo, setNomePacienteNovo] = useState('');
  const [telefonePacienteNovo, setTelefonePacienteNovo] = useState('');
  
  const [servicoId, setServicoId] = useState('');
  const [profissionalId, setProfissionalId] = useState('');
  
  const [dataInicio, setDataInicio] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [horaFim, setHoraFim] = useState('09:00');
  const [recorrente, setRecorrente] = useState(false);
  
  // Vencimento and cobrança
  const [gerarCobrancaAvulsa, setGerarCobrancaAvulsa] = useState(false);
  const [diaVencimento, setDiaVencimento] = useState('10');

  // Generate week days
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  
  const days = [];
  for (let i = 0; i < 6; i++) {
    days.push(addDays(weekStart, i));
  }

  // Generate time slots
  const startTime = setHours(startOfDay(currentDate), 5);
  const endTime = setHours(startOfDay(currentDate), 22);
  const timeSlots = [];
  let currentSlot = startTime;
  while (currentSlot <= endTime) {
    timeSlots.push(currentSlot);
    currentSlot = addMinutes(currentSlot, interval);
  }

  const handleOpenSlot = (day, time) => {
    setDataInicio(format(day, 'yyyy-MM-dd'));
    setHoraInicio(format(time, 'HH:mm'));
    setHoraFim(format(addMinutes(time, 60), 'HH:mm'));
    setAgendamentoModalOpen(true);
    setIsPacienteNaoCadastrado(false);
    setEventMenuOpen(false);
  };

  const handleEventClick = (e, agendamento) => {
    e.stopPropagation();
    setSelectedAgendamento(agendamento);
    setMenuPosition({ x: e.clientX, y: e.clientY });
    setEventMenuOpen(true);
  };

  const handleSaveAgendamento = () => {
    if (!isPacienteNaoCadastrado && !clienteId) {
        alert("Selecione um paciente ou marque 'Paciente não cadastrado'");
        return;
    }
    if (!servicoId || !profissionalId) {
        alert("Selecione serviço e profissional");
        return;
    }

    // Capacity Check
    const servicoObj = servicos.find(s => s.id === servicoId);
    const proposed = {
        dataStr: dataInicio,
        hora: horaInicio,
        horaFim: horaFim,
        profissionalId: profissionalId,
        servico: servicoObj ? servicoObj.nome : ''
    };
    
    // Check overlaps
    const checkResult = checkOverlapsAndCapacity(agendamentos, proposed, servicos);
    if (checkResult.hasConflict) {
        alert(checkResult.message);
        return;
    }

    const payload = {
        id: Date.now().toString(),
        data: dataInicio,
        hora: horaInicio,
        horaFim,
        clienteId: isPacienteNaoCadastrado ? null : clienteId,
        matriculaId: isPacienteNaoCadastrado ? null : matriculaId,
        nomePacienteNovo: isPacienteNaoCadastrado ? nomePacienteNovo : '',
        telefonePacienteNovo: isPacienteNaoCadastrado ? telefonePacienteNovo : '',
        isPacienteNaoCadastrado,
        servico: servicoObj ? servicoObj.nome : '',
        profissionalId,
        tipo: tipoAgendamento,
        status: 'agendado',
        recorrente
    };

    addAgendamento(payload);

    if (gerarCobrancaAvulsa) {
        addRecebimento({
            id: Date.now().toString() + "_rec",
            descricao: `Cobrança Avulsa - Agendamento`,
            clienteId: isPacienteNaoCadastrado ? null : clienteId,
            valor: servicos.find(s => s.id === servicoId)?.valor || 0,
            dataVencimento: `${dataInicio.substring(0,8)}${diaVencimento.padStart(2, '0')}`,
            status: 'pendente'
        });
    }

    setAgendamentoModalOpen(false);
    setIsPacienteNaoCadastrado(false);
    setClienteId('');
    setMatriculaId('');
    setNomePacienteNovo('');
  };

  const nextWeek = () => setCurrentDate(addDays(currentDate, 7));
  const prevWeek = () => setCurrentDate(addDays(currentDate, -7));
  const goToday = () => setCurrentDate(new Date());

  const clientMatriculas = matriculas ? matriculas.filter(m => m.clienteId === clienteId) : [];

  return (
    <div className="agenda-page" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }} onClick={() => setEventMenuOpen(false)}>
      
      {/* Top Controls Area */}
      <div className="card" style={{ padding: '16px 24px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Row 1: View Toggles & Intervals */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '4px' }}>
            <button 
              onClick={() => setView('tabela')}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 16px', border: 'none', 
                borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                background: view === 'tabela' ? 'var(--primary-color)' : 'transparent',
                color: view === 'tabela' ? 'white' : 'var(--text-muted)'
              }}
            >
              <LayoutList size={16} /> Tabela
            </button>
            <button 
              onClick={() => setView('cards')}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 16px', border: 'none', 
                borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                background: view === 'cards' ? 'var(--primary-color)' : 'transparent',
                color: view === 'cards' ? 'white' : 'var(--text-muted)'
              }}
            >
              <LayoutGrid size={16} /> Cards
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {[15, 30, 60].map(min => (
              <button 
                key={min}
                onClick={() => setInterval(min)}
                style={{
                  padding: '6px 12px', border: 'none', borderRadius: '16px', cursor: 'pointer',
                  fontWeight: 600, fontSize: '0.85rem',
                  background: interval === min ? 'var(--success)' : 'transparent',
                  color: interval === min ? 'white' : 'var(--success)'
                }}
              >
                {min} min
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Date Nav, Filters, Actions */}
        <div className="flex-between">
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ fontWeight: 600, color: 'var(--text-dark)' }}>
              De {format(weekStart, "d/MMM.", { locale: ptBR })} a {format(weekEnd, "d/MMM./yyyy", { locale: ptBR })}
            </div>
            <select className="form-control" style={{ width: '200px', padding: '8px 12px' }}>
              <option value="">Todos os Serviços</option>
              {servicos.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: '8px', overflow: 'hidden' }}>
              <button onClick={prevWeek} style={{ padding: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}><ChevronLeft size={18} /></button>
              <button onClick={goToday} style={{ padding: '8px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 600, color: 'var(--primary-color)' }}>Hoje</button>
              <button onClick={nextWeek} style={{ padding: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}><ChevronRight size={18} /></button>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => {
                setDataInicio(format(new Date(), 'yyyy-MM-dd'));
                setAgendamentoModalOpen(true);
              }} style={{ background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}><Plus size={18} /></button>
              <button style={{ background: '#f1f5f9', color: 'var(--text-main)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}><RefreshCw size={18} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="card" style={{ flex: 1, padding: 0, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
          <thead style={{ position: 'sticky', top: 0, background: 'white', zIndex: 10, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <tr>
              <th style={{ width: '80px', borderRight: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '16px 8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Hora</th>
              {days.map((day, idx) => (
                <th key={idx} style={{ 
                  borderRight: '1px solid var(--border-color)', 
                  borderBottom: '1px solid var(--border-color)', 
                  padding: '12px 8px',
                  background: isSameDay(day, currentDate) ? '#f8fafc' : 'white'
                }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.95rem' }}>{format(day, 'EEEE', { locale: ptBR }).split('-')[0]}</div>
                  <div style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{format(day, 'dd/MMM.', { locale: ptBR })}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((time, idx) => (
              <tr key={idx}>
                <td style={{ 
                  borderRight: '1px solid var(--border-color)', 
                  borderBottom: '1px solid var(--border-color)', 
                  padding: '8px', 
                  fontSize: '0.85rem', 
                  color: 'var(--text-muted)',
                  fontWeight: 500
                }}>
                  {format(time, 'HH:mm')}
                </td>
                {days.map((day, dayIdx) => {
                    const slotAgendamentos = agendamentos.filter(a => a.data === format(day, 'yyyy-MM-dd') && a.hora === format(time, 'HH:mm'));

                    return (
                    <td 
                        key={dayIdx} 
                        style={{ 
                        borderRight: '1px solid var(--border-color)', 
                        borderBottom: '1px solid var(--border-color)', 
                        height: '60px',
                        background: isSameDay(day, currentDate) ? '#f8fafc' : 'white',
                        cursor: 'pointer',
                        verticalAlign: 'top',
                        padding: '4px'
                        }}
                        onClick={() => handleOpenSlot(day, time)}
                    >
                        {slotAgendamentos.map(a => (
                            <div key={a.id} 
                                onClick={(e) => handleEventClick(e, a)}
                                style={{
                                background: a.isPacienteNaoCadastrado ? '#fee2e2' : 'var(--primary-color)',
                                color: a.isPacienteNaoCadastrado ? '#991b1b' : 'white',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                marginBottom: '4px',
                                textAlign: 'left',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <strong style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                    {a.isPacienteNaoCadastrado ? a.nomePacienteNovo : (pacientes.find(p => p.id === a.clienteId)?.nome || 'Paciente')}
                                </strong>
                                <span>{a.hora} - {a.horaFim}</span>
                                {a.isPacienteNaoCadastrado && <span style={{ fontWeight: 'bold', marginTop: '2px', color: '#b91c1c' }}>* Não Cadastrado</span>}
                            </div>
                        ))}
                    </td>
                    )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Popover Menu */}
      {eventMenuOpen && selectedAgendamento && (
        <div style={{
            position: 'fixed',
            top: menuPosition.y + 10,
            left: menuPosition.x + 10,
            background: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            borderRadius: '8px',
            padding: '8px 0',
            zIndex: 1000,
            minWidth: '200px',
            display: 'flex',
            flexDirection: 'column'
        }} onClick={(e) => e.stopPropagation()}>
            {selectedAgendamento.isPacienteNaoCadastrado ? (
                <button style={{ padding: '10px 16px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center', color: '#f59e0b', fontWeight: 500 }}>
                    <FileEdit size={16} /> Avaliação Completa
                </button>
            ) : (
                <button style={{ padding: '10px 16px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center', color: '#8b5cf6', fontWeight: 500 }}>
                    <FileEdit size={16} /> Nova Avaliação
                </button>
            )}
            <button style={{ padding: '10px 16px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center', color: '#22c55e', fontWeight: 500 }}>
                <CheckCircle2 size={16} /> Marcar Presença
            </button>
            <button style={{ padding: '10px 16px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center', color: '#ef4444', fontWeight: 500 }}>
                <XCircle size={16} /> Marcar Falta
            </button>
            <button style={{ padding: '10px 16px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center', color: '#0ea5e9', fontWeight: 500 }}>
                <CreditCard size={16} /> Baixar Pagamento
            </button>
        </div>
      )}

      {/* Modal Novo Agendamento */}
      {agendamentoModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', width: '550px', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-dark)' }}>Novo Agendamento</h2>
              <button onClick={() => setAgendamentoModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-dark)', fontWeight: 500 }}>
                    <input type="checkbox" checked={isPacienteNaoCadastrado} onChange={(e) => setIsPacienteNaoCadastrado(e.target.checked)} />
                    Paciente não cadastrado
                </label>
            </div>

            {!isPacienteNaoCadastrado ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>Cliente</label>
                    </div>
                    <select style={{ padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px' }} value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
                      <option value="">Selecione o Cliente...</option>
                      {pacientes.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                    </select>
                  </div>
                  {clienteId && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>Plano / Matrícula</label>
                        <select style={{ padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px' }} value={matriculaId} onChange={(e) => setMatriculaId(e.target.value)}>
                            <option value="">Nenhuma Matrícula (Avulso)</option>
                            {clientMatriculas.map(m => <option key={m.id} value={m.id}>{m.plano} - {m.status}</option>)}
                        </select>
                    </div>
                  )}
                </div>
            ) : (
                <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>Nome Completo</label>
                        <input type="text" style={{ padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px' }} value={nomePacienteNovo} onChange={(e) => setNomePacienteNovo(e.target.value)} />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>Telefone</label>
                        <input type="text" style={{ padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px' }} value={telefonePacienteNovo} onChange={(e) => setTelefonePacienteNovo(e.target.value)} />
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>Serviço</label>
                  <select style={{ padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px' }} value={servicoId} onChange={(e) => setServicoId(e.target.value)}>
                    <option value="">Selecione...</option>
                    {servicos.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>Profissional</label>
                  <select style={{ padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px' }} value={profissionalId} onChange={(e) => setProfissionalId(e.target.value)}>
                    <option value="">Selecione...</option>
                    {profissionais.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                  </select>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>Data</label>
                  <input type="date" style={{ padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px' }} value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>Início</label>
                  <input type="time" style={{ padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px' }} value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>Fim</label>
                  <input type="time" style={{ padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px' }} value={horaFim} onChange={(e) => setHoraFim(e.target.value)} />
                </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-dark)' }}>
                    <input type="checkbox" checked={gerarCobrancaAvulsa} onChange={(e) => setGerarCobrancaAvulsa(e.target.checked)} />
                    Gerar Cobrança Avulsa
                </label>
                {gerarCobrancaAvulsa && (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Dia do Vencimento:</span>
                        <input type="number" min="1" max="31" value={diaVencimento} onChange={(e) => setDiaVencimento(e.target.value)} style={{ width: '60px', padding: '6px 8px', border: '1px solid var(--border-color)', borderRadius: '6px' }} />
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button onClick={() => setAgendamentoModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'white', cursor: 'pointer', fontWeight: 500 }}>Cancelar</button>
              <button onClick={handleSaveAgendamento} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Salvar Agendamento</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
