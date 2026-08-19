import React, { createContext, useState, useEffect, useContext } from 'react';
import { useCompany } from './CompanyContext';

const AppDataContext = createContext({});

export function AppDataProvider({ children }) {
  const { companyData } = useCompany();
  const prefix = companyData?.id ? `c_${companyData.id}_` : 'default_';

  // Migration logic inside useEffect
  useEffect(() => {
    if (companyData?.id) {
      const migrationFlag = localStorage.getItem('legacyDataMigrated');
      if (migrationFlag !== 'true') {
        const legacyKeys = [
          'pacientes', 'profissionais', 'cargos', 'planos', 'servicos', 
          'agendamentos', 'evolucoes', 'agenda-matriculas', 'agenda-avaliacoes', 
          'agenda-recebimentos', 'agenda-despesas', 'feriados'
        ];
        
        legacyKeys.forEach(k => {
          const oldData = localStorage.getItem(k);
          if (oldData) {
            localStorage.setItem(`c_${companyData.id}_${k}`, oldData);
          }
        });
        
        localStorage.setItem('legacyDataMigrated', 'true');
        window.location.reload();
      }
    }
  }, [companyData]);

  const loadState = (key, defaultValue) => {
    const saved = localStorage.getItem(prefix + key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return defaultValue;
      }
    }
    return defaultValue;
  };

  // --- States ---
  const [pacientes, setPacientes] = useState(() => loadState('pacientes', []));
  const [profissionais, setProfissionais] = useState(() => loadState('profissionais', []));
  const [cargos, setCargos] = useState(() => loadState('cargos', []));
  const [planos, setPlanos] = useState(() => loadState('planos', []));
  const [servicos, setServicos] = useState(() => loadState('servicos', []));
  const [agendamentos, setAgendamentos] = useState(() => loadState('agendamentos', []));
  const [evolucoes, setEvolucoes] = useState(() => loadState('evolucoes', []));
  const [matriculas, setMatriculas] = useState(() => loadState('agenda-matriculas', []));
  const [avaliacoes, setAvaliacoes] = useState(() => loadState('agenda-avaliacoes', []));
  const [recebimentos, setRecebimentos] = useState(() => loadState('agenda-recebimentos', []));
  const [despesas, setDespesas] = useState(() => loadState('agenda-despesas', []));
  const [feriados, setFeriados] = useState(() => loadState('feriados', []));

  // Reload states when company prefix changes
  useEffect(() => {
    setPacientes(loadState('pacientes', []));
    setProfissionais(loadState('profissionais', []));
    setCargos(loadState('cargos', []));
    setPlanos(loadState('planos', []));
    setServicos(loadState('servicos', []));
    setAgendamentos(loadState('agendamentos', []));
    setEvolucoes(loadState('evolucoes', []));
    setMatriculas(loadState('agenda-matriculas', []));
    setAvaliacoes(loadState('agenda-avaliacoes', []));
    setRecebimentos(loadState('agenda-recebimentos', []));
    setDespesas(loadState('agenda-despesas', []));
    setFeriados(loadState('feriados', []));
  }, [prefix]);

  // --- Effect to save on change ---
  // intentionally omitting prefix from dependency array to avoid overwriting new prefix with old state
  useEffect(() => { localStorage.setItem(prefix + 'pacientes', JSON.stringify(pacientes)); }, [pacientes]);
  useEffect(() => { localStorage.setItem(prefix + 'profissionais', JSON.stringify(profissionais)); }, [profissionais]);
  useEffect(() => { localStorage.setItem(prefix + 'cargos', JSON.stringify(cargos)); }, [cargos]);
  useEffect(() => { localStorage.setItem(prefix + 'planos', JSON.stringify(planos)); }, [planos]);
  useEffect(() => { localStorage.setItem(prefix + 'servicos', JSON.stringify(servicos)); }, [servicos]);
  useEffect(() => { localStorage.setItem(prefix + 'agendamentos', JSON.stringify(agendamentos)); }, [agendamentos]);
  useEffect(() => { localStorage.setItem(prefix + 'evolucoes', JSON.stringify(evolucoes)); }, [evolucoes]);
  useEffect(() => { localStorage.setItem(prefix + 'agenda-recebimentos', JSON.stringify(recebimentos)); }, [recebimentos, prefix]);
  useEffect(() => { localStorage.setItem(prefix + 'agenda-despesas', JSON.stringify(despesas)); }, [despesas, prefix]);
  useEffect(() => { localStorage.setItem(prefix + 'feriados', JSON.stringify(feriados)); }, [feriados, prefix]);
  useEffect(() => {
    localStorage.setItem(prefix + 'agenda-matriculas', JSON.stringify(matriculas));
    localStorage.setItem(prefix + 'agenda-avaliacoes', JSON.stringify(avaliacoes));
    localStorage.setItem(prefix + 'agenda-recebimentos', JSON.stringify(recebimentos));
    localStorage.setItem(prefix + 'agenda-despesas', JSON.stringify(despesas));
  }, [matriculas, avaliacoes, recebimentos, despesas]);

  // --- Actions ---
  const addPaciente = (paciente) => {
    const newId = Date.now().toString();
    setPacientes([...pacientes, { ...paciente, id: newId }]);
    return newId;
  };

  const addProfissional = (profissional) => {
    setProfissionais([...profissionais, { ...profissional, id: Date.now().toString() }]);
  };

  const addCargo = (cargo) => {
    setCargos([...cargos, { ...cargo, id: Date.now().toString() }]);
  };

  const addPlano = (plano) => {
    setPlanos([...planos, { ...plano, id: Date.now().toString() }]);
  };

  const addServico = (servico) => {
    setServicos([...servicos, { ...servico, id: Date.now().toString() }]);
  };

  const updateServico = (id, updatedData) => {
    setServicos(prev => prev.map(s => s.id === id ? { ...s, ...updatedData } : s));
  };

  const updatePlano = (id, updatedData) => {
    setPlanos(prev => prev.map(p => p.id === id ? { ...p, ...updatedData } : p));
  };

  const addAgendamento = (agendamento) => {
    setAgendamentos(prev => [...prev, { ...agendamento, id: Date.now().toString() + Math.random().toString(36).substring(2, 7) }]);
  };
  
  const updateAgendamento = (id, updatedData) => {
    setAgendamentos(prev => prev.map(a => a.id === id ? { ...a, ...updatedData } : a));
  };

  const addEvolucao = (evolucao) => {
    setEvolucoes([...evolucoes, { ...evolucao, id: Date.now().toString() }]);
  };

  const updateEvolucao = (id, updatedData) => {
    setEvolucoes(prev => prev.map(e => e.id === id ? { ...e, ...updatedData } : e));
  };

  const addMatricula = (matricula) => {
    const newId = Date.now().toString() + Math.random().toString(36).substring(2, 7);
    setMatriculas(prev => [...prev, { ...matricula, id: newId }]);
    return newId;
  };

  const addFeriado = (feriado) => {
    setFeriados(prev => [...prev, { ...feriado, id: Date.now().toString() }]);
  };

  const removeFeriado = (id) => {
    setFeriados(prev => prev.filter(f => f.id !== id));
  };

  const updateMatricula = (id, updatedData) => {
    setMatriculas(prev => prev.map(m => m.id === id ? { ...m, ...updatedData } : m));
  };

  const addAvaliacao = (avaliacao) => {
    setAvaliacoes([...avaliacoes, { ...avaliacao, id: Date.now().toString() }]);
  };

  const addRecebimento = (recebimento) => {
    setRecebimentos(prev => [...prev, { ...recebimento, id: Date.now().toString() + Math.random().toString(36).substring(2, 7) }]);
  };

  const updateRecebimento = (id, updatedData) => {
    setRecebimentos(prev => prev.map(r => r.id === id ? { ...r, ...updatedData } : r));
  };

  const addDespesa = (despesa) => {
    setDespesas([...despesas, { ...despesa, id: Date.now().toString() }]);
  };

  const updateDespesa = (id, updatedData) => {
    setDespesas(prev => prev.map(d => d.id === id ? { ...d, ...updatedData } : d));
  };

  const deleteDespesa = (id) => {
    setDespesas(despesas.filter(d => d.id !== id));
  };

  const updatePaciente = (id, updatedData) => {
    setPacientes(prev => prev.map(p => p.id === id ? { ...p, ...updatedData } : p));
  };

  const resetData = () => {
    setPacientes([]);
    setAgendamentos([]);
    setMatriculas([]);
    setRecebimentos([]);
    setEvolucoes([]);
    setAvaliacoes([]);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <AppDataContext.Provider value={{
      pacientes, addPaciente, setPacientes, updatePaciente,
      profissionais, addProfissional, setProfissionais,
      cargos, addCargo, setCargos,
      planos, addPlano, setPlanos, updatePlano,
      servicos, addServico, setServicos, updateServico,
      agendamentos, addAgendamento, updateAgendamento, setAgendamentos,
      evolucoes, addEvolucao, updateEvolucao,
      matriculas, addMatricula, updateMatricula,
      avaliacoes, addAvaliacao,
      recebimentos, addRecebimento, updateRecebimento, setRecebimentos,
      despesas, addDespesa, updateDespesa, setDespesas, deleteDespesa,
      feriados, setFeriados, addFeriado, removeFeriado,
      resetData
    }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  return useContext(AppDataContext);
}
