import React, { useState } from 'react';
import { Search, Download, Trash2, Plus, RefreshCw, X, Calendar, Save, Edit, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import AvaliacaoWizardModal from '../components/AvaliacaoWizardModal';
import { maskCpf, maskTelefone, maskCep } from '../utils/masks';

export default function Pacientes() {
  const { pacientes, addPaciente, setPacientes, updatePaciente, deletePaciente } = useAppData();
  const [novoClienteModalOpen, setNovoClienteModalOpen] = useState(false);
  const [wizardModalOpen, setWizardModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInativos, setShowInativos] = useState(false);
  const [ordem, setOrdem] = useState(() => localStorage.getItem('ordemPacientes') || 'az');
  const navigate = useNavigate();
  
  // Form states
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  
  const [cpf, setCpf] = useState('');
  const [rg, setRg] = useState('');
  const [profissao, setProfissao] = useState('');
  const [genero, setGenero] = useState('');
  const [estadoCivil, setEstadoCivil] = useState('');
  const [contatoEmergencia, setContatoEmergencia] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [cep, setCep] = useState('');
  const [comoConheceu, setComoConheceu] = useState('');
  const [endereco, setEndereco] = useState({
    logradouro: '', bairro: '', cidade: '', uf: ''
  });

  const handleSave = () => {
    if (nome) {
      const pacienteObj = { nome, telefone, cpf, profissao, genero, estadoCivil, contatoEmergencia, dataNascimento, cep, endereco, comoConheceu };
      if (editingId) {
        updatePaciente(editingId, pacienteObj);
      } else {
        // Aviso de possível cadastro duplicado (nome, CPF ou telefone)
        const norm = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
        const digits = (s) => (s || '').replace(/\D/g, '');
        const motivos = [];
        pacientes.forEach(p => {
          if (norm(p.nome) === norm(nome)) motivos.push(`• Mesmo NOME: ${p.nome}`);
          else if (digits(cpf).length === 11 && digits(p.cpf) === digits(cpf)) motivos.push(`• Mesmo CPF: ${p.nome} (${p.cpf})`);
          else if (digits(telefone).length >= 10 && digits(p.telefone) === digits(telefone)) motivos.push(`• Mesmo TELEFONE: ${p.nome} (${p.telefone})`);
        });
        if (motivos.length && !window.confirm(`⚠️ Atenção! Já existe paciente cadastrado parecido:\n\n${motivos.slice(0, 5).join('\n')}\n\nDeseja cadastrar mesmo assim?`)) return;
        addPaciente(pacienteObj);
      }
      closeModal();
    }
  };

  const closeModal = () => {
    setNovoClienteModalOpen(false);
    setEditingId(null);
    setNome('');
    setTelefone('');
    setCpf('');
    setProfissao('');
    setGenero('');
    setEstadoCivil('');
    setContatoEmergencia('');
    setDataNascimento('');
    setCep('');
    setComoConheceu('');
    setEndereco({ logradouro: '', bairro: '', cidade: '', uf: '' });
  };

  const openEditModal = (paciente) => {
    setEditingId(paciente.id);
    setNome(paciente.nome || '');
    setTelefone(paciente.telefone || '');
    setCpf(paciente.cpf || '');
    setProfissao(paciente.profissao || '');
    setGenero(paciente.genero || '');
    setEstadoCivil(paciente.estadoCivil || '');
    setContatoEmergencia(paciente.contatoEmergencia || '');
    setDataNascimento(paciente.dataNascimento || '');
    setCep(paciente.cep || '');
    setComoConheceu(paciente.comoConheceu || '');
    if (paciente.endereco) {
      setEndereco(paciente.endereco);
    } else {
      setEndereco({ logradouro: '', bairro: '', cidade: '', uf: '' });
    }
    setNovoClienteModalOpen(true);
  };

  const calcularIdade = (dataNasc) => {
    if (!dataNasc) return '';
    const hoje = new Date();
    const nascimento = new Date(dataNasc);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return isNaN(idade) ? '' : idade;
  };

  const handleCpfChange = (e) => {
    setCpf(maskCpf(e.target.value));
  };

  const handleCepChange = async (e) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    const formatted = maskCep(rawValue);
    setCep(formatted);

    if (rawValue.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${rawValue}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setEndereco({
            logradouro: data.logradouro || '',
            bairro: data.bairro || '',
            cidade: data.localidade || '',
            uf: data.uf || ''
          });
        }
      } catch (error) {
        console.error("Erro ao buscar CEP", error);
      }
    }
  };

  const handleEnderecoChange = (field) => (e) => {
    setEndereco(prev => ({ ...prev, [field]: e.target.value }));
  };

  const inputStyle = { 
    width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', 
    borderRadius: '8px', outline: 'none', backgroundColor: '#fff', 
    color: 'var(--text-main)', fontSize: '0.9rem' 
  };

  const filteredPacientes = pacientes.filter(p => {
    const matchesSearch = p.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.telefone && p.telefone.includes(searchTerm));
    
    // Se showInativos for true, mostrar apenas os inativos (statusAtivo === false)
    // Se showInativos for false, mostrar apenas os ativos (statusAtivo !== false)
    const isActive = p.statusAtivo !== false;
    const matchesStatus = showInativos ? !isActive : isActive;

    return matchesSearch && matchesStatus;
  });
  if (ordem !== 'cadastro') {
    filteredPacientes.sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt-BR', { sensitivity: 'base' }) * (ordem === 'za' ? -1 : 1));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Search Area */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', background: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px 20px', gap: '12px', boxShadow: 'var(--shadow-sm)' }}>
          <Search size={20} color="#0ea5e9" style={{ strokeWidth: 2.5 }} />
          <span style={{ color: '#0ea5e9', fontWeight: 600, marginRight: '8px' }}>Pesquisar</span>
          <input 
            type="text" 
            placeholder="Informe o nome do Aluno" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', outline: 'none', flex: 1, fontSize: '1rem', color: 'var(--text-main)', background: 'transparent' }} 
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', paddingLeft: '4px' }}>
          <input 
            type="checkbox" 
            id="inativos" 
            checked={showInativos}
            onChange={(e) => setShowInativos(e.target.checked)}
            style={{ width: '16px', height: '16px', accentColor: 'var(--primary-color)', cursor: 'pointer' }} 
          />
          <label htmlFor="inativos" style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}>
            Exibir apenas Alunos inativos.
          </label>
        </div>
      </div>

      {/* Main Card */}
      <div className="card" style={{ padding: '24px' }}>
        <div className="flex-between" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#1e293b' }}>Lista de Clientes</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select
            value={ordem}
            onChange={(e) => { setOrdem(e.target.value); localStorage.setItem('ordemPacientes', e.target.value); }}
            style={{ padding: '9px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', fontWeight: 600, color: 'var(--text-main)', background: 'white', cursor: 'pointer' }}
          >
            <option value="az">Ordem: A → Z</option>
            <option value="za">Ordem: Z → A</option>
            <option value="cadastro">Ordem de cadastro</option>
          </select>
          <button 
            onClick={() => setWizardModalOpen(true)}
            style={{ background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          >
            <Plus size={18} /> Novo Cliente
          </button>
          </div>
        </div>

        {/* Tabela de Clientes */}
        {filteredPacientes.length === 0 ? (
          <div style={{ background: '#fef08a', color: '#854d0e', padding: '16px 20px', borderRadius: '8px', fontSize: '0.95rem' }}>
            <strong style={{ fontWeight: 700 }}>Atenção!</strong> <span style={{ fontWeight: 500 }}>Nenhum registro foi encontrado.</span>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ borderBottom: '2px solid var(--border-color)' }}>
                <tr>
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Nome</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Telefone</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredPacientes.map((paciente) => (
                  <tr key={paciente.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '16px', color: 'var(--text-dark)', fontWeight: 500 }}>{paciente.nome}</td>
                    <td style={{ padding: '16px', color: 'var(--text-main)' }}>{paciente.telefone}</td>
                    <td style={{ padding: '16px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button onClick={() => openEditModal(paciente)} style={{ background: '#f1f5f9', border: 'none', padding: '8px', borderRadius: '6px', color: '#0ea5e9', cursor: 'pointer' }} title="Editar"><Edit size={16} /></button>
                      <button onClick={() => navigate(`/paciente/perfil/${paciente.id}`)} style={{ background: '#f1f5f9', border: 'none', padding: '8px', borderRadius: '6px', color: '#16a34a', cursor: 'pointer' }} title="Ver Perfil"><FileText size={16} /></button>
                      <button onClick={() => { if(window.confirm('Tem certeza que deseja excluir este paciente permanentemente?')) deletePaciente(paciente.id); }} style={{ background: '#fef2f2', border: 'none', padding: '8px', borderRadius: '6px', color: '#ef4444', cursor: 'pointer' }} title="Excluir"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Novo Cliente */}
      {novoClienteModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ background: '#f8fafc', width: '100%', maxWidth: '900px', maxHeight: '90vh', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            
            {/* Header */}
            <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--text-dark)', fontSize: '1.1rem' }}>
                {editingId ? <Edit size={20} /> : <Plus size={20} />} {editingId ? 'Editar Cliente' : 'Novo Cliente'}
              </div>
              <button 
                onClick={closeModal}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div style={{ padding: '32px 24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '40px', background: 'white' }}>
              
              {/* Seção: Dados Pessoais */}
              <div>
                <h3 style={{ fontSize: '1.05rem', color: 'var(--text-dark)', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '24px' }}>
                  Dados pessoais
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Row 1 */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Nome completo</label>
                    <input type="text" placeholder="Informe o nome completo do cliente" value={nome} onChange={(e) => setNome(e.target.value)} style={inputStyle} />
                  </div>
                  
                  {/* Row 2 */}
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Data de Nascimento</label>
                      <div style={{ display: 'flex' }}>
                        <div style={{ background: '#94a3b8', padding: '10px 14px', borderRadius: '8px 0 0 8px', display: 'flex', alignItems: 'center', color: 'white' }}><Calendar size={18} /></div>
                        <input type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} style={{ ...inputStyle, borderRadius: '0 8px 8px 0', borderLeft: 'none', height: '42px', color: 'var(--text-main)', fontFamily: 'inherit' }} />
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Idade</label>
                      <input type="text" value={calcularIdade(dataNascimento)} readOnly placeholder="Automático" style={{ ...inputStyle, backgroundColor: '#f1f5f9', color: 'var(--text-muted)' }} />
                    </div>
                  </div>

                  {/* Row 3 */}
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Telefone</label>
                      <input type="text" value={telefone} onChange={(e) => setTelefone(maskTelefone(e.target.value))} style={inputStyle} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>CPF</label>
                      <input type="text" placeholder="Informe o CPF" value={cpf} onChange={handleCpfChange} style={inputStyle} />
                    </div>
                  </div>

                  {/* Row 4 */}
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Profissão</label>
                      <input type="text" value={profissao} onChange={(e) => setProfissao(e.target.value)} placeholder="Informe a profissão" style={inputStyle} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Gênero</label>
                      <select value={genero} onChange={(e) => setGenero(e.target.value)} style={inputStyle}>
                        <option value="">- Selecione -</option>
                        <option value="Feminino">Feminino</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Estado Civil</label>
                      <select value={estadoCivil} onChange={(e) => setEstadoCivil(e.target.value)} style={inputStyle}>
                        <option value="">- Selecione -</option>
                        <option value="Solteiro(a)">Solteiro(a)</option>
                        <option value="Casado(a)">Casado(a)</option>
                        <option value="Divorciado(a)">Divorciado(a)</option>
                        <option value="Viúvo(a)">Viúvo(a)</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 5 */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Contato de Emergência</label>
                    <input type="text" value={contatoEmergencia} onChange={(e) => setContatoEmergencia(e.target.value)} placeholder="Nome e telefone do contato de emergência" style={inputStyle} />
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
                      <input type="text" placeholder="Informe o CEP" value={cep} onChange={handleCepChange} style={inputStyle} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Logradouro</label>
                      <input type="text" placeholder="Informe o logradouro" value={endereco.logradouro} onChange={handleEnderecoChange('logradouro')} style={inputStyle} />
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Número</label>
                      <input type="text" placeholder="Informe número" style={inputStyle} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Complemento</label>
                      <input type="text" placeholder="Informe o complemento" style={inputStyle} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Bairro</label>
                      <input type="text" placeholder="Informe nome do bairro" value={endereco.bairro} onChange={handleEnderecoChange('bairro')} style={inputStyle} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Cidade</label>
                      <input type="text" placeholder="Informe nome da cidade" value={endereco.cidade} onChange={handleEnderecoChange('cidade')} style={inputStyle} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>UF</label>
                      <input type="text" placeholder="Informe a UF" value={endereco.uf} onChange={handleEnderecoChange('uf')} style={inputStyle} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Extra / Data Cadastro */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ width: '48%' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Data Cadastro</label>
                  <div style={{ display: 'flex' }}>
                    <div style={{ background: '#94a3b8', padding: '10px 14px', borderRadius: '8px 0 0 8px', display: 'flex', alignItems: 'center', color: 'white' }}><Calendar size={18} /></div>
                    <input type="date" defaultValue={new Date().toISOString().split('T')[0]} readOnly style={{ ...inputStyle, borderRadius: '0 8px 8px 0', borderLeft: 'none', height: '42px', color: 'var(--text-main)', fontFamily: 'inherit' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" defaultChecked id="statusAtivo" style={{ width: '18px', height: '18px', accentColor: '#3b82f6', cursor: 'pointer' }} />
                  <label htmlFor="statusAtivo" style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: '0.9rem', cursor: 'pointer' }}>Status ativo</label>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>Como nos conheceu?</label>
                  <select value={comoConheceu} onChange={(e) => setComoConheceu(e.target.value)} style={inputStyle}>
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
                  <textarea rows="4" style={{ ...inputStyle, resize: 'vertical' }}></textarea>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'flex-end', background: 'white', borderTop: '1px solid var(--border-color)' }}>
              <button 
                onClick={handleSave}
                style={{ background: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', padding: '12px 24px', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Save size={18} /> Salvar
              </button>
            </div>

          </div>
        </div>
      )}
      {/* Avaliação Wizard para Novo Cliente */}
      <AvaliacaoWizardModal 
        isOpen={wizardModalOpen} 
        onClose={() => setWizardModalOpen(false)} 
      />

    </div>
  );
}
