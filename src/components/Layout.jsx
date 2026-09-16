import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Search, ZoomIn, Menu as MenuIcon, Building, User } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const searchRef = useRef(null);
  
  const { pacientes } = useAppData();

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const searchResults = searchTerm.length >= 2 
    ? pacientes.filter(p => p.nome.toLowerCase().includes(searchTerm.toLowerCase()) || p.telefone?.includes(searchTerm))
    : [];

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-area">
        <header className="top-header">
          <div className="search-bar" ref={searchRef} style={{ position: 'relative' }}>
            <Search size={18} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Pesquisar aluno" 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSearch(true);
              }}
              onFocus={() => setShowSearch(true)}
              style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent' }}
            />
            
            {showSearch && searchTerm.length >= 2 && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                width: '100%',
                maxHeight: '300px',
                overflowY: 'auto',
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                zIndex: 1000
              }}>
                {searchResults.length > 0 ? (
                  searchResults.map(p => (
                    <div 
                      key={p.id}
                      onClick={() => {
                        setSearchTerm('');
                        setShowSearch(false);
                        navigate(`/paciente/perfil/${p.id}`);
                      }}
                      style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                    >
                      <User size={16} color="var(--primary-color)" />
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 500, color: '#334155' }}>{p.nome}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{p.telefone || 'Sem telefone'}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '12px', fontSize: '0.9rem', color: '#64748b', textAlign: 'center' }}>
                    Nenhum aluno encontrado
                  </div>
                )}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', color: 'var(--text-dark)', fontWeight: 500, position: 'relative' }}>
            <ZoomIn size={20} style={{ cursor: 'pointer', display: 'none' }} />
            <div ref={menuRef} style={{ position: 'relative' }}>
              <div 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px', borderRadius: '8px', background: menuOpen ? '#f1f5f9' : 'transparent' }}
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <MenuIcon size={20} />
                Menu
              </div>
              
              {menuOpen && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', padding: '8px', width: '200px', zIndex: 100 }}>
                  <div 
                    onClick={() => {
                      setMenuOpen(false);
                      navigate('/empresa');
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', cursor: 'pointer', borderRadius: '6px', fontSize: '0.9rem', color: '#334155', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Building size={16} />
                    Dados da Clínica
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
