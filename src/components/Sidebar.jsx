import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, Info, User, LogOut, ChevronRight, ChevronDown, PlusCircle, Activity, FileText, Wallet, BookOpen } from 'lucide-react';
import logoImg from '../assets/logo.png';
import { useCompany } from '../context/CompanyContext';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';

export default function Sidebar() {
  const [cadastroOpen, setCadastroOpen] = useState(false);
  const [financeiroOpen, setFinanceiroOpen] = useState(false);
  const [relatoriosOpen, setRelatoriosOpen] = useState(true);
  const { companyData } = useCompany();
  const { currentUser, logout } = useAuth();
  

  const firstName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Profissional';
  const lastName = currentUser?.name ? currentUser.name.split(' ').slice(1).join(' ') : '';
  const role = currentUser?.cargo || 'Instrutor / Fisioterapeuta';

  return (
    <aside className="sidebar">
      {/* Logo Area */}
      {companyData?.name ? (
        <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px' }}>
          <div style={{ width: '110px', height: '110px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white' }}>
            {companyData.logoBase64 ? (
              <img src={companyData.logoBase64} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.7)' }} />
            ) : (
              <User size={32} color="#cbd5e1" />
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-color)' }}>{companyData.name}</span>
            <span style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--text-muted)', letterSpacing: '1px', marginTop: '2px' }}>CLÍNICA</span>
          </div>
        </div>
      ) : (
        <div className="sidebar-logo" style={{ padding: '32px 16px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-accent)', color: 'var(--primary-color)', fontWeight: 700, fontSize: '1.25rem' }}>
          <div style={{ background: 'var(--primary-color)', color: 'white', padding: '6px', borderRadius: '8px', display: 'flex' }}>
            <Calendar size={20} />
          </div>
          <span>Agenda<span style={{fontWeight: 300, fontSize: '0.9rem', verticalAlign: 'middle', marginLeft: '4px'}}>digital</span></span>
        </div>
      )}
      
      {/* User Info */}
      <div className="sidebar-user">
        <div className="user-profile">
          <div className="user-avatar" style={{ overflow: 'hidden' }}>
            {currentUser?.avatarBase64 ? (
              <img src={currentUser.avatarBase64} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            ) : (
              <User size={24} />
            )}
          </div>
          <div className="user-info">
            <span style={{ fontWeight: 600, color: 'var(--text-dark)', textTransform: 'capitalize' }}>{firstName}</span>
            {lastName && <span style={{ fontWeight: 600, color: 'var(--text-dark)', textTransform: 'capitalize' }}>{lastName}</span>}
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{role}</span>
          </div>
        </div>
        <div className="user-actions">
          <NavLink to="/perfil" title="Meu Perfil" style={{ color: 'inherit', display: 'flex' }}><User size={18} /></NavLink>
          <button title="Sair" onClick={logout}><LogOut size={18} /></button>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <div className="nav-item-left"><LayoutDashboard size={20} /> Painel Geral</div>
        </NavLink>
        <NavLink to="/agenda" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <div className="nav-item-left"><Calendar size={20} /> Agenda</div>
        </NavLink>
        <NavLink to="/pacientes" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <div className="nav-item-left"><Users size={20} /> Clientes</div>
        </NavLink>

        <div className="nav-section">Módulos</div>

        {/* Cadastro Dropdown */}
        <div>
          <button 
            className="nav-item" 
            style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer' }}
            onClick={() => setCadastroOpen(!cadastroOpen)}
          >
            <div className="nav-item-left"><PlusCircle size={20} /> Cadastro</div>
            {cadastroOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          
          {cadastroOpen && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px', paddingLeft: '32px' }}>
              <NavLink to="/servicos" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                Serviços
              </NavLink>
              <NavLink to="/planos" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                Planos
              </NavLink>
              <NavLink to="/profissionais" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                Profissionais
              </NavLink>
              <NavLink to="/feriados" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                Feriados
              </NavLink>
            </div>
          )}
        </div>

        <NavLink to="/evolucoes" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <div className="nav-item-left"><Activity size={20} /> Evoluções</div>
        </NavLink>
        <NavLink to="/matriculas" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <div className="nav-item-left"><BookOpen size={20} /> Matrículas</div>
        </NavLink>
        
        {/* Financeiro Dropdown */}
        <div>
          <button 
            className="nav-item" 
            style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer' }}
            onClick={() => setFinanceiroOpen(!financeiroOpen)}
          >
            <div className="nav-item-left"><Wallet size={20} /> Financeiro</div>
            {financeiroOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          
          {financeiroOpen && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px', paddingLeft: '32px' }}>
              <NavLink to="/dashboard-pagamentos" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                Dashboard de pagamentos
              </NavLink>
              <NavLink to="/recebimentos" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                Recebimentos
              </NavLink>
              <NavLink to="/controle-despesas" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                Controle de despesas
              </NavLink>
              <NavLink to="/fechamento-comissao" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                Fechamento comissão
              </NavLink>
              <NavLink to="/balanco-financeiro" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                Balanço financeiro
              </NavLink>
            </div>
          )}
        </div>

        {/* Relatórios Dropdown */}
        <div>
          <button 
            className="nav-item" 
            style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer' }}
            onClick={() => setRelatoriosOpen(!relatoriosOpen)}
          >
            <div className="nav-item-left"><FileText size={20} /> Relatórios</div>
            {relatoriosOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          
          {relatoriosOpen && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px', paddingLeft: '32px' }}>
              <NavLink to="/relatorio-aulas" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                Relatório de aulas
              </NavLink>
              <NavLink to="/relatorio-fechamento" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                Fechamento (NF)
              </NavLink>
              <NavLink to="/relatorio-comissoes" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                Comissões
              </NavLink>
            </div>
          )}
        </div>

        

      </nav>
    </aside>
  );
}

