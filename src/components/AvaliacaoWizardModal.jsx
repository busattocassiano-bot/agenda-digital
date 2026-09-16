import React, { useState, useEffect } from 'react';
import { X, Check, ChevronRight, User, Stethoscope, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { maskCpf, maskTelefone, maskCep } from '../utils/masks';
import { checkOverlapsAndCapacity } from '../utils/agendamentoUtils';
import RichTextEditor from './RichTextEditor';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,0,0,0.9)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '20px', whiteSpace: 'pre-wrap' }}>
          <h2>Erro na tela:</h2>
          <pre>{this.state.error?.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function AvaliacaoWizardModalInner({ isOpen, onClose, agendamentoId, clienteId, initialNome, initialTelefone }) {
  const { addPaciente, updatePaciente, addAvaliacao, addMatricula, addRecebimento, updateAgendamento, addAgendamento, servicos, planos, profissionais, agendamentos, pacientes } = useAppData();
  
  const [step, setStep] = useState(1);
    // Step 1: Cadastro
  const [pacienteData, setPacienteData] = useState(() => {
    if (clienteId) {
      const existing = pacientes.find(p => String(p.id) === String(clienteId));
      if (existing) {
        return {
          ...existing,
          nome: existing.nome || initialNome || '',
          telefone: existing.telefone || initialTelefone || '',
          endereco: existing.endereco || { logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '' }
        };
      }
    }
    return {
    nome: initialNome || '',
    telefone: initialTelefone || '',
    cpf: '',
    profissao: '',
    genero: '',
    estadoCivil: '',
    contatoEmergencia: '',
    dataNascimento: '',
    cep: '',
    endereco: { logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '' },
    dataCadastro: new Date().toISOString().split('T')[0],
    statusAtivo: true,
    comoConheceu: '',
    observacao: ''
    };
  });

  // Step 2: Avaliação
  const [avaliacaoData, setAvaliacaoData] = useState({
    queixaPrincipal: '',
    habitosVida: '',
    expectativas: '',
    planoTratamento: ''
  });

  // Step 3: Matrícula
  const [matriculaData, setMatriculaData] = useState({
    modalidade: '',
    plano: '',
    valor: '',
    diaVencimento: '10',
    dataInicio: new Date().toISOString().split('T')[0],
    dataFinal: '',
    profissionalId: '',
    avulsoHora: '08:00',
    avulsoHoraFim: '09:00',
    diasRecorrentes: {
      1: { checked: false, hora: '08:00', horaFim: '09:00' },
      2: { checked: false, hora: '08:00', horaFim: '09:00' },
      3: { checked: false, hora: '08:00', horaFim: '09:00' },
      4: { checked: false, hora: '08:00', horaFim: '09:00' },
      5: { checked: false, hora: '08:00', horaFim: '09:00' },
      6: { checked: false, hora: '08:00', horaFim: '09:00' },
      0: { checked: false, hora: '08:00', horaFim: '09:00' },
    }
  });

  const planoSelecionado = matriculaData.plano ? planos.find(p => p.nome === matriculaData.plano) : null;
  const isAulasFixas = planoSelecionado ? planoSelecionado.aulasFixas : false;
  const qtdSessoes = planoSelecionado ? planoSelecionado.qtdSessoes : null;
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

  const [isEditingCadastro, setIsEditingCadastro] = useState(!clienteId);

  useEffect(() => {
    if (isOpen) {
      let nextStep = 1;
      let agendamentoProfissionalId = '';
      if (agendamentoId) {
          const ag = agendamentos.find(a => String(a.id) === String(agendamentoId));
          if (ag) {
              agendamentoProfissionalId = ag.profissionalId || '';
          }
      }
      
      let initialPacienteData = {
        nome: initialNome || '',
        telefone: initialTelefone || '',
        cpf: '',
        profissao: '',
        genero: '',
        estadoCivil: '',
        contatoEmergencia: '',
        dataNascimento: '',
        cep: '',
        endereco: { logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '' },
        dataCadastro: new Date().toISOString().split('T')[0],
        statusAtivo: true,
        comoConheceu: '',
        observacao: ''
      };

      if (clienteId) {
        const existingPaciente = pacientes.find(p => String(p.id) === String(clienteId));
        if (existingPaciente) {
          nextStep = 1; // Começa sempre do passo 1 para revisar os dados
          setIsEditingCadastro(false);
          initialPacienteData = { 
            ...initialPacienteData, 
            ...existingPaciente,
            endereco: {
              ...initialPacienteData.endereco,
              ...(existingPaciente.endereco || {})
            }
          };
        } else {
          setIsEditingCadastro(true);
        }
      } else {
        setIsEditingCadastro(true);
      }

      setStep(nextStep);
      setPacienteData(initialPacienteData);
      setAvaliacaoData({
        queixaPrincipal: '',
        habitosVida: '',
        expectativas: '',
        planoTratamento: ''
      });
      setMatriculaData({
        modalidade: '',
        plano: '',
        valor: '',
        diaVencimento: '10',
        dataInicio: new Date().toISOString().split('T')[0],
        dataFinal: '',
        profissionalId: agendamentoProfissionalId,
        avulsoHora: '08:00',
        avulsoHoraFim: '09:00',
        diasRecorrentes: {
          1: { checked: false, hora: '08:00', horaFim: '09:00' },
          2: { checked: false, hora: '08:00', horaFim: '09:00' },
          3: { checked: false, hora: '08:00', horaFim: '09:00' },
          4: { checked: false, hora: '08:00', horaFim: '09:00' },
          5: { checked: false, hora: '08:00', horaFim: '09:00' },
          6: { checked: false, hora: '08:00', horaFim: '09:00' },
          0: { checked: false, hora: '08:00', horaFim: '09:00' },
        }
      });
    }
  }, [isOpen, initialNome, initialTelefone]);

  if (!isOpen) return null;

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleSkipMatricula = async () => {
    try {
      await concluirFluxo(false);
    } catch (err) {
      alert("Erro ao Salvar: " + err.message);
      console.error(err);
    }
  };

  const handleFinish = async () => {
    if (!matriculaData.plano || !matriculaData.modalidade) {
      alert("Por favor, selecione o plano e serviço para prosseguir com a matrícula.\nOu clique em 'Pular Matrícula' se não desejar cadastrar um plano agora.");
      return;
    }
    if (isRecorrenteOrPackage && !matriculaData.profissionalId) {
      alert("Por favor, selecione o profissional responsável para gerar os agendamentos.");
      return;
    }
    if (isRecorrenteOrPackage) {
      const hasDaysChecked = Object.values(matriculaData.diasRecorrentes).some(d => d.checked);
      if (!hasDaysChecked) {
        alert("Por favor, selecione pelo menos um dia da semana para os agendamentos.");
        return;
      }
      
      // Validação de conflitos e limite de pacientes
      let conflictResult = { hasConflict: false, message: '' };
      let current = new Date(matriculaData.dataInicio + 'T00:00:00');
      let count = 0;
      let limit = matriculaData.dataFinal 
        ? new Date(matriculaData.dataFinal + 'T23:59:59')
        : (qtdSessoes ? null : new Date(new Date(current).setFullYear(current.getFullYear() + 1)));
      
      let checkCurrent = new Date(current);
      let checkCount = 0;
      while ((!limit || checkCurrent <= limit) && (!qtdSessoes || checkCount < qtdSessoes)) {
        const day = checkCurrent.getDay();
        const recurrenceConfig = matriculaData.diasRecorrentes[day];
        if (recurrenceConfig && recurrenceConfig.checked) {
          const dataStr = checkCurrent.toISOString().split('T')[0];
          const result = checkOverlapsAndCapacity(agendamentos, {
            dataStr,
            hora: recurrenceConfig.hora,
            horaFim: recurrenceConfig.horaFim,
            profissionalId: matriculaData.profissionalId,
            servico: matriculaData.modalidade
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
        dataStr: matriculaData.dataInicio,
        hora: matriculaData.avulsoHora,
        horaFim: matriculaData.avulsoHoraFim,
        profissionalId: matriculaData.profissionalId,
        servico: matriculaData.modalidade
      }, servicos);
      
      if (result.hasConflict) {
        alert(result.message);
        return;
      }
    }

    try {
      await concluirFluxo(true);
    } catch (err) {
      alert("Erro ao Salvar: " + err.message);
      console.error(err);
    }
  };

  const concluirFluxo = async (comMatricula) => {
    // 1. Criar Paciente (ou atualizar existente)
    let finalPacienteId = clienteId;
    let finalPacienteNome = pacienteData.nome;

    if (!clienteId) {
      finalPacienteId = await addPaciente(pacienteData);
    } else {
      updatePaciente(clienteId, pacienteData);
    }

    let novaMatriculaId = null;

    // 2. Criar Matrícula e Cobrança Inicial (opcional)
    if (comMatricula) {
      novaMatriculaId = await addMatricula({
        ...matriculaData,
        pacienteId: finalPacienteId,
        paciente: finalPacienteNome,
        status: 'ativa'
      });

      // Se aulas fixas ou pacote de sessões, gerar agendamentos
      if (isRecorrenteOrPackage) {
        let current = new Date(matriculaData.dataInicio + 'T00:00:00');
        const limit = matriculaData.dataFinal 
          ? new Date(matriculaData.dataFinal + 'T23:59:59')
          : (qtdSessoes ? null : new Date(new Date(current).setFullYear(current.getFullYear() + 1)));

        let count = 0;
        
        while ((!limit || current <= limit) && (!qtdSessoes || count < qtdSessoes)) {
          const day = current.getDay();
          const recurrenceConfig = matriculaData.diasRecorrentes[day];
          
          if (recurrenceConfig && recurrenceConfig.checked) {
            addAgendamento({
              clienteId: finalPacienteId,
              matriculaId: novaMatriculaId,
              nomeNaoCadastrado: '',
              telefoneNaoCadastrado: '',
              profissionalId: matriculaData.profissionalId,
                servico: matriculaData.modalidade,
                servicoId: servicos.find(s => s.nome === matriculaData.modalidade)?.id || '',
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
        // Agendamento único para Avulso
        addAgendamento({
          clienteId: finalPacienteId,
          matriculaId: novaMatriculaId,
          nomeNaoCadastrado: '',
          telefoneNaoCadastrado: '',
          profissionalId: matriculaData.profissionalId,
            servico: matriculaData.modalidade,
            servicoId: servicos.find(s => s.nome === matriculaData.modalidade)?.id || '',
            data: matriculaData.dataInicio,
          hora: matriculaData.avulsoHora,
          horaFim: matriculaData.avulsoHoraFim,
          isPacienteNaoCadastrado: false,
          status: 'agendado'
        });
      }

      // Gerar o primeiro Contas a Receber (Recebimento) para esta matrícula
      const planoObj = planos.find(x => x.nome === matriculaData.plano);
      let parcelas = 1;
      if (planoObj) {
        const vig = planoObj.vigencia?.toLowerCase();
        if (vig === 'bimestral') parcelas = 2;
        else if (vig === 'trimestral') parcelas = 3;
        else if (vig === 'semestral') parcelas = 6;
        else if (vig === 'anual') parcelas = 12;
      }
      const valorFloat = parseFloat(matriculaData.valor.replace('R$', '').replace(/\./g, '').replace(',', '.')) || 0;
      const dataAtual = new Date();
      
      for (let i = 0; i < parcelas; i++) {
        const mesVencimento = dataAtual.getMonth() + i;
        const diaVenc = parseInt(matriculaData.diaVencimento || 10, 10);
        const dataVenc = new Date(dataAtual.getFullYear(), mesVencimento, diaVenc);
        
        addRecebimento({
          pacienteId: finalPacienteId,
          nomePaciente: finalPacienteNome,
          descricao: `Mensalidade ${matriculaData.modalidade} - ${finalPacienteNome} (Parcela ${i+1}/${parcelas})`,
          modalidade: matriculaData.modalidade,
          plano: matriculaData.plano,
          valor: valorFloat,
          valorPago: 0,
          status: 'PENDENTE',
          dataVencimento: dataVenc.toISOString().split('T')[0],
          tipoPagamento: '',
          dataPagamento: '',
          matriculaId: novaMatriculaId
        });
      }
    }

    // 3. Criar Avaliação (linkada ao paciente E à matrícula)
    addAvaliacao({
      ...avaliacaoData,
      pacienteId: finalPacienteId,
      matriculaId: novaMatriculaId,
      data: new Date().toISOString().split('T')[0]
    });

    // 4. Atualizar o Agendamento da avaliação original
    if (agendamentoId) {
      updateAgendamento(agendamentoId, {
        isPacienteNaoCadastrado: false,
        clienteId: finalPacienteId,
        matriculaId: novaMatriculaId,
        nomePacienteNovo: null,
        telefonePacienteNovo: null,
        nomeNaoCadastrado: '',
        telefoneNaoCadastrado: '',
        status: 'Realizado'
      });
    }

    setTimeout(() => {
      if (typeof onClose === 'function') {
        onClose();
      }
    }, 100);
  };

  const calcularIdade = (dataNasc) => {
    if (!dataNasc) return '';
    const parts = dataNasc.split('-');
    if (parts.length !== 3) return '';
    const hoje = new Date();
    const nascimento = new Date(parts[0], parts[1] - 1, parts[2]);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return isNaN(idade) ? '' : idade;
  };

  const handleCpfChange = (e) => {
    setPacienteData({...pacienteData, cpf: maskCpf(e.target.value)});
  };

  const handleTelefoneChange = (e) => {
    setPacienteData({...pacienteData, telefone: maskTelefone(e.target.value)});
  };

  const handleMatriculaPlanoChange = (e) => {
    const pNome = e.target.value;
    const p = planos.find(pl => pl.nome === pNome);
    if (p) {
      setMatriculaData({ ...matriculaData, plano: pNome, valor: p.preco || '' });
    } else {
      setMatriculaData({ ...matriculaData, plano: pNome });
    }
  };

  const handleValorChange = (e) => {
    let value = e.target.value;
    value = value.replace(/\D/g, "");
    
    if (value === "") {
      setMatriculaData({ ...matriculaData, valor: "" });
      return;
    }
    
    const options = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
    const result = new Intl.NumberFormat('pt-BR', options).format(
      parseFloat(value) / 100
    );
    
    setMatriculaData({ ...matriculaData, valor: "R$ " + result });
  };

  const handleCepChange = async (e) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    const formatted = maskCep(rawValue);
    setPacienteData({...pacienteData, cep: formatted});

    if (rawValue.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${rawValue}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setPacienteData(prev => ({
            ...prev,
            cep: formatted,
            endereco: {
              ...prev.endereco,
              logradouro: data.logradouro || '',
              bairro: data.bairro || '',
              cidade: data.localidade || '',
              uf: data.uf || ''
            }
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar CEP", error);
      }
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', width: '100%', maxWidth: '800px', height: '90vh', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--text-dark)', fontSize: '1.1rem' }}>
            Avaliação
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Wizard Progress */}
        <div style={{ padding: '24px 24px 0 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          
          {/* Step 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: step >= 1 ? 'var(--primary-color)' : '#e2e8f0', color: step >= 1 ? 'white' : '#64748b'
            }}>
              {step > 1 ? <Check size={20} /> : <User size={20} />}
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: step >= 1 ? 'var(--primary-color)' : '#64748b' }}>CADASTRO</span>
          </div>

          <div style={{ height: '2px', flex: 1, maxWidth: '60px', background: step >= 2 ? 'var(--primary-color)' : '#e2e8f0', marginTop: '-20px' }}></div>

          {/* Step 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: step >= 2 ? 'var(--primary-color)' : '#e2e8f0', color: step >= 2 ? 'white' : '#64748b'
            }}>
              {step > 2 ? <Check size={20} /> : <Stethoscope size={20} />}
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: step >= 2 ? 'var(--primary-color)' : '#64748b' }}>AVALIAÇÃO</span>
          </div>

          <div style={{ height: '2px', flex: 1, maxWidth: '60px', background: step >= 3 ? 'var(--primary-color)' : '#e2e8f0', marginTop: '-20px' }}></div>

          {/* Step 3 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: step >= 3 ? 'var(--primary-color)' : '#e2e8f0', color: step >= 3 ? 'white' : '#64748b'
            }}>
              <FileText size={20} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: step >= 3 ? 'var(--primary-color)' : '#64748b' }}>MATRÍCULA</span>
          </div>

        </div>

        {/* Body */}
        <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
          
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', animation: 'fadeIn 0.3s ease' }}>
              
              {clienteId && !isEditingCadastro ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ background: '#dcfce7', color: '#16a34a', padding: '12px', borderRadius: '50%', marginBottom: '16px' }}>
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--text-dark)', marginBottom: '8px' }}>Paciente já cadastrado no sistema</h3>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '32px', textAlign: 'center' }}>
                    Os dados cadastrais de <strong>{pacienteData.nome}</strong> já estão preenchidos. Você pode utilizar os dados existentes e seguir para a avaliação, ou editar o cadastro se necessário.
                  </p>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <button 
                      onClick={() => setIsEditingCadastro(true)}
                      style={{ padding: '12px 24px', background: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-dark)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                      Editar Cadastro
                    </button>
                    <button 
                      onClick={handleNext}
                      style={{ padding: '12px 24px', background: 'var(--primary-color)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}>
                      Utilizar Dados Existentes <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Seção: Dados Pessoais */}
                  <div>
                    <h3 style={{ fontSize: '1.05rem', color: 'var(--text-dark)', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '24px' }}>
                      Dados pessoais
                    </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Nome completo *</label>
                    <input type="text" value={pacienteData.nome} onChange={e => setPacienteData({...pacienteData, nome: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none' }} />
                  </div>
                  
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Data de Nascimento</label>
                      <input type="date" value={pacienteData.dataNascimento} onChange={e => setPacienteData({...pacienteData, dataNascimento: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Idade</label>
                      <input type="text" value={calcularIdade(pacienteData.dataNascimento)} readOnly placeholder="Automático" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', backgroundColor: '#f1f5f9', color: 'var(--text-muted)' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Telefone *</label>
                      <input type="text" value={pacienteData.telefone} onChange={handleTelefoneChange} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>CPF</label>
                      <input type="text" value={pacienteData.cpf} onChange={handleCpfChange} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Profissão</label>
                      <input type="text" value={pacienteData.profissao} onChange={e => setPacienteData({...pacienteData, profissao: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Gênero</label>
                      <select value={pacienteData.genero} onChange={e => setPacienteData({...pacienteData, genero: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', backgroundColor: 'white' }}>
                        <option value="">- Selecione -</option>
                        <option value="Feminino">Feminino</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Estado Civil</label>
                      <select value={pacienteData.estadoCivil} onChange={e => setPacienteData({...pacienteData, estadoCivil: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', backgroundColor: 'white' }}>
                        <option value="">- Selecione -</option>
                        <option value="Solteiro(a)">Solteiro(a)</option>
                        <option value="Casado(a)">Casado(a)</option>
                        <option value="Divorciado(a)">Divorciado(a)</option>
                        <option value="Viúvo(a)">Viúvo(a)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Contato de Emergência</label>
                    <input type="text" value={pacienteData.contatoEmergencia} onChange={e => setPacienteData({...pacienteData, contatoEmergencia: e.target.value})} placeholder="Nome e telefone do contato de emergência" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none' }} />
                  </div>
                </div>
              </div>

              {/* Seção: Endereço */}
              <div>
                <h3 style={{ fontSize: '1.05rem', color: 'var(--text-dark)', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '24px' }}>
                  Endereço
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>CEP</label>
                      <input type="text" value={pacienteData.cep} onChange={handleCepChange} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Logradouro</label>
                      <input type="text" value={pacienteData.endereco.logradouro} onChange={e => setPacienteData({...pacienteData, endereco: {...pacienteData.endereco, logradouro: e.target.value}})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none' }} />
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Número</label>
                      <input type="text" value={pacienteData.endereco.numero} onChange={e => setPacienteData({...pacienteData, endereco: {...pacienteData.endereco, numero: e.target.value}})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Complemento</label>
                      <input type="text" value={pacienteData.endereco.complemento} onChange={e => setPacienteData({...pacienteData, endereco: {...pacienteData.endereco, complemento: e.target.value}})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Bairro</label>
                      <input type="text" value={pacienteData.endereco.bairro} onChange={e => setPacienteData({...pacienteData, endereco: {...pacienteData.endereco, bairro: e.target.value}})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Cidade</label>
                      <input type="text" value={pacienteData.endereco.cidade} onChange={e => setPacienteData({...pacienteData, endereco: {...pacienteData.endereco, cidade: e.target.value}})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>UF</label>
                      <input type="text" value={pacienteData.endereco.uf} onChange={e => setPacienteData({...pacienteData, endereco: {...pacienteData.endereco, uf: e.target.value}})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção: Extra */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ width: '48%' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Data Cadastro</label>
                  <input type="date" value={pacienteData.dataCadastro} onChange={e => setPacienteData({...pacienteData, dataCadastro: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none' }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" id="statusAtivoWizard" checked={pacienteData.statusAtivo} onChange={e => setPacienteData({...pacienteData, statusAtivo: e.target.checked})} style={{ width: '18px', height: '18px', accentColor: '#3b82f6', cursor: 'pointer' }} />
                  <label htmlFor="statusAtivoWizard" style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: '0.9rem', cursor: 'pointer' }}>Status ativo</label>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Como nos conheceu?</label>
                  <select value={pacienteData.comoConheceu} onChange={e => setPacienteData({...pacienteData, comoConheceu: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', backgroundColor: 'white' }}>
                    <option value="">Selecione...</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Google">Google / Site</option>
                    <option value="Indicação">Indicação de amigo/paciente</option>
                    <option value="Passou na frente">Passou na frente da clínica</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Observação</label>
                  <textarea rows="4" value={pacienteData.observacao} onChange={e => setPacienteData({...pacienteData, observacao: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', resize: 'vertical' }}></textarea>
                </div>
              </div>
              </>
              )}
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.3s ease' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-dark)', marginBottom: '8px' }}>Ficha de Avaliação</h3>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Queixa Principal</label>
                <RichTextEditor value={avaliacaoData.queixaPrincipal} onChange={(val) => setAvaliacaoData({...avaliacaoData, queixaPrincipal: val})} placeholder="Descreva a queixa do paciente..." minHeight="150px" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Hábitos de Vida</label>
                <RichTextEditor value={avaliacaoData.habitosVida} onChange={(val) => setAvaliacaoData({...avaliacaoData, habitosVida: val})} placeholder="Descreva os hábitos, atividades, etc..." minHeight="100px" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Testes Funcionais e Observações</label>
                <RichTextEditor value={avaliacaoData.expectativas} onChange={(val) => setAvaliacaoData({...avaliacaoData, expectativas: val})} placeholder="Testes funcionais e observações adicionais..." minHeight="100px" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Plano de Tratamento</label>
                <RichTextEditor value={avaliacaoData.planoTratamento} onChange={(val) => setAvaliacaoData({...avaliacaoData, planoTratamento: val})} placeholder="Objetivos e condutas..." minHeight="100px" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.3s ease' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-dark)', marginBottom: '8px' }}>Matrícula / Contrato</h3>
              
              <div style={{ padding: '16px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', marginBottom: '8px' }}>
                <p style={{ fontSize: '0.9rem', color: '#0369a1', margin: 0, fontWeight: 500 }}>
                  Preencha os dados abaixo caso o paciente já tenha fechado o pacote. Se for pensar, você pode pular esta etapa.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Modalidade</label>
                  <select value={matriculaData.modalidade} onChange={e => {
                    const newModalidade = e.target.value;
                    const updatedDias = { ...matriculaData.diasRecorrentes };
                    for (let day in updatedDias) {
                      updatedDias[day].horaFim = getHoraFim(updatedDias[day].hora, newModalidade);
                    }
                    setMatriculaData({
                      ...matriculaData, 
                      modalidade: newModalidade, 
                      avulsoHoraFim: getHoraFim(matriculaData.avulsoHora, newModalidade),
                      diasRecorrentes: updatedDias
                    });
                  }} style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', backgroundColor: '#fff' }}>
                    <option value="">- Selecione -</option>
                    {servicos && servicos.length > 0 ? servicos.filter(s => !s.nome.toLowerCase().includes('avalia')).map(s => (
                      <option key={s.id} value={s.nome}>{s.nome}</option>
                    )) : (
                      <option disabled>Nenhum serviço cadastrado</option>
                    )}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Plano de Pagamento</label>
                  <select value={matriculaData.plano} onChange={handleMatriculaPlanoChange} style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', backgroundColor: '#fff' }}>
                    <option value="">- Selecione -</option>
                    {planos && planos.length > 0 ? planos
                      .filter(p => !matriculaData.modalidade || p.modalidade === matriculaData.modalidade)
                      .map(p => (
                      <option key={p.id} value={p.nome}>{p.nome}</option>
                    )) : (
                      <option disabled>Nenhum plano cadastrado</option>
                    )}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Valor do Plano (R$)</label>
                    <input 
                      type="text" 
                      value={matriculaData.valor}
                      onChange={handleValorChange}
                      placeholder="R$ 0,00"
                      style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', backgroundColor: '#fff', color: 'var(--text-main)', fontSize: '0.95rem' }} 
                    />
                  </div>
                  
                </div>

                
              </div>

              <div style={{ marginTop: '32px', padding: '24px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Profissional Responsável</label>
                    <select 
                      value={matriculaData.profissionalId}
                      onChange={(e) => setMatriculaData({ ...matriculaData, profissionalId: e.target.value })}
                      style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none' }}
                    >
                      <option value="">- Selecione -</option>
                      {profissionais.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                    </select>
                  </div>

                  {!isRecorrenteOrPackage && (
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Data da Sessão</label>
                        <input 
                          type="date" 
                          value={matriculaData.dataInicio}
                          onChange={(e) => setMatriculaData({ ...matriculaData, dataInicio: e.target.value })}
                          style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none' }} 
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Início</label>
                        <input 
                          type="time" 
                          value={matriculaData.avulsoHora}
                          onChange={(e) => {
                            const newHora = e.target.value;
                            setMatriculaData({ 
                              ...matriculaData, 
                              avulsoHora: newHora, 
                              avulsoHoraFim: getHoraFim(newHora, matriculaData.modalidade) 
                            });
                          }}
                          style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none' }} 
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Fim</label>
                        <input 
                          type="time" 
                          value={matriculaData.avulsoHoraFim}
                          onChange={(e) => setMatriculaData({ ...matriculaData, avulsoHoraFim: e.target.value })}
                          style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none' }} 
                        />
                      </div>
                    </div>
                  )}

                  {isRecorrenteOrPackage && (
                    <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Data Início (1º Agendamento): *</label>
                        <input 
                          type="date" 
                          value={matriculaData.dataInicio}
                          onChange={(e) => setMatriculaData({ ...matriculaData, dataInicio: e.target.value })}
                          style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', backgroundColor: '#fff', color: 'var(--text-main)' }} 
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Repetir Até: *</label>
                        <input 
                          type="date" 
                          value={matriculaData.dataFinal}
                          onChange={(e) => setMatriculaData({ ...matriculaData, dataFinal: e.target.value })}
                          style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', backgroundColor: '#fff', color: 'var(--text-main)' }} 
                        />
                      </div>
                    </div>
                  )}

                  {isRecorrenteOrPackage && (
                    <div style={{ marginTop: '16px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '12px' }}>Dias e Horários das Aulas:</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                      {[1,2,3,4,5,6,0].map(day => {
                        const dayIndex = day.toString();
                        const label = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][day];
                        return (
                          <div key={day} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <input 
                              type="checkbox" 
                              checked={matriculaData.diasRecorrentes[dayIndex].checked}
                              onChange={(e) => setMatriculaData({
                                ...matriculaData,
                                diasRecorrentes: {
                                  ...matriculaData.diasRecorrentes,
                                  [dayIndex]: { ...matriculaData.diasRecorrentes[dayIndex], checked: e.target.checked }
                                }
                              })}
                              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ width: '65px', fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: matriculaData.diasRecorrentes[dayIndex].checked ? 700 : 400 }}>{label}</span>
                              {matriculaData.diasRecorrentes[dayIndex].checked && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <input 
                                    type="time" 
                                    value={matriculaData.diasRecorrentes[dayIndex].hora}
                                    onChange={(e) => {
                                      const newHora = e.target.value;
                                      const newHoraFim = getHoraFim(newHora, matriculaData.modalidade);
                                      setMatriculaData({
                                        ...matriculaData,
                                        diasRecorrentes: {
                                          ...matriculaData.diasRecorrentes,
                                          [dayIndex]: { ...matriculaData.diasRecorrentes[dayIndex], hora: newHora, horaFim: newHoraFim }
                                        }
                                      });
                                    }}
                                    style={{ padding: '4px 8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.8rem', outline: 'none' }}
                                  />
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>até</span>
                                  <input 
                                    type="time" 
                                    value={matriculaData.diasRecorrentes[dayIndex].horaFim || ''}
                                    onChange={(e) => setMatriculaData({
                                      ...matriculaData,
                                      diasRecorrentes: {
                                        ...matriculaData.diasRecorrentes,
                                        [dayIndex]: { ...matriculaData.diasRecorrentes[dayIndex], horaFim: e.target.value }
                                      }
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
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', background: '#f8fafc' }}>
          <div>
            {step === 3 && (
              <button onClick={handleSkipMatricula} style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 20px', fontWeight: 600, cursor: 'pointer' }}>
                Pular Matrícula e Salvar
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} style={{ background: 'white', color: 'var(--text-dark)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 20px', fontWeight: 600, cursor: 'pointer' }}>
                Voltar
              </button>
            )}
            
            {step < 3 ? (
              <button onClick={handleNext} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: 600, cursor: 'pointer' }}>
                Próximo Passo <ChevronRight size={18} />
              </button>
            ) : (
              <button onClick={handleFinish} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: 600, cursor: 'pointer' }}>
                Salvar Tudo e Finalizar
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default function AvaliacaoWizardModal(props) {
  return (
    <ErrorBoundary>
      <AvaliacaoWizardModalInner {...props} />
    </ErrorBoundary>
  );
}

