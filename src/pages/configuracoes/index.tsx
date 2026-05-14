import { useState, type FormEvent } from "react";
import { KeyRound, Loader2, Save, Settings, UserRound } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "../../api/auth/auth-api";
import { getApiErrorMessage } from "../../api/errors";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useAuth } from "../../providers/auth-provider";

export function ConfiguracoesPage() {
  const { session, atualizarPerfil, atualizarUsuarioSessao } = useAuth();
  const usuarioTemSenha = session?.usuario.temSenha ?? true;
  const [nome, setNome] = useState(session?.usuario.nome ?? "");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  async function salvarPerfil(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingProfile(true);

    try {
      await atualizarPerfil({ nome });
      toast.success("Nome atualizado com sucesso.");
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError));
    } finally {
      setSavingProfile(false);
    }
  }

  async function salvarSenha(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (novaSenha !== confirmarSenha) {
      toast.error("A confirmação da senha não confere.");
      return;
    }

    setSavingPassword(true);

    try {
      const response = await authApi.trocarSenha({
        senhaAtual: usuarioTemSenha ? senhaAtual.trim() || undefined : undefined,
        novaSenha,
      });

      if (response.usuario) {
        atualizarUsuarioSessao(response.usuario);
      } else if (session) {
        atualizarUsuarioSessao({
          ...session.usuario,
          temSenha: true,
        });
      }

      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
      toast.success("Senha alterada com sucesso.");
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError));
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-border bg-card p-5 shadow-sm lg:p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Settings className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-3xl font-semibold tracking-normal text-card-foreground">
              Configurações
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Atualize seus dados de acesso e preferências da conta.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <UserRound className="h-5 w-5" />
              </span>
              <div>
                <CardTitle>Dados do usuário</CardTitle>
                <CardDescription>Altere o nome exibido no sistema.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={salvarPerfil}>
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={session?.usuario.email ?? ""} disabled />
              </div>

              <Button className="w-full sm:w-fit" type="submit" disabled={savingProfile}>
                {savingProfile ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Salvar nome
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <KeyRound className="h-5 w-5" />
              </span>
              <div>
                <CardTitle>
                  {usuarioTemSenha ? "Trocar senha" : "Cadastrar senha"}
                </CardTitle>
                <CardDescription>
                  {usuarioTemSenha
                    ? "Informe a senha atual e escolha uma nova senha."
                    : "Sua conta ainda não tem senha cadastrada. Crie uma senha para entrar também com email e senha."}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={salvarSenha}>
              {usuarioTemSenha && (
                <div className="space-y-2">
                  <Label htmlFor="senhaAtual">Senha atual</Label>
                  <Input
                    id="senhaAtual"
                    type="password"
                    value={senhaAtual}
                    onChange={(event) => setSenhaAtual(event.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="novaSenha">Nova senha</Label>
                <Input
                  id="novaSenha"
                  minLength={6}
                  type="password"
                  value={novaSenha}
                  onChange={(event) => setNovaSenha(event.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmarSenha">Confirmar nova senha</Label>
                <Input
                  id="confirmarSenha"
                  minLength={6}
                  type="password"
                  value={confirmarSenha}
                  onChange={(event) => setConfirmarSenha(event.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>

              <Button className="w-full sm:w-fit" type="submit" disabled={savingPassword}>
                {savingPassword ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {usuarioTemSenha ? "Alterar senha" : "Cadastrar senha"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
