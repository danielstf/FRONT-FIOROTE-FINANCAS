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
import { PageHeader } from "../../components/page-header";
import { pageVariants, sectionVariants } from "../../lib/motion";
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
    if (novaSenha !== confirmarSenha) { toast.error("A confirmação da senha não confere."); return; }
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
    if (!isPremium) { toast.error("Perfis financeiros são exclusivos para usuários VIP."); return; }
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
      if (perfilFinanceiroId === perfilExcluindo.id) selecionarPerfilFinanceiro(null);
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
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="space-y-5"
    >
      {/* Page header */}
      <motion.div variants={sectionVariants}>
        <PageHeader
          icon={Settings}
          title="Configurações"
          subtitle={session?.usuario.email}
        />
      </motion.div>

      {/* Grid: dados + segurança */}
      <motion.div variants={sectionVariants} className="grid gap-4 lg:grid-cols-2">
        {/* Dados do usuário */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UserRound className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Dados do usuário</p>
              <p className="text-xs text-muted-foreground">Altere o nome exibido no sistema.</p>
            </div>
          </div>
          <div className="p-5">
            <form className="grid gap-4" onSubmit={salvarDados}>
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-xs font-medium text-muted-foreground">Nome</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="h-10"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Email</Label>
                <Input value={session?.usuario.email ?? ""} className="h-10" disabled />
              </div>
              <Button type="submit" disabled={savingProfile} className="h-10 w-fit gap-2">
                {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Salvar nome
              </Button>
            </form>
          </div>
        </div>

        {/* Segurança e tema */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <KeyRound className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Segurança e tema</p>
              <p className="text-xs text-muted-foreground">A senha fica escondida até você abrir a alteração.</p>
            </div>
          </div>
          <div className="divide-y divide-border/60">
            <div className="flex items-center justify-between gap-3 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                  {usuarioTemSenha ? <KeyRound className="h-4 w-4" /> : <BadgeCheck className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-sm font-semibold">{usuarioTemSenha ? "Senha cadastrada" : "Senha pendente"}</p>
                  <p className="text-xs text-muted-foreground">Atualize em uma janela segura.</p>
                </div>
              </div>
              <Button variant="outline" className="h-9" onClick={() => setSenhaModalAberto(true)}>
                {usuarioTemSenha ? "Trocar" : "Cadastrar"}
              </Button>
            </div>
            <div className="flex items-center justify-between gap-3 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                  <SunMoon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Tema do sistema</p>
                  <p className="text-xs text-muted-foreground">Alterne entre claro e escuro.</p>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Perfis VIP */}
      <motion.div variants={sectionVariants} className="rounded-2xl border border-amber-400/20 bg-card overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4 bg-linear-to-r from-amber-400/8 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400/15 text-amber-400">
              <Crown className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Perfis VIP</p>
              <p className="text-xs text-muted-foreground">Usuários VIP criam até 5 perfis com dados separados.</p>
            </div>
          </div>
          <Button onClick={abrirNovoPerfil} disabled={!isPremium} className="h-9 gap-2">
            <Plus className="h-3.5 w-3.5" />
            Novo perfil
          </Button>
        </div>

        <div className="p-5 space-y-3">
          {!isPremium && (
            <div className="rounded-xl border border-amber-400/25 bg-amber-400/8 p-4">
              <p className="text-sm font-semibold text-amber-500">Recurso exclusivo VIP</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Use o plano VIP para separar finanças pessoais, família ou empresa.
              </p>
            </div>
          )}

          {loadingPerfis && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Carregando perfis...
            </div>
          )}

          {!loadingPerfis && perfis.length === 0 && isPremium && (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
              Nenhum perfil financeiro cadastrado.
            </div>
          )}

          {perfis.length > 0 && (
            <div className="divide-y divide-border/60 rounded-xl border border-border overflow-hidden">
              {perfis.map((perfil) => (
                <div
                  key={perfil.id}
                  className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/30"
                >
                  <Avatar value={perfil.avatar} label={perfil.nome} className="h-9 w-9 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{perfil.nome}</p>
                    <p className="text-xs text-muted-foreground">Avatar {getAvatarOption(perfil.avatar).label}</p>
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
      </motion.div>

      {/* Dialog: Trocar senha */}
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
              <Button type="button" variant="outline" onClick={() => setSenhaModalAberto(false)}>Cancelar</Button>
              <Button type="submit" disabled={savingPassword} className="gap-2">
                {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Confirmar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Perfil financeiro */}
      <Dialog
        open={perfilModalAberto}
        onOpenChange={(open) => { setPerfilModalAberto(open); if (!open) limparPerfil(); }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{perfilEditando ? "Editar perfil" : "Novo perfil"}</DialogTitle>
            <DialogDescription>
              Defina o nome e o ícone usado para identificar o perfil financeiro.
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
              <Button type="button" variant="outline" onClick={() => setPerfilModalAberto(false)}>Cancelar</Button>
              <Button type="submit" disabled={!isPremium || savingPerfil} className="gap-2">
                {savingPerfil ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {perfilEditando ? "Salvar perfil" : "Criar perfil"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Excluir perfil */}
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
            <Button type="button" variant="outline" onClick={() => setPerfilExcluindo(null)}>Cancelar</Button>
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
