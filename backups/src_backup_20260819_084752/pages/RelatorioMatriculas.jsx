import React, { useState } from 'react';
import { Search, FileSpreadsheet, Printer, RefreshCw, Users, CreditCard, DollarSign } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';

export default function RelatorioMatriculas() {
  const { matriculas, pacientes, planos, servicos } = useAppData();
  const [filtroServico, setFiltroServico] = useState('Todos');

  // Filtragem
  const matriculasFiltradas = matriculas.filter(m => {
    if (filtroServico !== 'Todos' && m.modalidade !== filtroServico) return false;
    return true;
  });

  // Cálculos para os Cartões
  const totalMatriculas = matriculasFiltradas.length;
  
  const valorTotalMensal = matriculasFiltradas.reduce((acc, m) => {
    const planoBase = planos.find(p => p.nome === m.plano);
    if (!planoBase) return acc;
    // Se o plano for trimestral, semestral, podemos normalizar para mensal, 
    // mas vamos assumir que o valor base já é mensal ou que queremos a soma bruta por enquanto.
    const valorNum = typeof planoBase.valor === 'string' ? parseFloat(planoBase.valor.replace('R$', '').replace('.', '').replace(',', '.')) : (planoBase.valor || 0);
    return acc + (isNaN(valorNum) ? 0 : valorNum);
  }, 0);

  // Agrupamento por serviço
  const matriculasPorServico = matriculasFiltradas.reduce((acc, m) => {
    acc[m.modalidade] = (acc[m.modalidade] || 0) + 1;
    return acc;
  }, {});

  const printReport = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Cards de Resumo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '16px', background: '#eff6ff', color: '#3b82f6', borderRadius: '12px' }}>
            <Users size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: 0 }}>{totalMatriculas}</h2>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>Matrículas Ativas</p>
          </div>
        </div>
        
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '16px', background: '#dcfce7', color: '#16a34a', borderRadius: '12px' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: 0 }}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorTotalMensal)}
            </h2>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>Faturamento Bruto (Planos)</p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '8px' }}>Por Serviço:</p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {Object.entries(matriculasPorServico).map(([servico, qtd]) => (
              <div key={servico} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '4px 12px', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                {servico}: <span style={{ color: '#0ea5e9' }}>{qtd}</span>
              </div>
            ))}
            {Object.keys(matriculasPorServico).length === 0 && <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Nenhuma matrícula</span>}
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="card" style={{ padding: '24px' }}>
        
        {/* Header & Buttons */}
        <div className="flex-between" style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#1e293b' }}>Relatório de matrículas</h2>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 16px', fontWeight: 600, cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <FileSpreadsheet size={18} /> Exportar matrículas
            </button>
            <button onClick={printReport} style={{ background: '#f0f9ff', color: '#0ea5e9', border: '1px solid #bae6fd', borderRadius: '8px', padding: '10px 16px', fontWeight: 600, cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Printer size={18} /> Imprimir
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dark)', fontWeight: 600, fontSize: '0.85rem' }}>Filtrar por Serviço:</label>
            <select 
              value={filtroServico}
              onChange={(e) => setFiltroServico(e.target.value)}
              style={{ width: '100%', padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', color: 'var(--text-main)', background: 'white', cursor: 'pointer' }}
            >
              <option value="Todos">Todos os Serviços</option>
              {servicos.filter(s => !s.nome.toLowerCase().includes('avalia')).map(s => (
                <option key={s.id} value={s.nome}>{s.nome}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        {matriculasFiltradas.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Paciente/Aluno</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Serviço</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Plano</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Data Inicial</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Valor Mensal</th>
                </tr>
              </thead>
              <tbody>
                {matriculasFiltradas.map(matricula => {
                  const paciente = pacientes.find(p => p.id === matricula.pacienteId);
                  const plano = planos.find(p => p.nome === matricula.plano);
                  const valor = plano?.valor || 'R$ 0,00';
                  
                  return (
                    <tr key={matricula.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 500, color: '#1e293b' }}>
                        {paciente?.nome || 'Paciente não encontrado'}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>
                        <span style={{ background: '#eff6ff', color: '#3b82f6', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                          {matricula.modalidade}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>{matricula.plano}</td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>
                        {matricula.data ? new Date(matricula.data).toLocaleDateString('pt-BR') : '-'}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#10b981' }}>{valor}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ background: '#fef08a', color: '#854d0e', padding: '16px 20px', borderRadius: '8px', fontSize: '0.95rem' }}>
            <strong style={{ fontWeight: 700 }}>Atenção!</strong> <span style={{ fontWeight: 500 }}>Nenhum registro foi encontrado para os filtros selecionados.</span>
          </div>
        )}

      </div>
    </div>
  );
}
