import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    // Simulando tempo de resposta do servidor
    setTimeout(() => {
      const success = login(email, password);
      if (success) {
        navigate('/');
      } else {
        setErrorMsg('E-mail ou senha incorretos.');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-main)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* Logo Padrão do Sistema */}
        <div style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'var(--primary-color)', color: 'white', padding: '16px', borderRadius: '16px', display: 'flex' }}>
            <Calendar size={48} />
          </div>
          <h1 style={{ fontSize: '1.25rem', color: 'var(--primary-color)', textAlign: 'center', fontWeight: 700 }}>
            Agenda<span style={{fontWeight: 300}}>digital</span>
          </h1>
        </div>

        {errorMsg && (
          <div style={{ width: '100%', padding: '12px', marginBottom: '16px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', fontSize: '0.85rem', textAlign: 'center' }}>
            {errorMsg}
          </div>
        )}

        {/* Form de Login */}
        <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>E-mail</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', backgroundColor: '#f8fafc' }} 
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Senha</label>
            <input 
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', backgroundColor: '#f8fafc' }} 
            />
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            style={{ 
              background: 'var(--primary-color)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              padding: '14px', 
              fontWeight: 600, 
              cursor: loading ? 'wait' : 'pointer', 
              marginTop: '16px',
              opacity: loading ? 0.7 : 1
            }}>
            {loading ? 'Entrando...' : 'Entrar no Sistema'}
          </button>
        </form>

        <div style={{ marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Ainda não tem uma conta?{' '}
          <Link to="/cadastro" style={{ color: 'var(--primary-color)', fontWeight: 600, textDecoration: 'none' }}>
            Cadastre-se aqui
          </Link>
        </div>

      </div>
    </div>
  );
}
