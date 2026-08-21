import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, ChevronRight, Plus, RefreshCw, Filter, 
  LayoutList, LayoutGrid, Calendar as CalendarIcon, X, FileEdit, CheckCircle2, XCircle, User, CreditCard, AlertCircle
} from 'lucide-react';
import { 
  format, addDays, startOfWeek, endOfWeek, isSameDay, 
  addMinutes, startOfDay, setHours, parseISO, isAfter, isBefore, isWithinInterval,
  startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAppData } from '../context/AppDataContext';
import { useCompany } from '../context/CompanyContext';
import { checkOverlapsAndCapacity } from '../utils/agendamentoUtils';
import AvaliacaoWizardModal from '../components/AvaliacaoWizardModal';

export default function Agenda() {
  const { companyData } = useCompany();
  const { 
    agendamentos, setAgendamentos, addAgendamento, updateAgendamento, deleteAgendamento,
    pacientes, profissionais, servicos, recebimentos, addRecebimento, matriculas, feriados, addEvolucao
  } = useAppData();

  const [view, setView] = useState('tabela');
  const [interval, setInterval] = useState(30);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState('semana'); // 'dia', 'semana', 'mes'
  const [selectedProfissional, setSelectedProfissional] = useState('');

  // Modal states
  const [agendamentoModalOpen, setAgendamentoModalOpen] = useState(false);
  const [eventMenuOpen, setEventMenuOpen] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [wizardOpen, setWizardOpen] = useState(false);
  const [evolucaoAgendamento, setEvolucaoAgendamento] = useState(null);
  const [evolucaoText, setEvolucaoText] = useState('');
  
  // Agendamento form states
  const [tipoAgendamento, setTipoAgendamento] = useState('Normal');
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
  
  const [gerarCobrancaAvulsa, setGerarCobrancaAvulsa] = useState(false);
  const [diaVencimento, setDiaVencimento] = useState(5);
  const [valorAvulso, setValorAvulso] = useState(0);

  
  const handleServicoChange = (newServicoId) => {
    setServicoId(newServicoId);
    const srv = servicos.find(s => s.id === newServicoId);
    if (srv && srv.duracao) {
      if (horaInicio) {
        try {
          const [h, m] = horaInicio.split(':');
          const date = setHours(startOfDay(new Date()), parseInt(h));
          const withMin = addMinutes(date, parseInt(m));
          const end = addMinutes(withMin, parseInt(srv.duracao));
          setHoraFim(format(end, 'HH:mm'));
        } catch(e) {}
      }
      setValorAvulso(srv.valor || 0);
    }
  };

  const handleHoraInicioChange = (newHora) => {
    setHoraInicio(newHora);
    if (servicoId) {
      const srv = servicos.find(s => s.id === servicoId);
      if (srv && srv.duracao) {
        try {
          const [h, m] = newHora.split(':');
          const date = setHours(startOfDay(new Date()), parseInt(h));
          const withMin = addMinutes(date, parseInt(m));
          const end = addMinutes(withMin, parseInt(srv.duracao));
          setHoraFim(format(end, 'HH:mm'));
        } catch(e) {}
      }
    }
  };

  const handlePacienteNaoCadastradoChange = (checked) => {
    setIsPacienteNaoCadastrado(checked);
    if (checked) {
      const avaliacaoSrv = servicos.find(s => s.nome.toLowerCase().includes('avalia'));
      if (avaliacaoSrv) {
        handleServicoChange(avaliacaoSrv.id);
      }
    }
  };

  const selectedProfissionalData = profissionais.find(p => p.id === selectedProfissional);

  const getAniversariantesDoMes = () => {
    const monthIndex = currentDate.getMonth() + 1;
    const aniversariantes = pacientes.filter(p => {
      if (!p.dataNascimento) return false;
      const parts = p.dataNascimento.split('-');
      if (parts.length < 3) return false;
      return parseInt(parts[1]) === monthIndex;
    }).map(p => {
      const parts = p.dataNascimento.split('-');
      return { nome: p.nome, dia: parseInt(parts[2]) };
    }).sort((a, b) => a.dia - b.dia);
    return aniversariantes;
  };
  
  const aniversariantes = getAniversariantesDoMes();

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (calendarView === 'dia') newDate.setDate(newDate.getDate() + 1);
    else if (calendarView === 'semana') newDate.setDate(newDate.getDate() + 7);
    else newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const clientMatriculas = matriculas ? matriculas.filter(m => m.clienteId === clienteId) : [];

  // Navigation
  const prevDate = () => {
    if (calendarView === 'mes') setCurrentDate(addDays(currentDate, -30));
    else if (calendarView === 'semana') setCurrentDate(addDays(currentDate, -7));
    else setCurrentDate(addDays(currentDate, -1));
  };
  const nextDate = () => {
    if (calendarView === 'mes') setCurrentDate(addDays(currentDate, 30));
    else if (calendarView === 'semana') setCurrentDate(addDays(currentDate, 7));
    else setCurrentDate(addDays(currentDate, 1));
  };
  const goToday = () => setCurrentDate(new Date());

  // Generate days based on calendarView
  let days = [];
  if (calendarView === 'dia') {
    days = [currentDate];
  } else {
    // semana
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    for (let i = 0; i < 6; i++) {
      days.push(addDays(weekStart, i));
    }
  }

  // Generate month days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthGridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const monthGridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const monthDays = eachDayOfInterval({ start: monthGridStart, end: monthGridEnd });

  // Generate time slots based on companyData or fallback
  const startHour = companyData?.businessHoursStart ? parseInt(companyData.businessHoursStart.split(':')[0], 10) : 7;
  const endHour = companyData?.businessHoursEnd ? parseInt(companyData.businessHoursEnd.split(':')[0], 10) : 20;
  
  const startTime = setHours(startOfDay(currentDate), startHour);
  const endTime = setHours(startOfDay(currentDate), endHour);
  const timeSlots = [];
  let currentSlot = startTime;
  while (currentSlot <= endTime) {
    timeSlots.push(currentSlot);
    currentSlot = addMinutes(currentSlot, interval);
  }

  const handleOpenSlot = (day, time) => {
    // Check if it's a holiday first
    const dateStr = format(day, 'yyyy-MM-dd');
    const isHoliday = feriados?.find(f => f.data === dateStr);
    if (isHoliday) {
      alert(`Este dia é um feriado: ${isHoliday.descricao}. Não é possível agendar.`);
      return;
    }

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
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({ x: rect.left, y: rect.bottom + 5 });
    setEventMenuOpen(true);
  };

  const handleSaveAgendamento = () => {
    if (!dataInicio || !horaInicio || !horaFim) {
      alert("Preencha data e horários.");
      return;
    }
    if (!servicoId || !profissionalId) {
      alert("Selecione serviço e profissional.");
      return;
    }
    
    let finalClienteId = clienteId;
    let finalPacienteNome = "";
    
    if (isPacienteNaoCadastrado) {
        if (!nomePacienteNovo) {
            alert("Preencha o nome do paciente.");
            return;
        }
        finalPacienteNome = nomePacienteNovo;
    } else {
        if (!clienteId) {
            alert("Selecione um cliente.");
            return;
        }
        const p = pacientes.find(p => p.id === clienteId);
        finalPacienteNome = p ? p.nome : "";
    }

    const srv = servicos.find(s => s.id === servicoId);
    
    const proposed = {
        dataStr: dataInicio,
        hora: horaInicio,
        horaFim,
        profissionalId,
        servico: srv ? srv.nome : ''
    };

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
        nomePacienteNovo: isPacienteNaoCadastrado ? nomePacienteNovo : null,
        telefonePacienteNovo: isPacienteNaoCadastrado ? telefonePacienteNovo : null,
        servicoId,
        profissionalId,
        tipo: 'Agendamento',
        status: 'Agendado'
    };

    addAgendamento(payload);

    if (gerarCobrancaAvulsa) {
        addRecebimento({
            id: Date.now().toString(),
            dataEmissao: format(new Date(), 'yyyy-MM-dd'),
            dataVencimento: dataInicio,
            clienteId: isPacienteNaoCadastrado ? null : clienteId,
            valor: parseFloat(valorAvulso) || 0,
            status: 'Pendente',
            descricao: `Agendamento Avulso - ${srv ? srv.nome : ''}`
        });
    }

    setAgendamentoModalOpen(false);
  };

  const handleUpdateStatus = (newStatus) => {
    if (selectedAgendamento) {
      updateAgendamento(selectedAgendamento.id, { status: newStatus });
      
      if (newStatus === 'Realizado') {
        const srv = servicos.find(s => s.id === selectedAgendamento.servicoId);
        if (srv && srv.nome.toLowerCase().includes('avalia')) {
          setSelectedAgendamento(null);
        } else {
          setEvolucaoAgendamento(selectedAgendamento);
          setEvolucaoText('');
        }
      } else {
        setSelectedAgendamento(null);
      }
      setEventMenuOpen(false);
    }
  };
  
  const handleSaveEvolucao = () => {
    if (!evolucaoText.trim() || !evolucaoAgendamento) {
      setEvolucaoAgendamento(null);
      setSelectedAgendamento(null);
      return;
    }
    const a = evolucaoAgendamento;
    const cli = pacientes.find(p => p.id === a.clienteId);
    const prof = profissionais.find(p => p.id === a.profissionalId);
    addEvolucao({
      idAgendamento: a.id,
      clienteId: a.clienteId,
      clienteNome: cli ? cli.nome : a.nomePacienteNovo,
      profissionalId: a.profissionalId,
      profissionalNome: prof ? prof.nome : 'Profissional',
      registro: prof ? prof.registro : '',
      data: a.data.split('-').reverse().join('/'),
      descricao: evolucaoText,
      status: 'Presença'
    });
    setEvolucaoAgendamento(null);
    setSelectedAgendamento(null);
  };

  const isFeriado = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return feriados?.find(f => f.data === dateStr);
  };

  return (
    <div style={{ padding: '32px', height: '100vh', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', position: 'relative' }}>
      
              {/* Header and Controls */}
        <div className="flex-between" style={{ marginBottom: '24px', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', gap: '24px' }}>
                {aniversariantes.length > 0 && (
                    <div style={{
                        background: '#f2f5ed',
                        borderRadius: '8px',
                        padding: '12px 20px',
                        minWidth: '360px',
                        maxHeight: '240px',
                        overflowY: 'auto',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        border: '1px solid var(--border-color)'
                    }}>
                       <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>
                           Aniversariantes
                       </div>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                           {aniversariantes.map((a, i) => (
                               <div key={i} style={{ fontSize: '1rem', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                                   <strong style={{ background: 'var(--primary-color)', color: 'white', padding: '2px 8px', borderRadius: '4px' }}>{a.dia.toString().padStart(2, '0')}</strong> 
                                   <span>{a.nome.split(' ')[0]}</span>
                               </div>
                           ))}
                       </div>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '16px' }}>
              <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '4px' }}>
                <button 
                  onClick={() => setCalendarView('dia')}
                  style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', background: calendarView === 'dia' ? 'white' : 'transparent', fontWeight: calendarView === 'dia' ? 600 : 500, color: calendarView === 'dia' ? 'var(--text-dark)' : 'var(--text-muted)', boxShadow: calendarView === 'dia' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer' }}
                >Dia</button>
                <button 
                  onClick={() => setCalendarView('semana')}
                  style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', background: calendarView === 'semana' ? 'white' : 'transparent', fontWeight: calendarView === 'semana' ? 600 : 500, color: calendarView === 'semana' ? 'var(--text-dark)' : 'var(--text-muted)', boxShadow: calendarView === 'semana' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer' }}
                >Semana</button>
                <button 
                  onClick={() => setCalendarView('mes')}
                  style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', background: calendarView === 'mes' ? 'white' : 'transparent', fontWeight: calendarView === 'mes' ? 600 : 500, color: calendarView === 'mes' ? 'var(--text-dark)' : 'var(--text-muted)', boxShadow: calendarView === 'mes' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer' }}
                >Mês</button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={goToday} style={{ padding: '8px 16px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'white', cursor: 'pointer', fontWeight: 600, color: 'var(--text-dark)' }}>Hoje</button>
            
            <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: '8px', overflow: 'hidden' }}>
              <button onClick={prevDate} style={{ padding: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}><ChevronLeft size={18} /></button>
              <div style={{ padding: '8px 16px', fontWeight: 600, color: 'var(--text-dark)', fontSize: '1rem', minWidth: '180px', textAlign: 'center' }}>
                {calendarView === 'mes' ? (
                  format(currentDate, "MMMM yyyy", { locale: ptBR }).toUpperCase()
                ) : calendarView === 'dia' ? (
                  format(currentDate, "d 'de' MMMM", { locale: ptBR })
                ) : (
                  `De ${format(days[0], "d/MMM.", { locale: ptBR })} a ${format(days[days.length-1], "d/MMM./yyyy", { locale: ptBR })}`
                )}
              </div>
              <button onClick={nextDate} style={{ padding: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}><ChevronRight size={18} /></button>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => {
                setDataInicio(format(currentDate, 'yyyy-MM-dd'));
                setAgendamentoModalOpen(true);
              }} style={{ background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}><Plus size={18} /></button>
              <button style={{ background: '#f1f5f9', color: 'var(--text-main)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}><RefreshCw size={18} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Area */}
      {calendarView === 'mes' ? (
        <div className="card" style={{ flex: 1, padding: 0, display: 'flex', flexDirection: 'column' }}>
          {/* Days of Week Header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border-color)', background: '#f8fafc' }}>
            {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(d => (
              <div key={d} style={{ padding: '12px', textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.9rem' }}>{d}</div>
            ))}
          </div>
          {/* Month Grid */}
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: '1fr', overflowY: 'auto' }}>
            {monthDays.map((day, idx) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const dayAgendamentos = agendamentos.filter(a => a.data === dateStr && (!selectedProfissional || a.profissionalId === selectedProfissional));
              const feriado = isFeriado(day);

              return (
                <div key={idx} 
                  onClick={() => handleOpenSlot(day, setHours(startOfDay(day), 8))}
                  style={{ 
                    borderRight: '1px solid var(--border-color)', 
                    borderBottom: '1px solid var(--border-color)', 
                    padding: '8px',
                    background: !isSameMonth(day, currentDate) ? '#f8fafc' : 'white',
                    cursor: feriado ? 'not-allowed' : 'pointer',
                    minHeight: '100px'
                  }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ 
                      fontSize: '0.85rem', fontWeight: 600, color: !isSameMonth(day, currentDate) ? 'var(--text-muted)' : (isSameDay(day, new Date()) ? 'white' : 'var(--text-dark)'),
                      background: isSameDay(day, new Date()) ? 'var(--primary-color)' : 'transparent',
                      width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%'
                    }}>{format(day, 'd')}</span>
                    {feriado && (
                      <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{feriado.nome}</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {dayAgendamentos.slice(0, 3).map(a => {
                      const srv = servicos.find(s => s.id === a.servicoId);
                      const baseColor = srv?.cor || '#0ea5e9';
                      
                      return (
                      <div key={a.id} onClick={(e) => handleEventClick(e, a)} style={{ 
                        fontSize: '0.75rem', 
                        background: baseColor + '20', 
                        color: '#1e293b', 
                        borderLeft: `3px solid ${baseColor}`,
                        padding: '2px 4px', 
                        borderRadius: '4px', 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        fontWeight: 600
                      }}>
                        {a.status === 'Realizado' && <span style={{ background: '#22c55e', color: 'white', fontSize: '0.6rem', padding: '0 3px', borderRadius: '3px', marginRight: '4px' }}>Pr</span>}
                        {a.status === 'Falta' && <span style={{ background: '#ef4444', color: 'white', fontSize: '0.6rem', padding: '0 3px', borderRadius: '3px', marginRight: '4px' }}>F</span>}
                        {a.status === 'Falta Justificada' && <span style={{ background: '#f59e0b', color: 'white', fontSize: '0.6rem', padding: '0 3px', borderRadius: '3px', marginRight: '4px' }}>Fj</span>}
                        {a.hora} - {a.nomePacienteNovo || pacientes.find(p=>p.id===a.clienteId)?.nome}
                      </div>
                    )})}
                    {dayAgendamentos.length > 3 && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>+ {dayAgendamentos.length - 3} agendamentos</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="card" style={{ flex: 1, padding: 0, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', tableLayout: 'fixed' }}>
            <thead style={{ position: 'sticky', top: 0, background: 'white', zIndex: 10, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <tr>
                <th style={{ width: '80px', borderRight: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '16px 8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Hora</th>
                {days.map((day, idx) => {
                  const feriado = isFeriado(day);
                  return (
                  <th key={idx} style={{ 
                    borderRight: '1px solid var(--border-color)', 
                    borderBottom: '1px solid var(--border-color)', 
                    padding: '12px 8px',
                    background: isSameDay(day, new Date()) ? '#f8fafc' : 'white',
                    width: `calc(100% / ${days.length})`
                  }}>
                    <div style={{ fontWeight: 600, color: feriado ? '#ef4444' : 'var(--text-dark)', fontSize: '0.95rem' }}>{format(day, 'EEEE', { locale: ptBR }).split('-')[0]}</div>
                    <div style={{ fontWeight: 400, color: feriado ? '#f87171' : 'var(--text-muted)', fontSize: '0.85rem' }}>{format(day, 'dd/MMM.', { locale: ptBR })}</div>
                    {feriado && (
                      <div style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 700, marginTop: '4px' }}>{feriado.nome}</div>
                    )}
                  </th>
                )})}
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
                    const slotAgendamentos = agendamentos.filter(a => a.data === format(day, 'yyyy-MM-dd') && a.hora === format(time, 'HH:mm') && (!selectedProfissional || a.profissionalId === selectedProfissional));
                    const feriado = isFeriado(day);

                    return (
                      <td 
                        key={dayIdx} 
                        style={{ 
                          borderRight: '1px solid var(--border-color)', 
                          borderBottom: '1px solid var(--border-color)', 
                          height: '60px',
                          background: isSameDay(day, new Date()) ? '#f8fafc' : 'white',
                          cursor: feriado ? 'not-allowed' : 'pointer',
                          verticalAlign: 'top',
                          padding: '4px'
                        }}
                        onClick={() => handleOpenSlot(day, time)}
                      >
                        {!feriado && slotAgendamentos.map(a => {
                            const srv = servicos.find(s => s.id === a.servicoId);
                            const baseColor = srv?.cor || '#0ea5e9';
                            
                            return (
                            <div key={a.id} 
                                onClick={(e) => handleEventClick(e, a)}
                                style={{
                                    background: baseColor + '20',
                                    borderLeft: `4px solid ${baseColor}`,
                                    borderRadius: '4px',
                                    padding: '6px',
                                    marginBottom: '4px',
                                    fontSize: '0.75rem',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                    color: '#1e293b'
                                }}
                            >
                                <div style={{ fontWeight: 600, marginBottom: '2px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <span>{a.nomePacienteNovo || pacientes.find(p => p.id === a.clienteId)?.nome || 'Sem Nome'}</span>
                                  {a.status === 'Realizado' && (
                                    <span style={{ background: '#22c55e', color: 'white', fontSize: '0.65rem', padding: '1px 4px', borderRadius: '4px', fontWeight: 700 }}>Pr</span>
                                  )}
                                  {a.status === 'Falta' && (
                                    <span style={{ background: '#ef4444', color: 'white', fontSize: '0.65rem', padding: '1px 4px', borderRadius: '4px', fontWeight: 700 }}>F</span>
                                  )}
                                  {a.status === 'Falta Justificada' && (
                                    <span style={{ background: '#f59e0b', color: 'white', fontSize: '0.65rem', padding: '1px 4px', borderRadius: '4px', fontWeight: 700 }}>Fj</span>
                                  )}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#475569', opacity: 0.9 }}>
                                  {srv?.nome || 'Serviço'}
                                </div>
                            </div>
                        )})}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Floating Menu */}
      {eventMenuOpen && selectedAgendamento && (
        <>
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 }} onClick={() => setEventMenuOpen(false)}></div>
          <div style={{
            position: 'fixed',
            top: menuPosition.y,
            left: menuPosition.x,
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            border: '1px solid var(--border-color)',
            zIndex: 100,
            width: '220px',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', background: '#f8fafc' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-dark)' }}>Opções do Agendamento</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>Status atual: <span style={{ fontWeight: 600 }}>{selectedAgendamento.status}</span></div>
            </div>
            
            <div style={{ padding: '8px' }}>
              <button className="dropdown-item" onClick={() => handleUpdateStatus('Realizado')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', borderRadius: '6px', color: '#16a34a' }}>
                <CheckCircle2 size={16} /> Confirmar Presença
              </button>
              <button className="dropdown-item" onClick={() => handleUpdateStatus('Falta')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', borderRadius: '6px', color: '#ea580c' }}>
                <XCircle size={16} /> Marcar como Falta
              </button>
              <button className="dropdown-item" onClick={() => handleUpdateStatus('Falta Justificada')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', borderRadius: '6px', color: '#d97706' }}>
                <AlertCircle size={16} /> Falta Justificada
              </button>
              
              <div style={{ height: '1px', background: 'var(--border-color)', margin: '8px 0' }}></div>
              
              {!servicos.find(s => s.id === selectedAgendamento.servicoId)?.nome.toLowerCase().includes('avalia') && (
                <button className="dropdown-item" onClick={() => {
                  setWizardOpen(true);
                  setEventMenuOpen(false);
                }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', borderRadius: '6px', color: 'var(--text-main)' }}>
                  <Plus size={16} /> Novo Agendamento
                </button>
              )}

              {servicos.find(s => s.id === selectedAgendamento.servicoId)?.nome.toLowerCase().includes('avalia') && (
                  <button className="dropdown-item" onClick={() => {
                      setEventMenuOpen(false);
                      setWizardOpen(true);
                  }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', borderRadius: '6px', color: '#0284c7' }}>
                    <FileEdit size={16} /> {(!selectedAgendamento.clienteId || selectedAgendamento.nomePacienteNovo) ? 'Iniciar avaliação completa' : 'Nova Avaliação'}
                  </button>
              )}

              <div style={{ height: '1px', background: 'var(--border-color)', margin: '8px 0' }}></div>

              <button className="dropdown-item" onClick={() => {
                deleteAgendamento(selectedAgendamento.id);
                setEventMenuOpen(false);
                setSelectedAgendamento(null);
              }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', borderRadius: '6px', color: '#ef4444' }}>
                <X size={16} /> Excluir
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal Novo Agendamento */}
      {agendamentoModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ background: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-dark)' }}>Novo Agendamento</h2>
              <button onClick={() => setAgendamentoModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-dark)', fontWeight: 500 }}>
                    <input type="checkbox" checked={isPacienteNaoCadastrado} onChange={(e) => handlePacienteNaoCadastradoChange(e.target.checked)} />
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
                  <select style={{ padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px' }} value={servicoId} onChange={(e) => handleServicoChange(e.target.value)}>
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
                  <input type="time" style={{ padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px' }} value={horaInicio} onChange={(e) => handleHoraInicioChange(e.target.value)} />
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
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Valor (R$):</span>
                            <input type="number" step="0.01" value={valorAvulso} onChange={(e) => setValorAvulso(e.target.value)} style={{ width: '80px', padding: '6px 8px', border: '1px solid var(--border-color)', borderRadius: '6px' }} />
                        </div>
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

      {/* Avaliacao Wizard Modal */}
      {wizardOpen && selectedAgendamento && (
          <AvaliacaoWizardModal
              isOpen={wizardOpen}
              onClose={() => setWizardOpen(false)}
              agendamentoId={selectedAgendamento.id}
              initialNome={selectedAgendamento.nomePacienteNovo || ''}
              initialTelefone={selectedAgendamento.telefonePacienteNovo || ''}
              clienteId={selectedAgendamento.clienteId}
          />
      )}


      {evolucaoAgendamento && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ background: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-dark)' }}>Evolução do Paciente</h2>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                  {pacientes.find(p => p.id === evolucaoAgendamento.clienteId)?.nome || evolucaoAgendamento.nomePacienteNovo}
                </div>
              </div>
              <button onClick={() => { setEvolucaoAgendamento(null); setSelectedAgendamento(null); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <textarea 
              autoFocus
              placeholder="Digite a evolução da sessão..." 
              value={evolucaoText} 
              onChange={(e) => setEvolucaoText(e.target.value)}
              style={{ width: '100%', height: '150px', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', resize: 'none', outline: 'none', color: 'var(--text-main)' }} 
            />
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => { setEvolucaoAgendamento(null); setSelectedAgendamento(null); }} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'white', cursor: 'pointer', fontWeight: 500 }}>Pular</button>
              <button onClick={handleSaveEvolucao} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Salvar Evolução</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
