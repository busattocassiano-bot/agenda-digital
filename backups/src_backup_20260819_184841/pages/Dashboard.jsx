import React from 'react';
import { Users, FileText, Calendar, BarChart2, TrendingUp, TrendingDown, Cake, AlertTriangle, XCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppData } from '../context/AppDataContext';
import { format, isSameDay, startOfMonth, endOfMonth, isWithinInterval, addDays, subDays, getMonth, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Dashboard() {
  const { pacientes, matriculas, agendamentos, recebimentos, despesas, planos } = useAppData();
  const hoje = new Date();
  
  // Clientes Ativos (pacientes com pelo menos 1 matrícula ativa)
  const matriculasAtivas = matriculas.filter(m => m.status !== 'Encerrada' && m.status !== 'Cancelada');
  const clientesAtivosIds = new Set(matriculasAtivas.map(m => m.pacienteId));
  const totalClientesAtivos = clientesAtivosIds.size;
  
  // Planos Ativos
  const totalPlanosAtivos = matriculasAtivas.length;
  
  // Aulas Hoje
  const agendamentosHoje = agendamentos.filter(a => a.data === format(hoje, 'yyyy-MM-dd') && a.status !== 'cancelado' && !a.isBlock);
  const totalAulasHoje = agendamentosHoje.length;
  
  // Aulas no Mês Atual
  const mesAtualInicio = format(startOfMonth(hoje), 'yyyy-MM-dd');
  const mesAtualFim = format(endOfMonth(hoje), 'yyyy-MM-dd');
  const agendamentosMes = agendamentos.filter(a => a.data >= mesAtualInicio && a.data <= mesAtualFim && a.status !== 'cancelado' && !a.isBlock);
  const totalAulasMes = agendamentosMes.length;

  // Agendas de Hoje por tipo
  const agendasFixa = agendamentosHoje.filter(a => a.matriculaId && !a.isPacienteNaoCadastrado).length;
  const agendasRepor = agendamentosHoje.filter(a => a.servico === 'Reposição' || a.tipo === 'Reposicao').length; // Supondo tipo
  

  // Receitas e Despesas (Mês Atual)
  const mesAtualStr = format(hoje, 'MM/yyyy');
  
  const receitaMes = recebimentos
    .filter(r => r.dataVencimento.includes(mesAtualStr) || (r.dataPagamento && r.dataPagamento.includes(mesAtualStr)))
    .reduce((acc, curr) => acc + (curr.valorPago || 0), 0);
    
  const despesaMes = despesas
    .filter(d => d.dataVencimento.includes(mesAtualStr) || (d.dataPagamento && d.dataPagamento.includes(mesAtualStr)))
    .reduce((acc, curr) => acc + (curr.valorPago || 0), 0);

  // Aniversariantes do Mês
  const mesAtualNum = hoje.getMonth() + 1;
  const aniversariantesMes = pacientes.filter(p => {
    if (!p.dataNascimento) return false;
    const parts = p.dataNascimento.split('-');
    return parseInt(parts[1], 10) === mesAtualNum;
  });

  // Finalizando em 15 dias (Baseado na quantidade de sessões)
  let planosFinalizando = 0;
  let planosFinalizadosRecente = 0;
  
  matriculas.forEach(m => {
    const planoRef = planos.find(p => p.nome === m.plano);
    if (planoRef && parseInt(planoRef.qtdSessoes) > 1) {
       const realizadas = m.sessoesRealizadas || 0;
       const total = parseInt(planoRef.qtdSessoes);
       if (m.status === 'Encerrada') {
          // Assume finalizados recentes como os que encerraram... 
          // sem data de encerramento exata, vamos contar os que bateram a meta.
          planosFinalizadosRecente++;
       } else if (total - realizadas <= 2) {
          planosFinalizando++;
       }
    }
  });

  // Gráfico Evolução Mensal (Simulado baseado no mês atual para os últimos 6 meses)
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const d = subDays(hoje, i * 30);
    const label = format(d, 'MMM./yyyy', { locale: ptBR });
    // Simulando crescimento
    chartData.push({ name: label, alunos: Math.max(0, totalClientesAtivos - i * 2) });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '32px' }}>
      
      {/* 4 Cards Superiores */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '16px', background: '#e0f2fe', color: '#0284c7', borderRadius: '12px' }}>
            <Users size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: 0 }}>{totalClientesAtivos}</h2>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>Clientes Ativos</p>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '16px', background: '#fef3c7', color: '#d97706', borderRadius: '12px' }}>
            <FileText size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: 0 }}>{totalPlanosAtivos}</h2>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>Planos Ativos</p>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '16px', background: '#dcfce7', color: '#16a34a', borderRadius: '12px' }}>
            <Calendar size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: 0 }}>{totalAulasHoje}</h2>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>Aulas Hoje</p>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '16px', background: '#ccfbf1', color: '#0d9488', borderRadius: '12px' }}>
            <BarChart2 size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: 0 }}>{totalAulasMes}</h2>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>Aulas - {format(hoje, 'MMM./yyyy', {locale: ptBR})}</p>
          </div>
        </div>
      </div>

      {/* 2 Cards Intermediários */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '24px' }}>Agendas de Hoje</h3>
          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            <div>
              <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>{agendasFixa}</h2>
              <span style={{ background: '#f3e8ff', color: '#9333ea', padding: '4px 12px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 600 }}>Agenda Fixa</span>
            </div>
            <div>
              <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>{agendasRepor}</h2>
              <span style={{ background: '#ffedd5', color: '#ea580c', padding: '4px 12px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 600 }}>Reposições</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex-between mb-4">
            <h3 style={{ fontSize: '1.1rem' }}>Receitas e Despesas - {format(hoje, 'MMM./yyyy', {locale: ptBR})}</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer' }}>Ocultar</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: '80px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: '#dcfce7', color: '#16a34a', padding: '8px', borderRadius: '50%' }}>
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '4px' }}>Receita</p>
                <h2 style={{ fontSize: '1.8rem', color: '#16a34a', margin: 0 }}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(receitaMes)}
                </h2>
              </div>
            </div>
            <div style={{ width: '1px', height: '100%', background: 'var(--border-color)' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: '#fee2e2', color: '#ef4444', padding: '8px', borderRadius: '50%' }}>
                <TrendingDown size={24} />
              </div>
              <div>
                <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '4px' }}>Despesas</p>
                <h2 style={{ fontSize: '1.8rem', color: '#ef4444', margin: 0 }}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(despesaMes)}
                </h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Cards de Alertas */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '24px' }}>Aniversariantes de {format(hoje, 'MMMM', {locale: ptBR})}</h3>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <div style={{ padding: '16px', background: '#eff6ff', color: '#3b82f6', borderRadius: '50%', marginBottom: '16px' }}>
              <Cake size={32} />
            </div>
            {aniversariantesMes.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, width: '100%' }}>
                {aniversariantesMes.map(p => (
                  <li key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 16px', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ fontWeight: 600, color: '#334155' }}>{p.nome}</span>
                    <span>{p.dataNascimento.split('-').reverse().join('/')}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ fontWeight: 500 }}>Não há aniversariantes neste mês</p>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Finalizando sessões</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '12px', background: '#fef3c7', color: '#d97706', borderRadius: '12px' }}>
                <AlertTriangle size={24} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{planosFinalizando}</h2>
                <p className="text-muted" style={{ fontSize: '0.8rem' }}>Planos (≤ 2 restantes)</p>
              </div>
            </div>
          </div>
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Finalizados recentemente</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '12px', background: '#eff6ff', color: '#3b82f6', borderRadius: '12px' }}>
                <XCircle size={24} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{planosFinalizadosRecente}</h2>
                <p className="text-muted" style={{ fontSize: '0.8rem' }}>Planos Encerrados</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico */}
      <div className="card">
        <div className="flex-between mb-4">
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={20} color="var(--text-muted)"/> Evolução Mensal de Alunos
          </h3>
          <div style={{ display: 'flex', gap: '8px', fontSize: '0.8rem' }}>
            <button style={{ padding: '4px 12px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}>3 meses</button>
            <button style={{ padding: '4px 12px', border: 'none', background: '#fce7f3', color: '#db2777', borderRadius: '16px', fontWeight: 600 }}>6 meses</button>
            <button style={{ padding: '4px 12px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}>12 meses</button>
            <button style={{ padding: '4px 12px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}>Desde o início</button>
          </div>
        </div>
        <div style={{ height: '300px', marginTop: '32px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} ticks={[0, 1]} domain={[0, 1]} />
              <Tooltip />
              <Line type="monotone" dataKey="alunos" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
