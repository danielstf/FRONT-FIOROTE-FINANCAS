import {
  BadgeCheck,
  Crown,
  KeyRound,
  Loader2,
  LogOut,
  PencilLine,
  Plus,
  Save,
  ShieldCheck,
  Sparkles,
  SunMoon,
  Trash2,
  UserRound,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { authApi } from "../../api/auth/auth-api";
import { getApiErrorMessage } from "../../api/errors";
import { perfisApi } from "../../api/perfis/perfis-api";
import type { PerfilFinanceiro } from "../../api/perfis/types";
import { ThemeToggle } from "../../components/theme-toggle";
import {
  Avatar,
  avatarOptions,
  getAvatarOption,
} from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useAuth } from "../../providers/auth-provider";

export function ConfiguracoesPage() {
  const {
    session,
    atualizarPerfil,
    atualizarUsuarioSessao,
    perfilFinanceiroId,
    selecionarPerfilFinanceiro,
    logout,
  } = useAuth();
  const usuarioTemSenha = session?.usuario.temSenha ?? true;
  const isPremium = session?.usuario.plano === "PREMIUM";
  const [nome, setNome] = useState(session?.usuario.nome ?? "");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [perfis, setPerfis] = useState<PerfilFinanceiro[]>([]);
  const [perfilEditando, setPerfilEditando] = useState<PerfilFinanceiro | null>(
    null,
  );
  const [perfilNome, setPerfilNome] = useState("");
  const [perfilAvatar, setPerfilAvatar] = useState("user");
  const [senhaModalAberto, setSenhaModalAberto] = useState(false);
  const [perfilModalAberto, setPerfilModalAberto] = useState(false);
  const [perfilExcluindo, setPerfilExcluindo] =
    useState<PerfilFinanceiro | null>(null);
  const [loadingPerfis, setLoadingPerfis] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingPerfil, setSavingPerfil] = useState(false);
  const [deletingPerfil, setDeletingPerfil] = useState(false);

  async function carregarPerfis() {
    if (!isPremium) return;

    setLoadingPerfis(true);
    try {
      const data = await perfisApi.listar();
      setPerfis(data.perfis);
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError));
    } finally {
      setLoadingPerfis(false);
    }
  }

  useEffect(() => {
    void carregarPerfis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPremium]);

  async function salvarDados(event: FormEvent<HTMLFormElement>) {
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
        senhaAtual: usuarioTemSenha
          ? senhaAtual.trim() || undefined
          : undefined,
        novaSenha,
      });

      if (response.usuario) atualizarUsuarioSessao(response.usuario);
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
      setSenhaModalAberto(false);
      toast.success("Senha alterada com sucesso.");
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError));
    } finally {
      setSavingPassword(false);
    }
  }

  function limparPerfil() {
    setPerfilEditando(null);
    setPerfilNome("");
    setPerfilAvatar("user");
  }

  function abrirNovoPerfil() {
    limparPerfil();
    setPerfilModalAberto(true);
  }

  function editarPerfil(perfil: PerfilFinanceiro) {
    setPerfilEditando(perfil);
    setPerfilNome(perfil.nome);
    setPerfilAvatar(perfil.avatar);
    setPerfilModalAberto(true);
  }

  async function salvarPerfilFinanceiro(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isPremium) {
      toast.error("Perfis financeiros são exclusivos para usuários Premium.");
      return;
    }

    setSavingPerfil(true);
    try {
      if (perfilEditando) {
        await perfisApi.editar(perfilEditando.id, {
          nome: perfilNome,
          avatar: perfilAvatar,
        });
        toast.success("Perfil atualizado com sucesso.");
      } else {
        await perfisApi.criar({ nome: perfilNome, avatar: perfilAvatar });
        toast.success("Perfil criado com sucesso.");
      }

      limparPerfil();
      setPerfilModalAberto(false);
      await carregarPerfis();
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError));
    } finally {
      setSavingPerfil(false);
    }
  }

  async function excluirPerfil() {
    if (!perfilExcluindo) return;

    setDeletingPerfil(true);
    try {
      await perfisApi.excluir(perfilExcluindo.id);
      if (perfilFinanceiroId === perfilExcluindo.id)
        selecionarPerfilFinanceiro(null);
      if (perfilEditando?.id === perfilExcluindo.id) limparPerfil();
      setPerfilExcluindo(null);
      toast.success("Perfil excluído com sucesso.");
      await carregarPerfis();
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError));
    } finally {
      setDeletingPerfil(false);
    }
  }

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="grid gap-6 p-5 lg:grid-cols-[1fr_360px] lg:p-7">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-md border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Conta e perfis
            </div>
            <h1 className="text-2xl font-semibold tracking-normal lg:text-3xl">
              Configurações da conta
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Atualize seus dados, ajuste o tema e organize perfis financeiros.
            </p>
            <div className="grid gap-3 pt-2 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-xs text-muted-foreground">Plano</p>
                <p className="mt-1 font-semibold text-primary">
                  {session?.usuario.plano ?? "FREE"}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-xs text-muted-foreground">Senha</p>
                <p className="mt-1 font-semibold">
                  {usuarioTemSenha ? "Ativa" : "Pendente"}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-xs text-muted-foreground">Perfis</p>
                <p className="mt-1 font-semibold">{perfis.length + 1}</p>
              </div>
            </div>
          </div>
          <Card className="self-start border-primary/20 bg-background/80 shadow-sm">
            <CardContent className="flex items-center gap-3 p-5">
              <span className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold">
                  {session?.usuario.nome}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {session?.usuario.email}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="h-5 w-5 text-primary" />
              Dados do usuário
            </CardTitle>
            <CardDescription>Altere o nome exibido no sistema.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={salvarDados}>
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
              <Button
                className="w-full sm:w-fit"
                type="submit"
                disabled={savingProfile}
              >
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
            <CardTitle className="flex items-center gap-2">
              {usuarioTemSenha ? (
                <KeyRound className="h-5 w-5 text-primary" />
              ) : (
                <BadgeCheck className="h-5 w-5 text-primary" />
              )}
              Segurança e tema
            </CardTitle>
            <CardDescription>
              A senha fica escondida até você abrir a alteração.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  {usuarioTemSenha ? (
                    <KeyRound className="h-5 w-5" />
                  ) : (
                    <BadgeCheck className="h-5 w-5" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold">
                    {usuarioTemSenha ? "Senha cadastrada" : "Senha pendente"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Atualize sua senha em uma janela segura.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setSenhaModalAberto(true)}
              >
                {usuarioTemSenha ? "Trocar" : "Cadastrar"}
              </Button>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <SunMoon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold">Tema do sistema</p>
                  <p className="text-xs text-muted-foreground">
                    Alterne entre claro e escuro.
                  </p>
                </div>
              </div>
              <ThemeToggle />
            </div>
            <div className="flex items-center justify-between gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-destructive/10 text-destructive">
                  <LogOut className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-destructive">
                    Sair da conta
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Encerre sua sessão neste dispositivo.
                  </p>
                </div>
              </div>
              <Button variant="destructive" onClick={logout}>
                Sair
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Perfis financeiros
              </CardTitle>
              <CardDescription>
                Usuários Premium podem criar até 5 perfis com dados separados.
              </CardDescription>
            </div>
            <Button onClick={abrirNovoPerfil} disabled={!isPremium}>
              <Plus className="h-4 w-4" />
              Novo perfil
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!isPremium && (
            <p className="mb-4 rounded-md border border-primary/25 bg-primary/10 px-3 py-2 text-sm text-primary">
              Assine o Premium para criar perfis financeiros.
            </p>
          )}

          <div className="grid content-start gap-3">
            {loadingPerfis && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando perfis...
              </div>
            )}
            {!loadingPerfis && perfis.length === 0 && (
              <div className="rounded-lg border border-dashed border-border bg-muted/35 p-6 text-center text-sm text-muted-foreground">
                Nenhum perfil financeiro cadastrado.
              </div>
            )}
            {perfis.map((perfil) => (
              <div
                className="flex flex-col gap-3 rounded-lg border border-border bg-background p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                key={perfil.id}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar value={perfil.avatar} label={perfil.nome} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{perfil.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      Avatar {getAvatarOption(perfil.avatar).label}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    aria-label="Editar perfil"
                    className="h-9 w-9 px-0"
                    title="Editar perfil"
                    variant="outline"
                    onClick={() => editarPerfil(perfil)}
                  >
                    <PencilLine className="h-4 w-4" />
                  </Button>
                  <Button
                    aria-label="Excluir perfil"
                    className="h-9 w-9 px-0 text-destructive hover:text-destructive"
                    title="Excluir perfil"
                    variant="outline"
                    onClick={() => setPerfilExcluindo(perfil)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={senhaModalAberto} onOpenChange={setSenhaModalAberto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {usuarioTemSenha ? "Trocar senha" : "Cadastrar senha"}
            </DialogTitle>
            <DialogDescription>
              Confirme os dados para atualizar o acesso da conta.
            </DialogDescription>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={salvarSenha}>
            {usuarioTemSenha && (
              <div className="space-y-2">
                <Label htmlFor="senhaAtual">Senha atual</Label>
                <Input
                  id="senhaAtual"
                  type="password"
                  value={senhaAtual}
                  onChange={(event) => setSenhaAtual(event.target.value)}
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
                required
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSenhaModalAberto(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={savingPassword}>
                {savingPassword ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Confirmar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={perfilModalAberto}
        onOpenChange={(open) => {
          setPerfilModalAberto(open);
          if (!open) limparPerfil();
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {perfilEditando ? "Editar perfil" : "Novo perfil"}
            </DialogTitle>
            <DialogDescription>
              Defina o nome e o ícone usado para identificar o perfil
              financeiro.
            </DialogDescription>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={salvarPerfilFinanceiro}>
            <div className="space-y-2">
              <Label htmlFor="perfil-nome">Nome do perfil</Label>
              <Input
                id="perfil-nome"
                value={perfilNome}
                onChange={(event) => setPerfilNome(event.target.value)}
                placeholder="Ex: Pessoal, Família, Empresa"
                disabled={!isPremium}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Avatar</Label>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                {avatarOptions.map((avatar) => {
                  const Icon = avatar.icon;
                  const selected = perfilAvatar === avatar.value;

                  return (
                    <button
                      aria-label={avatar.label}
                      className={`flex h-11 items-center justify-center rounded-full border transition-colors ${
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground hover:bg-accent"
                      }`}
                      disabled={!isPremium}
                      key={avatar.value}
                      title={avatar.label}
                      type="button"
                      onClick={() => setPerfilAvatar(avatar.value)}
                    >
                      <Icon className="h-5 w-5" />
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPerfilModalAberto(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={!isPremium || savingPerfil}>
                {savingPerfil ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {perfilEditando ? "Salvar perfil" : "Criar perfil"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(perfilExcluindo)}
        onOpenChange={(open) => {
          if (!open) setPerfilExcluindo(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir perfil</DialogTitle>
            <DialogDescription>
              Confirme para remover este perfil financeiro e seus dados
              vinculados.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/35 p-4">
            <Avatar
              value={perfilExcluindo?.avatar}
              label={perfilExcluindo?.nome ?? ""}
            />
            <div className="min-w-0">
              <p className="truncate font-semibold">{perfilExcluindo?.nome}</p>
              <p className="text-xs text-muted-foreground">
                Esta ação não pode ser desfeita.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPerfilExcluindo(null)}
            >
              Cancelar
            </Button>
            <Button
              className="bg-destructive text-white hover:bg-destructive/90"
              type="button"
              onClick={excluirPerfil}
              disabled={deletingPerfil}
            >
              {deletingPerfil && <Loader2 className="h-4 w-4 animate-spin" />}
              Excluir perfil
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
