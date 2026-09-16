import React, { createContext, useState, useEffect, useContext } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const AppDataContext = createContext({});

export function AppDataProvider({ children }) {
  const [pacientes, setPacientes] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [planos, setPlanos] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [evolucoes, setEvolucoes] = useState([]);
  const [matriculas, setMatriculas] = useState([]);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [recebimentos, setRecebimentos] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [feriados, setFeriados] = useState([]);

  useEffect(() => {
    const collections = [
      { name: 'pacientes', setter: setPacientes },
      { name: 'profissionais', setter: setProfissionais },
      { name: 'planos', setter: setPlanos },
      { name: 'servicos', setter: setServicos },
      { name: 'agendamentos', setter: setAgendamentos },
      { name: 'evolucoes', setter: setEvolucoes },
      { name: 'matriculas', setter: setMatriculas },
      { name: 'avaliacoes', setter: setAvaliacoes },
      { name: 'recebimentos', setter: setRecebimentos },
      { name: 'despesas', setter: setDespesas },
      { name: 'feriados', setter: setFeriados }
    ];

    const unsubscribes = collections.map(({ name, setter }) => {
      const colRef = collection(db, name);
      return onSnapshot(colRef, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setter(data);
      });
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, []);

  const addDocument = async (colName, data) => {
    try {
      const docRef = await addDoc(collection(db, colName), data);
      return docRef.id;
    } catch (e) {
      console.error(`Error adding document to ${colName}:`, e);
      return null;
    }
  };

  const updateDocument = async (colName, id, data) => {
    try {
      await updateDoc(doc(db, colName, id), data);
    } catch (e) {
      console.error(`Error updating document in ${colName}:`, e);
    }
  };

  const deleteDocument = async (colName, id) => {
    try {
      await deleteDoc(doc(db, colName, id));
    } catch (e) {
      console.error(`Error deleting document from ${colName}:`, e);
    }
  };

  // Specific wrappers to match existing API
  const addPaciente = async (paciente) => await addDocument('pacientes', paciente);
  const updatePaciente = (id, data) => updateDocument('pacientes', id, data);
  const deletePaciente = async (id) => {
    // Apagar paciente
    await deleteDocument('pacientes', id);
    // Apagar agendamentos vinculados
    agendamentos.filter(a => a.clienteId === id).forEach(a => deleteDocument('agendamentos', a.id));
    // Apagar evolucoes vinculadas
    evolucoes.filter(e => e.clienteId === id).forEach(e => deleteDocument('evolucoes', e.id));
    // Apagar matriculas vinculadas
    matriculas.filter(m => m.clienteId === id).forEach(m => deleteDocument('matriculas', m.id));
    // Apagar avaliacoes vinculadas
    avaliacoes.filter(av => av.clienteId === id).forEach(av => deleteDocument('avaliacoes', av.id));
    // Apagar recebimentos vinculados
    recebimentos.filter(r => r.clienteId === id).forEach(r => deleteDocument('recebimentos', r.id));
  };

  const addProfissional = (profissional) => addDocument('profissionais', profissional);

  const addPlano = (plano) => addDocument('planos', plano);
  const updatePlano = (id, data) => updateDocument('planos', id, data);

  const addServico = (servico) => addDocument('servicos', servico);
  const updateServico = (id, data) => updateDocument('servicos', id, data);

  const addAgendamento = (agendamento) => addDocument('agendamentos', agendamento);
  const updateAgendamento = (id, data) => updateDocument('agendamentos', id, data);
  const deleteAgendamento = async (id) => {
    await deleteDocument('agendamentos', id);
    // Apagar evolução vinculada
    const evolucaoLinked = evolucoes.find(e => e.idAgendamento === id);
    if (evolucaoLinked) {
      deleteDocument('evolucoes', evolucaoLinked.id);
    }
    // Apagar recebimento vinculado (cobrança avulsa)
    const recebimentoLinked = recebimentos.find(r => r.idAgendamento === id);
    if (recebimentoLinked) {
      deleteDocument('recebimentos', recebimentoLinked.id);
    }
  };

  const addEvolucao = (evolucao) => addDocument('evolucoes', evolucao);
  const updateEvolucao = (id, data) => updateDocument('evolucoes', id, data);

  const addMatricula = async (matricula) => await addDocument('matriculas', matricula);
  const updateMatricula = (id, data) => updateDocument('matriculas', id, data);

  const addAvaliacao = (avaliacao) => addDocument('avaliacoes', avaliacao);

  const addRecebimento = (recebimento) => addDocument('recebimentos', recebimento);
  const updateRecebimento = (id, data) => updateDocument('recebimentos', id, data);
  const deleteRecebimento = (id) => deleteDocument('recebimentos', id);

  const addDespesa = (despesa) => addDocument('despesas', despesa);
  const updateDespesa = (id, data) => updateDocument('despesas', id, data);
  const deleteDespesa = (id) => deleteDocument('despesas', id);

  const addFeriado = (feriado) => addDocument('feriados', feriado);
  const removeFeriado = (id) => deleteDocument('feriados', id);

  
  const limparOrfaos = async () => {
    let count = 0;
    // 1. Agendamentos orfaos (que não são bloqueios e não têm paciente correspondente)
    const agendsToDel = agendamentos.filter(a => a.tipo !== 'bloqueio' && a.clienteId && !pacientes.some(p => p.id === a.clienteId));
    for (const a of agendsToDel) {
      await deleteDocument('agendamentos', a.id);
      count++;
    }
    // 2. Evolucoes orfas
    const evoToDel = evolucoes.filter(e => e.clienteId && !pacientes.some(p => p.id === e.clienteId));
    for (const e of evoToDel) {
      await deleteDocument('evolucoes', e.id);
      count++;
    }
    // 3. Recebimentos orfaos
    const recToDel = recebimentos.filter(r => r.clienteId && !pacientes.some(p => p.id === r.clienteId));
    for (const r of recToDel) {
      await deleteDocument('recebimentos', r.id);
      count++;
    }
    // 4. Avaliacoes orfas
    const avaToDel = avaliacoes.filter(av => av.clienteId && !pacientes.some(p => p.id === av.clienteId));
    for (const av of avaToDel) {
      await deleteDocument('avaliacoes', av.id);
      count++;
    }
    // 5. Matriculas orfas
    const matToDel = matriculas.filter(m => m.clienteId && !pacientes.some(p => p.id === m.clienteId));
    for (const m of matToDel) {
      await deleteDocument('matriculas', m.id);
      count++;
    }
    alert(`Limpeza concluída! ${count} registros órfãos (antigos) foram apagados do banco.`);
  };

  const resetData = async () => {

     console.warn("Reset data is disabled in production.");
  };

  return (
    <AppDataContext.Provider value={{
      pacientes, addPaciente, setPacientes, updatePaciente, deletePaciente,
      profissionais, addProfissional, setProfissionais,
      planos, addPlano, setPlanos, updatePlano,
      servicos, addServico, setServicos, updateServico,
      agendamentos, addAgendamento, updateAgendamento, deleteAgendamento, setAgendamentos,
      evolucoes, addEvolucao, updateEvolucao,
      matriculas, addMatricula, updateMatricula,
      avaliacoes, addAvaliacao,
      recebimentos, addRecebimento, updateRecebimento, setRecebimentos, deleteRecebimento,
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
