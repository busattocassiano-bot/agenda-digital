import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  RefreshCw,
  Filter,
  LayoutList,
  LayoutGrid,
  Calendar as CalendarIcon,
  UserPlus,
  Save,
  X,
  FileEdit,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  Edit,
  Eye,
  FileText,
  Trash2
} from "lucide-react";
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  isSameDay,
  addMinutes,
  startOfDay,
  setHours,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  isSameMonth
} from "date-fns";
import { ptBR } from "date-fns/locale";
import DetalhesMatriculaModal from "../components/DetalhesMatriculaModal";
import AvaliacaoWizardModal from "../components/AvaliacaoWizardModal";
import NovaMatriculaModal from "../components/NovaMatriculaModal";
import { useAppData } from "../context/AppDataContext";
import { useCompany } from "../context/CompanyContext";
import { maskTelefone } from "../utils/masks";
import { checkOverlapsAndCapacity } from "../utils/agendamentoUtils";
function Agenda() {
  const {
    pacientes,
    profissionais,
    agendamentos,
    addAgendamento,
    setAgendamentos,
    updateAgendamento,
    servicos,
    planos,
    addMatricula,
    matriculas,
    updateMatricula,
    addRecebimento,
    addEvolucao,
    feriados
  } = useAppData();
  const [view, setView] = useState("tabela");
  const [interval, setInterval] = useState(60);
  const [currentDate, setCurrentDate] = useState(/* @__PURE__ */ new Date());
  const [calendarView, setCalendarView] = useState("semana");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [insertMenuOpen, setInsertMenuOpen] = useState(false);
  const [slotActionMenu, setSlotActionMenu] = useState(null);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [blockData, setBlockData] = useState({ tipo: "especifica", data: "", horaInicio: "", horaFim: "", diasSemana: { 0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false }, dataFimRecorrencia: "", descricao: "" });
  const [agendamentoModalOpen, setAgendamentoModalOpen] = useState(false);
  const [matriculaModalOpen, setMatriculaModalOpen] = useState(false);
  const [selectedPacienteIdForMatricula, setSelectedPacienteIdForMatricula] = useState(null);
  const [eventMenuOpen, setEventMenuOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({ status: [] });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detalhesMatriculaModalOpen, setDetalhesMatriculaModalOpen] = useState(false);
  const [isPacienteNaoCadastrado, setIsPacienteNaoCadastrado] = useState(false);
  const [wizardModalOpen, setWizardModalOpen] = useState(false);
  const [selectedWizardAgendamento, setSelectedWizardAgendamento] = useState(null);
  useEffect(() => {
    let hasUpdates = false;
    const updatedAgendamentos = agendamentos.map((ag) => {
      if (ag.isPacienteNaoCadastrado && ag.nomeNaoCadastrado) {
        const match = pacientes.find((p) => p.nome.trim().toLowerCase() === ag.nomeNaoCadastrado.trim().toLowerCase());
        if (match) {
          hasUpdates = true;
          return {
            ...ag,
            isPacienteNaoCadastrado: false,
            clienteId: match.id,
            nomeNaoCadastrado: "",
            telefoneNaoCadastrado: ""
          };
        }
      }
      return ag;
    });
    if (hasUpdates) {
      setAgendamentos(updatedAgendamentos);
    }
  }, [pacientes, agendamentos, setAgendamentos]);
  const [evolucaoModalOpen, setEvolucaoModalOpen] = useState(false);
  const [evolucaoData, setEvolucaoData] = useState({ idAgendamento: null, descricao: "" });
  const [newAgendamento, setNewAgendamento] = useState({
    clienteId: "",
    matriculaId: "",
    servico: "",
    nomeNaoCadastrado: "",
    telefoneNaoCadastrado: "",
    profissionalId: "",
    data: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    hora: "07:00",
    horaFim: "08:00",
    dataFinal: "",
    gerarCobrancaAvulsa: true,
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
  const matriculasDoCliente = newAgendamento.clienteId ? matriculas.filter((m) => m.pacienteId == newAgendamento.clienteId) : [];
  const matriculasDoServico = newAgendamento.servico ? matriculasDoCliente.filter((m) => m.modalidade === newAgendamento.servico) : matriculasDoCliente;
  const planosDoServico = newAgendamento.servico ? planos.filter((p) => p.modalidade === newAgendamento.servico) : [];
  const isNovoPlano = newAgendamento.matriculaId && newAgendamento.matriculaId.startsWith("novo-plano-");
  const isMatriculaExistente = newAgendamento.matriculaId && newAgendamento.matriculaId.startsWith("matricula-");
  let planoSelecionadoInfo = null;
  if (isMatriculaExistente) {
    const matId = newAgendamento.matriculaId.replace("matricula-", "");
    const mat = matriculas.find((m) => m.id === matId);
    planoSelecionadoInfo = mat ? planos.find((p) => p.nome === mat.plano) : null;
  } else if (isNovoPlano) {
    const planoId = newAgendamento.matriculaId.replace("novo-plano-", "");
    planoSelecionadoInfo = planos.find((p) => p.id == planoId);
  }
  const isAulasFixas = planoSelecionadoInfo ? planoSelecionadoInfo.aulasFixas : false;
  const qtdSessoes = planoSelecionadoInfo ? planoSelecionadoInfo.qtdSessoes : null;
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
  const handleSaveAgendamento = () => {
    if (!newAgendamento.profissionalId) {
      alert("Por favor, selecione um profissional.");
      return;
    }
    if (!isPacienteNaoCadastrado && !newAgendamento.clienteId) {
      alert("Por favor, selecione um paciente.");
      return;
    }
    let conflictResult = { hasConflict: false, message: "" };
    let daysChecked = Object.values(newAgendamento.diasRecorrentes).some((d) => d.checked);
    if (daysChecked) {
      let current = /* @__PURE__ */ new Date(newAgendamento.data + "T00:00:00");
      let count = 0;
      let limit = newAgendamento.dataFinal ? /* @__PURE__ */ new Date(newAgendamento.dataFinal + "T23:59:59") : qtdSessoes ? null : new Date(new Date(current).setFullYear(current.getFullYear() + 1));
      let checkCurrent = new Date(current);
      let checkCount = 0;
      while ((!limit || checkCurrent <= limit) && (!qtdSessoes || checkCount < qtdSessoes)) {
        const day = checkCurrent.getDay();
        const recurrenceConfig = newAgendamento.diasRecorrentes[day];
        if (recurrenceConfig && recurrenceConfig.checked) {
          const dataStr = checkCurrent.toISOString().split("T")[0];
          const horaStr = recurrenceConfig.hora;
          const result = checkOverlapsAndCapacity(agendamentos, {
            dataStr,
            hora: horaStr,
            horaFim: newAgendamento.horaFim,
            profissionalId: newAgendamento.profissionalId,
            servico: newAgendamento.servico,
            excludeId: newAgendamento.id
          }, servicos);
          if (result.hasConflict) {
            conflictResult = result;
            break;
          }
          checkCount++;
        }
        checkCurrent.setDate(checkCurrent.getDate() + 1);
      }
    } else {
      conflictResult = checkOverlapsAndCapacity(agendamentos, {
        dataStr: newAgendamento.data,
        hora: newAgendamento.hora,
        horaFim: newAgendamento.horaFim,
        profissionalId: newAgendamento.profissionalId,
        servico: newAgendamento.servico,
        excludeId: newAgendamento.id
      }, servicos);
    }
    if (conflictResult.hasConflict) {
      alert(conflictResult.message);
      return;
    }
    let finalMatriculaId = "";
    if (isNovoPlano && planoSelecionadoInfo) {
      finalMatriculaId = addMatricula({
        pacienteId: newAgendamento.clienteId,
        modalidade: newAgendamento.servico,
        plano: planoSelecionadoInfo.nome,
        valor: planoSelecionadoInfo.preco,
        dataInicio: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        status: "ativa"
      });
      const pacienteNome = pacientes.find((p) => p.id == newAgendamento.clienteId)?.nome;
      addRecebimento({
        pacienteId: newAgendamento.clienteId,
        nomePaciente: pacienteNome,
        modalidade: newAgendamento.servico,
        plano: planoSelecionadoInfo.nome,
        valor: planoSelecionadoInfo.preco,
        valorPago: 0,
        status: "A VENCER",
        dataVencimento: (/* @__PURE__ */ new Date()).toLocaleDateString("pt-BR"),
        tipoPagamento: "",
        dataPagamento: ""
      });
    } else if (isMatriculaExistente) {
      finalMatriculaId = newAgendamento.matriculaId.replace("matricula-", "");
    }
    if (daysChecked) {
      let current = /* @__PURE__ */ new Date(newAgendamento.data + "T00:00:00");
      let count = 0;
      let limit = newAgendamento.dataFinal ? /* @__PURE__ */ new Date(newAgendamento.dataFinal + "T23:59:59") : qtdSessoes ? null : new Date(new Date(current).setFullYear(current.getFullYear() + 1));
      while ((!limit || current <= limit) && (!qtdSessoes || count < qtdSessoes)) {
        const day = current.getDay();
        const recurrenceConfig = newAgendamento.diasRecorrentes[day];
        if (recurrenceConfig && recurrenceConfig.checked) {
          addAgendamento({
            clienteId: newAgendamento.clienteId,
            matriculaId: finalMatriculaId,
            nomeNaoCadastrado: newAgendamento.nomeNaoCadastrado,
            telefoneNaoCadastrado: newAgendamento.telefoneNaoCadastrado,
            profissionalId: newAgendamento.profissionalId,
            servico: newAgendamento.servico,
            data: current.toISOString().split("T")[0],
            hora: recurrenceConfig.hora,
            horaFim: recurrenceConfig.horaFim,
            isPacienteNaoCadastrado,
            status: "agendado"
          });
          count++;
        }
        current.setDate(current.getDate() + 1);
      }
    } else {
      addAgendamento({
        ...newAgendamento,
        matriculaId: finalMatriculaId,
        isPacienteNaoCadastrado,
        status: "agendado"
      });
      if (!isMatriculaExistente && !isNovoPlano && newAgendamento.gerarCobrancaAvulsa) {
        const pacienteNome = pacientes.find((p) => p.id == newAgendamento.clienteId)?.nome || newAgendamento.nomeNaoCadastrado;
        const servicoPrecoObj = servicos.find((s) => s.nome === newAgendamento.servico);
        let valorBase = 80;
        if (servicoPrecoObj && servicoPrecoObj.valor) {
          valorBase = parseFloat(servicoPrecoObj.valor.toString().replace("R$", "").replace(".", "").replace(",", ".")) || 80;
        }
        addRecebimento({
          pacienteId: newAgendamento.clienteId || "",
          nomePaciente: pacienteNome || "Desconhecido",
          modalidade: newAgendamento.servico,
          plano: "Avulso",
          valor: valorBase,
          valorPago: 0,
          status: "PENDENTE",
          dataVencimento: newAgendamento.data.split("-").reverse().join("/"),
          tipoPagamento: "A Combinar",
          dataPagamento: ""
        });
      }
    }
    setAgendamentoModalOpen(false);
    setNewAgendamento({
      clienteId: "",
      matriculaId: "",
      servico: "",
      nomeNaoCadastrado: "",
      telefoneNaoCadastrado: "",
      profissionalId: "",
      data: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      hora: "07:00",
      horaFim: "08:00",
      dataFinal: "",
      gerarCobrancaAvulsa: true,
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
    setIsPacienteNaoCadastrado(false);
  };
  const handlePresenca = (agendamentoId, status) => {
    const agendamento = agendamentos.find((a) => a.id === agendamentoId);
    if (!agendamento) return;
    updateAgendamento(agendamentoId, { presenca: status });
    if (status === "presente" && agendamento.matriculaId) {
      const matricula = matriculas.find((m) => m.id === agendamento.matriculaId);
      if (matricula && matricula.status !== "Encerrada") {
        const plano = planos.find((p) => p.nome === matricula.plano);
        if (plano) {
          const qtd = parseInt(plano.qtdSessoes);
          if (qtd === 1) {
            updateMatricula(matricula.id, { status: "Encerrada" });
          } else if (qtd > 1) {
            const sessoesFeitas = (matricula.sessoesRealizadas || 0) + 1;
            if (sessoesFeitas >= qtd) {
              updateMatricula(matricula.id, { sessoesRealizadas: sessoesFeitas, status: "Encerrada" });
            } else {
              updateMatricula(matricula.id, { sessoesRealizadas: sessoesFeitas });
            }
          }
        }
      }
    }
    setEventMenuOpen(false);
  };
  const handleOpenEvolucaoModal = (agendamentoId, tipoPresenca = "presente") => {
    setEvolucaoData({ idAgendamento: agendamentoId, descricao: "", tipoPresenca });
    setEvolucaoModalOpen(true);
    setEventMenuOpen(false);
  };
  const handleSalvarEvolucaoEPresenca = () => {
    if (evolucaoData.descricao.trim() !== "") {
      const agendamento = agendamentos.find((a) => a.id === evolucaoData.idAgendamento);
      if (agendamento) {
        const prof = profissionais.find((p) => p.id === agendamento.profissionalId);
        const cli = pacientes.find((p) => p.id === agendamento.clienteId);
        addEvolucao({
          clienteId: agendamento.clienteId,
          clienteNome: cli ? cli.nome : agendamento.nomeNaoCadastrado,
          profissionalId: agendamento.profissionalId,
          profissionalNome: prof ? prof.nome : "Profissional",
          registro: prof ? prof.registro : "",
          data: agendamento.data.split("-").reverse().join("/"),
          descricao: evolucaoData.descricao,
          status: evolucaoData.tipoPresenca === "falta" ? "Falta" : "Presen\xE7a"
        });
      }
    }
    handlePresenca(evolucaoData.idAgendamento, evolucaoData.tipoPresenca || "presente");
    setEvolucaoModalOpen(false);
  };
  const [aleStatus, setAleStatus] = useState("presente");
  const [cassianoStatus, setCassianoStatus] = useState(null);
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 5);
  const days = [];
  if (calendarView === "semana") {
    for (let i = 0; i < 6; i++) {
      days.push(addDays(weekStart, i));
    }
  } else if (calendarView === "dia") {
    days.push(currentDate);
  } else if (calendarView === "mes") {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    let d = startDate;
    while (d <= endDate) {
      days.push(d);
      d = addDays(d, 1);
    }
  }
  const { companyData } = useCompany();
  const businessStartHour = companyData?.businessHoursStart ? parseInt(companyData.businessHoursStart.split(":")[0], 10) : 7;
  const businessEndHour = companyData?.businessHoursEnd ? parseInt(companyData.businessHoursEnd.split(":")[0], 10) : 20;
  const startTime = setHours(startOfDay(currentDate), businessStartHour);
  const endTime = setHours(startOfDay(currentDate), businessEndHour);
  const timeSlots = [];
  let currentSlot = startTime;
  while (currentSlot <= endTime) {
    timeSlots.push(currentSlot);
    currentSlot = addMinutes(currentSlot, interval);
  }
  return /* @__PURE__ */ React.createElement("div", { className: "agenda-page", style: { display: "flex", flexDirection: "column", height: "100%" } }, eventMenuOpen && /* @__PURE__ */ React.createElement(
    "div",
    {
      style: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 },
      onClick: () => {
        setEventMenuOpen(false);
        setSelectedEventId(null);
      }
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: "16px 24px", marginBottom: "24px", display: "flex", flexDirection: "column", gap: "16px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "24px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", background: "#f1f5f9", borderRadius: "8px", padding: "4px" } }, /* @__PURE__ */ React.createElement(
    "div",
    {
      style: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "6px 16px",
        borderRadius: "6px",
        fontWeight: 600,
        fontSize: "0.85rem",
        background: "var(--primary-color)",
        color: "white"
      }
    },
    /* @__PURE__ */ React.createElement(LayoutList, { size: 16 }),
    " Tabela"
  )), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "8px", alignItems: "center" } }, [15, 30, 60].map((min) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: min,
      onClick: () => setInterval(min),
      style: {
        padding: "6px 12px",
        border: "none",
        borderRadius: "16px",
        cursor: "pointer",
        fontWeight: 600,
        fontSize: "0.85rem",
        background: interval === min ? "var(--success)" : "transparent",
        color: interval === min ? "white" : "var(--success)"
      }
    },
    min,
    " min"
  )))), /* @__PURE__ */ React.createElement("div", { className: "flex-between" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "24px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 600, color: "var(--text-dark)" } }, calendarView === "mes" ? format(currentDate, "MMMM 'de' yyyy", { locale: ptBR }).replace(/^\w/, (c) => c.toUpperCase()) : calendarView === "semana" ? `De ${format(weekStart, "d/MMM.", { locale: ptBR })} a ${format(weekEnd, "d/MMM./yyyy", { locale: ptBR })}` : format(currentDate, "d/MMM./yyyy", { locale: ptBR }))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "16px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "4px" } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        if (calendarView === "mes") setCurrentDate(addMonths(currentDate, -1));
        else if (calendarView === "semana") setCurrentDate(addDays(currentDate, -7));
        else setCurrentDate(addDays(currentDate, -1));
      },
      style: { padding: "6px 10px", border: "none", background: "#f1f5f9", borderRadius: "6px", cursor: "pointer", color: "var(--text-muted)" }
    },
    /* @__PURE__ */ React.createElement(ChevronLeft, { size: 16 })
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setCurrentDate(/* @__PURE__ */ new Date()),
      style: { padding: "6px 16px", border: "none", background: "#f1f5f9", borderRadius: "6px", cursor: "pointer", fontWeight: 600, color: "#0ea5e9" }
    },
    "Hoje"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        if (calendarView === "mes") setCurrentDate(addMonths(currentDate, 1));
        else if (calendarView === "semana") setCurrentDate(addDays(currentDate, 7));
        else setCurrentDate(addDays(currentDate, 1));
      },
      style: { padding: "6px 10px", border: "none", background: "#f1f5f9", borderRadius: "6px", cursor: "pointer", color: "var(--text-muted)" }
    },
    /* @__PURE__ */ React.createElement(ChevronRight, { size: 16 })
  )), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "4px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", background: "#f1f5f9", borderRadius: "6px", padding: "0 4px", height: "32px", marginRight: "12px" } }, /* @__PURE__ */ React.createElement("button", { onClick: () => setZoomLevel((z) => Math.max(0.5, Number((z - 0.1).toFixed(1)))), style: { border: "none", background: "transparent", cursor: "pointer", padding: "4px 6px", color: "var(--text-muted)" } }, /* @__PURE__ */ React.createElement(Minus, { size: 14 })), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "0.75rem", fontWeight: 600, color: "var(--text-dark)", minWidth: "36px", textAlign: "center" } }, Math.round(zoomLevel * 100), "%"), /* @__PURE__ */ React.createElement("button", { onClick: () => setZoomLevel((z) => Math.min(2, Number((z + 0.1).toFixed(1)))), style: { border: "none", background: "transparent", cursor: "pointer", padding: "4px 6px", color: "var(--text-muted)" } }, /* @__PURE__ */ React.createElement(Plus, { size: 14 }))), /* @__PURE__ */ React.createElement(
    "button",
    {
      style: {
        padding: "6px 16px",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: 600,
        fontSize: "0.85rem",
        background: calendarView === "mes" ? "#cbd5e1" : "#f1f5f9",
        color: calendarView === "mes" ? "#0ea5e9" : "var(--text-muted)"
      },
      onClick: () => setCalendarView("mes")
    },
    "M\xEAs"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      style: {
        padding: "6px 16px",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: 600,
        fontSize: "0.85rem",
        background: calendarView === "semana" ? "#cbd5e1" : "#f1f5f9",
        color: calendarView === "semana" ? "#0ea5e9" : "var(--text-muted)"
      },
      onClick: () => setCalendarView("semana")
    },
    "Semana"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      style: {
        padding: "6px 16px",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: 600,
        fontSize: "0.85rem",
        background: calendarView === "dia" ? "#cbd5e1" : "#f1f5f9",
        color: calendarView === "dia" ? "#0ea5e9" : "var(--text-muted)"
      },
      onClick: () => setCalendarView("dia")
    },
    "Dia"
  )), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "8px" } }, /* @__PURE__ */ React.createElement("div", { style: { position: "relative" } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setInsertMenuOpen(!insertMenuOpen),
      style: { background: "var(--primary-color)", color: "white", border: "none", borderRadius: "8px", padding: "8px", cursor: "pointer", display: "flex" },
      title: "Incluir"
    },
    /* @__PURE__ */ React.createElement(Plus, { size: 18 })
  ), insertMenuOpen && /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    top: "100%",
    right: 0,
    marginTop: "8px",
    background: "white",
    borderRadius: "8px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    border: "1px solid var(--border-color)",
    width: "220px",
    zIndex: 10,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden"
  } }, /* @__PURE__ */ React.createElement("div", { style: { padding: "12px 16px", fontSize: "0.8rem", fontWeight: 600, color: "var(--primary-color)", borderBottom: "1px solid var(--border-color)" } }, "Inserir"), /* @__PURE__ */ React.createElement(
    "button",
    {
      style: { display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", border: "none", borderBottom: "1px solid #f1f5f9", background: "white", cursor: "pointer", textAlign: "left", color: "#0ea5e9", fontSize: "0.9rem", fontWeight: 500 },
      onMouseEnter: (e) => e.currentTarget.style.background = "#f8fafc",
      onMouseLeave: (e) => e.currentTarget.style.background = "white",
      onClick: () => {
        setAgendamentoModalOpen(true);
        setInsertMenuOpen(false);
      }
    },
    /* @__PURE__ */ React.createElement(CalendarIcon, { size: 18, color: "#0ea5e9" }),
    "Novo Agendamento"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      style: { display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", border: "none", background: "white", cursor: "pointer", textAlign: "left", color: "#0ea5e9", fontSize: "0.9rem", fontWeight: 500 },
      onMouseEnter: (e) => e.currentTarget.style.background = "#f8fafc",
      onMouseLeave: (e) => e.currentTarget.style.background = "white",
      onClick: () => {
        setSelectedPacienteIdForMatricula(null);
        setMatriculaModalOpen(true);
        setInsertMenuOpen(false);
      }
    },
    /* @__PURE__ */ React.createElement(UserPlus, { size: 18, color: "#0ea5e9" }),
    "Nova Matr\xEDcula"
  ))), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 800);
      },
      style: { background: "#f1f5f9", color: "var(--text-main)", border: "none", borderRadius: "8px", padding: "8px", cursor: "pointer", display: "flex" }
    },
    /* @__PURE__ */ React.createElement(RefreshCw, { size: 18, className: isRefreshing ? "spin-anim" : "" })
  ), /* @__PURE__ */ React.createElement("div", { style: { position: "relative" } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setFilterOpen(!filterOpen),
      style: { background: activeFilters.status.length > 0 ? "#dbeafe" : "#cbd5e1", color: activeFilters.status.length > 0 ? "#2563eb" : "var(--text-dark)", border: "none", borderRadius: "8px", padding: "8px", cursor: "pointer", display: "flex" }
    },
    /* @__PURE__ */ React.createElement(Filter, { size: 18 })
  ), filterOpen && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: "100%", right: 0, marginTop: "8px", width: "220px", background: "white", borderRadius: "8px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0", padding: "16px", zIndex: 100 } }, /* @__PURE__ */ React.createElement("h4", { style: { margin: "0 0 12px 0", fontSize: "0.9rem", color: "#1e293b" } }, "Filtrar Status"), ["agendado", "confirmado", "realizado", "falta"].map((st) => /* @__PURE__ */ React.createElement("label", { key: st, style: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", fontSize: "0.85rem", color: "#475569", cursor: "pointer" } }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "checkbox",
      checked: activeFilters.status.includes(st),
      onChange: (e) => {
        const newStatus = e.target.checked ? [...activeFilters.status, st] : activeFilters.status.filter((s) => s !== st);
        setActiveFilters({ ...activeFilters, status: newStatus });
      }
    }
  ), st.charAt(0).toUpperCase() + st.slice(1))), activeFilters.status.length > 0 && /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveFilters({ status: [] }),
      style: { marginTop: "8px", width: "100%", padding: "6px", fontSize: "0.8rem", background: "#f1f5f9", border: "none", borderRadius: "4px", cursor: "pointer", color: "#475569" }
    },
    "Limpar Filtros"
  ))))))), /* @__PURE__ */ React.createElement("div", { className: "card", style: { flex: 1, padding: 0, overflowY: "auto" } }, /* @__PURE__ */ React.createElement("div", { style: { zoom: zoomLevel } }, calendarView === "mes" ? /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", background: "#f8fafc" } }, ["Segunda", "Ter\xE7a", "Quarta", "Quinta", "Sexta", "S\xE1bado", "Domingo"].map((d) => /* @__PURE__ */ React.createElement("div", { key: d, style: { padding: "12px", textAlign: "center", fontWeight: 600, fontSize: "0.85rem", color: "var(--text-dark)", borderRight: "1px solid var(--border-color)", borderBottom: "1px solid var(--border-color)" } }, d)), days.map((day, i) => {
    const isCurrentMonth = isSameMonth(day, currentDate);
    const dayStr = format(day, "yyyy-MM-dd");
    const feriado = (feriados || []).find((f) => f.data === dayStr);
    const dayAgendamentos = agendamentos.filter((a) => a.data === dayStr && a.status !== "cancelado");
    return /* @__PURE__ */ React.createElement("div", { key: i, style: { minHeight: "130px", borderRight: "1px solid var(--border-color)", borderBottom: "1px solid var(--border-color)", padding: "8px", background: feriado ? isCurrentMonth ? "#fee2e2" : "#fef2f2" : isCurrentMonth ? "white" : "#f8fafc", display: "flex", flexDirection: "column" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: "8px", alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "0.75rem", fontWeight: 600, color: "#e11d48", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "70%" }, title: feriado ? feriado.nome : "" }, feriado ? feriado.nome : ""), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "0.85rem", fontWeight: 600, background: isSameDay(day, /* @__PURE__ */ new Date()) ? "#0ea5e9" : "transparent", color: isSameDay(day, /* @__PURE__ */ new Date()) ? "white" : feriado ? "#e11d48" : isCurrentMonth ? "var(--text-main)" : "var(--text-muted)", borderRadius: "50%", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center" } }, format(day, "d"))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "4px", flex: 1, position: "relative" } }, (() => {
      const agsByHour = {};
      dayAgendamentos.forEach((ag) => {
        if (!agsByHour[ag.hora]) agsByHour[ag.hora] = [];
        agsByHour[ag.hora].push(ag);
      });
      const uniqueHours = Object.keys(agsByHour).sort();
      const hoursToShow = uniqueHours.slice(0, 4);
      const shownCount = hoursToShow.reduce((acc, h) => acc + agsByHour[h].length, 0);
      const hiddenCount = dayAgendamentos.length - shownCount;
      return /* @__PURE__ */ React.createElement(React.Fragment, null, hoursToShow.map((hora) => /* @__PURE__ */ React.createElement("div", { key: hora, style: { display: "flex", flexDirection: "row", gap: "4px" } }, agsByHour[hora].map((ag) => {
        const servicoObj = servicos.find((s) => s.nome === ag.servico);
        const servicoCor = servicoObj && servicoObj.cor ? servicoObj.cor : "#0ea5e9";
        const cliente = pacientes.find((p) => p.id === ag.clienteId);
        const clienteNome = cliente ? cliente.nome.split(" ")[0] : ag.nomeNaoCadastrado || "Novo";
        const getTextColor = (hexColor) => {
          const hex = (hexColor || "#fda4af").replace("#", "");
          const r = parseInt(hex.substr(0, 2), 16) || 253;
          const g = parseInt(hex.substr(2, 2), 16) || 164;
          const b = parseInt(hex.substr(4, 2), 16) || 175;
          const yiq = (r * 299 + g * 587 + b * 114) / 1e3;
          return yiq >= 128 ? "#1e293b" : "#ffffff";
        };
        const textColor = getTextColor(servicoCor);
        return /* @__PURE__ */ React.createElement(
          "div",
          {
            key: ag.id,
            onClick: (e) => {
              e.stopPropagation();
              setSelectedEventId(ag.id);
              setEventMenuOpen(!eventMenuOpen);
            },
            style: { flex: 1, minWidth: 0, padding: "4px 6px", background: servicoCor, borderRadius: "4px", fontSize: "0.7rem", color: textColor, cursor: "pointer", position: "relative", zIndex: eventMenuOpen && selectedEventId === ag.id ? 100 : 10 }
          },
          /* @__PURE__ */ React.createElement("div", { style: { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, /* @__PURE__ */ React.createElement("strong", { style: { marginRight: "4px" } }, ag.hora), clienteNome),
          eventMenuOpen && selectedEventId === ag.id && /* @__PURE__ */ React.createElement("div", { style: {
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginTop: "4px",
            background: "white",
            borderRadius: "8px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            border: "1px solid var(--border-color)",
            width: "200px",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            textAlign: "left"
          }, onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement("div", { style: { padding: "8px 16px", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-dark)", borderBottom: "1px solid var(--border-color)", background: "#f8fafc" } }, "Op\xE7\xF5es (", clienteNome, ")"), /* @__PURE__ */ React.createElement(
            "button",
            {
              onClick: (e) => {
                e.stopPropagation();
                handleOpenEvolucaoModal(ag.id, "presente");
                setEventMenuOpen(false);
              },
              style: { display: "flex", alignItems: "center", gap: "10px", padding: "10px 16px", border: "none", background: "white", cursor: "pointer", color: "#16a34a", fontSize: "0.85rem", fontWeight: 500 },
              onMouseEnter: (e) => e.currentTarget.style.background = "#f0fdf4",
              onMouseLeave: (e) => e.currentTarget.style.background = "white"
            },
            /* @__PURE__ */ React.createElement(CheckCircle2, { size: 16 }),
            " Confirmar Presen\xE7a"
          ), /* @__PURE__ */ React.createElement(
            "button",
            {
              onClick: (e) => {
                e.stopPropagation();
                handleOpenEvolucaoModal(ag.id, "falta");
                setEventMenuOpen(false);
              },
              style: { display: "flex", alignItems: "center", gap: "10px", padding: "10px 16px", border: "none", background: "white", cursor: "pointer", color: "#ef4444", fontSize: "0.85rem", fontWeight: 500 },
              onMouseEnter: (e) => e.currentTarget.style.background = "#fef2f2",
              onMouseLeave: (e) => e.currentTarget.style.background = "white"
            },
            /* @__PURE__ */ React.createElement(XCircle, { size: 16 }),
            " Marcar Falta"
          ), ag.isPacienteNaoCadastrado ? /* @__PURE__ */ React.createElement(
            "button",
            {
              onClick: (e) => {
                e.stopPropagation();
                setSelectedWizardAgendamento(ag);
                setWizardModalOpen(true);
                setEventMenuOpen(false);
              },
              style: { display: "flex", alignItems: "center", gap: "10px", padding: "10px 16px", border: "none", background: "white", cursor: "pointer", color: "#f59e0b", fontSize: "0.85rem", fontWeight: 500 },
              onMouseEnter: (e) => e.currentTarget.style.background = "#fef3c7",
              onMouseLeave: (e) => e.currentTarget.style.background = "white"
            },
            /* @__PURE__ */ React.createElement(FileEdit, { size: 16 }),
            " Avalia\xE7\xE3o Completa"
          ) : /* @__PURE__ */ React.createElement(
            "button",
            {
              onClick: (e) => {
                e.stopPropagation();
                setSelectedWizardAgendamento(ag);
                setWizardModalOpen(true);
                setEventMenuOpen(false);
              },
              style: { display: "flex", alignItems: "center", gap: "10px", padding: "10px 16px", border: "none", background: "white", cursor: "pointer", color: "#8b5cf6", fontSize: "0.85rem", fontWeight: 500 },
              onMouseEnter: (e) => e.currentTarget.style.background = "#f3e8ff",
              onMouseLeave: (e) => e.currentTarget.style.background = "white"
            },
            /* @__PURE__ */ React.createElement(FileEdit, { size: 16 }),
            " Nova Avalia\xE7\xE3o"
          ), /* @__PURE__ */ React.createElement("div", { style: { height: "1px", background: "var(--border-color)", margin: "4px 0" } }), /* @__PURE__ */ React.createElement(
            "button",
            {
              onClick: (e) => {
                e.stopPropagation();
                if (window.confirm("Tem certeza que deseja excluir este agendamento?")) {
                  setAgendamentos(agendamentos.filter((a) => a.id !== ag.id));
                }
                setEventMenuOpen(false);
              },
              style: { display: "flex", alignItems: "center", gap: "10px", padding: "10px 16px", border: "none", background: "white", cursor: "pointer", color: "#ef4444", fontSize: "0.85rem", fontWeight: 500 },
              onMouseEnter: (e) => e.currentTarget.style.background = "#fef2f2",
              onMouseLeave: (e) => e.currentTarget.style.background = "white"
            },
            /* @__PURE__ */ React.createElement(Trash2, { size: 16 }),
            " Excluir"
          ))
        );
      }))), hiddenCount > 0 && /* @__PURE__ */ React.createElement("div", { style: { fontSize: "0.7rem", color: "var(--text-muted)", textAlign: "center", marginTop: "auto", fontWeight: 600 } }, "+", hiddenCount, " mais"));
    })()));
  })) : /* @__PURE__ */ React.createElement("div", { style: { position: "relative" } }, /* @__PURE__ */ React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", textAlign: "center", tableLayout: "fixed" } }, /* @__PURE__ */ React.createElement("thead", { style: { position: "sticky", top: 0, background: "white", zIndex: 20, boxShadow: "0 1px 2px rgba(0,0,0,0.05)" } }, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { style: { width: "80px", borderRight: "1px solid var(--border-color)", borderBottom: "1px solid var(--border-color)", padding: "16px 8px", fontSize: "0.85rem", color: "var(--text-muted)" } }, "Hora"), days.map((day, idx) => {
    const dataStr = format(day, "yyyy-MM-dd");
    const feriado = (feriados || []).find((f) => f.data === dataStr);
    return /* @__PURE__ */ React.createElement("th", { key: idx, style: {
      borderRight: "1px solid var(--border-color)",
      borderBottom: "1px solid var(--border-color)",
      padding: "12px 8px",
      background: isSameDay(day, /* @__PURE__ */ new Date()) ? "#f8fafc" : feriado ? "#fff1f2" : "white"
    } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 600, color: feriado ? "#e11d48" : "var(--text-dark)", fontSize: "0.95rem" } }, format(day, "EEEE", { locale: ptBR }).split("-")[0]), /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 400, color: feriado ? "#f43f5e" : "var(--text-muted)", fontSize: "0.85rem" } }, format(day, "dd/MMM.", { locale: ptBR }), feriado && /* @__PURE__ */ React.createElement("span", { style: { display: "block", fontSize: "0.75rem", fontWeight: 600, marginTop: "2px" } }, feriado.nome)));
  }))), /* @__PURE__ */ React.createElement("tbody", { style: { position: "relative" } }, timeSlots.map((time, idx) => /* @__PURE__ */ React.createElement("tr", { key: idx }, /* @__PURE__ */ React.createElement("td", { style: {
    borderRight: "1px solid var(--border-color)",
    borderBottom: "1px solid var(--border-color)",
    padding: "8px",
    fontSize: "0.85rem",
    color: "var(--text-muted)",
    fontWeight: 500,
    height: "60px",
    boxSizing: "border-box"
  } }, format(time, "HH:mm")), days.map((day, dayIdx) => /* @__PURE__ */ React.createElement(
    "td",
    {
      key: dayIdx,
      onClick: (e) => {
        const dataFormatada = format(day, "yyyy-MM-dd");
        const horaSlot = format(time, "HH:mm");
        setSlotActionMenu({ data: dataFormatada, hora: horaSlot, x: e.clientX, y: e.clientY });
      },
      style: {
        borderRight: "1px solid var(--border-color)",
        borderBottom: "1px solid var(--border-color)",
        background: isSameDay(day, /* @__PURE__ */ new Date()) ? "#f8fafc" : "white",
        cursor: "pointer",
        height: "60px",
        boxSizing: "border-box"
      },
      onMouseEnter: (e) => {
        e.currentTarget.style.background = "#e0f2fe";
      },
      onMouseLeave: (e) => {
        e.currentTarget.style.background = isSameDay(day, /* @__PURE__ */ new Date()) ? "#f8fafc" : "white";
      }
    }
  )))))), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: "65px", left: "80px", right: 0, height: `${timeSlots.length * 60}px`, display: "flex", pointerEvents: "none", zIndex: 10 } }, days.map((day, dayIdx) => {
    const dataFormatada = format(day, "yyyy-MM-dd");
    let agendamentosDoDia = agendamentos.filter((a) => {
      if (a.data !== dataFormatada || a.status === "cancelado") return false;
      if (activeFilters.status.length > 0 && !a.isBlock && !activeFilters.status.includes(a.status)) return false;
      return true;
    });
    agendamentosDoDia = agendamentosDoDia.filter(
      (a, index, self) => !a.isBlock || index === self.findIndex((t) => t.isBlock && t.descricao === a.descricao)
    );
    const eventsWithTimes = agendamentosDoDia.map((ag) => {
      const [sH, sM] = (ag.hora || "00:00").split(":").map(Number);
      const startMins = sH * 60 + sM;
      let endMins = startMins + 60;
      if (ag.horaFim) {
        const [eH, eM] = ag.horaFim.split(":").map(Number);
        endMins = eH * 60 + eM;
      } else if (ag.isBlock) {
        endMins = startMins + 15;
      }
      return { ...ag, startMins, endMins };
    }).sort((a, b) => a.startMins - b.startMins);
    const groups = [];
    let currentGroup = [];
    let currentGroupEnd = 0;
    eventsWithTimes.forEach((ev) => {
      if (ev.startMins >= currentGroupEnd && currentGroup.length > 0) {
        groups.push(currentGroup);
        currentGroup = [ev];
        currentGroupEnd = ev.endMins;
      } else {
        currentGroup.push(ev);
        currentGroupEnd = Math.max(currentGroupEnd, ev.endMins);
      }
    });
    if (currentGroup.length > 0) groups.push(currentGroup);
    groups.forEach((group) => {
      const cols = [];
      group.forEach((ev) => {
        let placed = false;
        for (let i = 0; i < cols.length; i++) {
          if (!cols[i].some((existing) => Math.max(ev.startMins, existing.startMins) < Math.min(ev.endMins, existing.endMins))) {
            cols[i].push(ev);
            ev._colIndex = i;
            placed = true;
            break;
          }
        }
        if (!placed) {
          cols.push([ev]);
          ev._colIndex = cols.length - 1;
        }
      });
      group.forEach((ev) => ev._colCount = cols.length);
    });
    const [gridStartH, gridStartM] = format(timeSlots[0], "HH:mm").split(":").map(Number);
    const gridStartMins = gridStartH * 60 + gridStartM;
    return /* @__PURE__ */ React.createElement("div", { key: dayIdx, style: { flex: 1, position: "relative", borderRight: "1px solid transparent" } }, eventsWithTimes.map((agendamento) => {
      const topPx = (agendamento.startMins - gridStartMins) / interval * 60;
      const heightPx = Math.max(20, (agendamento.endMins - agendamento.startMins) / interval * 60);
      const widthPct = 100 / agendamento._colCount;
      const leftPct = widthPct * agendamento._colIndex;
      if (agendamento.isBlock) {
        return /* @__PURE__ */ React.createElement(
          "div",
          {
            key: agendamento.id,
            style: {
              position: "absolute",
              top: `${topPx}px`,
              height: `${heightPx}px`,
              left: `${leftPct}%`,
              width: `${widthPct}%`,
              padding: "2px",
              boxSizing: "border-box",
              pointerEvents: "auto"
            }
          },
          /* @__PURE__ */ React.createElement("div", { style: { flex: 1, height: "100%", background: "#cbd5e1", border: "1px solid #94a3b8", borderRadius: "4px", padding: "4px 8px", fontSize: "0.75rem", color: "#334155", fontWeight: 600, display: "flex", justifyContent: "space-between", alignItems: "flex-start", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("span", null, "\u{1F512} ", agendamento.descricao), /* @__PURE__ */ React.createElement("button", { onClick: (e) => {
            e.stopPropagation();
            updateAgendamento(agendamento.id, { status: "cancelado" });
          }, style: { background: "transparent", border: "none", cursor: "pointer", color: "#ef4444" } }, /* @__PURE__ */ React.createElement(X, { size: 14 })))
        );
      }
      const prof = profissionais.find((p) => p.id === agendamento.profissionalId);
      const profNome = prof ? prof.nome : "Profissional";
      const servicoObj = servicos.find((s) => s.nome === agendamento.servico);
      const servicoCor = servicoObj && servicoObj.cor ? servicoObj.cor : "#fda4af";
      const hexColor = servicoCor.replace("#", "");
      const r = parseInt(hexColor.substr(0, 2), 16) || 253;
      const g = parseInt(hexColor.substr(2, 2), 16) || 164;
      const b = parseInt(hexColor.substr(4, 2), 16) || 175;
      const yiq = (r * 299 + g * 587 + b * 114) / 1e3;
      const textColor = yiq >= 128 ? "#1e293b" : "#ffffff";
      let clienteNome = agendamento.nomeNaoCadastrado;
      if (!agendamento.isPacienteNaoCadastrado) {
        const cli = pacientes.find((p) => p.id === agendamento.clienteId);
        clienteNome = cli ? cli.nome : "Cliente";
      }
      return /* @__PURE__ */ React.createElement(
        "div",
        {
          key: agendamento.id,
          style: {
            position: "absolute",
            top: `${topPx}px`,
            height: `${heightPx}px`,
            left: `${leftPct}%`,
            width: `${widthPct}%`,
            padding: "1px 2px",
            boxSizing: "border-box",
            pointerEvents: "auto",
            zIndex: eventMenuOpen && selectedEventId === agendamento.id ? 100 : 10
          }
        },
        /* @__PURE__ */ React.createElement(
          "div",
          {
            onClick: (e) => {
              e.stopPropagation();
              setSelectedEventId(agendamento.id);
              setEventMenuOpen(!eventMenuOpen);
            },
            style: { height: "100%", position: "relative", display: "flex", flexDirection: "column", border: `1px solid ${servicoCor}`, borderLeft: `4px solid ${servicoCor}`, borderRadius: "4px", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", overflow: "visible" }
          },
          /* @__PURE__ */ React.createElement("div", { style: { background: servicoCor, color: textColor, padding: "2px 4px", fontSize: "0.65rem", fontWeight: 600, textAlign: "left", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, agendamento.hora, " - ", agendamento.horaFim || `${Math.floor(agendamento.endMins / 60).toString().padStart(2, "0")}:${(agendamento.endMins % 60).toString().padStart(2, "0")}`, " | ", profNome),
          /* @__PURE__ */ React.createElement("div", { style: { background: servicoCor, flex: 1, padding: "2px 4px", display: "flex", flexDirection: "column", gap: "2px", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "flex-start", gap: "4px" } }, /* @__PURE__ */ React.createElement(User, { size: 10, color: textColor, style: { marginTop: "2px", flexShrink: 0 } }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", overflow: "hidden", width: "100%" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "0.7rem", color: textColor, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, clienteNome), agendamento.presenca === "presente" && /* @__PURE__ */ React.createElement("span", { style: { background: "#22c55e", color: "white", fontSize: "0.55rem", fontWeight: 700, padding: "1px 3px", borderRadius: "4px" } }, "PR"), agendamento.presenca === "falta" && /* @__PURE__ */ React.createElement("span", { style: { background: "#ef4444", color: "white", fontSize: "0.55rem", fontWeight: 700, padding: "1px 3px", borderRadius: "4px" } }, "FA")), agendamento.isPacienteNaoCadastrado && /* @__PURE__ */ React.createElement("span", { style: { fontSize: "0.55rem", color: "#f59e0b", fontWeight: 700 } }, "* N\xE3o Cadastrado"))))
        ),
        eventMenuOpen && selectedEventId === agendamento.id && /* @__PURE__ */ React.createElement("div", { style: {
          position: "absolute",
          top: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          marginTop: "4px",
          background: "white",
          borderRadius: "8px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          border: "1px solid var(--border-color)",
          width: "200px",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          textAlign: "left"
        } }, /* @__PURE__ */ React.createElement("div", { style: { padding: "8px 16px", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-dark)", borderBottom: "1px solid var(--border-color)", background: "#f8fafc" } }, "Op\xE7\xF5es (", clienteNome.split(" ")[0], ")"), /* @__PURE__ */ React.createElement(
          "button",
          {
            onClick: (e) => {
              e.stopPropagation();
              handleOpenEvolucaoModal(agendamento.id, "presente");
              setEventMenuOpen(false);
            },
            style: { display: "flex", alignItems: "center", gap: "10px", padding: "10px 16px", border: "none", background: "white", cursor: "pointer", color: "#16a34a", fontSize: "0.85rem", fontWeight: 500 },
            onMouseEnter: (e) => e.currentTarget.style.background = "#f0fdf4",
            onMouseLeave: (e) => e.currentTarget.style.background = "white"
          },
          /* @__PURE__ */ React.createElement(CheckCircle2, { size: 16 }),
          " Confirmar Presen\xE7a"
        ), /* @__PURE__ */ React.createElement(
          "button",
          {
            onClick: (e) => {
              e.stopPropagation();
              handleOpenEvolucaoModal(agendamento.id, "falta");
              setEventMenuOpen(false);
            },
            style: { display: "flex", alignItems: "center", gap: "10px", padding: "10px 16px", border: "none", background: "white", cursor: "pointer", color: "#ef4444", fontSize: "0.85rem", fontWeight: 500 },
            onMouseEnter: (e) => e.currentTarget.style.background = "#fef2f2",
            onMouseLeave: (e) => e.currentTarget.style.background = "white"
          },
          /* @__PURE__ */ React.createElement(XCircle, { size: 16 }),
          " Marcar Falta"
        ), agendamento.isPacienteNaoCadastrado ? /* @__PURE__ */ React.createElement(
          "button",
          {
            onClick: (e) => {
              e.stopPropagation();
              setSelectedWizardAgendamento(agendamento);
              setWizardModalOpen(true);
              setEventMenuOpen(false);
            },
            style: { display: "flex", alignItems: "center", gap: "10px", padding: "10px 16px", border: "none", background: "white", cursor: "pointer", color: "#f59e0b", fontSize: "0.85rem", fontWeight: 500 },
            onMouseEnter: (e) => e.currentTarget.style.background = "#fef3c7",
            onMouseLeave: (e) => e.currentTarget.style.background = "white"
          },
          /* @__PURE__ */ React.createElement(FileEdit, { size: 16 }),
          " Avalia\xE7\xE3o Completa"
        ) : /* @__PURE__ */ React.createElement(
          "button",
          {
            onClick: (e) => {
              e.stopPropagation();
              setSelectedWizardAgendamento(agendamento);
              setWizardModalOpen(true);
              setEventMenuOpen(false);
            },
            style: { display: "flex", alignItems: "center", gap: "10px", padding: "10px 16px", border: "none", background: "white", cursor: "pointer", color: "#8b5cf6", fontSize: "0.85rem", fontWeight: 500 },
            onMouseEnter: (e) => e.currentTarget.style.background = "#f3e8ff",
            onMouseLeave: (e) => e.currentTarget.style.background = "white"
          },
          /* @__PURE__ */ React.createElement(FileEdit, { size: 16 }),
          " Nova Avalia\xE7\xE3o"
        ), /* @__PURE__ */ React.createElement("div", { style: { height: "1px", background: "var(--border-color)", margin: "4px 0" } }), /* @__PURE__ */ React.createElement(
          "button",
          {
            onClick: (e) => {
              e.stopPropagation();
              if (window.confirm("Tem certeza que deseja excluir este agendamento?")) {
                setAgendamentos(agendamentos.filter((a) => a.id !== agendamento.id));
              }
              setEventMenuOpen(false);
            },
            style: { display: "flex", alignItems: "center", gap: "10px", padding: "10px 16px", border: "none", background: "white", cursor: "pointer", color: "#ef4444", fontSize: "0.85rem", fontWeight: 500 },
            onMouseEnter: (e) => e.currentTarget.style.background = "#fef2f2",
            onMouseLeave: (e) => e.currentTarget.style.background = "white"
          },
          /* @__PURE__ */ React.createElement(Trash2, { size: 16 }),
          " Excluir"
        ))
      );
    }));
  }))))), agendamentoModalOpen && /* @__PURE__ */ React.createElement("div", { style: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { background: "white", width: "100%", maxWidth: "550px", borderRadius: "12px", overflow: "hidden", display: "flex", flexDirection: "column" } }, /* @__PURE__ */ React.createElement("div", { style: { padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, color: "var(--text-dark)", fontSize: "1rem" } }, /* @__PURE__ */ React.createElement(CalendarIcon, { size: 18 }), "Marcar Novo Agendamento ", newAgendamento.servico ? `- ${newAgendamento.servico}` : ""), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setAgendamentoModalOpen(false),
      style: { background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }
    },
    /* @__PURE__ */ React.createElement(X, { size: 20 })
  )), /* @__PURE__ */ React.createElement("div", { style: { padding: "0 24px 24px 24px", display: "flex", flexDirection: "column", gap: "20px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "16px" } }, /* @__PURE__ */ React.createElement("button", { style: { flex: 1, padding: "10px", background: "#0284c7", color: "white", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer" } }, "Hor\xE1rio Livre"), /* @__PURE__ */ React.createElement("button", { style: { flex: 1, padding: "10px", background: "white", color: "#0284c7", border: "1px solid #0284c7", borderRadius: "8px", fontWeight: 600, cursor: "pointer" } }, "Reposi\xE7\xF5es"), /* @__PURE__ */ React.createElement("button", { style: { flex: 1, padding: "10px", background: "white", color: "#0284c7", border: "1px solid #0284c7", borderRadius: "8px", fontWeight: 600, cursor: "pointer" } }, "Experimental")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "16px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "-8px" } }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "checkbox",
      id: "naoCadastrado",
      checked: isPacienteNaoCadastrado,
      onChange: (e) => setIsPacienteNaoCadastrado(e.target.checked),
      style: { width: "16px", height: "16px" }
    }
  ), /* @__PURE__ */ React.createElement("label", { htmlFor: "naoCadastrado", style: { fontSize: "0.85rem", fontWeight: 600, color: "var(--text-dark)", cursor: "pointer" } }, "Paciente n\xE3o cadastrado (Avalia\xE7\xE3o / Aula Experimental)")), isPacienteNaoCadastrado ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "16px" } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 2 } }, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-dark)", marginBottom: "8px" } }, "Nome do Cliente: *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      placeholder: "Nome completo",
      value: newAgendamento.nomeNaoCadastrado,
      onChange: (e) => setNewAgendamento({ ...newAgendamento, nomeNaoCadastrado: e.target.value }),
      style: { width: "100%", padding: "10px 12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none", backgroundColor: "#fff", color: "var(--text-main)" }
    }
  )), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-dark)", marginBottom: "8px" } }, "Telefone: *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      placeholder: "(11) 99999-9999",
      value: newAgendamento.telefoneNaoCadastrado,
      onChange: (e) => setNewAgendamento({ ...newAgendamento, telefoneNaoCadastrado: maskTelefone(e.target.value) }),
      style: { width: "100%", padding: "10px 12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none", backgroundColor: "#fff", color: "var(--text-main)" }
    }
  ))) : /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" } }, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-dark)" } }, "Cliente: *"), newAgendamento.clienteId && /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setSelectedPacienteIdForMatricula(newAgendamento.clienteId);
        setMatriculaModalOpen(true);
      },
      style: { background: "#f0f9ff", color: "#0ea5e9", border: "none", borderRadius: "4px", padding: "4px 8px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }
    },
    /* @__PURE__ */ React.createElement(Plus, { size: 14 }),
    " Nova Matr\xEDcula"
  )), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: newAgendamento.clienteId,
      onChange: (e) => setNewAgendamento({ ...newAgendamento, clienteId: e.target.value }),
      style: { width: "100%", padding: "10px 12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none", backgroundColor: "#fff", color: "var(--text-main)" }
    },
    /* @__PURE__ */ React.createElement("option", { value: "" }, "- Selecione o Cliente -"),
    pacientes.map((p) => /* @__PURE__ */ React.createElement("option", { key: p.id, value: p.id }, p.nome))
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-dark)", marginBottom: "8px" } }, "Servi\xE7o: *"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: newAgendamento.servico,
      onChange: (e) => {
        const servicoSel = e.target.value;
        const newHoraFim = getHoraFim(newAgendamento.hora, servicoSel);
        setNewAgendamento({ ...newAgendamento, servico: servicoSel, matriculaId: "", horaFim: newHoraFim });
      },
      style: { width: "100%", padding: "10px 12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none", backgroundColor: "#fff", color: "var(--text-main)" }
    },
    /* @__PURE__ */ React.createElement("option", { value: "" }, "- Selecione o Servi\xE7o -"),
    servicos.map((s) => /* @__PURE__ */ React.createElement("option", { key: s.id, value: s.nome }, s.nome))
  )), !isPacienteNaoCadastrado && newAgendamento.servico && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-dark)", marginBottom: "8px" } }, "Plano / Matr\xEDcula:"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: newAgendamento.matriculaId,
      onChange: (e) => setNewAgendamento({ ...newAgendamento, matriculaId: e.target.value }),
      disabled: matriculasDoServico.length === 0 && planosDoServico.length === 0,
      style: { width: "100%", padding: "10px 12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none", backgroundColor: matriculasDoServico.length === 0 && planosDoServico.length === 0 ? "#f8fafc" : "#fff", color: "var(--text-main)" }
    },
    matriculasDoServico.length === 0 && planosDoServico.length === 0 ? /* @__PURE__ */ React.createElement("option", { value: "" }, "- Sem plano ativo ou cadastrado para este servi\xE7o -") : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("option", { value: "" }, "- Selecione (Opcional) -"), matriculasDoServico.length > 0 && /* @__PURE__ */ React.createElement("optgroup", { label: "Planos Ativos do Paciente" }, matriculasDoServico.map((m) => /* @__PURE__ */ React.createElement("option", { key: m.id, value: `matricula-${m.id}` }, m.plano))), planosDoServico.length > 0 && /* @__PURE__ */ React.createElement("optgroup", { label: "Contratar Novo Plano (Gera cobran\xE7a)" }, planosDoServico.map((p) => /* @__PURE__ */ React.createElement("option", { key: p.id, value: `novo-plano-${p.id}` }, p.nome, " - ", p.preco))))
  )), !isMatriculaExistente && !isNovoPlano && !isRecorrenteOrPackage && newAgendamento.servico && /* @__PURE__ */ React.createElement("div", { style: { background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "12px" } }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "checkbox",
      id: "gerarCobrancaAvulsa",
      checked: newAgendamento.gerarCobrancaAvulsa,
      onChange: (e) => setNewAgendamento({ ...newAgendamento, gerarCobrancaAvulsa: e.target.checked }),
      style: { width: "16px", height: "16px" }
    }
  ), /* @__PURE__ */ React.createElement("label", { htmlFor: "gerarCobrancaAvulsa", style: { fontSize: "0.85rem", color: "#334155", cursor: "pointer" } }, "Gerar cobran\xE7a avulsa automaticamente no m\xF3dulo Financeiro")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-dark)", marginBottom: "8px" } }, "Profissional: *"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: newAgendamento.profissionalId,
      onChange: (e) => setNewAgendamento({ ...newAgendamento, profissionalId: e.target.value }),
      style: { width: "100%", padding: "10px 12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none", backgroundColor: "#fff", color: "var(--text-main)" }
    },
    /* @__PURE__ */ React.createElement("option", { value: "" }, "- Selecione o Profissional -"),
    profissionais.map((p) => /* @__PURE__ */ React.createElement("option", { key: p.id, value: p.id }, p.nome))
  )), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "16px", marginBottom: "8px" } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-dark)", marginBottom: "8px" } }, "Data", isRecorrenteOrPackage ? " de In\xEDcio" : "", ": *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "date",
      value: newAgendamento.data,
      onChange: (e) => setNewAgendamento({ ...newAgendamento, data: e.target.value }),
      style: { width: "100%", padding: "10px 12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none", backgroundColor: "#fff", color: "var(--text-main)" }
    }
  )), !isRecorrenteOrPackage && /* @__PURE__ */ React.createElement("div", { style: { flex: 1, display: "flex", gap: "8px" } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-dark)", marginBottom: "8px" } }, "In\xEDcio: *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "time",
      step: "300",
      value: newAgendamento.hora,
      onChange: (e) => {
        const newHora = e.target.value;
        const newHoraFim = getHoraFim(newHora, newAgendamento.servico);
        setNewAgendamento({ ...newAgendamento, hora: newHora, horaFim: newHoraFim });
      },
      style: { width: "100%", padding: "10px 12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none", backgroundColor: "#fff", color: "var(--text-main)" }
    }
  )), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-dark)", marginBottom: "8px" } }, "Fim: *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "time",
      step: "300",
      value: newAgendamento.horaFim,
      onChange: (e) => setNewAgendamento({ ...newAgendamento, horaFim: e.target.value }),
      style: { width: "100%", padding: "10px 12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none", backgroundColor: "#fff", color: "var(--text-main)" }
    }
  )))), isRecorrenteOrPackage && !qtdSessoes && /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-dark)", marginBottom: "8px" } }, "Repetir At\xE9: (Deixe em branco para tempo indeterminado)"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "date",
      value: newAgendamento.dataFinal,
      onChange: (e) => setNewAgendamento({ ...newAgendamento, dataFinal: e.target.value }),
      style: { width: "100%", padding: "10px 12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none", backgroundColor: "#fff", color: "var(--text-main)" }
    }
  )), qtdSessoes > 0 && /* @__PURE__ */ React.createElement("div", { style: { background: "#f0fdf4", color: "#166534", padding: "12px", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "16px", border: "1px dashed #bbf7d0" } }, "O sistema agendar\xE1 automaticamente ", /* @__PURE__ */ React.createElement("strong", null, qtdSessoes, " sess\xF5es"), " a partir da data de in\xEDcio, pulando os dias que n\xE3o estiverem marcados abaixo."), isRecorrenteOrPackage && /* @__PURE__ */ React.createElement("div", { style: { marginTop: "16px" } }, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: "12px" } }, "Dias e Hor\xE1rios Fixos"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "8px" } }, Object.entries({ 1: "Segunda-feira", 2: "Ter\xE7a-feira", 3: "Quarta-feira", 4: "Quinta-feira", 5: "Sexta-feira", 6: "S\xE1bado" }).map(([day, label]) => {
    const dayIndex = parseInt(day);
    return /* @__PURE__ */ React.createElement("div", { key: day, style: { display: "flex", alignItems: "center", gap: "12px" } }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "checkbox",
        id: `day-${day}`,
        checked: newAgendamento.diasRecorrentes[dayIndex].checked,
        onChange: (e) => setNewAgendamento({
          ...newAgendamento,
          diasRecorrentes: {
            ...newAgendamento.diasRecorrentes,
            [dayIndex]: { ...newAgendamento.diasRecorrentes[dayIndex], checked: e.target.checked }
          }
        }),
        style: { width: "16px", height: "16px" }
      }
    ), /* @__PURE__ */ React.createElement("label", { htmlFor: `day-${day}`, style: { fontSize: "0.85rem", color: "var(--text-main)", width: "100px" } }, label), newAgendamento.diasRecorrentes[dayIndex].checked && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "4px" } }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "time",
        step: "300",
        value: newAgendamento.diasRecorrentes[dayIndex].hora,
        onChange: (e) => {
          const newHora = e.target.value;
          const newHoraFim = getHoraFim(newHora, newAgendamento.servico);
          setNewAgendamento({
            ...newAgendamento,
            diasRecorrentes: {
              ...newAgendamento.diasRecorrentes,
              [dayIndex]: { ...newAgendamento.diasRecorrentes[dayIndex], hora: newHora, horaFim: newHoraFim }
            }
          });
        },
        style: { padding: "6px 8px", border: "1px solid var(--border-color)", borderRadius: "6px", outline: "none", backgroundColor: "#fff", color: "var(--text-main)" }
      }
    ), /* @__PURE__ */ React.createElement("span", { style: { padding: "6px 4px", color: "var(--text-muted)" } }, "at\xE9"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "time",
        step: "300",
        value: newAgendamento.diasRecorrentes[dayIndex].horaFim,
        onChange: (e) => setNewAgendamento({
          ...newAgendamento,
          diasRecorrentes: {
            ...newAgendamento.diasRecorrentes,
            [dayIndex]: { ...newAgendamento.diasRecorrentes[dayIndex], horaFim: e.target.value }
          }
        }),
        style: { padding: "6px 8px", border: "1px solid var(--border-color)", borderRadius: "6px", outline: "none", backgroundColor: "#fff", color: "var(--text-main)" }
      }
    )));
  }))))), /* @__PURE__ */ React.createElement("div", { style: { padding: "16px 24px", display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid var(--border-color)", background: "#f8fafc" } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handleSaveAgendamento,
      style: { display: "flex", alignItems: "center", gap: "8px", background: "#22c55e", color: "white", border: "none", borderRadius: "8px", padding: "10px 20px", fontWeight: 600, cursor: "pointer" }
    },
    /* @__PURE__ */ React.createElement(Save, { size: 16 }),
    " Salvar"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setAgendamentoModalOpen(false),
      style: { display: "flex", alignItems: "center", gap: "8px", background: "#ef4444", color: "white", border: "none", borderRadius: "8px", padding: "10px 20px", fontWeight: 600, cursor: "pointer" }
    },
    /* @__PURE__ */ React.createElement(X, { size: 16 }),
    " Fechar"
  )))), editModalOpen && /* @__PURE__ */ React.createElement("div", { style: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { background: "white", width: "100%", maxWidth: "550px", borderRadius: "12px", overflow: "hidden", display: "flex", flexDirection: "column" } }, /* @__PURE__ */ React.createElement("div", { style: { padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, color: "var(--text-dark)", fontSize: "1rem" } }, /* @__PURE__ */ React.createElement(Edit, { size: 18 }), "Editar Agendamento - Pilates"), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setEditModalOpen(false),
      style: { background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }
    },
    /* @__PURE__ */ React.createElement(X, { size: 20 })
  )), /* @__PURE__ */ React.createElement("div", { style: { padding: "0 24px 24px 24px", display: "flex", flexDirection: "column", gap: "20px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "16px" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: "8px" } }, "Cliente:"), /* @__PURE__ */ React.createElement("select", { value: "Cassiano Busatto", readOnly: true, style: { width: "100%", padding: "12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none", backgroundColor: "#fff", color: "var(--text-main)" } }, /* @__PURE__ */ React.createElement("option", null, "Cassiano Busatto"))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: "8px" } }, "Telefone: *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: "(54) 9.9122-8558",
      readOnly: true,
      style: { width: "100%", padding: "12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none", backgroundColor: "#fff", color: "var(--text-main)" }
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: "8px" } }, "Profissional: *"), /* @__PURE__ */ React.createElement("select", { value: "Alessandra Albuquerque Donato", readOnly: true, style: { width: "100%", padding: "12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none", backgroundColor: "#fff", color: "var(--text-main)" } }, /* @__PURE__ */ React.createElement("option", null, "Alessandra Albuquerque Donato"))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "16px" } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: "8px" } }, "Data: *"), /* @__PURE__ */ React.createElement("div", { style: { position: "relative" } }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "date",
      defaultValue: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      style: { width: "100%", padding: "12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none", backgroundColor: "#fff", color: "var(--text-main)" }
    }
  ))), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: "8px" } }, "Hora: *"), /* @__PURE__ */ React.createElement("select", { value: "07:00", readOnly: true, style: { width: "100%", padding: "12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none", backgroundColor: "#fff", color: "var(--text-main)" } }, /* @__PURE__ */ React.createElement("option", null, "07:00")))))), /* @__PURE__ */ React.createElement("div", { style: { padding: "16px 24px", display: "flex", justifyContent: "flex-end", gap: "12px" } }, /* @__PURE__ */ React.createElement("button", { style: { display: "flex", alignItems: "center", gap: "8px", background: "#16a34a", color: "white", border: "none", borderRadius: "8px", padding: "10px 20px", fontWeight: 600, cursor: "pointer" } }, /* @__PURE__ */ React.createElement(Save, { size: 16 }), " Salvar"), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setEditModalOpen(false),
      style: { display: "flex", alignItems: "center", gap: "8px", background: "#ef4444", color: "white", border: "none", borderRadius: "8px", padding: "10px 20px", fontWeight: 600, cursor: "pointer" }
    },
    /* @__PURE__ */ React.createElement(X, { size: 16 }),
    " Fechar"
  )))), /* @__PURE__ */ React.createElement(
    NovaMatriculaModal,
    {
      isOpen: matriculaModalOpen,
      onClose: () => setMatriculaModalOpen(false),
      initialPacienteId: selectedPacienteIdForMatricula
    }
  ), /* @__PURE__ */ React.createElement(
    DetalhesMatriculaModal,
    {
      isOpen: detalhesMatriculaModalOpen,
      onClose: () => setDetalhesMatriculaModalOpen(false)
    }
  ), /* @__PURE__ */ React.createElement(
    AvaliacaoWizardModal,
    {
      isOpen: wizardModalOpen,
      onClose: () => {
        setWizardModalOpen(false);
        setSelectedWizardAgendamento(null);
      },
      agendamentoId: selectedWizardAgendamento?.id,
      initialNome: selectedWizardAgendamento?.nomeNaoCadastrado,
      initialTelefone: selectedWizardAgendamento?.telefoneNaoCadastrado
    }
  ), evolucaoModalOpen && /* @__PURE__ */ React.createElement("div", { style: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1e3, display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { background: "white", width: "800px", maxWidth: "95%", borderRadius: "12px", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" } }, /* @__PURE__ */ React.createElement("div", { style: { padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", background: "#f8fafc" } }, /* @__PURE__ */ React.createElement("h2", { style: { margin: 0, fontSize: "1.1rem", color: "var(--text-dark)", display: "flex", alignItems: "center", gap: "8px" } }, evolucaoData.tipoPresenca === "falta" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(XCircle, { size: 18, color: "#ef4444", strokeWidth: 2.5 }), " Marcar Falta e Evolu\xE7\xE3o") : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(CheckCircle2, { size: 18, color: "#16a34a", strokeWidth: 2.5 }), " Confirmar Presen\xE7a e Evolu\xE7\xE3o")), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setEvolucaoModalOpen(false),
      style: { background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }
    },
    /* @__PURE__ */ React.createElement(X, { size: 20 })
  )), /* @__PURE__ */ React.createElement("div", { style: { padding: "24px", display: "flex", flexDirection: "column", gap: "20px" } }, (() => {
    const agendamento = agendamentos.find((a) => a.id === evolucaoData.idAgendamento);
    if (!agendamento) return null;
    const cli = pacientes.find((p) => p.id === agendamento.clienteId);
    const prof = profissionais.find((p) => p.id === agendamento.profissionalId);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", background: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid var(--border-color)" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: "4px" } }, "Cliente"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "0.95rem", color: "var(--text-dark)", fontWeight: 500 } }, cli ? cli.nome : agendamento.nomeNaoCadastrado)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: "4px" } }, "Profissional"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "0.95rem", color: "var(--text-dark)", fontWeight: 500 } }, prof ? prof.nome : "N\xE3o informado")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: "4px" } }, "Servi\xE7o"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "0.95rem", color: "var(--text-dark)", fontWeight: 500 } }, agendamento.servico)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: "4px" } }, "Data / Hora"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "0.95rem", color: "var(--text-dark)", fontWeight: 500 } }, agendamento.data.split("-").reverse().join("/"), " \xE0s ", agendamento.hora))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.9rem", fontWeight: 600, color: "var(--text-dark)", marginBottom: "8px" } }, "Evolu\xE7\xE3o do Dia (Opcional)"), /* @__PURE__ */ React.createElement(
      "textarea",
      {
        rows: 6,
        placeholder: "Descreva aqui o que foi realizado no atendimento, evolu\xE7\xE3o do paciente, etc...",
        value: evolucaoData.descricao,
        onChange: (e) => setEvolucaoData({ ...evolucaoData, descricao: e.target.value }),
        style: { width: "100%", padding: "12px", border: "1px solid var(--border-color)", borderRadius: "8px", outline: "none", color: "var(--text-main)", fontSize: "0.95rem", resize: "vertical" }
      }
    )));
  })()), /* @__PURE__ */ React.createElement("div", { style: { padding: "16px 24px", borderTop: "1px solid var(--border-color)", display: "flex", justifyContent: "flex-end", gap: "12px", background: "#f8fafc" } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setEvolucaoModalOpen(false),
      style: { background: "transparent", color: "#64748b", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "10px 16px", fontWeight: 600, cursor: "pointer" }
    },
    "Cancelar"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        handlePresenca(evolucaoData.idAgendamento, "presente");
        setEvolucaoModalOpen(false);
      },
      style: { background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "10px 16px", fontWeight: 600, cursor: "pointer" }
    },
    "Apenas Confirmar Presen\xE7a"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handleSalvarEvolucaoEPresenca,
      style: { background: "#1d4ed8", color: "white", border: "none", borderRadius: "8px", padding: "10px 24px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }
    },
    /* @__PURE__ */ React.createElement(Save, { size: 18 }),
    " ",
    evolucaoData.descricao.trim() !== "" ? "Salvar Evolu\xE7\xE3o e Presen\xE7a" : "Confirmar Presen\xE7a"
  )))), slotActionMenu && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { onClick: () => setSlotActionMenu(null), style: { position: "fixed", inset: 0, zIndex: 998 } }), /* @__PURE__ */ React.createElement("div", { style: { position: "fixed", top: slotActionMenu.y, left: slotActionMenu.x, background: "white", borderRadius: "8px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0", padding: "8px", zIndex: 999, display: "flex", flexDirection: "column", gap: "4px", minWidth: "180px" } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setNewAgendamento({ ...newAgendamento, data: slotActionMenu.data, hora: slotActionMenu.hora });
        setSlotActionMenu(null);
        setAgendamentoModalOpen(true);
      },
      style: { padding: "10px 12px", background: "transparent", border: "none", textAlign: "left", cursor: "pointer", borderRadius: "6px", fontSize: "0.9rem", color: "#334155", fontWeight: 500 },
      onMouseEnter: (e) => e.currentTarget.style.background = "#f8fafc",
      onMouseLeave: (e) => e.currentTarget.style.background = "transparent"
    },
    "\u{1F464} Novo Agendamento"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setBlockData({ tipo: "especifica", data: slotActionMenu.data, horaInicio: slotActionMenu.hora, horaFim: slotActionMenu.hora, diasSemana: { 0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false }, dataFimRecorrencia: "", descricao: "" });
        setSlotActionMenu(null);
        setBlockModalOpen(true);
      },
      style: { padding: "10px 12px", background: "transparent", border: "none", textAlign: "left", cursor: "pointer", borderRadius: "6px", fontSize: "0.9rem", color: "#ef4444", fontWeight: 500 },
      onMouseEnter: (e) => e.currentTarget.style.background = "#fef2f2",
      onMouseLeave: (e) => e.currentTarget.style.background = "transparent"
    },
    "\u{1F512} Bloquear Hor\xE1rio"
  ))), blockModalOpen && /* @__PURE__ */ React.createElement("div", { style: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1e3 } }, /* @__PURE__ */ React.createElement("div", { style: { background: "white", width: "500px", borderRadius: "12px", padding: "24px", display: "flex", flexDirection: "column", gap: "16px", maxHeight: "90vh", overflowY: "auto" } }, /* @__PURE__ */ React.createElement("h2", { style: { margin: 0, fontSize: "1.25rem", color: "#1e293b" } }, "Bloquear Hor\xE1rio"), /* @__PURE__ */ React.createElement("p", { style: { margin: 0, fontSize: "0.9rem", color: "#64748b" } }, "Configure os detalhes do bloqueio."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "12px", marginBottom: "8px" } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setBlockData({ ...blockData, tipo: "especifica" }),
      style: { flex: 1, padding: "10px", background: blockData.tipo === "especifica" ? "#f0fdf4" : "white", border: blockData.tipo === "especifica" ? "1px solid #22c55e" : "1px solid #cbd5e1", color: blockData.tipo === "especifica" ? "#15803d" : "#64748b", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }
    },
    "Data Espec\xEDfica"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setBlockData({ ...blockData, tipo: "semanal" }),
      style: { flex: 1, padding: "10px", background: blockData.tipo === "semanal" ? "#f0fdf4" : "white", border: blockData.tipo === "semanal" ? "1px solid #22c55e" : "1px solid #cbd5e1", color: blockData.tipo === "semanal" ? "#15803d" : "#64748b", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }
    },
    "Dias da Semana"
  )), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "12px" } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-dark)", marginBottom: "8px" } }, blockData.tipo === "semanal" ? "A partir de" : "Data"), /* @__PURE__ */ React.createElement("input", { type: "date", value: blockData.data, onChange: (e) => setBlockData({ ...blockData, data: e.target.value }), style: { width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px", outline: "none" } })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-dark)", marginBottom: "8px" } }, "Hora Inicial"), /* @__PURE__ */ React.createElement("input", { type: "time", value: blockData.horaInicio, onChange: (e) => setBlockData({ ...blockData, horaInicio: e.target.value }), style: { width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px", outline: "none" } })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-dark)", marginBottom: "8px" } }, "Hora Final"), /* @__PURE__ */ React.createElement("input", { type: "time", value: blockData.horaFim, onChange: (e) => setBlockData({ ...blockData, horaFim: e.target.value }), style: { width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px", outline: "none" } }))), blockData.tipo === "semanal" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-dark)", marginBottom: "8px" } }, "Quais dias da semana?"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "8px", flexWrap: "wrap" } }, ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "S\xE1b"].map((dia, idx) => /* @__PURE__ */ React.createElement("label", { key: idx, style: { display: "flex", alignItems: "center", gap: "4px", fontSize: "0.85rem", color: "#334155", cursor: "pointer", background: blockData.diasSemana[idx] ? "#e0f2fe" : "#f8fafc", padding: "6px 10px", borderRadius: "16px", border: blockData.diasSemana[idx] ? "1px solid #7dd3fc" : "1px solid #e2e8f0" } }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: blockData.diasSemana[idx], onChange: (e) => setBlockData({ ...blockData, diasSemana: { ...blockData.diasSemana, [idx]: e.target.checked } }), style: { display: "none" } }), dia)))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-dark)", marginBottom: "8px" } }, "At\xE9 quando? (Opcional, m\xE1x 5 anos)"), /* @__PURE__ */ React.createElement("input", { type: "date", value: blockData.dataFimRecorrencia, onChange: (e) => setBlockData({ ...blockData, dataFimRecorrencia: e.target.value }), style: { width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px", outline: "none" } }))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-dark)", marginBottom: "8px" } }, "Motivo (Opcional)"), /* @__PURE__ */ React.createElement("input", { type: "text", value: blockData.descricao, onChange: (e) => setBlockData({ ...blockData, descricao: e.target.value }), placeholder: "Ex: Reuni\xE3o, Forma\xE7\xE3o, Consulta", style: { width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px", outline: "none" } })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "16px" } }, /* @__PURE__ */ React.createElement("button", { onClick: () => setBlockModalOpen(false), style: { padding: "10px 16px", background: "transparent", border: "1px solid #cbd5e1", borderRadius: "8px", color: "#64748b", cursor: "pointer", fontWeight: 600 } }, "Cancelar"), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        const novosAgendamentos = [];
        let startD = /* @__PURE__ */ new Date(blockData.data + "T00:00:00");
        let limitD = blockData.dataFimRecorrencia ? /* @__PURE__ */ new Date(blockData.dataFimRecorrencia + "T23:59:59") : new Date(startD);
        if (blockData.tipo === "semanal" && !blockData.dataFimRecorrencia) {
          limitD = new Date(startD.getTime() + 5 * 365 * 24 * 60 * 60 * 1e3);
        }
        const hIn = parseInt(blockData.horaInicio.split(":")[0], 10);
        const mIn = parseInt(blockData.horaInicio.split(":")[1], 10);
        const hOut = blockData.horaFim ? parseInt(blockData.horaFim.split(":")[0], 10) : hIn;
        const mOut = blockData.horaFim ? parseInt(blockData.horaFim.split(":")[1], 10) : mIn;
        const startMins = hIn * 60 + mIn;
        const outMins = hOut * 60 + mOut;
        const endMins = startMins === outMins ? startMins : outMins - 1;
        let current = new Date(startD);
        let loops = 0;
        while (current <= limitD && loops < 2e3) {
          const currentDayOfWeek = current.getDay();
          if (blockData.tipo === "especifica" || blockData.diasSemana[currentDayOfWeek]) {
            novosAgendamentos.push({
              data: current.toISOString().split("T")[0],
              hora: blockData.horaInicio,
              horaFim: blockData.horaFim,
              isBlock: true,
              descricao: `${blockData.descricao || "Bloqueado"} (${blockData.horaInicio} \xE0s ${blockData.horaFim})`,
              status: "agendado"
            });
          }
          if (blockData.tipo === "semanal") {
            current.setDate(current.getDate() + 1);
          } else {
            break;
          }
          loops++;
        }
        if (novosAgendamentos.length > 0) {
          setAgendamentos((prev) => [...prev, ...novosAgendamentos]);
        }
        setBlockModalOpen(false);
      },
      style: { padding: "10px 16px", background: "#ef4444", border: "none", borderRadius: "8px", color: "white", cursor: "pointer", fontWeight: 600 }
    },
    "Bloquear"
  )))));
}
export {
  Agenda as default
};
