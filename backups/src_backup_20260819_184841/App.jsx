import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CompanyProvider } from './context/CompanyContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import CadastroConta from './pages/CadastroConta';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Agenda from './pages/Agenda';
import Pacientes from './pages/Pacientes';
import Evolucoes from './pages/Evolucoes';
import Matriculas from './pages/Matriculas';
import DashboardPagamentos from './pages/DashboardPagamentos';
import Recebimentos from './pages/Recebimentos';
import ControleDespesas from './pages/ControleDespesas';
import FechamentoComissao from './pages/FechamentoComissao';
import BalancoFinanceiro from './pages/BalancoFinanceiro';
import RelatorioAulas from './pages/RelatorioAulas';
import AlunosExperimentais from './pages/AlunosExperimentais';
import RelatorioMatriculas from './pages/RelatorioMatriculas';
import RelatorioComissoes from './pages/RelatorioComissoes';
import Perfil from './pages/Perfil';
import Empresa from './pages/Empresa';
import PacientePerfil from './pages/PacientePerfil';

// Módulo Cadastro
import Servicos from './pages/Servicos';
import Planos from './pages/Planos';
import Profissionais from './pages/Profissionais';
import Cargos from './pages/Cargos';
import Feriados from './pages/Feriados';
import Grupos from './pages/Grupos';

import { AppDataProvider } from './context/AppDataContext';

function App() {
  return (
    <AuthProvider>
      <CompanyProvider>
        <AppDataProvider>
          <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<CadastroConta />} />
            
            {/* Rotas Protegidas */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="pacientes" element={<Pacientes />} />
          <Route path="paciente/perfil/:id" element={<PacientePerfil />} />
          
          <Route path="servicos" element={<Servicos />} />
          <Route path="planos" element={<Planos />} />
          <Route path="profissionais" element={<Profissionais />} />
          <Route path="cargos" element={<Cargos />} />
          <Route path="feriados" element={<Feriados />} />
          <Route path="grupos" element={<Grupos />} />

          <Route path="evolucoes" element={<Evolucoes />} />
          <Route path="matriculas" element={<Matriculas />} />
          
          <Route path="dashboard-pagamentos" element={<DashboardPagamentos />} />
          <Route path="recebimentos" element={<Recebimentos />} />
          <Route path="controle-despesas" element={<ControleDespesas />} />
          <Route path="fechamento-comissao" element={<FechamentoComissao />} />
          <Route path="balanco-financeiro" element={<BalancoFinanceiro />} />

          <Route path="relatorio-aulas" element={<RelatorioAulas />} />
          <Route path="alunos-experimentais" element={<AlunosExperimentais />} />
          <Route path="relatorio-matriculas" element={<RelatorioMatriculas />} />
          <Route path="relatorio-comissoes" element={<RelatorioComissoes />} />
          <Route path="perfil" element={<Perfil />} />
          <Route path="empresa" element={<Empresa />} />
        </Route>
            </Route>
          </Routes>
          </BrowserRouter>
        </AppDataProvider>
      </CompanyProvider>
    </AuthProvider>
  );
}

export default App;
