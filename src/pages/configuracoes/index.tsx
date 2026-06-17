import {
  BadgeCheck,
  Crown,
  KeyRound,
  Loader2,
  PencilLine,
  Plus,
  Save,
  Settings,
  SunMoon,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { motion } from "motion/react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { pageVariants, sectionVariants } from "../../lib/motion";
import { cn } from "../../lib/utils";
import { useAuth } from "../../providers/auth-provider";

export function ConfiguracoesPage() {
  const {
    session,
    atualizarPerfil,
    atualizarUsuarioSessao,
    perfilFinanceiroId,
    selecionarPerfilFinanceiro,
  } = useAuth();

  const usuarioTemSenha = session?.usuario.temSenha ?? true;
  const isPremium = session?.usuario.plano === "PREMIUM";

  const [nome, setNome] = useState(session?.usuario.nome ?? "");
  const [editandoNome, setEditandoNome] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [perfis, setPerfis] = useState<PerfilFinanceiro[]>([]);
  const [perfilEditando, setPerfilEditando] = useState<PerfilFinanceiro | null>(null);
  const [perfilNome, setPerfilNome] = useState("");
  const [perfilAvatar, setPerfilAvatar] = useState("user");
  const [senhaModalAberto, setSenhaModalAberto] = useState(false);
  const [perfilModalAberto, setPerfilModalAberto] = useState(false);
  const [perfilExcluindo, setPerfilExcluindo] = useState<PerfilFinanceiro | null>(null);
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
    } catch (err) {
      toast.error(getApiErrorMessage(err));
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
      setEditandoNome(false);
      toast.success("Nome atualizado com sucesso.");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
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
      if (response.usuario) atualizarUsuarioSessao(response.usuario);
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
      setSenhaModalAberto(false);
      toast.success("Senha alterada com sucesso.");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
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
      toast.error("Perfis financeiros são exclusivos para usuários VIP.");
      return;
    }
    setSavingPerfil(true);
    try {
      if (perfilEditando) {
        await perfisApi.editar(perfilEditando.id, { nome: perfilNome, avatar: perfilAvatar });
        toast.success("Perfil atualizado com sucesso.");
      } else {
        await perfisApi.criar({ nome: perfilNome, avatar: perfilAvatar });
        toast.success("Perfil criado com sucesso.");
      }
      limparPerfil();
      setPerfilModalAberto(false);
      await carregarPerfis();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSavingPerfil(false);
    }
  }

  async function excluirPerfil() {
    if (!perfilExcluindo) return;
    setDeletingPerfil(true);
    try {
      await perfisApi.excluir(perfilExcluindo.id);
      if (perfilFinanceiroId === perfilExcluindo.id) selecionarPerfilFinanceiro(null);
      if (perfilEditando?.id === perfilExcluindo.id) limparPerfil();
      setPerfilExcluindo(null);
      toast.success("Perfil excluído com sucesso.");
      await carregarPerfis();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setDeletingPerfil(false);
    }
  }

  const iniciais = (session?.usuario.nome ?? "U")
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-3xl space-y-5"
    >
      {/* ── Page title ── */}
      <motion.div variants={sectionVariants}>
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-500/10">
            <Settings className="h-4 w-4 text-slate-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-tight">Configurações</h1>
            <p className="text-xs text-muted-foreground">Gerencie sua conta e preferências</p>
          </div>
        </div>
      </motion.div>

      {/* ── Profile card ── */}
      <motion.div variants={sectionVariants}>
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          {/* Gradient accent */}
          <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/6 via-transparent to-transparent" />

          <div className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
            {/* Avatar */}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-linear-to-br from-primary/25 to-primary/8 shadow-inner">
              <span className="text-2xl font-bold text-primary">{iniciais}</span>
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              {editandoNome ? (
                <form onSubmit={salvarDados} className="flex items-center gap-2">
                  <Input
                    autoFocus
                    className="h-9 max-w-xs text-base font-semibold"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                  />
                  <Button type="submit" disabled={savingProfile} className="h-9 gap-1.5 px-3 text-sm">
                    {savingProfile ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    Salvar
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-9 w-9 p-0"
                    onClick={() => { setEditandoNome(false); setNome(session?.usuario.nome ?? ""); }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </form>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-xl font-semibold leading-tight">
                    {session?.usuario.nome}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setEditandoNome(true)}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground/50 transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="Editar nome"
                  >
                    <PencilLine className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              <p className="mt-0.5 text-sm text-muted-foreground">{session?.usuario.email}</p>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                {isPremium ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/12 px-2.5 py-0.5 text-xs font-semibold text-amber-500">
                    <Crown className="h-3 w-3" />
                    VIP Premium
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    <UserRound className="h-3 w-3" />
                    Plano Free
                  </span>
                )}
                {!usuarioTemSenha && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/30 bg-blue-400/10 px-2.5 py-0.5 text-xs font-medium text-blue-500">
                    <BadgeCheck className="h-3 w-3" />
                    Login Google
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Segurança + Preferências ── */}
      <motion.div variants={sectionVariants} className="grid gap-4 sm:grid-cols-2">
        {/* Segurança */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-border px-5 py-3.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/10">
              <KeyRound className="h-3.5 w-3.5 text-blue-500" />
            </div>
            <p className="text-sm font-semibold">Segurança</p>
          </div>

          <div className="divide-y divide-border/50">
            <SettingRow
              icon={<KeyRound className="h-4 w-4 text-blue-400" />}
              iconBg="bg-blue-500/10"
              label={usuarioTemSenha ? "Senha cadastrada" : "Definir senha"}
              description={usuarioTemSenha ? "Última senha definida pelo usuário" : "Conta sem senha — crie uma agora"}
              action={
                <Button variant="outline" className="h-8 text-xs" onClick={() => setSenhaModalAberto(true)}>
                  {usuarioTemSenha ? "Alterar" : "Cadastrar"}
                </Button>
              }
            />
          </div>
        </div>

        {/* Preferências */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-border px-5 py-3.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/10">
              <SunMoon className="h-3.5 w-3.5 text-amber-500" />
            </div>
            <p className="text-sm font-semibold">Preferências</p>
          </div>

          <div className="divide-y divide-border/50">
            <SettingRow
              icon={<SunMoon className="h-4 w-4 text-amber-400" />}
              iconBg="bg-amber-500/10"
              label="Tema do sistema"
              description="Alterne entre modo claro e escuro"
              action={<ThemeToggle />}
            />
          </div>
        </div>
      </motion.div>

      {/* ── Perfis VIP ── */}
      <motion.div variants={sectionVariants}>
        <div className="overflow-hidden rounded-2xl border border-amber-400/25 bg-card shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-border bg-linear-to-r from-amber-400/8 to-transparent px-5 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400/15">
                <Crown className="h-3.5 w-3.5 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-semibold">Perfis financeiros</p>
                <p className="text-xs text-muted-foreground">
                  {isPremium ? `${perfis.length} perfil${perfis.length !== 1 ? "s" : ""} criado${perfis.length !== 1 ? "s" : ""}` : "Exclusivo para usuários VIP"}
                </p>
              </div>
            </div>
            <Button
              onClick={abrirNovoPerfil}
              disabled={!isPremium}
              className="h-8 gap-1.5 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Novo perfil
            </Button>
          </div>

          <div className="p-4">
            {/* Free user lock */}
            {!isPremium && (
              <div className="flex items-start gap-3 rounded-xl border border-amber-400/20 bg-amber-400/6 p-4">
                <Crown className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <div>
                  <p className="text-sm font-semibold text-amber-500">Recurso exclusivo VIP</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Separe suas finanças em múltiplos perfis — pessoal, família ou empresa. Disponível no plano VIP.
                  </p>
                </div>
              </div>
            )}

            {/* Loading */}
            {loadingPerfis && (
              <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando perfis...
              </div>
            )}

            {/* Empty */}
            {!loadingPerfis && perfis.length === 0 && isPremium && (
              <div className="rounded-xl border border-dashed border-border bg-muted/25 p-8 text-center">
                <Crown className="mx-auto mb-2 h-6 w-6 text-amber-400/60" />
                <p className="text-sm font-medium text-foreground">Nenhum perfil criado</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Clique em "Novo perfil" para começar.</p>
              </div>
            )}

            {/* Profile list */}
            {perfis.length > 0 && (
              <div className="overflow-hidden rounded-xl border border-border">
                {perfis.map((perfil, i) => (
                  <div
                    key={perfil.id}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/30",
                      i !== 0 && "border-t border-border/60",
                    )}
                  >
                    <Avatar value={perfil.avatar} label={perfil.nome} className="h-9 w-9 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{perfil.nome}</p>
                      <p className="text-xs text-muted-foreground">{getAvatarOption(perfil.avatar).label}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <Button
                        aria-label="Editar perfil"
                        className="h-8 w-8 rounded-lg px-0"
                        variant="outline"
                        onClick={() => editarPerfil(perfil)}
                      >
                        <PencilLine className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        aria-label="Excluir perfil"
                        className="h-8 w-8 rounded-lg px-0 text-destructive hover:text-destructive"
                        variant="outline"
                        onClick={() => setPerfilExcluindo(perfil)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Dialog: Trocar senha ── */}
      <Dialog open={senhaModalAberto} onOpenChange={setSenhaModalAberto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{usuarioTemSenha ? "Trocar senha" : "Cadastrar senha"}</DialogTitle>
            <DialogDescription>Confirme os dados para atualizar o acesso da conta.</DialogDescription>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={salvarSenha}>
            {usuarioTemSenha && (
              <div className="space-y-2">
                <Label htmlFor="senhaAtual">Senha atual</Label>
                <Input
                  id="senhaAtual"
                  type="password"
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
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
                onChange={(e) => setNovaSenha(e.target.value)}
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
                onChange={(e) => setConfirmarSenha(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setSenhaModalAberto(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={savingPassword} className="gap-2">
                {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Confirmar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Perfil financeiro ── */}
      <Dialog
        open={perfilModalAberto}
        onOpenChange={(open) => { setPerfilModalAberto(open); if (!open) limparPerfil(); }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{perfilEditando ? "Editar perfil" : "Novo perfil financeiro"}</DialogTitle>
            <DialogDescription>
              Defina o nome e o ícone para identificar este perfil.
            </DialogDescription>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={salvarPerfilFinanceiro}>
            <div className="space-y-2">
              <Label htmlFor="perfil-nome">Nome do perfil</Label>
              <Input
                id="perfil-nome"
                value={perfilNome}
                onChange={(e) => setPerfilNome(e.target.value)}
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
                      key={avatar.value}
                      aria-label={avatar.label}
                      title={avatar.label}
                      type="button"
                      disabled={!isPremium}
                      onClick={() => setPerfilAvatar(avatar.value)}
                      className={cn(
                        "flex h-11 items-center justify-center rounded-full border transition-colors",
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground hover:bg-accent",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setPerfilModalAberto(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!isPremium || savingPerfil} className="gap-2">
                {savingPerfil ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {perfilEditando ? "Salvar alterações" : "Criar perfil"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Excluir perfil ── */}
      <Dialog
        open={Boolean(perfilExcluindo)}
        onOpenChange={(open) => { if (!open) setPerfilExcluindo(null); }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir perfil</DialogTitle>
            <DialogDescription>
              Confirme para remover este perfil financeiro e seus dados vinculados.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-4">
            <Avatar value={perfilExcluindo?.avatar} label={perfilExcluindo?.nome ?? ""} />
            <div className="min-w-0">
              <p className="truncate font-semibold">{perfilExcluindo?.nome}</p>
              <p className="text-xs text-muted-foreground">Esta ação não pode ser desfeita.</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setPerfilExcluindo(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              type="button"
              onClick={excluirPerfil}
              disabled={deletingPerfil}
              className="gap-2"
            >
              {deletingPerfil && <Loader2 className="h-4 w-4 animate-spin" />}
              Excluir perfil
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function SettingRow({
  icon,
  iconBg,
  label,
  description,
  action,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", iconBg)}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}
