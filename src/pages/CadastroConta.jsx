import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar } from 'lucide-react';

export default function CadastroConta() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (password !== confirmPassword) {
      setErrorMsg('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    
    const result = await register(email, password, name);
    if (result.success) {
      alert('Conta criada com sucesso! Faça login para continuar.');
      navigate('/login');
    } else {
      setErrorMsg(`Erro do Google: ${result.error}`);
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-main)', padding: '24px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* Logo Padrão do Sistema */}
        <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={{ background: 'var(--primary-color)', color: 'white', padding: '12px', borderRadius: '12px', display: 'flex' }}>
            <Calendar size={32} />
          </div>
          <h1 style={{ fontSize: '1.25rem', color: 'var(--primary-color)', textAlign: 'center', fontWeight: 700 }}>
            Agenda<span style={{fontWeight: 300}}>digital</span>
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Crie sua conta para começar</p>
        </div>

        {errorMsg && (
          <div style={{ width: '100%', padding: '12px', marginBottom: '16px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', fontSize: '0.85rem', textAlign: 'center' }}>
            {errorMsg}
          </div>
        )}

        {/* Form de Cadastro */}
        <form onSubmit={handleRegister} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Nome Completo</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Nome e Sobrenome"
              style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', backgroundColor: '#f8fafc' }} 
            />
          </div>
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
              placeholder="Crie uma senha forte"
              style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', backgroundColor: '#f8fafc' }} 
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Confirme sua Senha</label>
            <input 
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita a senha"
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
              marginTop: '8px',
              opacity: loading ? 0.7 : 1
            }}>
            {loading ? 'Criando Conta...' : 'Criar Minha Conta'}
          </button>
        </form>

        <div style={{ marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Já tem uma conta?{' '}
          <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: 600, textDecoration: 'none' }}>
            Faça Login
          </Link>
        </div>

      </div>
    </div>
  );
}
