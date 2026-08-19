import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Search, ZoomIn, Menu as MenuIcon, Building } from 'lucide-react';

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-area">
        <header className="top-header">
          <div className="search-bar">
            <Search size={18} color="var(--text-muted)" />
            <input type="text" placeholder="Pesquisar aluno" />
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', color: 'var(--text-dark)', fontWeight: 500, position: 'relative' }}>
            <ZoomIn size={20} style={{ cursor: 'pointer' }} />
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
