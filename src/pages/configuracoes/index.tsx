import { useState, type FormEvent } from "react";
import {
  BadgeCheck,
  KeyRound,
  Loader2,
  Mail,
  Save,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
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
      toast.error("A confirmaÃ§Ã£o da senha nÃ£o confere.");
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
    <div className="space-y-5">
      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:p-7">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-md border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Conta e seguranÃ§a
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-normal text-card-foreground lg:text-4xl">
                ConfiguraÃ§Ãµes da conta
              </h1>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Mantenha seus dados atualizados e defina uma senha para acessar o
                sistema com mais flexibilidade.
              </p>
            </div>
          </div>

          <Card className="self-start border-primary/20 bg-background/80 shadow-sm">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">Perfil atual</p>
                  <p className="mt-1 truncate text-xl font-semibold">
                    {session?.usuario.nome}
                  </p>
                </div>
              </div>
              <div className="grid gap-2 text-sm">
                <div className="flex items-center gap-2 rounded-md border border-border p-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="min-w-0 truncate">{session?.usuario.email}</span>
                </div>
                <div className="flex items-center justify-between rounded-md border border-border p-3">
                  <span className="text-muted-foreground">Senha</span>
                  <strong
                    className={usuarioTemSenha ? "text-emerald-600" : "text-amber-600"}
                  >
                    {usuarioTemSenha ? "Cadastrada" : "Pendente"}
                  </strong>
                </div>
              </div>
            </CardContent>
          </Card>
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
                <CardTitle>Dados do usuÃ¡rio</CardTitle>
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
                {usuarioTemSenha ? (
                  <KeyRound className="h-5 w-5" />
                ) : (
                  <BadgeCheck className="h-5 w-5" />
                )}
              </span>
              <div>
                <CardTitle>
                  {usuarioTemSenha ? "Trocar senha" : "Cadastrar senha"}
                </CardTitle>
                <CardDescription>
                  {usuarioTemSenha
                    ? "Informe a senha atual e escolha uma nova senha."
                    : "Sua conta ainda nÃ£o tem senha cadastrada. Crie uma senha para entrar tambÃ©m com email e senha."}
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


