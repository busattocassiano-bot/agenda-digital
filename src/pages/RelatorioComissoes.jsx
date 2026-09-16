import React, { useState, useMemo } from 'react';
import { Search, FileSpreadsheet, Printer, Calendar as CalendarIcon, ChevronDown, DollarSign, TrendingUp, CheckCircle } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';

export default function RelatorioComissoes() {
  const { agendamentos, matriculas, pacientes, servicos, planos } = useAppData();
  
  const [mes, setMes] = useState(new Date().getMonth());
  const [ano, setAno] = useState(new Date().getFullYear());

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Calcular Repasses
  const repasses = useMemo(() => {
    const itens = [];

    // 1. Adicionar Planos Mensais (Matrículas Ativas)
    // Assumimos que todas as matrículas atuais estão ativas no mês selecionado para simplificar
    matriculas.forEach(matricula => {
      const paciente = pacientes.find(p => p.id === matricula.pacienteId);
      const plano = planos.find(p => p.nome === matricula.plano);
      
      const valorBase = plano?.valor 
        ? parseFloat(plano.valor.toString().replace('R$', '').replace('.', '').replace(',', '.')) 
        : 0;

      itens.push({
        id: `mat-${matricula.id}`,
        tipo: 'Plano Mensal',
        descricao: `${matricula.plano} - ${matricula.modalidade}`,
        paciente: paciente?.nome || 'Desconhecido',
        data: `Mês inteiro`,
        valorBase: isNaN(valorBase) ? 0 : valorBase
      });
    });

    // 2. Adicionar Sessões Avulsas (Realizadas no mês)
    agendamentos.forEach(ag => {
      if (ag.status !== 'realizado' || ag.tipo === 'bloqueio') return;

      const agDate = new Date(ag.data + 'T12:00:00');
      if (agDate.getMonth() !== parseInt(mes) || agDate.getFullYear() !== parseInt(ano)) return;

      const servico = servicos.find(s => s.id === ag.servicoId);
      const paciente = pacientes.find(p => p.id === ag.pacienteId);

      // Checar se o paciente possui matrícula para este serviço
      const temMatricula = matriculas.some(m => m.pacienteId === ag.pacienteId && m.modalidade === servico?.nome);

      if (!temMatricula) {
        // É avulso
        const valorServico = servico?.valor 
          ? parseFloat(servico.valor.toString().replace('R$', '').replace('.', '').replace(',', '.')) 
          : 80; // Valor fallback caso não tenha valor configurado

        itens.push({
          id: `ag-${ag.id}`,
          tipo: 'Sessão Avulsa',
          descricao: servico?.nome || 'Sessão',
          paciente: paciente?.nome || 'Desconhecido',
          data: new Date(ag.data + 'T12:00:00').toLocaleDateString('pt-BR'),
          valorBase: isNaN(valorServico) ? 0 : valorServico
        });
      }
    });

    return itens;
  }, [agendamentos, matriculas, pacientes, servicos, planos, mes, ano]);

  const totalFaturamento = repasses.reduce((acc, item) => acc + item.valorBase, 0);
  const totalSessoesAvulsas = repasses.filter(i => i.tipo === 'Sessão Avulsa').length;
  const totalPlanos = repasses.filter(i => i.tipo === 'Plano Mensal').length;

  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Cards de Resumo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '16px', background: '#dcfce7', color: '#16a34a', borderRadius: '12px' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: 0, color: '#16a34a' }}>{formatCurrency(totalFaturamento)}</h2>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>Faturamento Bruto Estimado</p>
          </div>
        </div>
        
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '16px', background: '#e0f2fe', color: '#0284c7', borderRadius: '12px' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: 0 }}>{totalPlanos}</h2>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>Planos Contabilizados</p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '16px', background: '#fef9c3', color: '#ca8a04', borderRadius: '12px' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: 0 }}>{totalSessoesAvulsas}</h2>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>Sessões Avulsas Realizadas</p>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="card" style={{ padding: '24px' }}>
        
        {/* Header & Buttons */}
        <div className="flex-between" style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#1e293b' }}>Repasses e Comissões</h2>
          
          <div style={{ display: 'flex', gap: '12px' }}>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-end', paddingBottom: '16px', flexWrap: 'wrap' }}>
          
          <div style={{ flex: '1 1 150px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dark)', fontWeight: 600, fontSize: '0.85rem' }}>Mês</label>
            <select 
              value={mes} 
              onChange={(e) => setMes(e.target.value)}
              style={{ width: '100%', padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', color: 'var(--text-main)', background: 'white' }}
            >
              {meses.map((m, idx) => (
                <option key={idx} value={idx}>{m}</option>
              ))}
            </select>
          </div>
          
          <div style={{ flex: '1 1 150px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dark)', fontWeight: 600, fontSize: '0.85rem' }}>Ano</label>
            <select 
              value={ano} 
              onChange={(e) => setAno(e.target.value)}
              style={{ width: '100%', padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', color: 'var(--text-main)', background: 'white' }}
            >
              {[2024, 2025, 2026, 2027].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: '2 1 200px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dark)', fontWeight: 600, fontSize: '0.85rem' }}>Profissional:</label>
            <div style={{ position: 'relative' }}>
              <select style={{ width: '100%', padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', color: 'var(--text-main)', background: 'white', appearance: 'none', cursor: 'pointer' }}>
                <option>Todos</option>
              </select>
              <ChevronDown size={16} color="var(--text-muted)" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
          </div>
        </div>

        {/* Table */}
        {repasses.length > 0 ? (
          <div style={{ overflowX: 'auto', marginTop: '24px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Tipo</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Descrição</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Paciente/Aluno</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Data de Referência</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Valor Gerado</th>
                </tr>
              </thead>
              <tbody>
                {repasses.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ 
                        background: item.tipo === 'Plano Mensal' ? '#eff6ff' : '#fef9c3', 
                        color: item.tipo === 'Plano Mensal' ? '#2563eb' : '#a16207', 
                        padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 
                      }}>
                        {item.tipo}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#475569', fontWeight: 500 }}>{item.descricao}</td>
                    <td style={{ padding: '12px 16px', color: '#1e293b' }}>{item.paciente}</td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>{item.data}</td>
                    <td style={{ padding: '12px 16px', color: '#16a34a', fontWeight: 600 }}>
                      {formatCurrency(item.valorBase)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ background: '#fef08a', color: '#854d0e', padding: '16px 20px', borderRadius: '8px', fontSize: '0.95rem', marginTop: '24px' }}>
            <strong style={{ fontWeight: 700 }}>Atenção!</strong> <span style={{ fontWeight: 500 }}>Nenhum atendimento avulso ou plano ativo encontrado neste mês.</span>
          </div>
        )}

      </div>

    </div>
  );
}
