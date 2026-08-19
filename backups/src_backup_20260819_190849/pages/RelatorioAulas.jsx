import React, { useState, useMemo } from 'react';
import { Search, FileSpreadsheet, Printer, RefreshCw, Calendar as CalendarIcon, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';

export default function RelatorioAulas() {
  const { agendamentos, pacientes, servicos } = useAppData();
  
  // States para filtros
  const [dataInicio, setDataInicio] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [dataFim, setDataFim] = useState(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]);
  const [statusFiltro, setStatusFiltro] = useState('Todos');

  // Filtragem
  const agendamentosFiltrados = useMemo(() => {
    return agendamentos.filter(ag => {
      // Ignorar bloqueios
      if (ag.tipo === 'bloqueio') return false;

      // Filtro de Data
      const agDate = new Date(ag.data);
      const start = new Date(dataInicio + 'T00:00:00');
      const end = new Date(dataFim + 'T23:59:59');
      
      if (agDate < start || agDate > end) return false;

      // Filtro de Status
      if (statusFiltro !== 'Todos' && ag.status !== statusFiltro) return false;

      return true;
    }).sort((a, b) => new Date(`${a.data}T${a.hora}`) - new Date(`${b.data}T${b.hora}`));
  }, [agendamentos, dataInicio, dataFim, statusFiltro]);

  // Cálculos para Cartões
  const totalAgendadas = agendamentosFiltrados.filter(ag => ag.status === 'agendado').length;
  const totalRealizadas = agendamentosFiltrados.filter(ag => ag.status === 'realizado').length;
  const totalFaltas = agendamentosFiltrados.filter(ag => ag.status === 'falta').length;

  const printReport = () => {
    window.print();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'agendado': return { bg: '#e0f2fe', text: '#0369a1', label: 'Agendado' };
      case 'confirmado': return { bg: '#fef9c3', text: '#a16207', label: 'Confirmado' };
      case 'realizado': return { bg: '#dcfce7', text: '#15803d', label: 'Realizado' };
      case 'falta': return { bg: '#fee2e2', text: '#b91c1c', label: 'Falta' };
      default: return { bg: '#f1f5f9', text: '#475569', label: status };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Cards de Resumo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '16px', background: '#e0f2fe', color: '#0369a1', borderRadius: '12px' }}>
            <CalendarIcon size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: 0 }}>{totalAgendadas}</h2>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>Aulas Agendadas</p>
          </div>
        </div>
        
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '16px', background: '#dcfce7', color: '#15803d', borderRadius: '12px' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: 0 }}>{totalRealizadas}</h2>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>Aulas Realizadas</p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '16px', background: '#fee2e2', color: '#b91c1c', borderRadius: '12px' }}>
            <XCircle size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: 0 }}>{totalFaltas}</h2>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>Faltas (Ausências)</p>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="card" style={{ padding: '24px' }}>
        
        {/* Header & Buttons */}
        <div className="flex-between" style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#1e293b' }}>Relatório de Aulas</h2>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 16px', fontWeight: 600, cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <FileSpreadsheet size={18} /> Exportar
            </button>
            <button onClick={printReport} style={{ background: '#f0f9ff', color: '#0ea5e9', border: '1px solid #bae6fd', borderRadius: '8px', padding: '10px 16px', fontWeight: 600, cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Printer size={18} /> Imprimir
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dark)', fontWeight: 600, fontSize: '0.85rem' }}>Data Início</label>
            <input 
              type="date" 
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              style={{ width: '100%', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 12px', outline: 'none', color: 'var(--text-main)', background: 'white' }} 
            />
          </div>
          
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dark)', fontWeight: 600, fontSize: '0.85rem' }}>Data Final</label>
            <input 
              type="date" 
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              style={{ width: '100%', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 12px', outline: 'none', color: 'var(--text-main)', background: 'white' }} 
            />
          </div>

          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dark)', fontWeight: 600, fontSize: '0.85rem' }}>Status:</label>
            <select 
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              style={{ width: '100%', padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', color: 'var(--text-main)', background: 'white', cursor: 'pointer' }}
            >
              <option value="Todos">Todos os Status</option>
              <option value="agendado">Agendado</option>
              <option value="confirmado">Confirmado</option>
              <option value="realizado">Realizado</option>
              <option value="falta">Falta</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {agendamentosFiltrados.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Data</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Hora</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Paciente/Aluno</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Serviço</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {agendamentosFiltrados.map(ag => {
                  const paciente = pacientes.find(p => p.id === ag.pacienteId);
                  const servico = servicos.find(s => s.id === ag.servicoId);
                  const statusInfo = getStatusColor(ag.status);
                  
                  return (
                    <tr key={ag.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', color: '#475569', fontWeight: 500 }}>
                        {new Date(ag.data + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#475569' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock size={14} /> {ag.hora}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 500, color: '#1e293b' }}>
                        {paciente?.nome || 'Paciente não encontrado'}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>
                        {servico?.nome || 'Serviço'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ 
                          background: statusInfo.bg, 
                          color: statusInfo.text, 
                          padding: '4px 10px', 
                          borderRadius: '16px', 
                          fontSize: '0.75rem', 
                          fontWeight: 600 
                        }}>
                          {statusInfo.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ background: '#fef08a', color: '#854d0e', padding: '16px 20px', borderRadius: '8px', fontSize: '0.95rem' }}>
            <strong style={{ fontWeight: 700 }}>Atenção!</strong> <span style={{ fontWeight: 500 }}>Nenhum agendamento encontrado para este período.</span>
          </div>
        )}

      </div>
    </div>
  );
}
