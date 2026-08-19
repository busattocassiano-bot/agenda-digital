import React, { useState, useEffect, useMemo } from 'react';
import { User, Camera, X, Check, FileText, Activity, RotateCcw, CreditCard, ScanFace, Calendar, Plus, RefreshCw, Clock, Download, Pause, Square, Save, FileSpreadsheet, Printer, ArrowDownUp, ClipboardList, Paperclip, Edit, FileEdit } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import NovaMatriculaModal from '../components/NovaMatriculaModal';

export default function PacientePerfil() {
  const { id } = useParams();
  const { pacientes, matriculas, updateMatricula, planos, recebimentos, agendamentos, evolucoes, addEvolucao, updateEvolucao, profissionais, avaliacoes } = useAppData();
  
  const paciente = pacientes.find(p => p.id === id) || { 
    nome: 'Não encontrado', 
    telefone: '', 
    email: '', 
    cpf: '', 
    endereco: { logradouro: '', bairro: '', cidade: '', uf: '' } 
  };

  const matriculasDoPaciente = (matriculas || []).filter(m => String(m.pacienteId) === String(id));
  const avaliacoesDoPaciente = (avaliacoes || []).filter(a => String(a.pacienteId) === String(id));

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [activeTab, setActiveTab] = useState('info');
  
  // Evolucao modal states
  const [evolucaoModalOpen, setEvolucaoModalOpen] = useState(false);
  const [selectedEvolucaoItem, setSelectedEvolucaoItem] = useState(null);
  const [evolucaoText, setEvolucaoText] = useState('');

  // Reposicao modal states
  const [novaMatriculaModalOpen, setNovaMatriculaModalOpen] = useState(false);
  const [detalhesMatriculaModalOpen, setDetalhesMatriculaModalOpen] = useState(false);
  const [detalhesTab, setDetalhesTab] = useState('mensalidades');
  
  const [anamnese, setAnamnese] = useState({
    queixaPrincipal: '',
    habitosVida: '',
    expectativas: '',
    planoTratamento: ''
  });

  const calcularIdade = (data) => {
    if (!data) return '';
    const hoje = new Date();
    const nascimento = new Date(data);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  useEffect(() => {
    // initial toast is now disabled by default, handled by actions
  }, []);

  const inputStyle = { 
    width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', 
    borderRadius: '8px', outline: 'none', backgroundColor: '#fff', 
    color: 'var(--text-main)', fontSize: '0.9rem' 
  };

  const combinedEvolucoesList = useMemo(() => {
    const pAgendamentos = agendamentos.filter(a => a.clienteId === id && a.servico !== 'Reposição' && a.tipo !== 'Reposicao' && a.servico !== 'Avaliação' && a.tipo !== 'Avaliacao');
    
    const mappedAgendamentos = pAgendamentos.map(a => {
      let ev = evolucoes.find(e => e.idAgendamento === a.id);
      if (!ev) {
        ev = evolucoes.find(e => e.data === a.data.split('-').reverse().join('/') && String(e.clienteId) === String(a.clienteId));
      }
      return {
        agendamento: a,
        evolucao: ev || null,
        dataParsed: new Date(a.data + 'T00:00:00')
      };
    });

    const standaloneEvolucoes = evolucoes.filter(e => 
      String(e.clienteId) === String(id) && !mappedAgendamentos.some(ma => ma.evolucao && ma.evolucao.id === e.id)
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
    full.sort((a, b) => b.dataParsed - a.dataParsed);
    return full;
  }, [agendamentos, evolucoes, id]);

  const openEvolucaoModal = (item) => {
    setSelectedEvolucaoItem(item);
    setEvolucaoText(item.evolucao ? item.evolucao.descricao : '');
    setEvolucaoModalOpen(true);
  };

  const handleSaveEvolucao = () => {
    if (!evolucaoText.trim()) {
      setEvolucaoModalOpen(false);
      return;
    }

    if (selectedEvolucaoItem.evolucao) {
      updateEvolucao(selectedEvolucaoItem.evolucao.id, { descricao: evolucaoText });
    } else if (selectedEvolucaoItem.agendamento) {
      const a = selectedEvolucaoItem.agendamento;
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
      });
    }

    setToastMessage('Evolução salva com sucesso!');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
    setEvolucaoModalOpen(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Toast Notification */}
      {showToast && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', background: '#ecfdf5', borderLeft: '4px solid #10b981', padding: '16px 20px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', zIndex: 9999, transition: 'all 0.3s ease' }}>
          <div style={{ background: '#10b981', borderRadius: '50%', padding: '2px' }}>
            <Check size={16} color="white" />
          </div>
          <span style={{ color: '#065f46', fontWeight: 500 }}>{toastMessage || 'Ação realizada com sucesso'}</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: '24px', marginTop: '16px', alignItems: 'flex-start' }}>
        
        {/* Left Column - Profile Sidebar */}
        <div style={{ width: '280px', background: 'white', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                <User size={64} />
              </div>
              <button style={{ position: 'absolute', bottom: 0, right: '10px', width: '32px', height: '32px', borderRadius: '50%', background: '#0f766e', color: 'white', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Camera size={16} />
              </button>
            </div>
            
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '16px', textAlign: 'center' }}>{paciente.nome}</h2>
            
            <button style={{ background: '#fecaca', color: '#dc2626', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <X size={16} strokeWidth={3} /> EXCLUIR PERFIL
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', padding: '12px 0' }}>
            <div 
              onClick={() => setActiveTab('info')}
              style={{ padding: '12px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', background: activeTab === 'info' ? '#f1f5f9' : 'transparent', color: activeTab === 'info' ? 'var(--text-dark)' : 'var(--text-muted)', fontWeight: activeTab === 'info' ? 600 : 500 }}>
              <User size={18} /> Informações pessoais
            </div>
            <div 
              onClick={() => setActiveTab('matriculas')}
              style={{ padding: '12px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', background: activeTab === 'matriculas' ? '#f1f5f9' : 'transparent', color: activeTab === 'matriculas' ? 'var(--text-dark)' : 'var(--text-muted)', fontWeight: activeTab === 'matriculas' ? 600 : 500 }}>
              <FileText size={18} /> Matrículas
            </div>
            <div 
              onClick={() => setActiveTab('evolucoes')}
              style={{ padding: '12px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', background: activeTab === 'evolucoes' ? '#f1f5f9' : 'transparent', color: activeTab === 'evolucoes' ? 'var(--text-dark)' : 'var(--text-muted)', fontWeight: activeTab === 'evolucoes' ? 600 : 500 }}>
              <Activity size={18} /> Evoluções
            </div>
            <div 
              onClick={() => setActiveTab('avaliacoes')}
              style={{ padding: '12px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', background: activeTab === 'avaliacoes' ? '#f1f5f9' : 'transparent', color: activeTab === 'avaliacoes' ? 'var(--text-dark)' : 'var(--text-muted)', fontWeight: activeTab === 'avaliacoes' ? 600 : 500 }}>
              <ClipboardList size={18} /> Ficha de Avaliação
            </div>
            <div 
              onClick={() => setActiveTab('reposicoes')}
              style={{ padding: '12px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', background: activeTab === 'reposicoes' ? '#f1f5f9' : 'transparent', color: activeTab === 'reposicoes' ? 'var(--text-dark)' : 'var(--text-muted)', fontWeight: activeTab === 'reposicoes' ? 600 : 500 }}>
              <Calendar size={18} /> Reposições
            </div>
            <div 
              onClick={() => setActiveTab('mensalidades')}
              style={{ padding: '12px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', background: activeTab === 'mensalidades' ? '#f1f5f9' : 'transparent', color: activeTab === 'mensalidades' ? 'var(--text-dark)' : 'var(--text-muted)', fontWeight: activeTab === 'mensalidades' ? 600 : 500 }}>
              <CreditCard size={18} /> Mensalidades
            </div>
            <div 
              onClick={() => setActiveTab('anamnese')}
              style={{ padding: '12px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', background: activeTab === 'anamnese' ? '#f1f5f9' : 'transparent', color: activeTab === 'anamnese' ? 'var(--text-dark)' : 'var(--text-muted)', fontWeight: activeTab === 'anamnese' ? 600 : 500 }}>
              <ClipboardList size={18} /> Anamnese
            </div>
            <div 
              onClick={() => setActiveTab('anexos')}
              style={{ padding: '12px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', background: activeTab === 'anexos' ? '#f1f5f9' : 'transparent', color: activeTab === 'anexos' ? 'var(--text-dark)' : 'var(--text-muted)', fontWeight: activeTab === 'anexos' ? 600 : 500 }}>
              <Paperclip size={18} /> Anexos
            </div>
          </div>
        </div>

        {/* Right Column - Form Content */}
        <div style={{ flex: 1, background: 'white', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '32px' }}>
          
          {activeTab === 'info' && (
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-dark)', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '24px' }}>
                Dados pessoais
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Row 1 */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Nome completo</label>
                  <input type="text" defaultValue={paciente.nome} style={inputStyle} />
                </div>
                
                {/* Row 2 */}
                <div style={{ display: 'flex', gap: '24px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Data de Nascimento</label>
                    <div style={{ display: 'flex' }}>
                      <div style={{ background: '#94a3b8', padding: '10px 14px', borderRadius: '8px 0 0 8px', display: 'flex', alignItems: 'center', color: 'white' }}><Calendar size={18} /></div>
                      <input type="date" defaultValue={paciente.dataNascimento || '1994-01-04'} style={{ ...inputStyle, borderRadius: '0 8px 8px 0', borderLeft: 'none', height: '42px', color: 'var(--text-main)', fontFamily: 'inherit' }} />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Idade</label>
                    <input type="text" value={calcularIdade(paciente.dataNascimento || '1994-01-04')} readOnly style={{ ...inputStyle, backgroundColor: '#f1f5f9', color: 'var(--text-muted)' }} />
                  </div>
                </div>

                {/* Row 3 */}
                <div style={{ display: 'flex', gap: '24px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Telefone</label>
                    <input type="text" defaultValue={paciente.telefone} style={inputStyle} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>CPF</label>
                    <input type="text" defaultValue={paciente.cpf} style={inputStyle} />
                  </div>
                </div>

                {/* Row 4 */}
                <div style={{ display: 'flex', gap: '24px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Profissão</label>
                    <input type="text" defaultValue={paciente.profissao || ''} style={inputStyle} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Gênero</label>
                    <select defaultValue={paciente.genero || ''} style={inputStyle}>
                      <option value="">- Selecione -</option>
                      <option value="Feminino">Feminino</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Estado Civil</label>
                    <select defaultValue={paciente.estadoCivil || ''} style={inputStyle}>
                      <option value="">- Selecione -</option>
                      <option value="Solteiro(a)">Solteiro(a)</option>
                      <option value="Casado(a)">Casado(a)</option>
                      <option value="Divorciado(a)">Divorciado(a)</option>
                      <option value="Viúvo(a)">Viúvo(a)</option>
                    </select>
                  </div>
                </div>

                {/* Row 5 */}
                <div style={{ display: 'flex', gap: '24px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Contato de Emergência</label>
                    <input type="text" defaultValue={paciente.contatoEmergencia || ''} style={inputStyle} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Como nos conheceu?</label>
                    <select defaultValue={paciente.comoConheceu || ''} style={inputStyle}>
                      <option value="">Selecione...</option>
                      <option value="Instagram">Instagram</option>
                      <option value="Facebook">Facebook</option>
                      <option value="Google">Google / Site</option>
                      <option value="Indicação">Indicação de amigo/paciente</option>
                      <option value="Passou na frente">Passou na frente da clínica</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>
                </div>
              </div>

              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-dark)', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginTop: '40px', marginBottom: '24px' }}>
                Endereço
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', gap: '24px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>CEP</label>
                    <input type="text" defaultValue={paciente.cep} style={inputStyle} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Logradouro</label>
                    <input type="text" defaultValue={paciente.endereco?.logradouro} style={inputStyle} />
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '24px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Número</label>
                    <input type="text" defaultValue="707" style={inputStyle} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Complemento</label>
                    <input type="text" defaultValue="casa 3" style={inputStyle} />
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '24px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Bairro</label>
                    <input type="text" defaultValue={paciente.endereco?.bairro} style={inputStyle} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Cidade</label>
                    <input type="text" defaultValue={paciente.endereco?.cidade} style={inputStyle} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>UF</label>
                    <input type="text" defaultValue={paciente.endereco?.uf} style={inputStyle} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'matriculas' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--text-dark)', fontWeight: 700, margin: 0 }}>
                  Matrículas do Aluno
                </h3>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={() => setNovaMatriculaModalOpen(true)}
                    style={{ background: '#1d4ed8', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    <Plus size={18} />
                  </button>
                  <button style={{ background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <RefreshCw size={18} />
                  </button>
                </div>
              </div>
              
              {matriculasDoPaciente.length === 0 ? (
                <div style={{ background: '#fef08a', color: '#854d0e', padding: '16px 20px', borderRadius: '8px', fontSize: '0.95rem' }}>
                  <strong style={{ fontWeight: 700 }}>Atenção!</strong> <span style={{ fontWeight: 500 }}>Nenhum registro foi encontrado.</span>
                </div>
              ) : (
                <div style={{ overflowX: 'auto', background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.85rem', color: '#475569' }}>Modalidade</th>
                        <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.85rem', color: '#475569' }}>Plano</th>
                        <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.85rem', color: '#475569' }}>Valor</th>
                        <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.85rem', color: '#475569' }}>Data Início</th>
                        <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.85rem', color: '#475569' }}>Sessões</th>
                        <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.85rem', color: '#475569' }}>Status</th>
                        <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.85rem', color: '#475569', textAlign: 'right' }}>Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matriculasDoPaciente.map(m => {
                        const isAtiva = m.status?.toLowerCase() === 'ativa' || m.status?.toLowerCase() === 'ativo';
                        const plano = planos?.find(p => p.nome === m.plano);
                        const qtdSessoes = plano ? parseInt(plano.qtdSessoes) : 0;
                        const sessoesRealizadas = m.sessoesRealizadas || 0;
                        
                        return (
                          <tr key={m.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '16px', color: 'var(--text-dark)', fontWeight: 500 }}>{m.modalidade || m.servico}</td>
                            <td style={{ padding: '16px', color: 'var(--text-main)' }}>{m.plano}</td>
                            <td style={{ padding: '16px', color: 'var(--text-main)' }}>{m.valor || 'R$ 0,00'}</td>
                            <td style={{ padding: '16px', color: 'var(--text-main)' }}>{m.dataInicio ? m.dataInicio.split('-').reverse().join('/') : '-'}</td>
                            <td style={{ padding: '16px', color: 'var(--text-main)' }}>
                              {qtdSessoes > 0 ? `${sessoesRealizadas} / ${qtdSessoes}` : '-'}
                            </td>
                            <td style={{ padding: '16px' }}>
                              <span style={{ background: isAtiva ? '#dcfce7' : '#f1f5f9', color: isAtiva ? '#166534' : '#475569', padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>
                                {m.status ? m.status.charAt(0).toUpperCase() + m.status.slice(1).toLowerCase() : 'Ativa'}
                              </span>
                            </td>
                            <td style={{ padding: '16px', textAlign: 'right' }}>
                              {isAtiva ? (
                                <button 
                                  onClick={() => updateMatricula(m.id, { status: 'Encerrada' })}
                                  style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                                >
                                  Encerrar
                                </button>
                              ) : (
                                <button 
                                  onClick={() => updateMatricula(m.id, { status: 'Ativa' })}
                                  style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                                >
                                  Reativar
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'mensalidades' && (
            <div style={{ flex: 1 }}>
              <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-dark)' }}>Mensalidades em Aberto</h2>
                  <button style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}>
                    <RefreshCw size={16} />
                  </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: '#0284c7', color: 'white' }}>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Status</th>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Vencimento</th>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Pagamento</th>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Método</th>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Valor</th>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Valor Pago</th>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Descrição</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recebimentos.filter(r => r.pacienteId === id).length === 0 ? (
                        <tr>
                          <td colSpan="7" style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhuma mensalidade encontrada.</td>
                        </tr>
                      ) : (
                        recebimentos.filter(r => r.pacienteId === id).map((rec, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '16px' }}>
                              <span style={{ 
                                background: rec.status === 'PAGO' ? '#dcfce7' : rec.status === 'ATRASADO' ? '#fee2e2' : '#f1f5f9', 
                                color: rec.status === 'PAGO' ? '#16a34a' : rec.status === 'ATRASADO' ? '#ef4444' : '#64748b', 
                                padding: '4px 12px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 
                              }}>
                                {rec.status}
                              </span>
                            </td>
                            <td style={{ padding: '16px', color: 'var(--text-main)' }}>{rec.dataVencimento.split('-').reverse().join('/')}</td>
                            <td style={{ padding: '16px', color: 'var(--text-main)' }}>{rec.dataPagamento ? rec.dataPagamento.split('-').reverse().join('/') : '-'}</td>
                            <td style={{ padding: '16px', color: 'var(--text-main)' }}>{rec.metodo || 'A Combinar'}</td>
                            <td style={{ padding: '16px', color: 'var(--text-main)' }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(rec.valor || 0)}</td>
                            <td style={{ padding: '16px', color: 'var(--text-main)' }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(rec.valorPago || 0)}</td>
                            <td style={{ padding: '16px', color: 'var(--text-main)' }}>{rec.descricao}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'evolucoes' && (
            <div style={{ flex: 1 }}>
              <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-dark)' }}>Evoluções do Paciente</h2>
                </div>
                
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#0275d8', color: 'white' }}>
                        <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.95rem' }}>Data</th>
                        <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.95rem' }}>Profissional</th>
                        <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.95rem' }}>Serviço / Conselho</th>
                        <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.95rem' }}>Status da Evolução</th>
                        <th style={{ padding: '16px', fontWeight: 600, fontSize: '0.95rem', textAlign: 'center' }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {combinedEvolucoesList.length === 0 ? (
                        <tr style={{ background: 'white' }}>
                          <td colSpan="5" style={{ padding: '16px', color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.95rem' }}>Nenhuma evolução registrada para este paciente.</td>
                        </tr>
                      ) : (
                        combinedEvolucoesList.map((item, idx) => {
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
                                <div style={{ color: 'var(--text-dark)', fontWeight: 600, fontSize: '0.95rem', marginBottom: '4px' }}>{dataStr}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>{item.agendamento?.hora ? `às ${item.agendamento.hora}` : ''}</div>
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
                                  onClick={() => openEvolucaoModal(item)}
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
            </div>
          )}

          {activeTab === 'avaliacoes' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--text-dark)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ClipboardList size={20} color="var(--primary-color)" /> Histórico de Avaliações
                  </h3>
                </div>
                
                {avaliacoesDoPaciente.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    Nenhuma avaliação registrada para este paciente.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {avaliacoesDoPaciente.map(av => (
                      <div key={av.id} style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '8px', background: '#f8fafc' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>
                          Data da Avaliação: {av.data ? av.data.split('-').reverse().join('/') : 'N/A'}
                        </div>
                        <div style={{ marginBottom: '8px', fontSize: '0.9rem' }}><strong>Queixa Principal:</strong> {av.queixaPrincipal || 'N/A'}</div>
                        <div style={{ marginBottom: '8px', fontSize: '0.9rem' }}><strong>Hábitos de Vida:</strong> {av.habitosVida || 'N/A'}</div>
                        <div style={{ marginBottom: '8px', fontSize: '0.9rem' }}><strong>Expectativas:</strong> {av.expectativas || 'N/A'}</div>
                        <div style={{ fontSize: '0.9rem' }}><strong>Plano de Tratamento:</strong> {av.planoTratamento || 'N/A'}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reposicoes' && (
            <div style={{ flex: 1 }}>
              <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-dark)' }}>Reposições Agendadas</h2>
                </div>
                
                {agendamentos.filter(a => a.clienteId === id && (a.servico === 'Reposição' || a.tipo === 'Reposicao')).length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
                    Nenhuma reposição encontrada para este paciente.
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}>Data</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}>Hora</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}>Profissional</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agendamentos.filter(a => a.clienteId === id && (a.servico === 'Reposição' || a.tipo === 'Reposicao')).map((ag, idx) => (
                        <tr key={idx}>
                          <td style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>{ag.data.split('-').reverse().join('/')}</td>
                          <td style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>{ag.hora}</td>
                          <td style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>{profissionais.find(p => p.id == ag.profissionalId)?.nome || ag.profissionalId}</td>
                          <td style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>
                            <span style={{ background: '#e0f2fe', color: '#0284c7', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                              {ag.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activeTab !== 'info' && activeTab !== 'matriculas' && activeTab !== 'mensalidades' && activeTab !== 'anamnese' && activeTab !== 'anexos' && activeTab !== 'evolucoes' && activeTab !== 'reposicoes' && activeTab !== 'avaliacoes' && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: 'var(--text-muted)' }}>
              Aba em desenvolvimento...
            </div>
          )}
          
          {activeTab === 'anamnese' && (
            <div style={{ flex: 1 }}>
              <div style={{ background: 'white', borderRadius: '12px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-dark)', marginBottom: '32px' }}>Anamnese</h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ display: 'flex', gap: '24px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Nome do Aluno</label>
                      <input type="text" readOnly value="Cassiano Busatto" style={{ ...inputStyle, background: '#f1f5f9', color: '#64748b' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Data de Nascimento</label>
                      <input type="text" readOnly value="04/01/1994" style={{ ...inputStyle, background: '#f1f5f9', color: '#64748b' }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Queixa Principal</label>
                    <textarea value={anamnese.queixaPrincipal} onChange={(e) => setAnamnese({...anamnese, queixaPrincipal: e.target.value})} style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}></textarea>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Hábitos de Vida</label>
                    <textarea value={anamnese.habitosVida} onChange={(e) => setAnamnese({...anamnese, habitosVida: e.target.value})} style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}></textarea>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Expectativas e Observações</label>
                    <textarea value={anamnese.expectativas} onChange={(e) => setAnamnese({...anamnese, expectativas: e.target.value})} style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}></textarea>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Plano de Tratamento</label>
                    <textarea value={anamnese.planoTratamento} onChange={(e) => setAnamnese({...anamnese, planoTratamento: e.target.value})} style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}></textarea>
                  </div>

                  <div>
                    <button style={{ background: '#1d4ed8', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 24px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>
                      Salvar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'anexos' && (
            <div style={{ flex: 1 }}>
              <div style={{ background: 'white', borderRadius: '12px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-dark)' }}>Anexos</h2>
                  <button style={{ background: '#1d4ed8', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 16px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={16} /> Adicionar Anexo
                  </button>
                </div>
                
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '40px', lineHeight: '1.6' }}>
                  Formatos aceitos: imagens (JPG, PNG), documentos (PDF, DOC, DOCX), planilhas (XLS, XLSX) e outros arquivos comuns. Vídeos não são permitidos. Tamanho máximo: 20MB.
                </div>

                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem', padding: '40px 0' }}>
                  Nenhum anexo encontrado
                </div>
              </div>
            </div>
          )}

        </div>
      </div>




      {/* Modal Detalhes da Matrícula */}
      {detalhesMatriculaModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '12px', width: '900px', maxWidth: '95%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', maxHeight: '90vh' }}>
            
            {/* Header */}
            <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', background: '#f8fafc' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dark)' }}>
                <FileText size={18} /> Detalhes da Matrícula
              </h2>
              <button onClick={() => setDetalhesMatriculaModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
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
                          <td style={{ padding: '16px' }}><span style={{ background: '#f8fafc', color: '#64748b', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>A vencer</span></td>
                          <td style={{ padding: '16px', color: 'var(--text-main)' }}>01/07/2026</td>
                          <td style={{ padding: '16px', color: 'var(--text-main)' }}></td>
                          <td style={{ padding: '16px', color: 'var(--text-main)' }}>Dinheiro</td>
                          <td style={{ padding: '16px', color: 'var(--text-main)' }}>R$ 100,00</td>
                          <td style={{ padding: '16px', color: 'var(--text-main)' }}>R$ 0,00</td>
                          <td style={{ padding: '16px', color: 'var(--text-main)' }}>R$ 0,00</td>
                          <td style={{ padding: '16px', color: 'var(--text-main)' }}>R$ 0,00</td>
                          <td style={{ padding: '16px', color: 'var(--text-main)' }}>R$ 0,00</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
                {detalhesTab === 'agendamentos' && (
                  <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-dark)' }}>Agendas da Matrícula</h3>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileSpreadsheet size={16} /> Exportar aulas
                        </button>
                        <button style={{ background: '#f8fafc', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 16px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Printer size={16} /> Salvar e Imprimir
                        </button>
                        <button style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}>
                          <RefreshCw size={16} />
                        </button>
                        <button style={{ background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}>
                          <ArrowDownUp size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ background: '#f1f5f9', color: 'var(--text-dark)' }}>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, borderRadius: '8px 0 0 8px' }}>Status</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700 }}>Data</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700 }}>Hora</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700 }}>Profissional</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, borderRadius: '0 8px 8px 0' }}>Justificativa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          if (!dataInicio) return null;
                          const start = new Date(dataInicio + 'T00:00:00');
                          const end = new Date(start);
                          end.setMonth(end.getMonth() + 1);

                          const diasSemanaMap = { 'domingo': 0, 'segunda': 1, 'terca': 2, 'quarta': 3, 'quinta': 4, 'sexta': 5, 'sabado': 6 };
                          const diasAbreviados = ['dom.', 'seg.', 'ter.', 'qua.', 'qui.', 'sex.', 'sáb.'];
                          let agendamentosGerados = [];

                          sessoes.forEach(sessao => {
                            if (!sessao.dia || !sessao.hora) return;
                            const targetDay = diasSemanaMap[sessao.dia];
                            let current = new Date(start);
                            while (current < end) {
                              if (current.getDay() === targetDay) {
                                agendamentosGerados.push({
                                  dataObj: new Date(current),
                                  diaStr: diasAbreviados[targetDay],
                                  dataStr: current.toLocaleDateString('pt-BR'),
                                  hora: sessao.hora,
                                  profissional: sessao.profissional
                                });
                              }
                              current.setDate(current.getDate() + 1);
                            }
                          });

                          agendamentosGerados.sort((a, b) => a.dataObj - b.dataObj);

                          return agendamentosGerados.map((agendamento, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                              <td style={{ padding: '16px' }}></td>
                              <td style={{ padding: '16px', color: 'var(--text-main)' }}>{agendamento.diaStr} {agendamento.dataStr}</td>
                              <td style={{ padding: '16px', color: 'var(--text-main)' }}>{agendamento.hora}</td>
                              <td style={{ padding: '16px', color: 'var(--text-main)' }}>{agendamento.profissional}</td>
                              <td style={{ padding: '16px', color: 'var(--text-main)' }}></td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                )}
                {detalhesTab === 'reposicoes' && (
                  <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-dark)', marginBottom: '24px' }}>Reposições em Aberto</h3>
                    <div style={{ background: '#fef9c3', color: 'var(--text-main)', padding: '16px', borderRadius: '8px', fontSize: '0.9rem' }}>
                      <span style={{ fontWeight: 700 }}>Atenção!</span> Nenhum registro foi encontrado.
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Nova Matrícula Modal */}
      <NovaMatriculaModal 
        isOpen={novaMatriculaModalOpen} 
        onClose={() => setNovaMatriculaModalOpen(false)} 
        initialPacienteId={id}
      />

      {evolucaoModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', borderRadius: '12px', width: '100%', maxWidth: '600px', padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-dark)' }}>
                {selectedEvolucaoItem?.evolucao ? 'Editar Evolução' : 'Nova Evolução'}
              </h2>
              <button onClick={() => setEvolucaoModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '20px', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ marginBottom: '8px' }}>
                <strong style={{ color: 'var(--text-dark)' }}>Paciente:</strong> {selectedEvolucaoItem?.agendamento ? pacientes.find(p => p.id === selectedEvolucaoItem.agendamento.clienteId)?.nome : selectedEvolucaoItem?.evolucao?.clienteNome}
              </div>
              <div style={{ marginBottom: '8px' }}>
                <strong style={{ color: 'var(--text-dark)' }}>Data da Sessão:</strong> {selectedEvolucaoItem?.agendamento ? selectedEvolucaoItem.agendamento.data.split('-').reverse().join('/') : selectedEvolucaoItem?.evolucao?.data}
              </div>
              <div>
                <strong style={{ color: 'var(--text-dark)' }}>Profissional:</strong> {selectedEvolucaoItem?.agendamento ? profissionais.find(p => p.id === selectedEvolucaoItem.agendamento.profissionalId)?.nome : selectedEvolucaoItem?.evolucao?.profissionalNome}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--text-dark)' }}>Descrição da Evolução</label>
              <textarea 
                value={evolucaoText}
                onChange={(e) => setEvolucaoText(e.target.value)}
                placeholder="Descreva a evolução do paciente nesta sessão..."
                style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', minHeight: '150px', resize: 'vertical', outline: 'none', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setEvolucaoModalOpen(false)} style={{ background: 'white', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                Cancelar
              </button>
              <button onClick={handleSaveEvolucao} style={{ background: '#10b981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Save size={18} /> Salvar Evolução
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
