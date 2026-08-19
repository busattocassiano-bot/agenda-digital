import React, { useState, useEffect } from "react";
import { X, Check, ChevronRight, User, Stethoscope, FileText, ArrowRight, CheckCircle2 } from "lucide-react";
import { useAppData } from "../context/AppDataContext";
import { maskCpf, maskTelefone, maskCep } from "../utils/masks";
import { checkOverlapsAndCapacity } from "../utils/agendamentoUtils";
function AvaliacaoWizardModal({ isOpen, onClose, agendamentoId, clienteId, initialNome, initialTelefone }) {
  const { addPaciente, updatePaciente, addAvaliacao, addMatricula, addRecebimento, updateAgendamento, addAgendamento, servicos, planos, profissionais, agendamentos, pacientes } = useAppData();
  const [step, setStep] = useState(1);
  const [pacienteData, setPacienteData] = useState({
    nome: initialNome || "",
    telefone: initialTelefone || "",
    cpf: "",
    profissao: "",
    genero: "",
    estadoCivil: "",
    contatoEmergencia: "",
    dataNascimento: "",
    cep: "",
    endereco: { logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "" },
    dataCadastro: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    statusAtivo: true,
    observacao: ""
  });
  const [avaliacaoData, setAvaliacaoData] = useState({
    queixaPrincipal: "",
    habitosVida: "",
    expectativas: "",
    planoTratamento: ""
  });
  const [matriculaData, setMatriculaData] = useState({
    modalidade: "",
    plano: "",
    valor: "",
    diaVencimento: "10",
    dataInicio: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    dataFinal: "",
    profissionalId: "",
    avulsoHora: "08:00",
    avulsoHoraFim: "09:00",
    diasRecorrentes: {
      1: { checked: false, hora: "08:00", horaFim: "09:00" },
      2: { checked: false, hora: "08:00", horaFim: "09:00" },
      3: { checked: false, hora: "08:00", horaFim: "09:00" },
      4: { checked: false, hora: "08:00", horaFim: "09:00" },
      5: { checked: false, hora: "08:00", horaFim: "09:00" },
      6: { checked: false, hora: "08:00", horaFim: "09:00" },
      0: { checked: false, hora: "08:00", horaFim: "09:00" }
    }
  });
  const planoSelecionado = matriculaData.plano ? planos.find((p) => p.nome === matriculaData.plano) : null;
  const isAulasFixas = planoSelecionado ? planoSelecionado.aulasFixas : false;
  const qtdSessoes = planoSelecionado ? planoSelecionado.qtdSessoes : null;
  const isRecorrenteOrPackage = isAulasFixas || qtdSessoes > 0;
  const getHoraFim = (horaInicio, servicoNome) => {
    if (!horaInicio) return "";
    const servico = servicos.find((s) => s.nome === servicoNome);
    const duracao = servico && servico.duracao ? parseInt(servico.duracao, 10) : 60;
    const [h, m] = horaInicio.split(":").map(Number);
    const date = /* @__PURE__ */ new Date();
    date.setHours(h, m + duracao, 0, 0);
    return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  };
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      let initialPacienteData = {
        nome: initialNome || "",
        telefone: initialTelefone || "",
        cpf: "",
        profissao: "",
        genero: "",
        estadoCivil: "",
        contatoEmergencia: "",
        dataNascimento: "",
        cep: "",
        endereco: { logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "" },
        dataCadastro: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        statusAtivo: true,
        comoConheceu: "",
        observacao: ""
      };
      if (clienteId) {
        const existingPaciente = pacientes.find((p) => p.id === clienteId);
        if (existingPaciente) {
          initialPacienteData = {
            ...initialPacienteData,
            ...existingPaciente,
            endereco: {
              ...initialPacienteData.endereco,
              ...existingPaciente.endereco || {}
            }
          };
        }
      }
      setPacienteData(initialPacienteData);
      setAvaliacaoData({
        queixaPrincipal: "",
        habitosVida: "",
        expectativas: "",
        planoTratamento: ""
      });
      setMatriculaData({
        modalidade: "",
        plano: "",
        valor: "",
        dataInicio: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        dataFinal: "",
        profissionalId: "",
        avulsoHora: "08:00",
        avulsoHoraFim: "09:00",
        diasRecorrentes: {
          1: { checked: false, hora: "08:00", horaFim: "09:00" },
          2: { checked: false, hora: "08:00", horaFim: "09:00" },
          3: { checked: false, hora: "08:00", horaFim: "09:00" },
          4: { checked: false, hora: "08:00", horaFim: "09:00" },
          5: { checked: false, hora: "08:00", horaFim: "09:00" },
          6: { checked: false, hora: "08:00", horaFim: "09:00" },
          0: { checked: false, hora: "08:00", horaFim: "09:00" }
        }
      });
    }
  }, [isOpen, initialNome, initialTelefone]);
  if (!isOpen) return null;
  const handleNext = () => {
    setStep(step + 1);
  };
  const handleSkipMatricula = () => {
    concluirFluxo(false);
  };
  const handleFinish = () => {
    if (!matriculaData.plano || !matriculaData.modalidade) {
      alert("Por favor, selecione o plano e servi\xE7o para prosseguir com a matr\xEDcula.\nOu clique em 'Pular Matr\xEDcula' se n\xE3o desejar cadastrar um plano agora.");
      return;
    }
    if (isRecorrenteOrPackage && !matriculaData.profissionalId) {
      alert("Por favor, selecione o profissional respons\xE1vel para gerar os agendamentos.");
      return;
    }
    if (isRecorrenteOrPackage) {
      const hasDaysChecked = Object.values(matriculaData.diasRecorrentes).some((d) => d.checked);
      if (!hasDaysChecked) {
        alert("Por favor, selecione pelo menos um dia da semana para os agendamentos.");
        return;
      }
      let conflictResult = { hasConflict: false, message: "" };
      let current = /* @__PURE__ */ new Date(matriculaData.dataInicio + "T00:00:00");
      let count = 0;
      let limit = matriculaData.dataFinal ? /* @__PURE__ */ new Date(matriculaData.dataFinal + "T23:59:59") : qtdSessoes ? null : new Date(new Date(current).setFullYear(current.getFullYear() + 1));
      let checkCurrent = new Date(current);
      let checkCount = 0;
      while ((!limit || checkCurrent <= limit) && (!qtdSessoes || checkCount < qtdSessoes)) {
        const day = checkCurrent.getDay();
        const recurrenceConfig = matriculaData.diasRecorrentes[day];
        if (recurrenceConfig && recurrenceConfig.checked) {
          const dataStr = checkCurrent.toISOString().split("T")[0];
          const result = checkOverlapsAndCapacity(agendamentos, {
            dataStr,
            hora: recurrenceConfig.hora,
            horaFim: recurrenceConfig.horaFim,
            profissionalId: matriculaData.profissionalId,
            servico: matriculaData.modalidade
          }, servicos);
          if (result.hasConflict) {
            conflictResult = result;
            break;
          }
          checkCount++;
        }
        checkCurrent.setDate(checkCurrent.getDate() + 1);
      }
      if (conflictResult.hasConflict) {
        alert(conflictResult.message);
        return;
      }
    } else {
      const result = checkOverlapsAndCapacity(agendamentos, {
        dataStr: matriculaData.dataInicio,
        hora: matriculaData.avulsoHora,
        horaFim: matriculaData.avulsoHoraFim,
        profissionalId: matriculaData.profissionalId,
        servico: matriculaData.modalidade
      }, servicos);
      if (result.hasConflict) {
        alert(result.message);
        return;
      }
    }
    concluirFluxo(true);
  };
  const concluirFluxo = (comMatricula) => {
    let finalPacienteId = clienteId;
    let finalPacienteNome = pacienteData.nome;
    if (!clienteId) {
      finalPacienteId = addPaciente(pacienteData);
    } else {
      updatePaciente(clienteId, pacienteData);
    }
    addAvaliacao({
      ...avaliacaoData,
      pacienteId: finalPacienteId,
      data: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
    });
    if (comMatricula) {
      const novaMatriculaId = addMatricula({
        ...matriculaData,
        pacienteId: finalPacienteId,
        paciente: finalPacienteNome,
        status: "ativa"
      });
      if (isRecorrenteOrPackage) {
        let current = /* @__PURE__ */ new Date(matriculaData.dataInicio + "T00:00:00");
        const limit = matriculaData.dataFinal ? /* @__PURE__ */ new Date(matriculaData.dataFinal + "T23:59:59") : qtdSessoes ? null : new Date(new Date(current).setFullYear(current.getFullYear() + 1));
        let count = 0;
        while ((!limit || current <= limit) && (!qtdSessoes || count < qtdSessoes)) {
          const day = current.getDay();
          const recurrenceConfig = matriculaData.diasRecorrentes[day];
          if (recurrenceConfig && recurrenceConfig.checked) {
            addAgendamento({
              clienteId: finalPacienteId,
              matriculaId: novaMatriculaId,
              nomeNaoCadastrado: "",
              telefoneNaoCadastrado: "",
              profissionalId: matriculaData.profissionalId,
              servico: matriculaData.modalidade,
              data: current.toISOString().split("T")[0],
              hora: recurrenceConfig.hora,
              horaFim: recurrenceConfig.horaFim,
              isPacienteNaoCadastrado: false,
              status: "agendado"
            });
            count++;
          }
          current.setDate(current.getDate() + 1);
        }
      } else {
        addAgendamento({
          clienteId: finalPacienteId,
          matriculaId: novaMatriculaId,
          nomeNaoCadastrado: "",
          telefoneNaoCadastrado: "",
          profissionalId: matriculaData.profissionalId,
          servico: matriculaData.modalidade,
          data: matriculaData.dataInicio,
          hora: matriculaData.avulsoHora,
          horaFim: matriculaData.avulsoHoraFim,
          isPacienteNaoCadastrado: false,
          status: "agendado"
        });
      }
      const planoObj = planos.find((x) => x.nome === matriculaData.plano);
      let parcelas = 1;
      if (planoObj) {
        const vig = planoObj.vigencia?.toLowerCase();
        if (vig === "bimestral") parcelas = 2;
        else if (vig === "trimestral") parcelas = 3;
        else if (vig === "semestral") parcelas = 6;
        else if (vig === "anual") parcelas = 12;
      }
      const valorFloat = parseFloat(matriculaData.valor.replace("R$", "").replace(/\./g, "").replace(",", ".")) || 0;
      const dataAtual = /* @__PURE__ */ new Date();
      for (let i = 0; i < parcelas; i++) {
        const mesVencimento = dataAtual.getMonth() + i;
        const dataVenc = new Date(dataAtual.getFullYear(), mesVencimento, parseInt(matriculaData.diaVencimento));
        addRecebimento({
          pacienteId: finalPacienteId,
          nomePaciente: finalPacienteNome,
          descricao: `Mensalidade ${matriculaData.modalidade} - ${finalPacienteNome} (Parcela ${i + 1}/${parcelas})`,
          modalidade: matriculaData.modalidade,
          plano: matriculaData.plano,
          valor: valorFloat,
          valorPago: 0,
          status: "PENDENTE",
          dataVencimento: dataVenc.toISOString().split("T")[0],
          tipoPagamento: "",
          dataPagamento: "",
          matriculaId: novaMatriculaId
        });
      }
    }
    if (agendamentoId) {
      updateAgendamento(agendamentoId, {
        isPacienteNaoCadastrado: false,
        clienteId: finalPacienteId,
        nomeNaoCadastrado: "",
        telefoneNaoCadastrado: "",
        status: "realizado"
      });
    }
    onClose();
  };
  const calcularIdade = (dataNasc) => {
    if (!dataNasc) return "";
    const parts = dataNasc.split("-");
    if (parts.length !== 3) return "";
    const hoje = /* @__PURE__ */ new Date();
    const nascimento = new Date(parts[0], parts[1] - 1, parts[2]);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || m === 0 && hoje.getDate() < nascimento.getDate()) {
      idade--;
    }
    return isNaN(idade) ? "" : idade;
  };
  const handleCpfChange = (e) => {
    setPacienteData({ ...pacienteData, cpf: maskCpf(e.target.value) });
  };
  const handleTelefoneChange = (e) => {
    setPacienteData({ ...pacienteData, telefone: maskTelefone(e.target.value) });
  };
  const handleMatriculaPlanoChange = (e) => {
    const pNome = e.target.value;
    const p = planos.find((pl) => pl.nome === pNome);
    if (p) {
      setMatriculaData({ ...matriculaData, plano: pNome, valor: p.preco || "" });
    } else {
      setMatriculaData({ ...matriculaData, plano: pNome });
    }
  };
  const handleValorChange = (e) => {
    let value = e.target.value;
    value = value.replace(/\D/g, "");
    if (value === "") {
      setMatriculaData({ ...matriculaData, valor: "" });
      return;
    }
    const options = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
    const result = new Intl.NumberFormat("pt-BR", options).format(
      parseFloat(value) / 100
    );
    setMatriculaData({ ...matriculaData, valor: "R$ " + result });
  };
  const handleCepChange = async (e) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    const formatted = maskCep(rawValue);
    setPacienteData({ ...pacienteData, cep: formatted });
    if (rawValue.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${rawValue}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setPacienteData((prev) => ({
            ...prev,
            cep: formatted,
            endereco: {
              ...prev.endereco,
              logradouro: data.logradouro || "",
              bairro: data.bairro || "",
              cidade: data.localidade || "",
              uf: data.uf || ""
            }
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar CEP", error);
      }
    }
  };
  return /* @__PURE__ */ React.createElement("div", { style: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { background: "white", width: "100%", maxWidth: "800px", height: "90vh", borderRadius: "12px", overflow: "hidden", display: "flex", flexDirection: "column" } }, /* @__PURE__ */ React.createElement("div", { style: { padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", borderBottom: "1px solid var(--border-color)" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "8px", fontWeight: 600, color: "var(--text-dark)", fontSize: "1.1rem" } }, "Recepcionar Novo Aluno (Avalia\xE7\xE3o)"), /* @__PURE__ */ React.createElement("button", { onClick: onClose, style: { background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" } }, /* @__PURE__ */ React.createElement(X, { size: 20 }))), /* @__PURE__ */ React.createElement("div", { style: { padding: "24px 24px 0 24px", display: "flex", alignItems: "center", justifyContent: "center", gap: "16px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" } }, /* @__PURE__ */ React.createElement("div", { style: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: step >= 1 ? "var(--primary-color)" : "#e2e8f0",
    color: step >= 1 ? "white" : "#64748b"
  } }, step > 1 ? /* @__PURE__ */ React.createElement(Check, { size: 20 }) : /* @__PURE__ */ React.createElement(User, { size: 20 })), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "0.75rem", fontWeight: 700, color: step >= 1 ? "var(--primary-color)" : "#64748b" } }, "CADASTRO")), /* @__PURE__ */ React.createElement("div", { style: { height: "2px", flex: 1, maxWidth: "60px", background: step >= 2 ? "var(--primary-color)" : "#e2e8f0", marginTop: "-20px" } }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" } }, /* @__PURE__ */ React.createElement("div", { style: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: step >= 2 ? "var(--primary-color)" : "#e2e8f0",
    color: step >= 2 ? "white" : "#64748b"
  } }, step > 2 ? /* @__PURE__ */ React.createElement(Check, { size: 20 }) : /* @__PURE__ */ React.createElement(Stethoscope, { size: 20 })), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "0.75rem", fontWeight: 700, color: step >= 2 ? "var(--primary-color)" : "#64748b" } }, "AVALIA\xC7\xC3O")), /* @__PURE__ */ React.createElement("div", { style: { height: "2px", flex: 1, maxWidth: "60px", background: step >= 3 ? "var(--primary-color)" : "#e2e8f0", marginTop: "-20px" } }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" } }, /* @__PURE__ */ React.createElement("div", { style: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: step >= 3 ? "var(--primary-color)" : "#e2e8f0",
    color: step >= 3 ? "white" : "#64748b"
  } }, /* @__PURE__ */ React.createElement(FileText, { size: 20 })), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "0.75rem", fontWeight: 700, color: step >= 3 ? "var(--primary-color)" : "#64748b" } }, "MATR\xCDCULA"))), /* @__PURE__ */ React.createElement("div", { style: { padding: "24px", flex: 1, overflowY: "auto" } }, step === 1 && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "40px", animation: "fadeIn 0.3s ease" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { style: { fontSize: "1.05rem", color: "var(--text-dark)", fontWeight: 600, borderBottom: "1px solid var(--border-color)", paddingBottom: "8px", marginBottom: "24px" } }, "Dados pessoais"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "20px" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: "8px" } }, "Nome completo *"), /* @__PURE__ */ React.createElement("input", { type: "text", value: pacienteData.nome, onChange: (e) => setPacienteData({ ...pacienteData, nome: e.target.value }), style: { width: "100%", padding: "10px 12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none" } })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "20px" } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: "8px" } }, "Data de Nascimento"), /* @__PURE__ */ React.createElement("input", { type: "date", value: pacienteData.dataNascimento, onChange: (e) => setPacienteData({ ...pacienteData, dataNascimento: e.target.value }), style: { width: "100%", padding: "10px 12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none" } })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: "8px" } }, "Idade"), /* @__PURE__ */ React.createElement("input", { type: "text", value: calcularIdade(pacienteData.dataNascimento), readOnly: true, placeholder: "Autom\xE1tico", style: { width: "100%", padding: "10px 12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none", backgroundColor: "#f1f5f9", color: "var(--text-muted)" } }))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "20px" } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: "8px" } }, "Telefone *"), /* @__PURE__ */ React.createElement("input", { type: "text", value: pacienteData.telefone, onChange: handleTelefoneChange, style: { width: "100%", padding: "10px 12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none" } })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: "8px" } }, "CPF"), /* @__PURE__ */ React.createElement("input", { type: "text", value: pacienteData.cpf, onChange: handleCpfChange, style: { width: "100%", padding: "10px 12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none" } }))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "20px" } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: "8px" } }, "Profiss\xE3o"), /* @__PURE__ */ React.createElement("input", { type: "text", value: pacienteData.profissao, onChange: (e) => setPacienteData({ ...pacienteData, profissao: e.target.value }), style: { width: "100%", padding: "10px 12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none" } })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: "8px" } }, "G\xEAnero"), /* @__PURE__ */ React.createElement("select", { value: pacienteData.genero, onChange: (e) => setPacienteData({ ...pacienteData, genero: e.target.value }), style: { width: "100%", padding: "10px 12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none", backgroundColor: "white" } }, /* @__PURE__ */ React.createElement("option", { value: "" }, "- Selecione -"), /* @__PURE__ */ React.createElement("option", { value: "Feminino" }, "Feminino"), /* @__PURE__ */ React.createElement("option", { value: "Masculino" }, "Masculino"), /* @__PURE__ */ React.createElement("option", { value: "Outro" }, "Outro"))), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: "8px" } }, "Estado Civil"), /* @__PURE__ */ React.createElement("select", { value: pacienteData.estadoCivil, onChange: (e) => setPacienteData({ ...pacienteData, estadoCivil: e.target.value }), style: { width: "100%", padding: "10px 12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none", backgroundColor: "white" } }, /* @__PURE__ */ React.createElement("option", { value: "" }, "- Selecione -"), /* @__PURE__ */ React.createElement("option", { value: "Solteiro(a)" }, "Solteiro(a)"), /* @__PURE__ */ React.createElement("option", { value: "Casado(a)" }, "Casado(a)"), /* @__PURE__ */ React.createElement("option", { value: "Divorciado(a)" }, "Divorciado(a)"), /* @__PURE__ */ React.createElement("option", { value: "Vi\xFAvo(a)" }, "Vi\xFAvo(a)")))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: "8px" } }, "Contato de Emerg\xEAncia"), /* @__PURE__ */ React.createElement("input", { type: "text", value: pacienteData.contatoEmergencia, onChange: (e) => setPacienteData({ ...pacienteData, contatoEmergencia: e.target.value }), placeholder: "Nome e telefone do contato de emerg\xEAncia", style: { width: "100%", padding: "10px 12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none" } })))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { style: { fontSize: "1.05rem", color: "var(--text-dark)", fontWeight: 600, borderBottom: "1px solid var(--border-color)", paddingBottom: "8px", marginBottom: "24px" } }, "Endere\xE7o"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "20px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "20px" } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: "8px" } }, "CEP"), /* @__PURE__ */ React.createElement("input", { type: "text", value: pacienteData.cep, onChange: handleCepChange, style: { width: "100%", padding: "10px 12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none" } })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: "8px" } }, "Logradouro"), /* @__PURE__ */ React.createElement("input", { type: "text", value: pacienteData.endereco.logradouro, onChange: (e) => setPacienteData({ ...pacienteData, endereco: { ...pacienteData.endereco, logradouro: e.target.value } }), style: { width: "100%", padding: "10px 12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none" } }))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "20px" } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: "8px" } }, "N\xFAmero"), /* @__PURE__ */ React.createElement("input", { type: "text", value: pacienteData.endereco.numero, onChange: (e) => setPacienteData({ ...pacienteData, endereco: { ...pacienteData.endereco, numero: e.target.value } }), style: { width: "100%", padding: "10px 12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none" } })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: "8px" } }, "Complemento"), /* @__PURE__ */ React.createElement("input", { type: "text", value: pacienteData.endereco.complemento, onChange: (e) => setPacienteData({ ...pacienteData, endereco: { ...pacienteData.endereco, complemento: e.target.value } }), style: { width: "100%", padding: "10px 12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none" } }))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "20px" } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: "8px" } }, "Bairro"), /* @__PURE__ */ React.createElement("input", { type: "text", value: pacienteData.endereco.bairro, onChange: (e) => setPacienteData({ ...pacienteData, endereco: { ...pacienteData.endereco, bairro: e.target.value } }), style: { width: "100%", padding: "10px 12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none" } })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: "8px" } }, "Cidade"), /* @__PURE__ */ React.createElement("input", { type: "text", value: pacienteData.endereco.cidade, onChange: (e) => setPacienteData({ ...pacienteData, endereco: { ...pacienteData.endereco, cidade: e.target.value } }), style: { width: "100%", padding: "10px 12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none" } })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: "8px" } }, "UF"), /* @__PURE__ */ React.createElement("input", { type: "text", value: pacienteData.endereco.uf, onChange: (e) => setPacienteData({ ...pacienteData, endereco: { ...pacienteData.endereco, uf: e.target.value } }), style: { width: "100%", padding: "10px 12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none" } }))))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "24px" } }, /* @__PURE__ */ React.createElement("div", { style: { width: "48%" } }, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: "8px" } }, "Data Cadastro"), /* @__PURE__ */ React.createElement("input", { type: "date", value: pacienteData.dataCadastro, onChange: (e) => setPacienteData({ ...pacienteData, dataCadastro: e.target.value }), style: { width: "100%", padding: "10px 12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none" } })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "8px" } }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", id: "statusAtivoWizard", checked: pacienteData.statusAtivo, onChange: (e) => setPacienteData({ ...pacienteData, statusAtivo: e.target.checked }), style: { width: "18px", height: "18px", accentColor: "#3b82f6", cursor: "pointer" } }), /* @__PURE__ */ React.createElement("label", { htmlFor: "statusAtivoWizard", style: { fontWeight: 700, color: "var(--text-dark)", fontSize: "0.9rem", cursor: "pointer" } }, "Status ativo")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: "8px" } }, "Como nos conheceu?"), /* @__PURE__ */ React.createElement("select", { value: pacienteData.comoConheceu, onChange: (e) => setPacienteData({ ...pacienteData, comoConheceu: e.target.value }), style: { width: "100%", padding: "10px 12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none", backgroundColor: "white" } }, /* @__PURE__ */ React.createElement("option", { value: "" }, "Selecione..."), /* @__PURE__ */ React.createElement("option", { value: "Instagram" }, "Instagram"), /* @__PURE__ */ React.createElement("option", { value: "Facebook" }, "Facebook"), /* @__PURE__ */ React.createElement("option", { value: "Google" }, "Google / Site"), /* @__PURE__ */ React.createElement("option", { value: "Indica\xE7\xE3o" }, "Indica\xE7\xE3o de amigo/paciente"), /* @__PURE__ */ React.createElement("option", { value: "Passou na frente" }, "Passou na frente da cl\xEDnica"), /* @__PURE__ */ React.createElement("option", { value: "Outros" }, "Outros"))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: "8px" } }, "Observa\xE7\xE3o"), /* @__PURE__ */ React.createElement("textarea", { rows: "4", value: pacienteData.observacao, onChange: (e) => setPacienteData({ ...pacienteData, observacao: e.target.value }), style: { width: "100%", padding: "10px 12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none", resize: "vertical" } })))), step === 2 && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "20px", animation: "fadeIn 0.3s ease" } }, /* @__PURE__ */ React.createElement("h3", { style: { fontSize: "1rem", color: "var(--text-dark)", marginBottom: "8px" } }, "Ficha Fisioterap\xEAutica"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-dark)", marginBottom: "8px" } }, "Queixa Principal"), /* @__PURE__ */ React.createElement("textarea", { rows: "3", value: avaliacaoData.queixaPrincipal, onChange: (e) => setAvaliacaoData({ ...avaliacaoData, queixaPrincipal: e.target.value }), placeholder: "Descreva a queixa do paciente...", style: { width: "100%", padding: "10px 12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none", resize: "vertical" } })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-dark)", marginBottom: "8px" } }, "H\xE1bitos de Vida"), /* @__PURE__ */ React.createElement("textarea", { rows: "4", value: avaliacaoData.habitosVida, onChange: (e) => setAvaliacaoData({ ...avaliacaoData, habitosVida: e.target.value }), placeholder: "Descreva os h\xE1bitos, atividades, etc...", style: { width: "100%", padding: "10px 12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none", resize: "vertical" } })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-dark)", marginBottom: "8px" } }, "Expectativas e Observa\xE7\xF5es"), /* @__PURE__ */ React.createElement("textarea", { rows: "4", value: avaliacaoData.expectativas, onChange: (e) => setAvaliacaoData({ ...avaliacaoData, expectativas: e.target.value }), placeholder: "Expectativas do paciente e observa\xE7\xF5es adicionais...", style: { width: "100%", padding: "10px 12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none", resize: "vertical" } })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-dark)", marginBottom: "8px" } }, "Plano de Tratamento"), /* @__PURE__ */ React.createElement("textarea", { rows: "3", value: avaliacaoData.planoTratamento, onChange: (e) => setAvaliacaoData({ ...avaliacaoData, planoTratamento: e.target.value }), placeholder: "Objetivos e condutas...", style: { width: "100%", padding: "10px 12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none", resize: "vertical" } }))), step === 3 && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "20px", animation: "fadeIn 0.3s ease" } }, /* @__PURE__ */ React.createElement("h3", { style: { fontSize: "1rem", color: "var(--text-dark)", marginBottom: "8px" } }, "Matr\xEDcula / Contrato"), /* @__PURE__ */ React.createElement("div", { style: { padding: "16px", background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "8px", marginBottom: "8px" } }, /* @__PURE__ */ React.createElement("p", { style: { fontSize: "0.9rem", color: "#0369a1", margin: 0, fontWeight: 500 } }, "Preencha os dados abaixo caso o paciente j\xE1 tenha fechado o pacote. Se for pensar, voc\xEA pode pular esta etapa.")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "16px" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-dark)", marginBottom: "8px" } }, "Modalidade"), /* @__PURE__ */ React.createElement("select", { value: matriculaData.modalidade, onChange: (e) => {
    const newModalidade = e.target.value;
    const updatedDias = { ...matriculaData.diasRecorrentes };
    for (let day in updatedDias) {
      updatedDias[day].horaFim = getHoraFim(updatedDias[day].hora, newModalidade);
    }
    setMatriculaData({
      ...matriculaData,
      modalidade: newModalidade,
      avulsoHoraFim: getHoraFim(matriculaData.avulsoHora, newModalidade),
      diasRecorrentes: updatedDias
    });
  }, style: { width: "100%", padding: "12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none", backgroundColor: "#fff" } }, /* @__PURE__ */ React.createElement("option", { value: "" }, "- Selecione -"), servicos && servicos.length > 0 ? servicos.map((s) => /* @__PURE__ */ React.createElement("option", { key: s.id, value: s.nome }, s.nome)) : /* @__PURE__ */ React.createElement("option", { disabled: true }, "Nenhum servi\xE7o cadastrado"))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-dark)", marginBottom: "8px" } }, "Plano de Pagamento"), /* @__PURE__ */ React.createElement("select", { value: matriculaData.plano, onChange: handleMatriculaPlanoChange, style: { width: "100%", padding: "12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none", backgroundColor: "#fff" } }, /* @__PURE__ */ React.createElement("option", { value: "" }, "- Selecione -"), planos && planos.length > 0 ? planos.filter((p) => !matriculaData.modalidade || p.modalidade === matriculaData.modalidade).map((p) => /* @__PURE__ */ React.createElement("option", { key: p.id, value: p.nome }, p.nome)) : /* @__PURE__ */ React.createElement("option", { disabled: true }, "Nenhum plano cadastrado"))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "16px" } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-dark)", marginBottom: "8px" } }, "Valor do Plano (R$)"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: matriculaData.valor,
      onChange: handleValorChange,
      placeholder: "R$ 0,00",
      style: { width: "100%", padding: "12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none", backgroundColor: "#fff", color: "var(--text-main)", fontSize: "0.95rem" }
    }
  )), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-dark)", marginBottom: "8px" } }, "Dia de Vencimento"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: matriculaData.diaVencimento,
      onChange: (e) => setMatriculaData({ ...matriculaData, diaVencimento: e.target.value }),
      style: { width: "100%", padding: "12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none", backgroundColor: "#fff", color: "var(--text-main)" }
    },
    [5, 10, 15, 20, 25].map((d) => /* @__PURE__ */ React.createElement("option", { key: d, value: d }, d))
  ))), /* @__PURE__ */ React.createElement("div", { style: { padding: "16px", background: "#e0f2fe", borderRadius: "8px", display: "flex", gap: "12px", alignItems: "flex-start" } }, /* @__PURE__ */ React.createElement(CheckCircle2, { size: 20, color: "#0284c7", style: { flexShrink: 0, marginTop: "2px" } }), /* @__PURE__ */ React.createElement("p", { style: { margin: 0, fontSize: "0.9rem", color: "#0369a1", lineHeight: "1.5" } }, "As parcelas deste plano ser\xE3o geradas ", /* @__PURE__ */ React.createElement("strong", null, "automaticamente"), " no Contas a Receber ap\xF3s salvar."))), /* @__PURE__ */ React.createElement("div", { style: { marginTop: "32px", padding: "24px", background: "#f8fafc", borderRadius: "8px", border: "1px solid var(--border-color)" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "16px" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-dark)", marginBottom: "8px" } }, "Profissional Respons\xE1vel"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: matriculaData.profissionalId,
      onChange: (e) => setMatriculaData({ ...matriculaData, profissionalId: e.target.value }),
      style: { width: "100%", padding: "12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none" }
    },
    /* @__PURE__ */ React.createElement("option", { value: "" }, "- Selecione -"),
    profissionais.map((p) => /* @__PURE__ */ React.createElement("option", { key: p.id, value: p.id }, p.nome))
  )), !isRecorrenteOrPackage && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "16px", alignItems: "center", marginTop: "16px" } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-dark)", marginBottom: "8px" } }, "Data da Sess\xE3o"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "date",
      value: matriculaData.dataInicio,
      onChange: (e) => setMatriculaData({ ...matriculaData, dataInicio: e.target.value }),
      style: { width: "100%", padding: "12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none" }
    }
  )), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-dark)", marginBottom: "8px" } }, "In\xEDcio"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "time",
      value: matriculaData.avulsoHora,
      onChange: (e) => {
        const newHora = e.target.value;
        setMatriculaData({
          ...matriculaData,
          avulsoHora: newHora,
          avulsoHoraFim: getHoraFim(newHora, matriculaData.modalidade)
        });
      },
      style: { width: "100%", padding: "12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none" }
    }
  )), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-dark)", marginBottom: "8px" } }, "Fim"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "time",
      value: matriculaData.avulsoHoraFim,
      onChange: (e) => setMatriculaData({ ...matriculaData, avulsoHoraFim: e.target.value }),
      style: { width: "100%", padding: "12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none" }
    }
  ))), isRecorrenteOrPackage && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "16px", marginTop: "16px" } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-dark)", marginBottom: "8px" } }, "Data In\xEDcio (1\xBA Agendamento): *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "date",
      value: matriculaData.dataInicio,
      onChange: (e) => setMatriculaData({ ...matriculaData, dataInicio: e.target.value }),
      style: { width: "100%", padding: "10px 12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none", backgroundColor: "#fff", color: "var(--text-main)" }
    }
  )), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-dark)", marginBottom: "8px" } }, "Repetir At\xE9: *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "date",
      value: matriculaData.dataFinal,
      onChange: (e) => setMatriculaData({ ...matriculaData, dataFinal: e.target.value }),
      style: { width: "100%", padding: "10px 12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none", backgroundColor: "#fff", color: "var(--text-main)" }
    }
  ))), isRecorrenteOrPackage && /* @__PURE__ */ React.createElement("div", { style: { marginTop: "16px" } }, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: "12px" } }, "Dias e Hor\xE1rios das Aulas:"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "12px" } }, [1, 2, 3, 4, 5, 6, 0].map((day) => {
    const dayIndex = day.toString();
    const label = ["Domingo", "Segunda", "Ter\xE7a", "Quarta", "Quinta", "Sexta", "S\xE1bado"][day];
    return /* @__PURE__ */ React.createElement("div", { key: day, style: { display: "flex", alignItems: "center", gap: "12px" } }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "checkbox",
        checked: matriculaData.diasRecorrentes[dayIndex].checked,
        onChange: (e) => setMatriculaData({
          ...matriculaData,
          diasRecorrentes: {
            ...matriculaData.diasRecorrentes,
            [dayIndex]: { ...matriculaData.diasRecorrentes[dayIndex], checked: e.target.checked }
          }
        }),
        style: { width: "18px", height: "18px", cursor: "pointer" }
      }
    ), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "4px" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "0.85rem", color: "var(--text-main)", fontWeight: matriculaData.diasRecorrentes[dayIndex].checked ? 700 : 400 } }, label), matriculaData.diasRecorrentes[dayIndex].checked && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "4px" } }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "time",
        value: matriculaData.diasRecorrentes[dayIndex].hora,
        onChange: (e) => {
          const newHora = e.target.value;
          const newHoraFim = getHoraFim(newHora, matriculaData.modalidade);
          setMatriculaData({
            ...matriculaData,
            diasRecorrentes: {
              ...matriculaData.diasRecorrentes,
              [dayIndex]: { ...matriculaData.diasRecorrentes[dayIndex], hora: newHora, horaFim: newHoraFim }
            }
          });
        },
        style: { padding: "4px 8px", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "0.8rem", outline: "none" }
      }
    ), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "0.75rem", color: "var(--text-muted)" } }, "at\xE9"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "time",
        value: matriculaData.diasRecorrentes[dayIndex].horaFim || "",
        onChange: (e) => setMatriculaData({
          ...matriculaData,
          diasRecorrentes: {
            ...matriculaData.diasRecorrentes,
            [dayIndex]: { ...matriculaData.diasRecorrentes[dayIndex], horaFim: e.target.value }
          }
        }),
        style: { padding: "4px 8px", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "0.8rem", outline: "none" }
      }
    ))));
  }))))))), /* @__PURE__ */ React.createElement("div", { style: { padding: "16px 24px", display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border-color)", background: "#f8fafc" } }, /* @__PURE__ */ React.createElement("div", null, step === 3 && /* @__PURE__ */ React.createElement("button", { onClick: handleSkipMatricula, style: { background: "transparent", color: "var(--text-muted)", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "10px 20px", fontWeight: 600, cursor: "pointer" } }, "Pular Matr\xEDcula e Salvar")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "12px" } }, step > 1 && /* @__PURE__ */ React.createElement("button", { onClick: () => setStep(step - 1), style: { background: "white", color: "var(--text-dark)", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "10px 20px", fontWeight: 600, cursor: "pointer" } }, "Voltar"), step < 3 ? /* @__PURE__ */ React.createElement("button", { onClick: handleNext, style: { display: "flex", alignItems: "center", gap: "8px", background: "var(--primary-color)", color: "white", border: "none", borderRadius: "8px", padding: "10px 20px", fontWeight: 600, cursor: "pointer" } }, "Pr\xF3ximo Passo ", /* @__PURE__ */ React.createElement(ChevronRight, { size: 18 })) : /* @__PURE__ */ React.createElement("button", { onClick: handleFinish, style: { display: "flex", alignItems: "center", gap: "8px", background: "#22c55e", color: "white", border: "none", borderRadius: "8px", padding: "10px 20px", fontWeight: 600, cursor: "pointer" } }, "Salvar Tudo e Finalizar")))));
}
export {
  AvaliacaoWizardModal as default
};
