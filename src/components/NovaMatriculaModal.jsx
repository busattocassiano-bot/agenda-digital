import React, { useState, useEffect } from 'react';
import { Edit, X, User, Clock, Check } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { checkOverlapsAndCapacity } from '../utils/agendamentoUtils';

export default function NovaMatriculaModal({ isOpen, onClose, initialPacienteId = null }) {
  const { pacientes, planos, servicos, profissionais, agendamentos, addMatricula, addRecebimento, addAgendamento } = useAppData();

  const [pacienteId, setPacienteId] = useState('');
  const [modalidade, setModalidade] = useState('');
  const [planoSelecionado, setPlanoSelecionado] = useState('');
  const [valorPlano, setValorPlano] = useState('');
  const [diaVencimento, setDiaVencimento] = useState('10');
  const [profissionalId, setProfissionalId] = useState('');
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().split('T')[0]);
  const [dataFinal, setDataFinal] = useState('');
  const [avulsoHora, setAvulsoHora] = useState('08:00');
  const [avulsoHoraFim, setAvulsoHoraFim] = useState('09:00');
  const [diasRecorrentes, setDiasRecorrentes] = useState({
    1: { checked: false, hora: '08:00', horaFim: '09:00' },
    2: { checked: false, hora: '08:00', horaFim: '09:00' },
    3: { checked: false, hora: '08:00', horaFim: '09:00' },
    4: { checked: false, hora: '08:00', horaFim: '09:00' },
    5: { checked: false, hora: '08:00', horaFim: '09:00' },
    6: { checked: false, hora: '08:00', horaFim: '09:00' },
    0: { checked: false, hora: '08:00', horaFim: '09:00' },
  });

  useEffect(() => {
    if (isOpen) {
      setPacienteId(initialPacienteId || '');
      setModalidade('');
      setPlanoSelecionado('');
      setValorPlano('');
      setDiaVencimento('10');
      setProfissionalId('');
      setDataInicio(new Date().toISOString().split('T')[0]);
      setDataFinal('');
      setAvulsoHora('08:00');
      setAvulsoHoraFim('09:00');
      setDiasRecorrentes({
        1: { checked: false, hora: '08:00', horaFim: '09:00' },
        2: { checked: false, hora: '08:00', horaFim: '09:00' },
        3: { checked: false, hora: '08:00', horaFim: '09:00' },
        4: { checked: false, hora: '08:00', horaFim: '09:00' },
        5: { checked: false, hora: '08:00', horaFim: '09:00' },
        6: { checked: false, hora: '08:00', horaFim: '09:00' },
        0: { checked: false, hora: '08:00', horaFim: '09:00' },
      });
    }
  }, [isOpen, initialPacienteId]);

  const planoInfo = planoSelecionado ? planos.find(x => x.nome === planoSelecionado) : null;
  const isAulasFixas = planoInfo ? planoInfo.aulasFixas : false;
  const qtdSessoes = planoInfo ? planoInfo.qtdSessoes : null;
  const isRecorrenteOrPackage = isAulasFixas || (qtdSessoes > 0);

  const getHoraFim = (horaInicio, servicoNome) => {
    if (!horaInicio) return '';
    const servico = servicos.find(s => s.nome === servicoNome);
    const duracao = servico && servico.duracao ? parseInt(servico.duracao, 10) : 60;
    const [h, m] = horaInicio.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m + duracao, 0, 0);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (planoSelecionado) {
      const p = planos.find(x => x.nome === planoSelecionado);
      if (p && p.valor) {
        setValorPlano(p.valor.toString().replace('R$', '').trim());
      }
    }
  }, [planoSelecionado, planos]);

  const handleSaveMatricula = async () => {
    if (!pacienteId || !modalidade || !planoSelecionado) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    const paciente = pacientes.find(p => String(p.id) === String(pacienteId));
    
    if (!profissionalId) {
      alert("Selecione o Profissional Responsável.");
      return;
    }
    
    if (isRecorrenteOrPackage) {
      const hasDaysChecked = Object.values(diasRecorrentes).some(d => d.checked);
      if (!hasDaysChecked) {
        alert("Por favor, selecione pelo menos um dia da semana para os agendamentos.");
        return;
      }
      
      // Validação de conflitos e limite de pacientes
      let conflictResult = { hasConflict: false, message: '' };
      let current = new Date(dataInicio + 'T00:00:00');
      let count = 0;
      let limit = dataFinal 
        ? new Date(dataFinal + 'T23:59:59')
        : (qtdSessoes ? null : new Date(new Date(current).setFullYear(current.getFullYear() + 1)));
      
      let checkCurrent = new Date(current);
      let checkCount = 0;
      while ((!limit || checkCurrent <= limit) && (!qtdSessoes || checkCount < qtdSessoes)) {
        const day = checkCurrent.getDay();
        const recurrenceConfig = diasRecorrentes[day];
        if (recurrenceConfig && recurrenceConfig.checked) {
          const dataStr = checkCurrent.toISOString().split('T')[0];
          const result = checkOverlapsAndCapacity(agendamentos, {
            dataStr,
            hora: recurrenceConfig.hora,
            horaFim: recurrenceConfig.horaFim,
            profissionalId: profissionalId,
            servico: modalidade
          }, servicos);
          
          if (result.hasConflict) {
            conflictResult = result;
            break;
          }
          checkCount++;
        }
        checkCurrent.setDate(checkCurrent.getDate() + 1);
      }
      
      if (conflictResult.hasConflict) {
        alert(conflictResult.message);
        return;
      }
    } else {
      // Validação para avulso
      const result = checkOverlapsAndCapacity(agendamentos, {
        dataStr: dataInicio,
        hora: avulsoHora,
        horaFim: avulsoHoraFim,
        profissionalId: profissionalId,
        servico: modalidade
      }, servicos);
      
      if (result.hasConflict) {
        alert(result.message);
        return;
      }
    }

    const novaMatricula = {
      pacienteId: pacienteId,
      paciente: paciente ? paciente.nome : 'Desconhecido',
      modalidade: modalidade,
      plano: planoSelecionado,
      dataInicio: dataInicio,
      dataFinal: dataFinal,
      status: 'Ativa'
    };

    const novaMatriculaId = await addMatricula(novaMatricula);

    if (isRecorrenteOrPackage) {
      let current = new Date(dataInicio + 'T00:00:00');
      const limit = dataFinal 
        ? new Date(dataFinal + 'T23:59:59')
        : (qtdSessoes ? null : new Date(new Date(current).setFullYear(current.getFullYear() + 1)));

      let count = 0;
      
      while ((!limit || current <= limit) && (!qtdSessoes || count < qtdSessoes)) {
        const day = current.getDay();
        const recurrenceConfig = diasRecorrentes[day];
        
        if (recurrenceConfig && recurrenceConfig.checked) {
          addAgendamento({
            clienteId: pacienteId,
            matriculaId: novaMatriculaId,
            nomeNaoCadastrado: '',
            telefoneNaoCadastrado: '',
            profissionalId: profissionalId,
            servico: modalidade,
            data: current.toISOString().split('T')[0],
            hora: recurrenceConfig.hora,
            horaFim: recurrenceConfig.horaFim,
            isPacienteNaoCadastrado: false,
            status: 'agendado'
          });
          count++;
        }
        current.setDate(current.getDate() + 1);
      }
    } else {
      // Agendamento Único para Avulso
      addAgendamento({
        clienteId: pacienteId,
        matriculaId: novaMatriculaId,
        nomeNaoCadastrado: '',
        telefoneNaoCadastrado: '',
        profissionalId: profissionalId,
        servico: modalidade,
        data: dataInicio,
        hora: avulsoHora,
        horaFim: avulsoHoraFim,
        isPacienteNaoCadastrado: false,
        status: 'agendado'
      });
    }

    const plano = planos.find(x => x.nome === planoSelecionado);
    let parcelas = 1;
    if (plano) {
      const vig = plano.vigencia?.toLowerCase();
      if (vig === 'bimestral') parcelas = 2;
      else if (vig === 'trimestral') parcelas = 3;
      else if (vig === 'semestral') parcelas = 6;
      else if (vig === 'anual') parcelas = 12;
    }

    const valorFloat = parseFloat(valorPlano.replace('.', '').replace(',', '.')) || 0;
    const dataAtual = new Date();
    
    for (let i = 0; i < parcelas; i++) {
      const mesVencimento = dataAtual.getMonth() + i;
      const dataVenc = new Date(dataAtual.getFullYear(), mesVencimento, parseInt(diaVencimento));
      
      const novoRecebimento = {
        descricao: `Mensalidade ${modalidade} - ${paciente?.nome} (Parcela ${i+1}/${parcelas})`,
        dataVencimento: dataVenc.toISOString().split('T')[0],
        valor: valorFloat,
        status: 'PENDENTE',
        metodo: 'A Combinar',
        dataRecebimento: null,
        pacienteId: pacienteId,
        matriculaId: novaMatriculaId
      };

      addRecebimento(novoRecebimento);
    }

    alert(`Matrícula salva e ${parcelas} parcela(s) lançada(s) no Financeiro com sucesso!`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', borderRadius: '12px', width: '600px', maxWidth: '90%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', maxHeight: '90vh' }}>
        
        {/* Header */}
        <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--text-dark)', fontSize: '1rem' }}>
            <Edit size={18} />
            Nova matrícula
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
          
          {/* Progress Tracker */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#475569', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={24} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', letterSpacing: '0.5px' }}>ALUNO</span>
            </div>
            
            <div style={{ height: '2px', width: '80px', background: '#e2e8f0', margin: '0 12px', alignSelf: 'flex-start', marginTop: '24px' }}></div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f1f5f9', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={24} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.5px' }}>HORÁRIOS</span>
            </div>
          </div>

          {/* Form Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Aluno *</label>
              <select 
                value={pacienteId} 
                onChange={(e) => setPacienteId(e.target.value)} 
                disabled={!!initialPacienteId}
                style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', backgroundColor: initialPacienteId ? '#f1f5f9' : '#fff', color: 'var(--text-main)' }}
              >
                <option value="">- Selecione o Aluno -</option>
                {pacientes.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Serviço *</label>
                <select value={modalidade} onChange={(e) => {
                  const newModalidade = e.target.value;
                  const updatedDias = { ...diasRecorrentes };
                  for (let day in updatedDias) {
                    updatedDias[day].horaFim = getHoraFim(updatedDias[day].hora, newModalidade);
                  }
                  setAvulsoHoraFim(getHoraFim(avulsoHora, newModalidade));
                  setModalidade(newModalidade);
                  setDiasRecorrentes(updatedDias);
                }} style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', backgroundColor: '#fff', color: 'var(--text-main)' }}>
                  <option value="">- Selecione -</option>
                  {servicos.filter(s => !s.nome.toLowerCase().includes('avalia')).map(s => <option key={s.id} value={s.nome}>{s.nome}</option>)}
                </select>
              </div>
              
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Plano *</label>
                <select value={planoSelecionado} onChange={(e) => setPlanoSelecionado(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', backgroundColor: '#fff', color: 'var(--text-main)' }}>
                  <option value="">- Selecione -</option>
                  {planos.map(p => <option key={p.id} value={p.nome}>{p.nome}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Valor do Plano (R$)</label>
                <input type="text" value={valorPlano} onChange={(e) => setValorPlano(e.target.value)} placeholder="0,00" style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', backgroundColor: '#fff', color: 'var(--text-main)' }} />
              </div>
              
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Dia de Vencimento</label>
                <select value={diaVencimento} onChange={(e) => setDiaVencimento(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', backgroundColor: '#fff', color: 'var(--text-main)' }}>
                  {Array.from({length: 31}, (_, i) => i + 1).map(dia => (
                    <option key={dia} value={dia}>{dia}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ background: '#e0f2fe', padding: '16px', borderRadius: '8px', color: '#0369a1', fontSize: '0.85rem', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Check size={20} />
              <span>As parcelas deste plano serão geradas <strong>automaticamente</strong> no Contas a Receber após salvar.</span>
            </div>

            <div style={{ marginTop: '20px', padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Profissional Responsável: *</label>
                <select 
                  value={profissionalId} 
                  onChange={(e) => setProfissionalId(e.target.value)} 
                  style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', backgroundColor: '#fff', color: 'var(--text-main)' }}
                >
                  <option value="">- Selecione -</option>
                  {profissionais.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
              </div>

              {!isRecorrenteOrPackage && (
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Data da Sessão: *</label>
                    <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', backgroundColor: '#fff', color: 'var(--text-main)' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Início: *</label>
                    <input type="time" value={avulsoHora} onChange={(e) => {
                       const newHora = e.target.value;
                       setAvulsoHora(newHora);
                       setAvulsoHoraFim(getHoraFim(newHora, modalidade));
                    }} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', backgroundColor: '#fff', color: 'var(--text-main)' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Fim: *</label>
                    <input type="time" value={avulsoHoraFim} onChange={(e) => setAvulsoHoraFim(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', backgroundColor: '#fff', color: 'var(--text-main)' }} />
                  </div>
                </div>
              )}

              {isRecorrenteOrPackage && (
                <>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Data Início (1º Agendamento):</label>
                      <input 
                        type="date" 
                        value={dataInicio}
                        onChange={(e) => setDataInicio(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', backgroundColor: '#fff', color: 'var(--text-main)' }} 
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Data Fim (Opcional):</label>
                      <input 
                        type="date" 
                        value={dataFinal}
                        onChange={(e) => setDataFinal(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', backgroundColor: '#fff', color: 'var(--text-main)' }} 
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '12px' }}>Dias e Horários das Aulas:</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
                    {[1,2,3,4,5,6,0].map(day => {
                      const dayIndex = day.toString();
                      const label = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][day];
                      return (
                        <div key={day} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <input 
                            type="checkbox" 
                            checked={diasRecorrentes[dayIndex].checked}
                            onChange={(e) => setDiasRecorrentes({
                              ...diasRecorrentes,
                              [dayIndex]: { ...diasRecorrentes[dayIndex], checked: e.target.checked }
                            })}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                          />
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: diasRecorrentes[dayIndex].checked ? 600 : 400 }}>{label}</span>
                            {diasRecorrentes[dayIndex].checked && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <input 
                                  type="time" 
                                  value={diasRecorrentes[dayIndex].hora}
                                  onChange={(e) => {
                                    const newHora = e.target.value;
                                    const newHoraFim = getHoraFim(newHora, modalidade);
                                    setDiasRecorrentes({
                                      ...diasRecorrentes,
                                      [dayIndex]: { ...diasRecorrentes[dayIndex], hora: newHora, horaFim: newHoraFim }
                                    });
                                  }}
                                  style={{ padding: '4px 8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.8rem', outline: 'none' }}
                                />
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>até</span>
                                <input 
                                  type="time" 
                                  value={diasRecorrentes[dayIndex].horaFim || ''}
                                  onChange={(e) => setDiasRecorrentes({
                                    ...diasRecorrentes,
                                    [dayIndex]: { ...diasRecorrentes[dayIndex], horaFim: e.target.value }
                                  })}
                                  style={{ padding: '4px 8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.8rem', outline: 'none' }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                </>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', borderTop: '1px solid var(--border-color)' }}>
          <button onClick={handleSaveMatricula} style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 24px', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
            Salvar Matrícula e Gerar Cobranças{isRecorrenteOrPackage && ' e Agendamentos'}
          </button>
        </div>

      </div>
    </div>
  );
}
