import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./layouts/app-layout";
import { AuthLayout } from "./layouts/auth-layout";
import { CadastroPage } from "./pages/auth/cadastro";
import { EsqueciSenhaPage } from "./pages/auth/esqueci-senha";
import { LoginPage } from "./pages/auth/login";
import { RedefinirSenhaPage } from "./pages/auth/redefinir-senha";
import { CartoesPage } from "./pages/cartoes";
import { ConfiguracoesPage } from "./pages/configuracoes";
import { DashboardPage } from "./pages/dashboard";
import { CadastroDespesaPage } from "./pages/despesas/cadastro";
import { DespesasPage } from "./pages/despesas";
import { EditarDespesaPage } from "./pages/despesas/editar";
import { LandingPage } from "./pages/landing";
import { PremiumPage } from "./pages/premium";
import { PremiumRetornoPage } from "./pages/premium/retorno";
import { CadastroReceitaPage } from "./pages/receitas/cadastro";
import { EditarReceitaPage } from "./pages/receitas/editar";
import { ReceitasPage } from "./pages/receitas";
import { RelatoriosPage } from "./pages/relatorios";
import { RequireAuth } from "./routes/require-auth";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<CadastroPage />} />
        <Route path="/esqueci-senha" element={<EsqueciSenhaPage />} />
        <Route path="/redefinir-senha" element={<RedefinirSenhaPage />} />
      </Route>

      <Route path="/premium/:status" element={<PremiumRetornoPage />} />

      <Route
        path="/app"
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="receitas" element={<ReceitasPage />} />
        <Route path="receitas/cadastro" element={<CadastroReceitaPage />} />
        <Route path="receitas/:receitaId/editar" element={<EditarReceitaPage />} />
        <Route path="despesas" element={<DespesasPage />} />
        <Route path="despesas/cadastro" element={<CadastroDespesaPage />} />
        <Route path="despesas/:despesaId/editar" element={<EditarDespesaPage />} />
        <Route path="cartoes" element={<CartoesPage />} />
        <Route path="relatorios" element={<RelatoriosPage />} />
        <Route path="premium" element={<PremiumPage />} />
        <Route path="configuracoes" element={<ConfiguracoesPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
